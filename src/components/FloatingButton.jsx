// FloatingButton.jsx
// Floating action button for quick actions (bottom right corner)
export default function FloatingButton({ onClick, icon = "+", label = "", className = "" }) {
  return (
    // Floating button UI
    <button
      onClick={onClick}
      className={`fixed bottom-3 right-3 sm:bottom-6 sm:right-6 bg-purple-600 text-white p-3 sm:px-6 sm:py-3 rounded-full text-base sm:text-lg hover:bg-purple-700 shadow-xl backdrop-blur-md border border-purple-300 ${className}`}
      aria-label={label || icon}
    >
      {icon}
    </button>
  );
}
