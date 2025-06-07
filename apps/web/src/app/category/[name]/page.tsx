import { AppLayout } from "@/components/Layout/AppLayout";
import { Main } from "@/components/Main";
import { getPosts } from "@repo/db/client";

export default async function Page({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  
  // Fetch posts from database and filter by category and active status
  const allPosts = await getPosts();
  const filteredPosts = allPosts.filter(
    (post) => post.category.toLowerCase() === name.toLowerCase() && post.active
  );

  return (
    <AppLayout>
      <Main posts={filteredPosts} />
    </AppLayout>
  );
}
