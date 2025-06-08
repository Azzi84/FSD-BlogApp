import { PrismaClient } from "@prisma/client";
import { posts, Post, Comment } from "./data.js";

declare global {
  var prisma: PrismaClient | undefined;
}

// Type for the query function
type QueryFunction<T> = (prisma: PrismaClient) => Promise<T>;

export const createClient = () => {
  // Return existing client if already created
  if (global.prisma) {
    return global.prisma;
  }

  // Try to get the database URL from environment
  let databaseUrl: string | undefined;
  try {
    // Dynamically import environment variables
    const envModule = require("@repo/env/web");
    databaseUrl = envModule.env.DATABASE_URL;
  } catch (error) {
    console.warn("Environment validation failed or DATABASE_URL not found, falling back to process.env");
    // For development, check if we have a simple DATABASE_URL
    databaseUrl = process.env.DATABASE_URL;
  }

  // If no database URL is available, return a mock client that logs warnings
  if (!databaseUrl) {
    console.warn("DATABASE_URL not found - running without database connection");
    return null;
  }

  // Check if the URL is valid for PostgreSQL
  if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
    console.warn(`Invalid DATABASE_URL format: must start with 'postgresql://' or 'postgres://'. Running without database connection.`);
    return null;
  }

  try {
    const prisma = new PrismaClient({
      datasourceUrl: databaseUrl,
    });

    console.log("Connected to database successfully");

    global.prisma = prisma;
    return prisma;
  } catch (error) {
    console.error("Failed to connect to database:", error);
    console.warn("Running without database connection - data will only be saved to file system");
    return null;
  }
};

export const client = {
  get db() {
    const prisma = createClient();
    return prisma;
  },
  // Helper method to safely execute a database query
  async safeQuery<T>(queryFn: QueryFunction<T>): Promise<T | null> {
    try {
      const prisma = this.db;
      
      // If no database connection, return null gracefully
      if (!prisma) {
        console.warn("No database connection available - skipping database operation");
        return null;
      }
      
      // Execute the query function
      return await queryFn(prisma);
    } catch (error) {
      console.error("Error executing database query:", error);
      // Return null instead of throwing to allow graceful degradation
      return null;
    }
  }
};

/**
 * Get all posts from database
 */
export async function getPosts(): Promise<Post[]> {
  try {
    console.log("getPosts - Starting to fetch posts from database");
    
    const result = await client.safeQuery(async (prisma) => {      const dbPosts = await prisma.post.findMany({
        include: {
          Comments: true,
          Likes: true
        },
        orderBy: { date: 'desc' }
      });

      console.log(`Found ${dbPosts.length} posts in database`);
        // Convert the database posts to the Post type
      return dbPosts.map(dbPost => {
        // Get all comments for this post
        const allComments = dbPost.Comments;
        
        // Build nested comment structure
        const buildCommentTree = (parentId: number | null): any[] => {
          return allComments
            .filter(comment => comment.parentId === parentId)
            .map(comment => ({
              id: comment.id,
              postId: comment.postId,
              parentId: comment.parentId || undefined,
              author: comment.author,
              content: comment.content,
              date: comment.date,
              likes: comment.likes,
              replies: buildCommentTree(comment.id)
            }));
        };
        
        // Get top-level comments (parentId is null)
        const comments = buildCommentTree(null);

        // Create a Post object
        return {
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
          comments: comments
        } as Post;
      });
    });

    if (result) {
      console.log(`Returning ${result.length} posts from database`);
      return result;
    } else {
      console.log("No posts found in database, returning empty array");
      return [];
    }
    
  } catch (error) {
    console.error("Error in getPosts:", error);
    throw error;
  }
}
