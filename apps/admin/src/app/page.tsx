import { posts, Post, Comment } from "@repo/db/data";
import { isLoggedIn } from "../utils/auth";
import styles from "./page.module.css";
import Link from "next/link";
import { AdminListScreen } from "../components/AdminListScreen";
import { loadPosts, savePosts } from "@repo/db/persistence";
import { client } from "@repo/db/client";

export default async function Home() {
  // use the is logged in function to check if user is authorised
  const loggedIn = await isLoggedIn();

  if (!loggedIn) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Sign in to your account</h1>
          </div>
          <form className="mt-8 space-y-6" action="/api/auth" method="POST">
            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </main>
    );
  } else {
    // Reload posts from the latest data sources before rendering the admin screen
    try {
      // First reload from file
      await loadPosts();

      // Try to sync with database for the latest updates
      try {
        await client.safeQuery(async (prisma) => {
          const dbPosts = await prisma.post.findMany();

          // If we have database posts, use the sync function
          if (dbPosts.length > 0) {
            try {
              // Dynamically import the sync module to avoid build issues
              const { syncDatabaseWithFile } = await import("@repo/db/sync");
              await syncDatabaseWithFile();
              console.log("Synced database and file data for home page");
            } catch (syncError) {
              console.error("Error syncing database with file:", syncError);
            }
          }
          return dbPosts;
        });
      } catch (error) {
        console.error("Error accessing database:", error);
        console.log("Using file-based post data instead");
      }
    } catch (loadError) {
      console.error("Error loading posts from file:", loadError);
    }

    return <AdminListScreen />;
  }
}
