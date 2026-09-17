// Utility functions and helper methods
export function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
}
