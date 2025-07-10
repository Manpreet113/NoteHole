// useSearchStore.js
// Zustand store for managing global search query and combined search data
import { create } from 'zustand';

const useSearchStore = create((set) => ({
  // Current global search query
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Individual page data for search
  ideas: [],
  tasks: [],
  thoughts: [],

  // Actions to update individual page data
  setIdeas: (ideas) => set({ ideas }),
  setTasks: (tasks) => set({ tasks }),
  setThoughts: (thoughts) => set({ thoughts }),
}));

export default useSearchStore;
