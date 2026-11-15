import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Bookmark,
  BookmarkCheck,
  Eye,
  Info,
  ShieldCheck
} from 'lucide-react';
import { getSeverityBadge } from '../../utils/formatters.js';
import api from '../../services/api.js';

export function DiseaseAnalysisCard({ result, analysisId, onSaved }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const severity = getSeverityBadge(result.severity);

  const handleSave = async () => {
    if (saved || !analysisId) return;
    setSaving(true);
    try {
      await api.post('/saved', {
        advisoryType: 'disease',
        advisoryId
      });
      setSaved(true);
      onSaved?.();
    } catch (err) {
      console.warn('Failed to save bookmark', err);
    } finally {
      setSaving(false);
    }
  };

  const categoryColors = {
    fungal: 'bg-amber-100 text-amber-800 border-amber-200',
    bacterial: 'bg-rose-100 text-rose-800 border-rose-200',
    viral: 'bg-purple-100 text-purple-800 border-purple-200',
    pest: 'bg-orange-100 text-orange-800 border-orange-200',
    deficiency: 'bg-sky-100 text-sky-800 border-sky-200',
    environmental: 'bg-slate-100 text-slate-800 border-slate-200',
    unknown: 'bg-slate-100 text-slate-800 border-slate-200'
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Crop: {result.crop_name}
            </span>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${severity.color}`}>
              {severity.label}
            </span>
            {result.image_quality && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Photo Quality: {result.image_quality}
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {result.possible_conditions?.[0]?.name || 'Diagnostic Finding'}
          </h2>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || saved}
          className={`self-start p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-colors ${
            saved
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'text-slate-600 hover:text-agri-600 hover:bg-slate-50 border-slate-200'
          }`}
        >
          {saved ? <BookmarkCheck className="w-4 h-4 text-emerald-600" /> : <Bookmark className="w-4 h-4" />}
          <span>{saved ? 'Saved' : 'Save Analysis'}</span>
        </button>
      </div>

      {/* Expert Inspection Banner if Recommended */}
      {result.expert_review_recommended && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-rose-900 mb-0.5">Physical Expert Inspection Recommended</h4>
            <p className="text-rose-700 leading-relaxed">
              The observed symptoms show high severity or inconclusive markers. Please collect a leaf sample in a sealed plastic bag and visit your nearest Krishi Vigyan Kendra (KVK) or Block Agriculture Officer.
            </p>
          </div>
        </div>
      )}

      {/* Observed Symptoms */}
      {result.observed_symptoms && result.observed_symptoms.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-slate-400" />
            Observed Visual Symptoms in Image
          </h4>
          <div className="flex flex-wrap gap-2">
            {result.observed_symptoms.map((sym, idx) => (
              <span
                key={idx}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium"
              >
                {sym}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Probable Conditions Evaluated */}
      {result.possible_conditions && result.possible_conditions.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Differential Diagnostic Breakdown
          </h4>
          <div className="space-y-3">
            {result.possible_conditions.map((cond, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-900">{cond.name}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${categoryColors[cond.category] || categoryColors.unknown}`}>
                      {cond.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Likelihood: <strong>{cond.likelihood}</strong>
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {cond.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions & Next Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {result.preventive_actions && (
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
            <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Immediate Cultural & Preventive Steps
            </h4>
            <ul className="space-y-1.5">
              {result.preventive_actions.map((act, idx) => (
                <li key={idx} className="text-xs text-emerald-800 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.recommended_next_steps && (
          <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-100">
            <h4 className="text-xs font-bold text-sky-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-sky-600" />
              Recommended Field Actions
            </h4>
            <ul className="space-y-1.5">
              {result.recommended_next_steps.map((step, idx) => (
                <li key={idx} className="text-xs text-sky-800 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0 mt-1.5" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Safety Notice & Chemical Guidelines */}
      <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Chemical Safety & Approved Label Compliance</p>
          <p className="text-amber-800 text-[11px] leading-relaxed">
            Whenever applying fungicides or insecticides, always wear personal protective gear (nitrile gloves, eye goggles, and a protective mask). Follow the current official product label on dosage per liter and observe the mandatory Pre-Harvest Interval (PHI).
          </p>
        </div>
      </div>
    </div>
  );
}

