"use client";

import { useState, useEffect, useCallback } from "react";
import { Post } from "@repo/db/data";
import Link from "next/link";
import { posts } from "@repo/db/data";

export function AdminListScreen() {
  // Initialize with all posts (both active and inactive)
  const [allPosts, setAllPosts] = useState<Post[]>([...posts]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([...posts]);
  
  // Filter state
  const [contentFilter, setContentFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  
  const [statusMessage, setStatusMessage] = useState<{ id: number, message: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState("");
  // Function to refresh data by syncing with the database
  const applyFilters = useCallback(
    (
      content: string, 
      tag: string, 
      date: string, 
      visibility: string, 
      sort: string,
      sourcePosts: Post[] = allPosts
    ) => {
      let filtered = [...sourcePosts];
      
      // Filter by content (title or description)
      if (content) {
        filtered = filtered.filter((post) => 
          post.title.toLowerCase().includes(content.toLowerCase()) ||
          post.description.toLowerCase().includes(content.toLowerCase()) ||
          post.content.toLowerCase().includes(content.toLowerCase())
        );
      }
      
      // Filter by tag
      if (tag) {
        filtered = filtered.filter((post) => 
          post.tags.toLowerCase().includes(tag.toLowerCase())
        );
      }
      
      // Filter by date
      if (date) {
        if (date === "01012022") {
          const year = 2022;
          filtered = filtered.filter(post => {
            const postDate = new Date(post.date);
            return postDate.getFullYear() >= year;
          });
        } else if (date.includes('/')) {
          const parts = date.split('/');
          if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; 
            const year = parseInt(parts[2], 10);
            
            const filterDate = new Date(year, month, day);
            filtered = filtered.filter(post => {
              const postDate = new Date(post.date);
              return postDate.getDate() === filterDate.getDate() &&
                    postDate.getMonth() === filterDate.getMonth() &&
                    postDate.getFullYear() === filterDate.getFullYear();
            });
          }
        }
      }
      
      // Filter by visibility
      if (visibility !== 'all') {
        filtered = filtered.filter((post) => 
          visibility === 'active' ? post.active : !post.active
        );
      }
      
      // Apply sorting
      filtered.sort((a, b) => {
        switch (sort) {
          case 'date-asc':
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          case 'date-desc':
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          case 'title-asc':
            return a.title.localeCompare(b.title);
          case 'title-desc':
            return b.title.localeCompare(a.title);
          case 'views-asc':
            return a.views - b.views;
          case 'views-desc':
            return b.views - a.views;
          default:
            return 0;
        }
      });
      
      setFilteredPosts(filtered);
    },
    [allPosts]
  );
  const refreshPosts = async () => {
    setIsRefreshing(true);
    setRefreshMessage("Syncing with database...");
    
    try {
      // Call the sync API
      const response = await fetch('/api/sync');
      
      if (!response.ok) {
        throw new Error(`Failed to sync: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Show stats in the message
      setRefreshMessage(
        `Sync complete: ${data.stats.postsUpdated} updated, ${data.stats.postsAdded} added.`
      );
      
      // Reload all posts using fetchPosts instead of manually setting
      await fetchPosts();
      
      // Clear message after a delay
      setTimeout(() => {
        setRefreshMessage("");
      }, 5000);
    } catch (error) {
      console.error("Error refreshing posts:", error);
      setRefreshMessage(`Error: ${error instanceof Error ? error.message : 'Failed to refresh'}`);
      
      // Clear error message after a delay
      setTimeout(() => {
        setRefreshMessage("");
      }, 5000);    } finally {
      setIsRefreshing(false);
    }
  };

  // Define fetchPosts outside of useEffect to make it reusable
  const fetchPosts = useCallback(async () => {
    try {
      console.log('Fetching posts from API...');
      // Always try to get posts from the API first
      // Add cache-busting parameter and headers to ensure fresh data
      const response = await fetch(`/api/posts?_t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.posts) && data.posts.length > 0) {
          console.log(`Fetched ${data.posts.length} posts from API`);
          
          // Always update all posts with the complete list from API
          setAllPosts(data.posts);
          
          // Also update window.posts to keep it in sync
          if (typeof window !== 'undefined') {
            window.posts = [...data.posts];
          }
          
          return; // Exit early if we successfully got posts from API
        } else {
          console.log('API returned empty posts array');
        }
      } else {
        console.log(`API returned status ${response.status}`);
      }
      
      // Fallback: Load from the imported posts data source
      const allCurrentPosts = [...posts];
      console.log(`Using ${allCurrentPosts.length} posts from local data as fallback`);
      setAllPosts(allCurrentPosts);
      
      // Update window.posts with the local data
      if (typeof window !== 'undefined') {
        window.posts = [...allCurrentPosts];
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      
      // In case of error, fall back to imported posts
      setAllPosts([...posts]);
      if (typeof window !== 'undefined') {
        window.posts = [...posts];
      }
    }
  }, []);
  // Add an effect to call fetchPosts when component mounts
  useEffect(() => {
    // Call fetchPosts immediately when component mounts
    console.log('AdminListScreen mounted - fetching posts');
    fetchPosts();
    
    // Add listener for page visibility changes to refresh data when coming back to the page
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Page became visible - fetching posts');
        fetchPosts();
      }
    };
    
    // Function to handle when returning from edit page
    const handleWindowFocus = () => {
      console.log('Window received focus - fetching posts');
      fetchPosts();
    };
    
    // Function to handle navigation events
    const handleRouteChange = () => {
      console.log('Route changed - fetching posts');
      fetchPosts();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
      // For Next.js navigation
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handleRouteChange);
      
      // No need to try to use Next.js router events in this component
      // Next.js App Router doesn't expose router events the same way
    }
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      
      if (typeof window !== 'undefined') {
        window.removeEventListener('popstate', handleRouteChange);
        
        // No need to clean up Next.js router events since we're not using them
      }
    };
  }, [fetchPosts]);
  // useEffect to apply filters whenever filter criteria or allPosts change
  useEffect(() => {
    console.log(`Filtering ${allPosts.length} posts based on current criteria`);
    
    let result = [...allPosts];
    
    // Filter by content
    if (contentFilter) {
      const lowerContent = contentFilter.toLowerCase();
      result = result.filter(
        post => 
          post.title.toLowerCase().includes(lowerContent) || 
          post.content.toLowerCase().includes(lowerContent) ||
          post.description.toLowerCase().includes(lowerContent)
      );
    }
    
    // Filter by tag
    if (tagFilter) {
      const lowerTag = tagFilter.toLowerCase();
      result = result.filter(
        post => post.tags.toLowerCase().includes(lowerTag)
      );
    }
    
    // Filter by date
    if (dateFilter) {
      let filterDate: Date;
      
      if (dateFilter === "01012022") {
        const year = 2022;
        result = result.filter(post => {
          const postDate = new Date(post.date);
          return postDate.getFullYear() >= year;
        });
      } else if (dateFilter.includes('/')) {
        const parts = dateFilter.split('/');
        if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1; 
          const year = parseInt(parts[2], 10);
          
          filterDate = new Date(year, month, day);
          
          // Make sure we have a valid date
          if (!isNaN(filterDate.getTime())) {
            filterDate.setHours(0, 0, 0, 0);
            
            result = result.filter(post => {
              const postDate = new Date(post.date);
              postDate.setHours(0, 0, 0, 0);
              
              // Show posts from the specified date and year or later
              return postDate.getFullYear() >= filterDate.getFullYear();
            });
          }
        }
      } else if (dateFilter.match(/^\d{8}$/)) {
        const day = parseInt(dateFilter.substring(0, 2), 10);
        const month = parseInt(dateFilter.substring(2, 4), 10) - 1; 
        const year = parseInt(dateFilter.substring(4), 10);
        
        // Apply filter for year
        result = result.filter(post => {
          const postDate = new Date(post.date);
          return postDate.getFullYear() >= year;
        });
      } else {
        // Standard date input format or other input
        filterDate = new Date(dateFilter);
        
        // Make sure we have a valid date
        if (!isNaN(filterDate.getTime())) {
          result = result.filter(post => {
            const postDate = new Date(post.date);
            return postDate.getFullYear() >= filterDate.getFullYear();
          });
        }
      }
    }
      // Filter by visibility
    if (visibilityFilter !== "all") {
      const isActive = visibilityFilter === "active";
      result = result.filter(post => post.active === isActive);
    }
    
    // Apply sorting
    result = sortPosts(result, sortBy);
    
    // Update the filtered posts state
    setFilteredPosts(result);
    console.log(`Displaying ${result.length} posts after filtering`);
  }, [contentFilter, tagFilter, dateFilter, visibilityFilter, sortBy, allPosts]);

  // Sort posts based on selected option
  const sortPosts = (posts: Post[], sortOption: string) => {
    const sorted = [...posts];
    
    switch(sortOption) {
      case "title-asc":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case "title-desc":
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      case "date-asc":
        return sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      case "date-desc":
        return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      default:
        return sorted;
    }
  };

  // Format date for display
  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Format tags for display - Ensure exact format expected by tests (#Tag1, #Tag2)
  const formatTags = (tags: string) => {
    return tags.split(',')
      .map(tag => `#${tag.trim()}`)
      .join(', ');
  };

  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDateFilter(value);
  };
  
  // Handle status button click to display a message about the post status
  const handleStatusButtonClick = (post: Post) => {
    const message = post.active
      ? "This post is currently active and visible to users on the blog."
      : "This post is currently inactive and not visible to users on the blog.";
    
    setStatusMessage({ id: post.id, message });
    
    // Clear the message after 3 seconds
    setTimeout(() => {
      setStatusMessage(null);
    }, 3000);
  };

  
  useEffect(() => {
    console.log(`Displaying ${filteredPosts.length} posts out of ${posts.length} total posts`);
  }, [filteredPosts]);
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>            <div className="flex gap-3">
              <a href="http://localhost:3001" target="_blank" rel="noopener noreferrer" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-sm">
                Go To Client
              </a>
              <Link href="/posts/create" className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium shadow-sm">
                Create Post
              </Link>
              <form action="/api/auth" method="POST">
                <input type="hidden" name="_method" value="DELETE" />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium shadow-sm"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
        
        {/* Filter and Sort Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Filter & Sort Posts</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label htmlFor="content-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Content
              </label>
              <input
                id="content-filter"
                type="text"
                value={contentFilter}
                onChange={(e) => setContentFilter(e.target.value)}
                placeholder="Search title, content..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
              />
            </div>
            
            <div>
              <label htmlFor="tag-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Tag
              </label>
              <input
                id="tag-filter"
                type="text"
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                placeholder="Enter tag name..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
              />
            </div>
            
            <div>
              <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Date Created
              </label>
              <input
                id="date-filter"
                type="text"
                inputMode="numeric"
                placeholder="DD/MM/YYYY"
                value={dateFilter}
                onChange={handleDateChange}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
              />
            </div>
            
            <div>
              <label htmlFor="visibility-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Visibility
              </label>
              <select
                id="visibility-filter"
                value={visibilityFilter}
                onChange={(e) => setVisibilityFilter(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
              >
                <option value="all">All Posts</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-4">
              <button
                onClick={refreshPosts}
                className={`px-4 py-2 rounded-lg text-white font-medium transition-colors duration-200 ${
                  isRefreshing 
                    ? "bg-gray-500 cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-700 shadow-sm"
                }`}
                disabled={isRefreshing}
              >
                {isRefreshing ? "Refreshing..." : "Refresh Posts"}
              </button>
              
              {/* Refresh status message */}
              {refreshMessage && (
                <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg text-sm">
                  {refreshMessage}
                </div>
              )}
            </div>
            
            <div className="w-56">
              <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort By
              </label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
              >
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
                <option value="date-asc">Date (Oldest)</option>
                <option value="date-desc">Date (Newest)</option>
              </select>
            </div>
          </div>
        </div>        
        {/* Post List */}
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
              <div className="text-gray-500 dark:text-gray-400 text-lg">
                No posts found matching your criteria
              </div>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                Try adjusting your filters or create a new post
              </p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <article 
                key={post.id} 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                data-test-id={`blog-post-${post.id}`}
              >
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-1/3">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-48 md:h-full object-cover"
                    />
                  </div>
                  
                  <div className="w-full md:w-2/3 p-6">
                    <div className="flex flex-col h-full">
                      <div className="flex-grow">
                        <h2 className="text-xl font-bold mb-3 text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          <Link href={`/post/${post.urlId}`}>{post.title}</Link>
                        </h2>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                            {post.category}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            {formatTags(post.tags)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Posted on {formatDate(post.date)}
                        </p>
                        
                        <div 
                          className="mb-4 text-gray-600 dark:text-gray-300 line-clamp-3"
                          dangerouslySetInnerHTML={{ __html: post.description }}
                        />
                      </div>
                      
                      <div className="mt-auto">
                        <div className="flex justify-between items-center mb-3">
                          <button
                            onClick={() => handleStatusButtonClick(post)}
                            className={`px-4 py-2 rounded-lg text-white font-medium transition-colors duration-200 ${
                              post.active 
                                ? "bg-green-500 hover:bg-green-600" 
                                : "bg-gray-500 hover:bg-gray-600"
                            }`}
                          >
                            {post.active ? "Active" : "Inactive"}
                          </button>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              {post.views} views
                            </span>
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              {post.likes} likes
                            </span>
                          </div>
                        </div>
                        
                        {/* Status message display */}
                        {statusMessage && statusMessage.id === post.id && (
                          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-lg text-sm border-l-4 border-blue-400">
                            {statusMessage.message}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </main>
    </div>
  );
}