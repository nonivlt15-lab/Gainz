import React, { useState, useEffect, useRef } from "react";

// ── STORAGE POLYFILL ──────────────────────────────────────────────────────────
if (typeof window !== "undefined" && !window.storage) {
  window.storage = {
    get: async (key) => {
      try { const v = localStorage.getItem(key); return v !== null ? { value: v } : null; }
      catch { return null; }
    },
    set: async (key, value) => {
      try { localStorage.setItem(key, String(value)); return { key, value }; }
      catch { return null; }
    },
    delete: async (key) => {
      try { localStorage.removeItem(key); return { key, deleted: true }; }
      catch { return null; }
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
  }

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

  .header-right { font-size: 12px; color: var(--muted); font-weight: 500; }

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

  .page-content {
    flex: 1; overflow-y: auto;
    padding: 22px 20px 8px;
    -webkit-overflow-scrolling: touch;
  }

  .page-content::-webkit-scrollbar { width: 3px; }
  .page-content::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

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

  .step-title { font-family: 'Bebas Neue', sans-serif; font-size: 30px; letter-spacing: 2px; line-height: 1.1; color: var(--text); margin-bottom: 5px; }
  .step-sub { font-size: 13px; color: var(--muted); margin-bottom: 22px; line-height: 1.55; }
  .section-label { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); margin-bottom: 10px; margin-top: 22px; }
  .section-label:first-child { margin-top: 0; }
  .section-top-hint { font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: var(--muted); margin-bottom: 14px; }

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

  .chip-group { display: flex; flex-wrap: wrap; gap: 8px; }

  .chip {
    background: var(--surface); border: 1.5px solid var(--border); border-radius: 100px;
    padding: 8px 14px; font-size: 13px; font-family: 'DM Sans', sans-serif;
    cursor: pointer; transition: all 0.18s; user-select: none;
    -webkit-tap-highlight-color: transparent; color: var(--text);
  }

  .chip:active { transform: scale(0.93); }
  .chip.selected { background: var(--gold-dim); border-color: var(--gold); color: var(--gold); font-weight: 600; }

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

  .text-input {
    width: 100%; background: var(--surface); border: 1.5px solid var(--border); border-radius: 12px;
    padding: 13px 15px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: var(--text);
    resize: none; outline: none; transition: border-color 0.2s; line-height: 1.5;
  }

  .text-input:focus { border-color: var(--gold); }
  .text-input::placeholder { color: var(--muted); }

  .info-box { background: var(--gold-dim); border: 1px solid rgba(212,168,67,0.2); border-radius: 12px; padding: 13px 15px; font-size: 13px; color: var(--text2); line-height: 1.6; margin-top: 18px; }
  .info-box strong { color: var(--gold2); }

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

  /* Loading (fake progress pour l'UX — la génération est instantanée mais on simule) */
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

  .program-hero { background: linear-gradient(145deg, var(--surface2) 0%, rgba(212,168,67,0.07) 100%); border: 1px solid var(--border); border-radius: 20px; padding: 22px 20px; margin-bottom: 20px; }
  .program-hero-name { font-family: 'Bebas Neue', sans-serif; font-size: 26px; letter-spacing: 2px; color: var(--gold); line-height: 1; margin-bottom: 6px; }
  .program-hero-summary { font-size: 13px; color: var(--text2); line-height: 1.5; margin-bottom: 14px; }
  .meta-row { display: flex; flex-wrap: wrap; gap: 7px; }
  .meta-pill { background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 8px; padding: 4px 10px; font-size: 11px; font-weight: 600; color: var(--text2); }

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

// ─────────────────────────────────────────────────────────────────────────────
// ██████╗ ██████╗  ██████╗  ██████╗ ██████╗  █████╗ ███╗   ███╗
// ██╔══██╗██╔══██╗██╔═══██╗██╔════╝ ██╔══██╗██╔══██╗████╗ ████║
// ██████╔╝██████╔╝██║   ██║██║  ███╗██████╔╝███████║██╔████╔██║
// ██╔═══╝ ██╔══██╗██║   ██║██║   ██║██╔══██╗██╔══██║██║╚██╔╝██║
// ██║     ██║  ██║╚██████╔╝╚██████╔╝██║  ██║██║  ██║██║ ╚═╝ ██║
// ╚═╝     ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝
//
// MOTEUR DE GÉNÉRATION HORS-LIGNE
// Toute la science sportive encodée directement — zéro API, zéro limite.
// ─────────────────────────────────────────────────────────────────────────────

// Base d'exercices par groupe musculaire.
// Chaque exercice précise : nom, conseil technique, et quels équipements le permettent.
// "any" = toujours disponible (poids du corps ou équipement basique)
const EXERCISE_DB = {
  chest: [
    { name: "Développé couché barre",     tip: "Descends lentement la barre jusqu'à la poitrine, pousse en expirant.",          equip: ["gym","barbell"] },
    { name: "Développé incliné haltères", tip: "Inclinaison à 30-45°, coudes à 75° pour protéger les épaules.",                  equip: ["gym","dumbbells"] },
    { name: "Écarté câble basse poulie",  tip: "Croise les mains en haut du mouvement pour maximiser le pic de contraction.",    equip: ["gym","cables"] },
    { name: "Développé couché haltères",  tip: "Amplitude complète, descends jusqu'à sentir l'étirement des pecs.",              equip: ["gym","dumbbells"] },
    { name: "Dips lestés",                tip: "Penche légèrement le buste vers l'avant pour cibler les pectoraux.",             equip: ["gym"] },
    { name: "Pompes déclinées",           tip: "Pieds surélevés pour cibler la partie haute des pecs.",                          equip: ["any","bodyweight"] },
    { name: "Pec deck / Butterfly",       tip: "Maintiens 1 seconde en position contractée, relâche lentement.",                 equip: ["gym","machines"] },
    { name: "Pompes",                     tip: "Corps droit, descends la poitrine jusqu'au sol, dos neutre.",                    equip: ["any","bodyweight"] },
  ],
  back: [
    { name: "Tirage vertical prise large",   tip: "Étire bien en haut, contracte les omoplates en bas du mouvement.",            equip: ["gym","cables"] },
    { name: "Rowing barre pronation",        tip: "Dos plat à 45°, tire vers le nombril, coudes collés au corps.",               equip: ["gym","barbell"] },
    { name: "Rowing haltère unilatéral",     tip: "Appui sur un banc, tire le coude vers le plafond, rotation d'épaule nulle.",  equip: ["gym","dumbbells"] },
    { name: "Soulevé de terre roumain",      tip: "Dos neutre absolu, barre contre les jambes tout le long du trajet.",          equip: ["gym","barbell"] },
    { name: "Tirage poulie basse",           tip: "Assis, tire vers le bas-ventre, serre les omoplates 1 seconde.",              equip: ["gym","cables"] },
    { name: "Pull-up / Traction",            tip: "Prise large, descends complètement, monte jusqu'au menton au-dessus de la barre.", equip: ["gym","bodyweight"] },
    { name: "Rowing à la machine",           tip: "Appui poitrine, mouvement contrôlé, focus sur les omoplates.",                equip: ["gym","machines"] },
    { name: "Tirage horizontal câble",       tip: "Coudes près du corps, épaules basses, contracte le dos 1 seconde.",           equip: ["gym","cables"] },
  ],
  shoulders: [
    { name: "Développé militaire barre",     tip: "Barre devant, dos neutre, pousse verticalement sans cambrer.",                equip: ["gym","barbell"] },
    { name: "Élévations latérales haltères", tip: "Légèrement penché, coudes à 15° de flexion, monte jusqu'à l'horizontal.",    equip: ["gym","dumbbells"] },
    { name: "Arnold Press",                  tip: "Rotation des paumes en montant — excellent pour le deltoïde antérieur.",      equip: ["gym","dumbbells"] },
    { name: "Oiseau (élévations arrière)",   tip: "Buste penché à 90°, coudes légèrement fléchis, pince les omoplates.",        equip: ["gym","dumbbells"] },
    { name: "Face pull câble",               tip: "Poulie haute, tire vers le visage en séparant les mains — protège les épaules.", equip: ["gym","cables"] },
    { name: "Développé haltères assis",      tip: "Coudes à 90°, pousse vers le haut sans verrouiller les coudes.",             equip: ["gym","dumbbells"] },
    { name: "Élévation frontale haltères",   tip: "Monte à hauteur des yeux, descends lentement en 3 secondes.",                equip: ["gym","dumbbells"] },
  ],
  biceps: [
    { name: "Curl barre droite",             tip: "Coudes fixes contre le corps — le mouvement part du coude, pas de l'épaule.", equip: ["gym","barbell"] },
    { name: "Curl haltères alterné",         tip: "Supine le poignet en montant pour maximiser la contraction.",                 equip: ["gym","dumbbells"] },
    { name: "Curl marteau",                  tip: "Prise neutre (pouce vers le haut) — cible le brachial sous le biceps.",       equip: ["gym","dumbbells"] },
    { name: "Curl concentré",                tip: "Coude contre la cuisse, amplitude complète, isole parfaitement le biceps.",   equip: ["gym","dumbbells"] },
    { name: "Curl câble basse poulie",       tip: "La tension reste constante tout le long du mouvement — excellent finish.",    equip: ["gym","cables"] },
    { name: "Curl barre EZ",                 tip: "Prise en supination partielle — moins de stress sur les poignets.",           equip: ["gym","barbell"] },
  ],
  triceps: [
    { name: "Pushdown câble prise haute",    tip: "Coudes fixes, étends complètement en contractant, descends lentement.",       equip: ["gym","cables"] },
    { name: "Extension triceps poulie haute",tip: "Bras derrière la tête, descends l'avant-bras, étends complètement.",         equip: ["gym","cables"] },
    { name: "Dips (banc / barres)",          tip: "Buste droit pour les triceps (penché = pectoraux davantage sollicités).",     equip: ["gym","bodyweight"] },
    { name: "Skull crusher barre EZ",        tip: "Descends vers le front lentement, coudes fixes, étends en explosif.",        equip: ["gym","barbell"] },
    { name: "Extension haltère une main",    tip: "Bras vertical, descends lentement derrière la nuque, étends complètement.",  equip: ["gym","dumbbells"] },
    { name: "Kickback haltère",              tip: "Buste parallèle au sol, étends le bras jusqu'à l'alignement, 1 sec de hold.", equip: ["gym","dumbbells"] },
  ],
  legs: [
    { name: "Squat barre",                   tip: "Pieds à largeur d'épaules, descends cuisses parallèles, dos neutre absolu.",  equip: ["gym","barbell"] },
    { name: "Presse à cuisse",               tip: "Pieds hauts = fessiers/ischio, pieds bas = quadriceps. Amplitude 90°.",       equip: ["gym","machines"] },
    { name: "Leg extension",                 tip: "Extension complète, 1 seconde de contraction au sommet, descente lente.",     equip: ["gym","machines"] },
    { name: "Leg curl couché",               tip: "Hanche plaquée sur le banc, ramène les talons vers les fessiers lentement.",  equip: ["gym","machines"] },
    { name: "Fentes marchées haltères",      tip: "Grand pas, genou avant à 90°, ne touche pas le sol avec le genou arrière.",  equip: ["gym","dumbbells"] },
    { name: "Romanian Deadlift (RDL)",       tip: "Charnière à la hanche, dos neutre, barre proche des jambes, ischio++.",       equip: ["gym","barbell"] },
    { name: "Goblet squat",                  tip: "Haltère contre la poitrine, excellent pour l'apprentissage du squat.",        equip: ["gym","dumbbells"] },
    { name: "Squat bulgare haltères",        tip: "Pied arrière surélevé, descends genou à 90°, poussée sur le pied avant.",    equip: ["gym","dumbbells"] },
    { name: "Squat poids du corps",          tip: "Bras tendus devant, descends lentement, dos neutre.",                        equip: ["any","bodyweight"] },
  ],
  glutes: [
    { name: "Hip thrust barre",              tip: "Omoplate sur banc, poussée explosée en haut, serres les fessiers 2 sec.",    equip: ["gym","barbell"] },
    { name: "Squat bulgare haltères",        tip: "Pied arrière surélevé, focus sur la poussée du pied avant pour les fessiers.", equip: ["gym","dumbbells"] },
    { name: "Fentes inversées",              tip: "Recule un pied, genou avant à 90°, poussée sur le talon pour remonter.",     equip: ["gym","dumbbells","bodyweight"] },
    { name: "Abducteur machine",             tip: "Amplitude complète, maintiens 1 seconde en position d'ouverture maximale.",  equip: ["gym","machines"] },
    { name: "Kickback câble",                tip: "Hanche stable, extension complète de la jambe, contracte le fessier en haut.", equip: ["gym","cables"] },
    { name: "Pont fessier",                  tip: "Sur le dos, poussée explosive vers le haut, serre les fessiers 2 secondes.", equip: ["any","bodyweight"] },
  ],
  abs: [
    { name: "Crunch à la poulie",            tip: "Arrondi du dos vers les genoux — évite d'incliner simplement le buste.",      equip: ["gym","cables"] },
    { name: "Relevé de jambes suspendu",     tip: "Jambes tendues, monte jusqu'à la parallèle, descends lentement (4 sec).",    equip: ["gym","bodyweight"] },
    { name: "Planche frontale",              tip: "Corps aligné tête-talons, serres le ventre fort, respire normalement.",       equip: ["any","bodyweight"] },
    { name: "Russian Twist lesté",           tip: "Pieds décollés, rotation complète, touche le poids au sol de chaque côté.",  equip: ["gym","dumbbells"] },
    { name: "Crunch vélo",                   tip: "Coude vers le genou opposé, rotation du buste, pas juste des coudes.",       equip: ["any","bodyweight"] },
    { name: "Ab wheel (molette)",            tip: "Déroule lentement, stop avant de perdre la gainage, reviens en contractant.", equip: ["gym"] },
    { name: "Crunch classique",              tip: "Mains à la tête sans tirer, soulève les épaules, contracte 1 seconde.",      equip: ["any","bodyweight"] },
  ],
  calves: [
    { name: "Mollets debout (machine)",      tip: "Amplitude maximale — descends en étirement complet, monte sur la pointe.",   equip: ["gym","machines"] },
    { name: "Mollets assis (machine)",       tip: "Cible le soléaire sous le gastrocnémien — négligé et très efficace.",        equip: ["gym","machines"] },
    { name: "Mollets à la presse",           tip: "Pieds en bas de la plaque, amplitude complète, tempo 2-2.",                  equip: ["gym","machines"] },
    { name: "Mollets unilatéraux",           tip: "Une jambe à la fois sur une marche, amplitude complète, légèrement lesté.",  equip: ["any","bodyweight","dumbbells"] },
  ],
  traps: [
    { name: "Haussement d'épaules barre",    tip: "Monte les épaules vers les oreilles, tiens 1 sec en haut, descends lentement.", equip: ["gym","barbell"] },
    { name: "Rowing menton",                 tip: "Prise serrée, tire vers le menton, coudes au-dessus des mains.",             equip: ["gym","barbell","cables"] },
    { name: "Haussement haltères",           tip: "Mouvement pur épaule — pas de rotation du cou, dos neutre.",                 equip: ["gym","dumbbells"] },
    { name: "Face pull câble",               tip: "Tire vers le visage en séparant les mains — trapèze + deltoïde arrière.",    equip: ["gym","cables"] },
  ],
  forearms: [
    { name: "Curl poignets barre",           tip: "Avant-bras sur les cuisses, fléchis lentement — amplitude complète.",        equip: ["gym","barbell"] },
    { name: "Reverse curl barre EZ",         tip: "Prise pronation, coudes fixes, monte à hauteur des épaules.",                equip: ["gym","barbell"] },
    { name: "Pince farmer's carry",          tip: "Marche avec des haltères lourds — renforce la préhension.",                  equip: ["gym","dumbbells"] },
    { name: "Curl poignets haltères",        tip: "Avant-bras contre les cuisses, fléchis les poignets lentement.",            equip: ["gym","dumbbells"] },
  ],
  fullbody: [
    { name: "Squat barre", tip: "Mouvement roi du Full Body. Dos neutre, cuisses parallèles.", equip: ["gym","barbell"] },
    { name: "Développé couché barre", tip: "Descends lentement, pousse en expirant.", equip: ["gym","barbell"] },
    { name: "Soulevé de terre", tip: "Dos neutre, poussée sur les jambes, barre contre les tibias.", equip: ["gym","barbell"] },
    { name: "Tirage vertical", tip: "Prise large, contracte les omoplates en bas.", equip: ["gym","cables"] },
    { name: "Développé militaire", tip: "Barre devant, pousse vertical, abdos engagés.", equip: ["gym","barbell"] },
    { name: "Curl barre", tip: "Coudes fixes, supine en montant.", equip: ["gym","barbell"] },
    { name: "Planche frontale", tip: "Corps aligné, respirations profondes.", equip: ["any","bodyweight"] },
    { name: "Pompes", tip: "Corps droit, amplitude complète.", equip: ["any","bodyweight"] },
    { name: "Fentes marchées", tip: "Grand pas, genou à 90°.", equip: ["any","bodyweight","dumbbells"] },
    { name: "Hip thrust barre", tip: "Poussée explosive, serres les fessiers en haut.", equip: ["gym","barbell"] },
  ],
};

// Paramètres scientifiques par objectif.
// sets, reps, rest = les valeurs moyennes recommandées par la littérature sportive.
const GOAL_PARAMS = {
  strength:    { sets: 5, reps: "3-5",   rest: "3-4 min",  setVariant: "lourde" },
  hypertrophy: { sets: 4, reps: "8-12",  rest: "90 sec",   setVariant: "modérée" },
  endurance:   { sets: 3, reps: "15-20", rest: "45 sec",   setVariant: "légère" },
  weight_loss: { sets: 4, reps: "12-15", rest: "60 sec",   setVariant: "modérée" },
  toning:      { sets: 3, reps: "12-15", rest: "75 sec",   setVariant: "légère" },
};

// Pour la force, on réduit le nombre d'exercices car chaque série est très exigeante.
// Pour l'endurance/perte de poids, on peut en mettre un peu plus.
const GOAL_EX_MULTIPLIER = {
  strength: 0.7, hypertrophy: 1.0, endurance: 1.1, weight_loss: 1.1, toning: 1.0
};

// Nombre d'exercices recommandés par muscle selon sa taille (pour hypertrophie, base 1.0)
const MUSCLE_EX_COUNT = {
  chest: 3, back: 4, legs: 4, glutes: 3,
  shoulders: 3, abs: 3,
  biceps: 2, triceps: 2, calves: 2, traps: 2, forearms: 2,
  fullbody: 7,
};

// Groupes synergiques : les muscles qui travaillent bien ensemble.
// L'algo va regrouper les muscles sélectionnés selon ces affinités.
const SYNERGY_GROUPS = [
  { id: "push",   muscles: ["chest", "shoulders", "triceps"], name: "PUSH", emoji: "💪" },
  { id: "pull",   muscles: ["back", "biceps", "traps", "forearms"], name: "PULL", emoji: "🔙" },
  { id: "legs",   muscles: ["legs", "glutes", "calves"], name: "LEGS", emoji: "🦵" },
  { id: "core",   muscles: ["abs"], name: "CORE", emoji: "⚡" },
  { id: "fullbody", muscles: ["fullbody"], name: "FULL BODY", emoji: "🔥" },
];

// Noms de programmes selon le split détecté
const PROGRAM_NAMES = {
  ppl: ["Progressive PPL", "Iron Split PPL", "Atlas PPL Program"],
  ul: ["Upper/Lower Power", "Binary Force Protocol", "Dual Split System"],
  fullbody: ["Full Body Blitz", "Total Body Protocol", "Compound Foundation"],
  custom: ["Custom Gainz Program", "Precision Split Program", "Tailored Strength Plan"],
};

// ── UTILITAIRES ───────────────────────────────────────────────────────────────

// Retourne un élément aléatoire d'un tableau
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// Filtre les exercices disponibles selon l'équipement sélectionné
function getAvailableExercises(muscleId, equipment) {
  const all = EXERCISE_DB[muscleId] || [];
  if (!equipment || equipment.length === 0) return all;
  // Un exercice est disponible si "any" est dans ses équipements,
  // ou si au moins un équipement sélectionné par l'user est dans sa liste
  return all.filter(ex =>
    ex.equip.includes("any") ||
    ex.equip.some(e => equipment.includes(e))
  );
}

// Sélectionne N exercices pour un muscle donné, sans répétitions
function pickExercises(muscleId, count, equipment, usedNames = new Set()) {
  const available = getAvailableExercises(muscleId, equipment)
    .filter(ex => !usedNames.has(ex.name));
  // Mélange aléatoire pour la variété entre générations
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// ── MOTEUR PRINCIPAL DE GÉNÉRATION ───────────────────────────────────────────
function generateProgram(form) {
  const { muscles, goal, level, equipment, daysPerWeek, notes } = form;
  const params = GOAL_PARAMS[goal] || GOAL_PARAMS.hypertrophy;
  const exMult = GOAL_EX_MULTIPLIER[goal] || 1.0;
  // Les débutants font légèrement moins d'exercices et de séries
  const levelMult = level === "beginner" ? 0.75 : level === "advanced" ? 1.15 : 1.0;

  // ─ Étape 1 : regrouper les muscles sélectionnés par synergies ────────────
  // Pour chaque groupe synergique (PUSH, PULL, LEGS...), on vérifie
  // combien de muscles sélectionnés lui appartiennent.
  const activeSynGroups = SYNERGY_GROUPS
    .map(sg => ({
      ...sg,
      activeMuscles: sg.muscles.filter(m => muscles.includes(m))
    }))
    .filter(sg => sg.activeMuscles.length > 0);

  // ─ Étape 2 : distribuer les groupes sur les jours disponibles ─────────────
  // On répartit les sessions sur les jours d'entraînement.
  // Si on a plus de groupes que de jours, on fusionne les petits groupes.
  const trainingDays = [];

  if (muscles.includes("fullbody")) {
    // Full Body : on répète la même session sur tous les jours d'entraînement
    for (let i = 0; i < daysPerWeek; i++) {
      trainingDays.push({ synGroup: activeSynGroups[0] });
    }
  } else if (activeSynGroups.length <= daysPerWeek) {
    // Assez de jours : chaque groupe a son propre jour
    // Si jours > groupes, on répète certains groupes (ex: 4j pour 2 groupes = A/B/A/B)
    for (let i = 0; i < daysPerWeek; i++) {
      trainingDays.push({ synGroup: activeSynGroups[i % activeSynGroups.length] });
    }
  } else {
    // Moins de jours que de groupes : on fusionne push+core, pull+core, etc.
    // Stratégie simple : on alloue les groupes round-robin
    for (let i = 0; i < daysPerWeek; i++) {
      trainingDays.push({ synGroup: activeSynGroups[i % activeSynGroups.length] });
    }
  }

  // ─ Étape 3 : construire les jours avec les exercices ─────────────────────
  const days = [];
  let dayNumber = 1;

  for (let i = 0; i < trainingDays.length; i++) {
    const { synGroup } = trainingDays[i];
    const exercises = [];
    const usedNames = new Set();

    // Pour chaque muscle actif dans ce groupe, on choisit les exercices
    for (const muscleId of synGroup.activeMuscles) {
      const baseCount = MUSCLE_EX_COUNT[muscleId] || 2;
      // On applique les multiplicateurs objectif et niveau
      const targetCount = Math.max(1, Math.round(baseCount * exMult * levelMult));

      const picked = pickExercises(muscleId, targetCount, equipment, usedNames);
      picked.forEach(ex => usedNames.add(ex.name));

      // Ajustement des séries pour les débutants
      const finalSets = Math.max(2, Math.round(params.sets * levelMult));

      picked.forEach(ex => {
        exercises.push({
          name: ex.name,
          muscle: muscleId.charAt(0).toUpperCase() + muscleId.slice(1),
          sets: finalSets,
          reps: params.reps,
          rest: params.rest,
          tip: ex.tip,
        });
      });
    }

    // Limite absolue de 7 exercices par séance (au-delà c'est contre-productif)
    const limitedExercises = exercises.slice(0, 7);

    // Nom du jour : ex "PUSH — Pectoraux & Épaules"
    const muscleLabels = synGroup.activeMuscles
      .map(m => MUSCLES_UI.find(x => x.id === m)?.label || m)
      .join(" & ");

    days.push({
      dayNumber,
      name: `${synGroup.name} — ${muscleLabels}`,
      muscles: synGroup.activeMuscles
        .map(m => MUSCLES_UI.find(x => x.id === m)?.label || m)
        .join(" • "),
      isRest: false,
      exercises: limitedExercises,
    });

    dayNumber++;

    // Insertion d'un jour de repos si on n'est pas au dernier jour ET si
    // le prochain jour travaille des muscles proches (pour éviter le sur-entraînement)
    // Règle simple : si on enchaîne 2 jours intensifs identiques, on insère un repos
    if (i < trainingDays.length - 1) {
      const nextGroup = trainingDays[i + 1].synGroup;
      const sameGroup = nextGroup.id === synGroup.id;
      const totalCalendarDays = 7;
      const restDays = totalCalendarDays - daysPerWeek;
      // On distribue les jours de repos uniformément
      const insertRest = sameGroup && restDays > 0;
      if (insertRest) {
        days.push({ dayNumber, name: "REPOS", muscles: "Récupération active", isRest: true, exercises: [] });
        dayNumber++;
      }
    }
  }

  // ─ Étape 4 : construire les métadonnées du programme ─────────────────────
  const goalObj = GOALS.find(g => g.id === goal);
  const levelObj = LEVELS.find(l => l.id === level);

  // Détection du type de split pour le nom du programme
  const hasAll3 = ["push","pull","legs"].every(gid =>
    activeSynGroups.some(sg => sg.id === gid)
  );
  const isFullBody = muscles.includes("fullbody");
  const hasUpperLower = activeSynGroups.some(sg => ["push","pull"].includes(sg.id)) &&
                        activeSynGroups.some(sg => sg.id === "legs");

  let nameKey = "custom";
  if (isFullBody) nameKey = "fullbody";
  else if (hasAll3) nameKey = "ppl";
  else if (hasUpperLower) nameKey = "ul";

  const duration = level === "beginner" ? "6-8 semaines" : level === "advanced" ? "12-16 semaines" : "8-12 semaines";

  const summaries = [
    `Programme ${goalObj?.label.toLowerCase()} optimisé pour ${levelObj?.label.toLowerCase()} — focus synergies musculaires.`,
    `Split scientifique basé sur les principes de surcharge progressive et de récupération optimale.`,
    `Conçu pour maximiser tes résultats en ${goalObj?.desc.toLowerCase()} avec un volume adapté à ton niveau.`,
  ];

  return {
    programName: pick(PROGRAM_NAMES[nameKey]),
    summary: pick(summaries),
    goal: goalObj?.label,
    level: levelObj?.label,
    frequency: `${daysPerWeek} séances/semaine`,
    duration,
    days,
  };
}

// ── DATA (UI) ─────────────────────────────────────────────────────────────────
const MUSCLES_UI = [
  { id: "chest",     label: "Pectoraux",  icon: "🫁" },
  { id: "back",      label: "Dos",        icon: "🔙" },
  { id: "shoulders", label: "Épaules",    icon: "🔺" },
  { id: "biceps",    label: "Biceps",     icon: "💪" },
  { id: "triceps",   label: "Triceps",    icon: "🦾" },
  { id: "legs",      label: "Jambes",     icon: "🦵" },
  { id: "glutes",    label: "Fessiers",   icon: "🍑" },
  { id: "abs",       label: "Abdominaux", icon: "⚡" },
  { id: "calves",    label: "Mollets",    icon: "🦶" },
  { id: "traps",     label: "Trapèzes",   icon: "🏔" },
  { id: "forearms",  label: "Avant-bras", icon: "🤜" },
  { id: "fullbody",  label: "Full Body",  icon: "🔥" },
];

const GOALS = [
  { id: "strength",    label: "Force pure",       desc: "Charges maximales, technique lourde",  scheme: "3–6 reps",   emoji: "⚡" },
  { id: "hypertrophy", label: "Hypertrophie",      desc: "Prise de masse musculaire",            scheme: "8–12 reps",  emoji: "💪" },
  { id: "endurance",   label: "Endurance musc.",   desc: "Résistance et capacité cardio",        scheme: "15–20 reps", emoji: "🏃" },
  { id: "weight_loss", label: "Perte de poids",    desc: "Brûle-graisses et circuits",           scheme: "12–15 reps", emoji: "🔥" },
  { id: "toning",      label: "Tonification",      desc: "Définition et maintien musculaire",    scheme: "10–15 reps", emoji: "✨" },
];

const LEVELS = [
  { id: "beginner",     label: "Débutant" },
  { id: "intermediate", label: "Intermédiaire" },
  { id: "advanced",     label: "Confirmé" },
];

const EQUIPMENT_UI = [
  { id: "gym",         label: "Salle complète" },
  { id: "barbell",     label: "Barre olympique" },
  { id: "dumbbells",   label: "Haltères" },
  { id: "cables",      label: "Câbles / Poulies" },
  { id: "machines",    label: "Machines guidées" },
  { id: "bodyweight",  label: "Poids du corps" },
];

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
  const [tab, setTab] = useState("create");
  const [savedPrograms, setSavedPrograms] = useState([]);
  const [dailyView, setDailyView] = useState(null);

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  useEffect(() => { loadPrograms().then(setSavedPrograms); }, []);

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

  if (dailyView) {
    return <div className="app"><DailyView program={dailyView} onBack={() => setDailyView(null)} /></div>;
  }

  return (
    <div className="app">
      {tab === "create" && <CreateView onSave={handleSave} />}
      {tab === "myprograms" && <MyProgramsView programs={savedPrograms} onOpen={setDailyView} onDelete={handleDelete} />}
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
function CreateView({ onSave }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ muscles: [], goal: "", level: "intermediate", equipment: [], daysPerWeek: 4, notes: "" });
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [expanded, setExpanded] = useState({});

  const toggle = (key, id) => setForm(f => ({
    ...f, [key]: f[key].includes(id) ? f[key].filter(x => x !== id) : [...f[key], id]
  }));

  // Simule une progression visuelle pendant la "génération"
  // (le calcul est instantané mais l'UX bénéficie d'un petit délai)
  const generate = async () => {
    setLoading(true);
    setLoadStep(0);
    await new Promise(r => setTimeout(r, 600));
    setLoadStep(1);
    await new Promise(r => setTimeout(r, 700));
    setLoadStep(2);
    await new Promise(r => setTimeout(r, 400));
    const p = generateProgram(form);
    setProgram(p);
    setExpanded({ 0: true });
    setLoading(false);
    setStep("preview");
  };

  const reset = () => { setStep(1); setProgram(null); setForm({ muscles: [], goal: "", level: "intermediate", equipment: [], daysPerWeek: 4, notes: "" }); };
  const LABELS = { 1: "MUSCLES", 2: "OBJECTIF", 3: "DÉTAILS" };

  return (
    <>
      <div className="app-header">
        <div className="logo"><div className="logo-dot" />GAINZ</div>
        <div className="header-right">
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
            <div className="loading-title">CALCUL EN COURS</div>
            <div className="loading-subtitle">Optimisation des synergies musculaires et du volume d'entraînement</div>
            <div className="loading-items">
              {[
                { icon: "🧠", txt: "Analyse des groupes musculaires..." },
                { icon: "⚡", txt: "Optimisation des synergies PUSH/PULL/LEGS..." },
                { icon: "🏗", txt: "Assemblage du programme final..." },
              ].map((item, i) => (
                <div key={i} className={`loading-item ${loadStep === i ? "active" : loadStep > i ? "done" : ""}`}>
                  <span className="li-icon">{loadStep > i ? "✅" : item.icon}</span>
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
            <div className="step-sub">L'algorithme regroupera tes muscles en séances synergiques — pecs + triceps + épaules dans une même journée PUSH, par exemple.</div>
            <div className="muscle-grid">
              {MUSCLES_UI.map(m => (
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
            <div className="step-sub">Cela détermine les séries, répétitions et temps de repos de chaque exercice.</div>
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
            <div className="step-sub">Plus c'est précis, plus le programme sera adapté à ta situation réelle.</div>
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
              {EQUIPMENT_UI.map(e => (
                <div key={e.id} className={`chip ${form.equipment.includes(e.id) ? "selected" : ""}`} onClick={() => toggle("equipment", e.id)}>{e.label}</div>
              ))}
            </div>
            <div className="section-label" style={{ marginTop: 20 }}>Notes (ignorées — pour info)</div>
            <textarea className="text-input" rows={2} placeholder="Ex : j'aime le squat, douleur au genou gauche…" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            <div className="info-box">⚡ <strong>Génération 100% hors-ligne</strong> — l'algorithme embarqué calcule ton programme instantanément, sans connexion internet, sans limite et sans coût.</div>
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
                    <div className="rest-content"><span className="rest-icon">😴</span>Repos & récupération — c'est là que les muscles grandissent.</div>
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
            <div className="empty-sub">Génère ton premier programme dans l'onglet Créer et sauvegarde-le ici pour y accéder chaque jour.</div>
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
            <div className="rest-view-sub">La récupération c'est là que tes muscles grandissent vraiment.</div>
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