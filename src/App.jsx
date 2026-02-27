import React, { useState, useEffect, useRef, useCallback } from "react";

// ── STORAGE POLYFILL ──────────────────────────────────────────────────────────
if (typeof window !== "undefined" && !window.storage) {
  window.storage = {
    get: async (k) => { try { const v = localStorage.getItem(k); return v !== null ? { value: v } : null; } catch { return null; } },
    set: async (k, v) => { try { localStorage.setItem(k, String(v)); return { key: k, value: v }; } catch { return null; } },
    delete: async (k) => { try { localStorage.removeItem(k); return { key: k, deleted: true }; } catch { return null; } },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN SYSTEM — Athletic Luxury · Dark · Minimal
// ─────────────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

  :root {
    --bg:        #0C0C0E;
    --bg2:       #111114;
    --surface:   #161618;
    --surface2:  #1E1E22;
    --surface3:  #26262C;
    --border:    #2C2C34;
    --border2:   #3A3A46;
    --gold:      #C9A84C;
    --gold2:     #E8C96A;
    --gold3:     #F5DFA0;
    --gold-dim:  rgba(201,168,76,0.10);
    --gold-glow: rgba(201,168,76,0.18);
    --green:     #4ADE80;
    --green-dim: rgba(74,222,128,0.08);
    --red:       #F87171;
    --blue:      #60A5FA;
    --text:      #F5F5F7;
    --text2:     #A1A1AA;
    --text3:     #71717A;
    --radius:    16px;
    --radius-sm: 10px;
    --radius-lg: 22px;
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
  }

  .app {
    max-width: 430px;
    margin: 0 auto;
    height: 100vh;
    height: 100dvh;
    display: flex;
    flex-direction: column;
    background: var(--bg);
    overflow: hidden;
    position: relative;
  }

  /* ── HEADER ── */
  .app-header {
    padding: 20px 22px 16px;
    background: var(--bg);
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .logo-mark {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .logo-icon {
    width: 32px; height: 32px;
    background: var(--gold);
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Outfit', sans-serif;
    font-size: 16px;
    font-weight: 800;
    color: #0C0C0E;
    letter-spacing: -0.5px;
    flex-shrink: 0;
  }

  .logo-text {
    font-family: 'Outfit', sans-serif;
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 1px;
    color: var(--text);
  }

  .header-badge {
    font-size: 11px;
    font-weight: 600;
    color: var(--text3);
    letter-spacing: 0.3px;
  }

  .header-badge.success { color: var(--green); }

  /* ── BOTTOM NAV — pill style ── */
  .bottom-nav {
    display: flex;
    margin: 0 16px;
    margin-bottom: calc(16px + env(safe-area-inset-bottom));
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 5px;
    flex-shrink: 0;
    gap: 2px;
  }

  .nav-tab {
    flex: 1;
    padding: 9px 4px 8px;
    text-align: center;
    cursor: pointer;
    border: none;
    background: transparent;
    border-radius: 15px;
    transition: all 0.2s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .nav-tab.active { background: var(--surface2); }

  .nav-tab-icon { font-size: 18px; line-height: 1; display: block; margin-bottom: 3px; }
  .nav-tab-label {
    font-size: 9px; font-weight: 600; letter-spacing: 0.6px;
    text-transform: uppercase; color: var(--text3); transition: color 0.2s;
    font-family: 'Outfit', sans-serif;
  }
  .nav-tab.active .nav-tab-label { color: var(--gold); }

  /* ── SCROLL AREA ── */
  .page-content {
    flex: 1; overflow-y: auto;
    padding: 20px 20px 4px;
    -webkit-overflow-scrolling: touch;
  }

  .page-content::-webkit-scrollbar { display: none; }

  /* ── PROGRESS BAR ── */
  .progress-wrap {
    padding: 12px 22px 14px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }

  .progress-steps-row { display: flex; gap: 4px; margin-bottom: 8px; }

  .prog-seg {
    flex: 1; height: 2px; border-radius: 2px;
    background: var(--surface2);
    transition: background 0.4s ease;
  }

  .prog-seg.done { background: rgba(201,168,76,0.4); }
  .prog-seg.active { background: var(--gold); }

  .progress-label {
    font-size: 10px; font-weight: 600; letter-spacing: 1.5px;
    text-transform: uppercase; color: var(--text3);
    font-family: 'Outfit', sans-serif;
  }

  /* ── TYPOGRAPHY ── */
  .page-title {
    font-family: 'Outfit', sans-serif;
    font-size: 32px;
    font-weight: 800;
    line-height: 1.05;
    color: var(--text);
    margin-bottom: 6px;
    letter-spacing: -0.5px;
  }

  .page-sub {
    font-size: 14px;
    color: var(--text3);
    margin-bottom: 24px;
    line-height: 1.55;
  }

  .section-label {
    font-family: 'Outfit', sans-serif;
    font-size: 10px; font-weight: 600;
    letter-spacing: 1.5px; text-transform: uppercase;
    color: var(--text3); margin-bottom: 10px; margin-top: 24px;
  }

  .section-label:first-child { margin-top: 0; }

  /* ── MUSCLE GRID ── */
  .muscle-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

  .muscle-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 14px 13px;
    cursor: pointer;
    transition: all 0.15s ease;
    display: flex; align-items: center; gap: 10px;
    user-select: none; -webkit-tap-highlight-color: transparent;
  }

  .muscle-card:active { transform: scale(0.96); }
  .muscle-card.selected { border-color: var(--gold); background: var(--gold-dim); }
  .muscle-icon { font-size: 18px; line-height: 1; }
  .muscle-label { font-size: 13px; font-weight: 500; color: var(--text2); }
  .muscle-card.selected .muscle-label { color: var(--gold); font-weight: 600; }
  .muscles-hint { margin-top: 10px; font-size: 12px; color: var(--text3); text-align: center; }
  .muscles-hint span { color: var(--gold2); font-weight: 600; }

  /* ── GOAL LIST ── */
  .goal-list { display: flex; flex-direction: column; gap: 8px; }

  .goal-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 15px 16px;
    cursor: pointer;
    transition: all 0.15s ease;
    display: flex; align-items: center; gap: 14px;
    user-select: none; -webkit-tap-highlight-color: transparent;
  }

  .goal-card:active { transform: scale(0.98); }
  .goal-card.selected { border-color: var(--gold); background: var(--gold-dim); }
  .goal-emoji { font-size: 20px; line-height: 1; }
  .goal-text { flex: 1; }
  .goal-name { font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 600; color: var(--text2); }
  .goal-card.selected .goal-name { color: var(--gold); }
  .goal-desc { font-size: 12px; color: var(--text3); margin-top: 2px; }
  .goal-scheme {
    background: var(--surface2); border-radius: 8px; padding: 3px 9px;
    font-family: 'Outfit', sans-serif; font-size: 11px; font-weight: 600;
    color: var(--text3); white-space: nowrap;
  }
  .goal-card.selected .goal-scheme { background: var(--gold-glow); color: var(--gold2); }

  /* ── CHIPS ── */
  .chip-group { display: flex; flex-wrap: wrap; gap: 7px; }

  .chip {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 100px; padding: 8px 15px;
    font-size: 13px; font-family: 'DM Sans', sans-serif;
    cursor: pointer; transition: all 0.15s;
    user-select: none; -webkit-tap-highlight-color: transparent; color: var(--text2);
  }

  .chip:active { transform: scale(0.93); }
  .chip.selected { background: var(--gold-dim); border-color: var(--gold); color: var(--gold); font-weight: 600; }

  /* ── DAYS SELECTOR ── */
  .days-selector { display: flex; gap: 6px; }

  .day-btn {
    flex: 1; background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-sm); padding: 12px 4px;
    color: var(--text2); font-family: 'Outfit', sans-serif;
    font-size: 22px; font-weight: 700; cursor: pointer; text-align: center;
    transition: all 0.15s; user-select: none; -webkit-tap-highlight-color: transparent;
  }

  .day-btn .day-sub { font-family: 'DM Sans', sans-serif; font-size: 9px; font-weight: 600; letter-spacing: 0.5px; color: var(--text3); display: block; margin-top: 2px; }
  .day-btn.selected { background: var(--gold-dim); border-color: var(--gold); color: var(--gold); }
  .day-btn.selected .day-sub { color: var(--gold2); }

  /* ── INPUTS ── */
  .text-input {
    width: 100%; background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 14px 16px;
    font-family: 'DM Sans', sans-serif; font-size: 14px; color: var(--text);
    resize: none; outline: none; transition: border-color 0.2s; line-height: 1.5;
  }

  .text-input:focus { border-color: var(--gold); }
  .text-input::placeholder { color: var(--text3); }

  .input-row { display: flex; gap: 10px; }

  .input-group { flex: 1; display: flex; flex-direction: column; gap: 6px; }
  .input-label { font-size: 11px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; color: var(--text3); font-family: 'Outfit', sans-serif; }

  .input-field {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-sm); padding: 13px 14px;
    font-family: 'DM Sans', sans-serif; font-size: 15px; color: var(--text);
    outline: none; transition: border-color 0.2s; width: 100%;
  }

  .input-field:focus { border-color: var(--gold); }
  .input-field::placeholder { color: var(--text3); }

  select.input-field { cursor: pointer; appearance: none; }

  /* ── BUTTONS ── */
  .action-bar {
    padding: 14px 20px 10px; background: var(--bg);
    border-top: 1px solid var(--border); flex-shrink: 0;
    display: flex; flex-direction: column; gap: 8px;
  }

  .btn-primary {
    width: 100%; background: var(--gold); color: #0C0C0E; border: none;
    border-radius: var(--radius); padding: 16px;
    font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: 700;
    letter-spacing: 0.5px; cursor: pointer; transition: all 0.2s ease;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    -webkit-tap-highlight-color: transparent;
  }

  .btn-primary:hover { background: var(--gold2); }
  .btn-primary:active { transform: scale(0.98); }
  .btn-primary:disabled { opacity: 0.3; cursor: not-allowed; transform: none; }

  .btn-ghost {
    background: transparent; border: 1px solid var(--border); border-radius: var(--radius-sm);
    padding: 13px; color: var(--text3); font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 500; cursor: pointer; width: 100%;
    transition: all 0.15s; -webkit-tap-highlight-color: transparent;
  }

  .btn-ghost:hover { border-color: var(--border2); color: var(--text2); }

  .btn-sm {
    background: var(--surface2); border: 1px solid var(--border); border-radius: 10px;
    padding: 8px 14px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
    color: var(--text2); cursor: pointer; transition: all 0.15s; white-space: nowrap;
    -webkit-tap-highlight-color: transparent;
  }

  /* ── CARDS ── */
  .card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 18px;
    margin-bottom: 12px;
  }

  .card-title {
    font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: 700;
    color: var(--text); margin-bottom: 4px;
  }

  .card-sub { font-size: 13px; color: var(--text3); line-height: 1.5; }

  /* ── INFO BOX ── */
  .info-box {
    background: var(--gold-dim); border: 1px solid rgba(201,168,76,0.15);
    border-radius: var(--radius); padding: 13px 15px;
    font-size: 13px; color: var(--text2); line-height: 1.6; margin-top: 18px;
  }

  .info-box strong { color: var(--gold2); }

  /* ── LOADING ── */
  .loading-screen {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 40px 20px; gap: 22px; text-align: center;
  }

  .loader-container { position: relative; width: 64px; height: 64px; }
  .loader-ring {
    width: 64px; height: 64px; border: 2px solid var(--border);
    border-top-color: var(--gold); border-radius: 50%;
    animation: spin 0.8s linear infinite; position: absolute;
  }
  .loader-inner {
    width: 44px; height: 44px; border: 1.5px solid transparent;
    border-bottom-color: rgba(201,168,76,0.3); border-radius: 50%;
    animation: spin 1.4s linear infinite reverse; position: absolute;
    top: 10px; left: 10px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-title {
    font-family: 'Outfit', sans-serif; font-size: 22px; font-weight: 700;
    color: var(--text); letter-spacing: -0.3px;
  }
  .loading-subtitle { font-size: 13px; color: var(--text3); line-height: 1.5; max-width: 240px; }
  .loading-items { display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 280px; }
  .loading-item {
    display: flex; align-items: center; gap: 10px; padding: 12px 14px;
    border-radius: var(--radius-sm); background: var(--surface);
    transition: all 0.35s ease; font-size: 13px; color: var(--text3);
  }
  .loading-item.active { background: var(--gold-dim); color: var(--text); border: 1px solid rgba(201,168,76,0.15); }
  .loading-item.done { color: var(--green); }
  .li-icon { font-size: 15px; line-height: 1; flex-shrink: 0; }

  /* ── PROGRAM PREVIEW ── */
  .program-hero {
    background: linear-gradient(135deg, var(--surface) 0%, rgba(201,168,76,0.05) 100%);
    border: 1px solid var(--border); border-radius: var(--radius-lg);
    padding: 22px; margin-bottom: 16px; position: relative; overflow: hidden;
  }

  .program-hero::after {
    content: '';
    position: absolute; bottom: -30px; right: -30px;
    width: 100px; height: 100px;
    background: radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%);
    border-radius: 50%; pointer-events: none;
  }

  .program-hero-name {
    font-family: 'Outfit', sans-serif; font-size: 22px; font-weight: 800;
    color: var(--gold); line-height: 1; margin-bottom: 6px; letter-spacing: -0.3px;
  }

  .program-hero-summary { font-size: 13px; color: var(--text3); line-height: 1.5; margin-bottom: 14px; }

  .meta-row { display: flex; flex-wrap: wrap; gap: 6px; }
  .meta-pill {
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 8px; padding: 4px 10px;
    font-size: 11px; font-weight: 500; color: var(--text3);
    font-family: 'Outfit', sans-serif;
  }

  /* ── DAY CARDS ── */
  .day-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); margin-bottom: 10px;
    overflow: hidden; transition: border-color 0.2s;
  }

  .day-card.expanded { border-color: var(--border2); }

  .day-header {
    padding: 15px 17px; display: flex; align-items: center; gap: 14px;
    cursor: pointer; user-select: none; -webkit-tap-highlight-color: transparent;
  }

  .day-num-big {
    font-family: 'Outfit', sans-serif; font-size: 30px; font-weight: 800;
    line-height: 1; color: var(--border2); min-width: 28px; transition: color 0.2s;
    letter-spacing: -1px;
  }

  .day-card.expanded .day-num-big { color: var(--gold); }
  .day-header-text { flex: 1; min-width: 0; }
  .day-header-name { font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 600; color: var(--text); }
  .day-header-muscles { font-size: 12px; color: var(--text3); margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .day-chevron { color: var(--text3); font-size: 14px; transition: transform 0.25s; flex-shrink: 0; }
  .day-card.expanded .day-chevron { transform: rotate(180deg); color: var(--gold); }

  .ex-list {
    border-top: 1px solid var(--border); max-height: 0; overflow: hidden;
    transition: max-height 0.4s cubic-bezier(0.4,0,0.2,1);
  }

  .day-card.expanded .ex-list { max-height: 3000px; }

  .ex-row { padding: 13px 17px; display: flex; gap: 12px; border-bottom: 1px solid rgba(44,44,52,0.6); }
  .ex-row:last-child { border-bottom: none; }
  .ex-idx { font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 700; color: var(--text3); min-width: 18px; padding-top: 2px; flex-shrink: 0; }
  .ex-body { flex: 1; min-width: 0; }
  .ex-name { font-size: 13px; font-weight: 600; margin-bottom: 3px; }
  .ex-muscle-tag {
    display: inline-block; background: var(--surface2); border-radius: 5px;
    padding: 2px 7px; font-size: 10px; font-weight: 600; letter-spacing: 0.5px;
    color: var(--text3); text-transform: uppercase; margin-bottom: 5px;
    font-family: 'Outfit', sans-serif;
  }
  .ex-tip { font-size: 11px; color: var(--text3); line-height: 1.45; margin-bottom: 6px; font-style: italic; }
  .ex-stats { display: flex; gap: 5px; flex-wrap: wrap; }
  .ex-stat { border-radius: 6px; padding: 3px 8px; font-size: 11px; font-weight: 600; font-family: 'Outfit', sans-serif; }
  .ex-stat.sets { background: var(--gold-dim); color: var(--gold2); }
  .ex-stat.reps { background: rgba(96,165,250,0.1); color: #93C5FD; }
  .ex-stat.rest { background: var(--green-dim); color: var(--green); }

  .rest-content { border-top: 1px solid var(--border); padding: 20px 17px; text-align: center; color: var(--text3); font-size: 13px; line-height: 1.6; }
  .rest-icon-sm { font-size: 26px; display: block; margin-bottom: 6px; }

  .save-bar { padding: 14px 20px 10px; background: var(--bg); border-top: 1px solid var(--border); flex-shrink: 0; display: flex; flex-direction: column; gap: 8px; }

  /* ── MY PROGRAMS ── */
  .programs-header { margin-bottom: 20px; }
  .programs-title { font-family: 'Outfit', sans-serif; font-size: 28px; font-weight: 800; color: var(--text); letter-spacing: -0.5px; margin-bottom: 3px; }
  .programs-count { font-size: 13px; color: var(--text3); }

  .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 50px 30px; text-align: center; gap: 12px; }
  .empty-icon { font-size: 50px; opacity: 0.25; }
  .empty-title { font-family: 'Outfit', sans-serif; font-size: 22px; font-weight: 700; color: var(--text3); }
  .empty-sub { font-size: 13px; color: var(--text3); line-height: 1.6; max-width: 230px; }

  .prog-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 18px 18px 16px;
    cursor: pointer; transition: all 0.15s; -webkit-tap-highlight-color: transparent;
    position: relative; overflow: hidden; margin-bottom: 10px;
  }

  .prog-card:active { transform: scale(0.98); }
  .prog-card:hover { border-color: var(--border2); }
  .prog-card::before { content: ''; position: absolute; top: 0; right: 0; width: 80px; height: 80px; background: radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%); pointer-events: none; }

  .prog-card-name { font-family: 'Outfit', sans-serif; font-size: 18px; font-weight: 700; color: var(--gold); margin-bottom: 3px; letter-spacing: -0.2px; }
  .prog-card-meta { font-size: 12px; color: var(--text3); margin-bottom: 10px; }
  .prog-card-badges { display: flex; gap: 6px; flex-wrap: wrap; }
  .prog-card-badge { background: var(--surface2); border-radius: 7px; padding: 3px 9px; font-size: 11px; font-weight: 500; color: var(--text3); font-family: 'Outfit', sans-serif; }

  .prog-delete {
    position: absolute; top: 15px; right: 15px;
    background: rgba(248,113,113,0.08); border: none; border-radius: 8px;
    width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
    font-size: 13px; cursor: pointer; color: var(--red); transition: all 0.15s;
    -webkit-tap-highlight-color: transparent;
  }

  .prog-delete:hover { background: rgba(248,113,113,0.15); }

  /* ── DAILY VIEW ── */
  .daily-header {
    background: var(--bg); border-bottom: 1px solid var(--border);
    padding: 14px 20px; display: flex; align-items: center; gap: 12px; flex-shrink: 0;
  }

  .back-btn {
    background: var(--surface); border: 1px solid var(--border); border-radius: 10px;
    width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
    font-size: 16px; cursor: pointer; color: var(--text); transition: all 0.15s;
    -webkit-tap-highlight-color: transparent; flex-shrink: 0;
  }

  .back-btn:active { transform: scale(0.92); }

  .daily-header-info { flex: 1; min-width: 0; }
  .daily-prog-name { font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: 700; color: var(--gold); line-height: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .daily-day-label { font-size: 11px; color: var(--text3); margin-top: 2px; }

  .day-navigator { padding: 12px 20px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
  .day-nav-scroll { display: flex; gap: 7px; overflow-x: auto; padding-bottom: 2px; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
  .day-nav-scroll::-webkit-scrollbar { display: none; }

  .day-pill {
    flex-shrink: 0; background: var(--surface); border: 1px solid var(--border);
    border-radius: 100px; padding: 7px 13px; cursor: pointer; transition: all 0.15s;
    text-align: center; user-select: none; -webkit-tap-highlight-color: transparent;
  }

  .day-pill:active { transform: scale(0.94); }
  .day-pill.active-day { background: var(--gold-dim); border-color: var(--gold); }
  .day-pill.rest-pill { opacity: 0.5; }
  .day-pill.active-day.rest-pill { opacity: 0.8; }
  .dp-num { font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: 700; line-height: 1; color: var(--text2); }
  .day-pill.active-day .dp-num { color: var(--gold); }
  .dp-label { font-size: 9px; font-weight: 600; letter-spacing: 0.4px; color: var(--text3); margin-top: 1px; max-width: 56px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: 'Outfit', sans-serif; }

  /* ── WORKOUT SESSION ── */
  .session-header { margin-bottom: 16px; }
  .session-title { font-family: 'Outfit', sans-serif; font-size: 24px; font-weight: 800; color: var(--text); line-height: 1.1; margin-bottom: 4px; letter-spacing: -0.3px; }
  .session-muscles { font-size: 13px; color: var(--gold2); font-weight: 500; }
  .session-ex-count { font-size: 12px; color: var(--text3); margin-top: 3px; }

  .session-progress { background: var(--surface); border-radius: var(--radius); padding: 12px 14px; margin-bottom: 14px; display: flex; align-items: center; gap: 12px; }
  .sp-bar-wrap { flex: 1; height: 4px; background: var(--border); border-radius: 4px; overflow: hidden; }
  .sp-bar { height: 100%; background: var(--green); border-radius: 4px; transition: width 0.5s ease; }
  .sp-text { font-size: 12px; color: var(--text3); font-weight: 600; white-space: nowrap; font-family: 'Outfit', sans-serif; }
  .sp-text span { color: var(--green); }

  /* ── EXERCISE CARD ── */
  .ex-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 16px; margin-bottom: 9px;
    transition: all 0.2s;
  }

  .ex-card.completed { border-color: rgba(74,222,128,0.3); background: var(--green-dim); }

  .ex-card-top { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
  .ex-card-num {
    font-family: 'Outfit', sans-serif; font-size: 26px; font-weight: 800;
    line-height: 1; color: var(--border2); min-width: 26px; flex-shrink: 0; transition: color 0.2s; letter-spacing: -1px;
  }
  .ex-card.completed .ex-card-num { color: var(--green); }
  .ex-card-info { flex: 1; min-width: 0; }
  .ex-card-name { font-size: 14px; font-weight: 600; margin-bottom: 3px; }
  .ex-muscle-badge {
    display: inline-block; background: var(--surface2); border-radius: 5px;
    padding: 2px 7px; font-size: 10px; font-weight: 600; letter-spacing: 0.5px;
    color: var(--text3); text-transform: uppercase; margin-bottom: 5px;
    transition: all 0.2s; font-family: 'Outfit', sans-serif;
  }
  .ex-card.completed .ex-muscle-badge { background: rgba(74,222,128,0.1); color: var(--green); }
  .ex-card-tip { font-size: 11px; color: var(--text3); font-style: italic; line-height: 1.45; }

  .ex-card-stats { display: flex; gap: 7px; margin-bottom: 12px; }
  .ex-big-stat { flex: 1; background: var(--surface2); border-radius: 10px; padding: 10px 8px; text-align: center; }
  .ex-big-stat .val { font-family: 'Outfit', sans-serif; font-size: 20px; font-weight: 700; line-height: 1; }
  .ex-big-stat .lbl { font-size: 9px; font-weight: 600; letter-spacing: 0.5px; color: var(--text3); text-transform: uppercase; margin-top: 3px; font-family: 'Outfit', sans-serif; }
  .ex-big-stat.sets-stat .val { color: var(--gold2); }
  .ex-big-stat.reps-stat .val { color: #93C5FD; }
  .ex-big-stat.rest-stat .val { font-size: 14px; padding-top: 3px; color: var(--green); }

  .ex-done-btn {
    width: 100%; background: var(--surface2); border: 1px dashed var(--border2);
    border-radius: var(--radius-sm); padding: 11px;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
    color: var(--text3); cursor: pointer; transition: all 0.2s;
    -webkit-tap-highlight-color: transparent;
  }
  .ex-done-btn:hover { border-color: var(--green); color: var(--green); }
  .ex-card.completed .ex-done-btn { background: rgba(74,222,128,0.08); border: 1px solid rgba(74,222,128,0.3); color: var(--green); }

  /* ── REST TIMER ── */
  .rest-timer-overlay {
    position: fixed; inset: 0; background: rgba(12,12,14,0.96);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    z-index: 999; gap: 24px; animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .timer-ring-wrap { position: relative; width: 160px; height: 160px; }

  .timer-svg { transform: rotate(-90deg); }

  .timer-track { fill: none; stroke: var(--surface2); stroke-width: 6; }
  .timer-progress { fill: none; stroke: var(--gold); stroke-width: 6; stroke-linecap: round; transition: stroke-dashoffset 1s linear; }

  .timer-num {
    position: absolute; inset: 0; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
  }

  .timer-seconds {
    font-family: 'Outfit', sans-serif; font-size: 48px; font-weight: 800;
    color: var(--text); line-height: 1; letter-spacing: -2px;
  }

  .timer-label-sm { font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: var(--text3); font-family: 'Outfit', sans-serif; margin-top: 2px; }

  .timer-title { font-family: 'Outfit', sans-serif; font-size: 20px; font-weight: 700; color: var(--text); text-align: center; }
  .timer-next { font-size: 13px; color: var(--text3); text-align: center; }
  .timer-next strong { color: var(--text2); }

  .timer-skip {
    background: var(--surface); border: 1px solid var(--border); border-radius: 100px;
    padding: 12px 28px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
    color: var(--text2); cursor: pointer; transition: all 0.15s;
    -webkit-tap-highlight-color: transparent;
  }

  .timer-skip:hover { border-color: var(--border2); }

  /* ── REST DAY ── */
  .rest-day-view { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 28px; text-align: center; gap: 14px; }
  .rest-big-icon { font-size: 64px; }
  .rest-view-title { font-family: 'Outfit', sans-serif; font-size: 26px; font-weight: 800; color: var(--text); letter-spacing: -0.5px; }
  .rest-view-sub { font-size: 14px; color: var(--text3); line-height: 1.6; max-width: 250px; }
  .rest-tips { margin-top: 14px; display: flex; flex-direction: column; gap: 7px; width: 100%; max-width: 290px; }
  .rest-tip-item { background: var(--surface); border-radius: var(--radius); padding: 12px 14px; font-size: 13px; color: var(--text2); display: flex; gap: 10px; align-items: flex-start; text-align: left; }

  /* ── PROFILE PAGE ── */
  .profile-avatar {
    width: 72px; height: 72px; background: var(--gold-dim); border: 2px solid var(--gold);
    border-radius: 22px; display: flex; align-items: center; justify-content: center;
    font-size: 30px; margin-bottom: 14px; cursor: pointer;
    transition: all 0.15s; -webkit-tap-highlight-color: transparent;
  }

  .profile-avatar:active { transform: scale(0.95); }

  .profile-name { font-family: 'Outfit', sans-serif; font-size: 24px; font-weight: 800; color: var(--text); letter-spacing: -0.3px; margin-bottom: 3px; }
  .profile-subtitle { font-size: 13px; color: var(--text3); margin-bottom: 22px; }

  .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px; }
  .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px; }
  .stat-val { font-family: 'Outfit', sans-serif; font-size: 26px; font-weight: 800; color: var(--text); line-height: 1; margin-bottom: 3px; letter-spacing: -1px; }
  .stat-val span { font-size: 14px; font-weight: 500; color: var(--text3); }
  .stat-lbl { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text3); font-family: 'Outfit', sans-serif; }

  .streak-card { background: linear-gradient(135deg, var(--surface) 0%, rgba(201,168,76,0.06) 100%); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 18px; display: flex; align-items: center; gap: 14px; margin-bottom: 8px; }
  .streak-icon { font-size: 36px; }
  .streak-info { flex: 1; }
  .streak-num { font-family: 'Outfit', sans-serif; font-size: 28px; font-weight: 800; color: var(--gold); letter-spacing: -1px; line-height: 1; }
  .streak-label { font-size: 12px; color: var(--text3); margin-top: 2px; }

  .history-item { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 13px 15px; display: flex; align-items: center; gap: 12px; margin-bottom: 7px; }
  .history-icon { font-size: 18px; flex-shrink: 0; }
  .history-info { flex: 1; min-width: 0; }
  .history-name { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .history-meta { font-size: 11px; color: var(--text3); margin-top: 2px; }
  .history-badge { background: var(--green-dim); border-radius: 6px; padding: 3px 8px; font-size: 11px; font-weight: 600; color: var(--green); font-family: 'Outfit', sans-serif; white-space: nowrap; }

  /* ── NUTRITION PAGE ── */
  .macro-hero { background: linear-gradient(135deg, var(--surface) 0%, rgba(201,168,76,0.05) 100%); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; margin-bottom: 14px; }
  .macro-hero-title { font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: var(--text3); margin-bottom: 6px; }
  .macro-kcal { font-family: 'Outfit', sans-serif; font-size: 42px; font-weight: 900; color: var(--text); letter-spacing: -2px; line-height: 1; margin-bottom: 3px; }
  .macro-kcal span { font-size: 16px; font-weight: 500; color: var(--text3); letter-spacing: 0; }
  .macro-goal-label { font-size: 13px; color: var(--gold2); font-weight: 500; margin-bottom: 16px; }

  .macro-bars { display: flex; flex-direction: column; gap: 10px; }
  .macro-bar-row { display: flex; align-items: center; gap: 10px; }
  .macro-bar-label { font-size: 12px; font-weight: 600; color: var(--text2); width: 75px; flex-shrink: 0; font-family: 'Outfit', sans-serif; }
  .macro-bar-wrap { flex: 1; height: 6px; background: var(--surface2); border-radius: 6px; overflow: hidden; }
  .macro-bar-fill { height: 100%; border-radius: 6px; transition: width 0.8s cubic-bezier(0.4,0,0.2,1); }
  .macro-bar-val { font-size: 12px; font-weight: 600; color: var(--text3); width: 50px; text-align: right; font-family: 'Outfit', sans-serif; flex-shrink: 0; }

  .macro-cards { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 7px; margin-bottom: 14px; }
  .macro-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 13px 10px; text-align: center; }
  .macro-card-val { font-family: 'Outfit', sans-serif; font-size: 22px; font-weight: 800; line-height: 1; margin-bottom: 3px; }
  .macro-card-val span { font-size: 12px; font-weight: 500; color: var(--text3); }
  .macro-card-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text3); font-family: 'Outfit', sans-serif; }

  .meal-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 16px; margin-bottom: 9px; }
  .meal-card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .meal-card-icon { font-size: 20px; }
  .meal-card-title { font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 700; color: var(--text); }
  .meal-card-kcal { font-size: 12px; color: var(--text3); margin-top: 1px; }
  .meal-items { display: flex; flex-direction: column; gap: 5px; }
  .meal-item { font-size: 13px; color: var(--text2); display: flex; gap: 7px; align-items: baseline; }
  .meal-item::before { content: '·'; color: var(--text3); flex-shrink: 0; }

  .no-profile-banner { background: var(--gold-dim); border: 1px solid rgba(201,168,76,0.2); border-radius: var(--radius-lg); padding: 18px 18px; text-align: center; margin-bottom: 14px; }
  .no-profile-banner-title { font-family: 'Outfit', sans-serif; font-size: 15px; font-weight: 700; color: var(--gold); margin-bottom: 4px; }
  .no-profile-banner-sub { font-size: 13px; color: var(--text3); line-height: 1.5; }

  /* ── ANIMATIONS ── */
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .fade-up { animation: fadeUp 0.3s ease both; }

  @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  .scale-in { animation: scaleIn 0.25s ease both; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// MOTEUR DE GÉNÉRATION HORS-LIGNE
// ─────────────────────────────────────────────────────────────────────────────
const EXERCISE_DB = {
  chest: [
    { name: "Développé couché barre",     tip: "Descends lentement jusqu'à la poitrine, pousse en expirant fort.",              equip: ["gym","barbell"] },
    { name: "Développé incliné haltères", tip: "Inclinaison 30-45°, coudes à 75° pour protéger les épaules.",                   equip: ["gym","dumbbells"] },
    { name: "Écarté câble basse poulie",  tip: "Croise les mains en haut pour maximiser le pic de contraction pectorale.",      equip: ["gym","cables"] },
    { name: "Développé couché haltères",  tip: "Amplitude complète — descends jusqu'à sentir l'étirement des pecs.",            equip: ["gym","dumbbells"] },
    { name: "Dips lestés",                tip: "Buste légèrement penché en avant pour cibler les pectoraux.",                   equip: ["gym"] },
    { name: "Pec deck / Butterfly",       tip: "Maintiens 1 seconde en position contractée, relâche très lentement.",           equip: ["gym","machines"] },
    { name: "Pompes déclinées",           tip: "Pieds surélevés sur un banc — cible la partie haute des pecs.",                 equip: ["any","bodyweight"] },
    { name: "Pompes",                     tip: "Corps parfaitement droit, descends la poitrine au sol, dos neutre.",            equip: ["any","bodyweight"] },
  ],
  back: [
    { name: "Tirage vertical prise large",   tip: "Étire bien en haut, contracte les omoplates en bas du mouvement.",          equip: ["gym","cables"] },
    { name: "Rowing barre pronation",        tip: "Dos plat à 45°, tire vers le nombril, coudes collés au corps.",             equip: ["gym","barbell"] },
    { name: "Rowing haltère unilatéral",     tip: "Appui sur un banc, tire le coude vers le plafond, épaule immobile.",        equip: ["gym","dumbbells"] },
    { name: "Soulevé de terre roumain",      tip: "Dos neutre absolu, barre contre les jambes tout le long du trajet.",        equip: ["gym","barbell"] },
    { name: "Tirage poulie basse",           tip: "Assis, tire vers le bas-ventre, serre les omoplates 1 seconde.",            equip: ["gym","cables"] },
    { name: "Pull-up / Traction",            tip: "Prise large, descends complètement, monte le menton au-dessus de la barre.",equip: ["gym","bodyweight"] },
    { name: "Rowing à la machine",           tip: "Appui poitrine, mouvement contrôlé, focus total sur les omoplates.",        equip: ["gym","machines"] },
    { name: "Tirage horizontal câble",       tip: "Coudes près du corps, épaules basses, contracte le dos 1 seconde.",         equip: ["gym","cables"] },
  ],
  shoulders: [
    { name: "Développé militaire barre",     tip: "Barre devant, dos neutre, pousse verticalement sans cambrer le bas-dos.",   equip: ["gym","barbell"] },
    { name: "Élévations latérales haltères", tip: "Légèrement penché, coudes à 15° de flexion, monte jusqu'à l'horizontal.",  equip: ["gym","dumbbells"] },
    { name: "Arnold Press",                  tip: "Rotation des paumes en montant — excellent pour le deltoïde antérieur.",    equip: ["gym","dumbbells"] },
    { name: "Oiseau (élévations arrière)",   tip: "Buste penché à 90°, coudes légèrement fléchis, pince les omoplates.",      equip: ["gym","dumbbells"] },
    { name: "Face pull câble",               tip: "Poulie haute, tire vers le visage en séparant les mains — protège les épaules.", equip: ["gym","cables"] },
    { name: "Développé haltères assis",      tip: "Coudes à 90°, pousse vers le haut sans verrouiller les coudes.",           equip: ["gym","dumbbells"] },
    { name: "Élévation frontale haltères",   tip: "Monte à hauteur des yeux, descends lentement en 3 secondes.",              equip: ["gym","dumbbells"] },
  ],
  biceps: [
    { name: "Curl barre droite",             tip: "Coudes fixes contre le corps — le mouvement vient du coude uniquement.",   equip: ["gym","barbell"] },
    { name: "Curl haltères alterné",         tip: "Supine le poignet en montant pour maximiser la contraction.",              equip: ["gym","dumbbells"] },
    { name: "Curl marteau",                  tip: "Prise neutre — cible le brachial sous le biceps pour plus d'épaisseur.",  equip: ["gym","dumbbells"] },
    { name: "Curl concentré",                tip: "Coude contre la cuisse, amplitude complète, isolement parfait.",           equip: ["gym","dumbbells"] },
    { name: "Curl câble basse poulie",       tip: "Tension constante tout le long du mouvement — parfait en finisher.",       equip: ["gym","cables"] },
    { name: "Curl barre EZ",                 tip: "Prise en supination partielle — moins de stress sur les poignets.",        equip: ["gym","barbell"] },
  ],
  triceps: [
    { name: "Pushdown câble prise haute",    tip: "Coudes fixes, étends complètement en contractant, descends lentement.",    equip: ["gym","cables"] },
    { name: "Extension triceps poulie haute",tip: "Bras derrière la tête, descends l'avant-bras, étends complètement.",      equip: ["gym","cables"] },
    { name: "Dips (banc / barres parallèles)",tip: "Buste droit pour les triceps (penché = pectoraux).",                     equip: ["gym","bodyweight"] },
    { name: "Skull crusher barre EZ",        tip: "Descends vers le front lentement, coudes fixes, extension explosive.",    equip: ["gym","barbell"] },
    { name: "Extension haltère une main",    tip: "Bras vertical derrière la nuque, descends lentement, étends complètement.", equip: ["gym","dumbbells"] },
    { name: "Kickback haltère",              tip: "Buste parallèle au sol, étends jusqu'à l'alignement, 1 sec de hold.",    equip: ["gym","dumbbells"] },
  ],
  legs: [
    { name: "Squat barre",                   tip: "Pieds à largeur d'épaules, cuisses parallèles, dos neutre absolu.",        equip: ["gym","barbell"] },
    { name: "Presse à cuisse",               tip: "Pieds hauts = fessiers, pieds bas = quadriceps. Amplitude 90°.",          equip: ["gym","machines"] },
    { name: "Leg extension",                 tip: "Extension complète, 1 seconde de contraction au sommet, descente lente.", equip: ["gym","machines"] },
    { name: "Leg curl couché",               tip: "Hanche plaquée sur le banc, ramène les talons vers les fessiers.",        equip: ["gym","machines"] },
    { name: "Fentes marchées haltères",      tip: "Grand pas, genou avant à 90°, ne touche pas le sol avec le genou arrière.", equip: ["gym","dumbbells"] },
    { name: "Romanian Deadlift (RDL)",       tip: "Charnière hanches, dos neutre, barre proche des jambes, ischio++.",       equip: ["gym","barbell"] },
    { name: "Squat bulgare haltères",        tip: "Pied arrière surélevé, descends genou à 90°, poussée sur le pied avant.", equip: ["gym","dumbbells"] },
    { name: "Squat poids du corps",          tip: "Bras tendus devant, descends lentement, dos neutre, tempo 3-1-2.",        equip: ["any","bodyweight"] },
  ],
  glutes: [
    { name: "Hip thrust barre",              tip: "Omoplate sur banc, poussée explosive, serre les fessiers 2 secondes.",    equip: ["gym","barbell"] },
    { name: "Squat bulgare haltères",        tip: "Focus sur la poussée du pied avant — activation fessier maximale.",       equip: ["gym","dumbbells"] },
    { name: "Fentes inversées",              tip: "Recule un pied, genou avant à 90°, pousse sur le talon pour remonter.",   equip: ["gym","dumbbells","bodyweight"] },
    { name: "Abducteur machine",             tip: "Amplitude complète, maintiens 1 seconde en ouverture maximale.",          equip: ["gym","machines"] },
    { name: "Kickback câble",                tip: "Hanche stable, extension complète, contracte le fessier en haut.",        equip: ["gym","cables"] },
    { name: "Pont fessier",                  tip: "Poussée explosive vers le haut, serre les fessiers 2 secondes.",          equip: ["any","bodyweight"] },
  ],
  abs: [
    { name: "Crunch à la poulie",            tip: "Arrondi du dos vers les genoux — pas juste incliner le buste.",           equip: ["gym","cables"] },
    { name: "Relevé de jambes suspendu",     tip: "Jambes tendues, monte à la parallèle, descends lentement (4 sec).",       equip: ["gym","bodyweight"] },
    { name: "Planche frontale",              tip: "Corps aligné tête-talons, serre le ventre fort, respire normalement.",    equip: ["any","bodyweight"] },
    { name: "Russian Twist lesté",           tip: "Pieds décollés, rotation complète, touche le poids au sol de chaque côté.", equip: ["gym","dumbbells"] },
    { name: "Crunch vélo",                   tip: "Coude vers le genou opposé — rotation du buste, pas juste des coudes.",   equip: ["any","bodyweight"] },
    { name: "Ab wheel (molette)",            tip: "Déroule lentement, stop avant de perdre le gainage, reviens en contractant.", equip: ["gym"] },
    { name: "Crunch classique",              tip: "Mains à la tête sans tirer, soulève les épaules, contracte 1 seconde.",   equip: ["any","bodyweight"] },
  ],
  calves: [
    { name: "Mollets debout (machine)",      tip: "Amplitude maximale — descends en étirement complet, monte sur la pointe.", equip: ["gym","machines"] },
    { name: "Mollets assis (machine)",       tip: "Cible le soléaire sous le gastrocnémien — souvent négligé.",              equip: ["gym","machines"] },
    { name: "Mollets à la presse",           tip: "Pieds en bas de la plaque, amplitude complète, tempo 2-2.",               equip: ["gym","machines"] },
    { name: "Mollets unilatéraux",           tip: "Une jambe à la fois sur une marche, amplitude complète.",                 equip: ["any","bodyweight","dumbbells"] },
  ],
  traps: [
    { name: "Haussement d'épaules barre",    tip: "Monte les épaules vers les oreilles, tiens 1 sec en haut, descends lentement.", equip: ["gym","barbell"] },
    { name: "Rowing menton",                 tip: "Prise serrée, tire vers le menton, coudes au-dessus des mains.",          equip: ["gym","barbell","cables"] },
    { name: "Haussement haltères",           tip: "Mouvement pur épaule — pas de rotation du cou, dos neutre.",              equip: ["gym","dumbbells"] },
    { name: "Face pull câble",               tip: "Tire vers le visage en séparant les mains — trapèze + deltoïde arrière.", equip: ["gym","cables"] },
  ],
  forearms: [
    { name: "Curl poignets barre",           tip: "Avant-bras sur les cuisses, fléchis lentement — amplitude complète.",     equip: ["gym","barbell"] },
    { name: "Reverse curl barre EZ",         tip: "Prise pronation, coudes fixes, monte à hauteur des épaules.",             equip: ["gym","barbell"] },
    { name: "Farmer's carry haltères",       tip: "Marche avec des haltères lourds — renforce la préhension.",               equip: ["gym","dumbbells"] },
  ],
  fullbody: [
    { name: "Squat barre",              tip: "Mouvement roi du Full Body. Dos neutre, cuisses parallèles.",        equip: ["gym","barbell"] },
    { name: "Développé couché barre",   tip: "Descends lentement, pousse en expirant.",                           equip: ["gym","barbell"] },
    { name: "Soulevé de terre",         tip: "Dos neutre, poussée sur les jambes, barre contre les tibias.",       equip: ["gym","barbell"] },
    { name: "Tirage vertical",          tip: "Prise large, contracte les omoplates en bas.",                       equip: ["gym","cables"] },
    { name: "Développé militaire",      tip: "Barre devant, pousse vertical, abdos engagés.",                      equip: ["gym","barbell"] },
    { name: "Curl barre",               tip: "Coudes fixes, supine en montant.",                                   equip: ["gym","barbell"] },
    { name: "Planche frontale",         tip: "Corps aligné, respirations profondes.",                              equip: ["any","bodyweight"] },
    { name: "Pompes",                   tip: "Corps droit, amplitude complète.",                                   equip: ["any","bodyweight"] },
    { name: "Hip thrust barre",         tip: "Poussée explosive, serre les fessiers en haut.",                     equip: ["gym","barbell"] },
  ],
};

const GOAL_PARAMS = {
  strength:    { sets: 5, reps: "3-5",   rest: "3 min",   restSec: 180 },
  hypertrophy: { sets: 4, reps: "8-12",  rest: "90 sec",  restSec: 90  },
  endurance:   { sets: 3, reps: "15-20", rest: "45 sec",  restSec: 45  },
  weight_loss: { sets: 4, reps: "12-15", rest: "60 sec",  restSec: 60  },
  toning:      { sets: 3, reps: "12-15", rest: "75 sec",  restSec: 75  },
};

const MUSCLE_EX_COUNT = {
  chest: 3, back: 4, legs: 4, glutes: 3,
  shoulders: 3, abs: 3,
  biceps: 2, triceps: 2, calves: 2, traps: 2, forearms: 2,
  fullbody: 7,
};

const SYNERGY_GROUPS = [
  { id: "push",     muscles: ["chest","shoulders","triceps"],         name: "PUSH",     emoji: "💪" },
  { id: "pull",     muscles: ["back","biceps","traps","forearms"],    name: "PULL",     emoji: "🔙" },
  { id: "legs",     muscles: ["legs","glutes","calves"],              name: "LEGS",     emoji: "🦵" },
  { id: "core",     muscles: ["abs"],                                 name: "CORE",     emoji: "⚡" },
  { id: "fullbody", muscles: ["fullbody"],                            name: "FULL BODY",emoji: "🔥" },
];

const PROGRAM_NAMES = {
  ppl:      ["Progressive PPL","Iron Split PPL","Atlas PPL Program","The PPL Protocol"],
  ul:       ["Upper/Lower Power","Binary Force Protocol","Dual Split System"],
  fullbody: ["Full Body Blitz","Total Body Protocol","Compound Foundation","The Complete Athlete"],
  custom:   ["Custom Gainz Program","Precision Split","Tailored Strength Plan","The Personal Protocol"],
};

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function getAvailableExercises(muscleId, equipment) {
  const all = EXERCISE_DB[muscleId] || [];
  if (!equipment || equipment.length === 0) return all;
  return all.filter(ex => ex.equip.includes("any") || ex.equip.some(e => equipment.includes(e)));
}

function pickExercises(muscleId, count, equipment, usedNames = new Set()) {
  const available = getAvailableExercises(muscleId, equipment).filter(ex => !usedNames.has(ex.name));
  return [...available].sort(() => Math.random() - 0.5).slice(0, Math.min(count, available.length));
}

function generateProgram(form) {
  const { muscles, goal, level, equipment, daysPerWeek } = form;
  const params = GOAL_PARAMS[goal] || GOAL_PARAMS.hypertrophy;
  const exMult = { strength: 0.7, hypertrophy: 1.0, endurance: 1.1, weight_loss: 1.1, toning: 1.0 }[goal] || 1.0;
  const levelMult = level === "beginner" ? 0.75 : level === "advanced" ? 1.15 : 1.0;

  const activeSynGroups = SYNERGY_GROUPS
    .map(sg => ({ ...sg, activeMuscles: sg.muscles.filter(m => muscles.includes(m)) }))
    .filter(sg => sg.activeMuscles.length > 0);

  const trainingDays = [];
  for (let i = 0; i < daysPerWeek; i++) {
    trainingDays.push({ synGroup: activeSynGroups[i % activeSynGroups.length] });
  }

  const days = [];
  let dayNumber = 1;

  for (let i = 0; i < trainingDays.length; i++) {
    const { synGroup } = trainingDays[i];
    const exercises = [];
    const usedNames = new Set();

    for (const muscleId of synGroup.activeMuscles) {
      const baseCount = MUSCLE_EX_COUNT[muscleId] || 2;
      const targetCount = Math.max(1, Math.round(baseCount * exMult * levelMult));
      const picked = pickExercises(muscleId, targetCount, equipment, usedNames);
      picked.forEach(ex => usedNames.add(ex.name));
      const finalSets = Math.max(2, Math.round(params.sets * levelMult));
      picked.forEach(ex => exercises.push({
        name: ex.name,
        muscle: muscleId.charAt(0).toUpperCase() + muscleId.slice(1),
        sets: finalSets, reps: params.reps, rest: params.rest, restSec: params.restSec, tip: ex.tip,
      }));
    }

    const muscleLabels = synGroup.activeMuscles
      .map(m => MUSCLES_UI.find(x => x.id === m)?.label || m).join(" & ");

    days.push({
      dayNumber, isRest: false,
      name: `${synGroup.name} — ${muscleLabels}`,
      muscles: synGroup.activeMuscles.map(m => MUSCLES_UI.find(x => x.id === m)?.label || m).join(" • "),
      exercises: exercises.slice(0, 7),
    });
    dayNumber++;

    const nextGroup = trainingDays[i + 1]?.synGroup;
    if (nextGroup && nextGroup.id === synGroup.id && (7 - daysPerWeek) > 0) {
      days.push({ dayNumber, name: "REPOS", muscles: "Récupération", isRest: true, exercises: [] });
      dayNumber++;
    }
  }

  const goalObj = GOALS.find(g => g.id === goal);
  const levelObj = LEVELS.find(l => l.id === level);
  const hasAll3 = ["push","pull","legs"].every(gid => activeSynGroups.some(sg => sg.id === gid));
  const isFullBody = muscles.includes("fullbody");
  const hasUL = activeSynGroups.some(sg => ["push","pull"].includes(sg.id)) && activeSynGroups.some(sg => sg.id === "legs");
  const nameKey = isFullBody ? "fullbody" : hasAll3 ? "ppl" : hasUL ? "ul" : "custom";

  return {
    programName: pick(PROGRAM_NAMES[nameKey]),
    summary: `Programme ${goalObj?.label.toLowerCase()} · Split ${synGroups_label(activeSynGroups)} · ${levelObj?.label}`,
    goal: goalObj?.label, level: levelObj?.label,
    frequency: `${daysPerWeek} jours/semaine`,
    duration: level === "beginner" ? "6-8 semaines" : level === "advanced" ? "12-16 semaines" : "8-12 semaines",
    days,
  };
}

function synGroups_label(groups) {
  if (groups.some(g => g.id === "fullbody")) return "Full Body";
  const names = groups.map(g => g.name).join("/");
  return names || "Custom";
}

// ── NUTRITION ENGINE ──────────────────────────────────────────────────────────
function calculateNutrition(profile) {
  if (!profile.weight || !profile.height || !profile.age) return null;
  const w = parseFloat(profile.weight), h = parseFloat(profile.height), a = parseInt(profile.age);
  if (!w || !h || !a) return null;

  // Harris-Benedict (revised)
  const bmr = profile.sex === "f"
    ? 447.593 + (9.247 * w) + (3.098 * h) - (4.330 * a)
    : 88.362 + (13.397 * w) + (4.799 * h) - (5.677 * a);

  const activityFactors = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
  const tdee = Math.round(bmr * (activityFactors[profile.activity] || 1.55));

  const adjustments = {
    weight_loss: -400, strength: +250, hypertrophy: +300,
    endurance: -100, toning: 0,
  };
  const targetKcal = tdee + (adjustments[profile.goal] || 0);

  // Macros
  const protein = Math.round(w * (profile.goal === "strength" || profile.goal === "hypertrophy" ? 2.2 : 1.8));
  const fat = Math.round((targetKcal * 0.25) / 9);
  const carbs = Math.round((targetKcal - protein * 4 - fat * 9) / 4);
  const water = Math.round(w * 0.035 * 10) / 10;

  return { tdee, targetKcal, protein, fat, carbs, water };
}

function getMealPlan(kcal, goal) {
  const isGain = goal === "strength" || goal === "hypertrophy";
  const isCut = goal === "weight_loss";

  return [
    {
      icon: "☀️", title: "Petit-déjeuner",
      kcal: Math.round(kcal * 0.25),
      items: isGain
        ? ["Flocons d'avoine (80g) + lait entier", "Œufs entiers brouillés (3)", "Banane + beurre de cacahuète (20g)"]
        : isCut
        ? ["Œufs brouillés (3)", "Pain complet (1 tranche)", "Yaourt grec 0% (150g)"]
        : ["Flocons d'avoine (60g) + lait demi-écrémé", "Œufs (2) + blanc (2)", "Fruits rouges"],
    },
    {
      icon: "🍽", title: "Déjeuner",
      kcal: Math.round(kcal * 0.35),
      items: isGain
        ? ["Riz blanc cuit (200g)", "Poulet entier (200g) ou steak", "Avocat + légumes vapeur", "Huile d'olive (1 cs)"]
        : isCut
        ? ["Riz basmati cuit (150g)", "Blanc de poulet (200g)", "Légumes verts en quantité libre"]
        : ["Quinoa cuit (150g)", "Saumon (150g) ou poulet", "Légumes rôtis + huile d'olive (1cc)"],
    },
    {
      icon: "🏋️", title: "Collation pré/post workout",
      kcal: Math.round(kcal * 0.15),
      items: isGain
        ? ["Shake protéiné (30g) + lait", "Flocons d'avoine (40g) ou riz cakes", "Banane"]
        : isCut
        ? ["Yaourt grec 0% (200g) + fruits rouges", "Shake protéiné si besoin"]
        : ["Shake protéiné (25g)", "Pomme + amandes (20g)"],
    },
    {
      icon: "🌙", title: "Dîner",
      kcal: Math.round(kcal * 0.25),
      items: isGain
        ? ["Patate douce (200g) ou pâtes", "Bœuf haché 5% (200g) ou thon", "Légumes sautés à l'huile d'olive"]
        : isCut
        ? ["Courgettes / haricots verts en abondance", "Poisson blanc (200g) ou tofu", "Salade verte"]
        : ["Patate douce (150g)", "Œufs entiers (2) + blancs (2)", "Légumes vapeur"],
    },
  ];
}

// ── DATA UI ───────────────────────────────────────────────────────────────────
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
  { id: "gym",        label: "Salle complète" },
  { id: "barbell",    label: "Barre olympique" },
  { id: "dumbbells",  label: "Haltères" },
  { id: "cables",     label: "Câbles / Poulies" },
  { id: "machines",   label: "Machines guidées" },
  { id: "bodyweight", label: "Poids du corps" },
];

