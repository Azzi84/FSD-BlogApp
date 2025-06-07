// import { posts, type Post } from "../components/data";

export async function tags(posts: { tags: string; active: boolean }[]) {
  // Filter active posts only
  const activePosts = posts.filter(post => post.active);
  
  // Create a map to store tag counts
  const tagCounts = new Map<string, number>();
  
  // Process each post's tags
  activePosts.forEach(post => {
    const postTags = post.tags.split(',');
    
    // Count each tag
    postTags.forEach(tag => {
      const trimmedTag = tag.trim();
      const currentCount = tagCounts.get(trimmedTag) || 0;
      tagCounts.set(trimmedTag, currentCount + 1);
    });
  });
  
  // Convert the map to an array of objects sorted alphabetically
  return Array.from(tagCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
