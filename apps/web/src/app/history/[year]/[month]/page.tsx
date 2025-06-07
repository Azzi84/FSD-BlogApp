import { AppLayout } from "@/components/Layout/AppLayout";
import { Main } from "@/components/Main";
import { getPosts } from "@repo/db/client";

export default async function Page({
  params,
}: {
  params: Promise<{ year: string; month: string }>;
}) {
  const { year, month } = await params;
  
  // Convert string params to numbers
  const yearNum = parseInt(year, 10);
  const monthNum = parseInt(month, 10);
  
  // Fetch posts from database and filter by year, month, and active status
  const allPosts = await getPosts();
  const filteredPosts = allPosts.filter(post => {
    const postDate = new Date(post.date);
    const postYear = postDate.getFullYear();
    const postMonth = postDate.getMonth() + 1; // JavaScript months are 0-based (0-11)
    
    return postYear === yearNum && 
           postMonth === monthNum && 
           post.active;
  });
  
  return (
    <AppLayout>
      <Main posts={filteredPosts} />
    </AppLayout>
  );
}
