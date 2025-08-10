/**
 * Format a date to a relative time string (e.g., "2 hours ago")
 * @param {string|Date} dateString - The date to format
 * @returns {string} A string representing the relative time
 */
export const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now - date) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  const weeks = Math.round(days / 7);
  const months = Math.round(days / 30);
  const years = Math.round(days / 365);

  if (seconds < 60) {
    return seconds <= 1 ? 'just now' : `${seconds} seconds ago`;
  } else if (minutes < 60) {
    return minutes === 1 ? 'a minute ago' : `${minutes} minutes ago`;
  } else if (hours < 24) {
    return hours === 1 ? 'an hour ago' : `${hours} hours ago`;
  } else if (days < 7) {
    return days === 1 ? 'yesterday' : `${days} days ago`;
  } else if (weeks < 4) {
    return weeks === 1 ? 'a week ago' : `${weeks} weeks ago`;
  } else if (months < 12) {
    return months === 1 ? 'a month ago' : `${months} months ago`;
  } else {
    return years === 1 ? 'a year ago' : `${years} years ago`;
  }
};
