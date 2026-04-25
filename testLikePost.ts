import { likePost, getPosts, updatePost } from './services/database.ts';

async function run() {
    const posts = await getPosts('blog');
    const firstPost = posts[0];
    if (!firstPost) return console.log("No posts");

    console.log("Before DB fetch length:", firstPost.liked_by?.length);
    
    // Attempt like
    const res = await likePost(firstPost.id, firstPost, "123e4567-e89b-12d3-a456-426614174000");
    console.log("Response from likePost HAS liked_by?", !!res?.liked_by);
    console.log("Response liked_by length:", res?.liked_by?.length);
    
}
run();
