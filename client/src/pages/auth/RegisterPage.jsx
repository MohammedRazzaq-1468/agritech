import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Input } from '../../components/common/Input.jsx';
import { Select } from '../../components/common/Select.jsx';
import { Button } from '../../components/common/Button.jsx';
import { INDIAN_STATES } from '../../constants/indianAgri.js';
import { AlertCircle, UserPlus } from 'lucide-react';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    state: 'Punjab',
    district: 'Ludhiana',
    farmSize: '3.5',
    preferredLanguage: 'en'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await register(formData.email, formData.password, formData.fullName);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Create Farmer Account</h2>
        <p className="text-xs text-slate-500 mt-1">Get personalized crop, weather, and soil health advisory</p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          label="Farmer Full Name"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="e.g. Ramesh Chandra"
          required
        />

        <Input
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="farmer@example.com"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />
          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Home State"
            name="state"
            value={formData.state}
            onChange={handleChange}
            options={INDIAN_STATES}
            required
          />
          <Input
            label="District"
            name="district"
            value={formData.district}
            onChange={handleChange}
            placeholder="e.g. Ludhiana, Nashik"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Farm Size (Acres)"
            name="farmSize"
            type="number"
            step="0.1"
            value={formData.farmSize}
            onChange={handleChange}
            required
          />
          <Select
            label="Preferred Language"
            name="preferredLanguage"
            value={formData.preferredLanguage}
            onChange={handleChange}
            options={[
              { id: 'en', label: 'English' },
              { id: 'hi', label: 'Hindi (हिंदी)' },
              { id: 'es', label: 'Spanish (Español)' },
              { id: 'fr', label: 'French (Français)' }
            ]}
          />
        </div>

        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
          <UserPlus className="w-4 h-4 mr-2" />
          Register & Continue to Dashboard
        </Button>
      </form>

      <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
        Already registered?{' '}
        <Link to="/login" className="font-bold text-agri-600 hover:text-agri-700">
          Sign In Here
        </Link>
      </div>
    </div>
  );
}

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError('Please provide your registered email address.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Password Recovery</h2>
        <p className="text-xs text-slate-500 mt-1">We will send instructions to reset your account password</p>
      </div>

      {success ? (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-2">
          <p className="font-bold">Password reset email dispatched!</p>
          <p>Please check your inbox at <strong>{email}</strong> for instructions.</p>
          <div className="pt-2">
            <Link to="/login" className="font-bold text-emerald-700 hover:underline">
              Return to Login &rarr;
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <Input
            label="Registered Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="farmer@example.com"
            required
          />

          <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
            Send Reset Instructions
          </Button>

          <div className="text-center text-xs text-slate-500">
            Remembered your credentials?{' '}
            <Link to="/login" className="font-bold text-agri-600 hover:text-agri-700">
              Back to Login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

