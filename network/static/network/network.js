function new_post() {
    const content = document.querySelector('#new-post-content')
    // send email
  fetch('/post/new', {
      method: 'POST',
      body: JSON.stringify({
          content: content.value
      })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      content.value = ""

      load_posts()
  });
}

function load_posts() {

    // Hide the user div
    document.querySelector("#user-div").style.display = "none"
    document.querySelector("#new-post-div").style.display = "block"

    fetch('/posts', {
        method: 'GET'
    })
    .then(response => response.json())
    .then(results => {

        posts = results.posts
        // Print result
        console.log(posts);

        const posts_space = document.querySelector("#posts-view");
        posts_space.innerHTML = ""

        posts.forEach( post => {
            const p = show_post(post)
            posts_space.appendChild( p )
        })

    });
}

function following() {

    // Hide the user div
    document.querySelector("#user-div").style.display = "none"
    document.querySelector("#new-post-div").style.display = "none"

    fetch('/following', {
        method: 'GET',
        
    })
    .then(response => response.json())
    .then(results => {

        posts = results.posts
        // Print result
        console.log(posts);

        const posts_space = document.querySelector("#posts-view");
        posts_space.innerHTML = ""

        posts.forEach( post => {
            const p = show_post(post)
            posts_space.appendChild( p )
        })

    });

    return false
}
function clicked() {
    console.log("clicked")
    return false
}

function fetch_author(id) {
    console.log(id)
    fetch('/fetch_author', {
        method: 'POST',
        body: JSON.stringify({
            id: id
        })
    })
    .then(response => response.json())
    .then(results => {

        // Print out results
        console.log(results)

        posts = results.posts

        // Get the post div and clear it
        const posts_space = document.querySelector("#posts-view");
        posts_space.innerHTML = ""

        // For each post, print it out
        posts.forEach( post => {
            const p = show_post(post)
            posts_space.appendChild( p )
        })

        // Print out the author information
        show_user(results.author)
        show_is_following(results.is_following, results.is_self)

        return false

    });
}


function show_is_following(follow, is_self = false) {
    if(is_self) {
        document.querySelector('#follow-btn').style.display = "none";
        document.querySelector('#unfollow-btn').style.display = "none";
    }
    else if(follow) {
        document.querySelector('#follow-btn').style.display = "none";
        document.querySelector('#unfollow-btn').style.display = "inline-block";
    }
    else {
        document.querySelector('#follow-btn').style.display = "inline-block";
        document.querySelector('#unfollow-btn').style.display = "none";
    }
}

function show_user(user) {
    document.querySelector("#user-username").innerHTML = user.username
    document.querySelector("#user-email").innerHTML = user.email
    document.querySelector("#user-id").value = user.id
    document.querySelector("#user-followers").innerHTML = user.followers
    document.querySelector("#user-following").innerHTML = user.following

    document.querySelector("#user-div").style.display = "block"
    document.querySelector("#new-post-div").style.display = "none"
}

function show_post(post) {
    const post_div = document.createElement("div")
    post_div.classList = "post"

    const author = document.createElement("h3")
    author.innerHTML = `<a href='#' onclick="fetch_author(${post.author.id})"> ${post.author.username}</a>`

    const content = document.createElement("div")
    content.innerHTML = post.content

    const timestamp = document.createElement("div")
    timestamp.classList = "text-muted"
    timestamp.innerHTML = post.timestamp

    const likes = document.createElement("p")
    likes.innerHTML = "❤️ " + post.likes + " likes"

    post_div.appendChild(author)
    post_div.appendChild(content)
    post_div.appendChild(timestamp)
    post_div.appendChild(likes)

    return post_div
}


function follow(f=true) {
    const author_id = document.querySelector('#user-id').value

    fetch('/follow', {
    method: 'POST',
    body: JSON.stringify({
        id: author_id,
        follow: f
    })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);

        // Update the number of followers
        document.querySelector('#user-followers').innerHTML = result.followers

        // if we are going to follow
        if(result.success){
            if(f) {
                document.querySelector('#follow-btn').style.display = "none";
                document.querySelector('#unfollow-btn').style.display = "inline-block";
            }
            else {
                document.querySelector('#follow-btn').style.display = "inline-block";
                document.querySelector('#unfollow-btn').style.display = "none";
            }
        }
    });
}