import { Dialog } from '@headlessui/react';
import useModalStore from './store/useModalStore';

const shortcuts = [
  { keys: 'Ctrl + K', action: 'Open Global Search' },
  { keys: 'Ctrl + Shift + T', action: 'Create Task' },
  { keys: 'Ctrl + Shift + I', action: 'Create Idea' },
  { keys: 'Ctrl + Shift + H', action: 'Create Thought' },
  { keys: 'Esc', action: 'Close Modals' },
];

export default function ShortcutCheatsheet() {
  const { showCheatsheet, setShowCheatsheet } = useModalStore();

  return (
    <Dialog open={showCheatsheet} onClose={() => setShowCheatsheet(false)} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen bg-black/50">
        <Dialog.Panel className="bg-white dark:bg-gray-900 p-6 rounded-2xl w-full max-w-md shadow-xl">
          <Dialog.Title className="text-xl font-semibold mb-4">⌨️ Keyboard Shortcuts</Dialog.Title>
          <ul className="space-y-2">
            {shortcuts.map((s, idx) => (
              <li key={idx} className="flex justify-between">
                <span className="font-mono">{s.keys}</span>
                <span className="text-gray-600 dark:text-gray-300">{s.action}</span>
              </li>
            ))}
          </ul>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
