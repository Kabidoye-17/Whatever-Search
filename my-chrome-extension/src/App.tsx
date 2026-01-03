import { useEffect, useState } from 'react';
import type { StoredFilter, CreateFilterInput } from './types/filters';
import {
  migrateStorage,
  getAllFilters,
  createFilter,
  deleteFilter,
  toggleFilter,
  searchFilters,
  subscribeToChanges
} from './utils/storage';
import FilterList from './components/FilterList';
import { SearchBar } from './components/SearchBar';
import { AddFilterButton } from './components/AddFilterButton';
import { AddFilterModal } from './components/AddFilterModal';
import './App.css';

function App() {
  const [filters, setFilters] = useState<StoredFilter[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Migrate storage and load filters
    async function loadData() {
      try {
        await migrateStorage();
        const loadedFilters = await getAllFilters();
        setFilters(loadedFilters);
      } catch (error) {
        console.error('Error loading filters:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    // Subscribe to storage changes
    subscribeToChanges((newFilters) => {
      setFilters(newFilters);
    });
  }, []);

  const handleToggle = async (filterId: string, enabled: boolean) => {
    // Optimistic update
    setFilters(prev => prev.map(f =>
      f.id === filterId ? { ...f, enabled } : f
    ));

    try {
      await toggleFilter(filterId, enabled);
    } catch (error) {
      console.error('Error toggling filter:', error);
      // Revert on error
      const loadedFilters = await getAllFilters();
      setFilters(loadedFilters);
    }
  };

  const handleCreateFilter = async (input: CreateFilterInput) => {
    try {
      await createFilter(input);
      // Storage subscription will update the filters state
    } catch (error) {
      console.error('Error creating filter:', error);
      throw error;
    }
  };

  const handleDeleteFilter = async (filterId: string) => {
    // Optimistic update
    setFilters(prev => prev.filter(f => f.id !== filterId));

    try {
      await deleteFilter(filterId);
    } catch (error) {
      console.error('Error deleting filter:', error);
      // Revert on error
      const loadedFilters = await getAllFilters();
      setFilters(loadedFilters);
    }
  };

  // Filter the filters based on search query
  const filteredFilters = searchFilters(searchQuery, filters);

  if (loading) {
    return <div className="app">Loading...</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Find Me.</h1>
      </header>

      <div className="app-content">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
        />

        <AddFilterButton onClick={() => setIsAddModalOpen(true)} />

        <FilterList
          filters={filteredFilters}
          onToggle={handleToggle}
          onDelete={handleDeleteFilter}
          isSearching={searchQuery.length > 0}
        />
      </div>

      <AddFilterModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleCreateFilter}
        existingFilters={filters}
      />
    </div>
  );
}

export default App;
