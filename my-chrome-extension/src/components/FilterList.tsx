import type { Filter, StorageState } from '../types/filters';
import FilterItem from './FilterItem';

interface FilterListProps {
  filters: Filter[];
  enabledStates: StorageState;
  onToggle: (filterId: string, enabled: boolean) => void;
}

export default function FilterList({ filters, enabledStates, onToggle }: FilterListProps) {
  return (
    <div className="filter-list">
      {filters.map(filter => (
        <FilterItem
          key={filter.id}
          filter={filter}
          enabled={enabledStates[filter.id] || false}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}
