import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import useDarkModeStore from "../store/useDarkModeStore";
import useAuthStore from '../store/useAuthStore';
import { setPageSEO } from '../utils/seo.js';

const features = [
  {
    name: "Note Dump",
    icon: "ri-file-text-line",
    pros: ["Capture fleeting thoughts", "Quick edits", "Cross-link ideas"],
  },
  {
    name: "Idea Board",
    icon: "ri-lightbulb-flash-line",
    pros: ["Organize creative sparks", "Visual grid layout", "Link to tasks"],
  },
  {
    name: "Task Tracker",
    icon: "ri-check-line",
    pros: ["Track progress", "Filter by status", "Link to notes"],
  },
];

function Landing() {
  const { isDark, toggleDarkMode } = useDarkModeStore();
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const { user, signOut } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);

  // Tracks the mouse position for a cool radial gradient effect.
  useEffect(() => {
    let animationFrameId;
    const handleMouseMove = (e) => {
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

  // SEO for the landing page.
  useEffect(() => {
    setPageSEO({
      title: 'NoteHole – Your Personal Brain Dump',
      description: 'NoteHole: Organize your thoughts, tasks, and ideas in one place. Minimalist, fast, and privacy-first note-taking app with offline support and Supabase sync.',
      image: 'https://notehole.pages.dev/android-chrome-512x512.png',
      url: 'https://notehole.pages.dev/',
      canonical: 'https://notehole.pages.dev/'
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-black dark:text-white flex flex-col items-center text-xs sm:text-base">
      {/* A radial gradient that follows the mouse. */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `radial-gradient(circle at ${pos.x}px ${pos.y}px, rgba(168, 85, 247, 0.25), transparent 16%)`,
          transition: "background 0.1s ease-out",
          willChange: "background",
        }}
      />

      <header className="w-full fixed top-0 z-30">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3 flex justify-between items-center backdrop-blur-md bg-white/30 dark:bg-black/30 rounded-b-xl shadow-md">
          <h1
            className="text-lg sm:text-xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-secondary)" }}
          >
             NoteHole
          </h1>
          <div className="flex items-center gap-2 sm:gap-4 relative">
            <button
              onClick={() => toggleDarkMode(!isDark)}
              aria-label="Toggle dark mode"
              className="p-2 rounded-full hover:bg-purple-600 dark:hover:bg-purple-700 transition-colors"
            >
              <i className={`text-xl ${isDark ? "ri-sun-line" : "ri-moon-line"}`}></i>
            </button>
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowMenu((v) => !v)}
                  className="w-9 h-9 bg-purple-600 dark:bg-purple-700 rounded-full flex items-center justify-center text-white hover:bg-purple-800 transition cursor-pointer focus:outline-none"
                  aria-label="User menu"
                >
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="avatar"
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  ) : (
                    <span className="font-bold text-lg">
                      {user.user_metadata?.full_name
                        ? user.user_metadata.full_name.split(' ').map((n) => n[0]).join('').slice(0,2).toUpperCase()
                        : <i className="ri-user-line" />}
                    </span>
                  )}
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800">
                      {user.user_metadata?.full_name || user.email}
                    </div>
                    <button
                      onClick={() => { signOut(); setShowMenu(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-b-lg"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <button className="bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition duration-200">
                  Log In
                </button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex flex-col items-center justify-center text-center px-2 sm:px-6 pt-24 sm:pt-40 lg:pt-48 pb-8 sm:pb-12 max-w-xs sm:max-w-screen-md mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 sm:mb-4 leading-tight">
          Declutter your mind, one dump at a time.
        </h2>
        <p className="text-xs sm:text-base md:text-lg mb-4 sm:mb-6 text-gray-600 dark:text-gray-300">
          Your personal mental tracking dashboard — log thoughts, track tasks, organize ideas before they vanish into the void.
        </p>
        <Link to="/thoughts">
          <button className="btn btn-primary btn-lg bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800">
            Start Organizing Now
          </button>
        </Link>
      </main>

      <section className="w-full max-w-screen-xl px-2 sm:px-6 py-6 sm:py-12">
        <h3 className="text-lg sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-8 text-center">
          Core Features
        </h3>
        <div className="grid gap-3 sm:gap-6 sm:grid-cols-2 md:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-6 shadow-md hover:shadow-xl hover:scale-[1.03] transition duration-200"
            >
              <i className={`${feature.icon} text-2xl sm:text-3xl text-purple-600 mb-2 sm:mb-4`}></i>
              <h4 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">{feature.name}</h4>
              <ul className="list-disc list-inside text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                {feature.pros.map((pro, i) => (
                  <li key={i}>{pro}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="w-full px-2 sm:px-6 max-w-xs sm:max-w-screen-md mx-auto py-6 sm:py-12">
        <h3 className="text-lg sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-8 text-center">
          Common Questions
        </h3>
        <div className="divide-y border border-gray-300 dark:border-gray-700 rounded-xl backdrop-blur-xl bg-white/20 dark:bg-black/20 text-xs sm:text-base">
          {[
            {
              q: "What exactly is  NoteHole?",
              a: "It's your brain's messy desk — but digital. Minimalist personal knowledge manager where everything stays connected like a spider web.",
            },
            {
              q: "How is  NoteHole different from Notion, Obsidian, or Evernote?",
              a: "Lighter than Obsidian, simpler than Notion, more flexible than Evernote. No folders, no pressure. Just dump stuff and link it.",
            },
            {
              q: "Who is this for?",
              a: "Overthinkers, creators, ADHD minds, devs, writers — anyone who hates structure and loves throwing stuff in without guilt.",
            },
            {
              q: "Is it free to use?",
              a: "Yep. Fully free and local-first. Supabase sync is optional for cross-device.",
            },
            {
              q: "Can I use it offline?",
              a: "Hell yeah. Works in airplane mode. Thoughts don't wait for Wi-Fi.",
            },
            {
              q: "Will I lose my data if I clear my cache?",
              a: "If using localStorage only — yes. Supabase sync prevents brain loss.",
            },
            {
              q: "Do I have to create an account?",
              a: "Nope. Totally anonymous unless you enable sync.",
            },
          ].map(({ q, a }, i) => (
            <Disclosure key={i} as="div" className="p-4 sm:p-6">
              <DisclosureButton className="flex justify-between w-full items-center">
                <span className="font-medium text-base">{q}</span>
                <i className="ri-arrow-drop-down-line text-2xl"></i>
              </DisclosureButton>
              <DisclosurePanel className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                {a}
              </DisclosurePanel>
            </Disclosure>
          ))}
        </div>
      </section>

      <footer className="w-full text-center px-6 py-6 border-t border-gray-300 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
        <p>© No rights reserved. Steal this idea and build it better, we dare you.</p>
        <button
          onClick={() => toggleDarkMode(!isDark)}
          aria-label="Toggle dark mode"
          className="btn btn-ghost btn-circle mt-4 hover:bg-purple-600 dark:hover:bg-purple-700"
        >
          <i className={`text-xl ${isDark ? "ri-sun-line" : "ri-moon-line"}`}></i>
        </button>
      </footer>
    </div>
  );
}

export default Landing;