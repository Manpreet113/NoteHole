import { GlobalHotKeys } from 'react-hotkeys';
import toast from 'react-hot-toast';
import useModalStore from '../store/useModalStore';

const keyMap = {
  SHOW_SEARCH: 'ctrl+k',
  CREATE_TASK: 'ctrl+shift+t',
  CREATE_IDEA: 'ctrl+shift+i',
  CREATE_THOUGHT: 'ctrl+shift+h',
};

const handlers = {
  SHOW_SEARCH: () => setShowSearch(true),
  CREATE_TASK: () => toast("📝 Create Task"),
  CREATE_IDEA: () => toast("💡 Create Idea"),
  CREATE_THOUGHT: () => toast("🧠 Create Thought"),
};

export default function GlobalHotkeys() {
  const { setShowSearch } = useModalStore();
  return <GlobalHotKeys keyMap={keyMap} handlers={handlers} />;
}
