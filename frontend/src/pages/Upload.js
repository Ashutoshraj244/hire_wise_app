import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, FileText, AlertCircle, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import AppShell, { PageHeader } from '../components/layout/AppShell';
import { Button, Card } from '../components/ui';
import { scoreResume, parseResumeName, parseResumeEmail, parseResumePhone, parseExperience, parseProjects } from '../lib/scorer';
import { DEMO_JD } from '../data/seed';
import { useAuth } from '../lib/auth';
import api from '../lib/api';

const ACCEPTED = ['.pdf', '.doc', '.docx'];
const MAX_SIZE_MB = 5;

function FileRow({ file, status, onRemove }) {
  const ext = file.name.split('.').pop().toUpperCase();
  const sizeMB = (file.size / 1024 / 1024).toFixed(1);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 12px',
        border: '1px solid var(--border)',
        borderRadius: 4,
        background: 'white',
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 3,
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <FileText size={13} color="var(--text-2)" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {file.name}
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-3)' }}>
          {ext} · {sizeMB} MB
        </p>
      </div>
      {status === 'error' && <AlertCircle size={13} color="var(--red)" />}
      {status === 'ready' && (
        <button
          onClick={() => onRemove(file.name)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--text-3)' }}
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}

function ProcessingStep({ label, done, active }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0' }}>
      <div style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {done ? (
          <CheckCircle2 size={14} color="var(--green)" />
        ) : active ? (
          <Loader2 size={14} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
        ) : (
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--border-strong)' }} />
        )}
      </div>
      <span style={{ fontSize: 12, color: done ? 'var(--text)' : active ? 'var(--text)' : 'var(--text-3)' }}>
        {label}
      </span>
    </div>
  );
}

