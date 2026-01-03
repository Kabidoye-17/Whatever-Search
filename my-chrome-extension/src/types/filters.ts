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
