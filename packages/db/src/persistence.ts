import { client } from './client.js';
import { posts, Post, Comment } from './data.js';

// Database-only persistence layer for Vercel deployment
// No file storage - everything uses the database

// Function to save posts to the database
export async function savePosts(): Promise<void> {
  try {
    console.log(`Saving ${posts.length} posts to database`);
    
    await client.safeQuery(async (prisma) => {
      // Use transaction to ensure data consistency
      await prisma.$transaction(async (tx) => {
        for (const post of posts) {
          await tx.post.upsert({
            where: { id: post.id },
            update: {
              title: post.title,
              content: post.content || '',
              description: post.description || '',
              imageUrl: post.imageUrl || '',
              category: post.category || '',
              tags: post.tags || '',
              urlId: post.urlId,
              active: post.active,
              date: post.date,
              views: post.views,
              likes: post.likes
            },
            create: {
              id: post.id,
              title: post.title,
              content: post.content || '',
              description: post.description || '',
              imageUrl: post.imageUrl || '',
              category: post.category || '',
              tags: post.tags || '',
              urlId: post.urlId,
              active: post.active,
              date: post.date,
              views: post.views,
              likes: post.likes
            }
          });
        }
      });
    });
    
    console.log('Posts saved successfully to database');
  } catch (error) {
    console.error('Error saving posts to database:', error);
    throw error;
  }
}

// Function to load posts from the database
export async function loadPosts(): Promise<boolean> {
  try {
    console.log('Loading posts from database');
    
    const result = await client.safeQuery(async (prisma) => {
      const dbPosts = await prisma.post.findMany({
        include: {
          Comments: {
            include: {
              replies: true
            }
          },
          Likes: true
        },
        orderBy: { date: 'desc' }
      });
      
      // Clear the current posts array
      posts.length = 0;
      
      // Convert database posts to the Post type
      dbPosts.forEach((dbPost) => {
        const post: Post = {
          id: dbPost.id,
          title: dbPost.title,
          content: dbPost.content || '',
          description: dbPost.description || '',
          imageUrl: dbPost.imageUrl || '',
          category: dbPost.category || '',
          tags: dbPost.tags || '',
          urlId: dbPost.urlId,
          active: dbPost.active,
          date: dbPost.date,
          views: dbPost.views,
          likes: dbPost.likes,
          comments: dbPost.Comments.map((comment): Comment => ({
            id: comment.id,
            postId: comment.postId,
            parentId: comment.parentId || undefined,
            author: comment.author,
            content: comment.content,
            date: comment.date,
            likes: comment.likes,
            replies: comment.replies.map((reply): Comment => ({
              id: reply.id,
              postId: reply.postId,
              parentId: reply.parentId || undefined,
              author: reply.author,
              content: reply.content,
              date: reply.date,
              likes: reply.likes
            }))
          }))
        };
        
        posts.push(post);
      });
      
      console.log(`Successfully loaded ${posts.length} posts from database`);
      return true;
    });
    
    return result !== null;
  } catch (error) {
    console.error('Error loading posts from database:', error);
    throw error;
  }
}

// Initialize data by loading from database
export async function initializeData(): Promise<void> {
  try {
    console.log('Initializing data from database');
    
    const loaded = await loadPosts();
    if (loaded && posts.length > 0) {
      console.log(`Successfully loaded ${posts.length} posts from database`);
    } else {
      console.log('No existing posts data found in database. Creating initial posts...');
      // If no data was loaded, save the current default posts to database
      await savePosts();
      console.log('Default posts saved to database successfully');
    }
  } catch (error) {
    console.error('Error during data initialization:', error);
    console.log('Using default posts and attempting to save them to database...');
    
    // If loading fails, we'll use the default posts from data.ts
    // and save them to create the initial data
    try {
      await savePosts();
      console.log('Default posts saved to database successfully');
    } catch (saveError) {
      console.error('Error saving default posts to database:', saveError);
      throw saveError;
    }
  }
}
