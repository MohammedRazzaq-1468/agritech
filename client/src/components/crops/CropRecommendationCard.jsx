import React, { useState } from 'react';
import { Sprout, Clock, Droplets, AlertTriangle, Bookmark, BookmarkCheck, CheckCircle2 } from 'lucide-react';
import { getConfidenceBadge } from '../../utils/formatters.js';
import api from '../../services/api.js';

export function CropRecommendationCard({ crop, advisoryId, onSaved }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const confidence = getConfidenceBadge(crop.confidence);

  const handleSave = async () => {
    if (saved || !advisoryId) return;
    setSaving(true);
    try {
      await api.post('/saved', {
        advisoryType: 'crop',
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

  const suitabilityColors = {
    high: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    moderate: 'text-amber-700 bg-amber-50 border-amber-200',
    low: 'text-slate-700 bg-slate-50 border-slate-200'
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              {crop.crop_name}
            </h3>
            {crop.scientific_name && (
              <span className="text-xs text-slate-400 italic">
                ({crop.scientific_name})
              </span>
            )}
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${suitabilityColors[crop.suitability] || suitabilityColors.moderate}`}>
              {crop.suitability} Suitability
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {crop.reason}
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || saved}
          title={saved ? 'Saved' : 'Save Recommendation'}
          className={`p-2 rounded-xl border transition-colors shrink-0 ${
            saved
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
              : 'text-slate-400 hover:text-agri-600 hover:bg-agri-50 border-slate-200'
          }`}
        >
          {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>
      </div>

      {/* Grid Properties */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 text-xs mb-4">
        <div className="flex items-start gap-2">
          <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-700">Duration</p>
            <p className="text-slate-600">{crop.cultivation_duration_days} Days</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Droplets className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-700">Water Need</p>
            <p className="text-slate-600">{crop.water_requirements}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Sprout className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-700">Soil Fit</p>
            <p className="text-slate-600 line-clamp-1">{crop.soil_requirements}</p>
          </div>
        </div>
      </div>

      {/* Key Risks */}
      {crop.risks && crop.risks.length > 0 && (
        <div className="mb-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            Key Agricultural Risks to Monitor
          </p>
          <ul className="space-y-1">
            {crop.risks.map((risk, idx) => (
              <li key={idx} className="text-xs text-slate-600 flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer & Confidence */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${confidence.color}`}>
          {confidence.label}
        </span>
        <span className="text-[10px] text-slate-400">
          Decision Support Only • No Yield Guarantee
        </span>
      </div>
    </div>
  );
}

