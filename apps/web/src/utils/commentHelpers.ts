
import { Comment } from "@repo/db/data";

/**
 * Recursively count all comments including nested replies
 */
export function countTotalComments(comments?: Comment[]): number {
  if (!comments || comments.length === 0) {
    return 0;
  }
  
  let total = comments.length;
  
  // Count all nested replies
  for (const comment of comments) {
    if (comment.replies && comment.replies.length > 0) {
      total += countTotalComments(comment.replies);
    }
  }
  
  return total;
}

/**
 * Find a comment by ID in a nested comment structure
 */
export function findCommentById(comments: Comment[], id: number): Comment | null {
  for (const comment of comments) {
    if (comment.id === id) {
      return comment;
    }
    
    if (comment.replies && comment.replies.length > 0) {
      const foundInReplies = findCommentById(comment.replies, id);
      if (foundInReplies) {
        return foundInReplies;
      }
    }
  }
  
  return null;
}

/**
 * Add a reply to a comment in a nested comment structure
 * Returns a new array with the updated comment structure
 */
export function addReplyToComment(
  comments: Comment[], 
  parentId: number, 
  newReply: Comment
): Comment[] {
  return comments.map(comment => {
    if (comment.id === parentId) {
      return {
        ...comment,
        replies: [...(comment.replies || []), newReply]
      };
    }
    
    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: addReplyToComment(comment.replies, parentId, newReply)
      };
    }
    
    return comment;
  });
}
