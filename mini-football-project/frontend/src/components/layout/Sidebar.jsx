import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../../store';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Zap,
  ClipboardList,
  Menu,
  X
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar } = useStore();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/', id: 'dashboard' },
    { icon: Zap, label: 'Matches', path: '/matches', id: 'matches' },
    { icon: ClipboardList, label: 'Requests', path: '/requests', id: 'requests' },
    { icon: Users, label: 'Teams', path: '/teams', id: 'teams' },
    { icon: UserCheck, label: 'Players', path: '/players', id: 'players' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-slate-800 rounded border border-slate-700 hover:bg-slate-700 transition"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-20"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative
          h-full w-64 bg-slate-800 border-r border-slate-700
          transition-transform duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          z-30 lg:z-auto
          flex flex-col
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="text-amber-400 text-2xl">⚽</div>
            <div>
              <h1 className="font-bold text-slate-100 font-display text-lg">PITCH</h1>
              <p className="text-amber-400 text-xs font-mono">MATCHMAKER</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => {
                  // Close sidebar on mobile after click
                  if (window.innerWidth < 1024) {
                    toggleSidebar();
                  }
                }}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-200 group
                  ${active
                    ? 'bg-amber-500/20 border-l-2 border-amber-400 text-amber-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                  }
                `}
              >
                <Icon
                  size={20}
                  className={`transition-transform ${active ? 'scale-110' : ''}`}
                />
                <span className="font-medium text-sm">{item.label}</span>
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 text-xs text-slate-500">
          <p className="font-mono">Mini Football</p>
          <p className="text-slate-600 mt-1">v1.0.0</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
