import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.jsx';

// Layouts
import { DashboardLayout } from './components/layout/DashboardLayout.jsx';
import { AuthLayout, ProtectedRoute, AdminRoute } from './components/layout/AuthLayout.jsx';

// Public Pages
import { LandingPage } from './pages/public/LandingPage.jsx';
import { AboutPage, NotFoundPage } from './pages/public/AboutPage.jsx';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage.jsx';
import { RegisterPage, ForgotPasswordPage } from './pages/auth/RegisterPage.jsx';

// Farmer Dashboard Pages
import { DashboardPage } from './pages/dashboard/DashboardPage.jsx';
import { ProfilePage } from './pages/dashboard/ProfilePage.jsx';
import { CropRecommendationPage } from './pages/crops/CropRecommendationPage.jsx';
import { DiseaseDetectionPage } from './pages/disease/DiseaseDetectionPage.jsx';
import { WeatherDashboardPage } from './pages/weather/WeatherDashboardPage.jsx';
import { SoilAdvisoryPage } from './pages/soil/SoilAdvisoryPage.jsx';
import { IrrigationPage } from './pages/irrigation/IrrigationPage.jsx';
import { ChatbotPage } from './pages/chatbot/ChatbotPage.jsx';
import { AdvisoryHistoryPage } from './pages/history/AdvisoryHistoryPage.jsx';
import { AdvisoryDetailsPage } from './pages/history/AdvisoryDetailsPage.jsx';
import { SavedAdvisoriesPage } from './pages/saved/SavedAdvisoriesPage.jsx';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.jsx';
import { AdminCropsPage, AdminArticlesPage, AdminReportsPage } from './pages/admin/AdminCropsPage.jsx';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />

            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>

            {/* Protected Farmer Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/crop-recommendation" element={<CropRecommendationPage />} />
                <Route path="/disease-detection" element={<DiseaseDetectionPage />} />
                <Route path="/weather" element={<WeatherDashboardPage />} />
                <Route path="/soil-advisory" element={<SoilAdvisoryPage />} />
                <Route path="/irrigation" element={<IrrigationPage />} />
                <Route path="/chatbot" element={<ChatbotPage />} />
                <Route path="/history" element={<AdvisoryHistoryPage />} />
                <Route path="/history/:id" element={<AdvisoryDetailsPage />} />
                <Route path="/saved-advisories" element={<SavedAdvisoriesPage />} />
              </Route>
            </Route>

            {/* Protected Admin Routes */}
            <Route element={<AdminRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/crops" element={<AdminCropsPage />} />
                <Route path="/admin/articles" element={<AdminArticlesPage />} />
                <Route path="/admin/reports" element={<AdminReportsPage />} />
              </Route>
            </Route>

            {/* Catch-All */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
