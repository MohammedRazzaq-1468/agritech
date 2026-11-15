import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { LoadingScreen } from '../common/LoadingScreen.jsx';
import { Sprout } from 'lucide-react';

export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Checking authentication status..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export function AdminRoute() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Checking administrative credentials..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-agri-600 text-white flex items-center justify-center mx-auto shadow-md mb-3">
          <Sprout className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          AgriSmart <span className="text-agri-600">AI</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">Intelligent Agriculture Crop Advisory Assistant</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100 sm:px-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

