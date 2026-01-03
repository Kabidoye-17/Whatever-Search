import { FunnelSimple, MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';

interface EmptyStateProps {
  message?: string;
  isSearching?: boolean;
}

export function EmptyState({
  message,
  isSearching = false
}: EmptyStateProps) {
  const defaultMessage = isSearching
    ? 'No filters match your search'
    : 'No filters yet';

  const subMessage = isSearching
    ? 'Try a different search term'
    : 'Create your first custom filter to get started';

  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        {isSearching ? (
          <MagnifyingGlass size={48} weight="thin" />
        ) : (
          <FunnelSimple size={48} weight="thin" />
        )}
      </div>
      <p className="empty-state-message">{message || defaultMessage}</p>
      <p className="empty-state-submessage">{subMessage}</p>
    </div>
  );
}
