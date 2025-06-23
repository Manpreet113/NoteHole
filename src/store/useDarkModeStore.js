import { create } from 'zustand';

const useDarkModeStore = create((set) => ({
  isDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
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

const saved = localStorage.getItem('theme');
if (saved) {
  useDarkModeStore.getState().setDarkMode(saved === 'dark');
}

export default useDarkModeStore;