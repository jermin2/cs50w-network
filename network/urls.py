
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("accounts/login/", views.login_view),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("post/new", views.new_post, name="new_post"),
    path("posts", views.posts, name="posts"),
    path("author/<int:id>", views.author, name="author"),
    path("follow", views.follow, name="follow"),
    path("following", views.following, name="following"),
    path("fetch_author", views.fetch_author, name="fetch_author")
]
