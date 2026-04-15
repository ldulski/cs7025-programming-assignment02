//This is skeleton for mySql data ---  later can be modified to fit in with mySql backend functions


let posts = [];

//retrieve posts
export async function getPosts() {
    return posts;
}

//create new post
export async function createPost(post) {
    const newPost = {
        id: Date.now(),
        ...post,
        likes: [],
        bookmarks: [],
        createdAt: new Date()
    };

    posts.push(newPost);
    return newPost;
}


//NEED TO ADD FUNCTIONALITY
//likes function

export async function toggleLike(postId, userId){
    const post = posts.find(p => p.id === postId);
    if(!post) return;

    if(post.likes.includes(userId)){
        post.likes = post.likes.filter(id => id !== userId);
    } else {
        post.likes.push(userId)
    }

    return post;
}

//bookmarks function
export async function toggleBookmark(postId, userId) {
  const post = posts.find(p => p.id === postId);
  if (!post) return;

  if (post.bookmarks.includes(userId)) {
    post.bookmarks = post.bookmarks.filter(id => id !== userId);
  } else {
    post.bookmarks.push(userId);
  }

  return post;
}