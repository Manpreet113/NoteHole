// useSearchStore.js
// Zustand store for managing global search query and combined search data
import { create } from 'zustand';

const useSearchStore = create((set) => ({
  // Current global search query
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Combined data from all sources (tasks, thoughts, ideas)
  combinedData: [], // merged list of tasks/thoughts/ideas
  setCombinedData: (data) => set({ combinedData: data }),
}));

export default useSearchStore;
