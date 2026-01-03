import type { Filter, QueryFilter, UrlParamFilter, StorageState } from '../types/filters';

export function applyQueryFilter(url: URL, filter: QueryFilter): URL {
  const params = new URLSearchParams(url.search);
  const currentQuery = params.get('q') || '';

  // Avoid double-adding if the filter value is already in the query
  if (!currentQuery.includes(filter.value)) {
    const newQuery = `${currentQuery} ${filter.value}`.trim();
    params.set('q', newQuery);
  }

  const newUrl = new URL(url);
  newUrl.search = params.toString();
  return newUrl;
}

export function applyUrlParamFilter(url: URL, filter: UrlParamFilter): URL {
  const params = new URLSearchParams(url.search);
  params.set(filter.param, filter.value);

  const newUrl = new URL(url);
  newUrl.search = params.toString();
  return newUrl;
}

export function hasFilterBeenApplied(url: URL, filter: Filter): boolean {
  const params = new URLSearchParams(url.search);

  if (filter.type === 'query') {
    const currentQuery = params.get('q') || '';
    return currentQuery.includes(filter.value);
  } else if (filter.type === 'url-param') {
    return params.get(filter.param) === filter.value;
  }

  return false;
}

export function applyFilters(
  url: URL,
  filters: Filter[],
  enabledStates: StorageState
): URL {
  let modifiedUrl = new URL(url);

  filters.forEach(filter => {
    // Only apply if enabled and not already applied
    if (enabledStates[filter.id] && !hasFilterBeenApplied(modifiedUrl, filter)) {
      if (filter.type === 'query') {
        modifiedUrl = applyQueryFilter(modifiedUrl, filter);
      } else if (filter.type === 'url-param') {
        modifiedUrl = applyUrlParamFilter(modifiedUrl, filter);
      }
    }
  });

  return modifiedUrl;
}
