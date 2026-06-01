import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Download, SlidersHorizontal, Star,
  ChevronUp, ChevronDown, ChevronsUpDown, X, AlertTriangle,
  UserPlus, Edit3, Plus, Loader2, CheckCircle2, Sliders, Sparkles
} from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import AppShell, { PageHeader } from '../components/layout/AppShell';
import { Button, Badge, ScoreBadge, ScoreBar, EmptyState, Card, Input } from '../components/ui';
import CandidateDrawer from '../components/screening/CandidateDrawer';
import { useAuth } from '../lib/auth';
import api from '../lib/api';

const PAGE_SIZE = 10;

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function SortIcon({ col, sort }) {
  if (sort.col !== col) return <ChevronsUpDown size={11} color="var(--text-3)" />;
  return sort.dir === 'asc'
    ? <ChevronUp size={11} color="var(--text)" />
    : <ChevronDown size={11} color="var(--text)" />;
}

function StatusBadge({ status, shortlisted }) {
  if (shortlisted) return <Badge color="green">Shortlisted</Badge>;
  if (status === 'rejected') return <Badge color="red">Rejected</Badge>;
  return <Badge>Reviewing</Badge>;
}

export default function Results() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeSessionId } = useAuth();

  const [candidates, setCandidates] = useState(() => {
    try {
      if (activeSessionId) {
        const cached = sessionStorage.getItem(`hw_cache_candidates_${activeSessionId}`);
        return cached ? JSON.parse(cached) : [];
      }
    } catch (_) {}
    return [];
  });

  // Add Candidate Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [candName, setCandName] = useState('');
  const [candEmail, setCandEmail] = useState('');
  const [candPhone, setCandPhone] = useState('');
  const [candScore, setCandScore] = useState(70);
  const [candExp, setCandExp] = useState(0);
  const [candEdu, setCandEdu] = useState('');
  const [candSkills, setCandSkills] = useState('');
  const [candCollege, setCandCollege] = useState('');
  const [candCompany, setCandCompany] = useState('');
  const [candRole, setCandRole] = useState('');
  const [candSaving, setCandSaving] = useState(false);
  const [attachedResumeId, setAttachedResumeId] = useState(null);
  const [attachedResumeName, setAttachedResumeName] = useState('');
  const [parsingFile, setParsingFile] = useState(false);

  // Update JD Modal States
  const [showJdModal, setShowJdModal] = useState(false);
  const [jdContent, setJdContent] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jdLoading, setJdLoading] = useState(false);
  const [jdSaving, setJdSaving] = useState(false);

  // Weights Modal State
  const [showWeightsModal, setShowWeightsModal] = useState(false);
  const [weightsLoading, setWeightsLoading] = useState(false);
  const [weightsSaving, setWeightsSaving] = useState(false);
  const [weights, setWeights] = useState({ skills: 50, experience: 25, education: 15, keyword: 10 });

  function handleWeightChange(key, value) {
    const newVal = parseInt(value, 10);
    const difference = newVal - weights[key];
    const keysToAdjust = Object.keys(weights).filter(k => k !== key);
    const currentSumOfOthers = keysToAdjust.reduce((sum, k) => sum + weights[k], 0);

    let updatedWeights = { ...weights, [key]: newVal };

    if (currentSumOfOthers > 0) {
      keysToAdjust.forEach(k => {
        const proportion = weights[k] / currentSumOfOthers;
        const adjustment = difference * proportion;
        updatedWeights[k] = Math.max(0, Math.round(weights[k] - adjustment));
      });
    } else {
      const equalShare = difference / 3;
      keysToAdjust.forEach(k => {
        updatedWeights[k] = Math.max(0, Math.round(weights[k] - equalShare));
      });
    }

    let totalSum = Object.values(updatedWeights).reduce((sum, val) => sum + val, 0);
    let errorDiff = 100 - totalSum;

    if (errorDiff !== 0) {
      const targetAdjustKey = keysToAdjust.find(k => updatedWeights[k] + errorDiff >= 0) || key;
      updatedWeights[targetAdjustKey] += errorDiff;
    }

    setWeights(updatedWeights);
  }

  async function handleOpenWeightsModal() {
    setShowWeightsModal(true);
    setWeightsLoading(true);
    try {
      const session = await api.get(`/screening/${activeSessionId}`);
      if (session) {
        if (session.weights) setWeights(session.weights);
        if (session.jobId) setJdContent(session.jobId.description || '');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to fetch session weights.');
    } finally {
      setWeightsLoading(false);
    }
  }

  async function handleSaveWeights(e) {
    e.preventDefault();
    setWeightsSaving(true);
    try {
      await api.patch(`/screening/${activeSessionId}/weights`, { weights });
      
      let currentJd = jdContent;
      if (!currentJd) {
        const session = await api.get(`/screening/${activeSessionId}`);
        currentJd = session.jobId?.description || '';
      }
      
      const runRes = await api.post(`/screening/${activeSessionId}/run`, {
        jdText: currentJd.trim()
      });

      if (runRes && runRes.candidates) {
        const normalized = runRes.candidates.map((c) => ({
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
        
        normalized.sort((a, b) => b.score - a.score);
        setCandidates(normalized);
        sessionStorage.setItem(`hw_cache_candidates_${activeSessionId}`, JSON.stringify(normalized));

        try {
          const cachedSessions = sessionStorage.getItem('hw_cache_sessions');
          if (cachedSessions) {
            const parsed = JSON.parse(cachedSessions);
            const idx = parsed.findIndex(s => s._id === activeSessionId || s.id === activeSessionId);
            if (idx !== -1) {
              parsed[idx].shortlistedCount = normalized.filter(c => c.shortlisted).length;
              if (normalized[0]) {
                parsed[idx].topScore = normalized[0].score;
                parsed[idx].topCandidate = normalized[0].name;
              }
              sessionStorage.setItem('hw_cache_sessions', JSON.stringify(parsed));
            }
          }
        } catch (_) {}
      }

      setShowWeightsModal(false);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to update weights and re-score candidates.');
    } finally {
      setWeightsSaving(false);
    }
  }

  async function handleAttachResume(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsingFile(true);
    try {
      const formData = new FormData();
      formData.append('sessionId', activeSessionId);
      formData.append('file', file);

      const res = await api.post('/resumes/parse-and-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res && res.success) {
        setAttachedResumeId(res.resumeId);
        setAttachedResumeName(file.name);

        const info = res.parsed;
        if (info.name) setCandName(info.name);
        if (info.email) setCandEmail(info.email);
        if (info.phone) setCandPhone(info.phone);
        if (info.experience) setCandExp(info.experience);
        if (info.education) setCandEdu(info.education);
        if (info.college) setCandCollege(info.college);
        if (info.recentCompany) setCandCompany(info.recentCompany);
        if (info.recentRole) setCandRole(info.recentRole);
        if (info.skills && info.skills.length > 0) {
          setCandSkills(info.skills.join(', '));
        }
        setCandScore(75); // Premium preset start score
      }
    } catch (err) {
      console.error(err);
      alert('Failed to parse and upload resume on server.');
    } finally {
      setParsingFile(false);
      e.target.value = '';
    }
  }

  async function handleAddCandidate(e) {
    e.preventDefault();
    if (!candName.trim() || candScore === '') return;
    setCandSaving(true);
    try {
      const payload = {
        sessionId: activeSessionId,
        resumeId: attachedResumeId || undefined,
        name: candName.trim(),
        email: candEmail.trim() || undefined,
        phone: candPhone.trim() || undefined,
        skills: candSkills.trim() || undefined,
        experience: Number(candExp) || 0,
        education: candEdu.trim() || undefined,
        college: candCollege.trim() || undefined,
        recentCompany: candCompany.trim() || undefined,
        recentRole: candRole.trim() || undefined,
        score: Number(candScore) || 0,
      };

      const newCand = await api.post('/candidates', payload);
      
      const updatedList = [...candidates, {
        id: newCand._id || newCand.id,
        name: newCand.name,
        email: newCand.email || '—',
        phone: newCand.phone || '—',
        experience: newCand.experience,
        education: newCand.education,
        college: newCand.college || '—',
        recentCompany: newCand.recentCompany || '—',
        recentRole: newCand.recentRole || '—',
        skills: newCand.skills || [],
        matchedSkills: newCand.matchedSkills || [],
        missingSkills: newCand.missingSkills || [],
        score: newCand.score,
        scoreBreakdown: newCand.scoreBreakdown,
        shortlisted: newCand.shortlisted,
        status: newCand.status,
        notes: newCand.notes || '',
        resumeText: '',
      }];

      updatedList.sort((a, b) => b.score - a.score);
      
      // Update local storage and context sessions list to synchronize candidate counts!
      try {
        const cachedSessions = sessionStorage.getItem('hw_cache_sessions');
        if (cachedSessions) {
          const parsed = JSON.parse(cachedSessions);
          const idx = parsed.findIndex(s => s._id === activeSessionId || s.id === activeSessionId);
          if (idx !== -1) {
            parsed[idx].resumeCount = updatedList.length;
            parsed[idx].shortlistedCount = updatedList.filter(c => c.shortlisted).length;
            if (updatedList[0]) {
              parsed[idx].topScore = updatedList[0].score;
              parsed[idx].topCandidate = updatedList[0].name;
            }
            sessionStorage.setItem('hw_cache_sessions', JSON.stringify(parsed));
          }
        }
      } catch (_) {}

      setCandidates(updatedList);
      sessionStorage.setItem(`hw_cache_candidates_${activeSessionId}`, JSON.stringify(updatedList));

      // Reset
      setCandName('');
      setCandEmail('');
      setCandPhone('');
      setCandScore(70);
      setCandExp(0);
      setCandEdu('');
      setCandSkills('');
      setCandCollege('');
      setCandCompany('');
      setCandRole('');
      setAttachedResumeId(null);
      setAttachedResumeName('');
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
      alert('Failed to manually inject candidate on server.');
    } finally {
      setCandSaving(false);
    }
  }

  async function handleOpenJdModal() {
    setShowJdModal(true);
    setJdLoading(true);
    try {
      const session = await api.get(`/screening/${activeSessionId}`);
      if (session && session.jobId) {
        setJdContent(session.jobId.description || '');
        setJobTitle(session.jobId.title || '');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to fetch current job details from server.');
    } finally {
      setJdLoading(false);
    }
  }

  async function handleUpdateJd(e) {
    e.preventDefault();
    if (!jdContent.trim()) return;
    setJdSaving(true);
    try {
      const session = await api.get(`/screening/${activeSessionId}`);
      const jobId = session.jobId?._id || session.jobId?.id;
      if (!jobId) throw new Error('No job associated with this session.');

      // 1. PATCH the Job details
      await api.patch(`/jobs/${jobId}`, {
        title: jobTitle.trim(),
        description: jdContent.trim()
      });

      // 2. Re-run scoring against the new JD text
      const runRes = await api.post(`/screening/${activeSessionId}/run`, {
        jdText: jdContent.trim()
      });

      if (runRes && runRes.candidates) {
        const normalized = runRes.candidates.map((c) => ({
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
        
        // Re-sort by score and set rank
        normalized.sort((a, b) => b.score - a.score);
        setCandidates(normalized);
        sessionStorage.setItem(`hw_cache_candidates_${activeSessionId}`, JSON.stringify(normalized));

        // Sync main session counts
        try {
          const cachedSessions = sessionStorage.getItem('hw_cache_sessions');
          if (cachedSessions) {
            const parsed = JSON.parse(cachedSessions);
            const idx = parsed.findIndex(s => s._id === activeSessionId || s.id === activeSessionId);
            if (idx !== -1) {
              parsed[idx].shortlistedCount = normalized.filter(c => c.shortlisted).length;
              if (normalized[0]) {
                parsed[idx].topScore = normalized[0].score;
                parsed[idx].topCandidate = normalized[0].name;
              }
              sessionStorage.setItem('hw_cache_sessions', JSON.stringify(parsed));
            }
          }
        } catch (_) {}
      }

      setShowJdModal(false);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to update JD and re-score candidates on server.');
    } finally {
      setJdSaving(false);
    }
  }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | shortlisted | reviewing | rejected
  const [sort, setSort] = useState({ col: 'score', dir: 'desc' });
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const selected = selectedId ? candidates.find((c) => c.id === selectedId) || null : null;
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [minScore, setMinScore] = useState(0);

  const debouncedSearch = useDebounce(search, 200);

  useEffect(() => {
    if (!activeSessionId) {
      setError('No active screening session selected. Go to Dashboard or Screen Resumes page.');
      setCandidates([]);
      return;
    }

    // Attempt to seed from local SWR cache immediately for zero-latency rendering
    try {
      const cached = sessionStorage.getItem(`hw_cache_candidates_${activeSessionId}`);
      if (cached) {
        setCandidates(JSON.parse(cached));
      }
    } catch (_) {}

    async function fetchCandidates() {
      // Only show full loader if there is no cached candidate data
      const hasCache = sessionStorage.getItem(`hw_cache_candidates_${activeSessionId}`);
      if (!hasCache) {
        setLoading(true);
      }
      setError('');
      try {
        const res = await api.get(`/candidates/session/${activeSessionId}`);
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
          sessionStorage.setItem(`hw_cache_candidates_${activeSessionId}`, JSON.stringify(normalized));
        } else {
          setCandidates([]);
        }
      } catch (err) {
        console.error(err);
        if (!hasCache) {
          setError('Could not load candidates from Server. Check backend API.');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchCandidates();
  }, [activeSessionId, location.state]);

  function toggleSort(col) {
    setSort((prev) =>
      prev.col === col
        ? { col, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { col, dir: 'desc' }
    );
    setPage(1);
  }

  const filtered = useMemo(() => {
    let rows = [...candidates];

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      rows = rows.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.skills?.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (filter === 'shortlisted') rows = rows.filter((c) => c.shortlisted);
    else if (filter === 'rejected') rows = rows.filter((c) => c.status === 'rejected');
    else if (filter === 'reviewing') rows = rows.filter((c) => !c.shortlisted && c.status !== 'rejected');

    if (minScore > 0) {
      rows = rows.filter((c) => (c.scoreBreakdown?.total ?? c.score ?? 0) >= minScore);
    }

    rows.sort((a, b) => {
      let av, bv;
      if (sort.col === 'score') {
        av = a.scoreBreakdown?.total ?? a.score ?? 0;
        bv = b.scoreBreakdown?.total ?? b.score ?? 0;
      } else if (sort.col === 'name') {
        av = a.name;
        bv = b.name;
      } else if (sort.col === 'experience') {
        av = a.experience || 0;
        bv = b.experience || 0;
      } else {
        av = a[sort.col] || '';
        bv = b[sort.col] || '';
      }
      if (av < bv) return sort.dir === 'asc' ? -1 : 1;
      if (av > bv) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });

    return rows;
  }, [candidates, debouncedSearch, filter, sort, minScore]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleShortlist(id) {
    async function patchShortlist() {
      try {
        const res = await api.patch(`/candidates/${id}/shortlist`);
        setCandidates((prev) => {
          const updated = prev.map((c) => c.id === id ? { ...c, shortlisted: res.shortlisted, status: res.status } : c);
          sessionStorage.setItem(`hw_cache_candidates_${activeSessionId}`, JSON.stringify(updated));
          return updated;
        });
      } catch (err) {
        console.error(err);
        alert('Failed to update shortlist status on server.');
      }
    }
    patchShortlist();
  }

  function rejectCandidate(id) {
    const candidate = candidates.find((c) => c.id === id);
    if (!candidate) return;
    const newStatus = candidate.status === 'rejected' ? 'reviewing' : 'rejected';
    async function patchStatus() {
      try {
        const res = await api.patch(`/candidates/${id}/status`, { status: newStatus });
        setCandidates((prev) => {
          const updated = prev.map((c) => c.id === id ? { ...c, status: res.status, shortlisted: res.shortlisted } : c);
          sessionStorage.setItem(`hw_cache_candidates_${activeSessionId}`, JSON.stringify(updated));
          return updated;
        });
      } catch (err) {
        console.error(err);
        alert('Failed to update status on server.');
      }
    }
    patchStatus();
  }

  function saveNote(id, note) {
    async function patchNote() {
      try {
        const res = await api.patch(`/candidates/${id}/notes`, { notes: note });
        setCandidates((prev) => {
          const updated = prev.map((c) => c.id === id ? { ...c, notes: res.notes } : c);
          sessionStorage.setItem(`hw_cache_candidates_${activeSessionId}`, JSON.stringify(updated));
          return updated;
        });
      } catch (err) {
        console.error(err);
        alert('Failed to save note on server.');
      }
    }
    patchNote();
  }
  function openDrawer(candidate) {
    setSelectedId(candidate.id);
  }

  function exportCSV() {
    const rows = buildExportRows();
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidates-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportExcel() {
    const rows = buildExportRows();
    const ws = XLSX.utils.json_to_sheet(rows);
    // Column widths
    ws['!cols'] = [
      { wch: 5 }, { wch: 22 }, { wch: 28 }, { wch: 7 },
      { wch: 10 }, { wch: 18 }, { wch: 40 }, { wch: 30 },
      { wch: 11 }, { wch: 11 }, { wch: 30 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Candidates');
    XLSX.writeFile(wb, `candidates-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  function buildExportRows() {
    return filtered.map((c, i) => ({
      Rank: i + 1,
      Name: c.name,
      Email: c.email || '',
      Score: c.scoreBreakdown?.total ?? c.score ?? '',
      Experience: c.experience ? `${c.experience}y` : '',
      Education: c.education || '',
      Skills: (c.matchedSkills || c.skills || []).join('; '),
      'Missing Skills': (c.missingSkills || []).join('; '),
      Shortlisted: c.shortlisted ? 'Yes' : 'No',
      Status: c.status || 'reviewing',
      Notes: c.notes || '',
    }));
  }

  const shortlistedCount = candidates.filter((c) => c.shortlisted).length;

  const COL_HEADER = (label, col, style = {}) => (
    <th
      key={col}
      onClick={() => toggleSort(col)}
      style={{
        padding: '8px 10px',
        cursor: 'pointer',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {label}
        <SortIcon col={col} sort={sort} />
      </div>
    </th>
  );

  return (
    <AppShell>
      <PageHeader
        title="Candidates"
        subtitle={`${candidates.length} total · ${shortlistedCount} shortlisted`}
        actions={
          <>
            {activeSessionId && (
              <>
                <Button variant="secondary" size="sm" onClick={() => setShowAddModal(true)} style={{ gap: 4 }}>
                  <UserPlus size={12} />
                  Add Candidate
                </Button>
                <Button variant="secondary" size="sm" onClick={handleOpenJdModal} style={{ gap: 4 }}>
                  <Edit3 size={12} />
                  Update JD
                </Button>
                <Button variant="secondary" size="sm" onClick={handleOpenWeightsModal} style={{ gap: 4 }}>
                  <SlidersHorizontal size={12} />
                  Calibrate Scoring
                </Button>
              </>
            )}
            <Button variant="secondary" size="sm" onClick={exportCSV}>
              <Download size={12} />
              CSV
            </Button>
            <Button variant="secondary" size="sm" onClick={exportExcel}>
              <Download size={12} />
              Excel
            </Button>
            <Button size="sm" onClick={() => navigate('/upload')}>
              + New screening
            </Button>
          </>
        }
      />

      <div style={{ padding: '16px 24px', animation: 'fadeIn 0.2s ease-out' }}>
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
        {/* Filter bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 2, background: 'var(--bg-subtle)', padding: 3, borderRadius: 5, border: '1px solid var(--border)' }}>
            {[
              { key: 'all', label: `All (${candidates.length})` },
              { key: 'shortlisted', label: `Shortlisted (${shortlistedCount})` },
              { key: 'reviewing', label: 'Reviewing' },
              { key: 'rejected', label: 'Rejected' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => { setFilter(key); setPage(1); }}
                style={{
                  padding: '4px 10px',
                  fontSize: 12,
                  border: 'none',
                  borderRadius: 3,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  background: filter === key ? 'var(--bg-panel)' : 'transparent',
                  color: filter === key ? 'var(--text)' : 'var(--text-2)',
                  fontWeight: filter === key ? 600 : 400,
                  boxShadow: filter === key ? 'var(--shadow-sm)' : 'none',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={12} color="var(--text-3)" style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search name, email, skill..."
                style={{
                  paddingLeft: 26,
                  paddingRight: 8,
                  paddingTop: 6,
                  paddingBottom: 6,
                  border: '1px solid var(--border-strong)',
                  borderRadius: 4,
                  fontSize: 12,
                  width: 220,
                  outline: 'none',
                  background: 'var(--bg-panel)',
                  color: 'var(--text)',
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 0 }}
                >
                  <X size={11} />
                </button>
              )}
            </div>

            {/* Filters toggle */}
            <button
              onClick={() => setShowFilterBar(!showFilterBar)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '5px 10px',
                border: `1px solid ${showFilterBar ? 'var(--accent)' : 'var(--border-strong)'}`,
                borderRadius: 4,
                background: showFilterBar ? 'var(--accent-light)' : 'var(--bg-panel)',
                color: showFilterBar ? 'var(--accent)' : 'var(--text-2)',
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              <SlidersHorizontal size={12} />
              Filter
            </button>
          </div>
        </div>

        {/* Extended filter bar */}
        {showFilterBar && (
          <div style={{ marginBottom: 12, padding: '10px 14px', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 5, display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 500 }}>Min score</label>
              <input
                type="range"
                min={0}
                max={90}
                step={5}
                value={minScore}
                onChange={(e) => { setMinScore(Number(e.target.value)); setPage(1); }}
                style={{ width: 100 }}
              />
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-2)', minWidth: 24 }}>{minScore}+</span>
            </div>
            {minScore > 0 && (
              <button onClick={() => setMinScore(0)} style={{ fontSize: 11, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                Clear
              </button>
            )}
          </div>
        )}

        {/* Table */}
        <Card style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ minWidth: 860 }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '8px 10px', width: 36 }}>#</th>
                  {COL_HEADER('Candidate', 'name')}
                  {COL_HEADER('Score', 'score', { width: 130 })}
                  {COL_HEADER('Exp', 'experience', { width: 60 })}
                  {COL_HEADER('Education', 'education', { width: 110 })}
                  <th style={{ padding: '8px 10px' }}>Skills</th>
                  <th style={{ padding: '8px 10px' }}>Missing</th>
                  <th style={{ padding: '8px 10px', width: 90 }}>Status</th>
                  <th style={{ padding: '8px 10px', width: 110 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} style={{ padding: '40px 20px', textAlign: 'center', fontSize: 12, color: 'var(--text-3)' }}>
                      Loading candidates from server...
                    </td>
                  </tr>
                ) : pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={9}>
                      <EmptyState
                        title="No candidates match"
                        description="Try adjusting the search or filter."
                      />
                    </td>
                  </tr>
                ) : (
                  pageRows.map((c, i) => {
                    const score = c.scoreBreakdown?.total ?? c.score ?? 0;
                    const rank = (page - 1) * PAGE_SIZE + i + 1;
                    return (
                      <tr
                        key={c.id}
                        style={{
                          borderBottom: '1px solid var(--border)',
                          cursor: 'pointer',
                          opacity: c.status === 'rejected' ? 0.55 : 1,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        onClick={() => openDrawer(c)}
                      >
                        {/* Rank */}
                        <td style={{ padding: '9px 10px', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-3)', textAlign: 'center' }}>
                          {rank}
                        </td>
                        {/* Name */}
                        <td style={{ padding: '9px 10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: '50%',
                                background: 'var(--bg-hover)',
                                border: '1px solid var(--border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 10,
                                fontWeight: 600,
                                color: 'var(--text-2)',
                                flexShrink: 0,
                              }}
                            >
                              {c.name.split(' ').map((n) => n[0]).join('')}
                            </div>
                            <div>
                              <p style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</p>
                              <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{c.email || ''}</p>
                            </div>
                          </div>
                        </td>
                        {/* Score */}
                        <td style={{ padding: '9px 10px', minWidth: 130 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <ScoreBadge score={score} />
                            <ScoreBar score={score} />
                          </div>
                        </td>
                        {/* Exp */}
                        <td style={{ padding: '9px 10px', fontSize: 12, color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>
                          {c.experience ? `${c.experience}y` : '—'}
                        </td>
                        {/* Education */}
                        <td style={{ padding: '9px 10px', fontSize: 11, color: 'var(--text-2)', maxWidth: 110 }}>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                            {c.education ? c.education.split(',')[0].split('—')[0].trim() : '—'}
                          </span>
                        </td>
                        {/* Skills */}
                        <td style={{ padding: '9px 10px', maxWidth: 200 }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                            {(c.matchedSkills || c.skills || []).slice(0, 4).map((s) => (
                              <span
                                key={s}
                                style={{
                                  fontSize: 10,
                                  padding: '1px 5px',
                                  background: 'var(--bg-subtle)',
                                  border: '1px solid var(--border)',
                                  borderRadius: 2,
                                  fontFamily: 'var(--font-mono)',
                                  color: 'var(--text-2)',
                                }}
                              >
                                {s}
                              </span>
                            ))}
                            {(c.matchedSkills || c.skills || []).length > 4 && (
                              <span style={{ fontSize: 10, color: 'var(--text-3)' }}>
                                +{(c.matchedSkills || c.skills || []).length - 4}
                              </span>
                            )}
                          </div>
                        </td>
                        {/* Missing */}
                        <td style={{ padding: '9px 10px', maxWidth: 150 }}>
                          {c.missingSkills?.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                              {c.missingSkills.slice(0, 2).map((s) => (
                                <span
                                  key={s}
                                  style={{
                                    fontSize: 10,
                                    padding: '1px 5px',
                                    background: 'var(--red-bg)',
                                    border: '1px solid #fecaca',
                                    borderRadius: 2,
                                    fontFamily: 'var(--font-mono)',
                                    color: 'var(--red)',
                                  }}
                                >
                                  {s}
                                </span>
                              ))}
                              {c.missingSkills.length > 2 && (
                                <span style={{ fontSize: 10, color: 'var(--text-3)' }}>
                                  +{c.missingSkills.length - 2}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span style={{ fontSize: 11, color: 'var(--green)' }}>None</span>
                          )}
                        </td>
                        {/* Status */}
                        <td style={{ padding: '9px 10px' }}>
                          <StatusBadge status={c.status} shortlisted={c.shortlisted} />
                        </td>
                        {/* Actions */}
                        <td
                          style={{ padding: '9px 10px' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <button
                              onClick={() => toggleShortlist(c.id)}
                              title={c.shortlisted ? 'Remove from shortlist' : 'Shortlist'}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 4,
                                color: c.shortlisted ? 'var(--orange)' : 'var(--text-3)',
                                borderRadius: 3,
                              }}
                            >
                              <Star size={13} fill={c.shortlisted ? 'currentColor' : 'none'} />
                            </button>
                            <button
                              onClick={() => openDrawer(c)}
                              title="View resume"
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '3px 6px',
                                color: 'var(--text-3)',
                                borderRadius: 3,
                                fontSize: 10,
                                fontFamily: 'var(--font-sans)',
                              }}
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                padding: '10px 16px',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-subtle)',
              }}
            >
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
                {filtered.length} results · page {page} of {totalPages}
              </span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    padding: '3px 10px',
                    fontSize: 12,
                    border: '1px solid var(--border-strong)',
                    borderRadius: 3,
                    background: 'white',
                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                    opacity: page === 1 ? 0.4 : 1,
                  }}
                >
                  ‹ Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    style={{
                      padding: '3px 8px',
                      fontSize: 12,
                      border: `1px solid ${n === page ? 'var(--text)' : 'var(--border-strong)'}`,
                      borderRadius: 3,
                      background: n === page ? 'var(--text)' : 'white',
                      color: n === page ? 'white' : 'var(--text-2)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{
                    padding: '3px 10px',
                    fontSize: 12,
                    border: '1px solid var(--border-strong)',
                    borderRadius: 3,
                    background: 'white',
                    cursor: page === totalPages ? 'not-allowed' : 'pointer',
                    opacity: page === totalPages ? 0.4 : 1,
                  }}
                >
                  Next ›
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Candidate drawer */}
      {selected && (
        <>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.2)',
              zIndex: 99,
            }}
            onClick={() => setSelectedId(null)}
          />
          <CandidateDrawer
            candidate={selected}
            onClose={() => setSelectedId(null)}
            onShortlist={toggleShortlist}
            onReject={rejectCandidate}
            onNote={saveNote}
          />
        </>
      )}

      {/* Add Candidate Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          <div
            style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: 24,
              width: '100%',
              maxWidth: 420,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, color: 'var(--text)' }}>Add New Candidate</h3>
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 20 }}>
              Manually insert a candidate profile. Scoring weights are calibrated automatically.
            </p>

            <form onSubmit={handleAddCandidate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Resume Upload Box */}
              <div
                style={{
                  border: '1px dashed var(--border-strong)',
                  borderRadius: 6,
                  padding: '12px 14px',
                  background: 'var(--bg-subtle)',
                  textAlign: 'center',
                  position: 'relative',
                  transition: 'all 0.15s ease',
                }}
              >
                {parsingFile ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '4px 0' }}>
                    <Loader2 style={{ animation: 'spin 1.2s linear infinite' }} size={16} color="var(--accent)" />
                    <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-2)' }}>Parsing resume text on server...</span>
                  </div>
                ) : attachedResumeId ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                      <div style={{ padding: 4, background: 'var(--green-bg)', borderRadius: 3, border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle2 size={12} color="var(--green)" />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={attachedResumeName}>
                        {attachedResumeName}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAttachedResumeId(null);
                        setAttachedResumeName('');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 10,
                        color: 'var(--red)',
                        fontWeight: 500,
                        padding: 0,
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <label
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        ✦ Attach Resume & Auto-fill
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--text-3)' }}>
                        Supports PDF, DOCX (Max 5MB)
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.docx,.doc"
                        onChange={handleAttachResume}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                )}
              </div>

              <Input
                label="Full Name"
                placeholder="e.g. John Doe"
                value={candName}
                onChange={(e) => setCandName(e.target.value)}
                required
                autoFocus
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Input
                  label="Email"
                  placeholder="john@example.com"
                  type="email"
                  value={candEmail}
                  onChange={(e) => setCandEmail(e.target.value)}
                />
                <Input
                  label="Phone"
                  placeholder="(123) 456-7890"
                  value={candPhone}
                  onChange={(e) => setCandPhone(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)' }}>Match Score (0 - 100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={candScore}
                    onChange={(e) => setCandScore(e.target.value)}
                    required
                    style={{
                      padding: '6px 10px',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 'var(--radius)',
                      fontSize: 13,
                      outline: 'none',
                      background: 'transparent',
                      color: 'var(--text)',
                    }}
                  />
                </div>
                <Input
                  label="Experience (Years)"
                  type="number"
                  min="0"
                  max="40"
                  value={candExp}
                  onChange={(e) => setCandExp(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 12 }}>
                <Input
                  label="Education Degree"
                  placeholder="e.g. Master's"
                  value={candEdu}
                  onChange={(e) => setCandEdu(e.target.value)}
                />
                <Input
                  label="College/University"
                  placeholder="e.g. Stanford"
                  value={candCollege}
                  onChange={(e) => setCandCollege(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Input
                  label="Last Role / Position"
                  placeholder="e.g. Frontend Engineer"
                  value={candRole}
                  onChange={(e) => setCandRole(e.target.value)}
                />
                <Input
                  label="Last Company"
                  placeholder="e.g. Google"
                  value={candCompany}
                  onChange={(e) => setCandCompany(e.target.value)}
                />
              </div>

              <Input
                label="Skills (comma separated)"
                placeholder="e.g. react, node, typescript"
                value={candSkills}
                onChange={(e) => setCandSkills(e.target.value)}
              />

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '6px 12px',
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
                  disabled={candSaving}
                  style={{
                    padding: '6px 18px',
                    background: 'var(--accent)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: candSaving ? 'not-allowed' : 'pointer',
                    opacity: candSaving ? 0.6 : 1,
                  }}
                >
                  {candSaving ? 'Saving...' : 'Add Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update JD Modal */}
      {showJdModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }} onClick={() => !jdSaving && setShowJdModal(false)} />
          <div style={{ position: 'relative', width: '90%', maxWidth: 700, background: 'var(--bg-panel)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', maxHeight: '85vh', animation: 'fadeIn 0.2s ease-out' }}>
            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Update Job Description</h3>
              <button onClick={() => setShowJdModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            
            {/* Content */}
            <div style={{ padding: 20, overflowY: 'auto' }}>
              {jdLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 40, color: 'var(--text-3)' }}>
                  <Loader2 size={24} className="spin" />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <Input
                    label="Job Title"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer"
                    required
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase' }}>
                      Job Description Text
                    </label>
                    <textarea
                      value={jdContent}
                      onChange={(e) => setJdContent(e.target.value)}
                      placeholder="Paste the full job description here..."
                      style={{
                        width: '100%',
                        height: 250,
                        padding: 12,
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--border)',
                        background: 'transparent',
                        color: 'var(--text)',
                        resize: 'vertical',
                        fontSize: 13,
                        lineHeight: 1.6
                      }}
                    />
                    <p style={{ fontSize: 11, color: 'var(--text-3)' }}>
                      Changing this will automatically re-score all candidates against the new requirements.
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8, background: 'var(--bg-subtle)' }}>
              <Button variant="ghost" onClick={() => setShowJdModal(false)} disabled={jdSaving}>Cancel</Button>
              <Button variant="accent" onClick={handleUpdateJd} disabled={jdLoading} loading={jdSaving}>
                <CheckCircle2 size={14} style={{ marginRight: 6 }} />
                Save & Re-score
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Weights Modal */}
      {showWeightsModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }} onClick={() => !weightsSaving && setShowWeightsModal(false)} />
          <div style={{ position: 'relative', width: '90%', maxWidth: 500, background: 'var(--bg-panel)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', maxHeight: '85vh', animation: 'fadeIn 0.2s ease-out' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Calibrate Scoring Ratios</h3>
              <button onClick={() => setShowWeightsModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            
            <div style={{ padding: 20, overflowY: 'auto' }}>
              {weightsLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 40, color: 'var(--text-3)' }}>
                  <Loader2 size={24} className="spin" />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <p style={{ fontSize: 12, color: 'var(--text-2)' }}>
                    Adjust the relative importance of different factors for this pipeline. The sum will automatically remain 100%.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ fontWeight: 500, color: 'var(--text-2)' }}>🛠️ Technical Skills</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{weights.skills}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={weights.skills} onChange={(e) => handleWeightChange('skills', e.target.value)} style={{ accentColor: 'var(--accent)', cursor: 'pointer', width: '100%' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ fontWeight: 500, color: 'var(--text-2)' }}>💼 Years of Experience</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{weights.experience}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={weights.experience} onChange={(e) => handleWeightChange('experience', e.target.value)} style={{ accentColor: 'var(--accent)', cursor: 'pointer', width: '100%' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ fontWeight: 500, color: 'var(--text-2)' }}>🎓 Education Levels</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{weights.education}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={weights.education} onChange={(e) => handleWeightChange('education', e.target.value)} style={{ accentColor: 'var(--accent)', cursor: 'pointer', width: '100%' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ fontWeight: 500, color: 'var(--text-2)' }}>🔑 Essential Keywords</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{weights.keyword}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={weights.keyword} onChange={(e) => handleWeightChange('keyword', e.target.value)} style={{ accentColor: 'var(--accent)', cursor: 'pointer', width: '100%' }} />
                  </div>

                  <div style={{ marginTop: 10, padding: 10, borderRadius: 4, background: 'var(--bg-subtle)', border: '1.5px dashed var(--border)' }}>
                    <p style={{ fontSize: 11, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
                      <Sparkles size={12} color="var(--accent)" />
                      Formula breakdown sum: 100% verified.
                    </p>
                    <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', marginTop: 8 }}>
                      <div style={{ width: `${weights.skills}%`, background: 'var(--accent)', height: '100%' }} />
                      <div style={{ width: `${weights.experience}%`, background: 'var(--green)', height: '100%' }} />
                      <div style={{ width: `${weights.education}%`, background: 'var(--orange)', height: '100%' }} />
                      <div style={{ width: `${weights.keyword}%`, background: 'var(--yellow)', height: '100%' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8, background: 'var(--bg-subtle)' }}>
              <Button variant="ghost" onClick={() => setShowWeightsModal(false)} disabled={weightsSaving}>Cancel</Button>
              <Button variant="accent" onClick={handleSaveWeights} disabled={weightsLoading} loading={weightsSaving}>
                <CheckCircle2 size={14} style={{ marginRight: 6 }} />
                Save & Re-score
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
