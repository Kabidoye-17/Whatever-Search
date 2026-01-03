export type FilterType = 'query' | 'url-param';

export interface BaseFilter {
  id: string;
  label: string;
}

export interface QueryFilter extends BaseFilter {
  type: 'query';
  value: string;
}

export interface UrlParamFilter extends BaseFilter {
  type: 'url-param';
  param: string;
  value: string;
}

export type Filter = QueryFilter | UrlParamFilter;

export interface FilterConfig {
  filters: Filter[];
}

export interface StorageState {
  [filterId: string]: boolean;
}

// New types for dynamic filter management
export interface StoredFilter extends Omit<Filter, 'type'> {
  type: FilterType;
  param?: string;
  value: string;
  enabled: boolean;
  createdAt: number;
  lastModified: number;
}

export interface FilterStorage {
  version: number;
  filters: StoredFilter[];
}

export interface CreateFilterInput {
  label: string;
  value: string;
  type?: FilterType;
  param?: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface DetectionResult {
  type: FilterType;
  param?: string;
  cleanValue: string;
}
