import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/DashboardLayout.jsx';
import { Bookmark, Trash2, Eye, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatters.js';
import { LoadingScreen } from '../../components/common/LoadingScreen.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import api from '../../services/api.js';

export function SavedAdvisoriesPage() {
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const res = await api.get('/saved');
      if (res.success && res.data) {
        setSavedItems(res.data);
      }
    } catch (err) {
      console.warn('Saved advisories fetch warning', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleDelete = async (id, e) => {
    e.preventDefault();
    try {
      await api.delete(`/saved/${id}`);
      fetchSaved();
    } catch (err) {
      alert('Failed to remove bookmark: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Saved Agricultural Advisories"
        subtitle="Quick access to bookmarked crop recommendations, disease treatments, and fertilizer plans"
      />

      {loading ? (
        <LoadingScreen message="Retrieving bookmarked advisories..." />
      ) : savedItems.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No Bookmarked Advisories"
          description="Bookmark your important crop recommendations or disease diagnoses for one-click reference in the field."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-agri-100 text-agri-800">
                    {item.advisory_type} advisory
                  </span>
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                    title="Remove bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  Bookmarked {item.advisory_type?.toUpperCase()} Advisory
                </h4>
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Saved on {formatDate(item.created_at)}</span>
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                <Link
                  to={`/history/${item.advisory_id}?type=${item.advisory_type}`}
                  className="text-xs font-bold text-agri-600 hover:text-agri-700 flex items-center gap-1"
                >
                  <span>Open Full Advisory</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

