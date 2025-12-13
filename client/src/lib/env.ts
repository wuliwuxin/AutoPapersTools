/**
 * Environment detection utilities
 */

/**
 * Check if the app is running in GitHub Pages static mode
 * In GitHub Pages, there's no backend API available
 */
export function isGitHubPages(): boolean {
  // Check if we're in production and the URL contains github.io
  if (typeof window === 'undefined') return false;
  
  const hostname = window.location.hostname;
  return hostname.includes('github.io');
}

/**
 * Check if backend API is available
 */
export function hasBackendAPI(): boolean {
  return !isGitHubPages();
}

/**
 * Get the deployment environment
 */
export function getDeploymentEnv(): 'development' | 'github-pages' | 'production' {
  if (typeof window === 'undefined') return 'development';
  
  if (isGitHubPages()) return 'github-pages';
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'development';
  }
  return 'production';
}
