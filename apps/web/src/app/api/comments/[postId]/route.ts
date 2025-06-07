import { NextRequest, NextResponse } from "next/server";
import { posts } from "@repo/db/data";
import { type Comment } from "@repo/db/data";
import { client } from "@repo/db/client";
import { savePosts } from "@repo/db/persistence";

/**
 * Helper function to safely serialize comments for JSON response
 */
const serializeCommentsForJSON = (comments: Comment[]): any[] => {
  return comments.map(comment => {
    // Create a new object with only the properties we need
    const serialized: any = {
      id: comment.id,
      postId: comment.postId,
      author: comment.author,
      content: comment.content,
      likes: comment.likes
    };
    
    // Add optional properties
    if (comment.parentId !== undefined) {
      serialized.parentId = comment.parentId;
    }
    
    try {
      // Safely handle date conversion
      if (comment.date instanceof Date) {
        serialized.date = comment.date.toISOString();
      } else if (typeof comment.date === 'string') {
        // If it's already a string, ensure it's a valid ISO string
        try {
          const dateObj = new Date(comment.date);
          serialized.date = dateObj.toISOString();
        } catch (err) {
          // Fallback to current date if conversion fails
          serialized.date = new Date().toISOString();
        }
      } else {
        // Fallback for any other type
        serialized.date = new Date().toISOString();
      }
        // Process nested replies recursively
      if (comment.replies && comment.replies.length > 0) {
        serialized.replies = serializeCommentsForJSON(comment.replies);
      } else {
        serialized.replies = [];
      }
      
      return serialized;
    } catch (err) {
      console.error('Error processing comment for JSON:', err);
      // Return a safe fallback
      return {
        ...comment,
        date: new Date().toISOString(),
        replies: []
      };
    }
  });
}

/**
 * GET handler to retrieve comments for a specific post
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  const postId = parseInt(params.postId);
  
  // Find the post by ID
  const post = posts.find((p) => p.id === postId);
  
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  try {
    // Always use the in-memory post comments as the source of truth
    // This ensures consistency between database and file system
    let finalComments: Comment[] = post.comments || [];

    // Process comments to ensure dates are properly formatted
    const processedComments = serializeCommentsForJSON(finalComments);
    
    // Return the comments (or an empty array if none)
    return NextResponse.json({ comments: processedComments });
  } catch (error) {
    console.error("Error retrieving comments:", error);
    return NextResponse.json(
      { error: "Failed to retrieve comments" },
      { status: 500 }
    );
  }
}

/**
 * POST handler to add a new comment to a post
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  const postId = parseInt(params.postId);
  
  // Find the post by ID
  const post = posts.find((p) => p.id === postId);
  
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  try {
    const { author, content, parentId } = await request.json();

    // Validate required fields
    if (!author || !content) {
      return NextResponse.json(
        { error: "Author and content are required" },
        { status: 400 }
      );
    }    // Generate a new comment ID that doesn't conflict with existing ones
    const existingIds = new Set<number>();
    
    // Collect all existing comment IDs from the post
    const collectIds = (comments: Comment[]) => {
      comments.forEach(comment => {
        existingIds.add(comment.id);
        if (comment.replies) {
          collectIds(comment.replies);
        }
      });
    };
    
    if (post.comments) {
      collectIds(post.comments);
    }
    
    // Generate a unique ID
    let newCommentId = Date.now();
    while (existingIds.has(newCommentId)) {
      newCommentId++;
    }

    // Create the comment object
    const newComment: Comment = {
      id: newCommentId,
      postId,
      author,
      content,
      date: new Date(),
      likes: 0,
    };

    // If parentId is provided, this is a reply
    if (parentId) {
      newComment.parentId = parentId;
    }

    // Initialize comments array if not exist
    if (!post.comments) {
      post.comments = [];
    }

    // Add the new comment to the in-memory structure
    if (parentId) {
      // This is a reply - find the parent comment and add to its replies
      const addReplyToComment = (comments: Comment[]): boolean => {
        for (const comment of comments) {
          if (comment.id === parentId) {
            // Initialize replies array if it doesn't exist
            if (!comment.replies) {
              comment.replies = [];
            }
            comment.replies.push(newComment);
            return true;
          }
          
          // Check nested replies recursively
          if (comment.replies && comment.replies.length > 0) {
            const found = addReplyToComment(comment.replies);
            if (found) return true;
          }
        }
        return false;
      };

      const added = addReplyToComment(post.comments);
      
      if (!added) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 404 }
        );
      }
    } else {
      // This is a top-level comment
      post.comments.push(newComment);
    }

    // Save to database using Prisma if available
    try {
      await client.safeQuery(async (prisma) => {
        await prisma.comment.create({
          data: {
            id: newCommentId,
            postId: postId,
            parentId: parentId || null,
            author: author,
            content: content,
            date: newComment.date,
            likes: 0,
          },
        });
        console.log(`Successfully saved comment to database with ID ${newCommentId}`);
      });
    } catch (dbError) {
      console.error(`Error saving comment to database:`, dbError);
      // Continue execution even if database save fails
    }

    // Persist changes to file system
    try {
      await savePosts();
      console.log(`Successfully saved comment with ID ${newCommentId} to file system`);
    } catch (saveError) {
      console.error(`Error saving comment with ID ${newCommentId} to file system:`, saveError);
      // Continue execution even if file save fails
    }

    return NextResponse.json({ comment: newComment }, { status: 201 });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: "Invalid request format" },
      { status: 400 }
    );
  }
}

/**
 * DELETE handler to delete a comment from a post
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  const postId = parseInt(params.postId);
  
  // Find the post by ID
  const post = posts.find((p) => p.id === postId);
  
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  try {
    const { commentId } = await request.json();

    // Validate required fields
    if (!commentId) {
      return NextResponse.json(
        { error: "Comment ID is required" },
        { status: 400 }
      );
    }

    // Initialize comments array if not exist
    if (!post.comments) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Helper function to remove comment by ID from nested structure
    const removeCommentById = (comments: Comment[], targetId: number): boolean => {
      for (let i = 0; i < comments.length; i++) {
        const comment = comments[i];
        
        if (comment.id === targetId) {
          // Found the comment to delete
          comments.splice(i, 1);
          return true;
        }
        
        // Check nested replies recursively
        if (comment.replies && comment.replies.length > 0) {
          const found = removeCommentById(comment.replies, targetId);
          if (found) return true;
        }
      }
      return false;
    };

    // Try to remove the comment
    const removed = removeCommentById(post.comments, commentId);
    
    if (!removed) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    // Delete from database using Prisma if available
    try {
      await client.safeQuery(async (prisma) => {
        await prisma.comment.delete({
          where: {
            id: commentId,
          },
        });
        console.log(`Successfully deleted comment from database with ID ${commentId}`);
      });
    } catch (dbError) {
      console.error(`Error deleting comment from database:`, dbError);
      // Continue execution even if database delete fails
    }

    // Persist changes to file system
    try {
      await savePosts();
      console.log(`Successfully deleted comment with ID ${commentId} from file system`);
    } catch (saveError) {
      console.error(`Error saving after deleting comment with ID ${commentId}:`, saveError);
      // Continue execution even if file save fails
    }

    return NextResponse.json({ success: true, message: "Comment deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Invalid request format" },
      { status: 400 }
    );
  }
}
