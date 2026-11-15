import React from 'react';
import { Sprout } from 'lucide-react';

export function LoadingScreen({ message = 'Loading AgriSmart AI...' }) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-4">
        <div className="w-14 h-14 rounded-2xl bg-agri-100 flex items-center justify-center animate-pulse">
          <Sprout className="w-8 h-8 text-agri-600 animate-bounce" />
        </div>
        <div className="absolute -inset-1 rounded-2xl bg-agri-400/20 blur-sm -z-10" />
      </div>
      <p className="text-sm font-semibold text-slate-700 animate-pulse">{message}</p>
    </div>
  );
}

export function EmptyState({ icon: Icon = Sprout, title, description, action }) {
  return (
    <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3 text-slate-500">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">{description}</p>
      {action}
    </div>
  );
}

