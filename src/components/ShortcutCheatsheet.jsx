// ShortcutCheatsheet.jsx
// Modal dialog that displays a list of available keyboard shortcuts
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import useModalStore from '../store/useModalStore';
import { Fragment } from 'react';

// List of shortcut keys and their actions
const shortcuts = [
  { keys: 'Ctrl + K', action: 'Open Global Search' },
  { keys: 'Ctrl + L', action: 'Focus Search Bar' },
  { keys: 'Ctrl + Shift + T', action: 'Create Task (focus input)' },
  { keys: 'Ctrl + Shift + I', action: 'Create Idea (focus input)' },
  { keys: 'Ctrl + Shift + H', action: 'Create Thought (focus input)' },
  { keys: 'Ctrl + 1', action: 'Go to Thoughts' },
  { keys: 'Ctrl + 2', action: 'Go to Ideas' },
  { keys: 'Ctrl + 3', action: 'Go to Tasks' },
  { keys: 'Ctrl + B', action: 'Toggle Sidebar' },
  { keys: 'Ctrl + M', action: 'Toggle Dark Mode' },
  { keys: 'Ctrl + Q', action: 'Log Out' },
  { keys: 'Ctrl + /', action: 'Show Shortcuts' },
  { keys: 'Esc', action: 'Close Modals' },
];

export default function ShortcutCheatsheet() {
  // Modal visibility state from global store
  const { showCheatsheet, setShowCheatsheet } = useModalStore();

  return (
    <AnimatePresence>
      {showCheatsheet && (
        <Dialog
          open={showCheatsheet}
          onClose={() => setShowCheatsheet(false)}
          as={Fragment}
        >
          <div className="fixed inset-0 z-50 flex items-center justify-center px-2 sm:px-0">
            {/* Overlay for background blur */}
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
            {/* Modal panel with shortcuts list */}
            <Dialog.Panel as={motion.div}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="relative z-10 bg-white dark:bg-gray-900 p-3 sm:p-6 rounded-2xl w-full max-w-xs sm:max-w-md shadow-2xl"
            >
              <Dialog.Title className="text-lg sm:text-xl font-semibold mb-4">
                {/* Keyboard icon and title */}
                 Keyboard Shortcuts
              </Dialog.Title>
              {/* ...rest of modal... */}
              <ul className="space-y-2">
                {shortcuts.map((s, idx) => (
                  <li key={idx} className="flex justify-between items-center">
                    <span className="font-mono text-xs sm:text-sm">{s.keys}</span>
                    <span className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
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
      )}
    </AnimatePresence>
  );
}