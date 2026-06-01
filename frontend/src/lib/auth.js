import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './api';

const AuthContext = createContext(null);

function calculateHoverColor(hex) {
  if (!hex || !hex.startsWith('#') || hex.length !== 7) return '#1d4ed8';
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  // Darken by 15%
  r = Math.max(0, Math.floor(r * 0.85));
  g = Math.max(0, Math.floor(g * 0.85));
  b = Math.max(0, Math.floor(b * 0.85));
  const rs = r.toString(16).padStart(2, '0');
  const gs = g.toString(16).padStart(2, '0');
  const bs = b.toString(16).padStart(2, '0');
  return `#${rs}${gs}${bs}`;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('hw_user');
    return stored ? JSON.parse(stored) : null;
  });

  const [sessions, setSessions] = useState(() => {
    try {
      const cached = sessionStorage.getItem('hw_cache_sessions');
      return cached ? JSON.parse(cached) : [];
    } catch (_) {
      return [];
    }
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    return localStorage.getItem('hw_active_session_id') || '';
  });

  // Inject theme accent colors dynamically when user settings load or change
  useEffect(() => {
    if (user?.settings?.accentTheme) {
      const primary = user.settings.accentTheme;
      const hover = calculateHoverColor(primary);
      const light = primary + '16'; // 8% opacity in hex for background tints
      
      document.documentElement.style.setProperty('--accent', primary);
      document.documentElement.style.setProperty('--accent-hover', hover);
      document.documentElement.style.setProperty('--accent-light', light);
    } else {
      document.documentElement.style.setProperty('--accent', '#2563eb');
      document.documentElement.style.setProperty('--accent-hover', '#1d4ed8');
      document.documentElement.style.setProperty('--accent-light', '#eff6ff');
    }
  }, [user]);

  // Fetch active sessions from the server with background SWR caching
  useEffect(() => {
    if (!user) return;

    async function fetchServerSessions() {
      try {
        const res = await api.get('/screening');
        if (res && Array.isArray(res)) {
          setSessions(res);
          sessionStorage.setItem('hw_cache_sessions', JSON.stringify(res));
          
          // Set initial active session if none selected
          if (res.length > 0 && !activeSessionId) {
            const firstId = res[0]._id || res[0].id;
            changeActiveSession(firstId);
          }
        }
      } catch (err) {
        console.error('Failed to load server sessions:', err);
      }
    }
    
    fetchServerSessions();
  }, [user]);

  function login(userData) {
    localStorage.setItem('hw_user', JSON.stringify(userData));
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem('hw_user');
    localStorage.removeItem('hw_active_session_id');
    sessionStorage.removeItem('hw_cache_sessions');
    setUser(null);
    setSessions([]);
    setActiveSessionId('');
  }

  function changeActiveSession(id) {
    localStorage.setItem('hw_active_session_id', id);
    setActiveSessionId(id);
  }

  function addNewSession(newSession) {
    const updated = [newSession, ...sessions];
    setSessions(updated);
    sessionStorage.setItem('hw_cache_sessions', JSON.stringify(updated));
    changeActiveSession(newSession._id || newSession.id);
  }

  async function deleteSession(id) {
    try {
      await api.delete(`/screening/${id}`);
      const updated = sessions.filter((s) => s.id !== id && s._id !== id);
      setSessions(updated);
      sessionStorage.setItem('hw_cache_sessions', JSON.stringify(updated));
      
      // Clean up cached candidates for this session
      sessionStorage.removeItem(`hw_cache_candidates_${id}`);

      if (activeSessionId === id) {
        const nextId = updated.length > 0 ? (updated[0]._id || updated[0].id) : '';
        changeActiveSession(nextId);
      }
    } catch (err) {
      console.error('Failed to delete session on server:', err);
      alert('Failed to delete session from server.');
    }
  }

  // Update user profile details and settings on backend + locally
  async function updateUserSettings(profileDetails) {
    try {
      const updatedUser = await api.put('/auth/me/settings', profileDetails);
      if (updatedUser) {
        // Retain token from old state
        const completeUser = {
          ...updatedUser,
          token: user?.token
        };
        localStorage.setItem('hw_user', JSON.stringify(completeUser));
        setUser(completeUser);
        return completeUser;
      }
    } catch (err) {
      console.error('Failed to update recruiter settings:', err);
      throw err;
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        sessions,
        setSessions,
        activeSessionId,
        changeActiveSession,
        addNewSession,
        deleteSession,
        updateUserSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
