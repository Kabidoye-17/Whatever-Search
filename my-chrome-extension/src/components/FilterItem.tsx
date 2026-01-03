import type { Filter } from '../types/filters';

interface FilterItemProps {
  filter: Filter;
  enabled: boolean;
  onToggle: (filterId: string, enabled: boolean) => void;
}

export default function FilterItem({ filter, enabled, onToggle }: FilterItemProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onToggle(filter.id, e.target.checked);
  };

  return (
    <div className="filter-item">
      <label>
        <input
          type="checkbox"
          checked={enabled}
          onChange={handleChange}
        />
        <span>{filter.label}</span>
      </label>
    </div>
  );
}
