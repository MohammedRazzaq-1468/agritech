import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Input } from '../../components/common/Input.jsx';
import { Button } from '../../components/common/Button.jsx';
import { AlertCircle, LogIn } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role) => {
    setEmail(role === 'admin' ? 'admin@agrismart.ai' : 'farmer@agrismart.ai');
    setPassword('password123');
    setLoading(true);
    try {
      await login(role === 'admin' ? 'admin@agrismart.ai' : 'farmer@agrismart.ai', 'password123');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Farmer Sign In</h2>
        <p className="text-xs text-slate-500 mt-1">Access your saved recommendations and farm advisories</p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="farmer@example.com"
          required
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-600">
            <input type="checkbox" className="rounded border-slate-300 text-agri-600 focus:ring-agri-500" defaultChecked />
            <span>Remember me</span>
          </label>
          <Link to="/forgot-password" className="font-semibold text-agri-600 hover:text-agri-700">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
          <LogIn className="w-4 h-4 mr-2" />
          Sign In
        </Button>
      </form>

      {/* Quick Demo Access Bar */}
      <div className="pt-4 border-t border-slate-100 text-center">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Instant Sandbox Test Access
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleQuickDemo('farmer')}
            className="flex-1 text-xs"
          >
            Farmer Demo
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleQuickDemo('admin')}
            className="flex-1 text-xs"
          >
            Admin Demo
          </Button>
        </div>
      </div>

      <div className="text-center text-xs text-slate-500 pt-2">
        Don't have an account yet?{' '}
        <Link to="/register" className="font-bold text-agri-600 hover:text-agri-700">
          Create Farmer Profile
        </Link>
      </div>
    </div>
  );
}

