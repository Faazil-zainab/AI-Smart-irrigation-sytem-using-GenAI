import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import './EarthriseHero.css';

/**
 * The Earthrise stage. Six photographic layers cut from one frame are stacked
 * and pinned; one scroll range moves each at its own rate:
 *
 *   0.00 – 0.12  a veil of cosmic dust drifts off the lens
 *   0.11 – 0.50  the Earth climbs out from behind the horizon
 *   0.13 – 0.27  the headline resolves between the plains and the crater
 *   0.30 – 0.60  the crater rim closes in around the view
 *   0.70 – 1.00  the ground swallows the frame, handing off to the dashboard
 *
 * The telemetry HUD is live: the clock comes from the dashboard's own timer,
 * the temperature and humidity from the weather sync.
 */

const STAGE_VH = 280;
const ORDER = ['sky', 'earth', 'moonscape', 'frame', 'astronaut', 'ground'];

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const lerp = (a, b, t) => a + (b - a) * t;
const range = (value, a, b) => clamp((value - a) / (b - a));
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

function EarthriseHero({
  dashboardTime,
  backendStatus,
  weatherStatus,
  temperature,
  humidity,
  latitude,
  longitude,
  coordinatesLabel,
  modelInfo,
}) {
  const rootRef = useRef(null);
  const layerRefs = useRef({});
  const veilRef = useRef(null);
  const dustRef = useRef(null);
  const titleRef = useRef(null);
  const hudRef = useRef(null);
  const reduced = useReducedMotion();
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  useEffect(() => {
    const canvas = dustRef.current;
    if (!canvas) return undefined;

    const sync = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = dustRef.current;
    const ctx = canvas && canvas.getContext('2d');
    const veilEl = veilRef.current;
    const title = titleRef.current;
    const hud = hudRef.current;
    if (!canvas || !ctx || !veilEl || !title || !hud) return undefined;

    let seed = 11;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const motes = Array.from({ length: 130 }, () => ({
      x: rand(),
      y: rand(),
      r: 0.4 + rand() * 1.6,
      s: 0.3 + rand(),
      a: 0.2 + rand() * 0.55,
    }));

    const set = (name, y, scale = 1, opacity = 1) => {
      const el = layerRefs.current[name];
      if (!el) return;
      el.style.transform = `translate3d(0, ${y}vh, 0) scale(${scale})`;
      el.style.opacity = String(opacity);
    };

    if (reduced) {
      set('sky', 0, 1.04);
      set('earth', 0, 1);
      set('moonscape', 0, 1);
      set('frame', 0, 1.1, 0.92);
      set('astronaut', 0, 1, 1);
      set('ground', 0, 1);
      veilEl.style.opacity = '0';
      veilEl.style.transform = 'none';
      canvas.style.opacity = '0';
      title.style.opacity = '1';
      title.style.letterSpacing = '0.14em';
      title.style.transform = 'none';
      title.style.filter = '';
      hud.style.opacity = '1';
      return undefined;
    }

    let lastP = -1;
    let lastTime = 0;

    const frame = (time) => {
      const dt = lastTime ? Math.min(0.1, (time - lastTime) / 1000) : 1 / 60;
      lastTime = time;
      const root = rootRef.current;
      if (!root) return;

      const rect = root.getBoundingClientRect();
      const vh = window.innerHeight;
      const span = Math.max(1, rect.height - vh);
      const p = clamp(-rect.top / span);
      if (rect.bottom < 0) return;

      const veil = 1 - range(p, 0, 0.12);

      if (veil > 0.001) {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        const dpr = canvas.width / Math.max(1, w);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#dfe6f2';
        for (const mote of motes) {
          if (!reducedRef.current) {
            mote.x += 0.006 * mote.s * dt;
            mote.y -= 0.004 * mote.s * dt;
            if (mote.x > 1) mote.x -= 1;
            if (mote.y < 0) mote.y += 1;
          }
          ctx.globalAlpha = mote.a * veil;
          ctx.beginPath();
          ctx.arc(mote.x * w, (mote.y - p * 0.6) * h, mote.r * (1 + p * 4), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      if (Math.abs(p - lastP) < 0.00005) return;
      lastP = p;

      const exit = range(p, 0.7, 1);
      const settle = easeOutCubic(range(p, 0, 0.5));

      veilEl.style.opacity = String(veil);
      veilEl.style.transform = `translate3d(0, ${-range(p, 0, 0.12) * 24}vh, 0) scale(${1 + range(p, 0, 0.12) * 0.18})`;
      canvas.style.opacity = String(veil);

      set('sky', lerp(0, -6, p), lerp(1.14, 1, settle));
      const rise = easeOutCubic(range(p, 0.13, 0.52));
      set('earth', lerp(34, 0, rise) - exit * 12, lerp(0.92, 1, rise));
      set('moonscape', lerp(9, 0, settle) - exit * 26);
      const rim = easeOutCubic(range(p, 0.3, 0.6));
      set('frame', -exit * 44, lerp(1.6, 1, rim), rim);
      const up = easeOutCubic(range(p, 0.36, 0.62));
      set('astronaut', lerp(28, 0, up) - exit * 58, 1, clamp(up * 2));
      const ground = easeOutCubic(range(p, 0.34, 0.6));
      set('ground', lerp(36, 0, ground) - exit * 78);

      const tIn = easeOutCubic(range(p, 0.14, 0.28));
      const tOut = range(p, 0.44, 0.54);
      title.style.opacity = String(tIn * (1 - tOut));
      title.style.letterSpacing = `${lerp(0.4, 0.14, tIn)}em`;
      title.style.transform = `translate3d(0, ${-p * 6}vh, 0)`;
      title.style.filter = tIn < 0.99 ? `blur(${(1 - tIn) * 10}px)` : '';

      hud.style.opacity = String(range(p, 0.02, 0.1) * (1 - range(p, 0.6, 0.7)));
    };

    let raf = requestAnimationFrame(function loop(time) {
      frame(time);
      raf = requestAnimationFrame(loop);
    });

    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  const layer = (name) => (
    <div
      key={name}
      ref={(el) => {
        if (el) layerRefs.current[name] = el;
      }}
      className={`hero-layer hero-layer-${name}`}
    >
      <picture>
        <source media="(max-width: 767px)" srcSet={`/layers/m/${name}.webp`} />
        <img
          src={`/layers/d/${name}.webp`}
          alt=""
          aria-hidden="true"
          className="hero-layer-img"
          decoding="async"
        />
      </picture>
      {name === 'ground' && <div className="hero-ground-apron" aria-hidden="true" />}
    </div>
  );

  const clock = dashboardTime.toLocaleTimeString([], { hour12: false });
  const date = dashboardTime.toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' });
  const model = modelInfo?.ml_model || 'IRRIGATION ML';
  const weather = weatherStatus.toUpperCase();

  return (
    <section
      id="top"
      ref={rootRef}
      aria-label="Fieldwise Earthrise"
      className="hero-section"
      style={{ height: reduced ? '100svh' : `${STAGE_VH}svh` }}
    >
      <div className="hero-stage">
        {ORDER.slice(0, 3).map((name) => layer(name))}

        <div className="hero-scrim" aria-hidden="true" />

        <div ref={titleRef} className="hero-title">
          <p className="hero-eyebrow mono">
            <span className={`status-dot ${backendStatus === 'online' ? 'online' : backendStatus === 'offline' ? 'offline' : 'pending'}`} />
            {heroKicker(backendStatus)}
          </p>
          <h1>
            Make every
            <br />
            <span>drop</span> count.
          </h1>
          <p className="hero-lede">
            Live conditions, crop context and model-backed irrigation guidance for the field
            you are managing today.
          </p>
          <div className="hero-actions">
            <a className="hero-button primary" href="#recommendation">
              Run a recommendation <span aria-hidden="true">↗</span>
            </a>
            <a className="hero-button secondary" href="#overview">
              Explore the dashboard
            </a>
          </div>
        </div>

        {ORDER.slice(3).map((name) => layer(name))}

        <div ref={veilRef} className="hero-veil" aria-hidden="true">
          <div className="hero-veil-inner">
            <p className="mono">Fieldwise / autonomous agriculture</p>
            <p className="hero-veil-title">Scroll to clear the dust</p>
            <span className="hero-veil-arrow" aria-hidden="true">↓</span>
          </div>
        </div>

        <canvas ref={dustRef} className="hero-dust" aria-hidden="true" />

        <div ref={hudRef} className="hero-hud" aria-hidden="true">
          <div className="hero-hud-frame brackets" />

          <div className="hud-block hud-tl">
            <span className="hud-label">Field 01</span>
            <strong>{coordinatesLabel}</strong>
            <span className="hud-sub">
              {latitude !== null ? latitude.toFixed(4) : '--'}° N / {longitude !== null ? longitude.toFixed(4) : '--'}° E
            </span>
          </div>

          <div className="hud-block hud-tr">
            <span className="hud-label">Weather sync · {weather}</span>
            <strong>
              {temperature !== null ? `${Math.round(temperature)}°C` : '--'}
              <span className="hud-sep"> / </span>
              {humidity !== null ? `${Math.round(humidity)}%` : '--'}
            </strong>
            <span className="hud-sub">Temperature / relative humidity</span>
          </div>

          <div className="hud-block hud-bl">
            <span className="hud-label">Model</span>
            <strong>{model}</strong>
            <span className="hud-sub">Live sensor synchronization</span>
          </div>

          <div className="hud-block hud-br">
            <span className="hud-label">Mission clock · {date}</span>
            <strong className="hud-clock">{clock}</strong>
            <span className="hud-sub">Local observation time</span>
          </div>

          <div className="hud-cue">
            Scroll <span aria-hidden="true">↓</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function heroKicker(status) {
  if (status === 'online') return 'Fieldwise / live mission control';
  if (status === 'offline') return 'Fieldwise / local archive mode';
  if (status === 'degraded') return 'Fieldwise / degraded telemetry';
  return 'Fieldwise / connecting to telemetry';
}

export default EarthriseHero;
