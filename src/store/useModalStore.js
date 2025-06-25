import { create } from 'zustand';

const useModalStore = create((set) => ({
  showSearch: false,
  setShowSearch: (value) => set({ showSearch: value }),
}));

export default useModalStore;
