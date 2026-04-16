export function displayPosts(posts, currentUserId) {
  const board = document.getElementById("board");
  board.innerHTML = "";

  const colors = ["blue", "pink", "orange"];

  posts.forEach((post, index) => {
    const color = colors[index % colors.length];

    const isLiked = post.likes.includes(currentUserId);
    const isBookmarked = post.bookmarks.includes(currentUserId);

    board.innerHTML += `
      <div class="postIt ${color}">
        <div>
          <h5>${post.title}</h5>
          <p>${post.content}</p>
        </div>

        <div class="like-save">
          <span class="material-icons-outlined"
                onclick="handleLike('${post.id}')">
            ${isLiked ? "favorite" : "favorite_border"}
          </span>

          <span class="material-icons-outlined"
                onclick="handleBookmark('${post.id}')">
            ${isBookmarked ? "bookmark" : "bookmark_border"}
          </span>
        </div>
      </div>
    `;
  });
}