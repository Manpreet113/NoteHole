import { create } from 'zustand';

const useSearchStore = create((set) => ({
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  combinedData: [], // merged list of tasks/thoughts/ideas
  setCombinedData: (data) => set({ combinedData: data }),
}));

export default useSearchStore;
