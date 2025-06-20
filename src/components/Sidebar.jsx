import { Link, useLocation } from 'react-router-dom';
import { Lightbulb, BrainCircuit, ListChecks } from 'lucide-react';
import useSidebarStore from '../store/useSidebarStore'; // 👈 import Zustand store

function SideBar() {
  const location = useLocation();
  const { isExpanded } = useSidebarStore(); // 👈 get sidebar state from store

  const links = [
    {
      path: '/thoughts',
      label: 'Thoughts',
      Icon: BrainCircuit,
      activeColor: 'text-purple-800',
    },
    {
      path: '/ideas',
      label: 'Ideas',
      Icon: Lightbulb,
      activeColor: 'text-yellow-600',
    },
    {
      path: '/tasks',
      label: 'Tasks',
      Icon: ListChecks,
      activeColor: 'text-green-600',
    },
  ];

  return (
    <div
      className={`fixed left-0 top-1/2 -translate-y-1/2 backdrop-blur-lg text-wrap p-4 rounded-r-2xl shadow-lg overflow-hidden z-20 transition-all
        ${isExpanded ? 'w-40' : 'w-16 group hover:w-40'}
      `}
    >
      <div className="flex flex-col gap-6">
        {links.map(({ path, label, Icon, activeColor }) => (
          <Link to={path} key={path}>
            <div className="flex items-center gap-3">
              <Icon
                strokeWidth={location.pathname === path ? 3 : 2}
                className={`h-6 w-6 transition-all ${
                  location.pathname === path ? `${activeColor} scale-110` : 'text-white'
                }`}
              />
              {/* Label shows on expand OR on hover */}
              {isExpanded && (
                <span className="text-sm font-medium text-white transition-all inline-block">
                  {label}
                </span>
              )}
              {!isExpanded && (
                <span className="text-sm font-medium text-white transition-all hidden group-hover:inline-block">
                  {label}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default SideBar;
