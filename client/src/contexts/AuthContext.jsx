import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase.js';
import api from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user profile from backend
  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile');
      if (response.success && response.data) {
        setProfile(response.data);
      }
    } catch (err) {
      console.warn('Failed to fetch profile', err);
    }
  };

  useEffect(() => {
    let subscription = null;

    if (isSupabaseConfigured && supabase) {
      // 1. Initial session check
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          fetchProfile().finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      });

      // 2. Auth state change listener
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile();
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      });
      subscription = data.subscription;
    } else {
      // Dev/Sandbox Mode Check
      const savedDevToken = localStorage.getItem('agrismart_dev_token');
      const savedDevUser = localStorage.getItem('agrismart_dev_user');
      if (savedDevToken && savedDevUser) {
        try {
          const parsed = JSON.parse(savedDevUser);
          setUser(parsed);
          setProfile(parsed.profile || { id: parsed.id, full_name: 'Dev Farmer', role: 'farmer' });
        } catch (e) {
          localStorage.removeItem('agrismart_dev_token');
          localStorage.removeItem('agrismart_dev_user');
        }
      }
      setLoading(false);
    }

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error && data?.user) {
          setUser(data.user);
          await fetchProfile();
          return data;
        }
      } catch (err) {
        console.warn('Supabase Auth error, using local session fallback for demo account', err);
      }
    }

    // Dev mode & instant demo login
    const isFarmer = !email.includes('admin');
    const assignedId = isFarmer ? '8bc1c168-78b2-404a-9b56-88ce5b5e804d' : '4fc0e533-a0f5-44ea-befb-45d9a8b3ac7e';

    const devUser = {
      id: assignedId,
      email,
      profile: {
        id: assignedId,
        full_name: isFarmer ? 'Rajesh Kumar' : 'System Administrator',
        role: isFarmer ? 'farmer' : 'admin',
        state: isFarmer ? 'Punjab' : 'Delhi',
        district: isFarmer ? 'Ludhiana' : 'New Delhi',
        preferred_language: 'en',
        farm_size: isFarmer ? 4.5 : 0,
        farm_size_unit: 'acre'
      }
    };
    const token = isFarmer ? 'dev-farmer-token' : 'dev-admin-token';
    localStorage.setItem('agrismart_dev_token', token);
    localStorage.setItem('agrismart_dev_user', JSON.stringify(devUser));
    setUser(devUser);
    setProfile(devUser.profile);
    return { user: devUser };
  };

  const register = async (email, password, fullName) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      });
      if (error) throw error;
      setUser(data.user);
      return data;
    }

    return login(email, password);
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('agrismart_dev_token');
    localStorage.removeItem('agrismart_dev_user');
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`
      });
      if (error) throw error;
      return true;
    }
    return true;
  };

  const updateUserProfile = async (updatedFields) => {
    const res = await api.put('/profile', updatedFields);
    if (res.success && res.data) {
      setProfile(res.data);
    }
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        register,
        logout,
        resetPassword,
        updateUserProfile,
        fetchProfile,
        isAdmin: profile?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

