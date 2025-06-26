// GlobalHotkeys.jsx
// Provides global keyboard shortcuts for the app using react-hotkeys
import { GlobalHotKeys } from 'react-hotkeys';
import toast from 'react-hot-toast';
import useModalStore from '../store/useModalStore';

// Mapping of action names to keyboard shortcuts
const keyMap = {
  SHOW_SEARCH: 'ctrl+k',
  CREATE_TASK: 'ctrl+shift+t',
  CREATE_IDEA: 'ctrl+shift+i',
  CREATE_THOUGHT: 'ctrl+shift+h',
  SHOW_CHEATSHEET: 'ctrl+/',
};

export default function GlobalHotkeys() {
  // Modal state setters from global store
  const {
    setShowSearch,
    setShowCheatsheet,
  } = useModalStore();

  // Handlers for each shortcut action
  const handlers = {
    SHOW_SEARCH: () => setShowSearch(true), // Open search modal
    CREATE_TASK: () => toast("📝 Create Task"), // Show toast for task creation
    CREATE_IDEA: () => toast("💡 Create Idea"), // Show toast for idea creation
    CREATE_THOUGHT: () => toast("🧠 Create Thought"), // Show toast for thought creation
    SHOW_CHEATSHEET: () => setShowCheatsheet(true), // Open shortcuts cheatsheet
  };

  // Attach global hotkeys to the app
  return <GlobalHotKeys keyMap={keyMap} handlers={handlers} />;
}
