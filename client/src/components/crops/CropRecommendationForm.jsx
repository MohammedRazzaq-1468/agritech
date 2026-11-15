import React, { useState } from 'react';
import { Button } from '../common/Button.jsx';
import { Input } from '../common/Input.jsx';
import { Select } from '../common/Select.jsx';
import { Textarea } from '../common/Textarea.jsx';
import { INDIAN_STATES, SOIL_TYPES, SEASONS, IRRIGATION_METHODS, WATER_AVAILABILITY_LEVELS } from '../../constants/indianAgri.js';
import { Sprout } from 'lucide-react';

export function CropRecommendationForm({ onSubmit, loading, initialValues = {} }) {
  const [formData, setFormData] = useState({
    state: initialValues.state || 'Punjab',
    district: initialValues.district || 'Ludhiana',
    soilType: initialValues.soilType || 'Alluvial soil',
    landArea: initialValues.landArea || 2.5,
    areaUnit: initialValues.areaUnit || 'acre',
    season: initialValues.season || 'kharif',
    waterAvailability: initialValues.waterAvailability || 'moderate',
    irrigationType: initialValues.irrigationType || 'Drip irrigation',
    soilPH: initialValues.soilPH || '',
    nitrogen: initialValues.nitrogen || '',
    phosphorus: initialValues.phosphorus || '',
    potassium: initialValues.potassium || '',
    additionalInformation: initialValues.additionalInformation || ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.district) newErrors.district = 'District is required';
    if (!formData.soilType) newErrors.soilType = 'Soil type is required';
    if (!formData.landArea || Number(formData.landArea) <= 0) {
      newErrors.landArea = 'Land area must be greater than 0';
    }
    if (formData.soilPH && (Number(formData.soilPH) < 0 || Number(formData.soilPH) > 14)) {
      newErrors.soilPH = 'pH must be between 0 and 14';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...formData,
      landArea: parseFloat(formData.landArea),
      soilPH: formData.soilPH ? parseFloat(formData.soilPH) : null,
      nitrogen: formData.nitrogen ? parseFloat(formData.nitrogen) : null,
      phosphorus: formData.phosphorus ? parseFloat(formData.phosphorus) : null,
      potassium: formData.potassium ? parseFloat(formData.potassium) : null
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Sprout className="w-5 h-5 text-agri-600" />
          Farm Parcel & Environmental Parameters
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Provide your land specifics. Gemini AI evaluates soil, regional climate, and season dynamics.
        </p>
      </div>

      {/* Row 1: Location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="State"
          name="state"
          value={formData.state}
          onChange={handleChange}
          options={INDIAN_STATES}
          error={errors.state}
          required
        />
        <Input
          label="District"
          name="district"
          value={formData.district}
          onChange={handleChange}
          placeholder="e.g. Ludhiana, Nashik, Guntur"
          error={errors.district}
          required
        />
      </div>

      {/* Row 2: Land & Soil */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Select
          label="Soil Classification"
          name="soilType"
          value={formData.soilType}
          onChange={handleChange}
          options={SOIL_TYPES}
          error={errors.soilType}
          required
        />
        <Input
          label="Land Area"
          name="landArea"
          type="number"
          step="0.1"
          min="0.1"
          value={formData.landArea}
          onChange={handleChange}
          error={errors.landArea}
          required
        />
        <Select
          label="Unit"
          name="areaUnit"
          value={formData.areaUnit}
          onChange={handleChange}
          options={[
            { id: 'acre', label: 'Acres' },
            { id: 'hectare', label: 'Hectares' },
            { id: 'bigha', label: 'Bigha' }
          ]}
        />
      </div>

      {/* Row 3: Season & Water */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Select
          label="Sowing Season"
          name="season"
          value={formData.season}
          onChange={handleChange}
          options={SEASONS.map(s => ({ id: s.id, label: s.name }))}
          required
        />
        <Select
          label="Water Resource Availability"
          name="waterAvailability"
          value={formData.waterAvailability}
          onChange={handleChange}
          options={WATER_AVAILABILITY_LEVELS}
          required
        />
        <Select
          label="Irrigation Method"
          name="irrigationType"
          value={formData.irrigationType}
          onChange={handleChange}
          options={IRRIGATION_METHODS}
          required
        />
      </div>

      {/* Optional Soil Lab Test Values */}
      <div className="pt-2 border-t border-slate-100">
        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          Optional Soil Health Metrics (From Soil Health Card)
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Input
            label="Soil pH"
            name="soilPH"
            type="number"
            step="0.1"
            placeholder="e.g. 7.2"
            value={formData.soilPH}
            onChange={handleChange}
            error={errors.soilPH}
          />
          <Input
            label="Nitrogen (kg/ha)"
            name="nitrogen"
            type="number"
            placeholder="e.g. 240"
            value={formData.nitrogen}
            onChange={handleChange}
          />
          <Input
            label="Phosphorus (kg/ha)"
            name="phosphorus"
            type="number"
            placeholder="e.g. 18"
            value={formData.phosphorus}
            onChange={handleChange}
          />
          <Input
            label="Potassium (kg/ha)"
            name="potassium"
            type="number"
            placeholder="e.g. 150"
            value={formData.potassium}
            onChange={handleChange}
          />
        </div>
      </div>

      <Textarea
        label="Additional Farm Preferences / Observations"
        name="additionalInformation"
        value={formData.additionalInformation}
        onChange={handleChange}
        rows={2}
        placeholder="e.g. Field has slight slope; intercropping preferred with pulses; previous crop was Cotton."
      />

      <div className="pt-2 flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          className="w-full sm:w-auto"
        >
          <Sprout className="w-4 h-4 mr-1.5" />
          Generate AI Crop Recommendations
        </Button>
      </div>
    </form>
  );
}
