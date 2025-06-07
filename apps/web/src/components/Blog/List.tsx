"use client";

import type { Post } from "@repo/db/data";
import { BlogListItem } from "./ListItem";
import { useEffect, useRef, useState, useCallback } from "react";

export function BlogList({ posts }: { posts: Post[] }) {
  // State for posts to display with their index information
  const [displayedPostsInfo, setDisplayedPostsInfo] = useState<{ post: Post; cycleNum: number; index: number }[]>([]);
  // State to track current page/batch
  const [currentPage, setCurrentPage] = useState(1);
  // Posts per page/batch
  const POSTS_PER_PAGE = 5;
  // Reference to the loading element
  const observerRef = useRef<HTMLDivElement>(null);
  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Initialize with first batch of posts
  useEffect(() => {
    if (posts.length > 0) {
      // Create initial posts info with cycle number 1
      const initialPostsInfo = posts.slice(0, POSTS_PER_PAGE).map((post, index) => ({
        post,
        cycleNum: 1, 
        index
      }));
      
      setDisplayedPostsInfo(initialPostsInfo);
      // Reset page when posts change
      setCurrentPage(1);
    }
  }, [posts]);

  // Function to load more posts (memoized with useCallback)
  const loadMorePosts = useCallback(() => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    // Simulate network delay (you can remove this in production or reduce the timeout)
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const startIndex = (nextPage - 1) * POSTS_PER_PAGE;
      const totalPostsLoaded = startIndex; // How many posts we've fetched so far
      
      // Calculate cycle number (how many times we've gone through the entire post list)
      const cycleNumber = Math.floor(totalPostsLoaded / posts.length) + 1;
      
      let newPostsInfo: { post: Post; cycleNum: number; index: number }[] = [];
      
      // Loop through the next POSTS_PER_PAGE indices
      for (let i = 0; i < POSTS_PER_PAGE; i++) {
        // Skip if posts array is empty
        if (posts.length === 0) continue;
        
        const actualIndex = (startIndex + i) % posts.length;
        const actualCycleNum = Math.floor((startIndex + i) / posts.length) + 1;
        
        const post = posts[actualIndex];
        // Only add if we have a valid post
        if (post) {
          newPostsInfo.push({
            post,
            cycleNum: actualCycleNum,
            index: startIndex + i
          });
        }
      }
      
      setDisplayedPostsInfo(prev => [...prev, ...newPostsInfo]);
      setCurrentPage(nextPage);
      setIsLoading(false);
    }, 300);
  }, [posts, currentPage, isLoading]);

  // Set up the intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isLoading) {
          loadMorePosts();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '100px' // Load before user reaches the end for smoother experience
      }
    );

    const currentObserverRef = observerRef.current;
    if (currentObserverRef) {
      observer.observe(currentObserverRef);
    }

    return () => {
      if (currentObserverRef) {
        observer.unobserve(currentObserverRef);
      }
    };
  }, [isLoading, loadMorePosts]);

  if (!posts.length) {
    return (
      <div className="py-10 text-center">
        <h2 className="text-xl font-semibold">0 Posts</h2>
      </div>
    );
  }
  
  return (
    <div className="py-6 flex flex-col gap-8">
      {/* Display the list of posts with unique keys using absolute index position */}
      {displayedPostsInfo.map(({ post, cycleNum, index }) => (
        <BlogListItem key={index.toString()} post={post} />
      ))}
      
      {/* Intersection observer target for infinite scrolling */}
      <div ref={observerRef} className="py-4 text-center">
        {isLoading && (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <span className="ml-2">Loading more posts...</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default BlogList;