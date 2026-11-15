import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { WelcomeCard, QuickActionCard } from '../../components/dashboard/WelcomeCard.jsx';
import { WeatherCard } from '../../components/dashboard/WeatherCard.jsx';
import { RecentAdvisories, DashboardStatistics } from '../../components/dashboard/RecentAdvisories.jsx';
import { Sprout, ScanLine, FlaskConical, Droplets, CloudSun, MessageSquare } from 'lucide-react';
import api from '../../services/api.js';

export function DashboardPage() {
  const { profile } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [soilTests, setSoilTests] = useState([]);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [recsRes, disRes, soilRes, savedRes] = await Promise.allSettled([
          api.get('/crops/recommendations'),
          api.get('/disease/history'),
          api.get('/soil/history'),
          api.get('/saved')
        ]);

        if (recsRes.status === 'fulfilled' && recsRes.value.success) {
          setRecommendations(recsRes.value.data || []);
        }
        if (disRes.status === 'fulfilled' && disRes.value.success) {
          setDiseases(disRes.value.data || []);
        }
        if (soilRes.status === 'fulfilled' && soilRes.value.success) {
          setSoilTests(soilRes.value.data || []);
        }
        if (savedRes.status === 'fulfilled' && savedRes.value.success) {
          setSavedCount(savedRes.value.data?.length || 0);
        }
      } catch (err) {
        console.warn('Dashboard data fetch warning', err);
      }
    }

    loadDashboardData();
  }, []);

  const totalAdvisories = recommendations.length + diseases.length + soilTests.length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <WelcomeCard profile={profile} />

      {/* Numerical Stats */}
      <DashboardStatistics
        farmSize={profile?.farm_size || 4.0}
        activeCrops={recommendations.length > 0 ? 2 : 1}
        totalAdvisories={totalAdvisories}
        savedCount={savedCount}
      />

      {/* Quick Action Hub */}
      <div>
        <div className="mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Advisory Actions
          </h2>
          <p className="text-xs text-slate-400">Launch real-time AI agricultural analysis</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickActionCard
            icon={Sprout}
            title="Crop Recommendation"
            description="Find high-suitability crops based on soil type, seasonal sowing window, and water availability."
            to="/crop-recommendation"
            badge="AI Powered"
            color="bg-emerald-600"
          />

          <QuickActionCard
            icon={ScanLine}
            title="Diagnose Leaf Disease"
            description="Photograph plant foliage to identify fungal, bacterial, or pest conditions with safe remedies."
            to="/disease-detection"
            badge="Multimodal"
            color="bg-rose-600"
          />

          <QuickActionCard
            icon={CloudSun}
            title="Weather Forecast"
            description="View 7-day live weather, precipitation probabilities, and agro-meteorological disease warnings."
            to="/weather"
            badge="Live Sync"
            color="bg-sky-600"
          />

          <QuickActionCard
            icon={FlaskConical}
            title="Soil & Fertilizer Plan"
            description="Calculate optimal NPK balances, pH corrections, and organic compost additions."
            to="/soil-advisory"
            badge="Soil Health"
            color="bg-amber-600"
          />

          <QuickActionCard
            icon={Droplets}
            title="Irrigation Scheduler"
            description="Determine irrigation duration and volume based on crop phenological stage and recent rain."
            to="/irrigation"
            badge="Water Saving"
            color="bg-blue-600"
          />

          <QuickActionCard
            icon={MessageSquare}
            title="AI Agronomist Chat"
            description="Ask agricultural questions and get context-aware answers in vernacular language."
            to="/chatbot"
            badge="Gemini 2.5"
            color="bg-purple-600"
          />
        </div>
      </div>

      {/* Weather + Recent Advisories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        <WeatherCard stateName={profile?.state} />
        <RecentAdvisories
          recommendations={recommendations}
          diseases={diseases}
          soilTests={soilTests}
        />
      </div>
    </div>
  );
}

