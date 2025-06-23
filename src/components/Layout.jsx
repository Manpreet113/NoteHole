import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import Nav from "./Nav";
import Sidebar from "./Sidebar";
import GradientBackground from "./GradientBackground";

const Layout = () => {
  return (
    <div className="mt-15 flex h-screen relative bg-gray-50 dark:bg-black text-black dark:text-white">
      <GradientBackground />
      <Sidebar />
      <div className="flex flex-col flex-1 relative z-10">
        <Nav />
        <main className="flex-1 overflow-y-auto px-6 md:px-20 lg:px-36 pt-6 pb-20">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;