// Helper functions for formatting dates

/**
 * Format date as "DD MMM YYYY" (e.g., "18 Apr 2022")
 */
export function format2DigitMonthDay(date: Date | string | number): string {
  try {
    // Handle null or undefined
    if (date === null || date === undefined) {
      return 'Invalid date';
    }
    
    // Ensure we have a Date object
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString('en-US', { month: 'short' });
    const year = dateObj.getFullYear();
    
    return `${day} ${month} ${year}`;
  } catch (error) {
    console.error('Date formatting error:', error, date);
    return 'Invalid date';
  }
}
