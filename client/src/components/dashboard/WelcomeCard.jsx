import React from 'react';
import { Sprout, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export function WelcomeCard({ profile }) {
  const today = format(new Date(), 'EEEE, dd MMMM yyyy');

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-agri-800 via-agri-700 to-emerald-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg shadow-agri-950/10 mb-6">
      {/* Background Decorative Rings */}
      <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute right-16 -top-12 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold text-agri-100 mb-3 border border-white/10">
            <Sprout className="w-3.5 h-3.5 text-agri-300" />
            Active Crop Season
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Namaste, {profile?.full_name || 'Farmer'}!
          </h2>
          <p className="text-xs sm:text-sm text-agri-100/90 mt-1 max-w-xl">
            Welcome to your intelligent agricultural dashboard. Review crop health, monitor weather alerts, and plan precision irrigation for your land.
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-1.5 shrink-0 bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/10">
          <div className="flex items-center gap-1.5 text-xs font-medium text-agri-200">
            <Calendar className="w-3.5 h-3.5 text-agri-300" />
            <span>{today}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-agri-100 font-bold">
            <MapPin className="w-3.5 h-3.5 text-amber-300" />
            <span>{profile?.district ? `${profile.district}, ${profile.state}` : profile?.state || 'Punjab, India'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function QuickActionCard({ icon: Icon, title, description, to, badge, color = 'bg-agri-600' }) {
  return (
    <a
      href={to}
      className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-agri-300 transition-all flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className={`w-10 h-10 rounded-xl ${color} text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
            <Icon className="w-5 h-5" />
          </div>
          {badge && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {badge}
            </span>
          )}
        </div>
        <h3 className="text-sm font-bold text-slate-900 group-hover:text-agri-600 transition-colors mb-1">
          {title}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-agri-600 group-hover:translate-x-0.5 transition-transform">
        <span>Proceed</span>
        <svg className="w-3.5 h-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </a>
  );
}

