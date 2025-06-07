import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function checkSQLiteData() {
  try {
    // Connect to SQLite (old database)
    const sqliteDb = new Database(join(__dirname, 'prisma', 'dev.db'));
    
    console.log('🔍 Checking SQLite database data...\n');
    
    // Get all posts from SQLite
    const posts = sqliteDb.prepare('SELECT * FROM Post ORDER BY id').all();
    console.log(`📝 Total posts in SQLite: ${posts.length}\n`);
    
    if (posts.length === 0) {
      console.log('❌ No posts found in SQLite database');
      return;
    }
    
    // Show first few posts
    console.log('📋 Sample posts:');
    posts.slice(0, 5).forEach((post, index) => {
      console.log(`   ${index + 1}. ${post.title} (urlId: ${post.urlId})`);
      console.log(`      Date: ${post.date}`);
      console.log(`      Active: ${post.active}`);
      console.log(`      Views: ${post.views || 0}`);
      console.log('');
    });
    
    if (posts.length > 5) {
      console.log(`   ... and ${posts.length - 5} more posts\n`);
    }
    
    // Check comments
    const comments = sqliteDb.prepare('SELECT COUNT(*) as count FROM Comment').get();
    console.log(`💬 Total comments in SQLite: ${comments.count}`);
    
    // Check likes
    const likes = sqliteDb.prepare('SELECT COUNT(*) as count FROM Like').get();
    console.log(`👍 Total likes in SQLite: ${likes.count}`);
    
    sqliteDb.close();
    
  } catch (error) {
    console.error('❌ Error checking SQLite data:', error.message);
    console.error('Full error:', error);
  }
}

checkSQLiteData();
