import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function addMissingPosts() {
  try {
    console.log('🔄 Adding missing posts to PostgreSQL database...\n');
    
    // Read the blog data
    const blogData = JSON.parse(fs.readFileSync('./data/blog-data.json', 'utf8'));
    console.log(`📖 Found ${blogData.length} posts in blog-data.json`);
    
    // Check current posts
    const existingPosts = await prisma.post.findMany({
      select: { urlId: true, title: true }
    });
    console.log(`📊 Current posts in database: ${existingPosts.length}`);
    
    let addedCount = 0;
    
    // Add each post if it doesn't exist
    for (const post of blogData) {
      // Skip if post already exists
      const exists = existingPosts.find(p => p.urlId === post.urlId);
      if (exists) {
        console.log(`⏭️  Skipping "${post.title}" - already exists`);
        continue;
      }
      
      try {
        const newPost = await prisma.post.create({
          data: {
            urlId: post.urlId,
            title: post.title,
            content: post.content || '',
            description: post.description || '',
            imageUrl: post.imageUrl || null,
            category: post.category || null,
            tags: post.tags || null,
            date: new Date(post.date),
            views: post.views || 0,
            likes: post.likes || 0,
            active: post.active !== false // Default to true
          }
        });
        
        console.log(`✅ Added: "${newPost.title}" (ID: ${newPost.id})`);
        addedCount++;
        
      } catch (error) {
        console.error(`❌ Failed to add "${post.title}":`, error.message);
      }
    }
    
    console.log(`\n🎉 Successfully added ${addedCount} new posts!`);
    
    // Final verification
    const finalCount = await prisma.post.count();
    console.log(`📊 Total posts in database: ${finalCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

addMissingPosts();
