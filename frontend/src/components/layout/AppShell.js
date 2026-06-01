import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Upload,
  Users,
  LogOut,
  Briefcase,
  Folder,
  Trash2,
  ChevronDown,
  ChevronUp,
  Settings,
  Plus,
  Moon,
  Sun,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import api from '../../lib/api';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/upload', icon: Upload, label: 'Screen Resumes' },
  { to: '/results', icon: Users, label: 'Candidates' },
];

function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      style={{ textDecoration: 'none' }}
    >
      {({ isActive }) => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 10px',
            borderRadius: 4,
            fontSize: 13,
            fontWeight: 500,
            color: isActive ? 'var(--text)' : 'var(--text-2)',
            background: isActive ? 'var(--bg-hover)' : 'transparent',
            transition: 'background 0.1s, color 0.1s',
          }}
        >
          <Icon size={15} strokeWidth={isActive ? 2.2 : 1.8} />
          {label}
        </div>
      )}
    </NavLink>
  );
}

export default function AppShell({ children }) {
  const {
    user,
    logout,
    sessions,
    activeSessionId,
    changeActiveSession,
    deleteSession,
  } = useAuth();
  
  const navigate = useNavigate();
  const [pipelinesOpen, setPipelinesOpen] = useState(true);
  
  // Pipeline Creation States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState('');
  const [creating, setCreating] = useState(false);

  // Theme Settings States
  const [themeColor, setThemeColor] = useState(() => localStorage.getItem('hw_theme_color') || '#2563eb');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('hw_dark_mode') === 'true');

  React.useEffect(() => {
    document.documentElement.style.setProperty('--accent', themeColor);
    document.documentElement.style.setProperty('--accent-light', `color-mix(in srgb, ${themeColor} 12%, transparent)`);
    
    // Dynamic premium tinting based on dark mode & accent color
    const baseBg = darkMode ? '#09090b' : '#f8f8f8'; // Cleaner base
    const baseBgPanel = darkMode ? '#18181b' : '#ffffff';
    const baseBgSubtle = darkMode ? '#27272a' : '#f1f1f3';
    const baseBgHover = darkMode ? '#3f3f46' : '#e4e4e7';
    const baseBorder = darkMode ? '#3f3f46' : '#e4e4e7';
    
    // Mix accent color into base colors for a unified premium aesthetic
    document.documentElement.style.setProperty('--bg', `color-mix(in srgb, ${themeColor} ${darkMode ? '6%' : '3%'}, ${baseBg})`);
    document.documentElement.style.setProperty('--bg-panel', `color-mix(in srgb, ${themeColor} ${darkMode ? '3%' : '1%'}, ${baseBgPanel})`);
    document.documentElement.style.setProperty('--bg-subtle', `color-mix(in srgb, ${themeColor} ${darkMode ? '8%' : '4%'}, ${baseBgSubtle})`);
    document.documentElement.style.setProperty('--bg-hover', `color-mix(in srgb, ${themeColor} ${darkMode ? '12%' : '6%'}, ${baseBgHover})`);
    document.documentElement.style.setProperty('--border', `color-mix(in srgb, ${themeColor} ${darkMode ? '18%' : '8%'}, ${baseBorder})`);
    document.documentElement.style.setProperty('--border-strong', `color-mix(in srgb, ${themeColor} ${darkMode ? '28%' : '15%'}, ${baseBorder})`);

    // Premium gradient for the main background body
    const gradient = `linear-gradient(145deg, var(--bg) 0%, color-mix(in srgb, ${themeColor} ${darkMode ? '12%' : '6%'}, var(--bg)) 100%)`;
    document.documentElement.style.setProperty('--bg-gradient', gradient);
    
    localStorage.setItem('hw_theme_color', themeColor);
  }, [themeColor, darkMode]);

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('hw_dark_mode', darkMode.toString());
  }, [darkMode]);

  const { addNewSession } = useAuth();

  async function handleAddPipeline(e) {
    e.preventDefault();
    if (!newJobTitle.trim()) return;
    setCreating(true);
    try {
      // 1. Create a placeholder job in Atlas
      const job = await api.post('/jobs', {
        title: newJobTitle.trim(),
        company: user?.company || 'Acme Corp',
        description: `${newJobTitle.trim()} — Job Description\n\nWe are looking for a skilled ${newJobTitle.trim()} to join our team.`,
      });
      const jobId = job._id || job.id;

      // 2. Bind a new Screening Session to it
      const session = await api.post('/screening', { jobId });
      const sessionId = session._id || session.id;

      const newSessionRecord = {
        _id: sessionId,
        jobId: {
          _id: jobId,
          title: newJobTitle.trim(),
          company: user?.company || 'Acme Corp',
          description: `${newJobTitle.trim()} — Job Description\n\nWe are looking for a skilled ${newJobTitle.trim()} to join our team.`,
        },
        resumeCount: 0,
        shortlistedCount: 0,
        createdAt: new Date().toISOString(),
        status: 'completed',
        topScore: 0,
        topCandidate: '—',
      };

      // 3. Register in SWR local storage cache + global state
      const currentSessions = [newSessionRecord, ...sessions];
      sessionStorage.setItem('hw_cache_sessions', JSON.stringify(currentSessions));
      addNewSession(newSessionRecord);
      
      setNewJobTitle('');
      setShowAddModal(false);
      navigate('/results');
    } catch (err) {
      console.error(err);
      alert('Failed to initialize screening session on server.');
    } finally {
      setCreating(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 200,
          minWidth: 200,
          background: 'linear-gradient(180deg, var(--bg-panel) 0%, color-mix(in srgb, var(--accent) 4%, var(--bg-panel)) 100%)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          padding: '0',
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: '14px 14px 12px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div
              style={{
                width: 22,
                height: 22,
                background: 'var(--text)',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Briefcase size={12} color="var(--bg-panel)" strokeWidth={2.5} />
            </div>
            <span style={{ fontWeight: 600, fontSize: 13, letterSpacing: '-0.01em' }}>
              HireWise
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '8px 8px', display: 'flex', flexDirection: 'column', gap: 1 }}>
          {NAV.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>

        {/* Active Pipelines Collapsible Section */}
        <div
          style={{
            padding: '10px 8px 6px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            flex: 1,
            minHeight: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '4px 6px',
            }}
          >
            <button
              onClick={() => setPipelinesOpen(!pipelinesOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: 'none',
                border: 'none',
                color: 'var(--text-3)',
                fontSize: 10,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                outline: 'none',
                padding: 0,
              }}
            >
              <span>Active Pipelines ({sessions.length})</span>
              {pipelinesOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              title="Add New Pipeline"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-2)',
                cursor: 'pointer',
                padding: 2,
                display: 'flex',
                alignItems: 'center',
                borderRadius: 3,
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Plus size={12} />
            </button>
          </div>

          {pipelinesOpen && (
            <div
              style={{
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                marginTop: 4,
                paddingRight: 2,
              }}
            >
              {sessions.length === 0 ? (
                <p style={{ fontSize: 11, color: 'var(--text-3)', padding: '6px 8px', fontStyle: 'italic' }}>
                  No active pipelines
                </p>
              ) : (
                sessions.map((session) => {
                  const sId = session._id || session.id;
                  const isActive = activeSessionId === sId;
                  const title = session.jobTitle || session.jobId?.title || 'Unknown Role';
                  
                  return (
                    <div
                      key={sId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '4px 6px',
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? 'var(--text)' : 'var(--text-2)',
                        background: isActive ? 'var(--bg-hover)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background 0.1s',
                      }}
                      onClick={() => {
                        changeActiveSession(sId);
                        navigate('/results');
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.background = 'var(--bg-subtle)';
                        const btn = e.currentTarget.querySelector('.delete-btn');
                        if (btn) btn.style.opacity = '1';
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.background = 'transparent';
                        const btn = e.currentTarget.querySelector('.delete-btn');
                        if (btn) btn.style.opacity = '0';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flex: 1 }}>
                        <Folder size={12} color={isActive ? 'var(--accent)' : 'var(--text-3)'} />
                        <span
                          style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'block',
                          }}
                          title={title}
                        >
                          {title}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 6 }}>
                        <span
                          style={{
                            fontSize: 10,
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--text-3)',
                          }}
                        >
                          {session.resumeCount || 0}
                        </span>
                        
                        <button
                          className="delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Are you sure you want to close the "${title}" pipeline?`)) {
                              deleteSession(sId);
                            }
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 2,
                            color: 'var(--red)',
                            opacity: 0,
                            transition: 'opacity 0.15s',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title="Close pipeline"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>



        {/* User */}
        <div
          style={{
            padding: '10px 12px',
            borderTop: '1px solid var(--border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{user?.name}</p>
              <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{user?.role}</p>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                onClick={() => setDarkMode(!darkMode)}
                title="Toggle Dark Mode"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 4,
                  color: 'var(--text-3)',
                  cursor: 'pointer',
                  borderRadius: 3,
                }}
              >
                {darkMode ? <Sun size={14} /> : <Moon size={14} />}
              </button>
              <button
                onClick={() => navigate('/account')}
                title="Account & Settings"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 4,
                  color: 'var(--text-3)',
                  cursor: 'pointer',
                  borderRadius: 3,
                }}
              >
                <Settings size={14} />
              </button>
              <button
                onClick={handleLogout}
                title="Sign out"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 4,
                  color: 'var(--text-3)',
                  cursor: 'pointer',
                  borderRadius: 3,
                }}
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main
        style={{
          flex: 1,
          overflow: 'auto',
          background: 'var(--bg)',
        }}
      >
        {children}
      </main>

      {/* Add Pipeline Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          <div
            style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: 20,
              width: '100%',
              maxWidth: 360,
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            }}
          >
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: 'var(--text)' }}>Create New Pipeline</h3>
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 16 }}>
              Enter a job role to initialize a clean resume screening pipeline in your database.
            </p>
            <form onSubmit={handleAddPipeline} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-2)' }}>Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Backend Engineer"
                  value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                  required
                  autoFocus
                  style={{
                    padding: '6px 10px',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius)',
                    fontSize: 13,
                    outline: 'none',
                    background: 'transparent',
                    color: 'var(--text)',
                    width: '100%',
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewJobTitle('');
                  }}
                  style={{
                    padding: '5px 12px',
                    background: 'none',
                    border: 'none',
                    fontSize: 12,
                    cursor: 'pointer',
                    color: 'var(--text-2)',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  style={{
                    padding: '5px 14px',
                    background: 'var(--accent)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: creating ? 'not-allowed' : 'pointer',
                    opacity: creating ? 0.6 : 1,
                  }}
                >
                  {creating ? 'Creating...' : 'Create Pipeline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div
      style={{
        padding: '18px 24px 16px',
        background: 'var(--bg-panel)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <h1 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{actions}</div>}
    </div>
  );
}
