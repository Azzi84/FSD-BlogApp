import { NextRequest, NextResponse } from "next/server";
import { client } from "@repo/db/client";
import { posts, Post, Comment } from "@repo/db/data";
import { savePosts, loadPosts } from "@repo/db/persistence";
import { isLoggedIn } from "../../../utils/auth";

export async function GET(request: NextRequest) {
  // Check authentication
  const isAuthenticated = await isLoggedIn();
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  try {    // First reload from file
    await loadPosts();
    
    // Use safeQuery to handle database operations
    const dbPostsResult = await client.safeQuery(async (prisma) => {
      const dbPosts = await prisma.post.findMany({
        include: {
          Comments: true,
          Likes: true
        }
      });
      
      // Track changes
      let updatedCount = 0;
      let addedCount = 0;
    
    // Create a map of existing posts by ID for quick lookup
    const postsMap = new Map<number, Post>();
    posts.forEach(post => postsMap.set(post.id, post));
    
    // Update or add posts from the database
    for (const dbPost of dbPosts) {
      // Convert database comments to Comment type
      const comments: Comment[] = dbPost.Comments.map(comment => ({
        id: comment.id,
        postId: comment.postId,
        parentId: comment.parentId !== null ? comment.parentId : undefined,
        author: comment.author,
        content: comment.content,
        date: comment.date,
        likes: comment.likes
      }));
      
      // Create a Post object from the database data
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
        comments
      };
      
      // Check if we need to update an existing post
      const existingPost = postsMap.get(dbPost.id);
      if (existingPost) {
        // Only update if there are differences
        if (existingPost.title !== post.title || 
            existingPost.content !== post.content || 
            existingPost.description !== post.description || 
            existingPost.active !== post.active) {
          
          // Find index in posts array
          const index = posts.findIndex(p => p.id === dbPost.id);
          if (index !== -1) {
            posts[index] = post;
            updatedCount++;
          }
        }
      } else {
        // Add new post
        posts.push(post);
        addedCount++;
      }
    }
    
    // Also check for posts in the file that aren't in the database
    let dbCreatedCount = 0;
    for (const post of posts) {
      const dbPost = dbPosts.find(p => p.id === post.id);
      if (!dbPost) {
        // Post exists in file but not in database - create it
        try {
          await prisma.post.create({
            data: {
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
          dbCreatedCount++;
        } catch (createError) {
          console.error(`Error creating post ID ${post.id} in database:`, createError);
        }
      }
    }      // Save posts to file if we made changes
    if (updatedCount > 0 || addedCount > 0) {
      await savePosts();
    }
    
    return {
      updatedCount,
      addedCount,
      dbCreatedCount,
      totalPosts: posts.length,
      totalDBPosts: dbPosts.length
    };
  });
  // If database query was successful
  if (dbPostsResult) {
    const response = NextResponse.json({
      success: true,
      message: "Synchronization completed successfully",
      stats: {
        postsUpdated: dbPostsResult.updatedCount,
        postsAdded: dbPostsResult.addedCount,
        postsCreatedInDB: dbPostsResult.dbCreatedCount,
        totalPosts: dbPostsResult.totalPosts,
        totalDBPosts: dbPostsResult.totalDBPosts
      }
    });
    
    // Add cache control headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  }
  
  // If database query failed (null result from safeQuery)
  const response = NextResponse.json({
    success: true,
    message: "Database not available or tables don't exist. Using file-based storage only.",
    stats: {      postsUpdated: 0,
      postsAdded: 0,
      postsCreatedInDB: 0,
      totalPosts: posts.length,
      totalDBPosts: 0
    }
  });
  
  // Add cache control headers to fallback response
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  
  return response;  } catch (error) {
    console.error("Error during synchronization:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to synchronize data" },
      { status: 500 }
    );
    
    // Add cache control headers to error response
    errorResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    errorResponse.headers.set('Pragma', 'no-cache');
    errorResponse.headers.set('Expires', '0');
    
    return errorResponse;
  }
}
