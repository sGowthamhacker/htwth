import React from 'react';
import { Post } from '../types';

declare var marked: { parse: (markdown: string) => string };

interface BlogPostViewerProps {
    post?: Post;
}

const BlogPostViewer: React.FC<BlogPostViewerProps> = ({ post }) => {
    if (!post) {
        return (
            <div className="h-full flex items-center justify-center text-slate-500 p-8">
                <p>Could not load the blog post. Please close this window and try again.</p>
            </div>
        );
    }
    
    const parsedContent = (typeof post.content === 'string' && post.content) ? marked.parse(post.content) : '';

    return (
        <div className="h-full w-full overflow-y-auto bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 md:p-8">
            <div className="max-w-3xl mx-auto">
                <article>
                    <header className="mb-8">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
                            {post.title}
                        </h1>
                        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                            <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full" />
                            <div>
                                <p className="font-semibold text-slate-700 dark:text-slate-200">{post.author.name}</p>
                                <p>{new Date(post.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </header>

                    <div
                        className="prose prose-lg dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: parsedContent }}
                    />
                </article>
            </div>
        </div>
    );
};

export default BlogPostViewer;