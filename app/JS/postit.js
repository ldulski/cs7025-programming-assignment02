import { auth } from "./firebase.js";
import { getPosts, createPost, toggleLike, toggleBookmark } from "./postitService.js";

import { displayPosts } from "./bulletin.js";

let currentUserId = null;

auth.onAuthStateChanged(user => {
    if(!user) {
        console.log("no user logged in");
        return;
    }

    currentUserId = user.uid;
    loadPosts();
});

async function loadPosts() {
    const posts = await getPosts();
    displayPosts(posts, currentUserId);
}

document.getElementById("addPostBtn").onclick = () => {
    const form = document.getElementById("postForm");
    form.style.display = form.style.display === "none" ? "block" : "none";
};

document.getElementById("savePost").onclick = async () => {
    if (!currentUserId){
        alert("no user loaded");
        return;
    }

    const title = document.getElementById("postTitle").value;
    const content = document.getElementById("postContent").value;

    if(!title || !content){
        alert("Please fill in both fields");
        return;
    }

    await createPost({
        userId: currentUserId,
        title: title,
        content: content
    });

    document.getElementById("postTitle").value = "";
    document.getElementById("postContent").value = "";
    document.getElementById("postForm").style.display = "none";

    loadPosts();
};

//NOT FUNCTIONAL

window.handleLike = async (postId) => {
    await toggleLike(postId, currentUserId);
    loadPosts();
};

window.handleBookmark = async (postId) => {
    await toggleBookmark(postId, currentUserId);
    loadPosts();
};