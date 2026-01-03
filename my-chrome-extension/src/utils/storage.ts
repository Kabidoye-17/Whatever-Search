import type { CreateFilterInput, FilterStorage, StoredFilter, Filter, StorageState } from '../types/filters';

const STORAGE_KEY = 'filterStorage';
const LEGACY_STORAGE_KEY = 'filterStates';

/**
 * Generates a unique ID for a new filter
 */
function generateFilterId(): string {
  return 'filter-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

/**
 * Loads the legacy filters.json for migration purposes
 */
async function loadLegacyFilters(): Promise<Filter[]> {
  try {
    // Import the legacy filters.json
    const response = await fetch(chrome.runtime.getURL('filters.json'));
    const data = await response.json();
    return data.filters || [];
  } catch (error) {
    console.error('Failed to load legacy filters:', error);
    return [];
  }
}

/**
 * Migrates from the old storage schema to the new one
 * Only runs once, on first launch with the new version
 */
export async function migrateStorage(): Promise<void> {
  const result = await chrome.storage.sync.get([STORAGE_KEY, LEGACY_STORAGE_KEY]);

  // Already migrated or fresh install
  if (result[STORAGE_KEY]) {
    return;
  }

  // Legacy system exists
  if (result[LEGACY_STORAGE_KEY]) {
    try {
      const oldStates = result[LEGACY_STORAGE_KEY] as StorageState;
      const oldFilters = await loadLegacyFilters();

      const migratedFilters: StoredFilter[] = oldFilters.map(filter => ({
        ...filter,
        enabled: oldStates[filter.id] || false,
        createdAt: Date.now(),
        lastModified: Date.now()
      }));

      const newStorage: FilterStorage = {
        version: 1,
        filters: migratedFilters
      };

      await chrome.storage.sync.set({ [STORAGE_KEY]: newStorage });

      // Clean up old data
      await chrome.storage.sync.remove(LEGACY_STORAGE_KEY);

      console.log('Successfully migrated filters to new storage schema');
    } catch (error) {
      console.error('Migration failed, initializing empty storage:', error);
      await chrome.storage.sync.set({
        [STORAGE_KEY]: {
          version: 1,
          filters: []
        }
      });
    }
  } else {
    // Fresh install - initialize empty
    await chrome.storage.sync.set({
      [STORAGE_KEY]: {
        version: 1,
        filters: []
      }
    });
  }
}

/**
 * Gets all filters from storage
 */
export async function getAllFilters(): Promise<StoredFilter[]> {
  try {
    const result = await chrome.storage.sync.get([STORAGE_KEY]);
    const storage = result[STORAGE_KEY] as FilterStorage;
    return storage?.filters || [];
  } catch (error) {
    console.error('Failed to load filters:', error);
    return [];
  }
}

/**
 * Creates a new filter and saves it to storage
 */
export async function createFilter(input: CreateFilterInput): Promise<StoredFilter> {
  const filters = await getAllFilters();

  // Type must be provided by the user
  if (!input.type) {
    throw new Error('Filter type is required');
  }

  const newFilter: StoredFilter = {
    id: generateFilterId(),
    label: input.label.trim(),
    type: input.type,
    value: input.value.trim(),
    ...(input.param && { param: input.param.trim() }),
    enabled: true,
    createdAt: Date.now(),
    lastModified: Date.now()
  };

  const updatedFilters = [...filters, newFilter];

  await chrome.storage.sync.set({
    [STORAGE_KEY]: {
      version: 1,
      filters: updatedFilters
    }
  });

  return newFilter;
}

/**
 * Deletes a filter by ID
 */
export async function deleteFilter(id: string): Promise<void> {
  const filters = await getAllFilters();
  const updatedFilters = filters.filter(f => f.id !== id);

  await chrome.storage.sync.set({
    [STORAGE_KEY]: {
      version: 1,
      filters: updatedFilters
    }
  });
}

/**
 * Toggles a filter's enabled state
 */
export async function toggleFilter(id: string, enabled: boolean): Promise<void> {
  const filters = await getAllFilters();
  const updatedFilters = filters.map(f =>
    f.id === id
      ? { ...f, enabled, lastModified: Date.now() }
      : f
  );

  await chrome.storage.sync.set({
    [STORAGE_KEY]: {
      version: 1,
      filters: updatedFilters
    }
  });
}

/**
 * Searches/filters filters based on a query string
 */
export function searchFilters(query: string, filters: StoredFilter[]): StoredFilter[] {
  if (!query.trim()) {
    return filters;
  }

  const lowerQuery = query.toLowerCase();
  return filters.filter(f =>
    f.label.toLowerCase().includes(lowerQuery) ||
    f.value.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Subscribes to storage changes
 */
export function subscribeToChanges(callback: (filters: StoredFilter[]) => void): void {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync' && changes[STORAGE_KEY]) {
      const storage = changes[STORAGE_KEY].newValue as FilterStorage;
      callback(storage?.filters || []);
    }
  });
}
