import type { FilterConfig, StorageState } from '../types/filters';
import { applyFilters } from '../utils/urlModifier';

const PROCESSED_KEY = 'searchFilterProcessed';

async function loadFilters(): Promise<FilterConfig> {
  const response = await fetch(chrome.runtime.getURL('filters.json'));
  return response.json();
}

async function getFilterStates(): Promise<StorageState> {
  const result = await chrome.storage.sync.get(['filterStates']);
  return (result.filterStates as StorageState) || ({} as StorageState);
}

async function modifySearchUrl(): Promise<void> {
  // Check if we've already processed this URL
  const currentUrl = window.location.href;
  const processedUrl = sessionStorage.getItem(PROCESSED_KEY);

  if (processedUrl === currentUrl) {
    return; // Already processed, avoid infinite loop
  }

  try {
    // Load filters and enabled states
    const filterConfig = await loadFilters();
    const enabledStates = await getFilterStates();

    // Apply filters to current URL
    const url = new URL(window.location.href);
    const modifiedUrl = applyFilters(url, filterConfig.filters, enabledStates);

    // Only navigate if URL actually changed
    if (modifiedUrl.href !== url.href) {
      // Mark this URL as processed before navigating
      sessionStorage.setItem(PROCESSED_KEY, modifiedUrl.href);
      window.location.replace(modifiedUrl.href);
    } else {
      // Mark current URL as processed even if no changes
      sessionStorage.setItem(PROCESSED_KEY, currentUrl);
    }
  } catch (error) {
    console.error('Error modifying search URL:', error);
  }
}

// Run on page load
if (window.location.pathname === '/search') {
  modifySearchUrl();
}

// Listen for storage changes and reapply filters
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.filterStates) {
    // Clear the processed flag when filter states change
    sessionStorage.removeItem(PROCESSED_KEY);
    // Reapply filters with new settings
    if (window.location.pathname === '/search') {
      modifySearchUrl();
    }
  }
});
