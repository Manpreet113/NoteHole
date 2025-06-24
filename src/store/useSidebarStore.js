import { create } from 'zustand';

// Zustand store to manage sidebar open/collapse state (for both desktop and mobile)
const useSidebarStore = create((set) => ({
  isExpanded: false, // Default collapsed (especially for mobile)

  // Toggles between open/close
  toggleSidebar: () =>
    set((state) => ({ isExpanded: !state.isExpanded })),

  // Force open (can be used for desktop or nav buttons)
  expandSidebar: () => set({ isExpanded: true }),

  // Force collapse (especially useful on mobile or after navigation)
  collapseSidebar: () => set({ isExpanded: false }),
}));

export default useSidebarStore;