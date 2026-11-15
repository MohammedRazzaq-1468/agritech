import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, LogOut, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';

export function Navbar({ onToggleSidebar }) {
  const { user, profile, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-agri-600 text-white flex items-center justify-center shadow-sm group-hover:bg-agri-700 transition-colors">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-slate-900 block leading-none">
                AgriSmart <span className="text-agri-600">AI</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">
                Crop Advisory
              </span>
            </div>
          </Link>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin Panel
                </Link>
              )}

              <Link
                to="/profile"
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-agri-100 text-agri-700 flex items-center justify-center font-bold text-xs">
                  {profile?.full_name?.charAt(0) || <User className="w-4 h-4" />}
                </div>
                <div className="hidden sm:block text-left leading-tight">
                  <p className="text-xs font-bold text-slate-800">{profile?.full_name || 'Farmer'}</p>
                  <p className="text-[10px] text-slate-500">{profile?.state || 'India'}</p>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-agri-600 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-bold bg-agri-600 text-white rounded-lg hover:bg-agri-700 transition-colors shadow-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

