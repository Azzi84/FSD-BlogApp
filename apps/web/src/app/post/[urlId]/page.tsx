import { AppLayout } from "@/components/Layout/AppLayout";
import { BlogDetail } from "@/components/Blog/Detail";
import { getPosts } from "@repo/db/client";

export default async function Page({
  params,
}: {
  params: Promise<{ urlId: string }>;
}) {
  const { urlId } = await params;
  
  // Fetch posts from database and find the post by its URL ID
  const allPosts = await getPosts();
  const post = allPosts.find((post) => post.urlId === urlId);

  if (!post) {
    return <AppLayout>Article not found</AppLayout>;
  }

  // Increment views for display purposes
  const displayPost = { 
    ...post, 
    views: post.views + 1,
    // Initialize comments array if it doesn't exist
    comments: post.comments || []
  };

  return (
    <AppLayout>
      <BlogDetail post={displayPost} />
    </AppLayout>
  );
}
