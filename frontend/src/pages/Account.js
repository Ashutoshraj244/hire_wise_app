import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Briefcase, Building, Save, Palette, Sliders, CheckCircle2, 
  ChevronRight, Laptop, Moon, Sun, ShieldAlert, Sparkles 
} from 'lucide-react';
import AppShell, { PageHeader } from '../components/layout/AppShell';
import { Card, Button, Input } from '../components/ui';
import { useAuth } from '../lib/auth';

const BANNERS = [
  { id: 'ocean-gradient', name: 'Deep Ocean', value: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)' },
  { id: 'indigo-gradient', name: 'Aurora Purple', value: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' },
  { id: 'sunset-gradient', name: 'Sunset Pink', value: 'linear-gradient(135deg, #ea580c 0%, #db2777 100%)' },
  { id: 'charcoal-gradient', name: 'Charcoal Minimal', value: 'linear-gradient(135deg, #374151 0%, #111827 100%)' },
  { id: 'emerald-gradient', name: 'Emerald Sky', value: 'linear-gradient(135deg, #059669 0%, #0284c7 100%)' },
];

const ACCENTS = [
  { id: '#2563eb', name: 'Acme Blue' },
  { id: '#059669', name: 'Emerald Green' },
  { id: '#7c3aed', name: 'Cyber Violet' },
  { id: '#ea580c', name: 'Warm Amber' },
  { id: '#e11d48', name: 'Crimson Rose' },
];

export default function Account() {
  const { user, updateUserSettings } = useAuth();
  const navigate = useNavigate();

  // Form Details State
  const [name, setName] = useState(user?.name || '');
  const [role, setRole] = useState(user?.role || '');
  const [department, setDepartment] = useState(user?.department || 'Talent Acquisition');
  const [company, setCompany] = useState(user?.company || 'Acme Corp');

  // Theme Settings State
  const [activeBanner, setActiveBanner] = useState(user?.settings?.bannerPreset || 'ocean-gradient');
  const [activeAccent, setActiveAccent] = useState(user?.settings?.accentTheme || '#2563eb');

  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState('');

  // Auto-dismiss toast
  useEffect(() => {
    if (showToast) {
      const t = setTimeout(() => setShowToast(false), 2400);
      return () => clearTimeout(t);
    }
  }, [showToast]);

  const currentBannerStyle = BANNERS.find(b => b.id === activeBanner)?.value || BANNERS[0].value;

  // Handle entire profile save to Atlas
  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        name,
        department,
        company,
        settings: {
          bannerPreset: activeBanner,
          accentTheme: activeAccent,
        }
      };
      await updateUserSettings(payload);
      setShowToast(true);
    } catch (err) {
      console.error(err);
      setError('Could not update profile on server. Check MongoDB Atlas connection.');
    } finally {
      setSaving(false);
    }
  }

  // Get initials for profile badge
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'HW';

  return (
    <AppShell>
      <PageHeader 
        title="Account & Settings" 
        subtitle="Manage recruiter details, workspace customization, and screening scoring ratios." 
      />

      <div style={{ padding: 24, maxWidth: 900, margin: '0 auto', position: 'relative' }} className="fade-in">
        {/* Save confirmation Toast */}
        {showToast && (
          <div
            style={{
              position: 'fixed',
              top: 24,
              right: 24,
              zIndex: 9999,
              background: 'var(--green-bg)',
              border: '1px solid #bbf7d0',
              borderRadius: 6,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            <CheckCircle2 size={16} color="var(--green)" />
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--green)' }}>
              Settings saved successfully to MongoDB Atlas!
            </span>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div
            style={{
              background: 'var(--red-bg)',
              border: '1px solid #fecaca',
              borderRadius: 6,
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 20
            }}
          >
            <ShieldAlert size={18} color="var(--red)" />
            <span style={{ fontSize: 12, color: 'var(--red)', fontWeight: 500 }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Cover Profile Card */}
          <Card style={{ overflow: 'hidden' }}>
            <div 
              style={{ 
                height: 120, 
                background: currentBannerStyle, 
                transition: 'background 0.4s ease',
                position: 'relative' 
              }}
            />
            <div style={{ padding: '0 20px 20px', position: 'relative', marginTop: -40 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow)',
                    border: '3px solid white',
                    fontWeight: 600,
                    fontSize: 24,
                    color: activeAccent,
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  {initials}
                </div>
                <div style={{ paddingBottom: 6 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{name || 'Sarah Chen'}</h2>
                  <p style={{ fontSize: 12, color: 'var(--text-3)' }}>{role || 'Recruiter'} · {company || 'Acme Corp'}</p>
                </div>
              </div>
            </div>
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', maxWidth: 600, margin: '0 auto', width: '100%', gap: 24 }}>
            {/* Form Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <Card style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <User size={15} color="var(--text-2)" />
                  <h3 style={{ fontSize: 13, fontWeight: 600 }}>Recruiter Profile</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <Input
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />

                  <Input
                    label="Work Email"
                    value={user?.email || ''}
                    disabled
                    style={{ background: 'var(--bg-subtle)', cursor: 'not-allowed', color: 'var(--text-3)' }}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Input
                      label="Company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      required
                    />
                    <Input
                      label="Department"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </Card>

              {/* Personalization Section */}
              <Card style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Palette size={15} color="var(--text-2)" />
                  <h3 style={{ fontSize: 13, fontWeight: 600 }}>Workspace Aesthetics</h3>
                </div>

                {/* Banner presets */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: 8 }}>
                    Profile Cover Banner
                  </label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {BANNERS.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setActiveBanner(b.id)}
                        style={{
                          padding: '5px 10px',
                          fontSize: 11,
                          fontWeight: 500,
                          borderRadius: 'var(--radius)',
                          border: activeBanner === b.id ? `1.5px solid var(--text)` : '1px solid var(--border)',
                          background: b.value,
                          color: 'white',
                          cursor: 'pointer',
                          textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                          boxShadow: activeBanner === b.id ? 'var(--shadow-sm)' : 'none',
                          transition: 'all 0.1s'
                        }}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accent palette */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: 8 }}>
                    Global Accent Shifter
                  </label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {ACCENTS.map((a) => {
                      const isActive = activeAccent === a.id;
                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => setActiveAccent(a.id)}
                          title={a.name}
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            background: a.id,
                            border: isActive ? '2px solid var(--text)' : '1.5px solid white',
                            boxShadow: 'var(--shadow-sm)',
                            cursor: 'pointer',
                            transform: isActive ? 'scale(1.15)' : 'scale(1)',
                            transition: 'all 0.15s ease'
                          }}
                        />
                      );
                    })}
                  </div>
                  <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 8 }}>
                    Clicking a shade applies color shifts across buttons, icons, and focus highlights instantly.
                  </p>
                </div>
              </Card>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="accent"
                  loading={saving}
                  style={{ padding: '8px 20px' }}
                >
                  <Save size={14} />
                  Save Settings
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
