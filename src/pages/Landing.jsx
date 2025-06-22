import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";

function Landing({ isDark, toggleDarkMode }) {
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

  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let animationFrameId;

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
    <div className="min-h-screen bg-gray-50 dark:bg-black text-black dark:text-white flex flex-col items-center">
      <div
        className="pointer-events-none fixed top-0 left-0 w-full h-full z-0"
        style={{
          background: `radial-gradient(circle at ${pos.x}px ${pos.y}px, rgba(168, 85, 247, 0.25), transparent 16%)`,
          transition: "background 0.1s ease-out",
          willChange: "background",
        }}
      />
      <header className="pt-6 px-6  flex justify-center">
        <div className="flex items-center justify-between border fixed z-30 w-5/6 backdrop-blur-xs rounded-full px-4 py-2 shadow-lg">
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-secondary)" }}
          >
            BrainDump
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => toggleDarkMode(!isDark)}
              className="p-2 rounded-full hover:bg-purple-600 dark:hover:bg-purple-700 transition-colors"
            >
              {isDark ? (
                <i className="ri-sun-line text-xl"></i>
              ) : (
                <i className="ri-moon-line text-xl"></i>
              )}
            </button>
            <Link to="/login">
            <button className="bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition duration-200">
              Log In
            </button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col pt-50 items-center justify-center text-center px-4">
        <h2 className="text-5xl font-bold mb-4">
          Declutter your mind, one dump at a time.
        </h2>
        <p className="text-lg mb-6 max-w-lg">
          Your personal mental tracking dashboard — a minimal tool to log
          thoughts, track tasks, organize random ideas before they vanish into
          the void.
        </p>
        <Link to="/thoughts">
          <button className="bg-purple-600 text-white px-6 py-3 rounded-full text-lg hover:bg-purple-700 transition duration-200">
            Start Organizing Now
          </button>
        </Link>
      </main>
      <section className="w-4/6 pt-20 px-4 py-10">
        <h3 className="text-3xl font-bold mb-8 text-center">Core Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-100 dark:bg-gray-900 z-10 p-6 rounded-lg shadow-2xs dark:hover:bg-gray-950 border hover:scale-110  hover:shadow-2xl transition duration-200"
            >
              <i
                className={`${feature.icon} text-3xl text-purple-600 mb-4`}
              ></i>
              <h4 className="text-xl font-semibold mb-2">{feature.name}</h4>
              <ul className="list-disc list-inside text-sm">
                {feature.pros.map((pro, i) => (
                  <li key={i}>{pro}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <div className="h-screen w-full pt-20 px-4">
      <h3 className="text-3xl font-bold mb-8 text-center">Common Questions</h3>
        <div className="mx-auto w-full max-w-3/4 backdrop-blur-2xl bg-gray-100/5 divide-y divide-black/30 dark:divide-white/5 border rounded-xl  dark:bg-white/5">
          <Disclosure as="div" className="p-6" defaultOpen={true}>
            <DisclosureButton className="group flex w-full items-center justify-between">
              <span className="text-sm/6 font-medium group-data-[hover]:text-gray-900/80 dark:group-data-[hover]:text-white/80">
                What exactly is BrainDump?
              </span>
              <i className="ri-arrow-drop-down-line text-2xl"></i>
            </DisclosureButton>
            <DisclosurePanel className="mt-2 text-sm/5 text-gray-900/80 dark:text-white/50">
              It’s your brain’s messy desk — but digital. A minimalist personal
              knowledge manager where you can jot down random thoughts, sketch
              out ideas, and toss in tasks — all while keeping everything
              connected like a spider web of context.
            </DisclosurePanel>
          </Disclosure>
          <Disclosure as="div" className="p-6">
            <DisclosureButton className="group flex w-full items-center justify-between">
              <span className="text-sm/6 font-medium group-data-[hover]:text-gray-900/80 dark:group-data-[hover]:text-white/80">
                How is BrainDump different from Notion, Obsidian, or Evernote?
              </span>
              <i className="ri-arrow-drop-down-line text-2xl"></i>
            </DisclosureButton>
            <DisclosurePanel className="mt-2 text-sm/5 text-gray-900/80 dark:text-white/50">
              BrainDump is lighter than Obsidian, simpler than Notion, and more
              flexible than Evernote. No folders, no pressure to organize. Just
              dump stuff and link it — like how your brain does.
            </DisclosurePanel>
          </Disclosure>
          <Disclosure as="div" className="p-6">
            <DisclosureButton className="group flex w-full items-center justify-between">
              <span className="text-sm/6 font-medium group-data-[hover]:text-gray-900/80 dark:group-data-[hover]:text-white/80">
                Who is this for?
              </span>
              <i className="ri-arrow-drop-down-line text-2xl"></i>
            </DisclosureButton>
            <DisclosurePanel className="mt-2 text-sm/5 text-gray-900/80 dark:text-white/50">
              Overthinkers, creators, ADHD brains, developers, writers —
              basically anyone who hates rigid structure and loves just throwing
              thoughts somewhere without feeling guilty for not organizing them.
            </DisclosurePanel>
          </Disclosure>
          <Disclosure as="div" className="p-6">
            <DisclosureButton className="group flex w-full items-center justify-between">
              <span className="text-sm/6 font-medium group-data-[hover]:text-gray-900/80 dark:group-data-[hover]:text-white/80">
                Is it free to use?
              </span>
              <i className="ri-arrow-drop-down-line text-2xl"></i>
            </DisclosureButton>
            <DisclosurePanel className="mt-2 text-sm/5 text-gray-900/80 dark:text-white/50">
              Yep. It’s completely free and local-first. Data stays with you.
              Supabase syncing (optional) is there if you want to go
              cross-device.
            </DisclosurePanel>
          </Disclosure>
          <Disclosure as="div" className="p-6">
            <DisclosureButton className="group flex w-full items-center justify-between">
              <span className="text-sm/6 font-medium group-data-[hover]:text-gray-900/80 dark:group-data-[hover]:text-white/80">
                Can I use it offline?
              </span>
              <i className="ri-arrow-drop-down-line text-2xl"></i>
            </DisclosureButton>
            <DisclosurePanel className="mt-2 text-sm/5 text-gray-900/80 dark:text-white/50">
              Hell yeah. Thoughts don't wait for wifi. You can use it in
              airplane mode while avoiding human interaction at 35,000 feet.
            </DisclosurePanel>
          </Disclosure>
          <Disclosure as="div" className="p-6">
            <DisclosureButton className="group flex w-full items-center justify-between">
              <span className="text-sm/6 font-medium group-data-[hover]:text-gray-900/80 dark:group-data-[hover]:text-white/80">
                Will I lose my data if I clear my cache?
              </span>
              <i className="ri-arrow-drop-down-line text-2xl"></i>
            </DisclosureButton>
            <DisclosurePanel className="mt-2 text-sm/5 text-gray-900/80 dark:text-white/50">
              If you're only using localStorage, then yeah, clearing your
              browser data will nuke your dump. Use Supabase sync to avoid
              accidental brain loss.
            </DisclosurePanel>
          </Disclosure>
          <Disclosure as="div" className="p-6">
            <DisclosureButton className="group flex w-full items-center justify-between">
              <span className="text-sm/6 font-medium group-data-[hover]:text-gray-900/80 dark:group-data-[hover]:text-white/80">
              Do I have to create an account?
              </span>
              <i className="ri-arrow-drop-down-line text-2xl"></i>
            </DisclosureButton>
            <DisclosurePanel className="mt-2 text-sm/5 text-gray-900/80 dark:text-white/50">
            Not unless you want cloud sync. Without Supabase, it’s 100% anonymous and local.
            </DisclosurePanel>
          </Disclosure>
        </div>
      </div>
      <footer className="mt-12 border-t border-gray-600 p-6 rounded-t-md text-center text-gray-500">
        <p>© No rights reserved. Steal this idea and build it better, we dare you.</p>
      <button
              onClick={() => toggleDarkMode(!isDark)}
              className="p-2 rounded-full hover:bg-purple-600 dark:hover:bg-purple-700 transition-colors"
            >
              {isDark ? (
                <i className="ri-sun-line text-xl text-white"></i>
              ) : (
                <i className="ri-moon-line text-xl text-black"></i>
              )}
            </button>
      </footer>

    </div>
  );
}

export default Landing;
