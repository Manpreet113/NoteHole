// useModalStore.js
// Zustand store for managing modal visibility (search and cheatsheet modals)
import { create } from 'zustand';

const useModalStore = create((set) => ({
  // Controls visibility of the search modal
  showSearch: false,
  setShowSearch: (value) => set({ showSearch: value }),

  // Controls visibility of the shortcut cheatsheet modal
  showCheatsheet: false,
  setShowCheatsheet: (value) => set({ showCheatsheet: value }),
}));

export default useModalStore;
