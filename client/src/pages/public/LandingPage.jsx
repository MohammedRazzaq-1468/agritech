import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  ScanLine,
  CloudSun,
  FlaskConical,
  Droplets,
  MessageSquare,
  ShieldCheck,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { Button } from '../../components/common/Button.jsx';

export function LandingPage() {
  const features = [
    {
      icon: Sprout,
      title: 'Precision Crop Recommendation',
      description: 'Find the highest-yielding crops tailored to your specific Indian soil type, seasonal sowing window, and water capacity.'
    },
    {
      icon: ScanLine,
      title: 'Multimodal Disease Diagnosis',
      description: 'Upload photographs of infected plant leaves to identify fungal, bacterial, or pest attacks with preventive steps.'
    },
    {
      icon: CloudSun,
      title: 'Verified Weather Advisory',
      description: 'Real-time agrometeorological insights, satellite precipitation forecasts, and proactive heat/pest outbreak warnings.'
    },
    {
      icon: FlaskConical,
      title: 'Soil Nutrient & NPK Guidance',
      description: 'Transform Soil Health Card values into balanced fertilization schedules with organic compost and bio-fertilizer plans.'
    },
    {
      icon: Droplets,
      title: 'Dynamic Irrigation Scheduler',
      description: 'Evapotranspiration-aware water planning based on growth stages to prevent root rot and conserve water.'
    },
    {
      icon: MessageSquare,
      title: '24/7 AI Agronomist Chatbot',
      description: 'Instant answers to agricultural questions in clear, vernacular-friendly language powered by Google Gemini.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-agri-600 text-white flex items-center justify-center shadow-sm">
              <Sprout className="w-5 h-5" />
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900">
              AgriSmart <span className="text-agri-600">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/about" className="text-xs font-semibold text-slate-600 hover:text-agri-600 px-3 py-2">
              About
            </Link>
            <Link to="/login" className="text-xs font-bold text-slate-700 hover:text-agri-600 px-3 py-2">
              Login
            </Link>
            <Link to="/register">
              <Button size="sm" variant="primary">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-agri-100/80 border border-agri-200 text-xs font-bold text-agri-800 mb-6 shadow-xs">
            <Sprout className="w-4 h-4 text-agri-600" />
            Powered by Google Gemini 2.5 & Agricultural Science
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Empowering Farmers With <span className="text-agri-600">AI-Driven</span> Crop Intelligence
          </h1>

          <p className="mt-5 text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Personalized crop recommendations, plant disease detection from photos, verified weather forecasts, and precision nutrient schedules built for Indian agriculture.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" variant="primary" className="w-full sm:w-auto text-base">
                Start Free Consultation
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto text-base">
                Sign In to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative gradient overlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-agri-400/10 blur-[100px] -z-10 pointer-events-none" />
      </section>

      {/* Feature Grid */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Comprehensive Agronomic Decision Support
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Combining farmer field inputs, soil lab tests, live satellite weather, and Gemini AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-50/60 border border-slate-200/80 hover:border-agri-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-agri-600 text-white flex items-center justify-center mb-4 shadow-xs">
                    <feat.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Safety Banner */}
      <section className="py-12 bg-slate-100/60 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <ShieldCheck className="w-8 h-8 text-agri-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-2">Responsible Agronomic Decision Support</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            All AI-generated advisories are engineered as supportive decision information rather than guaranteed scientific conclusions. When uncertain, AgriSmart AI communicates limitations and recommends consultation with qualified Krishi Vigyan Kendra (KVK) officers.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} AgriSmart AI. Developed for Indian Agriculture & Sustainable Farming.</p>
        </div>
      </footer>
    </div>
  );
}

