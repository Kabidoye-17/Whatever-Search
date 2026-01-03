import { useEffect, useState } from 'react';
import type { Filter, FilterConfig, StorageState } from './types/filters';
import { getFilterStates, setFilterState, initializeStorage, subscribeToChanges } from './utils/storage';
import FilterList from './components/FilterList';
import filterConfigData from './filters.json';
import './App.css';

function App() {
  const [filters] = useState<Filter[]>((filterConfigData as FilterConfig).filters);
  const [enabledStates, setEnabledStates] = useState<StorageState>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize storage and load filter states
    async function loadData() {
      try {
        await initializeStorage(filters);
        const states = await getFilterStates();
        setEnabledStates(states);
      } catch (error) {
        console.error('Error loading filter states:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    // Subscribe to storage changes
    subscribeToChanges((newStates) => {
      setEnabledStates(newStates);
    });
  }, [filters]);

  const handleToggle = async (filterId: string, enabled: boolean) => {
    // Optimistic update
    setEnabledStates(prev => ({ ...prev, [filterId]: enabled }));

    try {
      await setFilterState(filterId, enabled);
    } catch (error) {
      console.error('Error saving filter state:', error);
      // Revert on error
      const states = await getFilterStates();
      setEnabledStates(states);
    }
  };

  if (loading) {
    return <div className="app">Loading...</div>;
  }

  return (
    <div className="app">
      <h1>Search Filters</h1>
      <p className="description">Select filters to apply to your Google searches</p>
      <FilterList
        filters={filters}
        enabledStates={enabledStates}
        onToggle={handleToggle}
      />
    </div>
  );
}

export default App;
