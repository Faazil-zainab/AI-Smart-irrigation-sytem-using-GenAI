import React, { useEffect, useState } from 'react';
import './SiteHeader.css';

const NAV = [
  { label: 'Overview', href: '#overview', index: '01' },
  { label: 'Field model', href: '#field-model', index: '02' },
  { label: 'Recommendation', href: '#recommendation', index: '03' },
  { label: 'Schedule', href: '#schedule', index: '04' },
];

export function Crescent({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M15.5 3.2A9 9 0 1 0 20.8 16 7.2 7.2 0 0 1 15.5 3.2Z" fill="currentColor" />
    </svg>
  );
}

function SiteHeader({ backendStatus, dashboardTime }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const statusLabel =
    backendStatus === 'online'
      ? 'System online'
      : backendStatus === 'degraded'
        ? 'System degraded'
        : backendStatus === 'offline'
          ? 'System offline'
          : 'Connecting';

  return (
    <header className="site-header">
      <nav className="site-nav" aria-label="Primary navigation">
        <a className="brand-mark" href="#top" aria-label="Fieldwise home" onClick={() => setOpen(false)}>
          <Crescent className="brand-crescent" />
          <span className="brand-word">FIELDWISE</span>
        </a>

        <div className="nav-links">
          {NAV.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </div>

        <div className="nav-meta">
          <span className="nav-date">
            {dashboardTime.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="status-indicator">
            <span className={`status-dot ${backendStatus === 'online' ? 'online' : backendStatus === 'offline' ? 'offline' : 'pending'}`} />
            <span>{statusLabel}</span>
          </span>
          <a className="nav-cta" href="#recommendation">
            Run analysis <span aria-hidden="true">↗</span>
          </a>
          <button
            type="button"
            className="menu-toggle"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </nav>

      <div
        id="mobile-menu"
        className={`mobile-menu ${open ? 'is-open' : ''}`}
        aria-hidden={!open}
      >
        <div className="mobile-menu-head mono">
          <span>FIELDWISE / NAVIGATION</span>
          <span>01—04</span>
        </div>
        <div className="mobile-menu-links">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
              <span className="mono">{item.index}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </div>
        <div className="mobile-menu-foot mono">
          <span>{dashboardTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span>{statusLabel}</span>
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
