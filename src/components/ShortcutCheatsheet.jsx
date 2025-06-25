import { Dialog } from '@headlessui/react';
import useModalStore from '../store/useModalStore';
import { Fragment } from 'react';

const shortcuts = [
  { keys: 'Ctrl + K', action: 'Open Global Search' },
  { keys: 'Ctrl + Shift + T', action: 'Create Task' },
  { keys: 'Ctrl + Shift + I', action: 'Create Idea' },
  { keys: 'Ctrl + Shift + H', action: 'Create Thought' },
  { keys: 'Ctrl + /', action: 'Show Shortcuts' },
  { keys: 'Esc', action: 'Close Modals' },
];

export default function ShortcutCheatsheet() {
  const { showCheatsheet, setShowCheatsheet } = useModalStore();

  return (
    <Dialog
      open={showCheatsheet}
      onClose={() => setShowCheatsheet(false)}
      as={Fragment}
    >
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />

        {/* Panel */}
        <Dialog.Panel className="relative z-10 bg-white dark:bg-gray-900 p-6 rounded-2xl w-full max-w-md shadow-2xl">
          <Dialog.Title className="text-xl font-semibold mb-4">
            ⌨️ Keyboard Shortcuts
          </Dialog.Title>

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