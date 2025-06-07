import { PrismaClient } from '@prisma/client';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function migrateData() {
  // Connect to PostgreSQL (new database)
  const postgresClient = new PrismaClient();
  
  // Connect to SQLite (old database)
  const sqliteDb = new Database(join(__dirname, 'prisma', 'dev.db'));
  
  try {
    console.log('🔄 Starting data migration from SQLite to PostgreSQL...\n');
    
    // Get all posts from SQLite
    const sqlitePosts = sqliteDb.prepare('SELECT * FROM Post ORDER BY id').all();
    console.log(`📝 Found ${sqlitePosts.length} posts in SQLite database`);
    
    if (sqlitePosts.length === 0) {
      console.log('❌ No posts found in SQLite database');
      return;
    }
    
    // Clear existing PostgreSQL data (except the new post you created)
    console.log('🧹 Checking existing PostgreSQL data...');
    const existingPosts = await postgresClient.post.findMany();
    console.log(`📊 Found ${existingPosts.length} posts in PostgreSQL`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const sqlitePost of sqlitePosts) {
      try {
        // Check if post already exists in PostgreSQL
        const existingPost = await postgresClient.post.findUnique({
          where: { urlId: sqlitePost.urlId }
        });
        
        if (existingPost) {
          console.log(`⏭️  Skipping post '${sqlitePost.title}' (urlId: ${sqlitePost.urlId}) - already exists`);
          skippedCount++;
          continue;
        }
        
        // Migrate the post
        const newPost = await postgresClient.post.create({
          data: {
            urlId: sqlitePost.urlId,
            title: sqlitePost.title,
            content: sqlitePost.content,
            description: sqlitePost.description,
            imageUrl: sqlitePost.imageUrl,
            category: sqlitePost.category,
            tags: sqlitePost.tags,
            date: new Date(sqlitePost.date),
            views: sqlitePost.views || 0,
            likes: sqlitePost.likes || 0,
            active: sqlitePost.active !== 0 // Convert SQLite boolean
          }
        });
        
        console.log(`✅ Migrated post: '${newPost.title}' (ID: ${newPost.id})`);
        migratedCount++;
        
        // Now migrate comments for this post
        const sqliteComments = sqliteDb.prepare('SELECT * FROM Comment WHERE postId = ? ORDER BY id').all(sqlitePost.id);
        
        if (sqliteComments.length > 0) {
          console.log(`   💬 Migrating ${sqliteComments.length} comments...`);
          
          for (const comment of sqliteComments) {
            await postgresClient.comment.create({
              data: {
                postId: newPost.id, // Use the new PostgreSQL post ID
                parentId: comment.parentId,
                author: comment.author,
                content: comment.content,
                date: new Date(comment.date),
                likes: comment.likes || 0
              }
            });
          }
          console.log(`   ✅ Migrated ${sqliteComments.length} comments`);
        }
        
        // Migrate likes for this post
        const sqliteLikes = sqliteDb.prepare('SELECT * FROM Like WHERE postId = ?').all(sqlitePost.id);
        
        if (sqliteLikes.length > 0) {
          console.log(`   👍 Migrating ${sqliteLikes.length} likes...`);
          
          for (const like of sqliteLikes) {
            await postgresClient.like.create({
              data: {
                postId: newPost.id, // Use the new PostgreSQL post ID
                userIP: like.userIP
              }
            });
          }
          console.log(`   ✅ Migrated ${sqliteLikes.length} likes`);
        }
        
      } catch (error) {
        console.error(`❌ Error migrating post '${sqlitePost.title}':`, error.message);
      }
    }
    
    console.log('\n🎉 Migration Summary:');
    console.log(`   ✅ Successfully migrated: ${migratedCount} posts`);
    console.log(`   ⏭️  Skipped (already exists): ${skippedCount} posts`);
    
    // Verify the migration
    const finalCount = await postgresClient.post.count();
    console.log(`\n📊 Final PostgreSQL database contains: ${finalCount} posts`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    sqliteDb.close();
    await postgresClient.$disconnect();
  }
}

migrateData();
