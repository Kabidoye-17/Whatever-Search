import type { CreateFilterInput, StoredFilter, ValidationResult } from '../types/filters';

/**
 * Validates filter input before creation or update
 *
 * @param input - The filter input to validate
 * @param existingFilters - Array of existing filters to check for duplicates
 * @param excludeId - Optional filter ID to exclude from duplicate check (for edits)
 * @returns Validation result with isValid flag and optional error message
 */
export function validateFilterInput(
  input: CreateFilterInput,
  existingFilters: StoredFilter[],
  excludeId?: string
): ValidationResult {
  // 1. Required fields
  if (!input.label?.trim()) {
    return { isValid: false, error: 'Label is required' };
  }

  if (!input.value?.trim()) {
    return { isValid: false, error: 'Value is required' };
  }

  // 2. Length limits
  if (input.label.length > 50) {
    return { isValid: false, error: 'Label must be 50 characters or less' };
  }

  if (input.value.length > 200) {
    return { isValid: false, error: 'Value must be 200 characters or less' };
  }

  // 3. URL param validation
  if (input.type === 'url-param') {
    if (!input.param?.trim()) {
      return { isValid: false, error: 'Parameter name is required for URL params' };
    }

    if (!/^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(input.param)) {
      return { isValid: false, error: 'Invalid parameter name format' };
    }
  }

  // 4. Duplicate detection (by value + type combo)
  const duplicate = existingFilters.find(f => {
    if (excludeId && f.id === excludeId) {
      return false; // Skip the filter being edited
    }

    const sameType = f.type === input.type;
    const sameValue = f.value.toLowerCase() === input.value.toLowerCase().trim();
    const sameParam = input.type === 'url-param' ? f.param === input.param : true;

    return sameType && sameValue && sameParam;
  });

  if (duplicate) {
    return { isValid: false, error: 'A similar filter already exists' };
  }

  return { isValid: true };
}
