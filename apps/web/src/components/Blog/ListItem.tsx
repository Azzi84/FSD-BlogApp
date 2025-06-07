import type { Post } from "@repo/db/data";
import Link from "next/link";
import { countTotalComments } from "../../utils/commentHelpers";

export function BlogListItem({ post }: { post: Post }) {
  // Format the date to match the test expectation (18 Apr 2022)
  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Display view count
  const displayViews = () => {
    return `${post.views} views`;
  };
  
  // Get comment count
  const commentCount = countTotalComments(post.comments);

  return (
    <article
      key={post.id}
      className="flex flex-col md:flex-row gap-6 animate-fade-in bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
      data-test-id={`blog-post-${post.id}`}
    >
      <div className="w-full md:w-1/3">
        <img 
          src={post.imageUrl} 
          alt={post.title} 
          className="w-full h-auto rounded-lg object-cover"
          loading="lazy" 
        />
      </div>
      <div className="w-full md:w-2/3 flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          <Link href={`/post/${post.urlId}`}>{post.title}</Link>
        </h2>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="text-primary">{post.category}</span>
          {post.tags.split(",").map((tag) => (
            <Link key={tag.trim()} href={`/tags/${tag.trim().toLowerCase().replace(" ", "-")}`} className="text-secondary">
              #{tag.trim()}
            </Link>
          ))}
        </div>
        <div 
          className="text-gray-600 dark:text-gray-300 my-2"
          dangerouslySetInnerHTML={{ __html: post.description }}
        />
        <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span>{formatDate(new Date(post.date))}</span>
          <span>{displayViews()}</span>
          <span>{post.likes} likes</span>
          <span>{commentCount} comments</span>
        </div>
      </div>
    </article>
  );
}
