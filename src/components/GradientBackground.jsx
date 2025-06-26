// GradientBackground.jsx
// Animated radial gradient background that follows mouse position
import { useState, useEffect } from "react";

export default function GradientBackground() {
  // Track mouse position for gradient center
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let animationFrameId;
    // Update position on mouse move (throttled with requestAnimationFrame)
    const handleMouseMove = (e) => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        setPos({ x: e.clientX, y: e.clientY });
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    // Full-screen animated gradient background
    <div
      className="pointer-events-none fixed top-0 left-0 w-full h-full z-0"
      style={{
        background: `radial-gradient(circle at ${pos.x}px ${pos.y}px, rgba(168, 85, 247, 0.25), transparent 16%)`,
        transition: "background 0.1s ease-out",
        willChange: "background",
      }}
    />
  );
}
