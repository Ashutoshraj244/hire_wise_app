import React from 'react';
import { Loader2 } from 'lucide-react';

const VARIANT_STYLES = {
  primary: {
    background: 'var(--text)',
    color: 'var(--bg)',
    border: '1px solid var(--text)',
  },
  secondary: {
    background: 'var(--bg-panel)',
    color: 'var(--text)',
    border: '1px solid var(--border-strong)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-2)',
    border: '1px solid transparent',
  },
  danger: {
    background: 'var(--red)',
    color: 'white',
    border: '1px solid var(--red)',
  },
  accent: {
    background: 'var(--accent)',
    color: 'white',
    border: '1px solid var(--accent)',
  },
};

const HOVER_BG = {
  primary: 'var(--text-2)',
  secondary: 'var(--bg-subtle)',
  ghost: 'var(--bg-hover)',
  danger: '#b91c1c',
  accent: 'var(--accent-hover)',
};

const SIZE_STYLES = {
  sm: { padding: '4px 10px', fontSize: 12 },
  md: { padding: '6px 12px', fontSize: 13 },
  lg: { padding: '8px 16px', fontSize: 13 },
};

export function Button({ children, variant = 'primary', size = 'md', loading, style, disabled, onClick, ...props }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      disabled={loading || disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: 'var(--font-sans)',
        fontWeight: 500,
        borderRadius: 'var(--radius)',
        cursor: loading || disabled ? 'not-allowed' : 'pointer',
        opacity: loading || disabled ? 0.5 : 1,
        transition: 'background 0.12s, opacity 0.12s',
        whiteSpace: 'nowrap',
        ...VARIANT_STYLES[variant],
        ...(hovered && !disabled && !loading ? { background: HOVER_BG[variant] } : {}),
        ...SIZE_STYLES[size],
        ...style,
      }}
      {...props}
    >
      {loading && <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />}
      {children}
    </button>
  );
}

const BADGE_STYLES = {
  default: { background: 'var(--bg-subtle)', color: 'var(--text-2)', border: '1px solid var(--border)' },
  green:   { background: 'var(--green-bg)', color: 'var(--green)', border: '1px solid color-mix(in srgb, var(--green) 30%, transparent)' },
  red:     { background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid color-mix(in srgb, var(--red) 30%, transparent)' },
  orange:  { background: 'var(--orange-bg)', color: 'var(--orange)', border: '1px solid color-mix(in srgb, var(--orange) 30%, transparent)' },
  blue:    { background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)' },
  yellow:  { background: 'var(--yellow-bg)', color: 'var(--yellow)', border: '1px solid color-mix(in srgb, var(--yellow) 30%, transparent)' },
};

export function Badge({ children, color = 'default', style }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 6px',
        fontSize: 11,
        fontWeight: 500,
        borderRadius: 3,
        ...BADGE_STYLES[color],
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export const Input = React.forwardRef(({ label, error, style, ...props }, ref) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)' }}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        style={{
          padding: '6px 10px',
          border: `1px solid ${error ? 'var(--red)' : 'var(--border-strong)'}`,
          borderRadius: 'var(--radius)',
          fontSize: 13,
          background: 'transparent',
          outline: 'none',
          width: '100%',
          color: 'var(--text)',
          fontFamily: 'var(--font-sans)',
          ...style,
        }}
        {...props}
      />
      {error && <span style={{ fontSize: 11, color: 'var(--red)' }}>{error}</span>}
    </div>
  );
});

export function Spinner({ size = 16 }) {
  return (
    <Loader2
      size={size}
      style={{ animation: 'spin 1s linear infinite', color: 'var(--text-3)' }}
    />
  );
}

export function ScoreBadge({ score }) {
  const s = score ?? 0;
  const bg = s >= 80 ? 'var(--green-bg)' : s >= 65 ? 'var(--orange-bg)' : s >= 50 ? 'var(--yellow-bg)' : 'var(--red-bg)';
  const fg = s >= 80 ? 'var(--green)' : s >= 65 ? 'var(--orange)' : s >= 50 ? 'var(--yellow)' : 'var(--red)';

  return (
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        fontWeight: 500,
        padding: '2px 6px',
        borderRadius: 3,
        background: bg,
        color: fg,
        border: `1px solid color-mix(in srgb, ${fg} 30%, transparent)`,
      }}
    >
      {s}%
    </span>
  );
}

export function ScoreBar({ score, showLabel = false }) {
  const s = score ?? 0;
  const barColor = s >= 80 ? 'var(--green)' : s >= 65 ? 'var(--orange)' : s >= 50 ? 'var(--yellow)' : 'var(--red)';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 4, background: 'var(--bg-hover)', borderRadius: 2, overflow: 'hidden' }}>
        <div
          style={{
            width: `${s}%`,
            height: '100%',
            background: barColor,
            borderRadius: 2,
            transition: 'width 0.4s ease',
          }}
        />
      </div>
      {showLabel && (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-2)', minWidth: 28 }}>
          {s}
        </span>
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px', textAlign: 'center', gap: 8 }}>
      {Icon && <Icon size={28} style={{ color: 'var(--text-3)', marginBottom: 4 }} />}
      <p style={{ fontWeight: 500, color: 'var(--text)' }}>{title}</p>
      {description && <p style={{ fontSize: 12, color: 'var(--text-3)', maxWidth: 280 }}>{description}</p>}
      {action && <div style={{ marginTop: 12 }}>{action}</div>}
    </div>
  );
}

export function Card({ children, style, ...props }) {
  return (
    <div
      style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function Divider() {
  return <div style={{ height: 1, background: 'var(--border)' }} />;
}
