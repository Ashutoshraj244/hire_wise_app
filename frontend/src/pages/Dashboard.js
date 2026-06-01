import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Upload, Users, Star, Clock, ChevronRight, TrendingUp, AlertTriangle } from 'lucide-react';
import AppShell, { PageHeader } from '../components/layout/AppShell';
import { Card, Badge, ScoreBadge, Button } from '../components/ui';
import { SEED_SESSIONS, SEED_CANDIDATES } from '../data/seed';
import { useAuth } from '../lib/auth';
import api from '../lib/api';

function StatCard({ label, value, sub, icon: Icon, accent }) {
  return (
    <Card style={{ padding: '14px 16px', flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
            {label}
          </p>
          <p style={{ fontSize: 22, fontWeight: 600, marginTop: 4, fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}>
            {value}
          </p>
          {sub && <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>{sub}</p>}
        </div>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 6,
            background: accent || 'var(--bg-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={14} color={accent ? 'white' : 'var(--text-2)'} strokeWidth={2} />
        </div>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, changeActiveSession } = useAuth();
  
  const [sessions, setSessions] = useState(() => {
    try {
      const cached = sessionStorage.getItem('hw_cache_sessions');
      return cached ? JSON.parse(cached) : [];
    } catch (_) {}
    return [];
  });
  
  const [candidates, setCandidates] = useState(() => {
    try {
      const cachedSessions = sessionStorage.getItem('hw_cache_sessions');
      if (cachedSessions) {
        const parsed = JSON.parse(cachedSessions);
        if (parsed.length > 0) {
          const cachedCands = sessionStorage.getItem(`hw_cache_candidates_${parsed[0]._id || parsed[0].id}`);
          return cachedCands ? JSON.parse(cachedCands) : [];
        }
      }
    } catch (_) {}
    return [];
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchServerData() {
      // Show loader only if we have NO cached sessions at all
      const hasCache = sessionStorage.getItem('hw_cache_sessions');
      if (!hasCache) {
        setLoading(true);
      }
      setError('');
      try {
        const fetchedSessions = await api.get('/screening');
        setSessions(fetchedSessions);
        sessionStorage.setItem('hw_cache_sessions', JSON.stringify(fetchedSessions));
        
        if (fetchedSessions.length > 0) {
          const latestSession = fetchedSessions[0];
          const sId = latestSession._id || latestSession.id;
          const res = await api.get(`/candidates/session/${sId}`);
          if (res?.candidates) {
            const normalized = res.candidates.map((c) => ({
              id: c._id || c.id,
              name: c.name,
              email: c.email || '—',
              phone: c.phone || '—',
              experience: c.experience,
              education: c.education,
              skills: c.skills || [],
              matchedSkills: c.matchedSkills || [],
              missingSkills: c.missingSkills || [],
              score: c.score,
              scoreBreakdown: c.scoreBreakdown,
              shortlisted: c.shortlisted,
              status: c.status,
              notes: c.notes || '',
              resumeText: '',
            }));
            setCandidates(normalized);
            sessionStorage.setItem(`hw_cache_candidates_${sId}`, JSON.stringify(normalized));
          }
        } else {
          setCandidates([]);
        }
      } catch (err) {
        console.error(err);
        if (!hasCache) {
          setError('Could not connect to live backend API. Verify backend server is running and MONGO_URI is set.');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchServerData();
  }, []);

  const totalResumes = useMemo(() => sessions.reduce((sum, s) => sum + s.resumeCount, 0), [sessions]);
  const shortlisted = useMemo(() => candidates.filter((c) => c.shortlisted).length, [candidates]);
  
  const topCandidate = useMemo(() => {
    if (!candidates.length) return null;
    return [...candidates].sort((a, b) => {
      const aScore = a.scoreBreakdown?.total ?? a.score ?? 0;
      const bScore = b.scoreBreakdown?.total ?? b.score ?? 0;
      return bScore - aScore;
    })[0];
  }, [candidates]);

  const lastSession = sessions[0];

  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back, ${user?.name?.split(' ')[0]}`}
        actions={
          <Button
            size="sm"
            onClick={() => navigate('/upload')}
            style={{ gap: 6 }}
          >
            <Upload size={12} />
            New Screening
          </Button>
        }
      />

      <div style={{ padding: '20px 24px', animation: 'fadeIn 0.2s ease-out' }}>
        {error && (
          <div
            style={{
              padding: '10px 14px',
              background: 'var(--red-bg)',
              border: '1px solid #fecaca',
              borderRadius: 6,
              fontSize: 12,
              color: 'var(--red)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16,
            }}
          >
            <AlertTriangle size={14} />
            <span>{error}</span>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <StatCard
            label="Total Resumes"
            value={totalResumes}
            sub={sessions.length === 0 ? 'No sessions yet' : `across ${sessions.length} sessions`}
            icon={Upload}
          />
          <StatCard
            label="Shortlisted"
            value={shortlisted}
            sub="from latest session"
            icon={Star}
            accent="var(--green)"
          />
          <StatCard
            label="Sessions"
            value={sessions.length}
            sub="total screened"
            icon={Users}
          />
          <StatCard
            label="Last Upload"
            value={lastSession ? formatDistanceToNow(new Date(lastSession.createdAt), { addSuffix: true }) : '—'}
            sub={lastSession ? (lastSession.jobTitle || lastSession.jobId?.title || 'Unknown Role') : 'No uploads yet'}
            icon={Clock}
          />
        </div>

        {/* Top candidate + quick stats row */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          {/* Top candidate */}
          <Card style={{ flex: 2, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Top Match — Latest Session
              </p>
              <TrendingUp size={13} color="var(--green)" />
            </div>
            {topCandidate ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'var(--bg-hover)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'var(--text-2)',
                  }}
                >
                  {topCandidate.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600 }}>{topCandidate.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-3)' }}>
                    {topCandidate.experience}y exp · {(topCandidate.education || '').split(',')[0] || 'N/A'}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <ScoreBadge score={topCandidate.scoreBreakdown?.total ?? topCandidate.score ?? 0} />
                  <button
                    onClick={() => {
                      if (lastSession) changeActiveSession(lastSession._id || lastSession.id);
                      navigate('/results');
                    }}
                    style={{
                      fontSize: 11,
                      color: 'var(--accent)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    View all →
                  </button>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 12, color: 'var(--text-3)', padding: '10px 0' }}>No candidates screened yet in this session.</p>
            )}
          </Card>

          {/* Quick summary */}
          <Card style={{ flex: 1, padding: '14px 16px' }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
              Score Distribution
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: '80–100 (Strong)', count: candidates.filter((c) => (c.scoreBreakdown?.total ?? c.score ?? 0) >= 80).length, color: 'var(--green)' },
                { label: '65–79 (Good)', count: candidates.filter((c) => { const s = c.scoreBreakdown?.total ?? c.score ?? 0; return s >= 65 && s < 80; }).length, color: 'var(--orange)' },
                { label: 'Below 65', count: candidates.filter((c) => (c.scoreBreakdown?.total ?? c.score ?? 0) < 65).length, color: 'var(--red)' },
              ].map((row) => (
                <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: row.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: 'var(--text-2)', flex: 1 }}>{row.label}</span>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{row.count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent sessions */}
        <Card>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 13, fontWeight: 600 }}>Recent Screening Sessions</p>
            <button
              onClick={() => navigate('/upload')}
              style={{
                fontSize: 11,
                color: 'var(--accent)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              + New session
            </button>
          </div>
          <table style={{ width: '100%' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
                {['Job Title', 'Resumes', 'Shortlisted', 'Top Score', 'Top Candidate', 'Created', 'Status', ''].map((h) => (
                  <th key={h} style={{ padding: '8px 12px', fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '20px', textAlign: 'center', fontSize: 12, color: 'var(--text-3)' }}>
                    No sessions screened yet. Click "New Screening" to begin!
                  </td>
                </tr>
              ) : (
                sessions.map((session, i) => {
                  const title = session.jobTitle || session.jobId?.title || 'Unknown Role';
                  const topCandidateName = session.topCandidate || '—';
                  const topScoreVal = session.topScore || 0;
                  const timeText = session.createdAt ? formatDistanceToNow(new Date(session.createdAt), { addSuffix: true }) : '—';
                  return (
                    <tr
                      key={session._id || session.id}
                      style={{
                        borderBottom: i < sessions.length - 1 ? '1px solid var(--border)' : 'none',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      onClick={() => {
                        changeActiveSession(session._id || session.id);
                        navigate('/results');
                      }}
                    >
                      <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 500 }}>
                        {title}
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>
                        {session.resumeCount}
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                        <span style={{ color: 'var(--green)' }}>{session.shortlistedCount}</span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <ScoreBadge score={topScoreVal} />
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text-2)' }}>
                        {topCandidateName}
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 11, color: 'var(--text-3)' }}>
                        {timeText}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <Badge color={session.status === 'completed' ? 'green' : session.status === 'processing' ? 'orange' : 'red'}>
                          {session.status || 'Completed'}
                        </Badge>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <ChevronRight size={13} color="var(--text-3)" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </AppShell>
  );
}
