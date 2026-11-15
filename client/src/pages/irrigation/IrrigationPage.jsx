import React, { useState } from 'react';
import { PageHeader } from '../../components/layout/DashboardLayout.jsx';
import { Input } from '../../components/common/Input.jsx';
import { Select } from '../../components/common/Select.jsx';
import { Button } from '../../components/common/Button.jsx';
import { SOIL_TYPES, IRRIGATION_METHODS, WATER_AVAILABILITY_LEVELS } from '../../constants/indianAgri.js';
import { Droplets, AlertCircle, Sparkles, CheckCircle2, Bookmark, BookmarkCheck } from 'lucide-react';
import api from '../../services/api.js';

export function IrrigationPage() {
  const [formData, setFormData] = useState({
    cropName: 'Tomato',
    growthStage: 'Flowering & Anthesis',
    soilType: 'Clay loam',
    irrigationMethod: 'Drip irrigation',
    availableWater: 'moderate',
    recentRainfallMm: '0',
    currentWeatherContext: 'Warm and dry, high 34C'
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setSaved(false);

    try {
      const res = await api.post('/irrigation/advisory', {
        ...formData,
        recentRainfallMm: parseFloat(formData.recentRainfallMm) || 0
      });
      if (res.success && res.data) {
        setResult(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate irrigation advisory.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (saved || !result?.id) return;
    try {
      await api.post('/saved', {
        advisoryType: 'irrigation',
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
        title="Weather-Aware Irrigation Advisory"
        subtitle="Evapotranspiration decision support based on phenological stage, soil water retention, and satellite rain data"
      />

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-sky-600" />
            Field & Phenological Parameters
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure current crop growth and irrigation infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Crop Name"
            name="cropName"
            value={formData.cropName}
            onChange={handleChange}
            required
          />
          <Select
            label="Current Growth Stage"
            name="growthStage"
            value={formData.growthStage}
            onChange={handleChange}
            options={[
              'Germination / Nursery',
              'Vegetative / Crown Root Initiation',
              'Flowering & Anthesis',
              'Fruit / Pod / Grain Filling',
              'Ripening & Pre-Harvest'
            ]}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Soil Type"
            name="soilType"
            value={formData.soilType}
            onChange={handleChange}
            options={SOIL_TYPES}
            required
          />
          <Select
            label="Irrigation Method"
            name="irrigationMethod"
            value={formData.irrigationMethod}
            onChange={handleChange}
            options={IRRIGATION_METHODS}
            required
          />
          <Select
            label="Water Availability"
            name="availableWater"
            value={formData.availableWater}
            onChange={handleChange}
            options={WATER_AVAILABILITY_LEVELS}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Recent Rainfall in Past 48 Hours (mm)"
            name="recentRainfallMm"
            type="number"
            value={formData.recentRainfallMm}
            onChange={handleChange}
          />
          <Input
            label="Weather Observations"
            name="currentWeatherContext"
            value={formData.currentWeatherContext}
            onChange={handleChange}
            placeholder="e.g. Dry heatwave or overcast humid conditions"
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" size="lg" loading={loading}>
            <Droplets className="w-4 h-4 mr-2" />
            Calculate Irrigation Schedule
          </Button>
        </div>
      </form>

      {/* Advisory Result */}
      {result && (
        <div className="space-y-6 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sky-600" />
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Irrigation Recommendation for {result.cropName}
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
              <span>{saved ? 'Saved' : 'Bookmark Schedule'}</span>
            </button>
          </div>

          {/* Actionable Instruction Box */}
          <div className="p-6 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-200/80 text-sky-900">
              Prescribed Water Schedule
            </span>
            <p className="text-base font-bold text-sky-900 pt-1">
              {result.irrigation_recommendation}
            </p>
            <p className="text-xs text-sky-800 leading-relaxed">
              {result.water_requirement_assessment}
            </p>
          </div>

          {/* Best Practices & Weather considerations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.best_practices && (
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Best Operational Practices
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {result.best_practices.map((bp, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-agri-600 shrink-0 mt-0.5" />
                      <span>{bp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.water_conservation_methods && (
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Water Conservation Techniques
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {result.water_conservation_methods.map((wc, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                      <span>{wc}</span>
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

