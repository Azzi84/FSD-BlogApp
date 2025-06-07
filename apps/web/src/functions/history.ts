export type HistoryItem = {
  month: number; // 1-12
  year: number;
  count: number;
};

export function history(posts: { date: Date; active: boolean }[]): HistoryItem[] {
  // Filter active posts only
  const activePosts = posts.filter(post => post.active);
  
  // Group posts by year and month
  const postsByYearAndMonth = new Map<string, { month: number; year: number; count: number }>();
  
  activePosts.forEach(post => {
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
}
