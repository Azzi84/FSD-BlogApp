import { useState } from 'react';

interface CommentFormProps {
  postId: number;
  onSubmit: (content: string, author: string) => void;
  buttonText?: string;
  placeholder?: string;
  parentId?: number;
}

export function CommentForm({ 
  onSubmit, 
  buttonText = "Add Comment",
  placeholder = "Write a comment...",
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [errors, setErrors] = useState<{ content?: string, author?: string }>({});
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    const newErrors: { content?: string, author?: string } = {};
    if (!content.trim()) {
      newErrors.content = 'Comment cannot be empty';
    }
    if (!author.trim()) {
      newErrors.author = 'Name is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit(content, author);
    setContent('');
    setAuthor('');
    setErrors({});
  };
  
  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="mb-4">
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Your name"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.author ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
          } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
        />
        {errors.author && <p className="text-red-500 text-xs mt-1">{errors.author}</p>}
      </div>
      
      <div className="mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.content ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
          } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
        />
        {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
      </div>
      
      <button
        type="submit"
        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
      >
        {buttonText}
      </button>
    </form>
  );
}
