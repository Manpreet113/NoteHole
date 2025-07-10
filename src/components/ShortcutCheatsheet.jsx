// ShortcutCheatsheet.jsx
// Modal dialog that displays a list of available keyboard shortcuts
import { Dialog } from '@headlessui/react';
import useModalStore from '../store/useModalStore';
import { Fragment } from 'react';

// List of shortcut keys and their actions
const shortcuts = [
  { keys: 'Ctrl + K', action: 'Open Global Search' },
  { keys: 'Ctrl + Shift + T', action: 'Create Task' },
  { keys: 'Ctrl + Shift + I', action: 'Create Idea' },
  { keys: 'Ctrl + Shift + H', action: 'Create Thought' },
  { keys: 'Ctrl + /', action: 'Show Shortcuts' },
  { keys: 'Esc', action: 'Close Modals' },
];

export default function ShortcutCheatsheet() {
  // Modal visibility state from global store
  const { showCheatsheet, setShowCheatsheet } = useModalStore();

  return (
    <Dialog
      open={showCheatsheet}
      onClose={() => setShowCheatsheet(false)}
      as={Fragment}
    >
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Overlay for background blur */}
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />

        {/* Modal panel with shortcuts list */}
        <Dialog.Panel className="relative z-10 bg-white dark:bg-gray-900 p-6 rounded-2xl w-full max-w-md shadow-2xl">
          <Dialog.Title className="text-xl font-semibold mb-4">
            {/* Keyboard icon and title */}
             Keyboard Shortcuts
          </Dialog.Title>

          {/* List of shortcuts */}
          <ul className="space-y-2">
            {shortcuts.map((s, idx) => (
              <li key={idx} className="flex justify-between items-center">
                <span className="font-mono text-sm">{s.keys}</span>
                <span className="text-gray-700 dark:text-gray-300 text-sm">
                  {s.action}
                </span>
              </li>
            ))}
          </ul>

          {/* Close button (top-right) */}
          <button
            onClick={() => setShowCheatsheet(false)}
            className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-xl"
          >
            ×
          </button>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}