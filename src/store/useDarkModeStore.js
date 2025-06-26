// useDarkModeStore.js
// Zustand store for managing dark/light theme and syncing with localStorage & DOM
import { create } from 'zustand';

const useDarkModeStore = create((set) => ({
  // Whether dark mode is enabled
  isDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
  // Toggle dark mode and update DOM/localStorage
  toggleDarkMode: () => set((state) => {
    const newValue = !state.isDark;
    if (newValue) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', newValue ? 'dark' : 'light');
    return { isDark: newValue };
  }),
  // Set dark mode explicitly and update DOM/localStorage
  setDarkMode: (value) => set(() => {
    if (value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', value ? 'dark' : 'light');
    return { isDark: value };
  }),
}));

// On load, sync theme from localStorage if present
const saved = localStorage.getItem('theme');
if (saved) {
  useDarkModeStore.getState().setDarkMode(saved === 'dark');
}

export default useDarkModeStore;