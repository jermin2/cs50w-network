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

      fetch_posts()
  });
}

function fetch_posts(page = 1){
    // Hide the user div
    document.querySelector("#user-div").style.display = "none"

    fetch('/posts', {
        method: 'POST',
        body: JSON.stringify({
            page: page
        })
    })
    .then(response => response.json())
    .then(results => {
        console.log(results)

        // Load the posts into the view
        load_posts(results.posts)

        // Update the pagination
        update_pagination(results.pages, "fetch_posts")
    });
}

function update_pagination(pages, link, param=null) {
    // Update pagination
    const previous_page = pages.current_page > 1 ? pages.current_page - 1 : 1
    const next_page = pages.current_page < pages.num_pages ? pages.current_page + 1 : pages.num_pages

    const pagination = document.querySelector("#pagination");
    pagination.innerHTML = ""

    // Needed to follow author
    param = (param != null ? param + "," : "")

    const start = document.createElement("li")
    start.classList="page-item"
    start.innerHTML = `<a class="page-link" href="#" tabindex="-1" onclick=${link}(${param}${previous_page})>Previous</a>`
    pagination.appendChild(start)

    for (let x = 1; x < pages.num_pages + 1; x++) {
        const li = document.createElement("li")
        active = (x == pages.current_page ? "active" : "")
        li.classList = `page-item ${active}`
        li.innerHTML = `<a class="page-link" href="#" onclick=${link}(${param}${x})>${x}</a>`
        pagination.appendChild(li)
    }

    const end = document.createElement("li")
    end.classList="page-item"
    end.innerHTML = `<a class="page-link" href="#" onclick=${link}(${param}${next_page})>Next</a>`
    pagination.appendChild(end)


}

function load_posts(posts) {

    const posts_space = document.querySelector("#posts-view");
    posts_space.innerHTML = ""

    posts.forEach( post => {
        const p = show_post(post)
        posts_space.appendChild( p )
    })
}

function fetch_following(page = 1) {

    // Hide the user div
    document.querySelector("#user-div").style.display = "none"
    document.querySelector("#new-post-div").style.display = "none"

    fetch('/following', {
        method: 'POST',
        body: JSON.stringify({
            page: page
        })
    })
    .then(response => response.json())
    .then(results => {
        console.log(results);
        
        // Load the posts into the view
        load_posts(results.posts)

        // Update the pagination
        update_pagination(results.pages, "fetch_following")

    });

    return false
}
function clicked() {
    console.log("clicked")
    return false
}

function fetch_author(id, page=1) {
    console.log(id)
    fetch('/fetch_author', {
        method: 'POST',
        body: JSON.stringify({
            id: id,
            page:page
        })
    })
    .then(response => response.json())
    .then(results => {

        // Print out results
        console.log(results)

        load_posts(results.posts)
        update_pagination(results.pages, "fetch_author", id)



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