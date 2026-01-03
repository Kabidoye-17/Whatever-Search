import { useState, useEffect } from 'react';
import { X } from '@phosphor-icons/react/dist/ssr';
import type { CreateFilterInput, StoredFilter, FilterType } from '../types/filters';
import { validateFilterInput } from '../utils/validation';

interface AddFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: CreateFilterInput) => Promise<void>;
  existingFilters: StoredFilter[];
}

export function AddFilterModal({ isOpen, onClose, onSave, existingFilters }: AddFilterModalProps) {
  const [label, setLabel] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('query');
  const [value, setValue] = useState('');
  const [param, setParam] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setLabel('');
      setFilterType('query');
      setValue('');
      setParam('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Build input object
    const input: CreateFilterInput = {
      label,
      type: filterType,
      value,
      ...(filterType === 'url-param' && { param })
    };

    // Validate input
    const validation = validateFilterInput(input, existingFilters);

    if (!validation.isValid) {
      setError(validation.error || 'Invalid input');
      return;
    }

    try {
      setIsSaving(true);
      await onSave(input);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save filter');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <div className="modal-header">
          <h2>Add New Filter</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={16} weight="bold" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="filter-label">Label</label>
            <input
              id="filter-label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              maxLength={50}
              autoFocus
              required
            />
            <span className="form-hint">{label.length}/50 characters</span>
          </div>

          <div className="form-group">
            <label htmlFor="filter-type">Filter Type</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="filterType"
                  value="query"
                  checked={filterType === 'query'}
                  onChange={(e) => setFilterType(e.target.value as FilterType)}
                />
                <div className="radio-label">
                  <strong>Search Term</strong>
                  <span className="radio-description">Adds text to your search query</span>
                </div>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="filterType"
                  value="url-param"
                  checked={filterType === 'url-param'}
                  onChange={(e) => setFilterType(e.target.value as FilterType)}
                />
                <div className="radio-label">
                  <strong>URL Parameter</strong>
                  <span className="radio-description">Adds a parameter to the search URL</span>
                </div>
              </label>
            </div>
          </div>

          {filterType === 'url-param' && (
            <div className="form-group">
              <label htmlFor="filter-param">Parameter Name</label>
              <input
                id="filter-param"
                type="text"
                value={param}
                onChange={(e) => setParam(e.target.value)}
                maxLength={50}
                required
              />
              <span className="form-hint">The URL parameter key </span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="filter-value">
              {filterType === 'query' ? 'Search Term' : 'Parameter Value'}
            </label>
            <input
              id="filter-value"
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              maxLength={200}
              required
            />
            <span className="form-hint">
              {filterType === 'query'
                ? 'Text to append to your search'
                : `The value for the parameter`
              }
            </span>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Add Filter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
