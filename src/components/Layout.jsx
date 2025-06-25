import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import Nav from "./Nav";
import Sidebar from "./Sidebar";
import GradientBackground from "./GradientBackground";
import GlobalHotkeys from "./GlobalHotkeys";

const Layout = () => {
  useEffect(() => {
  const handleKey = (e) => {
    if (e.key === 'Escape') {
      setShowSearch(false);
      setShowCheatsheet(false);
    }
  };
  window.addEventListener('keydown', handleKey);
  return () => window.removeEventListener('keydown', handleKey);
}, []);


  return (
    <div className="mt-15 flex h-screen relative bg-gray-50 dark:bg-black text-black dark:text-white">
      <GradientBackground />
      <Sidebar />
      <div className="flex flex-col flex-1 relative z-10">
        <Nav />
        <GlobalHotkeys />
        <main className="flex-1 overflow-y-auto px-6 md:px-20 lg:px-36 pt-6 pb-20">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;