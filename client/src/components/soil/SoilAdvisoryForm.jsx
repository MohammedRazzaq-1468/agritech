import React, { useState } from 'react';
import { Button } from '../common/Button.jsx';
import { Input } from '../common/Input.jsx';
import { Select } from '../common/Select.jsx';
import { SOIL_TYPES } from '../../constants/indianAgri.js';
import { FlaskConical } from 'lucide-react';

export function SoilAdvisoryForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    cropName: 'Wheat',
    soilType: 'Alluvial soil',
    soilPH: '7.2',
    nitrogen: '240',
    phosphorus: '18',
    potassium: '160',
    organicCarbon: '0.55',
    landArea: '1.0',
    soilTestDate: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      cropName: formData.cropName,
      soilType: formData.soilType,
      soilPH: formData.soilPH ? parseFloat(formData.soilPH) : null,
      nitrogen: formData.nitrogen ? parseFloat(formData.nitrogen) : null,
      phosphorus: formData.phosphorus ? parseFloat(formData.phosphorus) : null,
      potassium: formData.potassium ? parseFloat(formData.potassium) : null,
      organicCarbon: formData.organicCarbon ? parseFloat(formData.organicCarbon) : null,
      landArea: parseFloat(formData.landArea) || 1.0,
      soilTestDate: formData.soilTestDate
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-amber-600" />
          Soil Laboratory Test Data
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Enter soil test metrics from your Soil Health Card to generate pH interpretation and nutrient balancing.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Target Crop"
          name="cropName"
          value={formData.cropName}
          onChange={handleChange}
          required
        />
        <Select
          label="Soil Classification"
          name="soilType"
          value={formData.soilType}
          onChange={handleChange}
          options={SOIL_TYPES}
          required
        />
        <Input
          label="Land Area (Acres)"
          name="landArea"
          type="number"
          step="0.1"
          value={formData.landArea}
          onChange={handleChange}
          required
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Input
          label="Soil pH (0 - 14)"
          name="soilPH"
          type="number"
          step="0.1"
          value={formData.soilPH}
          onChange={handleChange}
          placeholder="7.2"
        />
        <Input
          label="Organic Carbon (%)"
          name="organicCarbon"
          type="number"
          step="0.01"
          value={formData.organicCarbon}
          onChange={handleChange}
          placeholder="0.5"
        />
        <Input
          label="Nitrogen (kg/ha)"
          name="nitrogen"
          type="number"
          value={formData.nitrogen}
          onChange={handleChange}
          placeholder="240"
        />
        <Input
          label="Phosphorus (kg/ha)"
          name="phosphorus"
          type="number"
          value={formData.phosphorus}
          onChange={handleChange}
          placeholder="20"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Potassium (kg/ha)"
          name="potassium"
          type="number"
          value={formData.potassium}
          onChange={handleChange}
          placeholder="160"
        />
        <Input
          label="Date of Soil Lab Test"
          name="soilTestDate"
          type="date"
          value={formData.soilTestDate}
          onChange={handleChange}
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" variant="primary" size="lg" loading={loading}>
          <FlaskConical className="w-4 h-4 mr-2" />
          Calculate Soil & Fertilizer Advisory
        </Button>
      </div>
    </form>
  );
}

export function NutrientCard({ nutrient, status, explanation }) {
  const statusStyles = {
    low: 'bg-rose-100 text-rose-800 border-rose-200',
    adequate: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    high: 'bg-amber-100 text-amber-800 border-amber-200',
    unknown: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-bold text-slate-800">{nutrient}</h4>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusStyles[status] || statusStyles.unknown}`}>
          {status}
        </span>
      </div>
      <p className="text-xs text-slate-600 leading-relaxed">
        {explanation}
      </p>
    </div>
  );
}

