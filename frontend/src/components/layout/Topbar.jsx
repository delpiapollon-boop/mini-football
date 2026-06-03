import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { LogOut, Bell, Settings } from 'lucide-react';

const Topbar = () => {
  const { user, logout } = useStore();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-slate-800 border-b border-slate-700 px-6 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h2 className="text-slate-100 font-medium">Matchmaking Control</h2>
        <p className="text-slate-400 text-xs font-mono">Vendor Admin Panel</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-slate-200 transition">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Settings */}
        <button className="p-2 text-slate-400 hover:text-slate-200 transition">
          <Settings size={20} />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-700"
          >
            <div className="w-8 h-8 rounded bg-amber-500/20 flex items-center justify-center text-amber-400 text-sm font-bold">
              {user?.email?.[0].toUpperCase()}
            </div>
            <span className="text-sm font-mono text-slate-300 hidden sm:block max-w-xs truncate">
              {user?.email}
            </span>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-700 rounded-lg border border-slate-600 shadow-lg animate-slide-in">
              <button
                onClick={() => {
                  handleLogout();
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-slate-600 transition rounded-lg"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
