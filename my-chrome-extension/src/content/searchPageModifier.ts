import type { StoredFilter, FilterStorage, Filter } from '../types/filters';
import { applyFilters } from '../utils/urlModifier';

const PROCESSED_KEY = 'searchFilterProcessed';
const STORAGE_KEY = 'filterStorage';

async function getAllFilters(): Promise<StoredFilter[]> {
  try {
    const result = await chrome.storage.sync.get([STORAGE_KEY]);
    const storage = result[STORAGE_KEY] as FilterStorage;
    return storage?.filters || [];
  } catch (error) {
    console.error('Failed to load filters:', error);
    return [];
  }
}

async function modifySearchUrl(): Promise<void> {
  // Check if we've already processed this URL
  const currentUrl = window.location.href;
  const processedUrl = sessionStorage.getItem(PROCESSED_KEY);

  if (processedUrl === currentUrl) {
    return; // Already processed, avoid infinite loop
  }

  try {
    // Load all filters (already includes enabled state)
    const allFilters = await getAllFilters();

    // Filter to only enabled filters
    const enabledFilters = allFilters.filter(f => f.enabled);

    // Build legacy-compatible enabledStates object for applyFilters
    const enabledStates: Record<string, boolean> = {};
    enabledFilters.forEach(f => {
      enabledStates[f.id] = true;
    });

    // Apply filters to current URL
    // Cast to Filter[] since StoredFilter is compatible with Filter union type
    const url = new URL(window.location.href);
    const modifiedUrl = applyFilters(url, enabledFilters as Filter[], enabledStates);

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
  if (areaName === 'sync' && changes[STORAGE_KEY]) {
    // Clear the processed flag when filter storage changes
    sessionStorage.removeItem(PROCESSED_KEY);
    // Reapply filters with new settings
    if (window.location.pathname === '/search') {
      modifySearchUrl();
    }
  }
});