const AVATARS = ["🏋️","💪","🔥","⚡","🦁","🐺","🦅","🎯","🏆","🌟"];

// ── STORAGE ───────────────────────────────────────────────────────────────────
async function loadPrograms() {
  try { const r = await window.storage.get("gainz:programs"); return r ? JSON.parse(r.value) : []; } catch { return []; }
}
async function savePrograms(list) { try { await window.storage.set("gainz:programs", JSON.stringify(list)); } catch {} }

async function loadProfile() {
  try { const r = await window.storage.get("gainz:profile"); return r ? JSON.parse(r.value) : null; } catch { return null; }
}
async function saveProfile(p) { try { await window.storage.set("gainz:profile", JSON.stringify(p)); } catch {} }

async function loadHistory() {
  try { const r = await window.storage.get("gainz:history"); return r ? JSON.parse(r.value) : []; } catch { return []; }
}
async function saveHistory(h) { try { await window.storage.set("gainz:history", JSON.stringify(h)); } catch {} }

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("create");
  const [savedPrograms, setSavedPrograms] = useState([]);
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [dailyView, setDailyView] = useState(null);

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  useEffect(() => {
    loadPrograms().then(setSavedPrograms);
    loadProfile().then(setProfile);
    loadHistory().then(setHistory);
  }, []);

  const handleSave = async (program) => {
    const p = { ...program, id: Date.now().toString(), savedAt: new Date().toLocaleDateString("fr-FR") };
    const updated = [p, ...savedPrograms];
    setSavedPrograms(updated);
    await savePrograms(updated);
    setDailyView(p);
    setTab("programs");
  };

  const handleDelete = async (id) => {
    const updated = savedPrograms.filter(p => p.id !== id);
    setSavedPrograms(updated);
    await savePrograms(updated);
    if (dailyView?.id === id) setDailyView(null);
  };

  const handleProfileSave = async (p) => {
    setProfile(p);
    await saveProfile(p);
  };

  const handleWorkoutDone = async (programName, dayName) => {
    const entry = { id: Date.now().toString(), programName, dayName, date: new Date().toLocaleDateString("fr-FR"), ts: Date.now() };
    const updated = [entry, ...history].slice(0, 60);
    setHistory(updated);
    await saveHistory(updated);
  };

  if (dailyView) {
    return (
      <div className="app">
        <DailyView
          program={dailyView}
          onBack={() => setDailyView(null)}
          onWorkoutDone={handleWorkoutDone}
        />
      </div>
    );
  }

  return (
    <div className="app">
      {tab === "create"   && <CreateView onSave={handleSave} profile={profile} />}
      {tab === "programs" && <ProgramsView programs={savedPrograms} onOpen={setDailyView} onDelete={handleDelete} />}
      {tab === "nutrition"&& <NutritionView profile={profile} onGoToProfile={() => setTab("profile")} />}
      {tab === "profile"  && <ProfileView profile={profile} history={history} onSave={handleProfileSave} />}

      <div className="bottom-nav">
        {[
          { id: "create",    icon: "✦", label: "Créer" },
          { id: "programs",  icon: "📋", label: "Programmes" },
          { id: "nutrition", icon: "🥗", label: "Nutrition" },
          { id: "profile",   icon: "👤", label: "Profil" },
        ].map(t => (
          <button key={t.id} className={`nav-tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
            <span className="nav-tab-icon">{t.icon}</span>
            <span className="nav-tab-label">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── CREATE VIEW ───────────────────────────────────────────────────────────────
function CreateView({ onSave, profile }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    muscles: [], goal: profile?.goal || "", level: "intermediate",
    equipment: [], daysPerWeek: 4, notes: "",
  });
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [expanded, setExpanded] = useState({});

  const toggle = (key, id) => setForm(f => ({
    ...f, [key]: f[key].includes(id) ? f[key].filter(x => x !== id) : [...f[key], id]
  }));

  const generate = async () => {
    setLoading(true); setLoadStep(0);
    await new Promise(r => setTimeout(r, 500));
    setLoadStep(1);
    await new Promise(r => setTimeout(r, 650));
    setLoadStep(2);
    await new Promise(r => setTimeout(r, 400));
    const p = generateProgram(form);
    setProgram(p); setExpanded({ 0: true }); setLoading(false); setStep("preview");
  };

  const reset = () => { setStep(1); setProgram(null); setForm({ muscles: [], goal: profile?.goal || "", level: "intermediate", equipment: [], daysPerWeek: 4, notes: "" }); };
  const LABELS = { 1: "MUSCLES", 2: "OBJECTIF", 3: "DÉTAILS" };

  return (
    <>
      <div className="app-header">
        <div className="logo-mark">
          <div className="logo-icon">G</div>
          <span className="logo-text">GAINZ</span>
        </div>
        <div className="header-badge">
          {step === "preview" ? <span className="success">Prêt ✓</span> : loading ? "..." : `${step} / 3`}
        </div>
      </div>

      {!loading && (
        <div className="progress-wrap">
          <div className="progress-steps-row">
            {[1,2,3].map(s => {
              const cur = step === "preview" ? 4 : Number(step);
              return <div key={s} className={`prog-seg ${s < cur ? "done" : s === cur ? "active" : ""}`} />;
            })}
          </div>
          <div className="progress-label">{step === "preview" ? "Aperçu du programme" : LABELS[step]}</div>
        </div>
      )}

      {loading && (
        <div className="page-content">
          <div className="loading-screen">
            <div className="loader-container"><div className="loader-ring" /><div className="loader-inner" /></div>
            <div className="loading-title">Calcul en cours</div>
            <div className="loading-subtitle">Optimisation des synergies musculaires et du volume</div>
            <div className="loading-items">
              {[
                { icon: "🧠", txt: "Analyse des groupes musculaires…" },
                { icon: "⚡", txt: "Optimisation des synergies PUSH / PULL / LEGS…" },
                { icon: "🏗", txt: "Assemblage du programme final…" },
              ].map((item, i) => (
                <div key={i} className={`loading-item ${loadStep === i ? "active" : loadStep > i ? "done" : ""}`}>
                  <span className="li-icon">{loadStep > i ? "✓" : item.icon}</span>
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
            <div className="page-title">Quels muscles<br />cibler ?</div>
            <div className="page-sub">L'algorithme organisera tes muscles en séances synergiques — pecs + triceps + épaules ensemble, par exemple.</div>
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
            <button className="btn-primary" disabled={!form.muscles.length} onClick={() => setStep(2)}>Suivant →</button>
          </div>
        </>
      )}

      {step === 2 && !loading && (
        <>
          <div className="page-content fade-up">
            <div className="page-title">Ton objectif<br />principal</div>
            <div className="page-sub">Cela définit les séries, répétitions et temps de repos.</div>
            <div className="goal-list">
              {GOALS.map(g => (
                <div key={g.id} className={`goal-card ${form.goal === g.id ? "selected" : ""}`} onClick={() => setForm(f => ({ ...f, goal: g.id }))}>
                  <span className="goal-emoji">{g.emoji}</span>
                  <div className="goal-text"><div className="goal-name">{g.label}</div><div className="goal-desc">{g.desc}</div></div>
                  <div className="goal-scheme">{g.scheme}</div>
                </div>
              ))}
            </div>
            <div className="section-label">Niveau actuel</div>
            <div className="chip-group">
              {LEVELS.map(l => (
                <div key={l.id} className={`chip ${form.level === l.id ? "selected" : ""}`} onClick={() => setForm(f => ({ ...f, level: l.id }))}>{l.label}</div>
              ))}
            </div>
          </div>
          <div className="action-bar">
            <button className="btn-primary" disabled={!form.goal} onClick={() => setStep(3)}>Suivant →</button>
            <button className="btn-ghost" onClick={() => setStep(1)}>← Retour</button>
          </div>
        </>
      )}

      {step === 3 && !loading && (
        <>
          <div className="page-content fade-up">
            <div className="page-title">Dernières<br />précisions</div>
            <div className="page-sub">Plus c'est précis, plus le programme sera adapté.</div>
            <div className="section-label">Séances par semaine</div>
            <div className="days-selector">
              {[2,3,4,5,6].map(d => (
                <div key={d} className={`day-btn ${form.daysPerWeek === d ? "selected" : ""}`} onClick={() => setForm(f => ({ ...f, daysPerWeek: d }))}>
                  {d}<span className="day-sub">jour{d>1?"s":""}</span>
                </div>
              ))}
            </div>
            <div className="section-label" style={{ marginTop: 22 }}>Équipement disponible</div>
            <div className="chip-group">
              {EQUIPMENT_UI.map(e => (
                <div key={e.id} className={`chip ${form.equipment.includes(e.id) ? "selected" : ""}`} onClick={() => toggle("equipment", e.id)}>{e.label}</div>
              ))}
            </div>
            <div className="section-label" style={{ marginTop: 22 }}>Notes / préférences</div>
            <textarea className="text-input" rows={2} placeholder="Ex : j'aime le squat, douleur au genou gauche…" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            <div className="info-box" style={{ marginTop: 16 }}>⚡ <strong>Génération hors-ligne</strong> — aucune connexion requise, aucune limite, instantané.</div>
          </div>
          <div className="action-bar">
            <button className="btn-primary" onClick={generate}>Générer mon programme ✦</button>
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
                  <div className="day-num-big">{String(i+1).padStart(2,"0")}</div>
                  <div className="day-header-text">
                    <div className="day-header-name">{day.name}</div>
                    <div className="day-header-muscles">{day.muscles}</div>
                  </div>
                  <div className="day-chevron">▾</div>
                </div>
                <div className="ex-list">
                  {day.isRest ? (
                    <div className="rest-content"><span className="rest-icon-sm">😴</span>Repos & récupération — les muscles grandissent ici.</div>
                  ) : day.exercises?.map((ex, j) => (
                    <div key={j} className="ex-row">
                      <div className="ex-idx">{j+1}</div>
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
            <button className="btn-primary" onClick={() => onSave(program)}>Sauvegarder ce programme ✦</button>
            <button className="btn-ghost" onClick={reset}>Recommencer</button>
          </div>
        </>
      )}
    </>
  );
}

// ── PROGRAMS VIEW ─────────────────────────────────────────────────────────────
function ProgramsView({ programs, onOpen, onDelete }) {
  return (
    <>
      <div className="app-header">
        <div className="logo-mark"><div className="logo-icon">G</div><span className="logo-text">GAINZ</span></div>
        <div className="header-badge">{programs.length} programme{programs.length !== 1 ? "s" : ""}</div>
      </div>
      <div className="page-content">
        {programs.length === 0 ? (
          <div className="empty-state fade-up">
            <div className="empty-icon">📋</div>
            <div className="empty-title">Aucun programme</div>
            <div className="empty-sub">Génère ton premier programme dans l'onglet Créer et sauvegarde-le ici.</div>
          </div>
        ) : (
          <div className="fade-up">
            <div className="programs-header">
              <div className="programs-title">Mes Programmes</div>
              <div className="programs-count">{programs.length} programme{programs.length > 1 ? "s" : ""} sauvegardé{programs.length > 1 ? "s" : ""}</div>
            </div>
            {programs.map(prog => (
              <div key={prog.id} className="prog-card" onClick={() => onOpen(prog)}>
                <div className="prog-card-name">{prog.programName}</div>
                <div className="prog-card-meta">Créé le {prog.savedAt} · {prog.days?.length || 0} jours</div>
                <div className="prog-card-badges">
                  {[prog.goal, prog.level, prog.frequency].filter(Boolean).map((b, i) => (
                    <div key={i} className="prog-card-badge">{b}</div>
                  ))}
                </div>
                <button className="prog-delete" onClick={e => { e.stopPropagation(); onDelete(prog.id); }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ── DAILY VIEW ────────────────────────────────────────────────────────────────
function DailyView({ program, onBack, onWorkoutDone }) {
  const [dayIdx, setDayIdx] = useState(0);
  const [completed, setCompleted] = useState({});
  const [timerActive, setTimerActive] = useState(false);
  const [timerSec, setTimerSec] = useState(0);
  const [timerTotal, setTimerTotal] = useState(0);
  const [nextExName, setNextExName] = useState("");
  const [sessionDone, setSessionDone] = useState(false);
  const navRef = useRef(null);
  const timerRef = useRef(null);

  const day = program.days?.[dayIdx];
  const totalEx = day?.exercises?.length || 0;
  const doneEx = day?.exercises?.filter((_, j) => completed[`${dayIdx}-${j}`]).length || 0;

  useEffect(() => {
    const el = navRef.current?.querySelector(".active-day");
    if (el) el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [dayIdx]);

  useEffect(() => {
    if (totalEx > 0 && doneEx === totalEx && !sessionDone) {
      setSessionDone(true);
      onWorkoutDone(program.programName, day?.name);
    }
  }, [doneEx, totalEx]);

  const startTimer = useCallback((sec, nextName) => {
    setTimerTotal(sec);
    setTimerSec(sec);
    setNextExName(nextName || "");
    setTimerActive(true);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimerSec(s => {
        if (s <= 1) { clearInterval(timerRef.current); setTimerActive(false); return 0; }
        return s - 1;
      });
    }, 1000);
  }, []);

  const skipTimer = () => { clearInterval(timerRef.current); setTimerActive(false); };

  const toggleEx = (j, ex) => {
    const k = `${dayIdx}-${j}`;
    const wasDone = !!completed[k];
    setCompleted(p => ({ ...p, [k]: !wasDone }));
    if (!wasDone && ex.restSec) {
      const nextEx = day?.exercises?.[j + 1];
      startTimer(ex.restSec, nextEx?.name);
    }
  };

  const getDayShort = (d) => d.isRest ? "REPOS" : d.name?.split(/[—\-]/)[0]?.trim()?.slice(0, 6)?.toUpperCase() || `J${d.dayNumber}`;

  // Ring math for SVG timer
  const circumference = 2 * Math.PI * 52;
  const progress = timerTotal > 0 ? timerSec / timerTotal : 1;
  const dashOffset = circumference * (1 - progress);

  return (
    <>
      {timerActive && (
        <div className="rest-timer-overlay" onClick={(e) => e.target === e.currentTarget && skipTimer()}>
          <div className="timer-ring-wrap">
            <svg className="timer-svg" width="160" height="160" viewBox="0 0 120 120">
              <circle className="timer-track" cx="60" cy="60" r="52" />
              <circle
                className="timer-progress"
                cx="60" cy="60" r="52"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
              />
            </svg>
            <div className="timer-num">
              <div className="timer-seconds">{timerSec}</div>
              <div className="timer-label-sm">sec</div>
            </div>
          </div>
          <div className="timer-title">Temps de repos</div>
          {nextExName && <div className="timer-next">Prochain : <strong>{nextExName}</strong></div>}
          <button className="timer-skip" onClick={skipTimer}>Passer →</button>
        </div>
      )}

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
            <div key={i} className={`day-pill ${i === dayIdx ? "active-day" : ""} ${d.isRest ? "rest-pill" : ""}`} onClick={() => { setDayIdx(i); setSessionDone(false); }}>
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
            <div className="rest-view-title">Jour de repos</div>
            <div className="rest-view-sub">La récupération, c'est là que tes muscles grandissent vraiment.</div>
            <div className="rest-tips">
              {[
                { icon: "💧", text: "Hydrate-toi bien (2-3L d'eau minimum)" },
                { icon: "🥩", text: "Maintiens ton apport en protéines (1.6-2g/kg)" },
                { icon: "😴", text: "Vise 7-9h de sommeil pour la récupération" },
                { icon: "🚶", text: "Une marche légère de 20-30min est bénéfique" },
              ].map((t, i) => <div key={i} className="rest-tip-item"><span>{t.icon}</span>{t.text}</div>)}
            </div>
          </div>
        ) : (
          <div className="fade-up">
            {sessionDone && (
              <div className="card scale-in" style={{ background: "linear-gradient(135deg, var(--surface) 0%, rgba(74,222,128,0.08) 100%)", border: "1px solid rgba(74,222,128,0.3)", marginBottom: 14, textAlign: "center" }}>
                <div style={{ fontSize: 36, marginBottom: 6 }}>🏆</div>
                <div className="card-title" style={{ color: "var(--green)" }}>Séance terminée !</div>
                <div className="card-sub">Excellent travail. Repos et récupération maintenant.</div>
              </div>
            )}

            <div className="session-header">
              <div className="session-title">{day?.name}</div>
              <div className="session-muscles">{day?.muscles}</div>
              <div className="session-ex-count">{totalEx} exercice{totalEx > 1 ? "s" : ""}</div>
            </div>

            {totalEx > 0 && (
              <div className="session-progress">
                <div className="sp-bar-wrap"><div className="sp-bar" style={{ width: `${(doneEx / totalEx) * 100}%` }} /></div>
                <div className="sp-text"><span>{doneEx}</span>/{totalEx}</div>
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
                  <button className="ex-done-btn" onClick={() => toggleEx(j, ex)}>
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

// ── NUTRITION VIEW ────────────────────────────────────────────────────────────
function NutritionView({ profile, onGoToProfile }) {
  const nutrition = profile ? calculateNutrition(profile) : null;
  const goalObj = profile ? GOALS.find(g => g.id === profile.goal) : null;

  if (!profile || !nutrition) {
    return (
      <>
        <div className="app-header">
          <div className="logo-mark"><div className="logo-icon">G</div><span className="logo-text">GAINZ</span></div>
          <div className="header-badge">Nutrition</div>
        </div>
        <div className="page-content fade-up">
          <div className="no-profile-banner">
            <div className="no-profile-banner-title">Configure ton profil d'abord</div>
            <div className="no-profile-banner-sub">Renseigne ton poids, ta taille et ton objectif dans la section Profil pour calculer tes besoins nutritionnels.</div>
          </div>
          <button className="btn-primary" style={{ width: "100%" }} onClick={onGoToProfile}>Aller au profil →</button>
        </div>
      </>
    );
  }

  const { targetKcal, protein, fat, carbs, water } = nutrition;
  const maxMacro = Math.max(protein, carbs, fat);
  const meals = getMealPlan(targetKcal, profile.goal);

  return (
    <>
      <div className="app-header">
        <div className="logo-mark"><div className="logo-icon">G</div><span className="logo-text">GAINZ</span></div>
        <div className="header-badge">Nutrition</div>
      </div>
      <div className="page-content fade-up">
        <div className="macro-hero">
          <div className="macro-hero-title">Apport journalier cible</div>
          <div className="macro-kcal">{targetKcal.toLocaleString()} <span>kcal/jour</span></div>
          <div className="macro-goal-label">{goalObj?.label} · {profile.weight}kg · {profile.height}cm</div>

          <div className="macro-bars">
            {[
              { label: "Protéines", val: protein, unit: "g", color: "#60A5FA", pct: protein / maxMacro },
              { label: "Glucides", val: carbs, unit: "g", color: "#C9A84C", pct: carbs / maxMacro },
              { label: "Lipides", val: fat, unit: "g", color: "#A78BFA", pct: fat / maxMacro },
            ].map(m => (
              <div key={m.label} className="macro-bar-row">
                <div className="macro-bar-label">{m.label}</div>
                <div className="macro-bar-wrap"><div className="macro-bar-fill" style={{ width: `${m.pct * 100}%`, background: m.color }} /></div>
                <div className="macro-bar-val">{m.val}g</div>
              </div>
            ))}
          </div>
        </div>

        <div className="macro-cards">
          {[
            { label: "Protéines", val: protein, unit: "g", color: "#60A5FA" },
            { label: "Glucides", val: carbs, unit: "g", color: "#C9A84C" },
            { label: "Lipides", val: fat, unit: "g", color: "#A78BFA" },
          ].map(m => (
            <div key={m.label} className="macro-card">
              <div className="macro-card-val" style={{ color: m.color }}>{m.val}<span>{m.unit}</span></div>
              <div className="macro-card-label">{m.label}</div>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 20 }}>💧</span>
            <div>
              <div className="card-title">{water}L d'eau par jour</div>
              <div className="card-sub">Basé sur ton poids corporel (35ml/kg)</div>
            </div>
          </div>
        </div>

        <div className="section-label">Plan alimentaire type</div>
        {meals.map((meal, i) => (
          <div key={i} className="meal-card">
            <div className="meal-card-header">
              <span className="meal-card-icon">{meal.icon}</span>
              <div>
                <div className="meal-card-title">{meal.title}</div>
                <div className="meal-card-kcal">~{meal.kcal} kcal</div>
              </div>
            </div>
            <div className="meal-items">
              {meal.items.map((item, j) => <div key={j} className="meal-item">{item}</div>)}
            </div>
          </div>
        ))}

        <div style={{ height: 8 }} />
      </div>
    </>
  );
}

// ── PROFILE VIEW ──────────────────────────────────────────────────────────────
function ProfileView({ profile, history, onSave }) {
  const [editing, setEditing] = useState(!profile);
  const [form, setForm] = useState(profile || { name: "", age: "", weight: "", height: "", sex: "m", activity: "moderate", goal: "hypertrophy", avatar: "🏋️" });
  const [avatarPicker, setAvatarPicker] = useState(false);

  const handleSave = () => { onSave({ ...form }); setEditing(false); };

  const streak = (() => {
    if (!history.length) return 0;
    const today = new Date(); today.setHours(0,0,0,0);
    let s = 0, d = new Date(today);
    const dates = [...new Set(history.map(h => h.date))];
    while (true) {
      const str = d.toLocaleDateString("fr-FR");
      if (dates.includes(str)) { s++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return s;
  })();

  if (editing) {
    return (
      <>
        <div className="app-header">
          <div className="logo-mark"><div className="logo-icon">G</div><span className="logo-text">GAINZ</span></div>
          <div className="header-badge">Profil</div>
        </div>
        <div className="page-content fade-up">
          <div className="page-title">Ton profil</div>
          <div className="page-sub">Ces informations permettent de personnaliser ton programme et tes apports nutritionnels.</div>

          {avatarPicker && (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: "var(--text3)", marginBottom: 10, fontFamily: "Outfit" }}>Choisir un avatar</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {AVATARS.map(a => (
                  <div key={a} onClick={() => { setForm(f => ({ ...f, avatar: a })); setAvatarPicker(false); }}
                    style={{ width: 44, height: 44, background: form.avatar === a ? "var(--gold-dim)" : "var(--surface2)", border: `1px solid ${form.avatar === a ? "var(--gold)" : "var(--border)"}`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, cursor: "pointer" }}>
                    {a}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
            <div className="profile-avatar" onClick={() => setAvatarPicker(v => !v)}>{form.avatar || "🏋️"}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text2)" }}>Appuie pour changer</div>
              <div style={{ fontSize: 12, color: "var(--text3)" }}>Ton avatar GAINZ</div>
            </div>
          </div>

          <div className="section-label">Informations personnelles</div>

          <div className="input-group" style={{ marginBottom: 10 }}>
            <div className="input-label">Prénom</div>
            <input className="input-field" type="text" placeholder="Ex : Alex" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>

          <div className="input-row">
            <div className="input-group">
              <div className="input-label">Âge</div>
              <input className="input-field" type="number" placeholder="25" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} />
            </div>
            <div className="input-group">
              <div className="input-label">Sexe</div>
              <select className="input-field" value={form.sex} onChange={e => setForm(f => ({ ...f, sex: e.target.value }))}>
                <option value="m">Homme</option>
                <option value="f">Femme</option>
              </select>
            </div>
          </div>

          <div className="input-row" style={{ marginTop: 10 }}>
            <div className="input-group">
              <div className="input-label">Poids (kg)</div>
              <input className="input-field" type="number" placeholder="75" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} />
            </div>
            <div className="input-group">
              <div className="input-label">Taille (cm)</div>
              <input className="input-field" type="number" placeholder="178" value={form.height} onChange={e => setForm(f => ({ ...f, height: e.target.value }))} />
            </div>
          </div>

          <div className="section-label">Niveau d'activité</div>
          <div className="chip-group">
            {[
              { id: "sedentary", label: "Sédentaire" },
              { id: "light", label: "Légèrement actif" },
              { id: "moderate", label: "Modérément actif" },
              { id: "active", label: "Très actif" },
            ].map(a => (
              <div key={a.id} className={`chip ${form.activity === a.id ? "selected" : ""}`} onClick={() => setForm(f => ({ ...f, activity: a.id }))}>{a.label}</div>
            ))}
          </div>

          <div className="section-label">Objectif principal</div>
          <div className="chip-group">
            {GOALS.map(g => (
              <div key={g.id} className={`chip ${form.goal === g.id ? "selected" : ""}`} onClick={() => setForm(f => ({ ...f, goal: g.id }))}>{g.emoji} {g.label}</div>
            ))}
          </div>

          <div style={{ height: 8 }} />
        </div>
        <div className="action-bar">
          <button className="btn-primary" disabled={!form.name || !form.weight || !form.height || !form.age} onClick={handleSave}>Sauvegarder le profil ✦</button>
          {profile && <button className="btn-ghost" onClick={() => setEditing(false)}>Annuler</button>}
        </div>
      </>
    );
  }

  const goalObj = GOALS.find(g => g.id === profile?.goal);

  return (
    <>
      <div className="app-header">
        <div className="logo-mark"><div className="logo-icon">G</div><span className="logo-text">GAINZ</span></div>
        <button className="btn-sm" onClick={() => setEditing(true)}>Modifier</button>
      </div>
      <div className="page-content fade-up">
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
          <div className="profile-avatar" style={{ cursor: "default" }}>{profile?.avatar || "🏋️"}</div>
          <div>
            <div className="profile-name">{profile?.name || "Athlète"}</div>
            <div className="profile-subtitle">{goalObj?.emoji} {goalObj?.label} · {profile?.level || "Intermédiaire"}</div>
          </div>
        </div>

        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-val">{profile?.weight || "—"}<span>kg</span></div>
            <div className="stat-lbl">Poids</div>
          </div>
          <div className="stat-card">
            <div className="stat-val">{profile?.height || "—"}<span>cm</span></div>
            <div className="stat-lbl">Taille</div>
          </div>
          <div className="stat-card">
            <div className="stat-val">{profile?.age || "—"}<span>ans</span></div>
            <div className="stat-lbl">Âge</div>
          </div>
          <div className="stat-card">
            <div className="stat-val">{history.length}</div>
            <div className="stat-lbl">Séances totales</div>
          </div>
        </div>

        <div className="streak-card">
          <span className="streak-icon">{streak > 2 ? "🔥" : "💪"}</span>
          <div className="streak-info">
            <div className="streak-num">{streak}</div>
            <div className="streak-label">jour{streak > 1 ? "s" : ""} de suite · Série en cours</div>
          </div>
        </div>

        {history.length > 0 && (
          <>
            <div className="section-label">Historique récent</div>
            {history.slice(0, 8).map(h => (
              <div key={h.id} className="history-item">
                <span className="history-icon">✅</span>
                <div className="history-info">
                  <div className="history-name">{h.dayName}</div>
                  <div className="history-meta">{h.programName}</div>
                </div>
                <div className="history-badge">{h.date}</div>
              </div>
            ))}
          </>
        )}

        {history.length === 0 && (
          <div className="card" style={{ textAlign: "center", marginTop: 16 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🏁</div>
            <div className="card-title">Commence ta première séance</div>
            <div className="card-sub" style={{ marginTop: 4 }}>Ton historique d'entraînement apparaîtra ici.</div>
          </div>
        )}

        <div style={{ height: 8 }} />
      </div>
    </>
  );
}