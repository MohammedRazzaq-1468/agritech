import React from 'react';
import { Sprout, ScanLine, FlaskConical, Droplets, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatShortDate, getConfidenceBadge } from '../../utils/formatters.js';

export function RecentAdvisories({ recommendations = [], diseases = [], soilTests = [] }) {
  const allItems = [
    ...recommendations.map(r => ({
      id: r.id,
      type: 'crop',
      title: r.recommended_crops?.[0]?.crop_name ? `Recommended: ${r.recommended_crops[0].crop_name}` : 'Crop Advisory',
      subtitle: `${r.farming_conditions?.season?.toUpperCase()} • ${r.location?.district || ''}`,
      date: r.created_at,
      confidence: r.confidence_level || 'high',
      link: `/history/${r.id}`
    })),
    ...diseases.map(d => ({
      id: d.id,
      type: 'disease',
      title: d.analysis_result?.possible_conditions?.[0]?.name || `Diagnosis: ${d.crop_name}`,
      subtitle: `Crop: ${d.crop_name}`,
      date: d.created_at,
      confidence: d.confidence_level || 'moderate',
      link: `/history/${d.id}`
    })),
    ...soilTests.map(s => ({
      id: s.id,
      type: 'soil',
      title: `Soil Health: ${s.crop_name}`,
      subtitle: `pH: ${s.soil_test_data?.soilPH || '7.0'} • ${s.soil_type}`,
      date: s.created_at,
      confidence: 'high',
      link: `/history/${s.id}`
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  const getIcon = (type) => {
    switch (type) {
      case 'crop': return <Sprout className="w-4 h-4 text-emerald-600" />;
      case 'disease': return <ScanLine className="w-4 h-4 text-rose-600" />;
      case 'soil': return <FlaskConical className="w-4 h-4 text-amber-600" />;
      default: return <Droplets className="w-4 h-4 text-sky-600" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Recent Advisories</h3>
          <p className="text-xs text-slate-500">Your latest agricultural consultations</p>
        </div>
        <Link to="/history" className="text-xs font-bold text-agri-600 hover:text-agri-700 flex items-center gap-1">
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {allItems.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-xs">
          No advisory consultations recorded yet. Run a crop recommendation or plant diagnosis.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {allItems.map((item) => {
            const badge = getConfidenceBadge(item.confidence);
            return (
              <Link
                key={item.id}
                to={item.link}
                className="py-3 flex items-center justify-between gap-3 group hover:bg-slate-50/80 px-2 -mx-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {getIcon(item.type)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate group-hover:text-agri-600 transition-colors">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {item.subtitle} • {formatShortDate(item.date)}
                    </p>
                  </div>
                </div>

                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${badge.color}`}>
                  {badge.label.split(' ')[0]}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function DashboardStatistics({ farmSize = 4.5, activeCrops = 2, totalAdvisories = 8, savedCount = 3 }) {
  const stats = [
    { label: 'Farm Area', value: `${farmSize} Acres`, note: 'Registered parcel' },
    { label: 'Active Crops', value: activeCrops, note: 'Current season' },
    { label: 'Total Advisories', value: totalAdvisories, note: 'All-time AI sessions' },
    { label: 'Saved Bookmarks', value: savedCount, note: 'Quick access' }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((s, idx) => (
        <div key={idx} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            {s.label}
          </p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {s.value}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            {s.note}
          </p>
        </div>
      ))}
    </div>
  );
}

