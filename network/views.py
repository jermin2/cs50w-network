import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.core.paginator import Paginator

from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt

from .models import User, Post


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

def author(request, id):
    if request.method == "GET":

        author = User.objects.get(id=id)

        return render(request, "network/author.html", {
            'author':author,
            'posts':author.posts.all(),
            'following': request.user.is_following(author)
        })

@csrf_exempt
@login_required
def new_post(request):
    if request.method != "POST":
        print(request)
        return JsonResponse({"error": "POST request required."}, status=400)

    # Get new post data
    data = json.loads(request.body)
    content = data.get("content")

    if (len(content) == 0):
        return JsonResponse({"error": "Empty Post"}, status=401)

    # Get user id
    user = request.user

    # Create a post object
    p = Post.objects.create(author=user,content=data.get("content"))
    p.save()

    return JsonResponse({
        "success": "New Post Created Successfully",
        "user": str(request.user),
        "content": data.get("content")
    })

@csrf_exempt
def posts(request):

    posts = Post.objects.all().order_by('-timestamp')

    return send_json_posts(request, posts)


def send_json_posts(request, posts, dict = {}):
    if request.method == "POST":
        # Get new post data
        data = json.loads(request.body)
        requested_page = data.get("page")
    else:
        requested_page = 1

    # 10 posts per page
    p = Paginator(posts, 10)
    page = p.page(requested_page)

    return JsonResponse( {**dict, 
        "success":True,
        "posts": [post.serialize(request.user) for post in page.object_list],
        "pages": {
            "num_pages":p.num_pages,
            "current_page":requested_page
        }
        })    


@csrf_exempt
@login_required
def follow(request):

    try:
        # Get new post data
        data = json.loads(request.body)
    except:
        print(request)
        return JsonResponse({
            "error": "Encountered some error"
        })

    user = request.user
    follow_user_id = data.get("id")
    follow = data.get("follow")

    follow_user = User.objects.get(id=follow_user_id)

    # Check that user and follow_user are not the same (can't follow yourself)
    if (user != follow_user):
        if (follow == True):
            follow_user.followers.add(user)
        else:
            follow_user.followers.remove(user)

        return JsonResponse({
            "success": True,
            "message": f"{user} is now {follow} following {follow_user}",
            "followers": follow_user.followers.count()
        })
    
    return JsonResponse({
        "success": False,
        "message": f"Cannot follow yourself"
    })


@csrf_exempt
@login_required
def following(request):
    
    user = request.user

    # Get list of users we are following
    user_list = list(user.following.all())

    # Get all the posts where the author is in the above list
    posts = Post.objects.filter(author__in=user_list)


    return send_json_posts(request, posts)



@csrf_exempt
def fetch_author(request):

    # Separate the data
    try:
        # Get new post data
        data = json.loads(request.body)
    except:
        print(request)
        return JsonResponse({
            "error": "Encountered some error"
        })

    user = request.user
    author = User.objects.get(id=data.get("id"))

    # Check if user is authenticated. If true, 
    if request.user.is_authenticated:
        is_self = (author == user)
        is_following = user.is_following(author)
    else:
        # If user is not authenticated, make up some values
        is_self = True,
        is_following = False,

    # Get all the posts that the author has made
    posts = author.posts.all().order_by("-timestamp")

    

    response = {
        "author": author.serialize(),
        "is_self": is_self,
        "is_following": is_following
    }

    return send_json_posts(request, posts, response)



@csrf_exempt
@login_required
def edit_post(request):
    if request.method == "POST":
        # Get new post data
        data = json.loads(request.body)
        post_id = data.get("post_id")
        content = data.get("content")
    else:
        return JsonResponse({
            "error":"Invalid route. Requires POST request"
        })


    # Fetch the post
    p = Post.objects.get(id = post_id)

    # Backend check that we are the author
    if request.user.id != p.author.id:
        return JsonResponse({
            "error":"Must be author of post to edit post",
        })

    # Save the new post
    p.content = content
    p.save()

    return JsonResponse({
        "success":"all good",
        "content":content
    })


@csrf_exempt
@login_required
def like(request):
    if request.method == "POST":
        # Get new post data
        data = json.loads(request.body)
        post_id = data.get("post_id")

    else:
        return JsonResponse({
            "error":"Invalid route. Requires POST request"
        })

    # Get the user
    user = request.user

    # Fetch the post
    p = Post.objects.get(id = post_id)

    # Check if user has already liked the post
    if p.likes.filter(id=user.id).exists():
        p.likes.remove(user)
        is_liked = False
    else:
        p.likes.add(user)
        is_liked = True

    p.save()

    return JsonResponse({
        "success":"all good",
        "num_likes":p.likes.count(),
        "is_liked":is_liked
    })