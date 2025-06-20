import { create } from 'zustand';

// Zustand store to manage the state of sidebar expansion
const useSidebarStore = create((set) => ({
  isExpanded: false, // Sidebar starts collapsed
  toggleSidebar: () => set((state) => ({ isExpanded: !state.isExpanded })), // Toggle the sidebar state
  expandSidebar: () => set({ isExpanded: true }), // Explicitly expand
  collapseSidebar: () => set({ isExpanded: false }), // Explicitly collapse
}));

export default useSidebarStore;
