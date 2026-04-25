import { likePost, getPosts } from './services/database.ts';

async function run() {
    const posts = await getPosts('blog');
    const firstPost = posts[0];
    if (!firstPost) return console.log("No posts");

    console.log("Before:", firstPost.liked_by);
    
    // Attempt like
    const res = await likePost(firstPost.id, firstPost, "test-user-123");
    console.log("After:", res?.liked_by);

    const check = await getPosts('blog');
    const checkPost = check.find(p => p.id === firstPost.id);
    console.log("Re-fetch:", checkPost?.liked_by);
}
run();
