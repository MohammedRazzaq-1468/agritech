import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/DashboardLayout.jsx';
import { Sprout, ScanLine, FlaskConical, Droplets, Trash2, Eye, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate, getConfidenceBadge } from '../../utils/formatters.js';
import { LoadingScreen } from '../../components/common/LoadingScreen.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import api from '../../services/api.js';

export function AdvisoryHistoryPage() {
  const [filter, setFilter] = useState('all');
  const [recommendations, setRecommendations] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [soilTests, setSoilTests] = useState([]);
  const [irrigation, setIrrigation] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllHistory = async () => {
    setLoading(true);
    try {
      const [recsRes, disRes, soilRes, irrigRes] = await Promise.allSettled([
        api.get('/crops/recommendations'),
        api.get('/disease/history'),
        api.get('/soil/history'),
        api.get('/irrigation/history')
      ]);

      if (recsRes.status === 'fulfilled' && recsRes.value.success) setRecommendations(recsRes.value.data || []);
      if (disRes.status === 'fulfilled' && disRes.value.success) setDiseases(disRes.value.data || []);
      if (soilRes.status === 'fulfilled' && soilRes.value.success) setSoilTests(soilRes.value.data || []);
      if (irrigRes.status === 'fulfilled' && irrigRes.value.success) setIrrigation(irrigRes.value.data || []);
    } catch (err) {
      console.warn('History fetch warning', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllHistory();
  }, []);

  const handleDelete = async (type, id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this advisory record?')) return;

    try {
      if (type === 'crop') await api.delete(`/crops/recommendations/${id}`);
      else if (type === 'disease') await api.delete(`/disease/${id}`);
      fetchAllHistory();
    } catch (err) {
      alert('Failed to delete advisory: ' + (err.message || 'Error'));
    }
  };

  const unifiedList = [
    ...recommendations.map(r => ({
      id: r.id,
      type: 'crop',
      title: r.recommended_crops?.[0]?.crop_name ? `Recommended: ${r.recommended_crops[0].crop_name}` : 'Crop Advisory',
      details: `${r.farming_conditions?.season?.toUpperCase()} • ${r.location?.district || ''}, ${r.location?.state || ''}`,
      date: r.created_at,
      confidence: r.confidence_level || 'high'
    })),
    ...diseases.map(d => ({
      id: d.id,
      type: 'disease',
      title: d.analysis_result?.possible_conditions?.[0]?.name || `Diagnosis: ${d.crop_name}`,
      details: `Crop: ${d.crop_name} • Severity: ${d.analysis_result?.severity || 'Moderate'}`,
      date: d.created_at,
      confidence: d.confidence_level || 'moderate'
    })),
    ...soilTests.map(s => ({
      id: s.id,
      type: 'soil',
      title: `Soil Health: ${s.crop_name}`,
      details: `${s.soil_type} • pH: ${s.soil_test_data?.soilPH || '7.0'}`,
      date: s.created_at,
      confidence: 'high'
    })),
    ...irrigation.map(i => ({
      id: i.id,
      type: 'irrigation',
      title: `Irrigation: ${i.crop_name}`,
      details: `Stage: ${i.growth_stage} • ${i.soil_type}`,
      date: i.created_at,
      confidence: 'high'
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const filteredList = unifiedList.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'crop': return <Sprout className="w-5 h-5 text-emerald-600" />;
      case 'disease': return <ScanLine className="w-5 h-5 text-rose-600" />;
      case 'soil': return <FlaskConical className="w-5 h-5 text-amber-600" />;
      default: return <Droplets className="w-5 h-5 text-sky-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Advisory Consultation Archive"
        subtitle="Chronological record of all generated crop recommendations, disease scans, and soil tests"
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {[
          { id: 'all', label: 'All Advisories' },
          { id: 'crop', label: 'Crop Recommendations' },
          { id: 'disease', label: 'Disease Scans' },
          { id: 'soil', label: 'Soil Health' },
          { id: 'irrigation', label: 'Irrigation' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filter === tab.id
                ? 'bg-agri-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingScreen message="Retrieving consultation records..." />
      ) : filteredList.length === 0 ? (
        <EmptyState
          title="No Consultations Found"
          description="You haven't run any advisories in this category yet. Start a new analysis to see records here."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredList.map((item) => {
            const badge = getConfidenceBadge(item.confidence);
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    {getIcon(item.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{item.title}</h4>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{item.details}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(item.date)}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Link
                    to={`/history/${item.id}?type=${item.type}`}
                    className="p-2 rounded-lg text-slate-600 hover:text-agri-600 hover:bg-agri-50 transition-colors flex items-center gap-1 text-xs font-semibold"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Report</span>
                  </Link>

                  <button
                    onClick={(e) => handleDelete(item.type, item.id, e)}
                    title="Delete record"
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

