import { PrismaClient } from '@prisma/client';

// Use the Neon database URL directly
const prisma = new PrismaClient({
  datasourceUrl: "postgresql://neondb_owner:npg_BJYjHcqb8F6v@ep-spring-meadow-a8i4hfk9-pooler.eastus2.azure.neon.tech/neondb?sslmode=require"
});

async function checkPosts() {
  try {
    console.log('🔍 Checking posts in PostgreSQL database...\n');
    
    // Get all posts
    const posts = await prisma.post.findMany({
      include: {
        Comments: true,
        Likes: true
      },
      orderBy: {
        date: 'desc'
      }
    });
    
    console.log(`📊 Total posts found: ${posts.length}\n`);
    
    if (posts.length === 0) {
      console.log('❌ No posts found in database!');
      console.log('💡 This means the old data wasn\'t migrated to PostgreSQL.');
      return;
    }
    
    posts.forEach((post, index) => {
      console.log(`📝 Post ${index + 1}:`);
      console.log(`   ID: ${post.id}`);
      console.log(`   URL ID: ${post.urlId}`);
      console.log(`   Title: ${post.title}`);
      console.log(`   Date: ${post.date}`);
      console.log(`   Active: ${post.active}`);
      console.log(`   Views: ${post.views}`);
      console.log(`   Comments: ${post.Comments.length}`);
      console.log(`   Likes: ${post.Likes.length}`);
      console.log(`   Category: ${post.category || 'None'}`);
      console.log(`   Content length: ${post.content?.length || 0} chars`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error checking posts:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkPosts();
