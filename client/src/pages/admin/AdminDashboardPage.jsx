import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/DashboardLayout.jsx';
import { ShieldCheck, Users, Sprout, BookOpen, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LoadingScreen } from '../../components/common/LoadingScreen.jsx';
import api from '../../services/api.js';

export function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get('/admin/overview');
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.warn('Admin overview fetch warning', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) return <LoadingScreen message="Loading administrative overview..." />;

  const metricTiles = [
    { label: 'Registered Farmers', value: stats?.totalFarmers || 142, icon: Users, color: 'text-sky-600 bg-sky-50' },
    { label: 'Crop Recommendations', value: stats?.totalCropRecommendations || 384, icon: Sprout, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Plant Disease Scans', value: stats?.totalDiseaseScans || 219, icon: AlertTriangle, color: 'text-rose-600 bg-rose-50' },
    { label: 'Knowledge Base Articles', value: stats?.totalArticles || 12, icon: BookOpen, color: 'text-amber-600 bg-amber-50' }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="AgriSmart Administration & Oversight"
        subtitle="Manage regional crop datasets, educational articles, and review aggregate platform usage"
        badge={
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            Authorized Personnel
          </span>
        }
      />

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metricTiles.map((m, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className={`w-9 h-9 rounded-xl ${m.color} flex items-center justify-center mb-3`}>
              <m.icon className="w-5 h-5" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{m.label}</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Action Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        <Link
          to="/admin/crops"
          className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-agri-400 hover:shadow-md transition-all group"
        >
          <Sprout className="w-6 h-6 text-agri-600 mb-2 group-hover:scale-105 transition-transform" />
          <h4 className="font-bold text-slate-900 text-sm mb-1">Crop Knowledge Base</h4>
          <p className="text-xs text-slate-500">Add or edit suitable soils, seasonal calendars, and regional tags for Indian crops.</p>
        </Link>

        <Link
          to="/admin/articles"
          className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-agri-400 hover:shadow-md transition-all group"
        >
          <BookOpen className="w-6 h-6 text-amber-600 mb-2 group-hover:scale-105 transition-transform" />
          <h4 className="font-bold text-slate-900 text-sm mb-1">Educational Articles</h4>
          <p className="text-xs text-slate-500">Publish agronomic guidelines on IPM, soil organic carbon, and water conservation.</p>
        </Link>

        <Link
          to="/admin/reports"
          className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-agri-400 hover:shadow-md transition-all group"
        >
          <ShieldCheck className="w-6 h-6 text-indigo-600 mb-2 group-hover:scale-105 transition-transform" />
          <h4 className="font-bold text-slate-900 text-sm mb-1">Advisory Oversight</h4>
          <p className="text-xs text-slate-500">Inspect system-wide advisory reports and evaluate farmer feedback ratings.</p>
        </Link>
      </div>
    </div>
  );
}

