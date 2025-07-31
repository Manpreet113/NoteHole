// GlobalHotkeys.jsx
// Provides global keyboard shortcuts for the app using react-hotkeys
import { GlobalHotKeys } from 'react-hotkeys';
import toast from 'react-hot-toast';
import useModalStore from '../store/useModalStore';
import useSidebarStore from '../store/useSidebarStore';
import useDarkModeStore from '../store/useDarkModeStore';
import useAuthStore from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

// Mapping of action names to keyboard shortcuts
const keyMap = {
  SHOW_SEARCH: 'ctrl+k',
  CREATE_TASK: 'ctrl+shift+t',
  CREATE_IDEA: 'ctrl+shift+i',
  CREATE_THOUGHT: 'ctrl+shift+h',
  SHOW_CHEATSHEET: 'ctrl+/',
  NAV_THOUGHTS: 'ctrl+1',
  NAV_IDEAS: 'ctrl+2',
  NAV_TASKS: 'ctrl+3',
  TOGGLE_SIDEBAR: 'ctrl+b',
  TOGGLE_DARK: 'ctrl+m',
  FOCUS_SEARCH: 'ctrl+l',
  LOGOUT: 'ctrl+q',
};

export default function GlobalHotkeys() {
  // Modal state setters from global store
  const {
    setShowSearch,
    setShowCheatsheet,
  } = useModalStore();
  const { toggleSidebar } = useSidebarStore();
  const { isDark, toggleDarkMode } = useDarkModeStore();
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();

  // Utility: check if user is typing in an input, textarea, or contenteditable
  function isTyping() {
    const active = document.activeElement;
    if (!active) return false;
    const tag = active.tagName;
    return (
      tag === 'INPUT' ||
      tag === 'TEXTAREA' ||
      active.isContentEditable
    );
  }

  // Handlers for each shortcut action
  const handlers = {
    SHOW_SEARCH: () => {
      if (isTyping()) return;
      setShowSearch(true);
      toast('🔍 Search opened', { id: 'shortcut-feedback' });
    },
    CREATE_TASK: () => {
      if (isTyping()) return;
      if (window.location.pathname === '/tasks') {
        const el = document.querySelector('input[placeholder*="task"]');
        if (el) { el.focus(); toast('📝 Focused task input', { id: 'shortcut-feedback' }); }
      } else {
        navigate('/tasks');
        setTimeout(() => {
          const el = document.querySelector('input[placeholder*="task"]');
          if (el) { el.focus(); toast('📝 Focused task input', { id: 'shortcut-feedback' }); }
        }, 300);
      }
    },
    CREATE_IDEA: () => {
      if (isTyping()) return;
      if (window.location.pathname === '/ideas') {
        const el = document.querySelector('input[placeholder*="idea"]');
        if (el) { el.focus(); toast('💡 Focused idea input', { id: 'shortcut-feedback' }); }
      } else {
        navigate('/ideas');
        setTimeout(() => {
          const el = document.querySelector('input[placeholder*="idea"]');
          if (el) { el.focus(); toast('💡 Focused idea input', { id: 'shortcut-feedback' }); }
        }, 300);
      }
    },
    CREATE_THOUGHT: () => {
      if (isTyping()) return;
      if (window.location.pathname === '/thoughts') {
        const el = document.querySelector('input[placeholder*="thought"]');
        if (el) { el.focus(); toast('🧠 Focused thought input', { id: 'shortcut-feedback' }); }
      } else {
        navigate('/thoughts');
        setTimeout(() => {
          const el = document.querySelector('input[placeholder*="thought"]');
          if (el) { el.focus(); toast('🧠 Focused thought input', { id: 'shortcut-feedback' }); }
        }, 300);
      }
    },
    SHOW_CHEATSHEET: () => {
      if (isTyping()) return;
      setShowCheatsheet(true);
      toast('⌨️ Shortcuts cheatsheet opened', { id: 'shortcut-feedback' });
    },
    NAV_THOUGHTS: () => {
      if (isTyping()) return;
      navigate('/thoughts');
      toast('🧠 Navigated to Thoughts', { id: 'shortcut-feedback' });
    },
    NAV_IDEAS: () => {
      if (isTyping()) return;
      navigate('/ideas');
      toast('💡 Navigated to Ideas', { id: 'shortcut-feedback' });
    },
    NAV_TASKS: () => {
      if (isTyping()) return;
      navigate('/tasks');
      toast('📝 Navigated to Tasks', { id: 'shortcut-feedback' });
    },
    TOGGLE_SIDEBAR: () => {
      if (isTyping()) return;
      toggleSidebar();
      toast('📚 Sidebar toggled', { id: 'shortcut-feedback' });
    },
    TOGGLE_DARK: () => {
      if (isTyping()) return;
      toggleDarkMode(!isDark);
      toast(isDark ? '🌞 Light mode' : '🌙 Dark mode', { id: 'shortcut-feedback' });
    },
    FOCUS_SEARCH: () => {
      if (isTyping()) return;
      const el = document.querySelector('input[aria-label="Search the dump"]');
      if (el) { el.focus(); toast('🔍 Focused search bar', { id: 'shortcut-feedback' }); }
    },
    LOGOUT: () => {
      if (isTyping()) return;
      if (user) { signOut(); toast('👋 Logged out', { id: 'shortcut-feedback' }); }
    },
  };

  // Attach global hotkeys to the app
  return <GlobalHotKeys keyMap={keyMap} handlers={handlers} />;
}
