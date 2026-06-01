import React, { useState } from 'react';
import { X, Star, XCircle, Mail, Phone, MapPin, Briefcase, GraduationCap, ChevronDown, ChevronUp } from 'lucide-react';
import { Button, Badge, ScoreBadge, ScoreBar } from '../ui';

function SkillTag({ skill, matched }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 7px',
        fontSize: 11,
        borderRadius: 3,
        background: matched ? 'var(--green-bg)' : 'var(--red-bg)',
        color: matched ? 'var(--green)' : 'var(--red)',
        border: `1px solid ${matched ? '#bbf7d0' : '#fecaca'}`,
        fontFamily: 'var(--font-mono)',
      }}
    >
      {skill}
    </span>
  );
}

export default function CandidateDrawer({ candidate, onClose, onShortlist, onReject, onNote }) {
  const [note, setNote] = useState(candidate.notes || '');
  const [noteSaved, setNoteSaved] = useState(false);
  const [showResume, setShowResume] = useState(false);

  // Reset local state when a different candidate is opened
  React.useEffect(() => {
    setNote(candidate.notes || '');
    setNoteSaved(false);
    setShowResume(false);
  }, [candidate.id]);

  function saveNote() {
    onNote(candidate.id, note);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 1800);
  }

  const bd = candidate.scoreBreakdown || {};

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 440,
        background: 'var(--bg-panel)',
        borderLeft: '1px solid var(--border)',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        animation: 'slideInRight 0.18s ease-out',
      }}
    >
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'var(--bg-hover)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--text-2)',
              flexShrink: 0,
            }}
          >
            {candidate.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600 }}>{candidate.name}</p>
            <div style={{ display: 'flex', gap: 6, marginTop: 3 }}>
              <ScoreBadge score={candidate.scoreBreakdown?.total ?? candidate.score ?? 0} />
              {candidate.shortlisted && <Badge color="green">Shortlisted</Badge>}
              {candidate.status === 'rejected' && <Badge color="red">Rejected</Badge>}
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 2 }}>
          <X size={16} />
        </button>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {/* Contact info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 16 }}>
          {candidate.email && candidate.email !== '—' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Mail size={12} color="var(--text-3)" />
              <a href={`mailto:${candidate.email}`} style={{ fontSize: 12, color: 'var(--text-2)' }}>{candidate.email}</a>
            </div>
          )}
          {candidate.phone && candidate.phone !== '—' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Phone size={12} color="var(--text-3)" />
              <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{candidate.phone}</span>
            </div>
          )}
          {candidate.location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={12} color="var(--text-3)" />
              <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{candidate.location}</span>
            </div>
          )}
          {candidate.experience && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Briefcase size={12} color="var(--text-3)" />
              <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{candidate.experience} years experience</span>
            </div>
          )}
          {candidate.education && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <GraduationCap size={12} color="var(--text-3)" />
              <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{candidate.education}</span>
            </div>
          )}
        </div>

        {/* Detailed Education */}
        {candidate.detailedEducation && candidate.detailedEducation.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
              Education Details
            </p>
            {candidate.detailedEducation.map((edu, idx) => (
              <div key={idx} style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{edu.program}</p>
                <p style={{ fontSize: 12, color: 'var(--text-2)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{edu.institution}</span>
                  <span style={{ color: 'var(--text-3)' }}>{edu.year}</span>
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Detailed Experience */}
        {candidate.detailedExperience && candidate.detailedExperience.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
              Work Experience
            </p>
            {candidate.detailedExperience.map((exp, idx) => (
              <div key={idx} style={{ marginBottom: 12, paddingLeft: 10, borderLeft: '2px solid var(--border)' }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
                  {exp.role} <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>at</span> {exp.company}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>{exp.years}</p>
                {exp.description && (
                  <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Score breakdown */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
            Score Breakdown
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Skills match', val: bd.skills || 0, max: 50 },
              { label: 'Experience', val: bd.experience || 0, max: 25 },
              { label: 'Education', val: bd.education || 0, max: 15 },
              { label: 'Keyword similarity', val: bd.keyword || 0, max: 10 },
            ].map(({ label, val, max }) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{label}</span>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-2)' }}>
                    {val} / {max}
                  </span>
                </div>
                <div style={{ height: 5, background: 'var(--bg-hover)', borderRadius: 3, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${(val / max) * 100}%`,
                      height: '100%',
                      background: (val / max) >= 0.7 ? 'var(--green)' : (val / max) >= 0.5 ? 'var(--orange)' : 'var(--red)',
                      borderRadius: 3,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        {((candidate.matchedSkills || candidate.skills)?.length > 0 || candidate.missingSkills?.length > 0) && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              Skills
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {(candidate.matchedSkills || candidate.skills || []).map((s) => (
                <SkillTag key={s} skill={s} matched />
              ))}
              {(candidate.missingSkills || []).map((s) => (
                <SkillTag key={s} skill={s} matched={false} />
              ))}
            </div>
            <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 6 }}>
              <span style={{ color: 'var(--green)' }}>■</span> matched &nbsp;
              <span style={{ color: 'var(--red)' }}>■</span> missing from JD
            </p>
          </div>
        )}

        {/* JD match explanation */}
        {candidate.missingSkills?.length > 0 && (
          <div
            style={{
              marginBottom: 16,
              padding: '10px 12px',
              background: 'var(--orange-bg)',
              border: '1px solid #fde68a',
              borderRadius: 4,
            }}
          >
            <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--orange)', marginBottom: 4 }}>
              Missing required skills
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.6 }}>
              {candidate.missingSkills.slice(0, 5).join(', ')}
              {candidate.missingSkills.length > 5 ? ` and ${candidate.missingSkills.length - 5} more` : ''}
            </p>
          </div>
        )}

        {/* Summary */}
        {candidate.summary && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
              Summary
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65 }}>{candidate.summary}</p>
          </div>
        )}

        {/* Work Experience & Education details */}
        <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Work Experience section */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              Work Experience
            </p>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: 8, 
              background: 'var(--bg-subtle)', 
              padding: '12px 14px', 
              borderRadius: 8, 
              border: '1px solid var(--border)' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Briefcase size={15} color="var(--text-2)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                  {candidate.experience ? `${candidate.experience} Years Experience` : 'Years not specified'}
                </span>
              </div>
              {(candidate.recentRole || candidate.recentCompany) && (
                <div style={{ paddingLeft: 23, borderLeft: '1.5px solid var(--border-strong)', marginLeft: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {candidate.recentRole && (
                    <p style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text)' }}>
                      {candidate.recentRole}
                    </p>
                  )}
                  {candidate.recentCompany && (
                    <p style={{ fontSize: 11.5, color: 'var(--text-3)', fontWeight: 500 }}>
                      {candidate.recentCompany}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Education section */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              Education
            </p>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: 8, 
              background: 'var(--bg-subtle)', 
              padding: '12px 14px', 
              borderRadius: 8, 
              border: '1px solid var(--border)' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <GraduationCap size={16} color="var(--text-2)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                  {candidate.education || 'Degree not specified'}
                </span>
              </div>
              {candidate.college && (
                <div style={{ paddingLeft: 24, borderLeft: '1.5px solid var(--border-strong)', marginLeft: 6 }}>
                  <p style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>
                    {candidate.college}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Projects */}
        {candidate.projects?.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              Projects
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {candidate.projects.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
                  <span style={{ color: 'var(--text-3)', marginTop: 1, flexShrink: 0 }}>▸</span>
                  <span style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>{p}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resume text collapsible */}
        {candidate.resumeText && (
          <div style={{ marginBottom: 16 }}>
            <button
              onClick={() => setShowResume(!showResume)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                fontSize: 11,
                fontWeight: 500,
                color: 'var(--text-3)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {showResume ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              Resume Text
            </button>
            {showResume && (
              <pre
                style={{
                  marginTop: 8,
                  padding: '10px 12px',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  borderRadius: 4,
                  fontSize: 10.5,
                  fontFamily: 'var(--font-mono)',
                  whiteSpace: 'pre-wrap',
                  color: 'var(--text-2)',
                  maxHeight: 200,
                  overflowY: 'auto',
                  lineHeight: 1.7,
                }}
              >
                {candidate.resumeText}
              </pre>
            )}
          </div>
        )}

        {/* Notes */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
            Recruiter Notes
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add notes about this candidate..."
            style={{
              width: '100%',
              minHeight: 80,
              padding: '8px 10px',
              border: '1px solid var(--border-strong)',
              borderRadius: 4,
              fontSize: 12,
              resize: 'vertical',
              outline: 'none',
              color: 'var(--text)',
              fontFamily: 'var(--font-sans)',
              lineHeight: 1.55,
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
            <Button variant="secondary" size="sm" onClick={saveNote}>
              {noteSaved ? 'Saved ✓' : 'Save note'}
            </Button>
          </div>
        </div>
      </div>

      {candidate.shortlisted && candidate.email && candidate.email !== '—' && (
        <div style={{ padding: '0 16px 12px 16px' }}>
          <Button
            variant="secondary"
            style={{ width: '100%', justifyContent: 'center', gap: 6, borderColor: 'var(--accent)', color: 'var(--accent)' }}
            onClick={() => {
              const subject = encodeURIComponent('Interview Invitation - Acme Corp');
              const body = encodeURIComponent(`Hi ${candidate.name.split(' ')[0]},\n\nWe were very impressed by your background and would love to invite you to interview with us.\n\nPlease let us know what times work best for you next week for a brief introductory call.\n\nBest regards,\nAcme Corp Recruiting Team`);
              window.open(`mailto:${candidate.email}?subject=${subject}&body=${body}`);
            }}
          >
            <Mail size={14} />
            Email Shortlisted Candidate
          </Button>
        </div>
      )}

      {/* Footer actions */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          gap: 8,
        }}
      >
        <Button
          variant={candidate.shortlisted ? 'secondary' : 'accent'}
          size="sm"
          onClick={() => onShortlist(candidate.id)}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <Star size={12} />
          {candidate.shortlisted ? 'Remove shortlist' : 'Shortlist'}
        </Button>
        <Button
          variant={candidate.status === 'rejected' ? 'secondary' : 'danger'}
          size="sm"
          onClick={() => onReject(candidate.id)}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <XCircle size={12} />
          {candidate.status === 'rejected' ? 'Unreject' : 'Reject'}
        </Button>
      </div>
    </div>
  );
}
