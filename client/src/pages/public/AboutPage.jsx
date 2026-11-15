import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ArrowLeft, Target, Cpu, Shield, Globe } from 'lucide-react';
import { Button } from '../../components/common/Button.jsx';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-700">Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-agri-600" />
            <span className="text-sm font-extrabold text-slate-900">AgriSmart AI</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              About AgriSmart AI
            </h1>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              AgriSmart AI is an intelligent agricultural advisory assistant engineered to empower smallholder and commercial farmers in India with precision, context-aware agronomic guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-agri-600 font-bold text-sm">
                <Target className="w-5 h-5" />
                <span>Our Core Directive</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                To bridge the critical gap between complex agricultural science and daily field decisions. We combine verified soil health data, real-time satellite meteorology, and Google Gemini 2.5 to provide clear, actionable advice.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sky-600 font-bold text-sm">
                <Cpu className="w-5 h-5" />
                <span>Modern AI Architecture</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Utilizing the official Google GenAI SDK (`@google/genai`) with strictly enforced JSON schemas and agronomist system prompts to eliminate hallucinations and deliver structured, verifiable insights.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                <Shield className="w-5 h-5" />
                <span>Safety & Stewardship</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                We advocate Integrated Pest Management (IPM), promoting mechanical and organic biological remedies first. Chemical interventions require clear PPE instructions and Pre-Harvest Interval (PHI) compliance.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                <Globe className="w-5 h-5" />
                <span>Built for Indian Agriculture</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Aligned with ICAR standards, Indian soil categories (Alluvial, Black/Regur, Red, Laterite), seasonal windows (Kharif, Rabi, Zaid), and regional crop varieties across 28 states.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-center">
            <Link to="/register">
              <Button size="lg" variant="primary">
                Register Your Farm Account
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 font-black text-2xl">
        404
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-1">Page Not Found</h2>
      <p className="text-xs text-slate-500 max-w-sm mb-6">
        The agricultural advisory page you are looking for does not exist or may have been moved.
      </p>
      <Link to="/dashboard">
        <Button variant="primary">
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
}

