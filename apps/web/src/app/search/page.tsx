import { AppLayout } from "@/components/Layout/AppLayout";
import { Main } from "@/components/Main";
import { getPosts } from "@repo/db/client";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q: string }>;
}) {
  const { q } = await searchParams;

  // Fetch posts from database and filter for search
  const allPosts = await getPosts();
  const filteredPosts = allPosts.filter(post => {
    // Only consider active posts
    if (!post.active) return false;
    
    // If no search query, return all active posts
    if (!q) return true;
    
    // Search in title, content, description, and tags
    const searchQuery = q.toLowerCase();
    const title = post.title.toLowerCase();
    const content = post.content.toLowerCase();
    const description = post.description.toLowerCase();
    const tags = post.tags.toLowerCase();
    
    return (
      title.includes(searchQuery) ||
      content.includes(searchQuery) ||
      description.includes(searchQuery) ||
      tags.includes(searchQuery)
    );
  });

  return (
    <AppLayout query={q}>
      <Main posts={filteredPosts} />
    </AppLayout>
  );
}
