import { Trash } from '@phosphor-icons/react/dist/ssr';
import type { StoredFilter } from '../types/filters';

interface FilterItemProps {
  filter: StoredFilter;
  onToggle: (filterId: string, enabled: boolean) => void;
  onDelete: (filterId: string) => void;
}

export default function FilterItem({ filter, onToggle, onDelete }: FilterItemProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onToggle(filter.id, e.target.checked);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${filter.label}"?`)) {
      onDelete(filter.id);
    }
  };

  return (
    <div className="filter-item">
      <input
        type="checkbox"
        checked={filter.enabled}
        onChange={handleChange}
        aria-label={`Toggle ${filter.label}`}
      />

      <div className="filter-content">
        <div className="filter-header">
          <span className={`filter-type-badge ${filter.type}`}>
            {filter.type === 'query' ? 'Query' : 'URL Param'}
          </span>
          <span className="filter-label" title={filter.label}>{filter.label}</span>
        </div>

        <div className="filter-value" title={filter.type === 'url-param' && filter.param ? `${filter.param}=${filter.value}` : filter.value}>
          {filter.type === 'url-param' && filter.param && (
            <span>{filter.param}=</span>
          )}
          {filter.value}
        </div>
      </div>

      <button
        className="delete-btn"
        onClick={handleDelete}
        aria-label={`Delete ${filter.label}`}
        title="Delete filter"
      >
        <Trash size={16} weight="regular" />
      </button>
    </div>
  );
}
