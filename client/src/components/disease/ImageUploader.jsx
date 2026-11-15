import React, { useRef, useState } from 'react';
import { Camera, UploadCloud, X, AlertCircle } from 'lucide-react';
import { Button } from '../common/Button.jsx';

export function ImageUploader({ onImageSelected, selectedImage, onClear }) {
  const fileInputRef = useRef(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file) => {
    setError(null);
    if (!file) return;

    // Validate MIME type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setError('Please upload a valid image (JPG, PNG, or WEBP).');
      return;
    }

    // Validate size (10 MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image file exceeds the 10 MB limit. Please take a smaller picture.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    onImageSelected(file, previewUrl);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files && handleFile(e.target.files[0])}
      />

      {selectedImage ? (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group">
          <img
            src={selectedImage.previewUrl}
            alt="Plant symptom preview"
            className="w-full h-64 sm:h-80 object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-between p-4">
            <span className="text-xs text-white/90 font-medium truncate max-w-xs">
              {selectedImage.file.name} ({(selectedImage.file.size / (1024 * 1024)).toFixed(2)} MB)
            </span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClear}
              className="bg-white/90 text-slate-900 border-none hover:bg-white"
            >
              <X className="w-4 h-4 mr-1 text-rose-600" />
              Replace Photo
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
            dragActive
              ? 'border-agri-500 bg-agri-50/50'
              : 'border-slate-300 hover:border-agri-400 bg-slate-50/50 hover:bg-white'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-white text-agri-600 shadow-sm border border-slate-100 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <UploadCloud className="w-7 h-7" />
          </div>

          <h4 className="text-sm font-bold text-slate-800 mb-1">
            Tap to photograph plant or drag leaf image here
          </h4>
          <p className="text-xs text-slate-500 max-w-xs mb-4">
            Supports JPG, PNG, and WEBP up to 10 MB. Focus clearly on leaf spots, lesions, or insect damage.
          </p>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            >
              <Camera className="w-4 h-4 mr-1.5" />
              Take Photo
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-2.5 p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

