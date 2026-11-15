import React from 'react';
import { Sprout } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Sprout className="w-4 h-4 text-agri-600" />
          <span className="font-bold text-slate-700">AgriSmart AI</span>
          <span>— Precision Agricultural Decision Support</span>
        </div>
        <p className="text-center sm:text-right">
          Advisory information is for decision-support purposes. Consult local KVK officers for critical chemical treatments.
        </p>
      </div>
    </footer>
  );
}

