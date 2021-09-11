


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
    fetch('/posts', {
        method: 'GET'
    })
    .then(response => response.json())
    .then(posts => {
        // Print result
        console.log(posts);

        const posts_space = document.querySelector("#posts-view");
        posts_space.innerHTML = ""
        posts.forEach( (post) => {

            const p = show_post(post)
            posts_space.appendChild( p )
        })

    });
}

function show_post(post) {
    const post_div = document.createElement("div")
    post_div.classList = "post"

    const author = document.createElement("h3")
    author.innerHTML = `<a href='/author/${post.author.id}'> ${post.author.username}</a>`

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
