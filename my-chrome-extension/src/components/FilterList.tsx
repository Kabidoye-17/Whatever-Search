import type { StoredFilter } from '../types/filters';
import FilterItem from './FilterItem';
import { EmptyState } from './EmptyState';

interface FilterListProps {
  filters: StoredFilter[];
  onToggle: (filterId: string, enabled: boolean) => void;
  onDelete: (filterId: string) => void;
  isSearching?: boolean;
}

export default function FilterList({ filters, onToggle, onDelete, isSearching = false }: FilterListProps) {
  if (filters.length === 0) {
    return <EmptyState isSearching={isSearching} />;
  }

  return (
    <div className="filter-list">
      {filters.map(filter => (
        <FilterItem
          key={filter.id}
          filter={filter}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
