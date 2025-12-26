// Utility to trigger stats refresh across the application
export const refreshStats = () => {
  // Dispatch a custom event that components can listen to
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('statsRefresh'));
  }
};

// Hook to listen for stats refresh events
export const useStatsRefresh = (callback: () => void) => {
  if (typeof window !== 'undefined') {
    const handleRefresh = () => callback();
    window.addEventListener('statsRefresh', handleRefresh);
    return () => window.removeEventListener('statsRefresh', handleRefresh);
  }
  return () => {};
};