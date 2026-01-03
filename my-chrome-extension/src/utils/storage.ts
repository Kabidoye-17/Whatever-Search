import type { Filter, StorageState } from '../types/filters';

const STORAGE_KEY = 'filterStates';

export async function getFilterStates(): Promise<StorageState> {
  const result = await chrome.storage.sync.get([STORAGE_KEY]);
  return (result[STORAGE_KEY] as StorageState) || ({} as StorageState);
}

export async function setFilterState(filterId: string, enabled: boolean): Promise<void> {
  const currentStates = await getFilterStates();
  currentStates[filterId] = enabled;
  await chrome.storage.sync.set({ [STORAGE_KEY]: currentStates });
}

export async function initializeStorage(filters: Filter[]): Promise<void> {
  const currentStates = await getFilterStates();

  // Only initialize filters that don't have a state yet
  let hasChanges = false;
  const newStates = { ...currentStates };

  filters.forEach(filter => {
    if (!(filter.id in currentStates)) {
      newStates[filter.id] = false;
      hasChanges = true;
    }
  });

  if (hasChanges) {
    await chrome.storage.sync.set({ [STORAGE_KEY]: newStates });
  }
}

export function subscribeToChanges(callback: (changes: StorageState) => void): void {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync' && changes[STORAGE_KEY]) {
      callback((changes[STORAGE_KEY].newValue as StorageState) || ({} as StorageState));
    }
  });
}
