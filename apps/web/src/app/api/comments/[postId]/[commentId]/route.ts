import { NextRequest, NextResponse } from "next/server";
import { posts } from "@repo/db/data";

/**
 * POST handler to like/unlike a comment
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string; commentId: string } }
) {
  const postId = parseInt(params.postId);
  const commentId = parseInt(params.commentId);
  
  // Find the post by ID
  const post = posts.find((p) => p.id === postId);
  
  if (!post || !post.comments) {
    return NextResponse.json({ error: "Post or comments not found" }, { status: 404 });
  }

  try {
    const { action } = await request.json();

    if (action !== "like" && action !== "unlike") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Find and update the comment likes
    const updateCommentLikes = (comments: any[]): boolean => {
      for (const comment of comments) {
        if (comment.id === commentId) {
          // Increment or decrement likes based on action
          comment.likes = action === "like" ? comment.likes + 1 : Math.max(0, comment.likes - 1);
          return true;
        }
        
        // Check replies recursively if they exist
        if (comment.replies && comment.replies.length > 0) {
          const found = updateCommentLikes(comment.replies);
          if (found) return true;
        }
      }
      return false;
    };

    const updated = updateCommentLikes(post.comments);
    
    if (!updated) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
  }
}
