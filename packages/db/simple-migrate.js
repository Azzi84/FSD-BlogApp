// Simple migration without Prisma client
import pg from 'pg';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Your Neon database connection
const DATABASE_URL = "postgresql://neondb_owner:npg_BJYjHcqb8F6v@ep-spring-meadow-a8i4hfk9-pooler.eastus2.azure.neon.tech/neondb?sslmode=require";

async function simpleMigration() {
  let sqliteDb;
  let pgClient;
  
  try {
    console.log('🔄 Starting simple data migration...\n');
    
    // Connect to SQLite
    console.log('📂 Connecting to SQLite database...');
    sqliteDb = new Database(join(__dirname, 'prisma', 'dev.db'));
    
    // Connect to PostgreSQL
    console.log('🐘 Connecting to PostgreSQL...');
    pgClient = new pg.Client({ connectionString: DATABASE_URL });
    await pgClient.connect();
    
    // Get posts from SQLite
    console.log('📝 Reading posts from SQLite...');
    const sqlitePosts = sqliteDb.prepare('SELECT * FROM Post ORDER BY id').all();
    console.log(`Found ${sqlitePosts.length} posts in SQLite`);
    
    if (sqlitePosts.length === 0) {
      console.log('❌ No posts found in SQLite');
      return;
    }
    
    // Show sample data
    console.log('\n📋 Sample posts from SQLite:');
    sqlitePosts.slice(0, 3).forEach(post => {
      console.log(`   - ${post.title} (${post.urlId})`);
    });
    
    // Check current PostgreSQL data
    console.log('\n🔍 Checking current PostgreSQL data...');
    const result = await pgClient.query('SELECT COUNT(*) as count FROM "Post"');
    console.log(`Current PostgreSQL posts: ${result.rows[0].count}`);
    
    // Migrate posts that don't exist
    let migratedCount = 0;
    
    for (const post of sqlitePosts) {
      try {
        // Check if post exists
        const existsResult = await pgClient.query(
          'SELECT id FROM "Post" WHERE "urlId" = $1',
          [post.urlId]
        );
        
        if (existsResult.rows.length > 0) {
          console.log(`⏭️ Skipping existing post: ${post.title}`);
          continue;
        }
        
        // Insert new post
        const insertResult = await pgClient.query(`
          INSERT INTO "Post" (
            "urlId", "title", "content", "description", "imageUrl", 
            "category", "tags", "date", "views", "likes", "active"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING id
        `, [
          post.urlId,
          post.title,
          post.content,
          post.description,
          post.imageUrl,
          post.category,
          post.tags,
          new Date(post.date),
          post.views || 0,
          post.likes || 0,
          post.active !== 0
        ]);
        
        console.log(`✅ Migrated: ${post.title} (ID: ${insertResult.rows[0].id})`);
        migratedCount++;
        
      } catch (error) {
        console.error(`❌ Error migrating ${post.title}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Migration completed! Migrated ${migratedCount} posts`);
    
    // Final count
    const finalResult = await pgClient.query('SELECT COUNT(*) as count FROM "Post"');
    console.log(`📊 Final PostgreSQL posts: ${finalResult.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    if (sqliteDb) sqliteDb.close();
    if (pgClient) await pgClient.end();
  }
}

simpleMigration();
