import { auth } from "./firebase.js";
import { getPosts, createPost, toggleLike, toggleBookmark } from "./postitService.js";
import { displayPosts } from "./bulletin.js";

let currentUserId = null;


auth.onAuthStateChanged(user => {
    if (!user) {
        console.log("no user logged in");

        if (window.showNotification) {
            window.showNotification("Please log in to use bulletin board", "error");
        }

        return;
    }

    currentUserId = user.uid;
    loadPosts();
});

//load posts
async function loadPosts() {
    try {
        const posts = await getPosts();
        displayPosts(posts, currentUserId);
    } catch (err) {
        console.error("Failed to load posts:", err);

        if (window.showNotification) {
            window.showNotification("Failed to load posts", "error");
        }
    }
}

//post form toggle
document.getElementById("addPostBtn").onclick = () => {
    const form = document.getElementById("postForm");
    form.style.display = form.style.display === "none" ? "block" : "none";
};

//create post
document.getElementById("postSubmit").onclick = async (e) => {
    e.preventDefault();
    if (!currentUserId) {
        window.showNotification?.("No user loaded", "error");
        return;
    }

    const title = document.getElementById("postTitle").value.trim();
    const content = document.getElementById("postContent").value.trim();

    if (!title || !content) {
        window.showNotification?.("Please fill in both fields", "error");
        return;
    }

    try {
        await createPost({
            userId: currentUserId,
            title,
            content
        });

        document.getElementById("postTitle").value = "";
        document.getElementById("postContent").value = "";
        document.getElementById("postForm").style.display = "none";

        loadPosts();

        window.showNotification?.("Post published successfully", "success");

    } catch (err) {
        console.error("Error creating post:", err);
        window.showNotification?.("Failed to publish post", "error");
    }
};

//like post
window.handleLike = async (postId) => {
    try {
        await toggleLike(postId, currentUserId);
        loadPosts();
        window.showNotification?.("Reaction updated", "success");
    } catch (err) {
        console.error(err);
        window.showNotification?.("Failed to update like", "error");
    }
};

//bookmark post
window.handleBookmark = async (postId) => {
    try {
        await toggleBookmark(postId, currentUserId);
        loadPosts();
        window.showNotification?.("Saved to activity", "success");
    } catch (err) {
        console.error(err);
        window.showNotification?.("Failed to save post", "error");
    }
};
