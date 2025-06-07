import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function migrateFromJSON() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Starting JSON data migration to PostgreSQL...\n');
    
    // Read the JSON data
    const jsonPath = join(__dirname, '..', '..', 'data', 'blog-data.json');
    console.log(`📂 Reading data from: ${jsonPath}`);
    
    const jsonData = JSON.parse(readFileSync(jsonPath, 'utf8'));
    console.log(`📝 Found ${jsonData.length} posts in JSON file\n`);
    
    // Check current PostgreSQL data
    const existingPosts = await prisma.post.findMany();
    console.log(`📊 Current PostgreSQL posts: ${existingPosts.length}`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const jsonPost of jsonData) {
      try {
        // Check if post already exists by urlId
        const existingPost = await prisma.post.findUnique({
          where: { urlId: jsonPost.urlId }
        });
        
        if (existingPost) {
          console.log(`⏭️  Skipping existing post: "${jsonPost.title}" (${jsonPost.urlId})`);
          skippedCount++;
          continue;
        }
        
        // Create the post
        const newPost = await prisma.post.create({
          data: {
            urlId: jsonPost.urlId,
            title: jsonPost.title,
            content: jsonPost.content,
            description: jsonPost.description,
            imageUrl: jsonPost.imageUrl,
            category: jsonPost.category,
            tags: jsonPost.tags,
            date: new Date(jsonPost.date),
            views: jsonPost.views || 0,
            likes: jsonPost.likes || 0,
            active: jsonPost.active !== false // Default to true if not specified
          }
        });
        
        console.log(`✅ Migrated: "${newPost.title}" (ID: ${newPost.id}, urlId: ${newPost.urlId})`);
        migratedCount++;
        
        // Migrate comments if they exist
        if (jsonPost.comments && jsonPost.comments.length > 0) {
          console.log(`   💬 Migrating ${jsonPost.comments.length} comments...`);
          
          for (const comment of jsonPost.comments) {
            await prisma.comment.create({
              data: {
                postId: newPost.id,
                parentId: comment.parentId || null,
                author: comment.author,
                content: comment.content,
                date: new Date(comment.date),
                likes: comment.likes || 0
              }
            });
          }
          console.log(`   ✅ Migrated ${jsonPost.comments.length} comments`);
        }
        
      } catch (error) {
        console.error(`❌ Error migrating post "${jsonPost.title}":`, error.message);
      }
    }
    
    console.log('\n🎉 Migration Summary:');
    console.log(`   ✅ Successfully migrated: ${migratedCount} posts`);
    console.log(`   ⏭️  Skipped (already exists): ${skippedCount} posts`);
    
    // Final verification
    const finalPosts = await prisma.post.findMany({
      orderBy: { date: 'desc' }
    });
    
    console.log(`\n📊 Final PostgreSQL database contains: ${finalPosts.length} posts`);
    console.log('\n📋 All posts in database:');
    finalPosts.forEach((post, index) => {
      console.log(`   ${index + 1}. "${post.title}" (${post.urlId}) - ${post.active ? 'Active' : 'Inactive'}`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

migrateFromJSON();
