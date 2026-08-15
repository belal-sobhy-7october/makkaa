import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../api/supabaseClient';
import { endpoints } from '../api/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await endpoints.users.getMe();
      setUser(res.data.data);
    } catch (_) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, _session) => {
      loadProfile();
    });
    return () => listener.subscription.unsubscribe();
  }, [loadProfile]);

  const login = async (email, password) => {
    const res = await endpoints.auth.login({ email, password });
    await loadProfile();
    return res.data;
  };

  const signup = async (name, email, password) => {
    const res = await endpoints.auth.signup({ name, email, password });
    await loadProfile();
    return res.data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const refreshUser = loadProfile;

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
