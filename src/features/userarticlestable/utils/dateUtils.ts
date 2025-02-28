/**
 * Utility functions for date formatting and calculations
 */

/**
 * Converts a date to a relative time string (e.g., "2d", "5h")
 * @param dateString - The date string to convert
 * @param fallbackDate - Fallback date string to use if dateString is undefined
 * @returns A formatted relative time string
 */
export const getRelativeTime = (dateString: string | undefined, fallbackDate: string): string => {
  const date = dateString ? new Date(dateString) : new Date(fallbackDate);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals = [
    { label: "y", seconds: 365 * 24 * 60 * 60 },
    { label: "m", seconds: 30 * 24 * 60 * 60 },
    { label: "d", seconds: 24 * 60 * 60 },
    { label: "h", seconds: 60 * 60 },
    { label: "m", seconds: 60 },
    { label: "s", seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return `${count}${interval.label}`;
    }
  }
  return "just now";
}; 