export default function UploadPage() {
  const navigate = useNavigate();
  const { addNewSession } = useAuth();
  const [files, setFiles] = useState([]);
  const [fileErrors, setFileErrors] = useState({});
  const [jdText, setJdText] = useState('');
  const [jdError, setJdError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [draggingJd, setDraggingJd] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0); // 0–4
  const [processResult, setProcessResult] = useState(null);
  const fileInputRef = useRef();
  const jdFileInputRef = useRef();
  const [parsingJd, setParsingJd] = useState(false);

  function validateFile(file) {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ACCEPTED.includes(ext)) return `${file.name}: unsupported format`;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) return `${file.name}: exceeds ${MAX_SIZE_MB}MB limit`;
    return null;
  }

  function addFiles(incoming) {
    const newErrors = {};
    const valid = [];
    incoming.forEach((f) => {
      const err = validateFile(f);
      if (err) {
        newErrors[f.name] = err;
        valid.push({ file: f, status: 'error' });
      } else if (!files.find((x) => x.file.name === f.name)) {
        valid.push({ file: f, status: 'ready' });
      }
    });
    setFileErrors((prev) => ({ ...prev, ...newErrors }));
    setFiles((prev) => [...prev, ...valid]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    addFiles([...e.dataTransfer.files]);
  }

  function handleFileInput(e) {
    addFiles([...e.target.files]);
    e.target.value = '';
  }

  function removeFile(name) {
    setFiles((prev) => prev.filter((f) => f.file.name !== name));
    setFileErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  async function handleJdFileInput(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsingJd(true);
    setJdError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/jobs/parse', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res && res.success && res.text) {
        setJdText(res.text.trim());
      } else {
        setJdError('Failed to parse JD file.');
      }
    } catch (err) {
      console.error(err);
      setJdError(err.message || 'Failed to parse JD file.');
    } finally {
      setParsingJd(false);
      e.target.value = '';
    }
  }

  async function startScreening() {
    const validFiles = files.filter((f) => f.status === 'ready');
    if (validFiles.length === 0) return;
    if (!jdText.trim()) {
      setJdError('Please enter a job description.');
      return;
    }
    setJdError('');
    setProcessing(true);
    setProcessResult(null);
    setProcessingStep(0);

    // Server Mode
    try {
      setProcessingStep(1); // "Parsing uploaded files"

      const job = await api.post('/jobs', {
        title: jdText.split('\n')[0].split('—')[0].trim().slice(0, 40) || 'Screened Frontend Engineer',
        company: 'Acme Corp',
        description: jdText,
      });
      const jobId = job._id || job.id;

      const session = await api.post('/screening', { jobId });
      const sessionId = session._id || session.id;

      setProcessingStep(2); // "Extracting skills and experience"

      const formData = new FormData();
      formData.append('sessionId', sessionId);
      validFiles.forEach(({ file }) => {
        formData.append('resumes', file);
      });

      const uploadRes = await api.post('/resumes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setProcessingStep(3); // "Scoring against job description"
      setProcessingStep(4); // "Ranking candidates"

      const runRes = await api.post(`/screening/${sessionId}/run`, { jdText });
      setProcessingStep(5);

      const normalizedCandidates = (runRes.candidates || []).map((c) => ({
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

      const newSessionFromServer = {
        _id: sessionId,
        jobId: {
          title: jdText.split('\n')[0].split('—')[0].trim().slice(0, 40) || 'Screened Frontend Engineer',
          company: 'Acme Corp',
        },
        resumeCount: normalizedCandidates.length,
        shortlistedCount: normalizedCandidates.filter((c) => c.shortlisted).length,
        createdAt: new Date().toISOString(),
        status: 'completed',
        topScore: normalizedCandidates[0]?.score || 0,
        topCandidate: normalizedCandidates[0]?.name || '—',
      };

      // Populate Client-Side SWR Cache immediately so candidates render instantly
      sessionStorage.setItem(`hw_cache_candidates_${sessionId}`, JSON.stringify(normalizedCandidates));

      addNewSession(newSessionFromServer);

      sessionStorage.setItem('hw_results', JSON.stringify({
        candidates: normalizedCandidates,
        jd: jdText,
        sessionId,
      }));

      setProcessing(false);
      setProcessResult({
        parsed: uploadRes.uploaded || normalizedCandidates.length,
        failed: uploadRes.failed || 0,
      });
    } catch (err) {
      console.error(err);
      setJdError(err.message || 'Server screening failed. Please check your connection and Atlas configuration.');
      setProcessing(false);
    }
  }

  const validCount = files.filter((f) => f.status === 'ready').length;
  const errorCount = files.filter((f) => f.status === 'error').length;

  return (
    <AppShell>
      <PageHeader
        title="Screen Resumes"
        subtitle="Upload resumes and a job description to begin scoring"
      />

      <div style={{ padding: '20px 24px', maxWidth: 860, animation: 'fadeIn 0.2s ease-out' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          {/* Left: Upload zone + file list */}
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', marginBottom: 8 }}>
              Resume Files
            </p>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border-strong)'}`,
                borderRadius: 6,
                padding: '24px 16px',
                textAlign: 'center',
                cursor: 'pointer',
                background: dragging ? 'var(--accent-light)' : 'var(--bg-panel)',
                transition: 'all 0.15s',
                marginBottom: 10,
              }}
            >
              <Upload size={20} color={dragging ? 'var(--accent)' : 'var(--text-3)'} style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
                Drop files here or click to browse
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
                PDF, DOC, DOCX · Max {MAX_SIZE_MB}MB per file
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx"
                style={{ display: 'none' }}
                onChange={handleFileInput}
              />
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 }}>
                {files.map(({ file, status }) => (
                  <FileRow key={file.name} file={file} status={status} onRemove={removeFile} />
                ))}
              </div>
            )}

            {/* Status summary */}
            {files.length > 0 && (
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>
                {validCount > 0 && <span style={{ color: 'var(--green)' }}>{validCount} file{validCount !== 1 ? 's' : ''} ready</span>}
                {errorCount > 0 && <span style={{ color: 'var(--red)', marginLeft: 10 }}>{errorCount} could not be added</span>}
              </div>
            )}

            {/* Error list */}
            {Object.values(fileErrors).length > 0 && (
              <div style={{ marginTop: 6 }}>
                {Object.values(fileErrors).map((e) => (
                  <p key={e} style={{ fontSize: 11, color: 'var(--red)' }}>{e}</p>
                ))}
              </div>
            )}
          </div>

          {/* Right: JD input */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)' }}>
                Job Description
              </p>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button
                  onClick={() => jdFileInputRef.current?.click()}
                  disabled={parsingJd}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text)', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 4, cursor: parsingJd ? 'wait' : 'pointer', padding: '4px 8px' }}
                >
                  <Upload size={12} />
                  {parsingJd ? 'Parsing...' : 'Upload JD File'}
                </button>
                <input
                  ref={jdFileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  onChange={handleJdFileInput}
                />
                <button
                  onClick={() => setJdText(DEMO_JD)}
                  style={{ fontSize: 11, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Load demo JD
                </button>
              </div>
            </div>
            <textarea
              value={jdText}
              onChange={(e) => { setJdText(e.target.value); setJdError(''); }}
              placeholder="Paste the full job description here. Include requirements, skills needed, and experience expectations..."
              style={{
                width: '100%',
                minHeight: 260,
                padding: '10px 12px',
                border: `1px solid ${jdError ? 'var(--red)' : 'var(--border-strong)'}`,
                borderRadius: 5,
                fontSize: 12,
                lineHeight: 1.6,
                resize: 'vertical',
                outline: 'none',
                color: 'var(--text)',
                background: 'var(--bg-panel)',
                fontFamily: 'var(--font-sans)',
              }}
            />
            {jdError && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{jdError}</p>}
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>
              {jdText.length > 0 ? `${jdText.length} characters` : 'The JD is used to extract required skills and score candidates'}
            </p>
          </div>
        </div>

        {/* Processing state */}
        {processing && !processResult && (
          <Card style={{ marginTop: 20, padding: '16px 20px' }}>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Processing resumes...</p>
            <ProcessingStep label="Parsing uploaded files"            done={processingStep > 1} active={processingStep === 1} />
            <ProcessingStep label="Extracting skills and experience"   done={processingStep > 2} active={processingStep === 2} />
            <ProcessingStep label="Scoring against job description"    done={processingStep > 3} active={processingStep === 3} />
            <ProcessingStep label="Ranking candidates"                 done={processingStep > 4} active={processingStep === 4} />
          </Card>
        )}

        {/* Result banner */}
        {processResult && (
          <Card
            style={{
              marginTop: 20,
              padding: '14px 16px',
              background: 'var(--green-bg)',
              border: '1px solid #bbf7d0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={16} color="var(--green)" />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>
                    {processResult.parsed > 0
                      ? `${processResult.parsed} resume${processResult.parsed !== 1 ? 's' : ''} processed successfully`
                      : 'Processing complete'}
                  </p>
                  {processResult.failed > 0 && (
                    <p style={{ fontSize: 11, color: 'var(--text-2)' }}>
                      {processResult.failed} file{processResult.failed !== 1 ? 's' : ''} could not be parsed (binary PDF — use text-based PDF)
                    </p>
                  )}
                  {processResult.parsed === 0 && (
                    <p style={{ fontSize: 11, color: 'var(--text-2)' }}>
                      Note: In demo mode, PDF binary files can't be parsed in browser. Check the Results page for demo candidates.
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => navigate('/results')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '6px 12px',
                  background: 'var(--green)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                View Results <ChevronRight size={13} />
              </button>
            </div>
          </Card>
        )}

        {/* Start button — hidden while processing, visible otherwise */}
        {!processing && (
          <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
            <Button
              onClick={startScreening}
              size="lg"
              disabled={validCount === 0 || !jdText.trim()}
              style={{ minWidth: 160 }}
            >
              {processResult ? 'Screen Again' : 'Start Screening'}
            </Button>
            <p style={{ fontSize: 11, color: 'var(--text-3)', alignSelf: 'center' }}>
              {validCount === 0 ? 'Add at least one resume file' : `${validCount} file${validCount !== 1 ? 's' : ''} queued`}
            </p>
          </div>
        )}

        {/* Demo tip */}
        <div
          style={{
            marginTop: 24,
            padding: '10px 14px',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            borderRadius: 5,
            fontSize: 11,
            color: 'var(--text-3)',
          }}
        >
          <strong style={{ color: 'var(--text-2)' }}>Demo tip:</strong> Click "Load demo JD" to populate the job description, then go to{' '}
          <button
            onClick={() => navigate('/results')}
            style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: 0, fontSize: 11 }}
          >
            Results
          </button>{' '}
          to see 6 pre-scored candidates.
        </div>
      </div>
    </AppShell>
  );
}
