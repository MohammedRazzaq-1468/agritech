import React, { useState } from 'react';
import { PageHeader } from '../../components/layout/DashboardLayout.jsx';
import { ImageUploader } from '../../components/disease/ImageUploader.jsx';
import { DiseaseAnalysisCard } from '../../components/disease/DiseaseAnalysisCard.jsx';
import { Input } from '../../components/common/Input.jsx';
import { Select } from '../../components/common/Select.jsx';
import { Textarea } from '../../components/common/Textarea.jsx';
import { Button } from '../../components/common/Button.jsx';
import { ScanLine, AlertCircle, Sparkles } from 'lucide-react';
import api from '../../services/api.js';

export function DiseaseDetectionPage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [cropName, setCropName] = useState('Tomato');
  const [growthStage, setGrowthStage] = useState('Vegetative / Early Tillering');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleImageSelected = (file, previewUrl) => {
    setSelectedImage({ file, previewUrl });
    setError(null);
  };

  const handleClear = () => {
    setSelectedImage(null);
    setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage) {
      setError('Please capture or select an infected plant leaf photograph first.');
      return;
    }
    if (!cropName.trim()) {
      setError('Please enter the crop name.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage.file);
      formData.append('cropName', cropName);
      formData.append('growthStage', growthStage);
      formData.append('symptoms', symptoms);

      const res = await api.post('/disease/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.success && res.data) {
        setResult(res.data);
      }
    } catch (err) {
      setError(err.message || 'Plant disease analysis failed. Please try again with a clearer photograph.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <PageHeader
        title="AI Crop Disease & Pest Diagnostic Suite"
        subtitle="Upload a plant photograph for Gemini multimodal vision analysis, symptom mapping, and IPM remediation"
      />

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload & Context Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Plant Photograph <span className="text-rose-500">*</span>
          </label>
          <ImageUploader
            onImageSelected={handleImageSelected}
            selectedImage={selectedImage}
            onClear={handleClear}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Plant / Crop Variety"
            value={cropName}
            onChange={(e) => setCropName(e.target.value)}
            placeholder="e.g. Tomato, Cotton, Rice, Wheat"
            required
          />
          <Select
            label="Observed Growth Stage"
            value={growthStage}
            onChange={(e) => setGrowthStage(e.target.value)}
            options={[
              'Germination / Nursery',
              'Vegetative / Early Tillering',
              'Flowering / Anthesis',
              'Fruit / Pod Development',
              'Ripening / Near Harvest'
            ]}
          />
        </div>

        <Textarea
          label="Field Observations & Symptoms (Optional)"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="e.g. Dark spots on lower leaves with yellow margins after heavy rain; spreading upward."
          rows={2}
        />

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            disabled={!selectedImage}
            className="w-full sm:w-auto"
          >
            <ScanLine className="w-4 h-4 mr-2" />
            Analyze Plant Health with Gemini AI
          </Button>
        </div>
      </form>

      {/* Analysis Result Card */}
      {result && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-agri-600" />
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Diagnostic Report & Pathology Findings
            </h3>
          </div>

          <DiseaseAnalysisCard
            result={result}
            analysisId={result.id}
          />
        </div>
      )}
    </div>
  );
}

