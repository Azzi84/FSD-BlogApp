import { AppLayout } from "@/components/Layout/AppLayout";
import { Main } from "@/components/Main";
import { getPosts } from "@repo/db/client";
import { toUrlPath } from "@repo/utils/url";

export default async function Page({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  
  // Fetch posts from database and filter by tag and active status
  const allPosts = await getPosts();
  const filteredPosts = allPosts.filter(post => {
    // First check if post is active
    if (!post.active) return false;
    
    // Then check if any of the post's tags match the URL tag parameter
    const postTags = post.tags.split(",").map(t => toUrlPath(t.trim()));
    return postTags.includes(tag.toLowerCase());
  });

  return (
    <AppLayout>
      <Main posts={filteredPosts} />
    </AppLayout>
  );
}