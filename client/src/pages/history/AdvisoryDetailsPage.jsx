import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { PageHeader } from '../../components/layout/DashboardLayout.jsx';
import { Button } from '../../components/common/Button.jsx';
import { LoadingScreen } from '../../components/common/LoadingScreen.jsx';
import { ArrowLeft, Printer, Share2, Sparkles, CheckCircle2 } from 'lucide-react';
import { formatDate, getConfidenceBadge } from '../../utils/formatters.js';
import api from '../../services/api.js';

export function AdvisoryDetailsPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'crop';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRecord() {
      setLoading(true);
      try {
        let endpoint = `/crops/recommendations/${id}`;
        if (type === 'disease') endpoint = `/disease/${id}`;

        const res = await api.get(endpoint);
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to retrieve advisory record.');
      } finally {
        setLoading(false);
      }
    }

    fetchRecord();
  }, [id, type]);

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const text = `*AgriSmart AI Advisory Report*\nDate: ${formatDate(data?.created_at)}\nSummary: ${data?.advisory_summary || data?.analysis_result?.possible_conditions?.[0]?.name}\n(Generated for decision-support via AgriSmart AI)`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) return <LoadingScreen message="Loading detailed advisory report..." />;

  if (error || !data) {
    return (
      <div className="p-8 bg-white rounded-2xl border text-center space-y-4">
        <p className="text-sm text-rose-600 font-bold">{error || 'Record not found.'}</p>
        <Link to="/history">
          <Button variant="secondary">Return to History</Button>
        </Link>
      </div>
    );
  }

  const confidence = getConfidenceBadge(data.confidence_level || 'high');

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between gap-4">
        <Link to="/history" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-agri-600">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Archive</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-1.5" />
            Print Report
          </Button>
          <Button variant="outline" size="sm" onClick={handleWhatsAppShare}>
            <Share2 className="w-4 h-4 mr-1.5 text-emerald-600" />
            Share WhatsApp
          </Button>
        </div>
      </div>

      <PageHeader
        title={`Advisory Report: ${type === 'disease' ? (data.crop_name || 'Plant Pathology') : 'Crop Selection'}`}
        subtitle={`Recorded on ${formatDate(data.created_at)}`}
        badge={
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${confidence.color}`}>
            {confidence.label}
          </span>
        }
      />

      {/* Main Content Box */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        {type === 'disease' ? (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              {data.analysis_result?.possible_conditions?.[0]?.name}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {data.analysis_result?.possible_conditions?.[0]?.explanation}
            </p>

            {data.analysis_result?.preventive_actions && (
              <div className="p-4 rounded-xl bg-emerald-50 text-xs text-emerald-900 space-y-2">
                <h4 className="font-bold uppercase tracking-wider text-[11px]">Preventive & Remedial Actions</h4>
                <ul className="space-y-1">
                  {data.analysis_result.preventive_actions.map((act, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-agri-50 text-xs text-agri-950 leading-relaxed">
              <h4 className="font-bold text-agri-900 mb-1">Executive Summary</h4>
              <p>{data.advisory_summary}</p>
            </div>

            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Recommended Crop Varieties
            </h3>

            <div className="space-y-3">
              {(data.recommended_crops || []).map((crop, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">{crop.crop_name}</h4>
                    <span className="text-[10px] font-semibold text-emerald-700 uppercase">{crop.suitability} suitability</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{crop.reason}</p>
                  <p className="text-[11px] text-slate-500">
                    <strong>Duration:</strong> {crop.cultivation_duration_days} Days • <strong>Water:</strong> {crop.water_requirements}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

