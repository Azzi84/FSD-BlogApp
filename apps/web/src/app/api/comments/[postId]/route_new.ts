import { NextRequest, NextResponse } from "next/server";
import { type Comment } from "@repo/db/data";
import { client } from "@repo/db/client";

/**
 * GET handler to retrieve comments for a specific post
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  const postId = parseInt(params.postId);
  
  try {
    // Get comments directly from database
    const comments = await client.safeQuery(async (prisma) => {
      // First verify the post exists
      const post = await prisma.post.findUnique({
        where: { id: postId }
      });
      
      if (!post) {
        throw new Error("Post not found");
      }

      // Get all comments for this post
      const dbComments = await prisma.comment.findMany({
        where: { postId },
        orderBy: { date: 'asc' }
      });

      // Build nested comment structure
      const commentMap = new Map<number, any>();
      const topLevelComments: any[] = [];

      // First pass: create all comment objects
      dbComments.forEach(comment => {
        const commentObj: any = {
          id: comment.id,
          postId: comment.postId,
          author: comment.author,
          content: comment.content,
          date: comment.date.toISOString(),
          likes: comment.likes,
          replies: []
        };
        
        if (comment.parentId) {
          commentObj.parentId = comment.parentId;
        }
        
        commentMap.set(comment.id, commentObj);
      });

      // Second pass: build the nested structure
      dbComments.forEach(comment => {
        const commentObj = commentMap.get(comment.id);
        if (comment.parentId) {
          const parent = commentMap.get(comment.parentId);
          if (parent) {
            parent.replies.push(commentObj);
          }
        } else {
          topLevelComments.push(commentObj);
        }
      });

      return topLevelComments;
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Error retrieving comments:", error);
    if (error instanceof Error && error.message === "Post not found") {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
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
  
  try {
    const { author, content, parentId } = await request.json();

    // Validate required fields
    if (!author || !content) {
      return NextResponse.json(
        { error: "Author and content are required" },
        { status: 400 }
      );
    }

    // Save comment directly to database
    const newComment = await client.safeQuery(async (prisma) => {
      // First verify the post exists
      const post = await prisma.post.findUnique({
        where: { id: postId }
      });
      
      if (!post) {
        throw new Error("Post not found");
      }

      // If parentId is provided, verify the parent comment exists
      if (parentId) {
        const parentComment = await prisma.comment.findUnique({
          where: { id: parentId }
        });
        
        if (!parentComment) {
          throw new Error("Parent comment not found");
        }
      }

      // Create the comment in the database
      const comment = await prisma.comment.create({
        data: {
          postId: postId,
          parentId: parentId || null,
          author: author,
          content: content,
          date: new Date(),
          likes: 0,
        },
      });

      console.log(`Successfully saved comment to database with ID ${comment.id}`);
      
      return {
        id: comment.id,
        postId: comment.postId,
        author: comment.author,
        content: comment.content,
        date: comment.date.toISOString(),
        likes: comment.likes,
        ...(comment.parentId && { parentId: comment.parentId }),
        replies: []
      };
    });

    return NextResponse.json({ comment: newComment }, { status: 201 });
  } catch (error) {
    console.error("Error adding comment:", error);
    if (error instanceof Error && error.message === "Post not found") {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    if (error instanceof Error && error.message === "Parent comment not found") {
      return NextResponse.json({ error: "Parent comment not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
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
  
  try {
    const { commentId } = await request.json();

    // Validate required fields
    if (!commentId) {
      return NextResponse.json(
        { error: "Comment ID is required" },
        { status: 400 }
      );
    }

    // Delete from database using Prisma
    await client.safeQuery(async (prisma) => {
      // First verify the comment exists and belongs to this post
      const comment = await prisma.comment.findUnique({
        where: { id: commentId }
      });
      
      if (!comment) {
        throw new Error("Comment not found");
      }
      
      if (comment.postId !== postId) {
        throw new Error("Comment does not belong to this post");
      }

      // Delete the comment (this will also delete replies due to CASCADE)
      await prisma.comment.delete({
        where: { id: commentId }
      });
      
      console.log(`Successfully deleted comment from database with ID ${commentId}`);
    });

    return NextResponse.json({ success: true, message: "Comment deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting comment:", error);
    if (error instanceof Error && error.message === "Comment not found") {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }
    if (error instanceof Error && error.message === "Comment does not belong to this post") {
      return NextResponse.json({ error: "Comment does not belong to this post" }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
