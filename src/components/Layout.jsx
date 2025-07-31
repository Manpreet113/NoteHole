import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Nav from "./Nav";
import Sidebar from "./Sidebar";
import GradientBackground from "./GradientBackground";
import GlobalHotkeys from "./GlobalHotkeys";
import SearchModal from "./SearchModal";
import ShortcutCheatsheet from "./ShortcutCheatsheet";
import useModalStore from "../store/useModalStore";
import { AnimatePresence, motion } from 'framer-motion';

const Layout = () => {
  const location = useLocation();
  // Modal state setters from global store
  const { setShowSearch, setShowCheatsheet } = useModalStore();

  // Listen for Escape key to close modals
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setShowSearch(false);
        setShowCheatsheet(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [setShowSearch, setShowCheatsheet]);

  return (
    // Main app layout: sidebar, nav, modals, and routed content
    <div className="pt-15 overflow-x-hidden flex h-screen relative bg-gray-50 dark:bg-black text-black dark:text-white">
      <GradientBackground />
      <nav aria-label="Sidebar Navigation">
        <Sidebar />
      </nav>
      <div className="flex flex-col flex-1 relative z-10">
        <Nav />
        <GlobalHotkeys />
        <SearchModal />
        <ShortcutCheatsheet />
        {/* Main routed page content */}
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="flex-1 overflow-y-auto px-6 md:px-20 lg:px-36 pt-6 pb-20"
          >
            <Outlet />
          </motion.main>
          
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Layout;
