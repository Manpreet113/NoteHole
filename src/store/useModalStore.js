import { create } from 'zustand';

const useModalStore = create((set) => ({
  showSearch: false,
  setShowSearch: (value) => set({ showSearch: value }),

  showCheatsheet: false,
  setShowCheatsheet: (value) => set({ showCheatsheet: value }),
}));

export default useModalStore;
