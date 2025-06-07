import type { Post } from "@repo/db/data";
import { marked } from "marked";
import Link from "next/link";
import { CommentsList } from "../Comments/CommentsList";
import { format2DigitMonthDay } from "../../utils/dateFormatter";

export async function BlogDetail({ post }: { post: Post }) {
  const content = await marked.parse(post.content);

  return (
    <article data-test-id={`blog-post-${post.id}`} className="py-8">
      <div className="flex flex-col gap-8">
        <div className="w-full">
          <img 
            src={post.imageUrl} 
            alt={post.title} 
            className="w-full h-96 object-cover rounded-lg shadow-lg"
          />
        </div>
        <div className="w-full">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            <Link href={`/post/${post.urlId}`}>{post.title}</Link>
          </h1>
          
          <div className="flex flex-wrap gap-3 text-sm mb-6">
            <span className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-4 py-2 rounded-full shadow-md font-medium">
              {post.category}
            </span>
            {post.tags.split(",").map((tag) => (
              <Link 
                key={tag.trim()} 
                href={`/tags/${tag.trim().toLowerCase().replace(" ", "-")}`}
                className="text-secondary hover:text-primary transition-colors duration-200"
              >
                #{tag.trim()}
              </Link>
            ))}
          </div>
          
          <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
            <span>{format2DigitMonthDay(post.date)}</span>
            <span>{post.views} views</span>
            <span>{post.likes} likes</span>
          </div>
          
          <div 
            data-test-id="content-markdown"
            className="markdown-content max-w-none" 
            dangerouslySetInnerHTML={{ __html: content }}
          />
          
          {/* Comments Section */}
          <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
            <CommentsList post={post} />
          </div>
        </div>
      </div>
    </article>
  );
}
