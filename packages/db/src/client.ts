import { PrismaClient } from "@prisma/client";
import { posts, Post, Comment } from "./data.js";

declare global {
  var prisma: PrismaClient | undefined;
}

// Type for the query function
type QueryFunction<T> = (prisma: PrismaClient) => Promise<T>;

import { PrismaClient } from "@prisma/client";

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
    console.error("Environment validation failed or DATABASE_URL not found.");
    // For development, check if we have a simple DATABASE_URL
    databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL is required but not found in environment variables");
    }
  }

  // Database URL is required
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required but not provided in environment variables");
  }

  // Check if the URL is valid for PostgreSQL
  if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
    throw new Error(`Invalid DATABASE_URL: must start with 'postgresql://' or 'postgres://'. Current: ${databaseUrl}`);
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
    throw new Error(`Database connection failed: ${error instanceof Error ? error.message : String(error)}`);
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
      
      // Execute the query function
      return await queryFn(prisma);
    } catch (error) {
      console.error("Error executing database query:", error);
      throw error;
    }
  }
};

/**
 * Get all posts from database
 */
export async function getPosts(): Promise<Post[]> {
  try {
    console.log("getPosts - Starting to fetch posts from database");
    
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

      console.log(`Found ${dbPosts.length} posts in database`);
      
      // Convert the database posts to the Post type
      return dbPosts.map(dbPost => {
        // Convert database comments to Comment type with nested replies
        const comments = dbPost.Comments.filter(comment => !comment.parentId).map(comment => ({
          id: comment.id,
          postId: comment.postId,
          parentId: comment.parentId || undefined,
          author: comment.author,
          content: comment.content,
          date: comment.date,
          likes: comment.likes,
          replies: comment.replies.map(reply => ({
            id: reply.id,
            postId: reply.postId,
            parentId: reply.parentId || undefined,
            author: reply.author,
            content: reply.content,
            date: reply.date,
            likes: reply.likes
          }))
        }));

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
