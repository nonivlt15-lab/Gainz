import React, { useState, useEffect, useRef } from "react";

// ── STORAGE POLYFILL ──────────────────────────────────────────────────────────
if (typeof window !== "undefined" && !window.storage) {
  window.storage = {
    get: async (key) => {
      try {
        const v = localStorage.getItem(key);
        return v !== null ? { value: v } : null;
      } catch { return null; }
    },
    set: async (key, value) => {
      try {
        localStorage.setItem(key, String(value));
        return { key, value };
      } catch { return null; }
    },
    delete: async (key) => {
      try {
        localStorage.removeItem(key);
        return { key, deleted: true };
      } catch { return null; }
    },
  };
}

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');

  :root {
    --bg: #0a0a0b;
    --surface: #131316;
    --surface2: #1c1c22;
    --border: #2a2a35;
    --border2: #363645;
    --gold: #d4a843;
    --gold2: #f0c96a;
    --gold-dim: rgba(212,168,67,0.12);
    --blue-dim: rgba(91,141,238,0.12);
    --green: #5ac87a;
    --green-dim: rgba(90,200,122,0.1);
    --text: #f0ede8;
    --text2: #b8b4c0;
    --muted: #6b6878;
    --danger: #e05252;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-text-size-adjust: 100%; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    -webkit-font-smoothing: antialiased;
    overflow: hidden;
    height: 100vh;
    /* Support notch/safe areas on iPhone */
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
  }

  .app {
    max-width: 480px;
    margin: 0 auto;
    height: 100vh;
    height: 100dvh;
    display: flex;
    flex-direction: column;
    background: var(--bg);
    overflow: hidden;
    position: relative;
  }

  /* ── API KEY SCREEN ── */
  .apikey-screen {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 28px;
    text-align: center;
    gap: 20px;
    overflow-y: auto;
  }

  .apikey-logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 52px;
    letter-spacing: 5px;
    color: var(--gold);
    text-shadow: 0 0 40px rgba(212,168,67,0.3);
  }

  .apikey-tagline {
    font-size: 13px;
    color: var(--muted);
    letter-spacing: 1px;
    text-transform: uppercase;
    font-weight: 600;
    margin-top: -14px;
  }

  .apikey-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px;
    letter-spacing: 2px;
    color: var(--text);
    line-height: 1.2;
  }

  .apikey-sub {
    font-size: 13px;
    color: var(--muted);
    line-height: 1.65;
    max-width: 300px;
  }

  .apikey-sub a { color: var(--gold2); }

  .apikey-steps {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 16px;
    width: 100%;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .apikey-step {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    font-size: 13px;
    color: var(--text2);
    line-height: 1.5;
  }

  .apikey-step-num {
    background: var(--gold-dim);
    border: 1px solid rgba(212,168,67,0.3);
    border-radius: 50%;
    width: 22px; height: 22px;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700;
    color: var(--gold);
    flex-shrink: 0;
    margin-top: 1px;
  }

  .apikey-step a { color: var(--gold2); text-decoration: underline; }

  .apikey-input-wrap { width: 100%; }

  .apikey-input {
    width: 100%;
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: 12px;
    padding: 14px 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: var(--text);
    outline: none;
    transition: border-color 0.2s;
    letter-spacing: 0.5px;
  }

  .apikey-input:focus { border-color: var(--gold); }
  .apikey-input::placeholder { color: var(--muted); }

  .apikey-hint {
    font-size: 11px;
    color: var(--muted);
    margin-top: 8px;
    line-height: 1.5;
  }

  .apikey-secure {
    background: var(--gold-dim);
    border: 1px solid rgba(212,168,67,0.2);
    border-radius: 10px;
    padding: 10px 13px;
    font-size: 12px;
    color: var(--muted);
    line-height: 1.5;
    text-align: left;
    width: 100%;
  }

  .apikey-secure strong { color: var(--gold2); }

  /* ── HEADER ── */
  .app-header {
    padding: 18px 20px 14px;
    background: var(--bg);
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 26px;
    letter-spacing: 3px;
    color: var(--gold);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .logo-dot {
    width: 7px; height: 7px;
    background: var(--gold);
    border-radius: 50%;
    animation: pulse-dot 2.5s ease-in-out infinite;
  }

  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.7); }
  }

  .header-right { font-size: 12px; color: var(--muted); font-weight: 500; cursor: pointer; }

  /* ── PROGRESS ── */
  .progress-wrap {
    padding: 12px 20px 14px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }

  .progress-steps-row { display: flex; gap: 5px; margin-bottom: 8px; }

  .prog-seg {
    flex: 1; height: 3px; border-radius: 2px;
    background: var(--surface2);
    transition: background 0.4s ease;
  }

  .prog-seg.done { background: rgba(212,168,67,0.45); }
  .prog-seg.active { background: var(--gold); }
  .progress-label { font-size: 10px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: var(--muted); }

  /* ── PAGE CONTENT ── */
  .page-content {
    flex: 1; overflow-y: auto;
    padding: 22px 20px 8px;
    -webkit-overflow-scrolling: touch;
  }

  .page-content::-webkit-scrollbar { width: 3px; }
  .page-content::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

  /* ── BOTTOM NAV ── */
  .bottom-nav {
    display: flex;
    border-top: 1px solid var(--border);
    background: var(--surface);
    flex-shrink: 0;
    padding-bottom: env(safe-area-inset-bottom);
  }

  .nav-tab {
    flex: 1; padding: 11px 8px 14px; text-align: center;
    cursor: pointer; border: none; background: transparent;
    -webkit-tap-highlight-color: transparent;
  }

  .nav-tab-icon { font-size: 19px; line-height: 1; display: block; margin-bottom: 3px; }
  .nav-tab-label { font-size: 10px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; color: var(--muted); transition: color 0.2s; }
  .nav-tab.active .nav-tab-label { color: var(--gold); }

  /* ── TYPOGRAPHY ── */
  .step-title { font-family: 'Bebas Neue', sans-serif; font-size: 30px; letter-spacing: 2px; line-height: 1.1; color: var(--text); margin-bottom: 5px; }
  .step-sub { font-size: 13px; color: var(--muted); margin-bottom: 22px; line-height: 1.55; }
  .section-label { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); margin-bottom: 10px; margin-top: 22px; }
  .section-label:first-child { margin-top: 0; }
  .section-top-hint { font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: var(--muted); margin-bottom: 14px; }

  /* ── MUSCLE GRID ── */
  .muscle-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }

  .muscle-card {
    background: var(--surface); border: 1.5px solid var(--border); border-radius: 14px;
    padding: 13px 12px; cursor: pointer; transition: all 0.18s ease;
    display: flex; align-items: center; gap: 10px;
    user-select: none; -webkit-tap-highlight-color: transparent;
  }

  .muscle-card:active { transform: scale(0.95); }
  .muscle-card.selected { border-color: var(--gold); background: var(--gold-dim); }
  .muscle-icon { font-size: 19px; line-height: 1; }
  .muscle-label { font-size: 13px; font-weight: 500; }
  .muscle-card.selected .muscle-label { color: var(--gold); font-weight: 600; }
  .muscles-hint { margin-top: 12px; font-size: 12px; color: var(--muted); text-align: center; }
  .muscles-hint span { color: var(--gold2); font-weight: 600; }

  /* ── GOALS ── */
  .goal-list { display: flex; flex-direction: column; gap: 9px; }

  .goal-card {
    background: var(--surface); border: 1.5px solid var(--border); border-radius: 14px;
    padding: 15px 16px; cursor: pointer; transition: all 0.18s ease;
    display: flex; align-items: center; gap: 14px;
    user-select: none; -webkit-tap-highlight-color: transparent;
  }

  .goal-card:active { transform: scale(0.97); }
  .goal-card.selected { border-color: var(--gold); background: var(--gold-dim); }
  .goal-emoji { font-size: 22px; line-height: 1; }
  .goal-text { flex: 1; }
  .goal-name { font-size: 14px; font-weight: 600; }
  .goal-card.selected .goal-name { color: var(--gold); }
  .goal-desc { font-size: 12px; color: var(--muted); margin-top: 2px; }
  .goal-scheme { background: var(--surface2); border-radius: 8px; padding: 3px 8px; font-size: 11px; font-weight: 700; color: var(--text2); white-space: nowrap; }
  .goal-card.selected .goal-scheme { background: rgba(212,168,67,0.2); color: var(--gold2); }

  /* ── CHIPS ── */
  .chip-group { display: flex; flex-wrap: wrap; gap: 8px; }

  .chip {
    background: var(--surface); border: 1.5px solid var(--border); border-radius: 100px;
    padding: 8px 14px; font-size: 13px; font-family: 'DM Sans', sans-serif;
    cursor: pointer; transition: all 0.18s; user-select: none;
    -webkit-tap-highlight-color: transparent; color: var(--text);
  }

  .chip:active { transform: scale(0.93); }
  .chip.selected { background: var(--gold-dim); border-color: var(--gold); color: var(--gold); font-weight: 600; }

  /* ── DAYS ── */
  .days-selector { display: flex; gap: 7px; }

  .day-btn {
    flex: 1; background: var(--surface); border: 1.5px solid var(--border); border-radius: 12px;
    padding: 12px 4px; color: var(--text); font-family: 'Bebas Neue', sans-serif;
    font-size: 22px; cursor: pointer; text-align: center; transition: all 0.18s;
    user-select: none; -webkit-tap-highlight-color: transparent;
  }

  .day-btn .day-sub { font-family: 'DM Sans', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 0.5px; color: var(--muted); display: block; margin-top: 2px; }
  .day-btn.selected { background: var(--gold-dim); border-color: var(--gold); color: var(--gold); }
  .day-btn.selected .day-sub { color: var(--gold2); }

  /* ── INPUTS ── */
  .text-input {
    width: 100%; background: var(--surface); border: 1.5px solid var(--border); border-radius: 12px;
    padding: 13px 15px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: var(--text);
    resize: none; outline: none; transition: border-color 0.2s; line-height: 1.5;
  }

  .text-input:focus { border-color: var(--gold); }
  .text-input::placeholder { color: var(--muted); }

  /* ── BOXES ── */
  .info-box { background: var(--gold-dim); border: 1px solid rgba(212,168,67,0.2); border-radius: 12px; padding: 13px 15px; font-size: 13px; color: var(--text2); line-height: 1.6; margin-top: 18px; }
  .info-box strong { color: var(--gold2); }
  .error-box { background: rgba(224,82,82,0.08); border: 1px solid rgba(224,82,82,0.3); border-radius: 12px; padding: 14px 16px; font-size: 13px; color: #e09090; line-height: 1.5; margin-top: 16px; }

  /* ── BUTTONS ── */
  .action-bar {
    padding: 14px 20px 10px; background: var(--bg);
    border-top: 1px solid var(--border); flex-shrink: 0;
    display: flex; flex-direction: column; gap: 9px;
  }

  .btn-primary {
    width: 100%; background: var(--gold); color: #0a0a0b; border: none; border-radius: 14px;
    padding: 16px; font-family: 'Bebas Neue', sans-serif; font-size: 19px; letter-spacing: 2px;
    cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center;
    justify-content: center; gap: 8px; -webkit-tap-highlight-color: transparent;
  }

  .btn-primary:hover { background: var(--gold2); }
  .btn-primary:active { transform: scale(0.97); }
  .btn-primary:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }

  .btn-ghost {
    background: transparent; border: 1.5px solid var(--border); border-radius: 12px;
    padding: 12px; color: var(--muted); font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 500; cursor: pointer; width: 100%;
    transition: all 0.18s; -webkit-tap-highlight-color: transparent;
  }

  .btn-ghost:hover { border-color: var(--border2); color: var(--text2); }

  /* ── LOADING ── */
  .loading-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; gap: 20px; text-align: center; }
  .loader-container { position: relative; width: 70px; height: 70px; }
  .loader-ring { width: 70px; height: 70px; border: 2.5px solid var(--border); border-top-color: var(--gold); border-radius: 50%; animation: spin 0.9s linear infinite; position: absolute; top: 0; left: 0; }
  .loader-inner { width: 50px; height: 50px; border: 2px solid transparent; border-bottom-color: rgba(212,168,67,0.3); border-radius: 50%; animation: spin 1.4s linear infinite reverse; position: absolute; top: 10px; left: 10px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-title { font-family: 'Bebas Neue', sans-serif; font-size: 24px; letter-spacing: 2px; color: var(--gold); }
  .loading-subtitle { font-size: 13px; color: var(--muted); line-height: 1.5; max-width: 260px; }
  .loading-items { display: flex; flex-direction: column; gap: 10px; width: 100%; max-width: 280px; }
  .loading-item { display: flex; align-items: center; gap: 10px; padding: 11px 14px; border-radius: 10px; background: var(--surface); transition: all 0.4s ease; font-size: 13px; color: var(--muted); }
  .loading-item.active { background: var(--gold-dim); color: var(--text); border: 1px solid rgba(212,168,67,0.2); }
  .loading-item.done { color: var(--green); }
  .li-icon { font-size: 16px; line-height: 1; flex-shrink: 0; }

  /* ── PROGRAM PREVIEW ── */
  .program-hero { background: linear-gradient(145deg, var(--surface2) 0%, rgba(212,168,67,0.07) 100%); border: 1px solid var(--border); border-radius: 20px; padding: 22px 20px; margin-bottom: 20px; }
  .program-hero-name { font-family: 'Bebas Neue', sans-serif; font-size: 26px; letter-spacing: 2px; color: var(--gold); line-height: 1; margin-bottom: 6px; }
  .program-hero-summary { font-size: 13px; color: var(--text2); line-height: 1.5; margin-bottom: 14px; }
  .meta-row { display: flex; flex-wrap: wrap; gap: 7px; }
  .meta-pill { background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 8px; padding: 4px 10px; font-size: 11px; font-weight: 600; color: var(--text2); }

  /* ── DAY CARDS ── */
  .day-card { background: var(--surface); border: 1px solid var(--border); border-radius: 18px; margin-bottom: 12px; overflow: hidden; transition: border-color 0.2s; }
  .day-card.expanded { border-color: var(--border2); }
  .day-header { padding: 15px 16px; display: flex; align-items: center; gap: 14px; cursor: pointer; user-select: none; -webkit-tap-highlight-color: transparent; }
  .day-num-big { font-family: 'Bebas Neue', sans-serif; font-size: 34px; line-height: 1; color: var(--border2); min-width: 30px; transition: color 0.2s; }
  .day-card.expanded .day-num-big { color: var(--gold); }
  .day-header-text { flex: 1; min-width: 0; }
  .day-header-name { font-size: 14px; font-weight: 600; }
  .day-header-muscles { font-size: 12px; color: var(--muted); margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .day-chevron { color: var(--muted); font-size: 16px; transition: transform 0.25s; flex-shrink: 0; }
  .day-card.expanded .day-chevron { transform: rotate(180deg); color: var(--gold); }
  .ex-list { border-top: 1px solid var(--border); max-height: 0; overflow: hidden; transition: max-height 0.4s cubic-bezier(0.4,0,0.2,1); }
  .day-card.expanded .ex-list { max-height: 3000px; }
  .ex-row { padding: 13px 16px; display: flex; gap: 12px; border-bottom: 1px solid rgba(42,42,53,0.7); }
  .ex-row:last-child { border-bottom: none; }
  .ex-idx { font-family: 'Bebas Neue', sans-serif; font-size: 16px; color: var(--muted); min-width: 18px; padding-top: 2px; flex-shrink: 0; }
  .ex-body { flex: 1; min-width: 0; }
  .ex-name { font-size: 14px; font-weight: 600; margin-bottom: 3px; }
  .ex-muscle-tag { display: inline-block; background: var(--surface2); border-radius: 5px; padding: 2px 7px; font-size: 10px; font-weight: 700; letter-spacing: 0.5px; color: var(--muted); text-transform: uppercase; margin-bottom: 5px; }
  .ex-tip { font-size: 12px; color: var(--muted); line-height: 1.45; margin-bottom: 7px; font-style: italic; }
  .ex-stats { display: flex; gap: 6px; flex-wrap: wrap; }
  .ex-stat { border-radius: 7px; padding: 4px 9px; font-size: 11px; font-weight: 700; }
  .ex-stat.sets { background: rgba(212,168,67,0.14); color: var(--gold2); }
  .ex-stat.reps { background: var(--blue-dim); color: #8ab5ff; }
  .ex-stat.rest { background: var(--green-dim); color: #7de8a0; }
  .rest-content { border-top: 1px solid var(--border); padding: 20px 16px; text-align: center; color: var(--muted); font-size: 14px; line-height: 1.6; }
  .rest-icon { font-size: 28px; display: block; margin-bottom: 8px; }
  .save-bar { padding: 14px 20px 12px; background: var(--bg); border-top: 1px solid var(--border); flex-shrink: 0; display: flex; flex-direction: column; gap: 9px; }

  /* ── MY PROGRAMS ── */
  .my-programs-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 30px; text-align: center; gap: 16px; }
  .empty-icon { font-size: 56px; opacity: 0.3; }
  .empty-title { font-family: 'Bebas Neue', sans-serif; font-size: 26px; letter-spacing: 2px; color: var(--muted); }
  .empty-sub { font-size: 14px; color: var(--muted); line-height: 1.6; max-width: 240px; }
  .saved-programs-list { display: flex; flex-direction: column; gap: 12px; }
  .saved-prog-card { background: var(--surface); border: 1px solid var(--border); border-radius: 18px; padding: 18px; cursor: pointer; transition: all 0.2s; -webkit-tap-highlight-color: transparent; position: relative; overflow: hidden; }
  .saved-prog-card:active { transform: scale(0.98); }
  .saved-prog-card:hover { border-color: var(--border2); }
  .spc-name { font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 1.5px; color: var(--gold); margin-bottom: 4px; }
  .spc-meta { font-size: 12px; color: var(--muted); margin-bottom: 10px; }
  .spc-badges { display: flex; gap: 7px; flex-wrap: wrap; }
  .spc-badge { background: var(--surface2); border-radius: 7px; padding: 3px 9px; font-size: 11px; font-weight: 600; color: var(--text2); }
  .spc-delete { position: absolute; top: 16px; right: 16px; background: rgba(224,82,82,0.1); border: none; border-radius: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; color: var(--danger); transition: all 0.2s; -webkit-tap-highlight-color: transparent; }
  .spc-delete:hover { background: rgba(224,82,82,0.2); }

  /* ── DAILY VIEW ── */
  .daily-header { background: var(--surface); border-bottom: 1px solid var(--border); padding: 14px 20px; display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
  .back-btn { background: var(--surface2); border: none; border-radius: 10px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 16px; cursor: pointer; color: var(--text); transition: all 0.2s; -webkit-tap-highlight-color: transparent; flex-shrink: 0; }
  .back-btn:active { transform: scale(0.93); }
  .daily-header-info { flex: 1; min-width: 0; }
  .daily-prog-name { font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 1.5px; color: var(--gold); line-height: 1; }
  .daily-day-label { font-size: 12px; color: var(--muted); margin-top: 2px; }
  .day-navigator { padding: 14px 20px; border-bottom: 1px solid var(--border); flex-shrink: 0; background: var(--bg); }
  .day-nav-scroll { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
  .day-nav-scroll::-webkit-scrollbar { display: none; }
  .day-pill { flex-shrink: 0; background: var(--surface); border: 1.5px solid var(--border); border-radius: 100px; padding: 8px 14px; cursor: pointer; transition: all 0.18s; text-align: center; user-select: none; -webkit-tap-highlight-color: transparent; }
  .day-pill:active { transform: scale(0.94); }
  .day-pill.active-day { background: var(--gold-dim); border-color: var(--gold); }
  .day-pill.rest-pill { opacity: 0.55; }
  .day-pill.active-day.rest-pill { opacity: 0.85; }
  .dp-num { font-family: 'Bebas Neue', sans-serif; font-size: 18px; line-height: 1; color: var(--text2); }
  .day-pill.active-day .dp-num { color: var(--gold); }
  .dp-label { font-size: 10px; font-weight: 600; letter-spacing: 0.4px; color: var(--muted); margin-top: 1px; max-width: 60px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .session-header { margin-bottom: 16px; }
  .session-title { font-family: 'Bebas Neue', sans-serif; font-size: 28px; letter-spacing: 2px; color: var(--text); line-height: 1; margin-bottom: 4px; }
  .session-muscles { font-size: 13px; color: var(--gold2); font-weight: 500; }
  .session-ex-count { font-size: 12px; color: var(--muted); margin-top: 3px; }
  .session-progress { background: var(--surface); border-radius: 12px; padding: 12px 14px; margin-bottom: 16px; display: flex; align-items: center; gap: 12px; }
  .sp-bar-wrap { flex: 1; height: 5px; background: var(--border); border-radius: 3px; overflow: hidden; }
  .sp-bar { height: 100%; background: var(--green); border-radius: 3px; transition: width 0.5s ease; }
  .sp-text { font-size: 12px; color: var(--muted); font-weight: 600; white-space: nowrap; }
  .sp-text span { color: var(--green); }
  .ex-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 16px; margin-bottom: 10px; transition: border-color 0.25s, background 0.25s; }
  .ex-card.completed { border-color: var(--green); background: var(--green-dim); }
  .ex-card-top { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 10px; }
  .ex-card-num { font-family: 'Bebas Neue', sans-serif; font-size: 28px; line-height: 1; color: var(--border2); min-width: 28px; flex-shrink: 0; padding-top: 2px; transition: color 0.25s; }
  .ex-card.completed .ex-card-num { color: var(--green); }
  .ex-card-info { flex: 1; min-width: 0; }
  .ex-card-name { font-size: 15px; font-weight: 700; margin-bottom: 2px; }
  .ex-muscle-badge { display: inline-block; background: var(--surface2); border-radius: 5px; padding: 2px 7px; font-size: 10px; font-weight: 700; letter-spacing: 0.5px; color: var(--muted); text-transform: uppercase; margin-bottom: 5px; transition: all 0.25s; }
  .ex-card.completed .ex-muscle-badge { background: rgba(90,200,122,0.12); color: var(--green); }
  .ex-card-tip { font-size: 12px; color: var(--muted); font-style: italic; line-height: 1.45; }
  .ex-card-stats { display: flex; gap: 8px; margin-bottom: 12px; }
  .ex-big-stat { flex: 1; background: var(--surface2); border-radius: 11px; padding: 10px 8px; text-align: center; }
  .ex-big-stat .val { font-family: 'Bebas Neue', sans-serif; font-size: 22px; line-height: 1; }
  .ex-big-stat .lbl { font-size: 10px; font-weight: 600; letter-spacing: 0.5px; color: var(--muted); text-transform: uppercase; margin-top: 2px; }
  .ex-big-stat.sets-stat .val { color: var(--gold2); }
  .ex-big-stat.reps-stat .val { color: #8ab5ff; }
  .ex-big-stat.rest-stat .val { font-size: 16px; padding-top: 4px; color: var(--green); }
  .ex-done-btn { width: 100%; background: var(--surface2); border: 1.5px dashed var(--border2); border-radius: 11px; padding: 11px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; color: var(--muted); cursor: pointer; transition: all 0.2s; -webkit-tap-highlight-color: transparent; }
  .ex-done-btn:hover { border-color: var(--green); color: var(--green); }
  .ex-card.completed .ex-done-btn { background: rgba(90,200,122,0.1); border: 1.5px solid var(--green); color: var(--green); }
  .rest-day-view { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 50px 30px; text-align: center; gap: 14px; }
  .rest-big-icon { font-size: 70px; }
  .rest-view-title { font-family: 'Bebas Neue', sans-serif; font-size: 28px; letter-spacing: 2px; color: var(--text); }
  .rest-view-sub { font-size: 14px; color: var(--muted); line-height: 1.6; max-width: 260px; }
  .rest-tips { margin-top: 16px; display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 300px; }
  .rest-tip-item { background: var(--surface); border-radius: 12px; padding: 12px 14px; font-size: 13px; color: var(--text2); display: flex; gap: 10px; align-items: flex-start; text-align: left; }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  .fade-up { animation: fadeUp 0.35s ease both; }
`;

// ── DATA ──────────────────────────────────────────────────────────────────────
const MUSCLES = [
  { id: "chest", label: "Pectoraux", icon: "🫁" },
  { id: "back", label: "Dos", icon: "🔙" },
  { id: "shoulders", label: "Épaules", icon: "🔺" },
  { id: "biceps", label: "Biceps", icon: "💪" },
  { id: "triceps", label: "Triceps", icon: "🦾" },
  { id: "legs", label: "Jambes", icon: "🦵" },
  { id: "glutes", label: "Fessiers", icon: "🍑" },
  { id: "abs", label: "Abdominaux", icon: "⚡" },
  { id: "calves", label: "Mollets", icon: "🦶" },
  { id: "traps", label: "Trapèzes", icon: "🏔" },
  { id: "forearms", label: "Avant-bras", icon: "🤜" },
  { id: "fullbody", label: "Full Body", icon: "🔥" },
];

const GOALS = [
  { id: "strength", label: "Force pure", desc: "Charges maximales, technique lourde", scheme: "3–6 reps", emoji: "⚡" },
  { id: "hypertrophy", label: "Hypertrophie", desc: "Prise de masse musculaire", scheme: "8–12 reps", emoji: "💪" },
  { id: "endurance", label: "Endurance musc.", desc: "Résistance et capacité cardio", scheme: "15–20 reps", emoji: "🏃" },
  { id: "weight_loss", label: "Perte de poids", desc: "Brûle-graisses et circuits", scheme: "12–15 reps", emoji: "🔥" },
  { id: "toning", label: "Tonification", desc: "Définition et maintien musculaire", scheme: "10–15 reps", emoji: "✨" },
];

const LEVELS = [
  { id: "beginner", label: "Débutant" },
  { id: "intermediate", label: "Intermédiaire" },
  { id: "advanced", label: "Confirmé" },
];

const EQUIPMENT = [
  { id: "gym", label: "Salle complète" },
  { id: "barbell", label: "Barre olympique" },
  { id: "dumbbells", label: "Haltères" },
  { id: "cables", label: "Câbles / Poulies" },
  { id: "machines", label: "Machines guidées" },
  { id: "bodyweight", label: "Poids du corps" },
];

// ── AI CALL ───────────────────────────────────────────────────────────────────
async function callAI(form, apiKey, onStep) {
  const muscleNames = form.muscles.map(m => MUSCLES.find(x => x.id === m)?.label || m).join(", ");
  const goalObj = GOALS.find(g => g.id === form.goal);
  const levelObj = LEVELS.find(l => l.id === form.level);
  const equipList = form.equipment.map(e => EQUIPMENT.find(x => x.id === e)?.label || e).join(", ");

  onStep("search");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-opus-4-6",
      max_tokens: 4000,
      system: `Tu es un coach sportif expert. Crée des programmes de musculation RÉALISTES.
RÈGLES OBLIGATOIRES :
- Petit muscle (biceps, triceps, mollets) : 2 exercices MAX par séance
- Muscle moyen (épaules, abdos) : 2-3 exercices
- Grand muscle (dos, pectoraux, jambes) : 3-4 exercices
- Max 6-7 exercices par séance
- Regroupe les muscles synergiques (pecs+triceps+épaules = PUSH, dos+biceps = PULL)
RÉPONDS UNIQUEMENT EN JSON VALIDE. AUCUN TEXTE AVANT OU APRÈS.`,
      messages: [{
        role: "user",
        content: `Programme pour :
- Muscles : ${muscleNames}
- Objectif : ${goalObj?.label} — ${goalObj?.scheme}
- Niveau : ${levelObj?.label}
- Équipement : ${equipList || "salle complète"}
- Fréquence : ${form.daysPerWeek} séances/semaine
- Notes : ${form.notes || "aucune"}

JSON ATTENDU :
{
  "programName": "...", "summary": "...", "goal": "...", "level": "...", "frequency": "...", "duration": "...",
  "days": [
    { "dayNumber": 1, "name": "PUSH", "muscles": "Pectoraux • Épaules • Triceps", "isRest": false,
      "exercises": [{ "name": "Développé couché", "muscle": "Pectoraux", "sets": 4, "reps": "8-10", "rest": "2 min", "tip": "Conseil" }]
    }
  ]
}`
      }]
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 401) throw new Error("Clé API invalide. Vérifie sur console.anthropic.com");
    if (res.status === 429) throw new Error("Limite atteinte. Attends quelques secondes.");
    throw new Error(err.error?.message || `Erreur HTTP ${res.status}`);
  }

  const data = await res.json();
  onStep("building");

  const rawText = data.content.filter(b => b.type === "text").map(b => b.text).join("\n");
  const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/) || rawText.match(/(\{[\s\S]*"days"[\s\S]*\})/);
  return jsonMatch ? JSON.parse(jsonMatch[1]) : JSON.parse(rawText.trim());
}

// ── STORAGE ───────────────────────────────────────────────────────────────────
async function loadPrograms() {
  try { const r = await window.storage.get("gainz:programs"); return r ? JSON.parse(r.value) : []; }
  catch { return []; }
}
async function savePrograms(list) {
  try { await window.storage.set("gainz:programs", JSON.stringify(list)); } catch {}
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [apiKey, setApiKey] = useState("");
  const [apiKeyConfirmed, setApiKeyConfirmed] = useState(false);
  const [tab, setTab] = useState("create");
  const [savedPrograms, setSavedPrograms] = useState([]);
  const [dailyView, setDailyView] = useState(null);

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  useEffect(() => {
    loadPrograms().then(setSavedPrograms);
    const stored = localStorage.getItem("gainz:apikey");
    if (stored) { setApiKey(stored); setApiKeyConfirmed(true); }
  }, []);

  const confirmKey = () => {
    const k = apiKey.trim();
    if (!k.startsWith("sk-")) return;
    localStorage.setItem("gainz:apikey", k);
    setApiKeyConfirmed(true);
  };

  const handleSave = async (program) => {
    const p = { ...program, id: Date.now().toString(), savedAt: new Date().toLocaleDateString("fr-FR") };
    const updated = [p, ...savedPrograms];
    setSavedPrograms(updated);
    await savePrograms(updated);
    setDailyView(p);
    setTab("myprograms");
  };

  const handleDelete = async (id) => {
    const updated = savedPrograms.filter(p => p.id !== id);
    setSavedPrograms(updated);
    await savePrograms(updated);
    if (dailyView?.id === id) setDailyView(null);
  };

  // ── API Key Screen ──
  if (!apiKeyConfirmed) {
    return (
      <div className="app">
        <div className="apikey-screen fade-up">
          <div>
            <div className="apikey-logo">GAINZ</div>
            <div className="apikey-tagline">Programmes IA · Muscu</div>
          </div>

          <div className="apikey-title">CONFIGURE<br />TA CLÉ API</div>

          <div className="apikey-steps">
            <div className="apikey-step">
              <div className="apikey-step-num">1</div>
              <div>Va sur <a href="https://console.anthropic.com" target="_blank" rel="noreferrer">console.anthropic.com</a> et crée un compte gratuit</div>
            </div>
            <div className="apikey-step">
              <div className="apikey-step-num">2</div>
              <div>Clique sur <strong style={{color:'var(--text)'}}>API Keys</strong> → <strong style={{color:'var(--text)'}}>Create Key</strong></div>
            </div>
            <div className="apikey-step">
              <div className="apikey-step-num">3</div>
              <div>Copie la clé (commence par <strong style={{color:'var(--gold2)'}}>sk-ant-...</strong>) et colle-la ci-dessous</div>
            </div>
          </div>

          <div className="apikey-input-wrap">
            <input
              className="apikey-input"
              type="password"
              placeholder="sk-ant-api03-..."
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              onKeyDown={e => e.key === "Enter" && confirmKey()}
              autoComplete="off"
            />
            <div className="apikey-hint">Ta clé est mémorisée localement — tu ne la saisiras qu'une seule fois.</div>
          </div>

          <div className="apikey-secure">
            🔒 <strong>100% privé :</strong> ta clé n'est stockée que sur cet appareil et n'est envoyée qu'à l'API Anthropic. Aucun serveur tiers n'y a accès.
          </div>

          <button
            className="btn-primary"
            style={{width:'100%'}}
            disabled={!apiKey.trim().startsWith("sk-")}
            onClick={confirmKey}
          >
            DÉMARRER GAINZ →
          </button>
        </div>
      </div>
    );
  }

  // ── Daily View ──
  if (dailyView) {
    return (
      <div className="app">
        <DailyView program={dailyView} onBack={() => setDailyView(null)} />
      </div>
    );
  }

  return (
    <div className="app">
      {tab === "create" && (
        <CreateView
          apiKey={apiKey}
          onSave={handleSave}
          onResetKey={() => { localStorage.removeItem("gainz:apikey"); setApiKeyConfirmed(false); setApiKey(""); }}
        />
      )}
      {tab === "myprograms" && (
        <MyProgramsView programs={savedPrograms} onOpen={setDailyView} onDelete={handleDelete} />
      )}
      <div className="bottom-nav">
        <button className={`nav-tab ${tab === "create" ? "active" : ""}`} onClick={() => setTab("create")}>
          <span className="nav-tab-icon">✦</span>
          <span className="nav-tab-label">Créer</span>
        </button>
        <button className={`nav-tab ${tab === "myprograms" ? "active" : ""}`} onClick={() => setTab("myprograms")}>
          <span className="nav-tab-icon">📋</span>
          <span className="nav-tab-label">Mes Programmes</span>
        </button>
      </div>
    </div>
  );
}

// ── CREATE VIEW ───────────────────────────────────────────────────────────────
function CreateView({ apiKey, onSave, onResetKey }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ muscles: [], goal: "", level: "intermediate", equipment: [], daysPerWeek: 4, notes: "" });
  const [program, setProgram] = useState(null);
  const [loadStep, setLoadStep] = useState("search");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState({});

  const toggle = (key, id) => setForm(f => ({
    ...f, [key]: f[key].includes(id) ? f[key].filter(x => x !== id) : [...f[key], id]
  }));

  const generate = async () => {
    setLoading(true); setError("");
    try {
      const p = await callAI(form, apiKey, setLoadStep);
      setProgram(p); setExpanded({ 0: true }); setStep("preview");
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const reset = () => { setStep(1); setProgram(null); setError(""); setForm({ muscles: [], goal: "", level: "intermediate", equipment: [], daysPerWeek: 4, notes: "" }); };

  const LABELS = { 1: "MUSCLES", 2: "OBJECTIF", 3: "DÉTAILS" };

  return (
    <>
      <div className="app-header">
        <div className="logo"><div className="logo-dot" />GAINZ</div>
        <div className="header-right" onClick={step !== "preview" && !loading ? undefined : undefined}>
          {step === "preview" ? <span style={{ color: "var(--green)" }}>Prêt ✓</span>
            : loading ? "..." : `Étape ${step}/3`}
        </div>
      </div>

      {!loading && (
        <div className="progress-wrap">
          <div className="progress-steps-row">
            {[1, 2, 3].map(s => {
              const cur = step === "preview" ? 4 : Number(step);
              return <div key={s} className={`prog-seg ${s < cur ? "done" : s === cur ? "active" : ""}`} />;
            })}
          </div>
          <div className="progress-label">{step === "preview" ? "APERÇU DU PROGRAMME" : LABELS[step]}</div>
        </div>
      )}

      {loading && (
        <div className="page-content">
          <div className="loading-screen">
            <div className="loader-container"><div className="loader-ring" /><div className="loader-inner" /></div>
            <div className="loading-title">GÉNÉRATION EN COURS</div>
            <div className="loading-subtitle">L'IA analyse ton profil et construit ton programme personnalisé</div>
            <div className="loading-items">
              {[
                { k: "search", icon: "🧠", txt: "Analyse de ton profil..." },
                { k: "building", icon: "🏗", txt: "Construction du programme..." },
              ].map(item => (
                <div key={item.k} className={`loading-item ${loadStep === item.k ? "active" : loadStep === "building" && item.k === "search" ? "done" : ""}`}>
                  <span className="li-icon">{loadStep === "building" && item.k === "search" ? "✅" : item.icon}</span>
                  {item.txt}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 1 && !loading && (
        <>
          <div className="page-content fade-up">
            <div className="step-title">QUELS MUSCLES<br />CIBLER ?</div>
            <div className="step-sub">L'IA regroupera tes muscles en séances synergiques — pecs + triceps + épaules dans une même journée PUSH, par exemple.</div>
            <div className="muscle-grid">
              {MUSCLES.map(m => (
                <div key={m.id} className={`muscle-card ${form.muscles.includes(m.id) ? "selected" : ""}`} onClick={() => toggle("muscles", m.id)}>
                  <span className="muscle-icon">{m.icon}</span>
                  <span className="muscle-label">{m.label}</span>
                </div>
              ))}
            </div>
            {form.muscles.length > 0 && (
              <div className="muscles-hint"><span>{form.muscles.length}</span> groupe{form.muscles.length > 1 ? "s" : ""} sélectionné{form.muscles.length > 1 ? "s" : ""}</div>
            )}
          </div>
          <div className="action-bar">
            <button className="btn-primary" disabled={!form.muscles.length} onClick={() => setStep(2)}>SUIVANT →</button>
          </div>
        </>
      )}

      {step === 2 && !loading && (
        <>
          <div className="page-content fade-up">
            <div className="step-title">TON OBJECTIF<br />PRINCIPAL</div>
            <div className="step-sub">Cela détermine les séries, répétitions et temps de repos.</div>
            <div className="goal-list">
              {GOALS.map(g => (
                <div key={g.id} className={`goal-card ${form.goal === g.id ? "selected" : ""}`} onClick={() => setForm(f => ({ ...f, goal: g.id }))}>
                  <span className="goal-emoji">{g.emoji}</span>
                  <div className="goal-text"><div className="goal-name">{g.label}</div><div className="goal-desc">{g.desc}</div></div>
                  <div className="goal-scheme">{g.scheme}</div>
                </div>
              ))}
            </div>
            <div className="section-label">Ton niveau actuel</div>
            <div className="chip-group">
              {LEVELS.map(l => (
                <div key={l.id} className={`chip ${form.level === l.id ? "selected" : ""}`} onClick={() => setForm(f => ({ ...f, level: l.id }))}>{l.label}</div>
              ))}
            </div>
          </div>
          <div className="action-bar">
            <button className="btn-primary" disabled={!form.goal} onClick={() => setStep(3)}>SUIVANT →</button>
            <button className="btn-ghost" onClick={() => setStep(1)}>← Retour</button>
          </div>
        </>
      )}

      {step === 3 && !loading && (
        <>
          <div className="page-content fade-up">
            <div className="step-title">DERNIÈRES<br />PRÉCISIONS</div>
            <div className="step-sub">Plus c'est précis, plus le programme sera personnalisé.</div>
            <div className="section-label">Séances par semaine</div>
            <div className="days-selector">
              {[2, 3, 4, 5, 6].map(d => (
                <div key={d} className={`day-btn ${form.daysPerWeek === d ? "selected" : ""}`} onClick={() => setForm(f => ({ ...f, daysPerWeek: d }))}>
                  {d}<span className="day-sub">jour{d > 1 ? "s" : ""}</span>
                </div>
              ))}
            </div>
            <div className="section-label" style={{ marginTop: 20 }}>Équipement disponible</div>
            <div className="chip-group">
              {EQUIPMENT.map(e => (
                <div key={e.id} className={`chip ${form.equipment.includes(e.id) ? "selected" : ""}`} onClick={() => toggle("equipment", e.id)}>{e.label}</div>
              ))}
            </div>
            <div className="section-label" style={{ marginTop: 20 }}>Exercices préférés / remarques</div>
            <textarea className="text-input" rows={3} placeholder="Ex : J'aime le squat et le soulevé de terre…" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            <div className="info-box">🤖 <strong>Claude analyse ton profil</strong> et crée un programme basé sur la science sportive moderne — synergies musculaires, volume optimal, progression.</div>
            {error && (
              <div className="error-box">
                ❌ {error}
                {error.includes("Clé API") && (
                  <div style={{marginTop:8}}>
                    <span style={{color:'var(--gold2)', cursor:'pointer', textDecoration:'underline'}} onClick={onResetKey}>
                      Changer de clé API →
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="action-bar">
            <button className="btn-primary" onClick={generate}>GÉNÉRER MON PROGRAMME ✦</button>
            <button className="btn-ghost" onClick={() => setStep(2)}>← Retour</button>
          </div>
        </>
      )}

      {step === "preview" && program && !loading && (
        <>
          <div className="page-content fade-up">
            <div className="program-hero">
              <div className="program-hero-name">{program.programName}</div>
              <div className="program-hero-summary">{program.summary}</div>
              <div className="meta-row">
                {[program.goal, program.level, program.frequency, program.duration].filter(Boolean).map((m, i) => (
                  <div key={i} className="meta-pill">{m}</div>
                ))}
              </div>
            </div>
            {program.days?.map((day, i) => (
              <div key={i} className={`day-card ${expanded[i] ? "expanded" : ""}`}>
                <div className="day-header" onClick={() => setExpanded(p => ({ ...p, [i]: !p[i] }))}>
                  <div className="day-num-big">{String(i + 1).padStart(2, "0")}</div>
                  <div className="day-header-text">
                    <div className="day-header-name">{day.name}</div>
                    <div className="day-header-muscles">{day.muscles}</div>
                  </div>
                  <div className="day-chevron">▾</div>
                </div>
                <div className="ex-list">
                  {day.isRest ? (
                    <div className="rest-content"><span className="rest-icon">😴</span>Repos & récupération.</div>
                  ) : day.exercises?.map((ex, j) => (
                    <div key={j} className="ex-row">
                      <div className="ex-idx">{j + 1}</div>
                      <div className="ex-body">
                        <div className="ex-name">{ex.name}</div>
                        {ex.muscle && <div className="ex-muscle-tag">{ex.muscle}</div>}
                        {ex.tip && <div className="ex-tip">💡 {ex.tip}</div>}
                        <div className="ex-stats">
                          <div className="ex-stat sets">{ex.sets} séries</div>
                          <div className="ex-stat reps">{ex.reps} reps</div>
                          <div className="ex-stat rest">⏱ {ex.rest}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ height: 8 }} />
          </div>
          <div className="save-bar">
            <button className="btn-primary" onClick={() => onSave(program)}>SAUVEGARDER CE PROGRAMME ✦</button>
            <button className="btn-ghost" onClick={reset}>Recommencer</button>
          </div>
        </>
      )}
    </>
  );
}

// ── MY PROGRAMS ───────────────────────────────────────────────────────────────
function MyProgramsView({ programs, onOpen, onDelete }) {
  return (
    <>
      <div className="app-header">
        <div className="logo"><div className="logo-dot" />GAINZ</div>
        <div className="header-right">{programs.length} programme{programs.length !== 1 ? "s" : ""}</div>
      </div>
      <div className="page-content">
        {programs.length === 0 ? (
          <div className="my-programs-empty fade-up">
            <div className="empty-icon">📋</div>
            <div className="empty-title">AUCUN PROGRAMME</div>
            <div className="empty-sub">Génère ton premier programme dans l'onglet Créer et sauvegarde-le ici.</div>
          </div>
        ) : (
          <div className="saved-programs-list fade-up">
            <div className="section-top-hint">Programmes sauvegardés</div>
            {programs.map(prog => (
              <div key={prog.id} className="saved-prog-card" onClick={() => onOpen(prog)}>
                <div className="spc-name">{prog.programName}</div>
                <div className="spc-meta">Créé le {prog.savedAt} · {prog.days?.length || 0} jours</div>
                <div className="spc-badges">
                  {[prog.goal, prog.level, prog.frequency].filter(Boolean).map((b, i) => (
                    <div key={i} className="spc-badge">{b}</div>
                  ))}
                </div>
                <button className="spc-delete" onClick={e => { e.stopPropagation(); onDelete(prog.id); }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ── DAILY VIEW ────────────────────────────────────────────────────────────────
function DailyView({ program, onBack }) {
  const [dayIdx, setDayIdx] = useState(0);
  const [completed, setCompleted] = useState({});
  const navRef = useRef(null);

  const day = program.days?.[dayIdx];
  const totalEx = day?.exercises?.length || 0;
  const doneEx = day?.exercises?.filter((_, j) => completed[`${dayIdx}-${j}`]).length || 0;

  useEffect(() => {
    const el = navRef.current?.querySelector(".active-day");
    if (el) el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [dayIdx]);

  const toggleEx = (j) => { const k = `${dayIdx}-${j}`; setCompleted(p => ({ ...p, [k]: !p[k] })); };
  const getDayShort = (d) => d.isRest ? "REPOS" : d.name?.split(/[—\-]/)[0]?.trim()?.slice(0, 6)?.toUpperCase() || `J${d.dayNumber}`;

  return (
    <>
      <div className="daily-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <div className="daily-header-info">
          <div className="daily-prog-name">{program.programName}</div>
          <div className="daily-day-label">{day?.name}</div>
        </div>
      </div>
      <div className="day-navigator">
        <div className="day-nav-scroll" ref={navRef}>
          {program.days?.map((d, i) => (
            <div key={i} className={`day-pill ${i === dayIdx ? "active-day" : ""} ${d.isRest ? "rest-pill" : ""}`} onClick={() => setDayIdx(i)}>
              <div className="dp-num">{i + 1}</div>
              <div className="dp-label">{getDayShort(d)}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="page-content">
        {day?.isRest ? (
          <div className="rest-day-view fade-up">
            <div className="rest-big-icon">🛌</div>
            <div className="rest-view-title">JOUR DE REPOS</div>
            <div className="rest-view-sub">La récupération, c'est là que tes muscles grandissent vraiment.</div>
            <div className="rest-tips">
              {[
                { icon: "💧", text: "Hydrate-toi bien (2-3L d'eau)" },
                { icon: "🥩", text: "Maintiens ton apport en protéines (1.6-2g/kg)" },
                { icon: "😴", text: "Vise 7-9h de sommeil" },
                { icon: "🚶", text: "Une marche légère de 20-30min est bénéfique" },
              ].map((t, i) => <div key={i} className="rest-tip-item"><span>{t.icon}</span>{t.text}</div>)}
            </div>
          </div>
        ) : (
          <div className="fade-up">
            <div className="session-header">
              <div className="session-title">{day?.name}</div>
              <div className="session-muscles">{day?.muscles}</div>
              <div className="session-ex-count">{totalEx} exercice{totalEx > 1 ? "s" : ""}</div>
            </div>
            {totalEx > 0 && (
              <div className="session-progress">
                <div className="sp-bar-wrap"><div className="sp-bar" style={{ width: `${(doneEx / totalEx) * 100}%` }} /></div>
                <div className="sp-text"><span>{doneEx}</span>/{totalEx} terminé{doneEx > 1 ? "s" : ""}</div>
              </div>
            )}
            {day?.exercises?.map((ex, j) => {
              const done = !!completed[`${dayIdx}-${j}`];
              return (
                <div key={j} className={`ex-card ${done ? "completed" : ""}`}>
                  <div className="ex-card-top">
                    <div className="ex-card-num">{j + 1}</div>
                    <div className="ex-card-info">
                      <div className="ex-card-name">{ex.name}</div>
                      {ex.muscle && <div className="ex-muscle-badge">{ex.muscle}</div>}
                      {ex.tip && <div className="ex-card-tip">💡 {ex.tip}</div>}
                    </div>
                  </div>
                  <div className="ex-card-stats">
                    <div className="ex-big-stat sets-stat"><div className="val">{ex.sets}</div><div className="lbl">Séries</div></div>
                    <div className="ex-big-stat reps-stat"><div className="val">{ex.reps}</div><div className="lbl">Reps</div></div>
                    <div className="ex-big-stat rest-stat"><div className="val">{ex.rest}</div><div className="lbl">Repos</div></div>
                  </div>
                  <button className="ex-done-btn" onClick={() => toggleEx(j)}>
                    {done ? "✓ Terminé — Appuie pour annuler" : "Marquer comme terminé"}
                  </button>
                </div>
              );
            })}
            <div style={{ height: 16 }} />
          </div>
        )}
      </div>
    </>
  );
}
