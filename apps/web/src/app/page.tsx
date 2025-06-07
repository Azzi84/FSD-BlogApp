import { getPosts } from "@repo/db/client";
import { AppLayout } from "../components/Layout/AppLayout";
import { Main } from "../components/Main";
import styles from "./page.module.css";

export default async function Home() {
  // Fetch posts dynamically from database
  const allPosts = await getPosts();
  const activePosts = allPosts.filter(post => post.active);
  
  return (
    <AppLayout>
      <Main posts={activePosts} className={styles.main} />
    </AppLayout>
  );
}
