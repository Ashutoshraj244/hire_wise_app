import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Briefcase, Eye, EyeOff, Github, Linkedin } from 'lucide-react';
import { useAuth } from '../lib/auth';
import api from '../lib/api';
import { Button, Input } from '../components/ui';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  function fillDemo() {
    setValue('email', 'aisha.sharma@acme.co');
    setValue('password', 'demo1234');
  }

  async function onSubmit(data) {
    setApiError('');
    setLoading(true);
    try {
      // Make real POST request to backend server for validation and secure JWT generation
      const res = await api.post('/auth/login', {
        email: data.email,
        password: data.password,
      });
      if (res && res.token) {
        login({ ...res.user, token: res.token });
        navigate('/dashboard');
      } else {
        setApiError('Invalid response from authentication server.');
      }
    } catch (err) {
      console.error(err);
      setApiError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        backgroundColor: 'var(--bg)',
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), url("/background.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div style={{ width: '100%', maxWidth: 340 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
          <div
            style={{
              width: 28,
              height: 28,
              background: 'var(--text)',
              borderRadius: 5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Briefcase size={14} color="var(--bg-panel)" strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: 600, fontSize: 20, letterSpacing: '-0.01em', color: 'var(--text)' }}>
            HireWise
          </span>
        </div>

        {/* Card */}
        <div
          style={{
            background: 'color-mix(in srgb, var(--bg-panel) 90%, transparent)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 24,
            boxShadow: 'var(--shadow)',
          }}
          className="fade-in"
        >
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Sign in</h2>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 20 }}>
            Continue reviewing candidates
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            <Input
              label="Work email"
              type="email"
              placeholder="you@company.com"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
              })}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  style={{
                    padding: '6px 32px 6px 10px',
                    border: `1px solid ${errors.password ? 'var(--red)' : 'var(--border-strong)'}`,
                    borderRadius: 'var(--radius)',
                    fontSize: 13,
                    background: 'transparent',
                    width: '100%',
                    outline: 'none',
                    color: 'var(--text)',
                  }}
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-3)',
                    cursor: 'pointer',
                    padding: 2,
                  }}
                >
                  {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
              {errors.password && (
                <span style={{ fontSize: 11, color: 'var(--red)' }}>{errors.password.message}</span>
              )}
            </div>

            {apiError && (
              <p style={{ fontSize: 12, color: 'var(--red)', padding: '6px 10px', background: 'var(--red-bg)', borderRadius: 3 }}>
                {apiError}
              </p>
            )}

            <Button type="submit" loading={loading} style={{ width: '100%', justifyContent: 'center' }}>
              Sign in
            </Button>
          </form>
        </div>

        {/* Demo hint */}
        <div
          style={{
            marginTop: 12,
            padding: '10px 14px',
            background: 'color-mix(in srgb, var(--bg-panel) 90%, transparent)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
            borderRadius: 12,
            fontSize: 12,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
          }}
        >
          <p style={{ color: 'var(--accent)', fontWeight: 500, marginBottom: 4 }}>Demo account</p>
          <p style={{ color: 'var(--text-2)', lineHeight: 1.6 }}>
            Email: <span className="mono" style={{ fontSize: 11 }}>aisha.sharma@acme.co</span>
            <br />
            Password: <span className="mono" style={{ fontSize: 11 }}>demo1234</span>
          </p>
          <button
            onClick={fillDemo}
            style={{
              marginTop: 8,
              fontSize: 11,
              color: 'var(--accent)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              textDecoration: 'underline',
            }}
          >
            Fill credentials
          </button>
        </div>
      </div>

      {/* Social Links */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          display: 'flex',
          gap: 12,
        }}
      >
        <a
          href="https://github.com/Ashutoshraj244"
          target="_blank"
          rel="noreferrer"
          title="GitHub Profile"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'color-mix(in srgb, var(--bg-panel) 80%, transparent)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid color-mix(in srgb, var(--border) 60%, transparent)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            color: 'var(--text)',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.background = 'var(--bg-panel)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.background = 'color-mix(in srgb, var(--bg-panel) 80%, transparent)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }}
        >
          <Github size={20} />
        </a>
        <a
          href="https://www.linkedin.com/in/ashutoshraj244"
          target="_blank"
          rel="noreferrer"
          title="LinkedIn Profile"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'color-mix(in srgb, var(--bg-panel) 80%, transparent)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid color-mix(in srgb, var(--border) 60%, transparent)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            color: 'var(--text)',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.background = 'var(--bg-panel)';
            e.currentTarget.style.color = '#0077b5';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.background = 'color-mix(in srgb, var(--bg-panel) 80%, transparent)';
            e.currentTarget.style.color = 'var(--text)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }}
        >
          <Linkedin size={20} />
        </a>
      </div>
    </div>
  );
}
