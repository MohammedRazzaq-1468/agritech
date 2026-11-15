import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { PageHeader } from '../../components/layout/DashboardLayout.jsx';
import { Input } from '../../components/common/Input.jsx';
import { Select } from '../../components/common/Select.jsx';
import { Button } from '../../components/common/Button.jsx';
import { INDIAN_STATES } from '../../constants/indianAgri.js';
import { User, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import api from '../../services/api.js';

export function ProfilePage() {
  const { profile, updateUserProfile, logout } = useAuth();

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    state: profile?.state || 'Punjab',
    district: profile?.district || 'Ludhiana',
    village: profile?.village || '',
    preferred_language: profile?.preferred_language || 'en',
    farm_size: profile?.farm_size || 4.5,
    farm_size_unit: profile?.farm_size_unit || 'acre'
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await updateUserProfile({
        ...formData,
        farm_size: parseFloat(formData.farm_size) || 1.0
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your farmer profile? All saved crop recommendations and advisory history will be permanently deleted.')) {
      try {
        await api.delete('/profile');
        await logout();
      } catch (err) {
        alert(err.message || 'Account deletion failed.');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Farmer Profile & Farm Preferences"
        subtitle="Manage your personal agricultural parameters and regional growing context"
      />

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Farmer profile successfully saved!</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
          <div className="w-14 h-14 rounded-full bg-agri-100 text-agri-700 flex items-center justify-center font-bold text-xl">
            {profile?.full_name?.charAt(0) || <User className="w-7 h-7" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{profile?.full_name || 'Farmer'}</h3>
            <p className="text-xs text-slate-500">Account Role: <strong className="uppercase text-agri-700">{profile?.role || 'Farmer'}</strong></p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
          />
          <Input
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 9876543210"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="State"
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
            required
          />
          <Input
            label="Village / Tehsil"
            name="village"
            value={formData.village}
            onChange={handleChange}
            placeholder="e.g. Samrala"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Total Farm Land Area"
            name="farm_size"
            type="number"
            step="0.1"
            value={formData.farm_size}
            onChange={handleChange}
            required
          />
          <Select
            label="Unit"
            name="farm_size_unit"
            value={formData.farm_size_unit}
            onChange={handleChange}
            options={[
              { id: 'acre', label: 'Acres' },
              { id: 'hectare', label: 'Hectares' },
              { id: 'bigha', label: 'Bigha' }
            ]}
          />
          <Select
            label="Preferred Advisory Language"
            name="preferred_language"
            value={formData.preferred_language}
            onChange={handleChange}
            options={[
              { id: 'en', label: 'English' },
              { id: 'hi', label: 'Hindi (हिंदी)' },
              { id: 'es', label: 'Spanish (Español)' },
              { id: 'fr', label: 'French (Français)' }
            ]}
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <Button type="submit" variant="primary" size="md" loading={saving}>
            Save Profile Changes
          </Button>
        </div>
      </form>

      {/* Account Deletion Box */}
      <div className="p-6 bg-white rounded-2xl border border-rose-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-rose-900">Privacy & Account Deletion</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Permanently remove your account and all associated crop advisory sessions.
          </p>
        </div>
        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={handleDeleteAccount}
          className="shrink-0"
        >
          <Trash2 className="w-4 h-4 mr-1.5" />
          Delete Account
        </Button>
      </div>
    </div>
  );
}

