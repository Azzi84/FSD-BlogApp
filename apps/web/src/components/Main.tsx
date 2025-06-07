import type { Post } from "@repo/db/data";
import BlogList from "./Blog/List";

export function Main({
  posts,
  className,
}: {
  posts: Post[];
  className?: string;
}) {
  return (
    <main className={className}>
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
          From The Blog...
        </h1>
        <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
      </div>
      <BlogList posts={posts} />
    </main>
  );
}
