import React, { useState } from 'react';
import { PageHeader } from '../../components/layout/DashboardLayout.jsx';
import { CropRecommendationForm } from '../../components/crops/CropRecommendationForm.jsx';
import { CropRecommendationCard } from '../../components/crops/CropRecommendationCard.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { AlertCircle, Info, Sparkles, CheckCircle2 } from 'lucide-react';
import api from '../../services/api.js';

export function CropRecommendationPage() {
  const { profile } = useAuth();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFormSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.post('/crops/recommend', formData);
      if (res.success && res.data) {
        setResult(res.data);
      }
    } catch (err) {
      setError(err.message || 'Unable to generate crop recommendation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="AI Crop Recommendation System"
        subtitle="Match your soil profile, water infrastructure, and sowing season with optimal crop varieties"
      />

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Input Section */}
      <CropRecommendationForm
        onSubmit={handleFormSubmit}
        loading={loading}
        initialValues={{
          state: profile?.state || 'Punjab',
          district: profile?.district || 'Ludhiana',
          landArea: profile?.farm_size || 2.5
        }}
      />

      {/* Results Section */}
      {result && (
        <div className="space-y-6 pt-4 border-t border-slate-200/80">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-agri-600" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Agronomic Assessment & Recommended Crops
            </h2>
          </div>

          {/* Executive Summary Card */}
          <div className="p-5 rounded-2xl bg-agri-50/70 border border-agri-200 text-xs sm:text-sm text-agri-950 leading-relaxed">
            <h4 className="font-bold text-agri-900 mb-1">Agronomic Summary</h4>
            <p>{result.summary}</p>
          </div>

          {/* Recommendations Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.recommendations?.map((crop, idx) => (
              <CropRecommendationCard
                key={idx}
                crop={crop}
                advisoryId={result.id}
              />
            ))}
          </div>

          {/* Missing Information Notice */}
          {result.missing_information && result.missing_information.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs">
              <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-slate-500" />
                Parameters That Could Improve Future Precision:
              </h4>
              <ul className="list-disc list-inside text-slate-600 space-y-0.5 ml-1">
                {result.missing_information.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Limitations & Disclaimer */}
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
            <p className="font-bold mb-0.5">Decision-Support Notice</p>
            <p>
              Advisories are calculated using agricultural data and Gemini generative AI for guidance. Environmental fluctuations, monsoon shifts, and local pest pressures must be taken into account. Never treat AI outputs as guaranteed yield claims.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

