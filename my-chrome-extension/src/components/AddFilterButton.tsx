import { PlusCircle } from '@phosphor-icons/react/dist/ssr';

interface AddFilterButtonProps {
  onClick: () => void;
}

export function AddFilterButton({ onClick }: AddFilterButtonProps) {
  return (
    <button className="add-filter-btn" onClick={onClick}>
      <PlusCircle className="add-filter-icon" size={18} weight="bold" />
      Add Filter
    </button>
  );
}
