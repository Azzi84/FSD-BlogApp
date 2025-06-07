import { client } from './client.js';
import { posts, Post } from './data.js';
import { savePosts, loadPosts } from './persistence.js';

/**
 * Synchronizes data with the database
 * This ensures the in-memory posts array is up to date with the database
 */
export async function syncWithDatabase(): Promise<void> {
  try {
    console.log("Starting database synchronization");
    
    // Load current posts from database
    await loadPosts();
    
    console.log("Database synchronization completed successfully");
  } catch (error) {
    console.error("Error during database synchronization:", error);
    throw error;
  }
}

// Legacy export for backward compatibility
export const syncDatabaseWithFile = syncWithDatabase;
