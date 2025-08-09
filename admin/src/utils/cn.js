// Helper function to conditionally join CSS class names together
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
