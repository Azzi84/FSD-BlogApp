import { NextRequest, NextResponse } from "next/server";
import { posts, Post } from "@repo/db/data";
import { savePosts, loadPosts } from "@repo/db/persistence";
import { isLoggedIn } from "../../../../utils/auth";
import { client } from "@repo/db/client";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const postId = parseInt(params.id);
  
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
    
    // Load posts from database first (same as other routes)
    await loadPosts();
    
    const postIndex = posts.findIndex((post) => post.id === postId);
    
    if (postIndex === -1) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }
    
    // Create a copy of the existing post to ensure we can safely modify it
    const existingPost = {...posts[postIndex]};

    // Handle dates properly
    let dateValue = existingPost.date;
    if (body.date) {
      try {
        dateValue = new Date(body.date);
      } catch (e) {
        console.error("Invalid date format:", body.date);
        // Keep using the existing date if there's an error
      }
    }
    
    // Update the post
    const updatedPost: Post = {
      ...existingPost,
      ...body,
      id: postId, // Make sure ID doesn't change
      date: dateValue // Make sure date is a Date object
    };
    
    posts[postIndex] = updatedPost;
    
    // Log the update
    console.log(`Updating post ID ${postId}`);
      // Update in database using Prisma
    try {
      await client.safeQuery(async (prisma) => {
        await prisma.post.update({
          where: { id: postId },
          data: {
            title: updatedPost.title,
            content: updatedPost.content,
            description: updatedPost.description,
            imageUrl: updatedPost.imageUrl,
            category: updatedPost.category,
            tags: updatedPost.tags,
            urlId: updatedPost.urlId,
            active: updatedPost.active,
            date: dateValue
          }
        });
        console.log(`Successfully updated post in database with ID ${postId}`);
      });
    } catch (dbError) {
      console.error(`Error updating post in database:`, dbError);
      // Continue execution even if database update fails
    }
    
    // Persist changes to file
    try {
      // First save the posts to the central data file
      await savePosts();
      console.log(`Successfully saved updated post ID ${postId} to central data file`);
      
      // Reload the posts to ensure we're using the most recent data
      try {
        // Reload posts directly from the file
        await loadPosts();
        console.log('Posts reloaded from file after update to ensure consistency');
      } catch (reloadError) {
        console.error('Error reloading posts after update:', reloadError);
      }
    } catch (saveError) {
      console.error(`Error saving updated post ID ${postId}:`, saveError);
      // Continue execution - we'll return the updated post 
      // even if saving to file fails
    }
      return NextResponse.json({ 
      message: "Post updated successfully", 
      post: updatedPost 
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const postId = parseInt(params.id);
  
  // Check authentication
  const isAuthenticated = await isLoggedIn();
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // Load posts from database first (same as other routes)
    await loadPosts();
    
    // Find the post in the loaded posts array
    const postIndex = posts.findIndex((post) => post.id === postId);
    
    if (postIndex === -1) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }
    
    // Get the post before removing it
    const postToDelete = posts[postIndex];
    
    // Remove from posts array
    posts.splice(postIndex, 1);
      // Remove from database
    try {
      await client.safeQuery(async (prisma) => {
        await prisma.post.delete({
          where: { id: postId }
        });
        console.log(`Successfully deleted post from database with ID ${postId}`);
      });
    } catch (dbError) {
      console.error(`Error deleting post from database:`, dbError);
      // Continue execution even if database delete fails
    }
    
    // Persist changes to file
    try {
      await savePosts();
      console.log(`Successfully saved posts after deleting ID ${postId}`);
    } catch (saveError) {
      console.error(`Error saving posts after deleting ID ${postId}:`, saveError);
    }
      return NextResponse.json({ 
      message: "Post deleted successfully",
      post: postToDelete
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" }, 
      { status: 500 }
    );
  }
}