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

/** Edit the post by enabling it */
function edit_post(element) {
    
    // Make textarea editable and show border
    const ta = element.parentElement.parentElement.querySelector("textarea")
    ta.disabled = false
    ta.classList.remove("content-display-only")

    // show save button
    element.style.display = "none"
    element.parentElement.querySelector(".save").style.display = "inline-block"
}

/** Save a post by sending a JSON request */
function save_post(element){
    // Get the parent div element for the meta information
    const parent = element.parentElement.parentElement

    // Get user_id
    const user_id = JSON.parse(document.getElementById('user_id').textContent);

    // Get the text area element 
    const ta = parent.querySelector("textarea")

    // Front-end check for author
    if(parent.dataset.author_id != user_id) {
        console.log("You are not author!")
        return
    }

    // Send the Json request containing post_id, and content
    fetch('/edit_post', {
    method: 'POST',
    body: JSON.stringify({
        post_id: parent.dataset.post_id,
        content: ta.value
    })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        ta.value = result.content

    });

    // Make textarea uneditable and hide border
    ta.disabled = true
    ta.classList.add("content-display-only")

    // show edit button
    element.style.display = "none"
    element.parentElement.querySelector(".edit").style.display = "inline-block"
}

/** Creates the DOM element for a post */
function show_post(post) {

    const user_id = JSON.parse(document.getElementById('user_id').textContent);

    // Create parent div element
    const post_div = document.createElement("div")
    post_div.classList = "post"

    // save meta data
    post_div.dataset.author_id = post.author.id
    post_div.dataset.post_id = post.id

    // User name -> links to user profile
    const author = document.createElement("h3")
    author.innerHTML = `<a href='#' onclick="fetch_author(${post.author.id})">${post.author.username}</a>`
    post_div.appendChild(author)

    // Show edit button
    if (user_id === post.author.id) {
        const edit_btn = document.createElement("a")
        edit_btn.classList = "btn mx-3 edit btn-outline-primary btn-small"
        edit_btn.innerHTML = "edit"
        author.appendChild(edit_btn)

        const save_btn = document.createElement("a")
        save_btn.classList = "btn mx-3 save btn-primary text-white"
        save_btn.innerHTML = "save"
        save_btn.style.display = "none"
        author.appendChild(save_btn)

    }

    const content = document.createElement("textarea")
    content.classList = "content content-display-only"
    content.disabled = true
    content.innerHTML = post.content

    const timestamp = document.createElement("div")
    timestamp.classList = "text-muted"
    timestamp.innerHTML = post.timestamp

    const likes = document.createElement("div")
    icon =  (post.is_liked ? "❤️" : "🤍" )
    likes.innerHTML = `<a class='like'>${icon}</a> <div class='num_likes'>${post.likes}</div> likes`

    
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

function like(element) {

    // Get the parent element
    const parent = element.parentElement.parentElement
    const like_number = parent.querySelector(".num_likes")

    // Send the Json request containing post_id, and content
    fetch('/like', {
    method: 'POST',
    body: JSON.stringify({
        post_id: parent.dataset.post_id
    })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result)

        // Show the result on the post
        icon = (result.is_liked ? "❤️" : "🤍" )
        like_number.innerHTML = result.num_likes
        element.innerHTML = icon
    });
}
