'use client';

import { useState, useEffect } from 'react';
import { type Post, type Comment as CommentType } from '@repo/db/data';
import { Comment } from './Comment';
import { CommentForm } from './CommentForm';
import { addReplyToComment } from '../../utils/commentHelpers';

interface CommentsListProps {
  post: Post;
}

export function CommentsList({ post }: CommentsListProps) {
  const [comments, setComments] = useState<CommentType[]>(post.comments || []);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Helper function to safely convert comment dates
  const processCommentDates = (comment: any) => {
    try {
      return {
        ...comment,
        date: comment.date instanceof Date ? comment.date : new Date(comment.date),
        replies: comment.replies ? comment.replies.map(processCommentDates) : []
      };
    } catch (err) {
      console.error('Error processing comment date:', err);
      return {
        ...comment,
        date: new Date(), // Fallback to current date if conversion fails
        replies: comment.replies ? comment.replies.map(processCommentDates) : []
      };
    }
  };

  // Fetch comments when component mounts
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/comments/${post.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch comments');
        }
        
        const data = await response.json();
        
        // Only update if we have comments from the API
        if (data.comments && data.comments.length > 0) {
          // Process comments with safe date conversion
          const processedComments = data.comments.map(processCommentDates);
          setComments(processedComments);
        }
      } catch (err) {
        console.error('Error fetching comments:', err);
      }
    };
    
    // Initialize comments from props, ensuring dates are properly processed
    if (post.comments && post.comments.length > 0) {
      try {
        const initialComments = post.comments.map(processCommentDates);
        setComments(initialComments);
      } catch (err) {
        console.error('Error processing initial comments:', err);
      }
    } else {
      // Only fetch if comments aren't already provided
      fetchComments();
    }
  }, [post.id, post.comments]);
  const handleAddComment = async (content: string, author: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/comments/${post.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ author, content }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
      
      const data = await response.json();
      
      if (data.comment) {
        try {
          // Ensure the date is a Date object using our safe processor
          const newComment = processCommentDates(data.comment);
          setComments([...comments, newComment]);
          setShowCommentForm(false);
        } catch (err) {
          console.error('Error processing new comment date:', err);
          
          // Fallback approach: use current date if conversion fails
          const fallbackComment = {
            ...data.comment,
            date: new Date(),
            replies: []
          };
          
          setComments([...comments, fallbackComment]);
          setShowCommentForm(false);
        }
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  const handleAddReply = async (reply: Omit<CommentType, 'id' | 'date' | 'likes'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/comments/${post.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          author: reply.author,
          content: reply.content,
          parentId: reply.parentId
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add reply');
      }
      
      const data = await response.json();
      
      if (data.comment) {
        try {
          // Process reply with safe date conversion
          const newReply = processCommentDates(data.comment);
          
          // Update the state with the new comment structure
          const updatedComments = addReplyToComment(
            comments, 
            reply.parentId!, 
            newReply
          );
          setComments(updatedComments);
        } catch (err) {
          console.error('Error processing new reply:', err);
          
          // Fallback approach with current date
          const fallbackReply = {
            ...data.comment,
            date: new Date(),
            replies: []
          };
          
          const updatedComments = addReplyToComment(
            comments, 
            reply.parentId!, 
            fallbackReply
          );
          setComments(updatedComments);
        }
      }
    } catch (err) {
      console.error('Error adding reply:', err);
      setError('Failed to add reply. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteComment = async (commentId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/comments/${post.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commentId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }
      
      // Remove the comment from local state
      const removeCommentFromState = (comments: CommentType[], targetId: number): CommentType[] => {
        return comments.filter(comment => {
          if (comment.id === targetId) {
            return false; // Remove this comment
          }
          
          // If this comment has replies, recursively filter them
          if (comment.replies && comment.replies.length > 0) {
            comment.replies = removeCommentFromState(comment.replies, targetId);
          }
          
          return true; // Keep this comment
        });
      };
      
      setComments(prevComments => removeCommentFromState(prevComments, commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Comments ({comments.length})</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map(comment => (
            <Comment
              key={comment.id}
              comment={comment}
              postId={post.id}
              onAddReply={handleAddReply}
              onDeleteComment={handleDeleteComment} // Pass the delete handler to Comment
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 mb-6">No comments yet. Be the first to comment!</p>
      )}
      
      {showCommentForm ? (
        <div className="mt-8">
          <CommentForm
            postId={post.id}
            onSubmit={handleAddComment}
          />
          <button
            onClick={() => setShowCommentForm(false)}
            className="mt-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            Cancel
          </button>
        </div>
      ) : (        <button
          onClick={() => setShowCommentForm(true)}
          disabled={isLoading}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors disabled:bg-opacity-70"
        >
          Add a Comment
        </button>
      )}
    </div>
  );
}
