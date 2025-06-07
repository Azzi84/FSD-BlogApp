/**
 * This script synchronizes data between the file system and the database.
 * It ensures that both data stores are consistent.
 */

// Import necessary modules
import { client } from '../packages/db/src/client.js';
import { posts } from '../packages/db/src/data.js';
import { savePosts, loadPosts } from '../packages/db/src/persistence.js';
import { syncDatabaseWithFile } from '../packages/db/src/sync.js';

async function main() {
  try {
    console.log('Starting database synchronization...');
    
    // First load the latest data from file
    await loadPosts();
    console.log(`Loaded ${posts.length} posts from file`);
    
    // Then sync with the database
    await syncDatabaseWithFile();
    console.log('Database synchronization completed successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('Error during database synchronization:', error);
    process.exit(1);
  }
}

main();
