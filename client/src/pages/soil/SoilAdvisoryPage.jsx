import React, { useState } from 'react';
import { PageHeader } from '../../components/layout/DashboardLayout.jsx';
import { SoilAdvisoryForm, NutrientCard } from '../../components/soil/SoilAdvisoryForm.jsx';
import { FlaskConical, AlertCircle, Sparkles, CheckCircle2, Bookmark, BookmarkCheck } from 'lucide-react';
import api from '../../services/api.js';

export function SoilAdvisoryPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setSaved(false);

    try {
      const res = await api.post('/soil/advisory', formData);
      if (res.success && res.data) {
        setResult(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate soil nutrient advisory.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (saved || !result?.id) return;
    try {
      await api.post('/saved', {
        advisoryType: 'soil',
        advisoryId: result.id
      });
      setSaved(true);
    } catch (err) {
      console.warn('Failed to save bookmark', err);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <PageHeader
        title="Soil Health & Nutrient Balancing Advisory"
        subtitle="Translate soil laboratory test parameters into balanced fertilization, pH buffering, and organic matter plans"
      />

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <SoilAdvisoryForm onSubmit={handleSubmit} loading={loading} />

      {/* Advisory Findings */}
      {result && (
        <div className="space-y-6 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Soil Health Analysis & Fertilization Prescription
              </h3>
            </div>

            <button
              onClick={handleSave}
              disabled={saved}
              className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-colors ${
                saved
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'text-slate-600 hover:text-agri-600 hover:bg-slate-50 border-slate-200'
              }`}
            >
              {saved ? <BookmarkCheck className="w-4 h-4 text-emerald-600" /> : <Bookmark className="w-4 h-4" />}
              <span>{saved ? 'Saved' : 'Bookmark Report'}</span>
            </button>
          </div>

          {/* Summary */}
          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs sm:text-sm text-amber-950 leading-relaxed">
            <h4 className="font-bold text-amber-900 mb-1">Executive Soil Assessment</h4>
            <p>{result.soil_summary}</p>
          </div>

          {/* pH Interpretation */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Soil Reaction & pH Bioavailability Dynamics
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {result.ph_interpretation}
            </p>
          </div>

          {/* Nutrient Assessment Cards Grid */}
          {result.nutrient_assessment && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Nutrient Deficiency & Adequacy Status
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {result.nutrient_assessment.map((n, idx) => (
                  <NutrientCard
                    key={idx}
                    nutrient={n.nutrient}
                    status={n.status}
                    explanation={n.explanation}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Improvement & Organic Guidance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.soil_improvement_suggestions && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Physical & Chemical Soil Conditioning
                </h4>
                <ul className="space-y-1.5">
                  {result.soil_improvement_suggestions.map((sug, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-agri-600 shrink-0 mt-0.5" />
                      <span>{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.organic_management && (
              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs space-y-2">
                <h4 className="font-bold text-emerald-900 uppercase tracking-wider text-[11px]">
                  Bio-Fertilizer & Organic Carbon Management
                </h4>
                <ul className="space-y-1.5">
                  {result.organic_management.map((om, i) => (
                    <li key={i} className="flex items-start gap-2 text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{om}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

