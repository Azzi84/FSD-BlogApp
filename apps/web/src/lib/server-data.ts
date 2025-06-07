// Server-side functions to fetch data from the database
import { client } from '@repo/db/client';

export type ServerPost = {
  id: string;
  title: string;
  category: string;
  tags: string;
  date: Date;
  active: boolean;
};

// Get active posts from database for server components
export async function getActivePosts(): Promise<ServerPost[]> {
  try {
    const result = await client.safeQuery(async (prisma) => {
      const posts = await prisma.post.findMany({
        where: { active: true },
        select: {
          id: true,
          title: true,
          category: true,
          tags: true,
          date: true,
          active: true,
        },
        orderBy: { date: 'desc' }
      });
      return posts;
    });
    
    return result || [];
  } catch (error) {
    console.error('Error fetching active posts:', error);
    return [];
  }
}

// Get categories with counts from database
export async function getCategories(): Promise<{ name: string; count: number }[]> {
  try {
    const result = await client.safeQuery(async (prisma) => {
      const categoryCounts = await prisma.post.groupBy({
        by: ['category'],
        where: { active: true },
        _count: {
          category: true,
        },
        orderBy: {
          category: 'asc',
        },
      });
        return categoryCounts
        .filter((item: { category: string; _count: { category: number } }) => item.category) // Filter out null/empty categories
        .map((item: { category: string; _count: { category: number } }) => ({
          name: item.category,
          count: item._count.category,
        }));
    });
    
    return result || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// Get history (year/month) with counts from database
export async function getHistory(): Promise<{ year: number; month: number; count: number }[]> {
  try {
    const result = await client.safeQuery(async (prisma) => {
      const posts = await prisma.post.findMany({
        where: { active: true },
        select: {
          date: true,
        },
      });
        // Group posts by year and month
      const postsByYearAndMonth = new Map<string, { month: number; year: number; count: number }>();
      
      posts.forEach((post: { date: Date }) => {
        const date = new Date(post.date);
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // JavaScript months are 0-based (0-11)
        const key = `${year}-${month}`;
        
        if (postsByYearAndMonth.has(key)) {
          const item = postsByYearAndMonth.get(key)!;
          item.count += 1;
        } else {
          postsByYearAndMonth.set(key, { year, month, count: 1 });
        }
      });
      
      // Convert map to array and sort by most recent date first
      const historyItems = Array.from(postsByYearAndMonth.values()).sort((a, b) => {
        if (a.year !== b.year) {
          return b.year - a.year; // Most recent year first
        }
        return b.month - a.month; // Most recent month first
      });
      
      return historyItems;
    });
    
    return result || [];
  } catch (error) {
    console.error('Error fetching history:', error);
    return [];
  }
}

// Get tags with counts from database
export async function getTags(): Promise<{ name: string; count: number }[]> {
  try {
    const result = await client.safeQuery(async (prisma) => {
      const posts = await prisma.post.findMany({
        where: { active: true },
        select: {
          tags: true,
        },
      });
      
      // Create a map to store tag counts
      const tagCounts = new Map<string, number>();
        // Process each post's tags
      posts.forEach((post: { tags: string }) => {
        if (post.tags) {
          const postTags = post.tags.split(',');
            // Count each tag
          postTags.forEach((tag: string) => {
            const trimmedTag = tag.trim();
            if (trimmedTag) { // Only count non-empty tags
              const currentCount = tagCounts.get(trimmedTag) || 0;
              tagCounts.set(trimmedTag, currentCount + 1);
            }
          });
        }
      });
      
      // Convert the map to an array of objects sorted alphabetically
      return Array.from(tagCounts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => a.name.localeCompare(b.name));
    });
    
    return result || [];
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}
