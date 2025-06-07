import { useState } from 'react';
import { type Comment as CommentType } from '@repo/db/data';
import { CommentForm } from './CommentForm';
import { format2DigitMonthDay } from '../../utils/dateFormatter';

interface CommentProps {
  comment: CommentType;
  postId: number;
  onAddReply: (comment: Omit<CommentType, 'id' | 'date' | 'likes'>) => void;
  onDeleteComment: (commentId: number) => void;
  depth?: number;
}

export function Comment({ comment, postId, onAddReply, onDeleteComment, depth = 0 }: CommentProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [likes, setLikes] = useState(comment.likes);
  const [isLiking, setIsLiking] = useState(false);
  const maxDepth = 3; // Maximum nesting level
  
  // Safely format date, handling potential invalid dates
  const safelyFormatDate = () => {
    try {
      if (!comment.date) return 'Unknown date';
      return format2DigitMonthDay(comment.date);
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Unknown date';
    }
  };
  
  const handleAddReply = (replyContent: string, author: string) => {
    onAddReply({
      postId,
      parentId: comment.id,
      author,
      content: replyContent,
      replies: []
    });
    setIsReplying(false);
  };
    const handleLike = async () => {
    if (isLiking) return; // Prevent multiple clicks
    
    setIsLiking(true);
    try {
      const response = await fetch(`/api/comments/${postId}/${comment.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'like' }),
      });
      
      if (response.ok) {
        setLikes(likes + 1);
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    } finally {
      setIsLiking(false);
    }
  };
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      onDeleteComment(comment.id);
    }
  };
  
  return (    <div className={`mb-4 ${depth > 0 ? `ml-${depth * 6}` : ''}`}>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex justify-between items-start">
          <h4 className="font-semibold">{comment.author}</h4>
          <span className="text-xs text-gray-500">{safelyFormatDate()}</span>
        </div>
        
        <div className="my-2 text-gray-700 dark:text-gray-300">
          {comment.content}
        </div>
        
        <div className="flex justify-between items-center mt-2 text-sm">
          <div className="flex gap-4">
            <button 
              onClick={handleLike} 
              className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
              disabled={isLiking}
            >
              {likes} {likes === 1 ? 'Like' : 'Likes'}
            </button>
            
            {depth < maxDepth && (
              <button 
                onClick={() => setIsReplying(!isReplying)}
                className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
              >
                Reply
              </button>
            )}
          </div>
          
          {/* Delete button - positioned in bottom right */}
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700"
            title="Delete comment"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        </div>
        
        {isReplying && (
          <div className="mt-4">
            <CommentForm 
              postId={postId} 
              onSubmit={handleAddReply}
              buttonText="Reply" 
              placeholder="Write a reply..."
            />
          </div>
        )}
      </div>
        {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 pl-6">
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              postId={postId}
              onAddReply={onAddReply}
              onDeleteComment={onDeleteComment}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
