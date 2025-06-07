import { NextRequest, NextResponse } from "next/server";
import { posts, Post } from "@repo/db/data";
import { savePosts, loadPosts } from "@repo/db/persistence";
import { isLoggedIn } from "../../../utils/auth";
import { client } from "@repo/db/client";

// Get all posts
export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/posts - Starting to fetch posts");
    
    // Try to get posts from database first (most up-to-date source)
    let postsFromDB: Post[] = [];
    let dbAvailable = false;
    
    try {
      postsFromDB = await client.safeQuery(async (prisma) => {
        const dbPosts = await prisma.post.findMany({
          include: {
            Comments: true,
            Likes: true
          },
          orderBy: { date: 'desc' } // Ensure consistent ordering
        });

        if (dbPosts.length > 0) {
          console.log(`Found ${dbPosts.length} posts in database`);
          // Convert the database posts to the Post type
          return dbPosts.map(dbPost => {
            // Convert database comments to Comment type
            const comments = dbPost.Comments.map(comment => ({
              id: comment.id,
              postId: comment.postId,
              parentId: comment.parentId !== null ? comment.parentId : undefined,
              author: comment.author,
              content: comment.content,
              date: comment.date,
              likes: comment.likes
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
            };
          });
        }
        return [];      });

      if (postsFromDB.length > 0) {
        dbAvailable = true;
        console.log(`Successfully retrieved ${postsFromDB.length} posts from database`);
      }
    } catch (dbError) {
      console.error("Error fetching posts from database:", dbError);
    }

    // If database is not available or empty, fall back to file data
    if (!dbAvailable || postsFromDB.length === 0) {
      try {
        await loadPosts();
        console.log("Loaded posts from file as fallback");
      } catch (loadError) {
        console.error("Error loading posts from file:", loadError);
      }
    }

    // Return database posts if available, otherwise return in-memory posts
    const allPosts = dbAvailable && postsFromDB.length > 0 ? postsFromDB : posts;
    
    const response = NextResponse.json({ 
      posts: allPosts
    });
    
    // Set cache control headers to prevent caching of this endpoint
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error("Error retrieving posts:", error);
    return NextResponse.json(
      { error: "Failed to retrieve posts" }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Check authentication
  const isAuthenticated = await isLoggedIn();
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    
    // Generate a new ID (max ID + 1)
    const newId = Math.max(...posts.map(post => post.id), 0) + 1;
    // Handle the date properly
    let postDate: Date;
    try {
      postDate = body.date instanceof Date ? body.date : new Date(body.date || new Date());
    } catch (dateError) {
      console.error("Invalid date format, using current date instead:", dateError);
      postDate = new Date();
    }
    
    // Create a new post with the generated ID
    const newPost: Post = {
      id: newId,
      ...body,
      date: postDate
    };
    
    console.log(`Creating new post with ID ${newId}:`, newPost);
      // Add to posts array
    posts.push(newPost);
    // Save to database using Prisma if available
    try {
      await client.safeQuery(async (prisma) => {
        await prisma.post.create({
          data: {
            id: newId,
            title: newPost.title,
            content: newPost.content,
            description: newPost.description,
            imageUrl: newPost.imageUrl,
            category: newPost.category,
            tags: newPost.tags,
            urlId: newPost.urlId,
            active: newPost.active,
            date: postDate,
            views: newPost.views,
            likes: newPost.likes
          }
        });
        console.log(`Successfully saved new post to database with ID ${newId}`);
      });
    } catch (dbError) {
      console.error(`Error saving post to database:`, dbError);
      const errorMessage = typeof dbError === 'object' && dbError !== null && 'message' in dbError 
        ? String(dbError.message) 
        : '';
      if (errorMessage.includes("does not exist in the current database")) {
        console.log("Database tables don't exist yet. Run 'pnpm init-db' to create them.");
      }
      // Continue execution even if database save fails
    }
    
    // Persist changes to file
    try {
      await savePosts();
      console.log(`Successfully saved new post with ID ${newId}`);
    } catch (saveError) {
      console.error(`Error saving new post with ID ${newId}:`, saveError);
      // Continue execution - we'll return the created post 
      // even if saving to file fails
    }
      return NextResponse.json({ 
      message: "Post created successfully", 
      post: newPost 
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" }, 
      { status: 500 }
    );
  }
}