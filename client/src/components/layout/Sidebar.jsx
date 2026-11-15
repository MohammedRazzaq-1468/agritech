import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Sprout,
  ScanLine,
  CloudSun,
  FlaskConical,
  Droplets,
  MessageSquare,
  History,
  Bookmark,
  User,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';

export function Sidebar({ isOpen, onClose }) {
  const { isAdmin } = useAuth();

  const farmerNav = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Crop Recommendation', to: '/crop-recommendation', icon: Sprout },
    { name: 'Disease Detection', to: '/disease-detection', icon: ScanLine },
    { name: 'Weather Dashboard', to: '/weather', icon: CloudSun },
    { name: 'Soil & Fertilizer', to: '/soil-advisory', icon: FlaskConical },
    { name: 'Irrigation Advisory', to: '/irrigation', icon: Droplets },
    { name: 'AI Agronomist Chat', to: '/chatbot', icon: MessageSquare },
    { name: 'Advisory History', to: '/history', icon: History },
    { name: 'Saved Advisories', to: '/saved-advisories', icon: Bookmark },
    { name: 'Farmer Profile', to: '/profile', icon: User }
  ];

  const adminNav = [
    { name: 'Admin Overview', to: '/admin', icon: ShieldCheck },
    { name: 'Manage Crops', to: '/admin/crops', icon: Sprout },
    { name: 'Agricultural Articles', to: '/admin/articles', icon: BookOpen },
    { name: 'Advisory Reports', to: '/admin/reports', icon: History }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 overflow-y-auto transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-6">
          <div>
            <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
              Farmer Advisory
            </p>
            <nav className="space-y-1">
              {farmerNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => onClose?.()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-agri-600 text-white shadow-sm shadow-agri-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {isAdmin && (
            <div>
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-amber-600 mb-2">
                Administration
              </p>
              <nav className="space-y-1">
                {adminNav.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => onClose?.()}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-amber-50/50'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

