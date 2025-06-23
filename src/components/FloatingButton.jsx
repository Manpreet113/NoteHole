export default function FloatingButton({ onClick, icon = "+", label = "", className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 bg-purple-600 text-white px-6 py-3 rounded-full text-lg hover:bg-purple-700 shadow-xl backdrop-blur-md border border-purple-300 ${className}`}
      aria-label={label || icon}
    >
      {icon}
    </button>
  );
}
