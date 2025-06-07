"use client";

import { useState, useEffect, useRef } from "react";
import { Post, posts } from "@repo/db/data";
import { toUrlPath } from "@repo/utils/url";
import { useRouter } from "next/navigation";
import { Editor } from '@tinymce/tinymce-react';

interface ValidationErrors {
  title?: string;
  description?: string;
  content?: string;
  tags?: string;
  imageUrl?: string;
  general?: string;
}

declare global {
  interface Window {
    posts?: Post[];
    latestPost?: Post;
  }
}

interface PostEditFormProps {
  post?: Post;
  isCreate?: boolean;
}

export function PostEditForm({ post, isCreate = false }: PostEditFormProps) {
  const router = useRouter();
  
  // Initialize with either existing post data or empty values for create mode
  const [title, setTitle] = useState(post?.title || "");
  const [description, setDescription] = useState(post?.description || "");
  const [content, setContent] = useState(post?.content || "");
  const [category, setCategory] = useState(post?.category || "");
  const [tags, setTags] = useState(post?.tags || "");  const [imageUrl, setImageUrl] = useState(post?.imageUrl || "");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [active, setActive] = useState(post?.active !== undefined ? post.active : true);const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
  // Function to validate the form
  const validateForm = () => {
    const newErrors: ValidationErrors = {};
    
    if (!title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (!description.trim()) {
      newErrors.description = "Description is required";
    } else if (description.length > 300) {
      newErrors.description = "Description is too long. Maximum is 300 characters";
    }
    
    if (!content.trim()) {
      newErrors.content = "Content is required";
    }
    
    if (!tags.trim()) {
      newErrors.tags = "At least one tag is required";
    }
    
    if (!imageUrl.trim()) {
      newErrors.imageUrl = "Image URL is required";
    } else {
      try {
        new URL(imageUrl);
      } catch (e) {
        newErrors.imageUrl = "This is not a valid URL";
      }
    }
      setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle file upload to S3
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();
      setImageUrl(result.imageUrl);
      setUploadedFile(file);
      
      // Clear any existing image URL error
      setErrors(prev => ({ ...prev, imageUrl: undefined }));
      
    } catch (error) {
      console.error('Error uploading file:', error);
      setErrors(prev => ({ 
        ...prev, 
        imageUrl: 'Failed to upload image. Please try again.' 
      }));
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ 
          ...prev, 
          imageUrl: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)' 
        }));
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setErrors(prev => ({ 
          ...prev, 
          imageUrl: 'File size must be less than 5MB' 
        }));
        return;
      }

      handleFileUpload(file);
    }
  };
    // Initialize the global window.posts array if needed and fetch all posts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Fetch all posts to ensure window.posts has the complete list
      const fetchAllPosts = async () => {
        try {
          const response = await fetch('/api/posts');
          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data.posts) && data.posts.length > 0) {
              // Set the complete posts list
              window.posts = data.posts;
              console.log(`Initialized window.posts with ${data.posts.length} posts from API`);
            }
          }
        } catch (error) {
          console.error("Error initializing window.posts:", error);
          // Fallback to imported data if API fetch fails
          if (!window.posts) {
            window.posts = [...posts];
            console.log(`Initialized window.posts with ${posts.length} posts from imported data`);
          }
        }
      };
      
      fetchAllPosts();
    }
  }, []);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setErrors(prev => ({ ...prev, general: "Please fix the errors before saving" }));
      return;
    }
    
    // Clear any previous general error
    setErrors(prev => ({ ...prev, general: undefined }));
    
    setIsLoading(true);
    
    try {
      if (isCreate) {
        // Handle create post logic
        const urlId = toUrlPath(title);
        
        // Create a new post object
        const newPost: Omit<Post, 'id'> = {
          title,
          description,
          content,
          category,
          tags,
          imageUrl,
          active,
          urlId,
          date: new Date(),
          views: 0,
          likes: 0,
        };
        
        // Use the API route to create the post
        let response;
        let retries = 0;
        const maxRetries = 3;
        
        while (retries < maxRetries) {
          try {
            response = await fetch(`/api/posts`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(newPost),
            });
            
            if (response.ok) break;
            
            // If we get a 500 error, retry after a short delay
            retries++;
            if (retries < maxRetries) {
              console.log(`Retrying create post (${retries}/${maxRetries})...`);
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          } catch (fetchError) {
            console.error("Fetch error during create:", fetchError);
            retries++;
            if (retries < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }
        
        if (!response || !response.ok) {
          const errorData = response ? await response.json().catch(() => ({})) : {};
          throw new Error(`Failed to create post: ${errorData.error || (response ? response.status : 'Network error')}`);
        }
          const result = await response.json();
        console.log("Post created successfully:", result.post);
        
        // Fetch all posts to ensure we have the complete list
        try {
          const response = await fetch('/api/posts');
          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data.posts)) {
              // Update the global posts array with the complete list from API
              if (typeof window !== 'undefined') {
                window.posts = data.posts;
              }
              console.log(`Fetched all ${data.posts.length} posts after creating new post`);
            }
          }
        } catch (error) {
          console.error("Error fetching posts after creating new post:", error);
        }
        
        // Show success message
        setSuccessMessage("Post created successfully");        // Clear form fields after successful creation
        setTitle("");
        setDescription("");
        setContent("");
        setCategory("");
        setTags("");
        setImageUrl("");
        setUploadedFile(null);
        
        // Redirect to blog list page after post creation
        console.log('Navigating back to admin list after post creation');
        router.push("/");
        router.refresh(); // Refresh all data on the page
      } else if (post) {
        // Handle update post logic
        // Generate a new urlId based on the title if it changed
        const newUrlId = title !== post.title ? toUrlPath(title) : post.urlId;
        
        // Create the updated post object
        const updatedPost: Post = {
          ...post,
          title,
          description,
          content,
          category,
          tags,
          imageUrl,
          active,
          urlId: newUrlId
        };
        
        // Use the API route to update the post with retry logic
        let response;
        let retries = 0;
        const maxRetries = 3;
        
        while (retries < maxRetries) {
          try {
            response = await fetch(`/api/posts/${post.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(updatedPost),
            });
            
            if (response.ok) break;
            
            // If we get a 500 error, retry after a short delay
            retries++;
            if (retries < maxRetries) {
              console.log(`Retrying update post (${retries}/${maxRetries})...`);
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          } catch (fetchError) {
            console.error("Fetch error during update:", fetchError);
            retries++;
            if (retries < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }
        
        if (!response || !response.ok) {
          const errorData = response ? await response.json().catch(() => ({})) : {};
          throw new Error(`Failed to update post: ${errorData.error || (response ? response.status : 'Network error')}`);
        }          const result = await response.json();
        console.log("Post updated successfully:", result.post);
        // Show success message
        setSuccessMessage("Post updated successfully");
        
        // Fetch all posts before navigating back to ensure we have the complete list
        const fetchAllPosts = async () => {
          try {
            const response = await fetch('/api/posts');
            if (response.ok) {
              const data = await response.json();
              if (Array.isArray(data.posts)) {
                // Update the global posts array with the complete list from API
                window.posts = data.posts;
                console.log(`Fetched all ${data.posts.length} posts before navigating back to list`);
              }
            }
          } catch (error) {
            console.error("Error pre-fetching posts before navigation:", error);
          }
        };
          // Wait for the posts to be fetched before navigating
        await fetchAllPosts();
        
        // Use a short delay before navigation to ensure the posts are loaded
        setTimeout(() => {
          console.log('Navigating back to admin list after post update');
          router.push("/");
          router.refresh(); // Refresh all data on the page
        }, 500);
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error(`Failed to ${isCreate ? 'create' : 'update'} post:`, error);
      setErrors(prev => ({ 
        ...prev, 
        general: `Failed to ${isCreate ? 'create' : 'update'} post. ${error instanceof Error ? error.message : 'Please try again.'}`
      }));
    } finally {
      setIsLoading(false);
    }  };
  
  // Handle post deletion
  const handleDelete = async () => {
    if (!post || isCreate) {
      return; // Can't delete a post that doesn't exist or in create mode
    }
    
    setIsLoading(true);
    
    try {
      // Use the API route to delete the post with retry logic
      let response;
      let retries = 0;
      const maxRetries = 3;
      
      while (retries < maxRetries) {
        try {
          response = await fetch(`/api/posts/${post.id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) break;
          
          // If we get a 500 error, retry after a short delay
          retries++;
          if (retries < maxRetries) {
            console.log(`Retrying delete post (${retries}/${maxRetries})...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (fetchError) {
          console.error("Fetch error during delete:", fetchError);
          retries++;
          if (retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      if (!response || !response.ok) {
        const errorData = response ? await response.json().catch(() => ({})) : {};
        throw new Error(`Failed to delete post: ${errorData.error || (response ? response.status : 'Network error')}`);
      }
      
      const result = await response.json();
      console.log("Post deleted successfully:", result.post);
      
      // Show success message
      setSuccessMessage("Post deleted successfully");
      
      // Fetch all posts to update the global list
      try {
        const response = await fetch('/api/posts');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.posts)) {
            if (typeof window !== 'undefined') {
              window.posts = data.posts;
            }
            console.log(`Fetched all ${data.posts.length} posts after deleting post`);
          }
        }
      } catch (error) {
        console.error("Error fetching posts after deleting post:", error);
      }
      
      // Navigate back to the list page after a short delay
      setTimeout(() => {
        console.log('Navigating back to admin list after post deletion');
        router.push("/");
        router.refresh(); // Refresh all data on the page
      }, 1000);
      
    } catch (error) {
      console.error("Failed to delete post:", error);
      setErrors(prev => ({ 
        ...prev, 
        general: `Failed to delete post. ${error instanceof Error ? error.message : 'Please try again.'}`
      }));    } finally {
      setIsLoading(false);
      setShowDeleteConfirmation(false);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      {/* Page title based on create/edit mode */}
      <h1 className="text-2xl font-bold mb-6">
        {isCreate ? "Create New Post" : "Edit Post"}
      </h1>
      
      {/* Success message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}
      
      {/* General error message */}
      {errors.general && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errors.general}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block font-medium mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
          />
          {errors.title && (
            <p className="mt-1 text-red-600 text-sm">{errors.title}</p>
          )}
        </div>          <div>
          <label htmlFor="description" className="block font-medium mb-1">
            Description
          </label>
          <Editor
            id="description"
            value={description}
            apiKey="ad5cy86ccbfavm5wpckcwmto6c1a34qrno0541fdui5ceu2d"  
            onEditorChange={(newDescription) => setDescription(newDescription)}
            init={{
              height: 200,
              menubar: true,
              plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'help', 'wordcount'
              ],
              toolbar:
                'undo redo | blocks | bold italic underline strikethrough | link image media table | align | numlist bullist indent outdent | removeformat help',
              content_style:
                'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 16px; }'
            }}
          />
          {errors.description && (
            <p className="mt-1 text-red-600 text-sm">{errors.description}</p>
          )}
        </div>
          <div>
          <label htmlFor="content" className="block font-medium mb-1">
          Content
          </label>          <Editor
          id="content"
          value={content}
          apiKey="ad5cy86ccbfavm5wpckcwmto6c1a34qrno0541fdui5ceu2d"  
          onEditorChange={(newContent) => setContent(newContent)}
          init={{
          height: 400,
          menubar: true,
          plugins: [
        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
        'insertdatetime', 'media', 'table', 'help', 'wordcount'
      ],
      toolbar:
        'undo redo | blocks | bold italic underline strikethrough | link image media table | align | numlist bullist indent outdent | removeformat help',
      content_style:
        'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 16px; }'
    }}
  />

  {errors.content && (
    <p className="mt-1 text-red-600 text-sm">{errors.content}</p>
  )}
</div>
        
        <div>
          <label htmlFor="category" className="block font-medium mb-1">
            Category
          </label>
          <input
            id="category"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label htmlFor="tags" className="block font-medium mb-1">
            Tags
          </label>
          <input
            id="tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Tag1, Tag2, Tag3"
          />
          {errors.tags && (
            <p className="mt-1 text-red-600 text-sm">{errors.tags}</p>
          )}
        </div>        <div>
          <label htmlFor="imageUrl" className="block font-medium mb-1">
            Image URL
          </label>
          <div className="flex gap-2">
            <input
              id="imageUrl"
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="flex-1 p-2 border rounded"
              placeholder="https://example.com/image.jpg or upload a file"
            />
            <div className="relative">
              <input
                id="imageFile"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <button
                type="button"
                disabled={isUploading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 whitespace-nowrap"
              >
                {isUploading ? 'Uploading...' : 'Upload Image'}
              </button>
            </div>
          </div>
          {isUploading && (
            <p className="mt-1 text-blue-600 text-sm">Uploading image...</p>
          )}
          {uploadedFile && (
            <p className="mt-1 text-green-600 text-sm">
              ✓ Uploaded: {uploadedFile.name}
            </p>
          )}
          {errors.imageUrl && (
            <p className="mt-1 text-red-600 text-sm">{errors.imageUrl}</p>
          )}
          {imageUrl && (
            <div className="mt-2">
              <p className="text-sm text-gray-500 mb-1" data-testid="image-preview-label">
                Image Preview:
              </p>
              <img 
                src={imageUrl} 
                alt="Preview" 
                className="max-h-40 object-cover rounded"
                data-test-id="image-preview"
                data-testid="image-preview" 
              />
            </div>
          )}
        </div>
          <div className="flex justify-between pt-4">
          <div className="flex items-center gap-4">
            {/* Delete button - only show when editing an existing post */}
            {!isCreate && post && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirmation(true)}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-400"
              >
                Delete Post
              </button>
            )}
            
            <div className="flex items-center">
              <input
                id="active"
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="active" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                Active (visible on blog)
              </label>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </form>
      
      {/* Delete confirmation dialog */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Confirm Delete
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmation(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-400"
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}