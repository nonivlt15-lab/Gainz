import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";

// ── STORAGE POLYFILL ──────────────────────────────────────────────────────────
if (typeof window !== "undefined" && !window.storage) {
  window.storage = {
    get: async (k) => { try { const v = localStorage.getItem(k); return v !== null ? { value: v } : null; } catch { return null; } },
    set: async (k, v) => { try { localStorage.setItem(k, String(v)); return { key: k, value: v }; } catch { return null; } },
    delete: async (k) => { try { localStorage.removeItem(k); return { key: k, deleted: true }; } catch { return null; } },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// i18n — Traductions FR / EN
// ─────────────────────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  fr: {
    appName: "GAINZ",
    // Nav
    navCreate: "Créer", navPrograms: "Programmes", navNutrition: "Nutrition", navProfile: "Profil",
    // Create
    step1Title: "Quels muscles\ncibler ?",
    step1Sub: "L'algorithme organisera tes muscles en séances synergiques — pecs + triceps + épaules ensemble.",
    step2Title: "Ton objectif\nprincipal",
    step2Sub: "Détermine les séries, répétitions et temps de repos.",
    step3Title: "Dernières\nprécisions",
    step3Sub: "Plus c'est précis, plus le programme sera adapté.",
    stepLabel1: "Muscles", stepLabel2: "Objectif", stepLabel3: "Détails",
    stepOf: "/ 3",
    btnNext: "Suivant →", btnBack: "← Retour", btnGenerate: "Générer mon programme ✦", btnRestart: "Recommencer",
    btnSave: "Sauvegarder ce programme ✦",
    previewLabel: "Aperçu du programme",
    ready: "Prêt ✓",
    loadTitle: "Calcul en cours",
    loadSub: "Optimisation des synergies musculaires",
    loadStep1: "Analyse des groupes musculaires…",
    loadStep2: "Optimisation des synergies…",
    loadStep3: "Assemblage du programme final…",
    sessionsPerWeek: "Séances par semaine",
    equipment: "Équipement disponible",
    notes: "Notes / préférences",
    notesPlaceholder: "Ex : j'aime le squat, douleur au genou gauche…",
    offlineBadge: "⚡ Génération 100% hors-ligne — aucune limite, aucun coût.",
    level: "Niveau actuel",
    // Programs
    programsTitle: "Mes Programmes",
    programsEmpty: "Aucun programme",
    programsEmptySub: "Génère ton premier programme dans Créer.",
    // Daily
    restDay: "Jour de repos",
    restDaySub: "La récupération c'est là que tes muscles grandissent vraiment.",
    sessionDoneTitle: "Séance terminée !",
    sessionDoneSub: "Excellent travail. Repos et récupération maintenant.",
    markDone: "Marquer comme terminé",
    markUndo: "✓ Terminé — Annuler",
    restTimer: "Temps de repos",
    timerNext: "Prochain :",
    timerSkip: "Passer →",
    sets: "Séries", reps: "Reps", rest: "Repos",
    exercises: "exercice",
    exercisesPlural: "exercices",
    // Nutrition
    nutritionTitle: "Nutrition",
    noProfileTitle: "Configure ton profil d'abord",
    noProfileSub: "Renseigne ton poids, ta taille et ton objectif dans Profil pour calculer tes besoins nutritionnels.",
    goToProfile: "Aller au profil →",
    dailyTarget: "Apport journalier cible",
    kcalDay: "kcal/jour",
    macroProteins: "Protéines", macroCarbs: "Glucides", macroFats: "Lipides",
    waterDay: "L d'eau par jour",
    waterSub: "Basé sur ton poids corporel (35ml/kg)",
    mealPlan: "Plan alimentaire type",
    // Profile
    profileTitle: "Profil",
    editBtn: "Modifier",
    saveProfile: "Sauvegarder le profil ✦",
    cancelBtn: "Annuler",
    personalInfo: "Informations personnelles",
    firstNameLabel: "Prénom", firstNamePlaceholder: "Ex : Alex",
    ageLabel: "Âge", sexLabel: "Sexe", weightLabel: "Poids (kg)", heightLabel: "Taille (cm)",
    sexM: "Homme", sexF: "Femme",
    activityLevel: "Niveau d'activité",
    bodyGoal: "Objectif physique",
    totalSessions: "Séances totales",
    streak: "jour de suite · Série en cours",
    recentHistory: "Historique récent",
    noHistory: "Commence ta première séance",
    noHistorySub: "Ton historique apparaîtra ici.",
    avatarPrompt: "Appuie pour changer",
    avatarSub: "Ton avatar GAINZ",
    // Settings
    settingsTitle: "Paramètres",
    languageLabel: "Langue / Language",
    // Wendler
    wendlerWeek: "Semaine", wendlerDeload: "Déload",
    wendlerNote: "Note",
  },
  en: {
    appName: "GAINZ",
    navCreate: "Create", navPrograms: "Programs", navNutrition: "Nutrition", navProfile: "Profile",
    step1Title: "Which muscles\nto target?",
    step1Sub: "The algorithm will organize your muscles into synergistic sessions — chest + triceps + shoulders together.",
    step2Title: "Your main\ngoal",
    step2Sub: "Defines sets, reps, and rest periods.",
    step3Title: "Final\ndetails",
    step3Sub: "The more precise, the more tailored the program.",
    stepLabel1: "Muscles", stepLabel2: "Goal", stepLabel3: "Details",
    stepOf: "/ 3",
    btnNext: "Next →", btnBack: "← Back", btnGenerate: "Generate my program ✦", btnRestart: "Restart",
    btnSave: "Save this program ✦",
    previewLabel: "Program preview",
    ready: "Ready ✓",
    loadTitle: "Calculating",
    loadSub: "Optimizing muscle synergies",
    loadStep1: "Analyzing muscle groups…",
    loadStep2: "Optimizing synergies…",
    loadStep3: "Building final program…",
    sessionsPerWeek: "Sessions per week",
    equipment: "Available equipment",
    notes: "Notes / preferences",
    notesPlaceholder: "E.g.: I like squats, left knee issue…",
    offlineBadge: "⚡ 100% offline generation — unlimited, no cost.",
    level: "Current level",
    programsTitle: "My Programs",
    programsEmpty: "No programs yet",
    programsEmptySub: "Generate your first program in Create.",
    restDay: "Rest day",
    restDaySub: "Recovery is where your muscles actually grow.",
    sessionDoneTitle: "Workout complete!",
    sessionDoneSub: "Excellent work. Rest and recover now.",
    markDone: "Mark as complete",
    markUndo: "✓ Done — Undo",
    restTimer: "Rest time",
    timerNext: "Next:",
    timerSkip: "Skip →",
    sets: "Sets", reps: "Reps", rest: "Rest",
    exercises: "exercise",
    exercisesPlural: "exercises",
    nutritionTitle: "Nutrition",
    noProfileTitle: "Set up your profile first",
    noProfileSub: "Enter your weight, height and goal in Profile to calculate your nutritional needs.",
    goToProfile: "Go to profile →",
    dailyTarget: "Daily calorie target",
    kcalDay: "kcal/day",
    macroProteins: "Proteins", macroCarbs: "Carbs", macroFats: "Fats",
    waterDay: "L of water per day",
    waterSub: "Based on your body weight (35ml/kg)",
    mealPlan: "Sample meal plan",
    profileTitle: "Profile",
    editBtn: "Edit",
    saveProfile: "Save profile ✦",
    cancelBtn: "Cancel",
    personalInfo: "Personal information",
    firstNameLabel: "First name", firstNamePlaceholder: "E.g.: Alex",
    ageLabel: "Age", sexLabel: "Sex", weightLabel: "Weight (kg)", heightLabel: "Height (cm)",
    sexM: "Male", sexF: "Female",
    activityLevel: "Activity level",
    bodyGoal: "Physical goal",
    totalSessions: "Total sessions",
    streak: "day streak",
    recentHistory: "Recent history",
    noHistory: "Start your first workout",
    noHistorySub: "Your training history will appear here.",
    avatarPrompt: "Tap to change",
    avatarSub: "Your GAINZ avatar",
    settingsTitle: "Settings",
    languageLabel: "Language / Langue",
    wendlerWeek: "Week", wendlerDeload: "Deload",
    wendlerNote: "Note",
  },
};

// Language context
const LangContext = createContext("fr");
function useLang() {
  const lang = useContext(LangContext);
  return (key) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.fr[key] ?? key;
}

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

  :root {
    --bg:#0C0C0E; --bg2:#111114; --surface:#161618; --surface2:#1E1E22; --surface3:#26262C;
    --border:#2C2C34; --border2:#3A3A46;
    --gold:#C9A84C; --gold2:#E8C96A; --gold3:#F5DFA0;
    --gold-dim:rgba(201,168,76,0.10); --gold-glow:rgba(201,168,76,0.18);
    --green:#4ADE80; --green-dim:rgba(74,222,128,0.08);
    --red:#F87171; --blue:#60A5FA; --purple:#A78BFA;
    --text:#F5F5F7; --text2:#A1A1AA; --text3:#71717A;
    --r:16px; --r-sm:10px; --r-lg:22px;
  }

  /* ── LIGHT MODE ─────────────────────────────────────────────────────── */
  body.light-mode {
    --bg:#F8F8F7; --bg2:#F1F0EE; --surface:#FFFFFF; --surface2:#F3F2F0; --surface3:#EAEAE8;
    --border:#E0DED8; --border2:#CCCAC2;
    --gold:#A8761E; --gold2:#C9963A; --gold3:#8A5F10;
    --gold-dim:rgba(168,118,30,0.10); --gold-glow:rgba(168,118,30,0.16);
    --green:#16A34A; --green-dim:rgba(22,163,74,0.08);
    --red:#DC2626; --blue:#2563EB; --purple:#7C3AED;
    --text:#1A1A18; --text2:#4A4A46; --text3:#888880;
  }

  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html{-webkit-text-size-adjust:100%}

  body{
    background:var(--bg);color:var(--text);
    font-family:'DM Sans',sans-serif;
    -webkit-font-smoothing:antialiased;
    overflow:hidden;height:100vh;
    padding-top:env(safe-area-inset-top);
  }

  .app{
    max-width:430px;margin:0 auto;
    height:100vh;height:100dvh;
    display:flex;flex-direction:column;
    background:var(--bg);overflow:hidden;
  }

  /* HEADER */
  .app-header{
    padding:18px 20px 14px;background:var(--bg);
    border-bottom:1px solid var(--border);flex-shrink:0;
    display:flex;align-items:center;justify-content:space-between;
  }

  .logo-mark{display:flex;align-items:center;gap:9px}

  .logo-icon{
    width:30px;height:30px;background:var(--gold);border-radius:8px;
    display:flex;align-items:center;justify-content:center;
    font-family:'Outfit',sans-serif;font-size:15px;font-weight:900;
    color:#0C0C0E;letter-spacing:-0.5px;flex-shrink:0;
  }

  .logo-text{font-family:'Outfit',sans-serif;font-size:19px;font-weight:700;letter-spacing:0.8px;color:var(--text)}

  .header-badge{font-size:11px;font-weight:600;color:var(--text3);font-family:'Outfit',sans-serif}
  .header-badge.success{color:var(--green)}

  /* BOTTOM NAV */
  .bottom-nav{
    display:flex;margin:0 14px;
    margin-bottom:calc(14px + env(safe-area-inset-bottom));
    background:var(--surface);border:1px solid var(--border);
    border-radius:20px;padding:5px;flex-shrink:0;gap:2px;
  }

  .nav-tab{
    flex:1;padding:9px 4px 8px;text-align:center;
    cursor:pointer;border:none;background:transparent;
    border-radius:15px;transition:all 0.18s;
    -webkit-tap-highlight-color:transparent;
  }

  .nav-tab.active{background:var(--surface2)}
  .nav-tab-icon{font-size:16px;line-height:1;display:block;margin-bottom:3px}
  .nav-tab-label{font-size:9px;font-weight:600;letter-spacing:0.6px;text-transform:uppercase;color:var(--text3);transition:color 0.2s;font-family:'Outfit',sans-serif}
  .nav-tab.active .nav-tab-label{color:var(--gold)}

  /* SCROLL */
  .page-content{flex:1;overflow-y:auto;padding:20px 20px 4px;-webkit-overflow-scrolling:touch}
  .page-content::-webkit-scrollbar{display:none}

  /* PROGRESS */
  .progress-wrap{padding:11px 20px 13px;border-bottom:1px solid var(--border);flex-shrink:0}
  .progress-steps-row{display:flex;gap:4px;margin-bottom:7px}
  .prog-seg{flex:1;height:2px;border-radius:2px;background:var(--surface2);transition:background 0.4s}
  .prog-seg.done{background:rgba(201,168,76,0.4)}
  .prog-seg.active{background:var(--gold)}
  .progress-label{font-size:10px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:var(--text3);font-family:'Outfit',sans-serif}

  /* TYPOGRAPHY */
  .page-title{font-family:'Outfit',sans-serif;font-size:30px;font-weight:800;line-height:1.1;color:var(--text);margin-bottom:6px;letter-spacing:-0.5px;white-space:pre-line}
  .page-sub{font-size:13px;color:var(--text3);margin-bottom:22px;line-height:1.55}
  .section-label{font-family:'Outfit',sans-serif;font-size:10px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:var(--text3);margin-bottom:9px;margin-top:22px}
  .section-label:first-child{margin-top:0}

  /* MUSCLE GRID — no emoji, clean like goal cards */
  .muscle-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .muscle-grid.single{grid-template-columns:1fr}

  .muscle-card{
    background:var(--surface);border:1px solid var(--border);border-radius:var(--r);
    padding:13px 10px 11px;cursor:pointer;transition:all 0.15s;
    position:relative;overflow:hidden;
    user-select:none;-webkit-tap-highlight-color:transparent;
    display:flex;flex-direction:column;align-items:center;gap:5px;min-height:84px;justify-content:center;
  }

  .muscle-card::before{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:var(--border);transition:background 0.2s}
  .muscle-card.selected::before{background:var(--gold)}
  .muscle-card:active{transform:scale(0.96)}
  .muscle-card.selected{border-color:var(--gold);background:var(--gold-dim)}
  .muscle-card-svg{color:var(--text3);flex-shrink:0;transition:color 0.2s}
  .muscle-card.selected .muscle-card-svg{color:var(--gold)}
  .muscle-label{font-size:12px;font-weight:600;color:var(--text2);text-align:center;font-family:'Outfit',sans-serif;letter-spacing:0.2px}
  .muscle-card.selected .muscle-label{color:var(--gold)}
  .muscles-hint{margin-top:10px;font-size:12px;color:var(--text3);text-align:center}
  .muscles-hint span{color:var(--gold2);font-weight:600}

  /* STRENGTH METHOD CARDS */
  .method-list{display:flex;flex-direction:column;gap:8px}

  .method-card{
    background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);
    padding:15px 16px;cursor:pointer;transition:all 0.15s;
    position:relative;overflow:hidden;
    user-select:none;-webkit-tap-highlight-color:transparent;
  }

  .method-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--border);border-radius:0 2px 2px 0;transition:background 0.2s}
  .method-card.selected::before{background:var(--gold)}
  .method-card:active{transform:scale(0.98)}
  .method-card.selected{border-color:var(--gold);background:var(--gold-dim)}

  .method-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:6px;padding-left:10px}
  .method-name{font-family:'Outfit',sans-serif;font-size:15px;font-weight:700;color:var(--text2)}
  .method-card.selected .method-name{color:var(--gold)}
  .method-author{font-size:11px;color:var(--text3);margin-top:2px}
  .method-badge{
    background:var(--surface2);border-radius:6px;padding:3px 9px;
    font-family:'Outfit',sans-serif;font-size:10px;font-weight:700;
    color:var(--text3);white-space:nowrap;letter-spacing:0.5px;flex-shrink:0;
  }
  .method-card.selected .method-badge{background:var(--gold-glow);color:var(--gold2)}

  .method-desc{font-size:12px;color:var(--text3);line-height:1.5;margin-bottom:8px;padding-left:10px}
  .method-detail{
    background:var(--surface2);border-radius:8px;padding:8px 10px;
    font-size:11px;color:var(--text3);line-height:1.5;
    font-family:'Outfit',sans-serif;margin-left:10px;
  }
  .method-card.selected .method-detail{background:rgba(201,168,76,0.07);color:var(--text2)}

  .method-meta{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;padding-left:10px}
  .method-meta-pill{background:var(--surface2);border-radius:6px;padding:2px 8px;font-size:10px;font-weight:500;color:var(--text3);font-family:'Outfit',sans-serif}
  .method-card.selected .method-meta-pill{background:rgba(201,168,76,0.08);color:var(--gold2)}

  /* GOAL CARDS — no emojis, clean & professional */
  .goal-list{display:flex;flex-direction:column;gap:7px}

  .goal-card{
    background:var(--surface);border:1px solid var(--border);border-radius:var(--r);
    padding:14px 16px;cursor:pointer;transition:all 0.15s;
    user-select:none;-webkit-tap-highlight-color:transparent;
    position:relative;overflow:hidden;
  }

  .goal-card::before{
    content:'';position:absolute;left:0;top:0;bottom:0;
    width:3px;background:var(--border);border-radius:0 2px 2px 0;
    transition:background 0.2s;
  }

  .goal-card.selected::before{background:var(--gold)}
  .goal-card:active{transform:scale(0.98)}
  .goal-card.selected{border-color:var(--gold);background:var(--gold-dim)}

  .goal-card-inner{display:flex;align-items:center;gap:12px;padding-left:10px}
  .goal-name{font-family:'Outfit',sans-serif;font-size:14px;font-weight:700;color:var(--text2)}
  .goal-card.selected .goal-name{color:var(--gold)}
  .goal-desc{font-size:11px;color:var(--text3);margin-top:2px}
  .goal-text{flex:1}
  .goal-scheme{
    background:var(--surface2);border-radius:7px;padding:3px 9px;
    font-family:'Outfit',sans-serif;font-size:11px;font-weight:600;
    color:var(--text3);white-space:nowrap;flex-shrink:0;
  }
  .goal-card.selected .goal-scheme{background:var(--gold-glow);color:var(--gold2)}

  /* BODY COMP GOAL LIST — same clean style */
  .body-goal-list{display:flex;flex-direction:column;gap:7px}

  .body-goal-card{
    background:var(--surface);border:1px solid var(--border);border-radius:var(--r);
    padding:14px 16px;cursor:pointer;transition:all 0.15s;
    user-select:none;-webkit-tap-highlight-color:transparent;
    position:relative;overflow:hidden;
  }

  .body-goal-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--border);border-radius:0 2px 2px 0;transition:background 0.2s}
  .body-goal-card.selected::before{background:var(--gold)}
  .body-goal-card:active{transform:scale(0.98)}
  .body-goal-card.selected{border-color:var(--gold);background:var(--gold-dim)}

  .body-goal-inner{display:flex;align-items:center;gap:12px;padding-left:10px}
  .body-goal-name{font-family:'Outfit',sans-serif;font-size:14px;font-weight:700;color:var(--text2)}
  .body-goal-card.selected .body-goal-name{color:var(--gold)}
  .body-goal-desc{font-size:11px;color:var(--text3);margin-top:2px}
  .body-goal-text{flex:1}
  .body-goal-tag{
    background:var(--surface2);border-radius:7px;padding:3px 9px;
    font-family:'Outfit',sans-serif;font-size:10px;font-weight:700;
    color:var(--text3);white-space:nowrap;letter-spacing:0.5px;text-transform:uppercase;
  }
  .body-goal-card.selected .body-goal-tag{background:var(--gold-glow);color:var(--gold2)}

  /* CHIPS */
  .chip-group{display:flex;flex-wrap:wrap;gap:7px}

  .chip{
    background:var(--surface);border:1px solid var(--border);border-radius:100px;
    padding:7px 14px;font-size:13px;font-family:'DM Sans',sans-serif;
    cursor:pointer;transition:all 0.15s;
    user-select:none;-webkit-tap-highlight-color:transparent;color:var(--text2);
  }

  .chip:active{transform:scale(0.93)}
  .chip.selected{background:var(--gold-dim);border-color:var(--gold);color:var(--gold);font-weight:600}

  /* DAYS */
  .days-selector{display:flex;gap:6px}

  .day-btn{
    flex:1;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-sm);
    padding:12px 4px;color:var(--text2);font-family:'Outfit',sans-serif;
    font-size:20px;font-weight:700;cursor:pointer;text-align:center;transition:all 0.15s;
    user-select:none;-webkit-tap-highlight-color:transparent;
  }

  .day-btn .day-sub{font-family:'DM Sans',sans-serif;font-size:9px;font-weight:600;letter-spacing:0.5px;color:var(--text3);display:block;margin-top:2px}
  .day-btn.selected{background:var(--gold-dim);border-color:var(--gold);color:var(--gold)}
  .day-btn.selected .day-sub{color:var(--gold2)}

  /* INPUTS */
  .text-input{
    width:100%;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);
    padding:13px 15px;font-family:'DM Sans',sans-serif;font-size:14px;color:var(--text);
    resize:none;outline:none;transition:border-color 0.2s;line-height:1.5;
  }

  .text-input:focus{border-color:var(--gold)}
  .text-input::placeholder{color:var(--text3)}
  .input-row{display:flex;gap:9px}
  .input-group{flex:1;display:flex;flex-direction:column;gap:5px}
  .input-label{font-size:10px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;color:var(--text3);font-family:'Outfit',sans-serif}

  .input-field{
    background:var(--surface);border:1px solid var(--border);border-radius:var(--r-sm);
    padding:12px 13px;font-family:'DM Sans',sans-serif;font-size:15px;color:var(--text);
    outline:none;transition:border-color 0.2s;width:100%;
  }

  .input-field:focus{border-color:var(--gold)}
  .input-field::placeholder{color:var(--text3)}
  select.input-field{cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2371717A' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:30px}

  /* BUTTONS */
  .action-bar{
    padding:13px 20px 10px;background:var(--bg);
    border-top:1px solid var(--border);flex-shrink:0;
    display:flex;flex-direction:column;gap:8px;
  }

  .btn-primary{
    width:100%;background:var(--gold);color:#0C0C0E;border:none;border-radius:var(--r);
    padding:15px;font-family:'Outfit',sans-serif;font-size:16px;font-weight:700;
    letter-spacing:0.3px;cursor:pointer;transition:all 0.18s;
    display:flex;align-items:center;justify-content:center;gap:8px;
    -webkit-tap-highlight-color:transparent;
  }

  .btn-primary:hover{background:var(--gold2)}
  .btn-primary:active{transform:scale(0.98)}
  .btn-primary:disabled{opacity:0.3;cursor:not-allowed;transform:none}

  .btn-ghost{
    background:transparent;border:1px solid var(--border);border-radius:var(--r-sm);
    padding:12px;color:var(--text3);font-family:'DM Sans',sans-serif;
    font-size:13px;font-weight:500;cursor:pointer;width:100%;
    transition:all 0.15s;-webkit-tap-highlight-color:transparent;
  }

  .btn-ghost:hover{border-color:var(--border2);color:var(--text2)}

  .btn-sm{
    background:var(--surface2);border:1px solid var(--border);border-radius:9px;
    padding:7px 13px;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;
    color:var(--text2);cursor:pointer;transition:all 0.15s;white-space:nowrap;
    -webkit-tap-highlight-color:transparent;
  }

  /* CARDS */
  .card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:18px;margin-bottom:11px}
  .card-title{font-family:'Outfit',sans-serif;font-size:15px;font-weight:700;color:var(--text);margin-bottom:4px}
  .card-sub{font-size:13px;color:var(--text3);line-height:1.5}

  .info-box{background:var(--gold-dim);border:1px solid rgba(201,168,76,0.15);border-radius:var(--r);padding:12px 14px;font-size:13px;color:var(--text2);line-height:1.6;margin-top:16px}
  .info-box strong{color:var(--gold2)}

  /* LOADING */
  .loading-screen{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;gap:20px;text-align:center}
  .loader-container{position:relative;width:60px;height:60px}
  .loader-ring{width:60px;height:60px;border:2px solid var(--border);border-top-color:var(--gold);border-radius:50%;animation:spin 0.8s linear infinite;position:absolute}
  .loader-inner{width:40px;height:40px;border:1.5px solid transparent;border-bottom-color:rgba(201,168,76,0.3);border-radius:50%;animation:spin 1.4s linear infinite reverse;position:absolute;top:10px;left:10px}
  @keyframes spin{to{transform:rotate(360deg)}}
  .loading-title{font-family:'Outfit',sans-serif;font-size:21px;font-weight:700;color:var(--text);letter-spacing:-0.3px}
  .loading-subtitle{font-size:13px;color:var(--text3);line-height:1.5;max-width:230px}
  .loading-items{display:flex;flex-direction:column;gap:7px;width:100%;max-width:270px}
  .loading-item{display:flex;align-items:center;gap:9px;padding:11px 13px;border-radius:var(--r-sm);background:var(--surface);transition:all 0.3s;font-size:13px;color:var(--text3)}
  .loading-item.active{background:var(--gold-dim);color:var(--text);border:1px solid rgba(201,168,76,0.15)}
  .loading-item.done{color:var(--green)}
  .li-icon{font-size:14px;line-height:1;flex-shrink:0}

  /* PROGRAM HERO */
  .program-hero{
    background:linear-gradient(135deg,var(--surface) 0%,rgba(201,168,76,0.05) 100%);
    border:1px solid var(--border);border-radius:var(--r-lg);
    padding:20px;margin-bottom:14px;position:relative;overflow:hidden;
  }

  .program-hero::after{content:'';position:absolute;bottom:-30px;right:-30px;width:90px;height:90px;background:radial-gradient(circle,rgba(201,168,76,0.07) 0%,transparent 70%);border-radius:50%;pointer-events:none}

  .program-hero-name{font-family:'Outfit',sans-serif;font-size:20px;font-weight:800;color:var(--gold);line-height:1;margin-bottom:6px;letter-spacing:-0.2px}
  .program-hero-summary{font-size:12px;color:var(--text3);line-height:1.5;margin-bottom:12px}
  .meta-row{display:flex;flex-wrap:wrap;gap:5px}
  .meta-pill{background:var(--surface2);border:1px solid var(--border);border-radius:7px;padding:3px 9px;font-size:10px;font-weight:500;color:var(--text3);font-family:'Outfit',sans-serif}

  /* Wendler badge */
  .wendler-badge{background:rgba(167,139,250,0.1);border:1px solid rgba(167,139,250,0.25);border-radius:8px;padding:4px 10px;font-family:'Outfit',sans-serif;font-size:11px;font-weight:700;color:#C4B5FD;letter-spacing:0.3px;display:inline-block;margin-bottom:10px}

  .wendler-week-badge{background:rgba(167,139,250,0.08);border:1px solid rgba(167,139,250,0.15);border-radius:6px;padding:2px 8px;font-size:10px;font-weight:700;color:#A78BFA;font-family:'Outfit',sans-serif}

  /* DAY CARDS */
  .day-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);margin-bottom:9px;overflow:hidden;transition:border-color 0.2s}
  .day-card.expanded{border-color:var(--border2)}
  .day-header{padding:14px 16px;display:flex;align-items:center;gap:13px;cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent}
  .day-num-big{font-family:'Outfit',sans-serif;font-size:28px;font-weight:800;line-height:1;color:var(--border2);min-width:28px;transition:color 0.2s;letter-spacing:-1px}
  .day-card.expanded .day-num-big{color:var(--gold)}
  .day-header-text{flex:1;min-width:0}
  .day-header-name{font-family:'Outfit',sans-serif;font-size:13px;font-weight:600;color:var(--text)}
  .day-header-muscles{font-size:11px;color:var(--text3);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .day-chevron{color:var(--text3);font-size:13px;transition:transform 0.25s;flex-shrink:0}
  .day-card.expanded .day-chevron{transform:rotate(180deg);color:var(--gold)}
  .ex-list{border-top:1px solid var(--border);max-height:0;overflow:hidden;transition:max-height 0.4s cubic-bezier(0.4,0,0.2,1)}
  .day-card.expanded .ex-list{max-height:4000px}

  .ex-row{padding:12px 16px;display:flex;gap:11px;border-bottom:1px solid rgba(44,44,52,0.6)}
  .ex-row:last-child{border-bottom:none}
  .ex-row.finisher{background:rgba(201,168,76,0.03)}
  .ex-idx{font-family:'Outfit',sans-serif;font-size:13px;font-weight:700;color:var(--text3);min-width:17px;padding-top:2px;flex-shrink:0}
  .ex-body{flex:1;min-width:0}
  .ex-name{font-size:13px;font-weight:600;margin-bottom:3px}
  .ex-muscle-tag{display:inline-block;background:var(--surface2);border-radius:5px;padding:2px 7px;font-size:9px;font-weight:600;letter-spacing:0.5px;color:var(--text3);text-transform:uppercase;margin-bottom:4px;font-family:'Outfit',sans-serif}
  .ex-finisher-tag{display:inline-block;background:rgba(201,168,76,0.1);border:1px solid rgba(201,168,76,0.2);border-radius:5px;padding:2px 7px;font-size:9px;font-weight:700;letter-spacing:0.5px;color:var(--gold2);text-transform:uppercase;margin-bottom:4px;margin-left:5px;font-family:'Outfit',sans-serif}
  .ex-tip{font-size:11px;color:var(--text3);line-height:1.45;margin-bottom:5px;font-style:italic}
  .ex-stats{display:flex;gap:5px;flex-wrap:wrap}
  .ex-stat{border-radius:5px;padding:3px 7px;font-size:10px;font-weight:600;font-family:'Outfit',sans-serif}
  .ex-stat.sets{background:var(--gold-dim);color:var(--gold2)}
  .ex-stat.reps{background:rgba(96,165,250,0.1);color:#93C5FD}
  .ex-stat.rest{background:var(--green-dim);color:var(--green)}
  .ex-stat.pct{background:rgba(167,139,250,0.1);color:#C4B5FD}

  .rest-content{border-top:1px solid var(--border);padding:18px 16px;text-align:center;color:var(--text3);font-size:13px;line-height:1.6}
  .rest-icon-sm{font-size:24px;display:block;margin-bottom:6px}
  .save-bar{padding:13px 20px 10px;background:var(--bg);border-top:1px solid var(--border);flex-shrink:0;display:flex;flex-direction:column;gap:8px}

  /* PROGRAMS PAGE */
  .programs-header{margin-bottom:18px}
  .programs-title{font-family:'Outfit',sans-serif;font-size:26px;font-weight:800;color:var(--text);letter-spacing:-0.5px;margin-bottom:3px}
  .programs-count{font-size:12px;color:var(--text3)}
  .empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:50px 30px;text-align:center;gap:12px}
  .empty-icon{font-size:46px;opacity:0.2}
  .empty-title{font-family:'Outfit',sans-serif;font-size:20px;font-weight:700;color:var(--text3)}
  .empty-sub{font-size:13px;color:var(--text3);line-height:1.6;max-width:220px}

  .prog-card{
    background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);
    padding:17px 17px 15px;cursor:pointer;transition:all 0.15s;
    -webkit-tap-highlight-color:transparent;position:relative;overflow:hidden;margin-bottom:9px;
  }

  .prog-card:active{transform:scale(0.98)}
  .prog-card:hover{border-color:var(--border2)}
  .prog-card-name{font-family:'Outfit',sans-serif;font-size:17px;font-weight:700;color:var(--gold);margin-bottom:3px;letter-spacing:-0.2px}
  .prog-card-meta{font-size:11px;color:var(--text3);margin-bottom:9px}
  .prog-card-badges{display:flex;gap:5px;flex-wrap:wrap}
  .prog-card-badge{background:var(--surface2);border-radius:6px;padding:3px 8px;font-size:10px;font-weight:500;color:var(--text3);font-family:'Outfit',sans-serif}
  .prog-card-badge.wendler{background:rgba(167,139,250,0.08);color:#A78BFA;border:1px solid rgba(167,139,250,0.15)}

  .prog-delete{position:absolute;top:14px;right:14px;background:rgba(248,113,113,0.07);border:none;border-radius:7px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:12px;cursor:pointer;color:var(--red);transition:all 0.15s;-webkit-tap-highlight-color:transparent}
  .prog-delete:hover{background:rgba(248,113,113,0.14)}

  /* DAILY VIEW */
  .daily-header{background:var(--bg);border-bottom:1px solid var(--border);padding:13px 18px;display:flex;align-items:center;gap:11px;flex-shrink:0}
  .back-btn{background:var(--surface);border:1px solid var(--border);border-radius:9px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:15px;cursor:pointer;color:var(--text);transition:all 0.15s;-webkit-tap-highlight-color:transparent;flex-shrink:0}
  .back-btn:active{transform:scale(0.92)}
  .daily-header-info{flex:1;min-width:0}
  .daily-prog-name{font-family:'Outfit',sans-serif;font-size:15px;font-weight:700;color:var(--gold);line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .daily-day-label{font-size:11px;color:var(--text3);margin-top:2px}

  .day-navigator{padding:11px 18px;border-bottom:1px solid var(--border);flex-shrink:0}
  .day-nav-scroll{display:flex;gap:6px;overflow-x:auto;padding-bottom:2px;-webkit-overflow-scrolling:touch;scrollbar-width:none}
  .day-nav-scroll::-webkit-scrollbar{display:none}

  .day-pill{flex-shrink:0;background:var(--surface);border:1px solid var(--border);border-radius:100px;padding:6px 12px;cursor:pointer;transition:all 0.15s;text-align:center;user-select:none;-webkit-tap-highlight-color:transparent}
  .day-pill:active{transform:scale(0.94)}
  .day-pill.active-day{background:var(--gold-dim);border-color:var(--gold)}
  .day-pill.rest-pill{opacity:0.5}
  .day-pill.active-day.rest-pill{opacity:0.8}
  .dp-num{font-family:'Outfit',sans-serif;font-size:15px;font-weight:700;line-height:1;color:var(--text2)}
  .day-pill.active-day .dp-num{color:var(--gold)}
  .dp-label{font-size:9px;font-weight:600;letter-spacing:0.4px;color:var(--text3);margin-top:1px;max-width:54px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:'Outfit',sans-serif}

  /* SESSION */
  .session-header{margin-bottom:14px}
  .session-title{font-family:'Outfit',sans-serif;font-size:22px;font-weight:800;color:var(--text);line-height:1.1;margin-bottom:4px;letter-spacing:-0.3px}
  .session-muscles{font-size:12px;color:var(--gold2);font-weight:500}
  .session-ex-count{font-size:11px;color:var(--text3);margin-top:3px}

  .session-progress{background:var(--surface);border-radius:var(--r);padding:11px 13px;margin-bottom:13px;display:flex;align-items:center;gap:11px}
  .sp-bar-wrap{flex:1;height:4px;background:var(--border);border-radius:4px;overflow:hidden}
  .sp-bar{height:100%;background:var(--green);border-radius:4px;transition:width 0.5s ease}
  .sp-text{font-size:11px;color:var(--text3);font-weight:600;white-space:nowrap;font-family:'Outfit',sans-serif}
  .sp-text span{color:var(--green)}

  /* EX CARD */
  .ex-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:15px;margin-bottom:8px;transition:all 0.2s}
  .ex-card.completed{border-color:rgba(74,222,128,0.3);background:var(--green-dim)}
  .ex-card.finisher-card{border-color:rgba(201,168,76,0.15)}
  .ex-card-top{display:flex;align-items:flex-start;gap:11px;margin-bottom:11px}
  .ex-card-num{font-family:'Outfit',sans-serif;font-size:24px;font-weight:800;line-height:1;color:var(--border2);min-width:24px;flex-shrink:0;transition:color 0.2s;letter-spacing:-1px}
  .ex-card.completed .ex-card-num{color:var(--green)}
  .ex-card-info{flex:1;min-width:0}
  .ex-card-name{font-size:14px;font-weight:600;margin-bottom:3px}
  .ex-muscle-badge{display:inline-block;background:var(--surface2);border-radius:5px;padding:2px 7px;font-size:9px;font-weight:600;letter-spacing:0.5px;color:var(--text3);text-transform:uppercase;margin-bottom:4px;transition:all 0.2s;font-family:'Outfit',sans-serif}
  .ex-card.completed .ex-muscle-badge{background:rgba(74,222,128,0.1);color:var(--green)}
  .ex-card-tip{font-size:11px;color:var(--text3);font-style:italic;line-height:1.45}
  .ex-card-stats{display:flex;gap:7px;margin-bottom:11px}
  .ex-big-stat{flex:1;background:var(--surface2);border-radius:9px;padding:9px 7px;text-align:center}
  .ex-big-stat .val{font-family:'Outfit',sans-serif;font-size:18px;font-weight:700;line-height:1}
  .ex-big-stat .lbl{font-size:9px;font-weight:600;letter-spacing:0.5px;color:var(--text3);text-transform:uppercase;margin-top:3px;font-family:'Outfit',sans-serif}
  .ex-big-stat.sets-stat .val{color:var(--gold2)}
  .ex-big-stat.reps-stat .val{color:#93C5FD}
  .ex-big-stat.rest-stat .val{font-size:12px;padding-top:3px;color:var(--green)}

  .ex-done-btn{width:100%;background:var(--surface2);border:1px dashed var(--border2);border-radius:var(--r-sm);padding:11px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;color:var(--text3);cursor:pointer;transition:all 0.2s;-webkit-tap-highlight-color:transparent}
  .ex-done-btn:hover{border-color:var(--green);color:var(--green)}
  .ex-card.completed .ex-done-btn{background:rgba(74,222,128,0.07);border:1px solid rgba(74,222,128,0.3);color:var(--green)}

  /* TIMER */
  .rest-timer-overlay{position:fixed;inset:0;background:rgba(12,12,14,0.97);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:999;gap:22px;animation:fadeIn 0.2s}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  .timer-ring-wrap{position:relative;width:150px;height:150px}
  .timer-svg{transform:rotate(-90deg)}
  .timer-track{fill:none;stroke:var(--surface2);stroke-width:6}
  .timer-progress{fill:none;stroke:var(--gold);stroke-width:6;stroke-linecap:round;transition:stroke-dashoffset 1s linear}
  .timer-num{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
  .timer-seconds{font-family:'Outfit',sans-serif;font-size:44px;font-weight:800;color:var(--text);line-height:1;letter-spacing:-2px}
  .timer-label-sm{font-size:10px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--text3);font-family:'Outfit',sans-serif;margin-top:2px}
  .timer-title{font-family:'Outfit',sans-serif;font-size:19px;font-weight:700;color:var(--text)}
  .timer-next{font-size:13px;color:var(--text3);text-align:center}
  .timer-next strong{color:var(--text2)}
  .timer-skip{background:var(--surface);border:1px solid var(--border);border-radius:100px;padding:11px 26px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;color:var(--text2);cursor:pointer;transition:all 0.15s;-webkit-tap-highlight-color:transparent}

  /* REST DAY */
  .rest-day-view{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 26px;text-align:center;gap:13px}
  .rest-big-icon{font-size:60px}
  .rest-view-title{font-family:'Outfit',sans-serif;font-size:24px;font-weight:800;color:var(--text);letter-spacing:-0.5px}
  .rest-view-sub{font-size:13px;color:var(--text3);line-height:1.6;max-width:240px}
  .rest-tips{margin-top:12px;display:flex;flex-direction:column;gap:7px;width:100%;max-width:280px}
  .rest-tip-item{background:var(--surface);border-radius:var(--r);padding:11px 13px;font-size:12px;color:var(--text2);display:flex;gap:9px;align-items:flex-start;text-align:left}

  /* PROFILE */
  .profile-avatar{width:68px;height:68px;background:var(--gold-dim);border:1.5px solid var(--gold);border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:12px;cursor:pointer;transition:all 0.15s;-webkit-tap-highlight-color:transparent}
  .profile-avatar:active{transform:scale(0.95)}
  .profile-name{font-family:'Outfit',sans-serif;font-size:22px;font-weight:800;color:var(--text);letter-spacing:-0.3px;margin-bottom:2px}
  .profile-subtitle{font-size:12px;color:var(--text3);margin-bottom:20px}

  .stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:7px}
  .stat-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:13px}
  .stat-val{font-family:'Outfit',sans-serif;font-size:24px;font-weight:800;color:var(--text);line-height:1;margin-bottom:3px;letter-spacing:-1px}
  .stat-val span{font-size:13px;font-weight:500;color:var(--text3)}
  .stat-lbl{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:var(--text3);font-family:'Outfit',sans-serif}

  .streak-card{background:linear-gradient(135deg,var(--surface) 0%,rgba(201,168,76,0.06) 100%);border:1px solid var(--border);border-radius:var(--r-lg);padding:16px;display:flex;align-items:center;gap:13px;margin-bottom:7px}
  .streak-icon{font-size:32px}
  .streak-info{flex:1}
  .streak-num{font-family:'Outfit',sans-serif;font-size:26px;font-weight:800;color:var(--gold);letter-spacing:-1px;line-height:1}
  .streak-label{font-size:11px;color:var(--text3);margin-top:2px}

  .history-item{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:12px 14px;display:flex;align-items:center;gap:11px;margin-bottom:6px}
  .history-icon{font-size:16px;flex-shrink:0}
  .history-info{flex:1;min-width:0}
  .history-name{font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .history-meta{font-size:10px;color:var(--text3);margin-top:2px}
  .history-badge{background:var(--green-dim);border-radius:6px;padding:2px 8px;font-size:10px;font-weight:600;color:var(--green);font-family:'Outfit',sans-serif;white-space:nowrap}

  /* SETTINGS */
  .settings-section{margin-bottom:22px}
  .settings-title{font-family:'Outfit',sans-serif;font-size:22px;font-weight:800;color:var(--text);letter-spacing:-0.3px;margin-bottom:16px}
  .settings-item{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:14px 16px;display:flex;align-items:center;justify-content:space-between;margin-bottom:7px}
  .settings-item-label{font-size:14px;font-weight:500;color:var(--text2)}
  .settings-item-sub{font-size:11px;color:var(--text3);margin-top:2px}
  .lang-toggle{display:flex;gap:5px}
  .lang-btn{background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:6px 13px;font-family:'Outfit',sans-serif;font-size:12px;font-weight:600;color:var(--text3);cursor:pointer;transition:all 0.15s;-webkit-tap-highlight-color:transparent}
  .lang-btn.active{background:var(--gold-dim);border-color:var(--gold);color:var(--gold)}

  /* NUTRITION */
  .macro-hero{background:linear-gradient(135deg,var(--surface) 0%,rgba(201,168,76,0.05) 100%);border:1px solid var(--border);border-radius:var(--r-lg);padding:19px;margin-bottom:13px}
  .macro-hero-title{font-family:'Outfit',sans-serif;font-size:10px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:var(--text3);margin-bottom:5px}
  .macro-kcal{font-family:'Outfit',sans-serif;font-size:40px;font-weight:900;color:var(--text);letter-spacing:-2px;line-height:1;margin-bottom:3px}
  .macro-kcal span{font-size:14px;font-weight:500;color:var(--text3);letter-spacing:0}
  .macro-goal-label{font-size:12px;color:var(--gold2);font-weight:500;margin-bottom:14px}
  .macro-bars{display:flex;flex-direction:column;gap:9px}
  .macro-bar-row{display:flex;align-items:center;gap:9px}
  .macro-bar-label{font-size:11px;font-weight:600;color:var(--text2);width:70px;flex-shrink:0;font-family:'Outfit',sans-serif}
  .macro-bar-wrap{flex:1;height:5px;background:var(--surface2);border-radius:5px;overflow:hidden}
  .macro-bar-fill{height:100%;border-radius:5px;transition:width 0.8s cubic-bezier(0.4,0,0.2,1)}
  .macro-bar-val{font-size:11px;font-weight:600;color:var(--text3);width:45px;text-align:right;font-family:'Outfit',sans-serif;flex-shrink:0}

  .macro-cards{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:13px}
  .macro-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:12px 9px;text-align:center}
  .macro-card-val{font-family:'Outfit',sans-serif;font-size:20px;font-weight:800;line-height:1;margin-bottom:3px}
  .macro-card-val span{font-size:11px;font-weight:500;color:var(--text3)}
  .macro-card-label{font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:var(--text3);font-family:'Outfit',sans-serif}

  .meal-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:15px;margin-bottom:8px}
  .meal-card-header{display:flex;align-items:center;gap:9px;margin-bottom:9px}
  .meal-card-icon{font-size:18px}
  .meal-card-title{font-family:'Outfit',sans-serif;font-size:13px;font-weight:700;color:var(--text)}
  .meal-card-kcal{font-size:11px;color:var(--text3);margin-top:1px}
  .meal-items{display:flex;flex-direction:column;gap:5px}
  .meal-item{font-size:12px;color:var(--text2);display:flex;gap:7px;align-items:baseline}
  .meal-item::before{content:'·';color:var(--text3);flex-shrink:0}

  .no-profile-banner{background:var(--gold-dim);border:1px solid rgba(201,168,76,0.2);border-radius:var(--r-lg);padding:18px;text-align:center;margin-bottom:14px}
  .no-profile-banner-title{font-family:'Outfit',sans-serif;font-size:15px;font-weight:700;color:var(--gold);margin-bottom:4px}
  .no-profile-banner-sub{font-size:12px;color:var(--text3);line-height:1.5}

  /* FULLBODY CARD */
  .fullbody-card{
    display:flex;align-items:center;justify-content:space-between;
    background:var(--surface);border:1px solid var(--border);border-radius:var(--r);
    padding:14px 16px;cursor:pointer;margin-bottom:16px;
    transition:all 0.15s;-webkit-tap-highlight-color:transparent;position:relative;overflow:hidden;
  }
  .fullbody-card::before{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:var(--border);transition:background 0.2s}
  .fullbody-card.selected{border-color:var(--gold);background:var(--gold-dim)}
  .fullbody-card.selected::before{background:var(--gold)}
  .fullbody-card:active{transform:scale(0.98)}
  .fullbody-left{display:flex;align-items:center;gap:12px}
  .fullbody-icon{font-size:18px;color:var(--text3);font-family:'Outfit',sans-serif;font-weight:800;width:36px;height:36px;background:var(--surface2);border:1px solid var(--border);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .fullbody-card.selected .fullbody-icon{background:var(--gold-dim);border-color:rgba(201,168,76,0.3);color:var(--gold)}
  .fullbody-name{font-family:'Outfit',sans-serif;font-size:14px;font-weight:700;color:var(--text)}
  .fullbody-card.selected .fullbody-name{color:var(--gold)}
  .fullbody-sub{font-size:11px;color:var(--text3);margin-top:2px}
  .fullbody-check{font-size:14px;color:var(--gold);font-weight:700;font-family:'Outfit',sans-serif;flex-shrink:0}
  .adv-toggle{
    display:flex;align-items:center;justify-content:space-between;gap:12px;
    background:var(--surface);border:1px solid var(--border);border-radius:var(--r);
    padding:13px 14px;cursor:pointer;margin:14px 0 6px;
    transition:all 0.15s;-webkit-tap-highlight-color:transparent;
    position:relative;overflow:hidden;
  }
  .adv-toggle::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--border);border-radius:0 2px 2px 0;transition:background 0.2s}
  .adv-toggle.active{border-color:var(--gold);background:var(--gold-dim)}
  .adv-toggle.active::before{background:var(--gold)}
  .adv-toggle:active{transform:scale(0.98)}
  .adv-toggle-left{display:flex;align-items:flex-start;gap:10px;padding-left:10px}
  .adv-toggle-icon{font-size:15px;color:var(--text3);margin-top:1px;flex-shrink:0;font-family:'Outfit',sans-serif;font-weight:700}
  .adv-toggle.active .adv-toggle-icon{color:var(--gold)}
  .adv-toggle-label{font-size:13px;font-weight:600;color:var(--text2);line-height:1.3}
  .adv-toggle.active .adv-toggle-label{color:var(--gold)}
  .adv-toggle-sub{font-size:11px;color:var(--text3);margin-top:2px;font-style:italic}
  .adv-toggle-check{
    font-family:'Outfit',sans-serif;font-size:10px;font-weight:700;letter-spacing:0.8px;
    background:var(--surface2);border-radius:6px;padding:3px 8px;color:var(--text3);
    flex-shrink:0;transition:all 0.15s;
  }
  .adv-toggle-check.on{background:var(--gold-dim);color:var(--gold);border:1px solid rgba(201,168,76,0.3)}

  /* SHARE BUTTON — header, visible gold */
  .share-header-btn{
    background:var(--gold-dim);border:1px solid rgba(201,168,76,0.4);border-radius:10px;
    padding:7px 13px;font-size:12px;font-weight:700;color:var(--gold);
    cursor:pointer;font-family:'Outfit',sans-serif;letter-spacing:0.3px;
    display:flex;align-items:center;gap:5px;transition:all 0.15s;
    -webkit-tap-highlight-color:transparent;
  }
  .share-header-btn:active{transform:scale(0.94);background:rgba(201,168,76,0.25)}

  /* EXERCISE VIDEO LINK */
  .ex-video-link{
    display:inline-flex;align-items:center;gap:4px;
    margin-top:8px;margin-bottom:8px;
    font-size:11px;color:var(--text3);
    text-decoration:none;font-family:'Outfit',sans-serif;font-weight:500;
    background:var(--surface2);border-radius:6px;padding:4px 9px;
    border:1px solid var(--border);transition:all 0.12s;
    -webkit-tap-highlight-color:transparent;
  }
  .ex-video-link:active{background:rgba(255,59,48,0.08);color:#FF3B30;border-color:rgba(255,59,48,0.2)}
  .fade-up{animation:fadeUp 0.28s ease both}
  @keyframes scaleIn{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}
  .scale-in{animation:scaleIn 0.22s ease both}
`;

// ─────────────────────────────────────────────────────────────────────────────
// MOTEUR DE GÉNÉRATION — HORS-LIGNE, SANS LIMITES
// ─────────────────────────────────────────────────────────────────────────────
// EXERCISE DATABASE — Standard + Advanced (adv:true = shown for Confirmé level)
// ─────────────────────────────────────────────────────────────────────────────
const EXERCISE_DB = {
  chest: [
    { name: "Développé couché barre",       tip: "Descends lentement jusqu'à la poitrine, pousse en expirant fort.", equip: ["gym","barbell"] },
    { name: "Développé incliné haltères",   tip: "Inclinaison 30-45°, coudes à 75° pour protéger les épaules.", equip: ["gym","dumbbells"] },
    { name: "Écarté câble basse poulie",    tip: "Croise les mains en haut pour maximiser la contraction pectorale.", equip: ["gym","cables"] },
    { name: "Développé couché haltères",    tip: "Amplitude complète — descends jusqu'à l'étirement profond.", equip: ["gym","dumbbells"] },
    { name: "Dips lestés",                  tip: "Buste légèrement penché en avant pour cibler les pectoraux.", equip: ["gym"] },
    { name: "Pec deck / Butterfly",         tip: "Maintiens 1 seconde contracté, relâche très lentement.", equip: ["gym","machines"] },
    { name: "Pompes",                       tip: "Corps parfaitement droit, poitrine au sol, dos neutre.", equip: ["any","bodyweight"] },
    { name: "Pompes déclinées",             tip: "Pieds surélevés sur une chaise — cible la partie haute des pecs.", equip: ["any","bodyweight"] },
    { name: "Pompes inclinées",             tip: "Mains surélevées sur une chaise — cible la partie basse des pecs, parfait pour débutants.", equip: ["any","bodyweight"] },
    { name: "Pompes diamant",               tip: "Mains en diamant sous la poitrine — triceps et pec intérieur. La prise serrée maximise l'activation de la tête sternale.", equip: ["any","bodyweight"] },
    { name: "Pompes archer",                tip: "Un bras fléchi, l'autre tendu — version unilatérale progressive vers les pompes à un bras. Difficulté intermédiaire.", equip: ["any","bodyweight"] },
    { name: "Pompes explosives",            tip: "Pousse assez fort pour décoller les mains — recrutement des fibres rapides maximal. Idem au travail pliométrique des pros.", equip: ["any","bodyweight"] },
    { name: "Pompes à un bras",             tip: "Pieds larges pour la stabilité, corps parfaitement aligné — force unilatérale maximale. Commence par appui sur un poing.", equip: ["any","bodyweight"], adv: true },
    { name: "Pompes prise large",           tip: "Mains à 1,5× largeur d'épaules — plus d'activation des pec externes et meilleur étirement en bas.", equip: ["any","bodyweight"] },
    { name: "Pompes sphinx",                tip: "Descends sur les avant-bras puis repousse — combine pec et triceps long chef.", equip: ["any","bodyweight"], adv: true },
    { name: "Spoto Press",                  tip: "Pause 2cm au-dessus de la poitrine sans toucher — active les pecs en tension extrême.", equip: ["gym","barbell"], adv: true },
    { name: "Écarté câble haute poulie",    tip: "Poulie haute, mains qui se croisent en bas — isolation pec inférieur idéale.", equip: ["gym","cables"], adv: true },
    { name: "Développé barre prise serrée", tip: "Prise à largeur d'épaules — active la jonction pec/triceps.", equip: ["gym","barbell"], adv: true },
    { name: "Landmine Press unilatéral",    tip: "Barre dans un angle, pousse en rotation — recrutement fonctionnel maximal.", equip: ["gym","barbell"], adv: true },
  ],
  back: [
    { name: "Tirage vertical prise large",   tip: "Étire bien en haut, contracte les omoplates en bas.", equip: ["gym","cables"] },
    { name: "Rowing barre pronation",        tip: "Dos plat à 45°, tire vers le nombril, coudes collés.", equip: ["gym","barbell"] },
    { name: "Rowing haltère unilatéral",     tip: "Appui banc, tire le coude vers le plafond, épaule immobile.", equip: ["gym","dumbbells"] },
    { name: "Soulevé de terre roumain",      tip: "Dos neutre absolu, barre contre les jambes tout le trajet.", equip: ["gym","barbell"] },
    { name: "Tirage poulie basse",           tip: "Tire vers le bas-ventre, serre les omoplates 1 seconde.", equip: ["gym","cables"] },
    { name: "Pull-up / Traction prise large",tip: "Prise large, descends complètement, menton au-dessus.", equip: ["gym","bodyweight"] },
    { name: "Chin-up (prise supination)",    tip: "Prise sous-main, coudes qui descendent vers les côtes — biceps + grand dorsal combo parfait.", equip: ["gym","bodyweight"] },
    { name: "Inverted Row (table/barre basse)", tip: "Corps incliné sous une table, tire la poitrine vers la barre — équivalent du rowing couché. Parfait sans équipement.", equip: ["any","bodyweight"] },
    { name: "Australian Pull-up",            tip: "Barre basse, corps incliné à 45°, tire la poitrine — plus accessible que les tractions. Progression idéale.", equip: ["any","bodyweight"] },
    { name: "Superman (extension dos sol)",  tip: "Ventre au sol, lève bras et jambes simultanément — renforce les érecteurs du rachis et les rhomboïdes. Tiens 2 secondes.", equip: ["any","bodyweight"] },
    { name: "Rowing à la machine",           tip: "Appui poitrine, focus total sur les omoplates.", equip: ["gym","machines"] },
    { name: "Pull-over au sol",              tip: "Allongé, bras tendus au-dessus de la tête, ramène au corps — étirement grand dorsal en début de mouvement.", equip: ["any","bodyweight"] },
    { name: "Tirage horizontal câble",       tip: "Coudes près du corps, contracte le dos 1 seconde.", equip: ["gym","cables"] },
    { name: "Pull-over haltère",             tip: "Bras tendus, axe en grand dorsal — excellent stretch.", equip: ["gym","dumbbells"] },
    { name: "Good Morning poids du corps",   tip: "Debout, mains sur la nuque, charnière hanches, dos neutre — renforce les érecteurs et les ischio.", equip: ["any","bodyweight"] },
    { name: "Pendlay Row",                   tip: "Barre au sol entre chaque rep, dos parallèle — row explosif.", equip: ["gym","barbell"], adv: true },
    { name: "Seal Row (banc incliné)",       tip: "Allongé ventre sur banc incliné — élimine toute triche du bas du dos.", equip: ["gym","dumbbells"], adv: true },
    { name: "Meadows Row",                   tip: "Barre en angle, prise au bout — recrutement latissimus unilatéral maximal.", equip: ["gym","barbell"], adv: true },
    { name: "Traction lestée prise neutre",  tip: "Prise en V — active plus le biceps long et le grand dorsal.", equip: ["gym","bodyweight"], adv: true },
    { name: "Tirage vertical supination",    tip: "Prise sous-main étroite — recrute davantage le grand dorsal bas.", equip: ["gym","cables"], adv: true },
  ],
  shoulders: [
    { name: "Développé militaire barre",     tip: "Barre devant, pousse vertical, ne cambre pas le bas-dos.", equip: ["gym","barbell"] },
    { name: "Élévations latérales haltères", tip: "Légèrement penché, coudes à 15°, monte à l'horizontal.", equip: ["gym","dumbbells"] },
    { name: "Arnold Press",                  tip: "Rotation des paumes en montant — deltoïde antérieur++.", equip: ["gym","dumbbells"] },
    { name: "Oiseau (élévations arrière)",   tip: "Buste à 90°, coudes légèrement fléchis, pince les omoplates.", equip: ["gym","dumbbells"] },
    { name: "Face pull câble",               tip: "Poulie haute, tire vers le visage en séparant les mains.", equip: ["gym","cables"] },
    { name: "Développé haltères assis",      tip: "Coudes à 90°, pousse vers le haut sans verrouiller.", equip: ["gym","dumbbells"] },
    { name: "Élévation frontale haltères",   tip: "Monte à hauteur des yeux, descends en 3 secondes.", equip: ["gym","dumbbells"] },
    { name: "Pike Push-up",                  tip: "Fesses en l'air, corps en V inversé, tête entre les bras — cible le deltoïde antérieur. Base vers le handstand push-up.", equip: ["any","bodyweight"] },
    { name: "Handstand Push-up (mur)",       tip: "En appui renversé contre le mur, descends lentement jusqu'à la tête — le développé militaire du poids du corps. Très difficile.", equip: ["any","bodyweight"], adv: true },
    { name: "Élévations latérales sol",      tip: "Couché sur le côté, lève le bras latéralement — isole le deltoïde moyen sans compensation du tronc.", equip: ["any","bodyweight"] },
    { name: "YTW au sol",                    tip: "Ventre au sol, trace Y-T-W avec les bras — renforce les trois faisceaux du deltoïde + stabilisateurs scapulaires.", equip: ["any","bodyweight"] },
    { name: "Pompes prise large (déltoïdes)", tip: "Mains très larges, descends lentement — charge le deltoïde antérieur plus que les pecs.", equip: ["any","bodyweight"] },
    { name: "Rotation externe sol",          tip: "Allongé sur le côté, coude à 90°, rotate l'avant-bras — coiffe des rotateurs essentielle. Prévention des blessures épaule.", equip: ["any","bodyweight"] },
    { name: "Élévations latérales câble",    tip: "Câble à la hanche opposée — tension constante.", equip: ["gym","cables"], adv: true },
    { name: "Z-Press (sol)",                 tip: "Assis au sol jambes tendues — annule toute aide du bas du corps.", equip: ["gym","barbell"], adv: true },
    { name: "Rowing menton câble (prise large)", tip: "Prise large >épaules — cible le deltoïde moyen.", equip: ["gym","cables"], adv: true },
  ],
  biceps: [
    { name: "Curl barre droite",             tip: "Coudes fixes — le mouvement vient du coude uniquement.", equip: ["gym","barbell"] },
    { name: "Curl haltères alterné",         tip: "Supine le poignet en montant pour maximiser la contraction.", equip: ["gym","dumbbells"] },
    { name: "Curl marteau",                  tip: "Prise neutre — cible le brachial pour plus d'épaisseur.", equip: ["gym","dumbbells"] },
    { name: "Curl concentré",                tip: "Coude contre la cuisse, amplitude complète, isolement parfait.", equip: ["gym","dumbbells"] },
    { name: "Curl câble basse poulie",       tip: "Tension constante tout le long — parfait en finisher.", equip: ["gym","cables"] },
    { name: "Curl barre EZ",                 tip: "Prise en supination partielle — moins de stress poignets.", equip: ["gym","barbell"] },
    { name: "Chin-up (prise sous-main)",     tip: "Prise sous-main à largeur d'épaules — active fortement le biceps long. Le meilleur curl au poids du corps.", equip: ["gym","bodyweight"] },
    { name: "Curl inversé à la table",       tip: "Allongé sous une table solide, prise sous-main sur le bord, tire la poitrine — equivalent chin-up sans barre de traction.", equip: ["any","bodyweight"] },
    { name: "Curl serviette/ceinture isométrique", tip: "Pied dans une serviette, fléchis le genou en résistant avec le bras — curl isométrique maison. Intensité et contraction maximale.", equip: ["any","bodyweight"] },
    { name: "Flexion isométrique murale",    tip: "Paume sous une table fixe, pousse vers le haut en résistant — contraction isométrique du biceps. Excellent pour activer sans matériel.", equip: ["any","bodyweight"] },
    { name: "Bayesian Curl (câble incliné)", tip: "Câble derrière soi, bras en arrière — étirement extrême du biceps long.", equip: ["gym","cables"], adv: true },
    { name: "Curl incliné haltères",         tip: "Allongé sur banc incliné 45° — pré-étire le biceps long. +11% d'activation vs curl debout.", equip: ["gym","dumbbells"], adv: true },
    { name: "Spider Curl",                   tip: "Ventre sur banc incliné, bras verticaux — élimine le momentum.", equip: ["gym","dumbbells","barbell"], adv: true },
  ],
  triceps: [
    { name: "Pushdown câble prise haute",    tip: "Coudes fixes, étends complètement, descends lentement.", equip: ["gym","cables"] },
    { name: "Extension triceps poulie haute",tip: "Bras derrière la tête, descends l'avant-bras, étends.", equip: ["gym","cables"] },
    { name: "Dips (barres parallèles)",      tip: "Buste droit pour les triceps — penché = pectoraux.", equip: ["gym","bodyweight"] },
    { name: "Dips entre deux chaises",       tip: "Mains sur deux chaises stables, corps entre elles — dips maison efficace. Jambes tendues pour plus de difficulté.", equip: ["any","bodyweight"] },
    { name: "Skull crusher barre EZ",        tip: "Vers le front lentement, coudes fixes, extension explosive.", equip: ["gym","barbell"] },
    { name: "Extension haltère une main",    tip: "Bras vertical derrière la nuque, descends lentement.", equip: ["gym","dumbbells"] },
    { name: "Kickback haltère",              tip: "Buste parallèle au sol, étends jusqu'à l'alignement.", equip: ["gym","dumbbells"] },
    { name: "Pompes triceps (prise serrée)", tip: "Coudes contre le corps, mains à largeur d'épaules — isole les triceps dans le mouvement de poussée.", equip: ["any","bodyweight"] },
    { name: "Extension triceps au sol",      tip: "Allongé, mains à côté des oreilles, coudes pointent vers le plafond — skull crusher au poids du corps. Efficace en endurance.", equip: ["any","bodyweight"] },
    { name: "Pike push-up à angle fermé",    tip: "V inversé prononcé, coudes qui pointent vers l'arrière — cible le triceps en position raccourcie.", equip: ["any","bodyweight"] },
    { name: "Bench dip (banc / chaise)",     tip: "Mains sur un banc derrière soi, pieds tendus — descends jusqu'à 90° de coude.", equip: ["any","bodyweight"] },
    { name: "JM Press",                      tip: "Hybride Skull crusher / Développé — charge lourde possible. Inventé par JM Blakley.", equip: ["gym","barbell"], adv: true },
    { name: "Tate Press",                    tip: "Haltères fléchis vers la poitrine, coudes larges — isole la tête latérale.", equip: ["gym","dumbbells"], adv: true },
    { name: "Overhead cable extension (long chef)", tip: "Câble derrière la tête, pleine extension — maximise l'étirement du long chef.", equip: ["gym","cables"], adv: true },
  ],
  legs: [
    { name: "Squat barre",                   tip: "Pieds à largeur d'épaules, cuisses parallèles, dos neutre.", equip: ["gym","barbell"] },
    { name: "Presse à cuisse",               tip: "Pieds hauts = fessiers/ischio. Pieds bas = quadriceps.", equip: ["gym","machines"] },
    { name: "Leg extension",                 tip: "Extension complète, 1 sec de contraction, descente lente.", equip: ["gym","machines"] },
    { name: "Leg curl couché",               tip: "Hanche plaquée, ramène les talons vers les fessiers.", equip: ["gym","machines"] },
    { name: "Fentes marchées haltères",      tip: "Grand pas, genou avant à 90°, genou arrière ne touche pas.", equip: ["gym","dumbbells"] },
    { name: "Romanian Deadlift (RDL)",       tip: "Charnière hanches, dos neutre, barre contre les jambes.", equip: ["gym","barbell"] },
    { name: "Squat bulgare haltères",        tip: "Pied arrière surélevé, poussée sur le pied avant.", equip: ["gym","dumbbells"] },
    { name: "Hack squat machine",            tip: "Pieds avant sur la plaque, amplitude profonde.", equip: ["gym","machines"] },
    { name: "Squat poids du corps",          tip: "Bras tendus devant, descends lentement, dos neutre.", equip: ["any","bodyweight"] },
    { name: "Squat bulgare poids du corps",  tip: "Pied arrière sur chaise, squat sur la jambe avant — force unilatérale intensive. Aussi efficace qu'avec haltères pour l'hypertrophie selon la recherche 2022.", equip: ["any","bodyweight"] },
    { name: "Fentes poids du corps",         tip: "Grand pas en avant, genou à 90°, pousse sur le talon pour revenir — chaque jambe alternée.", equip: ["any","bodyweight"] },
    { name: "Fentes latérales",              tip: "Pas sur le côté, genou fléchi, jambe opposée tendue — muscles intérieurs de cuisse + fessiers.", equip: ["any","bodyweight"] },
    { name: "Squat sauté",                   tip: "Squat explosif avec saut — recrutement fibres rapides, cardio + force. Atterris souple sur avant-pied.", equip: ["any","bodyweight"] },
    { name: "Step-up (marche/chaise)",       tip: "Monte sur une marche avec un pied, pousse sur le talon — quad + fessier. Ajoute des poids pour progresser.", equip: ["any","bodyweight"] },
    { name: "Glute Bridge au sol",           tip: "Sur le dos, pieds au sol, pousse les hanches vers le haut — isolation ischio-jambiers et chaîne postérieure.", equip: ["any","bodyweight"] },
    { name: "Wall sit (chaise au mur)",      tip: "Dos au mur, cuisses parallèles, tiens 30-60 sec — endurance musculaire quads massive. Complément idéal du squat.", equip: ["any","bodyweight"] },
    { name: "Pistol squat",                  tip: "Squat sur une jambe, l'autre tendue devant — force unilatérale ultime. Commence par descendre sur une chaise basse.", equip: ["any","bodyweight"], adv: true },
    { name: "Nordic Hamstring Curl",         tip: "Genou au sol, chute contrôlée en avant — le meilleur exercice ischio selon la littérature scientifique.", equip: ["gym","bodyweight"], adv: true },
    { name: "Sissy Squat",                   tip: "Genoux en avant, talons soulevés — isole les quadriceps. Exercice de bodybuilding très efficace.", equip: ["any","bodyweight"], adv: true },
    { name: "Squat pause (3 sec)",           tip: "Pause complète en bas — élimine le stretch reflex. Brutal pour l'hypertrophie des quads.", equip: ["gym","barbell"], adv: true },
    { name: "Front Squat (squat avant)",     tip: "Barre sur deltoïdes antérieurs — verticalité maximale du tronc, quads en feu.", equip: ["gym","barbell"], adv: true },
  ],
  glutes: [
    { name: "Hip thrust barre",              tip: "Omoplate sur banc, poussée explosive, serre 2 secondes.", equip: ["gym","barbell"] },
    { name: "Squat bulgare haltères",        tip: "Focus poussée pied avant — activation fessier maximale.", equip: ["gym","dumbbells"] },
    { name: "Fentes inversées",              tip: "Recule un pied, genou à 90°, pousse sur le talon.", equip: ["gym","dumbbells","bodyweight"] },
    { name: "Abducteur machine",             tip: "Amplitude complète, maintiens 1 sec en ouverture max.", equip: ["gym","machines"] },
    { name: "Kickback câble",                tip: "Hanche stable, extension complète, contracte en haut.", equip: ["gym","cables"] },
    { name: "Pont fessier",                  tip: "Poussée explosive, serre les fessiers 2 secondes.", equip: ["any","bodyweight"] },
    { name: "Pont fessier unilatéral",       tip: "Une jambe tendue vers le plafond, pousse avec l'autre — double la charge sur le fessier cible. Correction des déséquilibres.", equip: ["any","bodyweight"] },
    { name: "Donkey kick (quadrupédie)",     tip: "À quatre pattes, lance le genou vers le plafond, pied fléchi — isolation fessier en extension. 15-20 reps par côté.", equip: ["any","bodyweight"] },
    { name: "Clamshell (palourde)",          tip: "Couché sur le côté, genoux fléchis, ouvre et ferme — fessier moyen et rotateurs externes. Essentiel pour la stabilité du genou.", equip: ["any","bodyweight"] },
    { name: "Abduction debout poids du corps", tip: "Debout, lève la jambe sur le côté à 45° — fessier moyen en isolation. Tiens une seconde en haut.", equip: ["any","bodyweight"] },
    { name: "Hip thrust au sol sans matériel", tip: "Dos au sol, pieds à plat, pousse les hanches au maximum — version débutant du hip thrust. Aussi efficace si vitesse contrôlée.", equip: ["any","bodyweight"] },
    { name: "Step-up fessier (marche)",      tip: "Monte sur une marche en poussant sur le talon, ne t'aide pas du pied arrière — force sur le fessier de la jambe avant.", equip: ["any","bodyweight"] },
    { name: "Hip thrust unilatéral barre",   tip: "Une jambe — double la charge sur le fessier. Méthode recommandée par Bret Contreras.", equip: ["gym","barbell"], adv: true },
    { name: "Cable Pull-Through",            tip: "Câble entre les jambes, charnière hanches — tension continue sur fessiers.", equip: ["gym","cables"], adv: true },
  ],
  abs: [
    { name: "Crunch à la poulie",            tip: "Arrondi du dos vers les genoux — pas juste incliner.", equip: ["gym","cables"] },
    { name: "Relevé de jambes suspendu",     tip: "Jambes tendues, monte à la parallèle, descends en 4 sec.", equip: ["gym","bodyweight"] },
    { name: "Planche frontale",              tip: "Corps aligné, serre le ventre fort, respire normalement.", equip: ["any","bodyweight"] },
    { name: "Planche latérale",              tip: "Corps aligné sur le côté, hanche en l'air — obliques ciblés.", equip: ["any","bodyweight"] },
    { name: "Russian Twist lesté",           tip: "Pieds décollés, rotation complète, touche au sol chaque côté.", equip: ["gym","dumbbells"] },
    { name: "Crunch vélo",                   tip: "Coude vers genou opposé — rotation du buste réelle.", equip: ["any","bodyweight"] },
    { name: "Ab wheel (molette)",            tip: "Déroule lentement, arrête avant de perdre le gainage.", equip: ["gym"] },
    { name: "Crunch classique",              tip: "Sans tirer la nuque, soulève les épaules, contracte 1 sec.", equip: ["any","bodyweight"] },
    { name: "Relevé de jambes au sol",       tip: "Jambes tendues, lombaires au sol, descends sans toucher — contrôle total du core.", equip: ["any","bodyweight"] },
    { name: "Mountain climbers",             tip: "Position de pompe, alterne genoux vers la poitrine rapidement — cardio + gainage dynamique.", equip: ["any","bodyweight"] },
    { name: "Toe touches au sol",            tip: "Jambes verticales, soulève les épaules vers les pieds — contraction courte et intense du droit abdominal.", equip: ["any","bodyweight"] },
    { name: "Dead bug",                      tip: "Dos au sol, bras et jambes opposés s'étendent — stabilisation anti-rotation. Meilleur exercice abdo fonctionnel selon les kiné.", equip: ["any","bodyweight"] },
    { name: "V-up",                          tip: "Bras et jambes se rejoignent simultanément — difficulté élevée. Corps en V à chaque répétition. Excellent pour le bas de l'abdomen.", equip: ["any","bodyweight"], adv: true },
    { name: "Dragon Flag",                   tip: "Corps rigide, descends depuis l'épaule — exercice de Bruce Lee.", equip: ["gym","bodyweight"], adv: true },
    { name: "Copenhagen Plank",              tip: "Cheville sur banc, hanche en l'air — meilleur exercice d'adducteur selon la recherche.", equip: ["gym","bodyweight"], adv: true },
    { name: "Hollow Body Hold",              tip: "Position creuse, lombes au sol, jambes tendues à 30° — base de la gymnastique.", equip: ["any","bodyweight"], adv: true },
  ],
  calves: [
    { name: "Mollets debout (machine)",      tip: "Amplitude maximale — descends en étirement complet.", equip: ["gym","machines"] },
    { name: "Mollets assis (machine)",       tip: "Cible le soléaire — souvent négligé, très efficace.", equip: ["gym","machines"] },
    { name: "Mollets à la presse",           tip: "Pieds en bas de la plaque, amplitude complète.", equip: ["gym","machines"] },
    { name: "Mollets unilatéraux",           tip: "Une jambe à la fois sur une marche, amplitude complète.", equip: ["any","bodyweight","dumbbells"] },
    { name: "Donkey calf raise lesté",       tip: "Buste penché à 90°, poids sur le bas du dos — position optimale selon Arnold. Élongation maximale du gastrocnémien.", equip: ["gym"], adv: true },
    { name: "Tibialis raise",                tip: "Talons sur une marche, relève la pointe des pieds — renforce le tibial antérieur. Réduit le risque de périostite.", equip: ["any","bodyweight"], adv: true },
  ],
  traps: [
    { name: "Haussement d'épaules barre",   tip: "Monte vers les oreilles, tiens 1 sec, descends lentement.", equip: ["gym","barbell"] },
    { name: "Rowing menton",                 tip: "Prise serrée, tire vers le menton, coudes au-dessus.", equip: ["gym","barbell","cables"] },
    { name: "Haussement haltères",           tip: "Mouvement pur épaule — pas de rotation du cou.", equip: ["gym","dumbbells"] },
    { name: "Face pull câble",               tip: "Tire vers le visage en séparant — trapèze + deltoïde arrière.", equip: ["gym","cables"] },
    { name: "Snatch-grip shrug",             tip: "Prise olympique large — stretch maximal des trapèzes supérieurs et moyens. Exercice de référence chez les haltérophiles.", equip: ["gym","barbell"], adv: true },
  ],
  forearms: [
    { name: "Curl poignets barre",           tip: "Avant-bras sur cuisses, fléchis lentement, amplitude complète.", equip: ["gym","barbell"] },
    { name: "Reverse curl barre EZ",         tip: "Prise pronation, coudes fixes, monte à hauteur des épaules.", equip: ["gym","barbell"] },
    { name: "Farmer's carry haltères",      tip: "Marche avec des haltères lourds — renforce la préhension.", equip: ["gym","dumbbells"] },
    { name: "Farmer's walk lourd (hex bar)", tip: "Charge maximale, marche 20-30m — force de préhension + stabilité du tronc. Les strongmen le font avec 200kg+.", equip: ["gym"], adv: true },
    { name: "Plate pinch (2 disques)",       tip: "Pince 2 disques face à face — entraîne la pince, la prise la plus faible chez la plupart des athlètes.", equip: ["gym"], adv: true },
  ],
  fullbody: [
    { name: "Squat barre",              tip: "Mouvement roi. Dos neutre, cuisses parallèles.", equip: ["gym","barbell"] },
    { name: "Développé couché barre",   tip: "Descends lentement, pousse en expirant.", equip: ["gym","barbell"] },
    { name: "Soulevé de terre",         tip: "Dos neutre, poussée jambes, barre contre les tibias.", equip: ["gym","barbell"] },
    { name: "Tirage vertical",          tip: "Prise large, contracte les omoplates en bas.", equip: ["gym","cables"] },
    { name: "Développé militaire",      tip: "Barre devant, pousse vertical, abdos engagés.", equip: ["gym","barbell"] },
    { name: "Curl barre",               tip: "Coudes fixes, supine en montant.", equip: ["gym","barbell"] },
    { name: "Planche frontale",         tip: "Corps aligné, respirations profondes.", equip: ["any","bodyweight"] },
    { name: "Hip thrust barre",         tip: "Poussée explosive, serre les fessiers en haut.", equip: ["gym","barbell"] },
    { name: "Dips lestés",              tip: "Buste droit — isolation triceps.", equip: ["gym"] },
    { name: "Clean & Press",            tip: "Arraché + développé en un mouvement — explosive totale. Base de l'haltérophilie olympique. Coordination neuro-musculaire maximale.", equip: ["gym","barbell"], adv: true },
    { name: "Turkish Get-Up",           tip: "Du sol au debout avec haltère — mobilité + stabilité sur tous les plans. Exercice fonctionnel complet en un seul mouvement.", equip: ["gym","dumbbells"], adv: true },
  ],
};

// Wendler 5/3/1 — les 4 principaux mouvements de force
const WENDLER_LIFTS = {
  fr: [
    { name: "Squat barre", note: "Descends en dessous du parallèle. Dos neutre absolument.", muscle: "Jambes" },
    { name: "Développé couché barre", note: "Descends la barre jusqu'à la poitrine, poussée explosive.", muscle: "Pectoraux" },
    { name: "Soulevé de terre", note: "Barre collée aux tibias, dos neutre, poussée verticale.", muscle: "Dos / Ischio" },
    { name: "Développé militaire", note: "Debout ou assis, barre devant, pousse strict.", muscle: "Épaules" },
  ],
  en: [
    { name: "Barbell Squat", note: "Break parallel. Absolute neutral spine.", muscle: "Legs" },
    { name: "Bench Press", note: "Bar to chest, explosive drive.", muscle: "Chest" },
    { name: "Deadlift", note: "Bar against shins, neutral back, vertical push.", muscle: "Back / Hamstrings" },
    { name: "Overhead Press", note: "Standing or seated, strict press.", muscle: "Shoulders" },
  ],
};

const WENDLER_CYCLES = [
  { week: 1, label: "5/5/5+",  sets: [{pct:65,reps:"5"},{pct:75,reps:"5"},{pct:85,reps:"5+"}] },
  { week: 2, label: "3/3/3+",  sets: [{pct:70,reps:"3"},{pct:80,reps:"3"},{pct:90,reps:"3+"}] },
  { week: 3, label: "5/3/1+",  sets: [{pct:75,reps:"5"},{pct:85,reps:"3"},{pct:95,reps:"1+"}] },
  { week: 4, label: "Déload",   sets: [{pct:40,reps:"5"},{pct:50,reps:"5"},{pct:60,reps:"5"}]  },
];

const WENDLER_ACCESSORIES = {
  fr: {
    squat:  ["Presse à cuisse","Leg curl couché","Fentes marchées haltères"],
    bench:  ["Développé incliné haltères","Écarté câble basse poulie","Dips (banc / barres parallèles)"],
    deadlift: ["Romanian Deadlift (RDL)","Tirage vertical prise large","Rowing barre pronation"],
    press:  ["Élévations latérales haltères","Arnold Press","Face pull câble"],
  },
  en: {
    squat:  ["Leg Press","Leg Curl","Walking Lunges"],
    bench:  ["Incline DB Press","Cable Fly","Dips"],
    deadlift: ["Romanian Deadlift","Lat Pulldown","Barbell Row"],
    press:  ["Lateral Raises","Arnold Press","Face Pull"],
  },
};

function generateWendler531(form, lang = "fr") {
  const lifts = WENDLER_LIFTS[lang] || WENDLER_LIFTS.fr;
  const accessories = WENDLER_ACCESSORIES[lang] || WENDLER_ACCESSORIES.fr;
  const accKeys = ["squat","bench","deadlift","press"];

  const days = [];
  let dayNum = 1;

  const tmNote = lang === "en"
    ? "Training Max (TM) = 90% of your estimated 1RM. Use this as your 100% for all percentages."
    : "Training Max (TM) = 90% de ton 1RM estimé. Utilise cette valeur comme base pour tous les pourcentages.";

  WENDLER_CYCLES.forEach((cycle) => {
    const weekLabel = lang === "en"
      ? `Week ${cycle.week} — ${cycle.label}`
      : `Semaine ${cycle.week} — ${cycle.label}`;

    lifts.forEach((lift, liftIdx) => {
      const accKey = accKeys[liftIdx];
      const accList = accessories[accKey] || [];

      const exercises = [];

      // Main lift: warmup + working sets
      if (cycle.label === "Déload" || cycle.label === "Deload") {
        exercises.push({
          name: lift.name,
          muscle: lift.muscle,
          sets: 3,
          reps: "5",
          rest: "3 min",
          restSec: 180,
          tip: lift.note,
          pcts: cycle.sets.map(s => `${s.pct}%`).join(" / "),
          isWendlerMain: true,
          weekLabel: cycle.label,
        });
      } else {
        exercises.push({
          name: lift.name,
          muscle: lift.muscle,
          sets: 3,
          reps: cycle.sets.map(s => s.reps).join(" / "),
          rest: "3-4 min",
          restSec: 210,
          tip: lift.note,
          pcts: cycle.sets.map(s => `${s.pct}%`).join(" / "),
          isWendlerMain: true,
          weekLabel: cycle.label,
        });
      }

      // Accessories: 3x10 de base
      const goalNote = lang === "en"
        ? "BBB or 5x10 at 60% of TM recommended for hypertrophy. 3x10 for strength focus."
        : "BBB conseillé : 5x10 à 60% du TM pour l'hypertrophie. 3x10 pour focus force.";

      accList.slice(0, 3).forEach(accName => {
        exercises.push({
          name: accName,
          muscle: "",
          sets: 3,
          reps: "10-12",
          rest: "90 sec",
          restSec: 90,
          tip: goalNote,
          isAccessory: true,
        });
      });

      days.push({
        dayNumber: dayNum,
        name: `${weekLabel} — ${lift.name.split(" ")[0]}`,
        muscles: `${lift.muscle} · Accessoires`,
        isRest: false,
        isWendler: true,
        weekLabel,
        liftName: lift.name,
        exercises,
      });
      dayNum++;

      // Rest day between sessions
      days.push({
        dayNumber: dayNum,
        name: lang === "en" ? "REST" : "REPOS",
        muscles: lang === "en" ? "Recovery" : "Récupération",
        isRest: true, exercises: [],
      });
      dayNum++;
    });
  });

  const tmHint = lang === "en"
    ? "Jim Wendler 5/3/1 — 4-week periodized cycle across 4 main lifts. The '+' sets mean you do as many reps as possible (AMRAP) with perfect form."
    : "Jim Wendler 5/3/1 — cycle périodisé 4 semaines sur les 4 grands mouvements. Le '+' signifie AMRAP (autant de reps que possible) avec une technique parfaite.";

  return {
    programName: lang === "en" ? "Wendler 5/3/1 — Strength Cycle" : "Wendler 5/3/1 — Cycle Force",
    summary: tmHint,
    goal: lang === "en" ? "Strength / Powerbuilding" : "Force / Powerbuilding",
    level: lang === "en" ? "Intermediate → Advanced" : "Intermédiaire → Confirmé",
    frequency: lang === "en" ? "4 sessions / week" : "4 séances / semaine",
    duration: "16 semaines (4 cycles)",
    isWendler: true,
    tmNote,
    days,
  };
}

// ── STRENGTH PROGRAM DISPATCHER ───────────────────────────────────────────────
function generateStrengthProgram(form, lang = "fr") {
  const method = form.method || "531";
  if (method === "531") return generateWendler531(form, lang);
  if (method === "gzclp") return generateGZCLP(form, lang);
  if (method === "ss") return generateStartingStrength(form, lang);
  return generateWendler531(form, lang);
}

// ── GZCLP — Cody LeFever ──────────────────────────────────────────────────────
// Source: http://swoleateveryheight.blogspot.com/2016/02/gzcl-applications-adaptations.html
// T1: 5×3+ AMRAP | T2: 3×10+ AMRAP | T3: 3×15 accessoires
function generateGZCLP(form, lang = "fr") {
  const isFr = lang !== "en";

  const lifts = isFr
    ? [
        { name: "Squat barre",            t2: "Romanian Deadlift (RDL)",    t3a: "Leg extension", t3b: "Leg curl couché" },
        { name: "Développé couché barre", t2: "Développé incliné haltères", t3a: "Dips (banc / barres parallèles)", t3b: "Écarté câble basse poulie" },
        { name: "Soulevé de terre",       t2: "Squat bulgare haltères",     t3a: "Tirage vertical prise large", t3b: "Rowing haltère unilatéral" },
        { name: "Développé militaire",    t2: "Arnold Press",               t3a: "Élévations latérales haltères", t3b: "Face pull câble" },
      ]
    : [
        { name: "Barbell Squat",         t2: "Romanian Deadlift",    t3a: "Leg Extension",   t3b: "Leg Curl" },
        { name: "Bench Press",           t2: "Incline DB Press",     t3a: "Dips",            t3b: "Cable Fly" },
        { name: "Deadlift",              t2: "Bulgarian Split Squat",t3a: "Lat Pulldown",    t3b: "DB Row" },
        { name: "Overhead Press",        t2: "Arnold Press",         t3a: "Lateral Raises",  t3b: "Face Pull" },
      ];

  const progressionNote = isFr
    ? "Progression linéaire : +5kg bas du corps, +2.5kg haut du corps à chaque séance tant que tu complètes tous les sets. Si tu rates T1 → passe à 6×2+, puis 10×1+, puis reset à 85% du 5RM."
    : "Linear progression: +10lb lower body, +5lb upper body each session while completing all sets. If you fail T1 → drop to 6×2+, then 10×1+, then reset to 85% of 5RM.";

  const days = lifts.map((lift, i) => ({
    dayNumber: i + 1,
    isRest: false,
    isGZCLP: true,
    name: `Jour ${i + 1} — ${lift.name.split(" ")[0].toUpperCase()}`,
    muscles: `${lift.name} · ${lift.t2}`,
    exercises: [
      {
        name: lift.name,
        muscle: isFr ? "Mouvement Principal T1" : "Main Lift T1",
        sets: 5, reps: "3+ (AMRAP dernier set)",
        rest: "3-5 min", restSec: 240,
        tip: isFr
          ? "T1 — Charge lourde. Dernier set AMRAP : pousse jusqu'à 1-2 reps avant l'échec. Note le nombre de reps pour tracker la progression."
          : "T1 — Heavy load. Last set AMRAP: push to 1-2 reps before failure. Log reps to track progress.",
        isTier1: true,
      },
      {
        name: lift.t2,
        muscle: isFr ? "Accessoire Principal T2" : "Primary Accessory T2",
        sets: 3, reps: "10+ (AMRAP dernier set)",
        rest: "2-3 min", restSec: 150,
        tip: isFr
          ? "T2 — 65-85% de l'intensité T1. Dernier set AMRAP. Poids plus léger que T1, volume plus élevé."
          : "T2 — 65-85% of T1 intensity. Last set AMRAP. Lighter than T1, more volume.",
        isTier2: true,
      },
      {
        name: lift.t3a,
        muscle: isFr ? "Accessoire T3" : "Accessory T3",
        sets: 3, reps: "15-20",
        rest: "90 sec", restSec: 90,
        tip: isFr ? "T3 — Travail accessoire léger. Concentration sur la technique et le pump." : "T3 — Light accessory work. Focus on technique and muscle pump.",
        isTier3: true,
      },
      {
        name: lift.t3b,
        muscle: isFr ? "Accessoire T3" : "Accessory T3",
        sets: 3, reps: "15-20",
        rest: "90 sec", restSec: 90,
        tip: isFr ? "T3 — Corrige les déséquilibres musculaires et renforce les zones faibles." : "T3 — Fix muscle imbalances and strengthen weak areas.",
        isTier3: true,
      },
    ],
  }));

  return {
    programName: "GZCLP — Cody LeFever",
    summary: isFr
      ? "Progression linéaire 3 niveaux (T1/T2/T3). Conçu par Cody LeFever (compétiteur powerlifting). Idéal pour maximiser force ET masse simultanément."
      : "3-tier linear progression (T1/T2/T3). Designed by Cody LeFever (powerlifting competitor). Ideal to maximize strength AND mass simultaneously.",
    goal: isFr ? "Force & Powerbuilding" : "Strength & Powerbuilding",
    level: isFr ? "Débutant → Intermédiaire" : "Beginner → Intermediate",
    frequency: isFr ? "4 séances/semaine" : "4 sessions/week",
    duration: isFr ? "12-16 semaines" : "12-16 weeks",
    isStrengthMethod: true,
    methodId: "gzclp",
    progressionNote,
    days,
  };
}

// ── Starting Strength — Mark Rippetoe ─────────────────────────────────────────
// Source: Starting Strength by Mark Rippetoe (3rd edition)
// ABA / BAB alternation — A: Squat+Bench+Deadlift | B: Squat+Press+Deadlift
function generateStartingStrength(form, lang = "fr") {
  const isFr = lang !== "en";

  const progressionNote = isFr
    ? "Progression par séance : +2.5kg Squat/DL, +1.25kg Développé/Press. En cas de stagnation : 1 reset (10% de réduction), puis passage à un programme intermédiaire."
    : "Session-to-session progression: +5lb Squat/DL, +2.5lb Bench/Press. On stall: 1 reset (10% reduction), then move to intermediate program.";

  const workoutA_fr = [
    { name: "Squat barre",            muscle: "Jambes",    sets: 3, reps: "5",  rest: "3-5 min", restSec: 240, tip: "Mouvement principal du programme. Descends en dessous du parallèle. +2.5kg à chaque séance." },
    { name: "Développé couché barre", muscle: "Pectoraux", sets: 3, reps: "5",  rest: "3-5 min", restSec: 240, tip: "Descends la barre jusqu'à la poitrine. Pousse explosif. Alterne avec le Press B." },
    { name: "Soulevé de terre",       muscle: "Dos / Ischio", sets: 1, reps: "5", rest: "5 min", restSec: 300, tip: "1 série de 5 reps lourde. Dos neutre absolu. +2.5kg à chaque séance." },
  ];

  const workoutB_fr = [
    { name: "Squat barre",         muscle: "Jambes",   sets: 3, reps: "5",  rest: "3-5 min", restSec: 240, tip: "Squatez chaque séance. C'est le fondement du programme. Augmente le poids à chaque fois." },
    { name: "Développé militaire", muscle: "Épaules",  sets: 3, reps: "5",  rest: "3-5 min", restSec: 240, tip: "Debout, strict, barre devant. Alterne avec le Bench A. Push strict sans aide des jambes." },
    { name: "Soulevé de terre",    muscle: "Dos / Ischio", sets: 1, reps: "5", rest: "5 min", restSec: 300, tip: "Même protocole qu'en séance A. 1×5 lourd. Progression séance par séance." },
  ];

  const workoutA_en = [
    { name: "Barbell Squat",  muscle: "Legs",          sets: 3, reps: "5",  rest: "3-5 min", restSec: 240, tip: "Cornerstone of the program. Break parallel. +5lb every session." },
    { name: "Bench Press",    muscle: "Chest",          sets: 3, reps: "5",  rest: "3-5 min", restSec: 240, tip: "Bar to chest. Explosive drive. Alternates with Press on Day B." },
    { name: "Deadlift",       muscle: "Back / Hams",    sets: 1, reps: "5",  rest: "5 min",   restSec: 300, tip: "1 heavy set of 5. Neutral spine. +5lb every session." },
  ];

  const workoutB_en = [
    { name: "Barbell Squat",     muscle: "Legs",       sets: 3, reps: "5",  rest: "3-5 min", restSec: 240, tip: "Squat every session. The foundation. Add weight every time." },
    { name: "Overhead Press",    muscle: "Shoulders",  sets: 3, reps: "5",  rest: "3-5 min", restSec: 240, tip: "Standing, strict press. Alternates with Bench A. No leg drive." },
    { name: "Deadlift",          muscle: "Back / Hams",sets: 1, reps: "5",  rest: "5 min",   restSec: 300, tip: "Same as Day A. 1×5 heavy. Progress session to session." },
  ];

  const wA = isFr ? workoutA_fr : workoutA_en;
  const wB = isFr ? workoutB_fr : workoutB_en;

  // 3 weeks = ABA + BAB = 6 sessions to show the full pattern
  const sessionPattern = [
    { label: isFr ? "Séance A — Développé couché" : "Session A — Bench", exercises: wA, note: isFr ? "Semaine 1 Lundi" : "Week 1 Monday" },
    { label: isFr ? "Séance B — Développé militaire" : "Session B — OHP", exercises: wB, note: isFr ? "Semaine 1 Mercredi" : "Week 1 Wednesday" },
    { label: isFr ? "Séance A — Développé couché" : "Session A — Bench", exercises: wA, note: isFr ? "Semaine 1 Vendredi" : "Week 1 Friday" },
    { label: isFr ? "Séance B — Développé militaire" : "Session B — OHP", exercises: wB, note: isFr ? "Semaine 2 Lundi" : "Week 2 Monday" },
    { label: isFr ? "Séance A — Développé couché" : "Session A — Bench", exercises: wA, note: isFr ? "Semaine 2 Mercredi" : "Week 2 Wednesday" },
    { label: isFr ? "Séance B — Développé militaire" : "Session B — OHP", exercises: wB, note: isFr ? "Semaine 2 Vendredi" : "Week 2 Friday" },
  ];

  const days = [];
  sessionPattern.forEach((s, i) => {
    days.push({
      dayNumber: i + 1,
      isRest: false,
      isStartingStrength: true,
      name: s.label,
      muscles: s.note,
      exercises: s.exercises.map(ex => ({ ...ex, restSec: ex.restSec || 240 })),
    });
    if (i < sessionPattern.length - 1) {
      days.push({ dayNumber: i + 2, isRest: true, name: isFr ? "REPOS" : "REST", muscles: isFr ? "Récupération" : "Recovery", exercises: [] });
    }
  });

  return {
    programName: "Starting Strength — Rippetoe",
    summary: isFr
      ? "Full body 3×/semaine sur les mouvements fondamentaux. Ajout de poids à chaque séance. Schéma ABA/BAB. Référence absolue pour débutants selon Mark Rippetoe."
      : "Full body 3×/week on fundamental movements. Add weight every session. ABA/BAB rotation. The absolute beginner reference by Mark Rippetoe.",
    goal: isFr ? "Force / Fondamentaux" : "Strength / Fundamentals",
    level: isFr ? "Débutant" : "Beginner",
    frequency: isFr ? "3 séances/semaine" : "3 sessions/week",
    duration: isFr ? "8-16 semaines" : "8-16 weeks",
    isStrengthMethod: true,
    methodId: "ss",
    progressionNote,
    days,
  };
}


const GOAL_PARAMS = {
  strength:    { sets: 5, reps: "3-5",   rest: "3 min",  restSec: 180 },
  hypertrophy: { sets: 4, reps: "8-12",  rest: "90 sec", restSec: 90  },
  endurance:   { sets: 3, reps: "15-20", rest: "45 sec", restSec: 45  },
  weight_loss: { sets: 4, reps: "12-15", rest: "60 sec", restSec: 60  },
  toning:      { sets: 3, reps: "12-15", rest: "75 sec", restSec: 75  },
};

const MUSCLE_EX_COUNT = {
  chest: 4, back: 5, legs: 5, glutes: 4,
  shoulders: 4, abs: 4,
  biceps: 3, triceps: 3, calves: 2, traps: 2, forearms: 2,
  fullbody: 8,
};

const SYNERGY_GROUPS = [
  { id: "push",     muscles: ["chest","shoulders","triceps"],         name: "PUSH" },
  { id: "pull",     muscles: ["back","biceps","traps","forearms"],    name: "PULL" },
  { id: "legs",     muscles: ["legs","glutes","calves"],              name: "LEGS" },
  { id: "core",     muscles: ["abs"],                                 name: "CORE" },
  { id: "fullbody", muscles: ["fullbody"],                            name: "FULL BODY" },
];

const PROGRAM_NAMES_FR = {
  ppl: ["Progressive PPL","Iron PPL Protocol","Atlas PPL","The PPL Method"],
  ul: ["Upper/Lower Power","Binary Force Protocol","Dual Split System"],
  fullbody: ["Full Body Blitz","Total Body Protocol","Compound Foundation","The Complete Athlete"],
  custom: ["Custom Gainz Program","Precision Split","Tailored Strength Plan","The Personal Protocol"],
};

const PROGRAM_NAMES_EN = {
  ppl: ["Progressive PPL","Iron PPL Protocol","Atlas PPL","The PPL Method"],
  ul: ["Upper/Lower Power","Binary Force Protocol","Dual Split System"],
  fullbody: ["Full Body Blitz","Total Body Protocol","Compound Foundation","The Complete Athlete"],
  custom: ["Custom Gainz Program","Precision Split","Tailored Strength Plan","The Personal Protocol"],
};

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function getAvailableExercises(muscleId, equipment, useAdvanced = false) {
  const all = EXERCISE_DB[muscleId] || [];
  const filtered = useAdvanced ? all : all.filter(ex => !ex.adv);
  if (!equipment || equipment.length === 0) return filtered;
  return filtered.filter(ex => ex.equip.includes("any") || ex.equip.some(e => equipment.includes(e)));
}

function pickExercises(muscleId, count, equipment, usedNames = new Set(), useAdvanced = false) {
  const available = getAvailableExercises(muscleId, equipment, useAdvanced).filter(ex => !usedNames.has(ex.name));
  if (useAdvanced && count >= 2) {
    // Always keep 1 classic as anchor, rest are advanced
    const advEx = available.filter(ex => ex.adv).sort(() => Math.random() - 0.5);
    const stdEx = available.filter(ex => !ex.adv).sort(() => Math.random() - 0.5);
    const classicCount = Math.max(1, Math.floor(count * 0.35)); // ~1 classic per 3 exercises
    const advCount = count - classicCount;
    return [...stdEx.slice(0, classicCount), ...advEx.slice(0, advCount)].slice(0, count);
  }
  return [...available].sort(() => Math.random() - 0.5).slice(0, Math.min(count, available.length));
}

// SANDWICH TECHNIQUE pour hypertrophie :
// Muscle principal : 2 exercices → autres muscles → 1 finisher sur le muscle principal
// Inspiré du principe de pré-fatigue et de retour au muscle cible en fin de séance
function buildSandwichSession(primaryMuscle, secondaryMuscles, params, equipment, levelMult, goal, useAdvanced = false) {
  const exercises = [];
  const usedNames = new Set();

  const primaryCount = Math.max(2, Math.round(MUSCLE_EX_COUNT[primaryMuscle] * levelMult));
  const primaryExercises = pickExercises(primaryMuscle, primaryCount, equipment, usedNames, useAdvanced);
  primaryExercises.forEach(ex => usedNames.add(ex.name));

  const mainSets = Math.max(2, Math.round(params.sets * levelMult));

  primaryExercises.slice(0, 2).forEach(ex => {
    exercises.push({ ...ex, muscle: primaryMuscle.charAt(0).toUpperCase() + primaryMuscle.slice(1), sets: mainSets, reps: params.reps, rest: params.rest, restSec: params.restSec, tip: ex.tip });
  });

  secondaryMuscles.forEach(muscleId => {
    const count = Math.max(1, Math.round((MUSCLE_EX_COUNT[muscleId] || 2) * 0.8 * levelMult));
    const picked = pickExercises(muscleId, count, equipment, usedNames, useAdvanced);
    picked.forEach(ex => usedNames.add(ex.name));
    picked.forEach(ex => exercises.push({
      ...ex,
      muscle: muscleId.charAt(0).toUpperCase() + muscleId.slice(1),
      sets: Math.max(2, Math.round(params.sets * levelMult * 0.9)),
      reps: params.reps, rest: params.rest, restSec: params.restSec, tip: ex.tip,
    }));
  });

  if (primaryExercises.length > 2) {
    const finisher = primaryExercises[2];
    exercises.push({
      ...finisher,
      muscle: primaryMuscle.charAt(0).toUpperCase() + primaryMuscle.slice(1),
      sets: Math.max(2, Math.round(params.sets * levelMult) - 1),
      reps: goal === "hypertrophy" ? "12-15" : params.reps,
      rest: goal === "hypertrophy" ? "60 sec" : params.rest,
      restSec: goal === "hypertrophy" ? 60 : params.restSec,
      tip: finisher.tip, isFinisher: true,
    });
  }

  return exercises.slice(0, 8);
}

function generateProgram(form) {
  const { muscles, goal, level, equipment, daysPerWeek, useAdvanced, sessionDuration = 60 } = form;
  const params = GOAL_PARAMS[goal] || GOAL_PARAMS.hypertrophy;
  const exMult = { strength: 0.7, hypertrophy: 1.0, endurance: 1.1, weight_loss: 1.1, toning: 1.0 }[goal] || 1.0;
  const levelMult = level === "beginner" ? 0.75 : level === "advanced" ? 1.15 : 1.0;

  // Duration multiplier: 30min = fewer exercises, 60min = standard, 90min = more
  const durationMult = sessionDuration === 30 ? 0.55 : sessionDuration === 90 ? 1.45 : 1.0;
  // Hard cap on total exercises per session based on duration
  const maxExercises = sessionDuration === 30 ? 4 : sessionDuration === 90 ? 10 : 7;

  const useSandwich = goal === "hypertrophy" || goal === "toning";

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
    let exercises = [];

    if (useSandwich && synGroup.activeMuscles.length >= 2) {
      const sorted = [...synGroup.activeMuscles].sort((a, b) =>
        (MUSCLE_EX_COUNT[b] || 2) - (MUSCLE_EX_COUNT[a] || 2)
      );
      const primary = sorted[0];
      const secondaries = sorted.slice(1);
      exercises = buildSandwichSession(primary, secondaries, params, equipment, levelMult * durationMult, goal, useAdvanced);
      exercises = exercises.slice(0, maxExercises);
    } else {
      const usedNames = new Set();
      for (const muscleId of synGroup.activeMuscles) {
        const baseCount = MUSCLE_EX_COUNT[muscleId] || 2;
        const targetCount = Math.max(1, Math.round(baseCount * exMult * levelMult * durationMult));
        const picked = pickExercises(muscleId, targetCount, equipment, usedNames, useAdvanced);
        picked.forEach(ex => usedNames.add(ex.name));
        const finalSets = Math.max(2, Math.round(params.sets * levelMult));
        picked.forEach(ex => exercises.push({
          name: ex.name,
          muscle: muscleId.charAt(0).toUpperCase() + muscleId.slice(1),
          sets: finalSets, reps: params.reps, rest: params.rest, restSec: params.restSec, tip: ex.tip,
        }));
      }
      exercises = exercises.slice(0, maxExercises);
    }

    const muscleLabels = synGroup.activeMuscles
      .map(m => MUSCLES_UI.find(x => x.id === m)?.label || m).join(" & ");

    days.push({
      dayNumber, isRest: false,
      name: `${synGroup.name} — ${muscleLabels}`,
      muscles: synGroup.activeMuscles.map(m => MUSCLES_UI.find(x => x.id === m)?.label || m).join(" • "),
      exercises,
    });
    dayNumber++;

    const nextGroup = trainingDays[i + 1]?.synGroup;
    if (nextGroup && nextGroup.id === synGroup.id && (7 - daysPerWeek) > 0) {
      days.push({ dayNumber, name: "REPOS", muscles: "Récupération", isRest: true, exercises: [] });
      dayNumber++;
    }
  }

  const goalObj = GOALS_TRAINING.find(g => g.id === goal);
  const levelObj = LEVELS.find(l => l.id === level);
  const hasAll3 = ["push","pull","legs"].every(gid => activeSynGroups.some(sg => sg.id === gid));
  const isFullBody = muscles.includes("fullbody");
  const hasUL = activeSynGroups.some(sg => ["push","pull"].includes(sg.id)) && activeSynGroups.some(sg => sg.id === "legs");
  const nameKey = isFullBody ? "fullbody" : hasAll3 ? "ppl" : hasUL ? "ul" : "custom";

  const synLabel = activeSynGroups.map(g => g.name).join("/") || "Custom";

  return {
    programName: pick(PROGRAM_NAMES_FR[nameKey]),
    summary: `${goalObj?.label} · Split ${synLabel} · ${levelObj?.label}${useSandwich ? " · Sandwich Periodization" : ""}`,
    goal: goalObj?.label, level: levelObj?.label,
    frequency: `${daysPerWeek} jours/semaine`,
    duration: level === "beginner" ? "6-8 semaines" : level === "advanced" ? "12-16 semaines" : "8-12 semaines",
    days,
  };
}

// ── NUTRITION ─────────────────────────────────────────────────────────────────
// Les objectifs du profil sont maintenant des objectifs de composition corporelle
// alignés avec la nutrition ET la programmation

// Correspondance entre objectif corps et objectif entraînement
const BODY_GOAL_TO_TRAINING = {
  bulk:        "hypertrophy",
  cut:         "weight_loss",
  recomp:      "toning",
  summer:      "weight_loss",
  maintain:    "toning",
  powerlifting:"strength",
};

const BODY_GOAL_CALORIE_ADJ = {
  bulk:         +300,   // Surplus modéré — lean bulk
  cut:          -350,   // Déficit — perte de graisse préservant le muscle
  recomp:         0,    // Maintien — recomposition (cycle)
  summer:       -300,   // Déficit doux — sèche
  maintain:       0,    // Maintien
  powerlifting: +150,   // Léger surplus pour la force
};

// SOURCES : ISSN (2017), Morton et al. (2018), Stokes et al. (2018)
// Personne active non pro : 1.4–1.8g/kg suffit largement
// Cut : légèrement plus élevé pour préserver la masse musculaire
const BODY_GOAL_PROTEIN_FACTOR = {
  bulk:         1.7,   // Prise de masse : 1.6–1.8g/kg
  cut:          2.0,   // Sèche : 1.8–2.2g/kg (satiété + préservation musculaire)
  recomp:       1.8,   // Recompo : 1.6–2.0g/kg
  summer:       2.0,   // Sèche estivale : idem cut
  maintain:     1.4,   // Maintien : 1.2–1.6g/kg suffit
  powerlifting: 1.8,   // Force : 1.6–2.0g/kg
};

function calculateNutrition(profile) {
  if (!profile?.weight || !profile?.height || !profile?.age) return null;
  const w = parseFloat(profile.weight), h = parseFloat(profile.height), a = parseInt(profile.age);
  if (!w || !h || !a) return null;

  const bmr = profile.sex === "f"
    ? 447.593 + (9.247 * w) + (3.098 * h) - (4.330 * a)
    : 88.362 + (13.397 * w) + (4.799 * h) - (5.677 * a);

  const actFactor = { sedentary:1.2, light:1.375, moderate:1.55, active:1.725, very_active:1.9 }[profile.activity] || 1.55;
  const tdee = Math.round(bmr * actFactor);
  const adj = BODY_GOAL_CALORIE_ADJ[profile.bodyGoal] ?? 0;
  const targetKcal = Math.max(1200, tdee + adj);

  const protFactor = BODY_GOAL_PROTEIN_FACTOR[profile.bodyGoal] ?? 2.0;
  const protein = Math.round(w * protFactor);
  const fat = Math.round((targetKcal * 0.25) / 9);
  const carbs = Math.round((targetKcal - protein * 4 - fat * 9) / 4);
  const water = Math.round(w * 0.035 * 10) / 10;

  return { tdee, targetKcal, protein, fat, carbs: Math.max(0, carbs), water };
}

function getMealPlan(kcal, bodyGoal, lang) {
  const isGain = bodyGoal === "bulk" || bodyGoal === "powerlifting";
  const isCut  = bodyGoal === "cut"  || bodyGoal === "summer";
  const isMaint = !isGain && !isCut;

  const fr = [
    {
      icon: "☀️", title: "Petit-déjeuner", time: "7h–8h", kcal: Math.round(kcal * 0.22),
      items: isGain
        ? ["Flocons d'avoine (90g) + lait entier (250ml)", "3 œufs entiers brouillés", "Banane (1 grande) + beurre de cacahuète (25g)", "Café ou thé sans sucre"]
        : isCut
        ? ["Flocons d'avoine (50g) + lait demi-écrémé (200ml)", "2 œufs entiers + 2 blancs d'œufs", "Fruits rouges (100g)", "Yaourt grec 0% (150g)"]
        : ["Flocons d'avoine (70g) + lait demi-écrémé", "2 œufs entiers + 1 blanc", "Demi-banane + baies", "Café ou thé"],
      alts: isGain
        ? ["Pancakes avoine-banane (150g farine d'avoine, 2 œufs, 1 banane)", "Pain complet (3 tranches) + fromage blanc 20% + miel", "Bol açaï + granola maison + fruits frais"]
        : isCut
        ? ["Omelette 3 blancs + 1 œuf entier + épinards", "Skyr (200g) + graines de chia (15g) + framboises", "Pain de seigle (1 tranche) + avocat (½) + œuf poché"]
        : ["Tartines de pain complet + œufs cocotte + tomates", "Smoothie protéiné (lait, banane, flocons, 1 œuf)", "Fromage blanc (200g) + fruits + noix (20g)"],
    },
    {
      icon: "🍎", title: "Collation matin", time: "10h–11h", kcal: Math.round(kcal * 0.10),
      items: isGain
        ? ["Fromage blanc 20% (200g) + miel + noix (30g)", "Fruit de saison (pomme, poire ou banane)"]
        : isCut
        ? ["Skyr nature (150g)", "Thé vert ou café sans sucre"]
        : ["Fromage blanc 0% (150g) + 1 fruit", "Petite poignée d'amandes (15g)"],
      alts: isGain
        ? ["Shake maison : lait + flocons + beurre de cacahuète (30g)", "Pain complet (2 tranches) + thon + cornichons", "Rice cakes (4) + fromage blanc + confiture"]
        : isCut
        ? ["Œuf dur (2) + légumes crudités", "Cottage cheese (150g) + concombre", "Thé matcha + carré de chocolat noir 85%"]
        : ["Smoothie vert (épinards, pomme, gingembre)", "Riz soufflé (2 galettes) + fromage blanc", "Edamame (100g) salé"],
    },
    {
      icon: "🍽️", title: "Déjeuner", time: "12h30–13h30", kcal: Math.round(kcal * 0.32),
      items: isGain
        ? ["Riz basmati cuit (230g) ou pâtes semi-complètes (200g cuit)", "Poulet (220g) ou steak haché 5% (220g)", "Avocat (½) + légumes vapeur à volonté", "Huile d'olive (1 cuillère à soupe)"]
        : isCut
        ? ["Riz basmati cuit (130g) ou patate douce (150g)", "Blanc de poulet (220g) ou poisson blanc (250g)", "Légumes verts à volonté (brocoli, haricots, courgettes)", "Sauce : citron + moutarde (0 calorie)"]
        : ["Quinoa cuit (160g) ou riz complet (150g)", "Saumon (180g) ou poulet (180g)", "Légumes rôtis au four (200g)", "Filet d'huile d'olive (1 cc)"],
      alts: isGain
        ? ["Bowl : riz + thon + edamame + avocat + sauce soja", "Wrap complet : poulet + riz + légumes + fromage", "Pâtes complètes + bolognaise maison + parmesan (20g)", "Lentilles (200g cuites) + merguez (2) + salade verte"]
        : isCut
        ? ["Salade de poulpe/crevettes + quinoa (100g) + citron", "Soupe de légumes maison + blanc de poulet effiloché", "Galette de sarrasin + œuf + épinards + fromage de chèvre", "Taboulé de chou-fleur + feta (30g) + thon"]
        : ["Bowl buddha : riz, pois chiches, légumes, tahini", "Omelette 3 œufs + légumes + pomme de terre (1)", "Wrap saumon fumé + fromage blanc + salade"],
    },
    {
      icon: "🏋️", title: "Collation pré/post workout", time: "15h30–16h30", kcal: Math.round(kcal * 0.13),
      items: isGain
        ? ["Shake protéiné (30g whey) + lait entier (300ml)", "Rice cakes (3) ou flocons d'avoine (50g)", "Banane (1)"]
        : isCut
        ? ["Shake protéiné (25g whey) + eau ou lait écrémé", "Kiwi ou fruits rouges (100g)"]
        : ["Yaourt grec (150g) + graines de courge (15g)", "Pomme + amandes (20g)"],
      alts: isGain
        ? ["Pain de mie complet (2 tranches) + beurre de cacahuète (30g) + banane", "Skyr (200g) + granola (40g) + myrtilles", "Riz au lait maison (lait entier + riz + sucre de coco)"]
        : isCut
        ? ["Cottage cheese (200g) + concombre + paprika", "Œufs durs (2) + épinards crus", "Skyr (150g) + thé vert sans sucre"]
        : ["Smoothie banane + yaourt grec + épinards", "Pain complet (1 tranche) + œuf dur", "Fromage blanc + compote sans sucre (100g)"],
    },
    {
      icon: "🌙", title: "Dîner", time: "19h30–20h30", kcal: Math.round(kcal * 0.23),
      items: isGain
        ? ["Patate douce (200g) ou pâtes complètes (160g cuit)", "Bœuf haché 5% (200g) ou saumon (200g)", "Brocoli + carottes rôties à l'ail", "Fromage blanc (100g) en dessert"]
        : isCut
        ? ["Légumes à volonté : courgettes, brocoli, poivrons rôtis", "Poisson blanc (220g) ou tofu ferme (200g) ou œufs (3)", "Salade verte + vinaigre de cidre"]
        : ["Patate douce (150g) ou lentilles (150g cuites)", "Saumon (160g) ou œufs (3) ou dinde (180g)", "Légumes vapeur + sauce yaourt-citron"],
      alts: isGain
        ? ["Risotto poulet-champignons + parmesan (20g)", "Burger maison : pain complet + steak + œuf + fromage", "Chili con carne : bœuf + haricots rouges + riz"]
        : isCut
        ? ["Soupe miso + tofu (150g) + brocoli + algues", "Papillote de cabillaud + légumes + herbes", "Dhal de lentilles corail + épinards + yaourt"]
        : ["Curry de pois chiches + riz complet (120g)", "Omelette campagnarde : pommes de terre + oignons + œufs", "Salade niçoise complète : thon + œufs + légumes + olives"],
    },
  ];

  const en = [
    {
      icon: "☀️", title: "Breakfast", time: "7–8 AM", kcal: Math.round(kcal * 0.22),
      items: isGain
        ? ["Oatmeal (90g) + whole milk (250ml)", "3 whole eggs scrambled", "Large banana + peanut butter (25g)", "Coffee or tea unsweetened"]
        : isCut
        ? ["Oatmeal (50g) + semi-skimmed milk (200ml)", "2 whole eggs + 2 egg whites", "Mixed berries (100g)", "Greek yogurt 0% (150g)"]
        : ["Oatmeal (70g) + semi-skimmed milk", "2 whole eggs + 1 white", "½ banana + berries", "Coffee or tea"],
      alts: isGain
        ? ["Oat-banana pancakes (150g oat flour, 2 eggs, 1 banana)", "Whole wheat toast (3 slices) + cottage cheese + honey", "Açaí bowl + homemade granola + fresh fruits"]
        : isCut
        ? ["Omelette 3 whites + 1 whole egg + spinach", "Skyr (200g) + chia seeds (15g) + raspberries", "Rye bread (1 slice) + avocado (½) + poached egg"]
        : ["Whole wheat toast + baked eggs + tomatoes", "Protein smoothie (milk, banana, oats, 1 egg)", "Cottage cheese (200g) + fruits + walnuts (20g)"],
    },
    {
      icon: "🍎", title: "Morning Snack", time: "10–11 AM", kcal: Math.round(kcal * 0.10),
      items: isGain
        ? ["Cottage cheese (200g) + honey + walnuts (30g)", "Seasonal fruit (apple, pear or banana)"]
        : isCut
        ? ["Skyr plain (150g)", "Green tea or black coffee"]
        : ["Low-fat cottage cheese (150g) + 1 fruit", "Small handful of almonds (15g)"],
      alts: isGain
        ? ["Homemade shake: milk + oats + peanut butter (30g)", "Whole wheat toast (2 slices) + tuna + pickles", "Rice cakes (4) + cottage cheese + jam"]
        : isCut
        ? ["Hard-boiled eggs (2) + raw vegetables", "Cottage cheese (150g) + cucumber", "Matcha tea + 1 square dark chocolate 85%"]
        : ["Green smoothie (spinach, apple, ginger)", "Rice cakes (2) + cottage cheese", "Edamame (100g) salted"],
    },
    {
      icon: "🍽️", title: "Lunch", time: "12:30–1:30 PM", kcal: Math.round(kcal * 0.32),
      items: isGain
        ? ["Cooked basmati rice (230g) or semi-whole pasta (200g cooked)", "Chicken (220g) or lean ground beef 5% (220g)", "½ avocado + steamed vegetables (unlimited)", "Olive oil (1 tablespoon)"]
        : isCut
        ? ["Cooked basmati rice (130g) or sweet potato (150g)", "Chicken breast (220g) or white fish (250g)", "Green vegetables unlimited (broccoli, beans, zucchini)", "Dressing: lemon + mustard (0 kcal)"]
        : ["Cooked quinoa (160g) or brown rice (150g)", "Salmon (180g) or chicken (180g)", "Oven-roasted vegetables (200g)", "Drizzle of olive oil (1 tsp)"],
      alts: isGain
        ? ["Rice bowl + tuna + edamame + avocado + soy sauce", "Whole wheat wrap: chicken + rice + vegetables + cheese", "Whole pasta + homemade bolognese + parmesan (20g)", "Lentils (200g cooked) + sausage (2) + green salad"]
        : isCut
        ? ["Octopus/shrimp salad + quinoa (100g) + lemon", "Homemade vegetable soup + shredded chicken breast", "Buckwheat crepe + egg + spinach + goat cheese", "Cauliflower tabbouleh + feta (30g) + tuna"]
        : ["Buddha bowl: rice, chickpeas, vegetables, tahini", "3-egg omelette + vegetables + 1 potato", "Smoked salmon wrap + cream cheese + salad"],
    },
    {
      icon: "🏋️", title: "Pre/Post Workout Snack", time: "3:30–4:30 PM", kcal: Math.round(kcal * 0.13),
      items: isGain
        ? ["Protein shake (30g whey) + whole milk (300ml)", "Rice cakes (3) or oatmeal (50g)", "Banana (1)"]
        : isCut
        ? ["Protein shake (25g whey) + water or skimmed milk", "Kiwi or mixed berries (100g)"]
        : ["Greek yogurt (150g) + pumpkin seeds (15g)", "Apple + almonds (20g)"],
      alts: isGain
        ? ["Whole wheat bread (2 slices) + peanut butter (30g) + banana", "Skyr (200g) + granola (40g) + blueberries", "Homemade rice pudding (whole milk + rice + coconut sugar)"]
        : isCut
        ? ["Cottage cheese (200g) + cucumber + paprika", "Hard-boiled eggs (2) + raw spinach", "Skyr (150g) + green tea unsweetened"]
        : ["Banana + Greek yogurt + spinach smoothie", "Whole wheat bread (1 slice) + hard-boiled egg", "Cottage cheese + unsweetened applesauce (100g)"],
    },
    {
      icon: "🌙", title: "Dinner", time: "7:30–8:30 PM", kcal: Math.round(kcal * 0.23),
      items: isGain
        ? ["Sweet potato (200g) or whole pasta (160g cooked)", "Lean ground beef 5% (200g) or salmon (200g)", "Broccoli + roasted carrots with garlic", "Cottage cheese (100g) for dessert"]
        : isCut
        ? ["Unlimited vegetables: zucchini, broccoli, roasted peppers", "White fish (220g) or firm tofu (200g) or eggs (3)", "Green salad + apple cider vinegar"]
        : ["Sweet potato (150g) or lentils (150g cooked)", "Salmon (160g) or eggs (3) or turkey (180g)", "Steamed vegetables + yogurt-lemon sauce"],
      alts: isGain
        ? ["Chicken-mushroom risotto + parmesan (20g)", "Homemade burger: whole bun + steak + egg + cheese", "Chili con carne: beef + red beans + rice"]
        : isCut
        ? ["Miso soup + tofu (150g) + broccoli + seaweed", "Baked cod in parchment + vegetables + herbs", "Red lentil dal + spinach + yogurt"]
        : ["Chickpea curry + brown rice (120g)", "Country omelette: potatoes + onions + eggs", "Complete niçoise salad: tuna + eggs + vegetables + olives"],
    },
  ];

  return lang === "en" ? en : fr;
}

function getYouTubeUrl(exerciseName) {
  const query = encodeURIComponent(exerciseName + " exercise tutorial how to");
  return `https://www.youtube.com/results?search_query=${query}`;
}

// ── DATA UI ───────────────────────────────────────────────────────────────────
const MUSCLES_UI = [
  { id: "chest",     label: "Pectoraux",  labelEn: "Chest",       icon: "🫁",
    svg: <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:32,height:32,opacity:0.85}}>
      <ellipse cx="24" cy="24" rx="20" ry="22" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1"/>
      {/* torso outline */}
      <path d="M16 14 Q13 20 14 30 L18 34 L24 36 L30 34 L34 30 Q35 20 32 14" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" fill="none"/>
      {/* chest highlighted */}
      <path d="M16 14 Q18 12 24 13 Q30 12 32 14 Q34 20 30 24 Q27 26 24 25 Q21 26 18 24 Q14 20 16 14Z" fill="currentColor" fillOpacity="0.55" stroke="currentColor" strokeWidth="0.5"/>
      {/* collarbone */}
      <path d="M15 13 Q20 11 24 12 Q28 11 33 13" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round"/>
    </svg> },
  { id: "back",      label: "Dos",        labelEn: "Back",        icon: "🔙",
    svg: <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:32,height:32,opacity:0.85}}>
      <ellipse cx="24" cy="24" rx="20" ry="22" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1"/>
      {/* back outline */}
      <path d="M16 12 Q13 18 14 30 L18 36 L24 38 L30 36 L34 30 Q35 18 32 12" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" fill="none"/>
      {/* lats highlighted - V taper */}
      <path d="M16 12 Q19 10 24 11 Q29 10 32 12 L30 28 Q27 32 24 32 Q21 32 18 28Z" fill="currentColor" fillOpacity="0.5" stroke="currentColor" strokeWidth="0.5"/>
      {/* spine */}
      <line x1="24" y1="13" x2="24" y2="34" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1" strokeDasharray="2 2"/>
    </svg> },
  { id: "shoulders", label: "Épaules",    labelEn: "Shoulders",   icon: "🔺",
    svg: <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:32,height:32,opacity:0.85}}>
      <ellipse cx="24" cy="24" rx="20" ry="22" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1"/>
      {/* torso */}
      <path d="M18 22 L18 36 L30 36 L30 22" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" fill="none"/>
      {/* left shoulder */}
      <ellipse cx="13" cy="19" rx="5" ry="6" fill="currentColor" fillOpacity="0.55" stroke="currentColor" strokeWidth="0.5"/>
      {/* right shoulder */}
      <ellipse cx="35" cy="19" rx="5" ry="6" fill="currentColor" fillOpacity="0.55" stroke="currentColor" strokeWidth="0.5"/>
      {/* collarbone connecting */}
      <path d="M13 15 L24 13 L35 15" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round"/>
    </svg> },
  { id: "biceps",    label: "Biceps",     labelEn: "Biceps",      icon: "💪",
    svg: <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:32,height:32,opacity:0.85}}>
      <ellipse cx="24" cy="24" rx="20" ry="22" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1"/>
      {/* arm outline */}
      <path d="M20 10 Q16 14 15 20 L15 34 Q16 37 19 38 L24 39 L29 38 Q32 37 33 34 L33 20 Q32 14 28 10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" fill="none"/>
      {/* bicep peak highlighted */}
      <path d="M19 12 Q20 9 24 9 Q28 9 29 12 Q30 17 28 22 Q26 24 24 24 Q22 24 20 22 Q18 17 19 12Z" fill="currentColor" fillOpacity="0.6" stroke="currentColor" strokeWidth="0.5"/>
    </svg> },
  { id: "triceps",   label: "Triceps",    labelEn: "Triceps",     icon: "🦾",
    svg: <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:32,height:32,opacity:0.85}}>
      <ellipse cx="24" cy="24" rx="20" ry="22" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1"/>
      {/* arm outline back */}
      <path d="M20 10 Q16 14 15 20 L15 34 Q16 37 19 38 L24 39 L29 38 Q32 37 33 34 L33 20 Q32 14 28 10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" fill="none"/>
      {/* triceps 3 heads highlighted on back of arm */}
      <path d="M19 13 Q20 10 24 10 Q28 10 29 13 Q31 19 30 26 Q28 29 24 29 Q20 29 18 26 Q17 19 19 13Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.5"/>
      <path d="M20 24 Q22 21 24 21 Q26 21 28 24 L28 32 Q26 35 24 35 Q22 35 20 32Z" fill="currentColor" fillOpacity="0.55" stroke="currentColor" strokeWidth="0.5"/>
    </svg> },
  { id: "legs",      label: "Jambes",     labelEn: "Legs",        icon: "🦵",
    svg: <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:32,height:32,opacity:0.85}}>
      <ellipse cx="24" cy="24" rx="20" ry="22" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1"/>
      {/* left leg */}
      <path d="M16 12 Q14 20 14 28 L15 40 Q17 43 19 43 Q21 43 22 40 L22 28 Q22 20 20 12Z" fill="currentColor" fillOpacity="0.5" stroke="currentColor" strokeWidth="0.5"/>
      {/* right leg */}
      <path d="M32 12 Q34 20 34 28 L33 40 Q31 43 29 43 Q27 43 26 40 L26 28 Q26 20 28 12Z" fill="currentColor" fillOpacity="0.5" stroke="currentColor" strokeWidth="0.5"/>
      {/* knee joint */}
      <circle cx="18" cy="29" r="2" fill="currentColor" fillOpacity="0.3"/>
      <circle cx="30" cy="29" r="2" fill="currentColor" fillOpacity="0.3"/>
    </svg> },
  { id: "glutes",    label: "Fessiers",   labelEn: "Glutes",      icon: "🍑",
    svg: <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:32,height:32,opacity:0.85}}>
      <ellipse cx="24" cy="24" rx="20" ry="22" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1"/>
      {/* pelvis base */}
      <path d="M14 18 Q14 15 24 15 Q34 15 34 18 L33 26 Q32 30 24 31 Q16 30 15 26Z" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" fill="none"/>
      {/* left glute */}
      <ellipse cx="18" cy="24" rx="6" ry="7" fill="currentColor" fillOpacity="0.55" stroke="currentColor" strokeWidth="0.5"/>
      {/* right glute */}
      <ellipse cx="30" cy="24" rx="6" ry="7" fill="currentColor" fillOpacity="0.55" stroke="currentColor" strokeWidth="0.5"/>
    </svg> },
  { id: "abs",       label: "Abdominaux", labelEn: "Abs",         icon: "⚡",
    svg: <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:32,height:32,opacity:0.85}}>
      <ellipse cx="24" cy="24" rx="20" ry="22" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1"/>
      {/* torso */}
      <path d="M17 10 L17 38 Q20 42 24 42 Q28 42 31 38 L31 10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" fill="none"/>
      {/* 6 pack blocks */}
      {[[0,0],[1,0],[0,1],[1,1],[0,2],[1,2]].map(([col,row],i) => (
        <rect key={i} x={18+col*6} y={13+row*8} width="5" height="6" rx="1.5" fill="currentColor" fillOpacity="0.55" stroke="currentColor" strokeWidth="0.3"/>
      ))}
      {/* linea alba */}
      <line x1="24" y1="12" x2="24" y2="37" stroke="currentColor" strokeOpacity="0.3" strokeWidth="0.8"/>
    </svg> },
  { id: "calves",    label: "Mollets",    labelEn: "Calves",      icon: "🦶",
    svg: <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:32,height:32,opacity:0.85}}>
      <ellipse cx="24" cy="24" rx="20" ry="22" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1"/>
      {/* left calf */}
      <path d="M15 10 Q13 16 13 24 L14 36 Q16 42 18 42 Q20 42 21 38 L21 24 Q21 16 19 10Z" fill="currentColor" fillOpacity="0.5" stroke="currentColor" strokeWidth="0.5"/>
      {/* right calf */}
      <path d="M33 10 Q35 16 35 24 L34 36 Q32 42 30 42 Q28 42 27 38 L27 24 Q27 16 29 10Z" fill="currentColor" fillOpacity="0.5" stroke="currentColor" strokeWidth="0.5"/>
      {/* gastrocnemius bulge */}
      <ellipse cx="17" cy="20" rx="3" ry="5" fill="currentColor" fillOpacity="0.2"/>
      <ellipse cx="31" cy="20" rx="3" ry="5" fill="currentColor" fillOpacity="0.2"/>
    </svg> },
  { id: "traps",     label: "Trapèzes",   labelEn: "Traps",       icon: "🏔",
    svg: <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:32,height:32,opacity:0.85}}>
      <ellipse cx="24" cy="24" rx="20" ry="22" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1"/>
      {/* trapezoid muscle shape */}
      <path d="M12 14 Q18 8 24 8 Q30 8 36 14 L32 26 Q28 30 24 30 Q20 30 16 26Z" fill="currentColor" fillOpacity="0.5" stroke="currentColor" strokeWidth="0.5"/>
      {/* neck */}
      <rect x="21" y="5" width="6" height="5" rx="3" fill="currentColor" fillOpacity="0.3"/>
    </svg> },
  { id: "forearms",  label: "Avant-bras", labelEn: "Forearms",    icon: "🤜",
    svg: <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:32,height:32,opacity:0.85}}>
      <ellipse cx="24" cy="24" rx="20" ry="22" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1"/>
      {/* forearm shape */}
      <path d="M19 8 Q16 12 15 18 L15 34 Q16 38 19 40 L24 41 L29 40 Q32 38 33 34 L33 18 Q32 12 29 8Z" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.5"/>
      {/* extensor group */}
      <path d="M19 8 Q20 6 24 6 Q28 6 29 8 L30 22 Q28 26 24 27 Q20 26 18 22Z" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="0.5"/>
      {/* flexor group lower */}
      <path d="M18 26 Q20 28 24 29 Q28 28 30 26 L30 34 Q28 38 24 39 Q20 38 18 34Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="0.5"/>
    </svg> },
  { id: "fullbody",  label: "Full Body",  labelEn: "Full Body",   icon: "🔥" },
];

// Objectifs entraînement
const GOALS_TRAINING = [
  { id: "strength",    label: "Force & Powerlifting", labelEn: "Strength & Powerlifting", desc: "Charges maximales — choix de méthode structurée",    descEn: "Max loads — choose a structured strength method", scheme: "1–6 reps",
    svg: <svg viewBox="0 0 36 36" fill="none" style={{width:34,height:34,flexShrink:0}}><rect width="36" height="36" rx="10" fill="currentColor" fillOpacity="0.08"/><rect x="4" y="16" width="28" height="4" rx="2" fill="currentColor" fillOpacity="0.7"/><rect x="2" y="13" width="5" height="10" rx="2" fill="currentColor" fillOpacity="0.9"/><rect x="29" y="13" width="5" height="10" rx="2" fill="currentColor" fillOpacity="0.9"/><rect x="7" y="11" width="3" height="14" rx="1.5" fill="currentColor" fillOpacity="0.6"/><rect x="26" y="11" width="3" height="14" rx="1.5" fill="currentColor" fillOpacity="0.6"/></svg> },
  { id: "hypertrophy", label: "Hypertrophie",          labelEn: "Hypertrophy",              desc: "Prise de masse musculaire",         descEn: "Muscle size & volume",           scheme: "8–12 reps",
    svg: <svg viewBox="0 0 36 36" fill="none" style={{width:34,height:34,flexShrink:0}}><rect width="36" height="36" rx="10" fill="currentColor" fillOpacity="0.08"/><path d="M18 8 C14 8 10 11 10 16 C10 20 12 22 15 23 L15 28 L21 28 L21 23 C24 22 26 20 26 16 C26 11 22 8 18 8Z" fill="currentColor" fillOpacity="0.8"/><rect x="15" y="27" width="6" height="2" rx="1" fill="currentColor" fillOpacity="0.5"/></svg> },
  { id: "endurance",   label: "Endurance musc.",       labelEn: "Muscular Endurance",       desc: "Résistance & capacité cardio",      descEn: "Resistance & cardio capacity",   scheme: "15–20 reps",
    svg: <svg viewBox="0 0 36 36" fill="none" style={{width:34,height:34,flexShrink:0}}><rect width="36" height="36" rx="10" fill="currentColor" fillOpacity="0.08"/><path d="M8 20 L14 10 L18 16 L22 12 L28 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeOpacity="0.9"/><path d="M8 24 L28 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.3"/></svg> },
  { id: "weight_loss", label: "Perte de poids",        labelEn: "Fat Loss",                 desc: "Brûle-graisses & circuits",         descEn: "Fat burn & circuits",            scheme: "12–15 reps",
    svg: <svg viewBox="0 0 36 36" fill="none" style={{width:34,height:34,flexShrink:0}}><rect width="36" height="36" rx="10" fill="currentColor" fillOpacity="0.08"/><path d="M18 6 L20 14 L28 12 L22 18 L26 26 L18 22 L10 26 L14 18 L8 12 L16 14Z" fill="currentColor" fillOpacity="0.75" stroke="currentColor" strokeWidth="0.5"/></svg> },
  { id: "toning",      label: "Tonification",          labelEn: "Toning",                   desc: "Définition & maintien musculaire",  descEn: "Definition & muscle maintenance",scheme: "10–15 reps",
    svg: <svg viewBox="0 0 36 36" fill="none" style={{width:34,height:34,flexShrink:0}}><rect width="36" height="36" rx="10" fill="currentColor" fillOpacity="0.08"/><ellipse cx="18" cy="18" rx="10" ry="12" stroke="currentColor" strokeWidth="2" strokeOpacity="0.7" fill="none"/><ellipse cx="18" cy="18" rx="6" ry="8" fill="currentColor" fillOpacity="0.4"/><ellipse cx="18" cy="18" rx="2" ry="3" fill="currentColor" fillOpacity="0.8"/></svg> },
];

// Méthodes de force disponibles quand goal === "strength"
const STRENGTH_METHODS = {
  fr: [
    {
      id: "531",
      name: "Wendler 5/3/1",
      author: "Jim Wendler",
      level: "Intermédiaire → Confirmé",
      desc: "Le programme de force le plus utilisé au monde. 4 grands mouvements en cycles de 4 semaines avec pourcentages progressifs et sets AMRAP. Progression garantie sur le long terme.",
      detail: "TM = 90% du 1RM · Semaine 1 : 65/75/85%×5+ · Semaine 2 : 70/80/90%×3+ · Semaine 3 : 75/85/95%×1+ · Semaine 4 : Déload",
      weeks: "16 semaines (4 cycles)",
      sessions: "4 séances/semaine",
      badge: "PERIODISÉ",
    },
    {
      id: "gzclp",
      name: "GZCLP",
      author: "Cody LeFever",
      level: "Débutant → Intermédiaire",
      desc: "Progression linéaire structurée en 3 niveaux (Tier 1/2/3). T1 = charges lourdes faibles reps, T2 = charges modérées, T3 = accessoires. Idéal pour progresser vite en débutant.",
      detail: "T1 : 5×3+ (AMRAP dernier set) · T2 : 3×10+ · T3 : 3×15+ · +5kg bas du corps / +2.5kg haut du corps par séance",
      weeks: "12-16 semaines",
      sessions: "3-4 séances/semaine",
      badge: "LINÉAIRE",
    },
    {
      id: "ss",
      name: "Starting Strength",
      author: "Mark Rippetoe",
      level: "Débutant",
      desc: "Le programme de référence absolu pour débutants. 3 séances full body par semaine sur les mouvements fondamentaux. Progression de poids à chaque séance.",
      detail: "3×5 Squat + 3×5 Bench/Press alterné + 1×5 Deadlift · +2.5kg par séance jusqu'à stagnation",
      weeks: "8-16 semaines",
      sessions: "3 séances/semaine",
      badge: "DÉBUTANT",
    },
  ],
  en: [
    {
      id: "531",
      name: "Wendler 5/3/1",
      author: "Jim Wendler",
      level: "Intermediate → Advanced",
      desc: "The most widely used strength program in the world. 4 main lifts in 4-week cycles with progressive percentages and AMRAP sets. Guaranteed long-term progress.",
      detail: "TM = 90% of 1RM · Week 1: 65/75/85%×5+ · Week 2: 70/80/90%×3+ · Week 3: 75/85/95%×1+ · Week 4: Deload",
      weeks: "16 weeks (4 cycles)",
      sessions: "4 sessions/week",
      badge: "PERIODIZED",
    },
    {
      id: "gzclp",
      name: "GZCLP",
      author: "Cody LeFever",
      level: "Beginner → Intermediate",
      desc: "Structured linear progression in 3 tiers. T1 = heavy low reps, T2 = moderate, T3 = accessories. Perfect for rapid early strength gains.",
      detail: "T1: 5×3+ (AMRAP last set) · T2: 3×10+ · T3: 3×15+ · +10lb lower / +5lb upper per session",
      weeks: "12-16 weeks",
      sessions: "3-4 sessions/week",
      badge: "LINEAR",
    },
    {
      id: "ss",
      name: "Starting Strength",
      author: "Mark Rippetoe",
      level: "Beginner",
      desc: "The absolute reference program for beginners. 3 full-body sessions per week on fundamental movements. Add weight every single session.",
      detail: "3×5 Squat + 3×5 Bench/Press alternating + 1×5 Deadlift · +2.5kg per session until stall",
      weeks: "8-16 weeks",
      sessions: "3 sessions/week",
      badge: "BEGINNER",
    },
  ],
};

const LEVELS = [
  { id: "beginner",     label: "Débutant",       labelEn: "Beginner" },
  { id: "intermediate", label: "Intermédiaire",  labelEn: "Intermediate" },
  { id: "advanced",     label: "Confirmé",       labelEn: "Advanced" },
];

const EQUIPMENT_UI = [
  { id: "gym",        label: "Salle complète",    labelEn: "Full gym",         icon: "🏋️", desc: "Tout le matériel", descEn: "All equipment" },
  { id: "barbell",    label: "Barre olympique",   labelEn: "Olympic barbell",  icon: "—",  desc: "Barre + disques",  descEn: "Bar + plates" },
  { id: "dumbbells",  label: "Haltères",          labelEn: "Dumbbells",        icon: "⟨⟩", desc: "Fixes ou réglables", descEn: "Fixed or adjustable" },
  { id: "cables",     label: "Câbles / Poulies",  labelEn: "Cables / Pulleys", icon: "⤢",  desc: "Poulie haute/basse", descEn: "High/low pulley" },
  { id: "machines",   label: "Machines guidées",  labelEn: "Guided machines",  icon: "⊡",  desc: "Leg press, Smith...", descEn: "Leg press, Smith..." },
  { id: "bodyweight", label: "Poids du corps",    labelEn: "Bodyweight",       icon: "◯",  desc: "Sans matériel",    descEn: "No equipment" },
];

// Objectifs composition corporelle — PROFIL
const BODY_GOALS = {
  fr: [
    { id: "bulk",         name: "Prise de masse",        desc: "Surplus calorique modéré — masse musculaire maximale",  tag: "BULK" },
    { id: "cut",          name: "Sèche",                 desc: "Déficit calorique — élimination du gras, conservation musculaire", tag: "CUT" },
    { id: "recomp",       name: "Recomposition",         desc: "Perte de graisse & gain musculaire simultanés",          tag: "RECOMP" },
    { id: "summer",       name: "Corps d'été",           desc: "Sèche douce — corps sec et tonique pour l'été",          tag: "SUMMER" },
    { id: "maintain",     name: "Maintien",              desc: "Maintien du poids et de la masse actuelle",              tag: "MAINTAIN" },
    { id: "powerlifting", name: "Force / Powerlifting",  desc: "Priorité à la force brute sur les grands mouvements",    tag: "STRENGTH" },
  ],
  en: [
    { id: "bulk",         name: "Muscle Building",       desc: "Moderate surplus — maximize muscle growth",              tag: "BULK" },
    { id: "cut",          name: "Cut / Fat Loss",        desc: "Calorie deficit — lose fat, preserve muscle",            tag: "CUT" },
    { id: "recomp",       name: "Body Recomposition",    desc: "Lose fat & gain muscle simultaneously",                  tag: "RECOMP" },
    { id: "summer",       name: "Summer Body",           desc: "Soft cut — lean and toned for summer",                   tag: "SUMMER" },
    { id: "maintain",     name: "Maintenance",           desc: "Maintain current weight and muscle mass",                tag: "MAINTAIN" },
    { id: "powerlifting", name: "Strength / Powerlifting", desc: "Priority on raw strength on the big lifts",            tag: "STRENGTH" },
  ],
};

const ACTIVITY_LEVELS = {
  fr: [
    { id: "sedentary",   label: "Sédentaire" },
    { id: "light",       label: "Légèrement actif" },
    { id: "moderate",    label: "Modérément actif" },
    { id: "active",      label: "Très actif" },
    { id: "very_active", label: "Extrêmement actif" },
  ],
  en: [
    { id: "sedentary",   label: "Sedentary" },
    { id: "light",       label: "Lightly active" },
    { id: "moderate",    label: "Moderately active" },
    { id: "active",      label: "Very active" },
    { id: "very_active", label: "Extremely active" },
  ],
};

const AVATARS = ["🏋️","💪","🔥","⚡","🦁","🐺","🦅","🎯","🏆","🌟","🐉","⚔️"];

// ── STORAGE ───────────────────────────────────────────────────────────────────
async function loadPrograms() { try { const r = await window.storage.get("gainz:programs"); return r ? JSON.parse(r.value) : []; } catch { return []; } }
async function savePrograms(list) { try { await window.storage.set("gainz:programs", JSON.stringify(list)); } catch {} }
async function loadProfile() { try { const r = await window.storage.get("gainz:profile"); return r ? JSON.parse(r.value) : null; } catch { return null; } }
async function saveProfile(p) { try { await window.storage.set("gainz:profile", JSON.stringify(p)); } catch {} }
async function loadHistory() { try { const r = await window.storage.get("gainz:history"); return r ? JSON.parse(r.value) : []; } catch { return []; } }
async function saveHistory(h) { try { await window.storage.set("gainz:history", JSON.stringify(h)); } catch {} }
async function loadTheme() { try { const r = await window.storage.get("gainz:theme"); return r?.value || "dark"; } catch { return "dark"; } }
async function saveTheme(t) { try { await window.storage.set("gainz:theme", t); } catch {} }
async function loadLang() { try { const r = await window.storage.get("gainz:lang"); return r?.value || "fr"; } catch { return "fr"; } }
async function saveLang(l) { try { await window.storage.set("gainz:lang", l); } catch {} }
async function loadPremium() { try { const r = await window.storage.get("gainz:premium"); return r?.value === "1"; } catch { return false; } }
async function savePremium(v) { try { await window.storage.set("gainz:premium", v ? "1" : "0"); } catch {} }
async function loadOnboarded() { try { const r = await window.storage.get("gainz:onboarded"); return r?.value === "1"; } catch { return false; } }
async function saveOnboarded() { try { await window.storage.set("gainz:onboarded", "1"); } catch {} }

// ── FREEMIUM CONFIG ───────────────────────────────────────────────────────────
const FREE_MAX_PROGRAMS = 2;

// ── FREEMIUM SWITCH ─────────────────────────────────────────────────────────
// Set to true + connect Stripe to enable paid gating
// See STRIPE_SETUP comment below for activation steps
const FREEMIUM_ENABLED = false;

/*
  STRIPE ACTIVATION CHECKLIST (quand tu veux activer le paywall):
  1. Crée un compte Stripe → stripe.com
  2. Installe : npm install @stripe/stripe-js
  3. Dans handleUnlockPremium(), remplace le savePremium(true) direct par :
       const stripe = await loadStripe("pk_live_TON_CLE_PUBLIQUE");
       await stripe.redirectToCheckout({ lineItems: [{ price: "price_TON_PRICE_ID", quantity: 1 }], mode: "subscription", successUrl: window.location.href + "?premium=1", cancelUrl: window.location.href });
  4. Dans useEffect, lis le param ?premium=1 après redirect Stripe
  5. Mets FREEMIUM_ENABLED = true ci-dessus
  Coût total: 0€ fixe + 1.5% par transaction (Stripe EU)
*/

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("programs");
  const [isPremium, setIsPremium] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [savedPrograms, setSavedPrograms] = useState([]);
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [dailyView, setDailyView] = useState(null);
  const [lang, setLang] = useState("fr");
  const [theme, setTheme] = useState("dark");

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
    loadLang().then(setLang);
    loadPremium().then(setIsPremium);
    loadTheme().then(t => { setTheme(t); document.body.className = t === "light" ? "light-mode" : ""; });
  }, []);

  const switchLang = async (l) => { setLang(l); await saveLang(l); };
  const switchTheme = async (t) => { setTheme(t); document.body.className = t === "light" ? "light-mode" : ""; await saveTheme(t); };

  const handleUnlockPremium = async () => {
    // Placeholder — in production this triggers Stripe checkout
    // For demo: unlock directly (remove in prod, replace with real payment)
    await savePremium(true);
    setIsPremium(true);
    setShowPremiumModal(false);
  };

  const handleShare = () => setShowShareModal(true);

  const handleSave = async (program) => {
    // Freemium gate (désactivé — FREEMIUM_ENABLED = false)
    if (FREEMIUM_ENABLED && !isPremium && savedPrograms.length >= FREE_MAX_PROGRAMS) {
      setShowPremiumModal(true);
      return;
    }
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

  const handleProfileSave = async (p) => { setProfile(p); await saveProfile(p); };

  const handleWorkoutDone = async (programName, dayName) => {
    const entry = { id: Date.now().toString(), programName, dayName, date: new Date().toLocaleDateString("fr-FR"), ts: Date.now() };
    const updated = [entry, ...history].slice(0, 60);
    setHistory(updated);
    await saveHistory(updated);
  };

  const t = (key) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.fr[key] ?? key;

  if (dailyView) {
    return (
      <LangContext.Provider value={lang}>
        <div className="app">
          <DailyView program={dailyView} onBack={() => setDailyView(null)} onWorkoutDone={handleWorkoutDone} lang={lang} />
        </div>
      </LangContext.Provider>
    );
  }

  const navItems = [
    { id: "programs",  icon: "▤",  label: t("navPrograms") },
    { id: "create",    icon: "✦", label: t("navCreate") },
    { id: "nutrition", icon: "◎", label: t("navNutrition") },
    { id: "profile",   icon: "◉", label: t("navProfile") },
  ];

  return (
    <LangContext.Provider value={lang}>
      <div className="app">
        {tab === "create"    && <CreateView onSave={handleSave} profile={profile} lang={lang} isPremium={isPremium} onShowPremium={() => setShowPremiumModal(true)} />}
        {tab === "programs"  && <ProgramsView programs={savedPrograms} onOpen={setDailyView} onDelete={handleDelete} lang={lang} isPremium={isPremium} onShowPremium={() => setShowPremiumModal(true)} onShare={handleShare} onGoCreate={() => setTab("create")} />}
        {tab === "nutrition" && <NutritionView profile={profile} onGoToProfile={() => setTab("profile")} lang={lang} />}
        {tab === "profile"   && <ProfileView profile={profile} history={history} onSave={handleProfileSave} lang={lang} onLangChange={switchLang} currentLang={lang} theme={theme} onThemeChange={switchTheme} />}

        <div className="bottom-nav">
          {navItems.map(t2 => (
            <button key={t2.id} className={`nav-tab ${tab === t2.id ? "active" : ""}`} onClick={() => setTab(t2.id)}>
              <span className="nav-tab-icon">{t2.icon}</span>
              <span className="nav-tab-label">{t2.label}</span>
            </button>
          ))}
        </div>

        {showPremiumModal && <PremiumModal lang={lang} onClose={() => setShowPremiumModal(false)} onUnlock={handleUnlockPremium} isPremium={isPremium} />}
        {showShareModal && <ShareModal lang={lang} onClose={() => setShowShareModal(false)} />}
      </div>
    </LangContext.Provider>
  );
}

// ── CREATE VIEW ───────────────────────────────────────────────────────────────
function CreateView({ onSave, profile, lang }) {
  const t = (key) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.fr[key] ?? key;
  const [step, setStep] = useState(1);
  const defaultGoal = profile?.bodyGoal ? (BODY_GOAL_TO_TRAINING[profile.bodyGoal] || "") : "";
  const [form, setForm] = useState({ muscles: [], goal: defaultGoal, method: "", useAdvanced: false, level: "intermediate", equipment: [], daysPerWeek: 4, sessionDuration: 60, notes: "" });
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [expanded, setExpanded] = useState({});

  const toggle = (key, id) => setForm(f => ({ ...f, [key]: f[key].includes(id) ? f[key].filter(x => x !== id) : [...f[key], id] }));

  const generate = async () => {
    setLoading(true); setLoadStep(0);
    await new Promise(r => setTimeout(r, 500));
    setLoadStep(1);
    await new Promise(r => setTimeout(r, 650));
    setLoadStep(2);
    await new Promise(r => setTimeout(r, 350));
    const isStrengthMethod = form.goal === "strength" && form.method;
    const p = isStrengthMethod ? generateStrengthProgram(form, lang) : generateProgram(form);
    setProgram(p); setExpanded({ 0: true }); setLoading(false); setStep("preview");
  };

  const reset = () => { setStep(1); setProgram(null); setForm({ muscles: [], goal: defaultGoal, level: "intermediate", equipment: [], daysPerWeek: 4, sessionDuration: 60, notes: "" }); };
  const LABELS = { 1: t("stepLabel1"), 2: t("stepLabel2"), 3: t("stepLabel3") };

  const getMuscleLabel = (m) => lang === "en" ? (m.labelEn || m.label) : m.label;
  const getLevelLabel = (l) => lang === "en" ? (l.labelEn || l.label) : l.label;
  const getEquipLabel = (e) => lang === "en" ? (e.labelEn || e.label) : e.label;
  const getGoalName = (g) => lang === "en" ? (g.labelEn || g.label) : g.label;
  const getGoalDesc = (g) => lang === "en" ? (g.descEn || g.desc) : g.desc;

  return (
    <>
      <div className="app-header">
        <div className="logo-mark"><div className="logo-icon">G</div><span className="logo-text">GAINZ</span></div>
        <div className={`header-badge ${step === "preview" ? "success" : ""}`}>
          {step === "preview" ? t("ready") : loading ? "..." : `${step} ${t("stepOf")}`}
        </div>
      </div>

      {!loading && (
        <div className="progress-wrap">
          <div className="progress-steps-row">
            {[1,2,3].map(s => { const cur = step === "preview" ? 4 : Number(step); return <div key={s} className={`prog-seg ${s < cur ? "done" : s === cur ? "active" : ""}`} />; })}
          </div>
          <div className="progress-label">{step === "preview" ? t("previewLabel") : LABELS[step]}</div>
        </div>
      )}

      {loading && (
        <div className="page-content">
          <div className="loading-screen">
            <div className="loader-container"><div className="loader-ring" /><div className="loader-inner" /></div>
            <div className="loading-title">{t("loadTitle")}</div>
            <div className="loading-subtitle">{t("loadSub")}</div>
            <div className="loading-items">
              {[t("loadStep1"), t("loadStep2"), t("loadStep3")].map((txt, i) => (
                <div key={i} className={`loading-item ${loadStep === i ? "active" : loadStep > i ? "done" : ""}`}>
                  <span className="li-icon">{loadStep > i ? "✓" : "·"}</span>{txt}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 1 && !loading && (
        <>
          <div className="page-content fade-up">
            <div className="page-title">{lang === "en" ? "What do you want to train?" : "Que veux-tu travailler ?"}</div>
            <div className="page-sub">{lang === "en" ? "Select one or more muscle groups" : "Sélectionne un ou plusieurs groupes musculaires"}</div>

            {/* Full Body shortcut */}
            <div
              className={`fullbody-card ${form.muscles.includes("fullbody") ? "selected" : ""}`}
              onClick={() => setForm(f => ({ ...f, muscles: f.muscles.includes("fullbody") ? [] : ["fullbody"] }))}>
              <div className="fullbody-left">
                <div className="fullbody-icon">◈</div>
                <div>
                  <div className="fullbody-name">{lang === "en" ? "Full Body" : "Full Body"}</div>
                  <div className="fullbody-sub">{lang === "en" ? "All muscle groups — complete session" : "Tous les groupes — séance complète"}</div>
                </div>
              </div>
              {form.muscles.includes("fullbody") && <div className="fullbody-check">✓</div>}
            </div>

            {/* Anatomical groups */}
            {[
              {
                group: lang === "en" ? "Upper body — Push" : "Haut du corps — Poussée",
                muscles: ["chest","shoulders","triceps"],
                hint: lang === "en" ? "Bench, OHP, Dips" : "Développé, OHP, Dips",
              },
              {
                group: lang === "en" ? "Upper body — Pull" : "Haut du corps — Tirage",
                muscles: ["back","biceps","traps","forearms"],
                hint: lang === "en" ? "Pull-up, Row, Curl" : "Traction, Row, Curl",
              },
              {
                group: lang === "en" ? "Lower body" : "Bas du corps",
                muscles: ["legs","glutes","calves"],
                hint: lang === "en" ? "Squat, DL, Hip thrust" : "Squat, SdT, Hip thrust",
              },
              {
                group: lang === "en" ? "Core" : "Abdominaux",
                muscles: ["abs"],
                hint: lang === "en" ? "Plank, Crunch, Dragon flag" : "Planche, Crunch, Dragon flag",
              },
            ].map((section, si) => {
              const sectionMuscles = MUSCLES_UI.filter(m => section.muscles.includes(m.id));
              const allSelected = sectionMuscles.every(m => form.muscles.includes(m.id));
              return (
                <div key={si} style={{ marginBottom: 10 }}>
                <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:7, gap:8 }}>
                    <div>
                      <div style={{ fontFamily:"Outfit", fontSize:10, fontWeight:700, letterSpacing:1.2, textTransform:"uppercase", color:"var(--text3)" }}>{section.group}</div>
                      <div style={{ fontSize:10, color:"var(--text3)", opacity:0.65, marginTop:2, fontStyle:"italic" }}>{section.hint}</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const ids = section.muscles;
                        setForm(f => ({
                          ...f,
                          muscles: allSelected
                            ? f.muscles.filter(m => !ids.includes(m))
                            : [...new Set([...f.muscles.filter(m => m !== "fullbody"), ...ids])]
                        }));
                      }}
                      style={{ fontSize:10, fontWeight:600, color: allSelected ? "var(--gold)" : "var(--text3)", background: allSelected ? "var(--gold-dim)" : "var(--surface2)", border:`1px solid ${allSelected ? "rgba(201,168,76,0.3)" : "var(--border)"}`, borderRadius:7, cursor:"pointer", fontFamily:"Outfit", padding:"5px 10px", letterSpacing:0.3, flexShrink:0, whiteSpace:"nowrap", WebkitTapHighlightColor:"transparent" }}>
                      {allSelected ? (lang === "en" ? "✓ All" : "✓ Tout") : (lang === "en" ? "Select all" : "Tout sélect.")}
                    </button>
                  </div>
                  <div className={`muscle-grid ${sectionMuscles.length === 1 ? "single" : ""}`}>
                    {sectionMuscles.map(m => {
                      const sel = form.muscles.includes(m.id);
                      return (
                        <div key={m.id}
                          className={`muscle-card ${sel ? "selected" : ""}`}
                          style={sectionMuscles.length === 1 ? { flexDirection:"row", justifyContent:"flex-start", gap:14, paddingLeft:16, minHeight:64 } : {}}
                          onClick={() => {
                            setForm(f => ({
                              ...f,
                              muscles: f.muscles.includes(m.id)
                                ? f.muscles.filter(x => x !== m.id)
                                : [...f.muscles.filter(x => x !== "fullbody"), m.id]
                            }));
                          }}>
                          {m.svg && <div className="muscle-card-svg">{m.svg}</div>}
                          <span className="muscle-label" style={sectionMuscles.length === 1 ? { textAlign:"left", fontSize:13 } : {}}>{getMuscleLabel(m)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {form.muscles.length > 0 && !form.muscles.includes("fullbody") && (
              <div className="muscles-hint">
                <span>{form.muscles.length}</span> {lang === "en" ? `group${form.muscles.length > 1 ? "s" : ""} selected` : `groupe${form.muscles.length > 1 ? "s" : ""} sélectionné${form.muscles.length > 1 ? "s" : ""}`}
              </div>
            )}
          </div>
          <div className="action-bar">
            <button className="btn-primary" disabled={!form.muscles.length} onClick={() => setStep(2)}>{t("btnNext")}</button>
          </div>
        </>
      )}

      {step === 2 && !loading && (
        <>
          <div className="page-content fade-up">
            <div className="page-title">{t("step2Title")}</div>
            <div className="page-sub">{t("step2Sub")}</div>
            <div className="goal-list">
              {GOALS_TRAINING.map(g => (
                <div key={g.id} className={`goal-card ${form.goal === g.id ? "selected" : ""}`}
                  onClick={() => setForm(f => ({ ...f, goal: g.id, method: "" }))}>
                  <div className="goal-card-inner">
                    {g.svg && <div style={{ color: form.goal === g.id ? "var(--gold)" : "var(--text3)", transition:"color 0.15s", flexShrink:0 }}>{g.svg}</div>}
                    <div className="goal-text">
                      <div className="goal-name">{getGoalName(g)}</div>
                      <div className="goal-desc">{getGoalDesc(g)}</div>
                    </div>
                    <div className="goal-scheme">{g.scheme}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Method picker — only when Force is selected */}
            {form.goal === "strength" && (
              <>
                <div className="section-label" style={{ marginTop: 20 }}>
                  {lang === "en" ? "Choose a strength method" : "Choix de la méthode"}
                </div>
                <div className="method-list">
                  {(STRENGTH_METHODS[lang] || STRENGTH_METHODS.fr).map(m => (
                    <div key={m.id} className={`method-card ${form.method === m.id ? "selected" : ""}`}
                      onClick={() => setForm(f => ({ ...f, method: m.id }))}>
                      <div className="method-top">
                        <div>
                          <div className="method-name">{m.name}</div>
                          <div className="method-author">{m.author}</div>
                        </div>
                        <div className="method-badge">{m.badge}</div>
                      </div>
                      <div className="method-desc">{m.desc}</div>
                      <div className="method-detail">{m.detail}</div>
                      <div className="method-meta">
                        <div className="method-meta-pill">{m.weeks}</div>
                        <div className="method-meta-pill">{m.sessions}</div>
                        <div className="method-meta-pill">{m.level}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="section-label">{t("level")}</div>
            <div className="chip-group">
              {LEVELS.map(l => <div key={l.id} className={`chip ${form.level === l.id ? "selected" : ""}`}
                onClick={() => setForm(f => ({ ...f, level: l.id, useAdvanced: l.id !== "advanced" ? false : f.useAdvanced }))}>{getLevelLabel(l)}</div>)}
            </div>
            {/* Advanced exercises opt-in — appears only after choosing Confirmé */}
            {form.goal && form.goal !== "strength" && form.level === "advanced" && (
              <div
                className={`adv-toggle ${form.useAdvanced ? "active" : ""}`}
                onClick={() => setForm(f => ({ ...f, useAdvanced: !f.useAdvanced }))}>
                <div className="adv-toggle-left">
                  <div className="adv-toggle-icon">{form.useAdvanced ? "✦" : "◇"}</div>
                  <div>
                    <div className="adv-toggle-label">
                      {lang === "en" ? "Optimal & lesser-known exercises" : "Exercices moins connus & plus optimaux"}
                    </div>
                    <div className="adv-toggle-sub">
                      {lang === "en"
                        ? "Bayesian curl, Nordic curl, Meadows row, JM press..."
                        : "Bayesian curl, Nordic curl, Meadows row, JM press..."}
                    </div>
                  </div>
                </div>
                <div className={`adv-toggle-check ${form.useAdvanced ? "on" : ""}`}>
                  {form.useAdvanced ? "ON" : "OFF"}
                </div>
              </div>
            )}
          </div>
          <div className="action-bar">
            <button className="btn-primary"
              disabled={!form.goal || (form.goal === "strength" && !form.method)}
              onClick={() => setStep(3)}>{t("btnNext")}</button>
            <button className="btn-ghost" onClick={() => setStep(1)}>{t("btnBack")}</button>
          </div>
        </>
      )}

      {step === 3 && !loading && (
        <>
          <div className="page-content fade-up">
            <div className="page-title">{t("step3Title")}</div>
            <div className="page-sub">{t("step3Sub")}</div>
            {form.goal !== "strength" && (
              <>
                <div className="section-label">{t("sessionsPerWeek")}</div>
                <div className="days-selector">
                  {[2,3,4,5,6].map(d => (
                    <div key={d} className={`day-btn ${form.daysPerWeek === d ? "selected" : ""}`} onClick={() => setForm(f => ({ ...f, daysPerWeek: d }))}>
                      {d}<span className="day-sub">{lang === "en" ? `day${d>1?"s":""}` : `jour${d>1?"s":""}`}</span>
                    </div>
                  ))}
                </div>

                <div className="section-label" style={{ marginTop: 22 }}>
                  {lang === "en" ? "Session duration" : "Durée de séance"}
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  {[
                    { val:30,  label:"30 min", sub: lang==="en" ? "4 exercises" : "4 exercices" },
                    { val:60,  label:"1 heure", sub: lang==="en" ? "6–7 exercises" : "6–7 exercices" },
                    { val:90,  label:"1h 30",  sub: lang==="en" ? "9–10 exercises" : "9–10 exercices" },
                  ].map(d => (
                    <div key={d.val}
                      onClick={() => setForm(f => ({ ...f, sessionDuration: d.val }))}
                      style={{
                        flex:1, background: form.sessionDuration===d.val ? "var(--gold-dim)" : "var(--surface)",
                        border: `1px solid ${form.sessionDuration===d.val ? "var(--gold)" : "var(--border)"}`,
                        borderRadius:12, padding:"11px 8px", cursor:"pointer", textAlign:"center",
                        transition:"all 0.15s", WebkitTapHighlightColor:"transparent",
                        position:"relative",
                      }}>
                      <div style={{ fontFamily:"Outfit", fontSize:14, fontWeight:700, color: form.sessionDuration===d.val ? "var(--gold)" : "var(--text)" }}>{d.label}</div>
                      <div style={{ fontSize:10, color: form.sessionDuration===d.val ? "var(--gold2)" : "var(--text3)", marginTop:3, fontFamily:"Outfit" }}>{d.sub}</div>
                      {form.sessionDuration===d.val && <div style={{ position:"absolute", top:7, right:8, fontSize:9, color:"var(--gold)", fontWeight:700 }}>✓</div>}
                    </div>
                  ))}
                </div>

                <div className="section-label" style={{ marginTop: 22 }}>{t("equipment")}</div>
                <div className="chip-group">
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    {EQUIPMENT_UI.map(e => {
                      const sel = form.equipment.includes(e.id);
                      return (
                        <div key={e.id}
                          onClick={() => toggle("equipment", e.id)}
                          style={{
                            background: sel ? "var(--gold-dim)" : "var(--surface)",
                            border: `1px solid ${sel ? "var(--gold)" : "var(--border)"}`,
                            borderRadius: 14, padding:"11px 12px 10px",
                            cursor:"pointer", transition:"all 0.15s",
                            WebkitTapHighlightColor:"transparent",
                            position:"relative",
                          }}>
                          <div style={{ fontSize:18, marginBottom:4, opacity: sel ? 1 : 0.5 }}>{e.icon}</div>
                          <div style={{ fontFamily:"Outfit", fontSize:12, fontWeight:700, color: sel ? "var(--gold)" : "var(--text)", lineHeight:1.2 }}>{getEquipLabel(e)}</div>
                          <div style={{ fontSize:10, color: sel ? "var(--gold2)" : "var(--text3)", marginTop:2 }}>{lang === "en" ? e.descEn : e.desc}</div>
                          {sel && <div style={{ position:"absolute", top:8, right:9, fontSize:10, color:"var(--gold)", fontWeight:700, fontFamily:"Outfit" }}>✓</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
            {form.goal === "strength" && form.method && (() => {
              const m = (STRENGTH_METHODS[lang] || STRENGTH_METHODS.fr).find(x => x.id === form.method);
              return m ? (
                <div className="method-card selected" style={{ pointerEvents: "none", marginBottom: 4 }}>
                  <div className="method-top">
                    <div><div className="method-name">{m.name}</div><div className="method-author">{m.author}</div></div>
                    <div className="method-badge">{m.badge}</div>
                  </div>
                  <div className="method-detail">{m.detail}</div>
                  <div className="method-meta">
                    <div className="method-meta-pill">{m.weeks}</div>
                    <div className="method-meta-pill">{m.sessions}</div>
                  </div>
                </div>
              ) : null;
            })()}
            <div className="section-label" style={{ marginTop: 22 }}>{t("notes")}</div>
            <textarea className="text-input" rows={2} placeholder={t("notesPlaceholder")} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            <div className="info-box" style={{ marginTop: 14 }}>{t("offlineBadge")}</div>
          </div>
          <div className="action-bar">
            <button className="btn-primary" onClick={generate}>{t("btnGenerate")}</button>
            <button className="btn-ghost" onClick={() => setStep(2)}>{t("btnBack")}</button>
          </div>
        </>
      )}

      {step === "preview" && program && !loading && (
        <>
          <div className="page-content fade-up">
            <div className="program-hero">
              {program.isStrengthMethod && (
                <div className="wendler-badge">{program.programName.split("—")[0].trim()}</div>
              )}
              {program.isWendler && !program.isStrengthMethod && (
                <div className="wendler-badge">WENDLER 5/3/1</div>
              )}
              <div className="program-hero-name">{program.programName}</div>
              <div className="program-hero-summary">{program.summary}</div>
              {(program.progressionNote) && (
                <div style={{ background: "rgba(167,139,250,0.07)", border: "1px solid rgba(167,139,250,0.15)", borderRadius: 10, padding: "9px 12px", fontSize: 11, color: "#C4B5FD", lineHeight: 1.5, marginBottom: 12 }}>
                  📐 {program.progressionNote}
                </div>
              )}
              {(program.tmNote) && (
                <div style={{ background: "rgba(167,139,250,0.07)", border: "1px solid rgba(167,139,250,0.15)", borderRadius: 10, padding: "9px 12px", fontSize: 11, color: "#C4B5FD", lineHeight: 1.5, marginBottom: 12 }}>
                  📐 {program.tmNote}
                </div>
              )}
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
                    <div className="rest-content"><span className="rest-icon-sm">😴</span>{lang === "en" ? "Rest & recovery." : "Repos & récupération."}</div>
                  ) : day.exercises?.map((ex, j) => (
                    <div key={j} className={`ex-row ${ex.isFinisher ? "finisher" : ""}`}>
                      <div className="ex-idx">{j+1}</div>
                      <div className="ex-body">
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <div className="ex-name">{ex.name}</div>
                          {ex.muscle && <div className="ex-muscle-tag">{ex.muscle}</div>}
                          {ex.isFinisher && <div className="ex-finisher-tag">Finisher</div>}
                          {ex.isWendlerMain && <div className="wendler-week-badge">{ex.weekLabel}</div>}
                          {ex.isTier1 && <div style={{ background:"rgba(201,168,76,0.12)",border:"1px solid rgba(201,168,76,0.25)",borderRadius:5,padding:"1px 7px",fontSize:9,fontWeight:700,color:"var(--gold2)",fontFamily:"Outfit",letterSpacing:0.5 }}>T1</div>}
                          {ex.isTier2 && <div style={{ background:"rgba(96,165,250,0.1)",border:"1px solid rgba(96,165,250,0.2)",borderRadius:5,padding:"1px 7px",fontSize:9,fontWeight:700,color:"#93C5FD",fontFamily:"Outfit",letterSpacing:0.5 }}>T2</div>}
                          {ex.isTier3 && <div style={{ background:"rgba(74,222,128,0.08)",border:"1px solid rgba(74,222,128,0.15)",borderRadius:5,padding:"1px 7px",fontSize:9,fontWeight:700,color:"var(--green)",fontFamily:"Outfit",letterSpacing:0.5 }}>T3</div>}
                          {ex.isStartingStrength && <div style={{ background:"rgba(167,139,250,0.1)",border:"1px solid rgba(167,139,250,0.2)",borderRadius:5,padding:"1px 7px",fontSize:9,fontWeight:700,color:"#C4B5FD",fontFamily:"Outfit",letterSpacing:0.5 }}>SS</div>}
                        </div>
                        {ex.pcts && <div style={{ fontSize: 11, color: "#A78BFA", marginBottom: 4, fontFamily: "Outfit" }}>TM% : {ex.pcts}</div>}
                        {ex.tip && <div className="ex-tip">💡 {ex.tip}</div>}
                        <a className="ex-video-link" href={getYouTubeUrl(ex.name)} target="_blank" rel="noopener noreferrer">
                          ▷ {lang === "en" ? "See tutorial" : "Voir le tutoriel"}
                        </a>
                        <div className="ex-stats">
                          <div className="ex-stat sets">{ex.sets} {lang === "en" ? "sets" : "séries"}</div>
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
            <button className="btn-primary" onClick={() => onSave(program)}>{t("btnSave")}</button>
            <button className="btn-ghost" onClick={reset}>{t("btnRestart")}</button>
          </div>
        </>
      )}
    </>
  );
}

// ── PROGRAMS VIEW ─────────────────────────────────────────────────────────────
function ProgramsView({ programs, onOpen, onDelete, lang, onShare, onGoCreate }) {
  const t = (key) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.fr[key] ?? key;
  return (
    <>
      <div className="app-header">
        <div className="logo-mark"><div className="logo-icon">G</div><span className="logo-text">GAINZ</span></div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <button className="share-header-btn" onClick={onShare}>
            ↗ {lang === "en" ? "Share" : "Partager"}
          </button>
          <div className="header-badge">{programs.length}</div>
        </div>
      </div>
      <div className="page-content">
        {programs.length === 0 ? (
          <div className="empty-state fade-up">
            <div style={{ width:64, height:64, background:"var(--gold-dim)", border:"1px solid rgba(201,168,76,0.25)", borderRadius:18, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, fontFamily:"Outfit", fontWeight:900, color:"var(--gold)", marginBottom:4 }}>G</div>
            <div className="empty-title">{lang === "en" ? "No programs yet" : "Aucun programme"}</div>
            <div className="empty-sub" style={{ maxWidth:240, margin:"0 auto" }}>
              {lang === "en" ? "Create your first personalized training program in seconds." : "Génère ton premier programme d'entraînement personnalisé en quelques secondes."}
            </div>
            <button className="btn-primary" style={{ marginTop:8, width:"100%", maxWidth:260 }} onClick={onGoCreate}>
              {lang === "en" ? "✦ Create my first program" : "✦ Créer mon premier programme"}
            </button>
          </div>
        ) : (
          <div className="fade-up">
            <div className="programs-header">
              <div className="programs-title">{t("programsTitle")}</div>
              <div className="programs-count">{programs.length} {lang === "en" ? `program${programs.length > 1 ? "s" : ""} saved` : `programme${programs.length > 1 ? "s" : ""} sauvegardé${programs.length > 1 ? "s" : ""}`}</div>
            </div>
            {programs.map(prog => (
              <div key={prog.id} className="prog-card" onClick={() => onOpen(prog)}>
                <div className="prog-card-name">{prog.programName}</div>
                <div className="prog-card-meta">{lang === "en" ? "Created" : "Créé le"} {prog.savedAt} · {prog.days?.length || 0} {lang === "en" ? "days" : "jours"}</div>
                <div className="prog-card-badges">
                  {prog.isWendler && <div className="prog-card-badge wendler">5/3/1</div>}
                  {prog.isStrengthMethod && prog.methodId === "531" && <div className="prog-card-badge wendler">5/3/1</div>}
                  {prog.isStrengthMethod && prog.methodId === "gzclp" && <div className="prog-card-badge wendler">GZCLP</div>}
                  {prog.isStrengthMethod && prog.methodId === "ss" && <div className="prog-card-badge wendler">SS</div>}
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
function DailyView({ program, onBack, onWorkoutDone, lang = "fr" }) {
  const t = (key) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.fr[key] ?? key;
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
    setTimerTotal(sec); setTimerSec(sec); setNextExName(nextName || ""); setTimerActive(true);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimerSec(s => { if (s <= 1) { clearInterval(timerRef.current); setTimerActive(false); return 0; } return s - 1; });
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

  const getDayShort = (d) => d.isRest
    ? (lang === "en" ? "REST" : "REPOS")
    : d.name?.split(/[—\-]/)[0]?.trim()?.slice(0, 5)?.toUpperCase() || `D${d.dayNumber}`;

  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference * (1 - (timerTotal > 0 ? timerSec / timerTotal : 1));

  return (
    <>
      {timerActive && (
        <div className="rest-timer-overlay">
          <div className="timer-ring-wrap">
            <svg className="timer-svg" width="150" height="150" viewBox="0 0 120 120">
              <circle className="timer-track" cx="60" cy="60" r="52" />
              <circle className="timer-progress" cx="60" cy="60" r="52" strokeDasharray={circumference} strokeDashoffset={dashOffset} />
            </svg>
            <div className="timer-num">
              <div className="timer-seconds">{timerSec}</div>
              <div className="timer-label-sm">sec</div>
            </div>
          </div>
          <div className="timer-title">{t("restTimer")}</div>
          {nextExName && <div className="timer-next">{t("timerNext")} <strong>{nextExName}</strong></div>}
          <button className="timer-skip" onClick={skipTimer}>{t("timerSkip")}</button>
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
              <div className="dp-num">{i+1}</div>
              <div className="dp-label">{getDayShort(d)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="page-content">
        {day?.isRest ? (
          <div className="rest-day-view fade-up">
            <div className="rest-big-icon">🛌</div>
            <div className="rest-view-title">{t("restDay")}</div>
            <div className="rest-view-sub">{t("restDaySub")}</div>
            <div className="rest-tips">
              {[
                { icon: "💧", fr: "Hydrate-toi bien (2-3L d'eau minimum)", en: "Stay hydrated (2-3L of water minimum)" },
                { icon: "🥩", fr: "Maintiens ton apport en protéines (1.6-2g/kg)", en: "Keep your protein intake up (1.6-2g/kg)" },
                { icon: "😴", fr: "Vise 7-9h de sommeil pour la récupération", en: "Aim for 7-9h of sleep for recovery" },
                { icon: "🚶", fr: "Une marche légère de 20-30min est bénéfique", en: "A light 20-30min walk is beneficial" },
              ].map((tip, i) => <div key={i} className="rest-tip-item"><span>{tip.icon}</span>{lang === "en" ? tip.en : tip.fr}</div>)}
            </div>
          </div>
        ) : (
          <div className="fade-up">
            {sessionDone && (
              <div className="card scale-in" style={{ background: "linear-gradient(135deg,var(--surface),rgba(74,222,128,0.07))", border: "1px solid rgba(74,222,128,0.25)", marginBottom: 13, textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 5 }}>🏆</div>
                <div className="card-title" style={{ color: "var(--green)" }}>{t("sessionDoneTitle")}</div>
                <div className="card-sub" style={{ marginTop: 3 }}>{t("sessionDoneSub")}</div>
              </div>
            )}

            <div className="session-header">
              <div className="session-title">{day?.name}</div>
              <div className="session-muscles">{day?.muscles}</div>
              <div className="session-ex-count">{totalEx} {totalEx > 1 ? t("exercisesPlural") : t("exercises")}</div>
            </div>

            {totalEx > 0 && (
              <div className="session-progress">
                <div className="sp-bar-wrap"><div className="sp-bar" style={{ width: `${(doneEx/totalEx)*100}%` }} /></div>
                <div className="sp-text"><span>{doneEx}</span>/{totalEx}</div>
              </div>
            )}

            {day?.exercises?.map((ex, j) => {
              const done = !!completed[`${dayIdx}-${j}`];
              return (
                <div key={j} className={`ex-card ${done ? "completed" : ""} ${ex.isFinisher ? "finisher-card" : ""}`}>
                  <div className="ex-card-top">
                    <div className="ex-card-num">{j+1}</div>
                    <div className="ex-card-info">
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <div className="ex-card-name">{ex.name}</div>
                        {ex.muscle && <div className="ex-muscle-badge">{ex.muscle}</div>}
                        {ex.isFinisher && <div className="ex-finisher-tag">Finisher</div>}
                        {ex.isWendlerMain && ex.weekLabel && <div className="wendler-week-badge">{ex.weekLabel}</div>}
                        {ex.isTier1 && <div style={{ background:"rgba(201,168,76,0.12)",border:"1px solid rgba(201,168,76,0.25)",borderRadius:5,padding:"1px 7px",fontSize:9,fontWeight:700,color:"var(--gold2)",fontFamily:"Outfit",letterSpacing:0.5 }}>T1</div>}
                        {ex.isTier2 && <div style={{ background:"rgba(96,165,250,0.1)",border:"1px solid rgba(96,165,250,0.2)",borderRadius:5,padding:"1px 7px",fontSize:9,fontWeight:700,color:"#93C5FD",fontFamily:"Outfit",letterSpacing:0.5 }}>T2</div>}
                        {ex.isTier3 && <div style={{ background:"rgba(74,222,128,0.08)",border:"1px solid rgba(74,222,128,0.15)",borderRadius:5,padding:"1px 7px",fontSize:9,fontWeight:700,color:"var(--green)",fontFamily:"Outfit",letterSpacing:0.5 }}>T3</div>}
                      </div>
                      {ex.pcts && <div style={{ fontSize: 10, color: "#A78BFA", marginBottom: 3, fontFamily: "Outfit" }}>TM%: {ex.pcts}</div>}
                      {ex.tip && <div className="ex-card-tip">💡 {ex.tip}</div>}
                      <a className="ex-video-link" href={getYouTubeUrl(ex.name)} target="_blank" rel="noopener noreferrer">
                        ▷ {lang === "en" ? "See tutorial" : "Voir le tutoriel"}
                      </a>
                    </div>
                  </div>
                  <div className="ex-card-stats">
                    <div className="ex-big-stat sets-stat"><div className="val">{ex.sets}</div><div className="lbl">{t("sets")}</div></div>
                    <div className="ex-big-stat reps-stat"><div className="val">{ex.reps}</div><div className="lbl">{t("reps")}</div></div>
                    <div className="ex-big-stat rest-stat"><div className="val">{ex.rest}</div><div className="lbl">{t("rest")}</div></div>
                  </div>
                  <button className="ex-done-btn" onClick={() => toggleEx(j, ex)}>
                    {done ? t("markUndo") : t("markDone")}
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
function NutritionView({ profile, onGoToProfile, lang }) {
  const t = (key) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.fr[key] ?? key;
  const nutrition = profile ? calculateNutrition(profile) : null;
  const bodyGoalObj = profile ? (BODY_GOALS[lang] || BODY_GOALS.fr).find(g => g.id === profile.bodyGoal) : null;

  if (!profile || !nutrition) {
    return (
      <>
        <div className="app-header">
          <div className="logo-mark"><div className="logo-icon">G</div><span className="logo-text">GAINZ</span></div>
          <div className="header-badge">{t("nutritionTitle")}</div>
        </div>
        <div className="page-content fade-up">
          <div className="no-profile-banner">
            <div className="no-profile-banner-title">{t("noProfileTitle")}</div>
            <div className="no-profile-banner-sub">{t("noProfileSub")}</div>
          </div>
          <button className="btn-primary" style={{ width: "100%" }} onClick={onGoToProfile}>{t("goToProfile")}</button>
        </div>
      </>
    );
  }

  const { targetKcal, protein, fat, carbs, water } = nutrition;
  const maxMacro = Math.max(protein, carbs, fat);
  const meals = getMealPlan(targetKcal, profile.bodyGoal, lang);
  const [expandedAlts, setExpandedAlts] = React.useState({});
  const protPerKg = (protein / parseFloat(profile.weight)).toFixed(1);

  return (
    <>
      <div className="app-header">
        <div className="logo-mark"><div className="logo-icon">G</div><span className="logo-text">GAINZ</span></div>
        <div className="header-badge">{t("nutritionTitle")}</div>
      </div>
      <div className="page-content fade-up">

        {/* Macro hero */}
        <div className="macro-hero">
          <div className="macro-hero-title">{t("dailyTarget")}</div>
          <div className="macro-kcal">{targetKcal.toLocaleString()} <span>{t("kcalDay")}</span></div>
          <div className="macro-goal-label">{bodyGoalObj?.name} · {profile.weight}kg · {profile.height}cm</div>
          <div className="macro-bars">
            {[
              { label: t("macroProteins"), val: protein, color: "#60A5FA" },
              { label: t("macroCarbs"), val: carbs, color: "#C9A84C" },
              { label: t("macroFats"), val: fat, color: "#A78BFA" },
            ].map(m => (
              <div key={m.label} className="macro-bar-row">
                <div className="macro-bar-label">{m.label}</div>
                <div className="macro-bar-wrap"><div className="macro-bar-fill" style={{ width: `${(m.val/maxMacro)*100}%`, background: m.color }} /></div>
                <div className="macro-bar-val">{m.val}g</div>
              </div>
            ))}
          </div>
        </div>

        {/* Macro cards */}
        <div className="macro-cards">
          {[
            { label: t("macroProteins"), val: protein, color: "#60A5FA", sub: `${protPerKg}g/kg` },
            { label: t("macroCarbs"),    val: carbs,   color: "#C9A84C", sub: `${Math.round(carbs*4)} kcal` },
            { label: t("macroFats"),     val: fat,     color: "#A78BFA", sub: `${Math.round(fat*9)} kcal` },
          ].map(m => (
            <div key={m.label} className="macro-card">
              <div className="macro-card-val" style={{ color: m.color }}>{m.val}<span>g</span></div>
              <div className="macro-card-label">{m.label}</div>
              <div style={{ fontSize:10, color:"var(--text3)", marginTop:2, fontFamily:"Outfit" }}>{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Protein context note */}
        <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:12, padding:"10px 13px", marginBottom:10, display:"flex", gap:9, alignItems:"flex-start" }}>
          <span style={{ fontSize:16, flexShrink:0, marginTop:1 }}>ℹ️</span>
          <div style={{ fontSize:11.5, color:"var(--text2)", lineHeight:1.55 }}>
            {lang === "en"
              ? <><strong style={{color:"var(--text)"}}>{protein}g of protein</strong> ({protPerKg}g/kg) — based on ISSN guidelines for recreational athletes. Professionals and advanced bodybuilders may go up to 2.2–2.5g/kg during a cut.</>
              : <><strong style={{color:"var(--text)"}}>{protein}g de protéines</strong> ({protPerKg}g/kg) — basé sur les recommandations ISSN pour sportifs amateurs. Les pros et bodybuilders avancés peuvent monter à 2.2–2.5g/kg en sèche.</>
            }
          </div>
        </div>

        {/* Water */}
        <div className="card" style={{ marginBottom: 13 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>💧</span>
            <div>
              <div className="card-title">{water}{t("waterDay")}</div>
              <div className="card-sub">{t("waterSub")}</div>
            </div>
          </div>
        </div>

        {/* Micronutrients */}
        <div className="section-label" style={{ marginTop: 20 }}>
          {lang === "en" ? "Key micronutrients" : "Micronutriments clés"}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7, marginBottom:14 }}>
          {[
            { icon:"🔴", name: lang==="en" ? "Iron" : "Fer",           dose: lang==="en" ? "14–18 mg/day" : "14–18 mg/j",    src: lang==="en" ? "Red meat, lentils, spinach" : "Viande rouge, lentilles, épinards" },
            { icon:"🟡", name: lang==="en" ? "Magnesium" : "Magnésium", dose: lang==="en" ? "300–420 mg/day" : "300–420 mg/j", src: lang==="en" ? "Dark chocolate, oats, nuts" : "Chocolat noir, avoine, noix" },
            { icon:"🟠", name: lang==="en" ? "Zinc" : "Zinc",           dose: lang==="en" ? "10–15 mg/day" : "10–15 mg/j",    src: lang==="en" ? "Beef, oysters, seeds" : "Bœuf, huîtres, graines" },
            { icon:"🔵", name: lang==="en" ? "Vitamin D" : "Vit. D",    dose: lang==="en" ? "1000–2000 IU/day" : "1000–2000 UI/j", src: lang==="en" ? "Fatty fish, eggs, sun" : "Poisson gras, œufs, soleil" },
            { icon:"🟢", name: lang==="en" ? "Omega-3" : "Oméga-3",     dose: lang==="en" ? "1.5–3g EPA/DHA" : "1.5–3g EPA/DHA", src: lang==="en" ? "Salmon, sardines, flaxseed" : "Saumon, sardines, lin" },
            { icon:"⚪", name: lang==="en" ? "Calcium" : "Calcium",      dose: lang==="en" ? "1000–1200 mg/day" : "1000–1200 mg/j", src: lang==="en" ? "Dairy, sardines, kale" : "Laitages, sardines, chou" },
          ].map((micro, i) => (
            <div key={i} style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:12, padding:"10px 11px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                <span style={{ fontSize:12 }}>{micro.icon}</span>
                <span style={{ fontFamily:"Outfit", fontSize:12, fontWeight:700, color:"var(--text)" }}>{micro.name}</span>
              </div>
              <div style={{ fontSize:10.5, color:"var(--gold2)", fontWeight:600, fontFamily:"Outfit", marginBottom:2 }}>{micro.dose}</div>
              <div style={{ fontSize:10, color:"var(--text3)", lineHeight:1.4 }}>{micro.src}</div>
            </div>
          ))}
        </div>

        {/* Meal plan */}
        <div className="section-label" style={{ marginTop: 20 }}>{t("mealPlan")}</div>
        {meals.map((meal, i) => (
          <div key={i} className="meal-card" style={{ marginBottom:9 }}>
            <div className="meal-card-header" style={{ marginBottom:8 }}>
              <span className="meal-card-icon">{meal.icon}</span>
              <div style={{ flex:1 }}>
                <div className="meal-card-title">{meal.title}</div>
                <div className="meal-card-kcal">~{meal.kcal} kcal · <span style={{ color:"var(--text3)" }}>{meal.time}</span></div>
              </div>
            </div>
            <div className="meal-items">
              {meal.items.map((item, j) => <div key={j} className="meal-item">{item}</div>)}
            </div>
            {meal.alts && (
              <>
                <button
                  onClick={() => setExpandedAlts(s => ({ ...s, [i]: !s[i] }))}
                  style={{ marginTop:10, fontSize:11, fontWeight:600, color:"var(--text3)", background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:8, padding:"5px 11px", cursor:"pointer", fontFamily:"Outfit", WebkitTapHighlightColor:"transparent", display:"flex", alignItems:"center", gap:5 }}>
                  {expandedAlts[i] ? "▲" : "▼"} {lang === "en" ? "Alternatives" : "Alternatives"} ({meal.alts.length})
                </button>
                {expandedAlts[i] && (
                  <div style={{ marginTop:8, background:"var(--surface2)", borderRadius:10, padding:"10px 12px" }}>
                    <div style={{ fontSize:10, fontWeight:700, letterSpacing:1, textTransform:"uppercase", color:"var(--text3)", marginBottom:7, fontFamily:"Outfit" }}>
                      {lang === "en" ? "Swap ideas" : "Idées de substitution"}
                    </div>
                    {meal.alts.map((alt, k) => (
                      <div key={k} style={{ fontSize:12, color:"var(--text2)", display:"flex", gap:7, alignItems:"baseline", marginBottom:4 }}>
                        <span style={{ color:"var(--gold)", flexShrink:0, fontSize:10 }}>✦</span>
                        {alt}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}

        <div className="info-box" style={{ marginTop:6, marginBottom:8 }}>
          {lang === "en"
            ? "⚡ These are indicative portions. Adjust based on your hunger, progress, and schedule."
            : "⚡ Ces quantités sont indicatives. Ajuste selon ta faim, tes progrès et ton emploi du temps."}
        </div>

        <div style={{ height: 8 }} />
      </div>
    </>
  );
}

// ── PROFILE VIEW ──────────────────────────────────────────────────────────────
function ProfileView({ profile, history, onSave, lang, onLangChange, currentLang, theme = "dark", onThemeChange }) {
  const t = (key) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.fr[key] ?? key;
  const [editing, setEditing] = useState(!profile);
  const [activeSection, setActiveSection] = useState("profile");
  const [form, setForm] = useState(profile || { name: "", age: "", weight: "", height: "", sex: "m", activity: "moderate", bodyGoal: "bulk", avatar: "🏋️" });
  const [avatarPicker, setAvatarPicker] = useState(false);
  const [installOpen, setInstallOpen] = useState({ 0: false, 1: false }); // accordion state for install tuto

  const handleSave = () => { onSave({ ...form }); setEditing(false); };

  const streak = (() => {
    if (!history.length) return 0;
    let s = 0;
    const today = new Date(); today.setHours(0,0,0,0);
    const d = new Date(today);
    const dates = [...new Set(history.map(h => h.date))];
    for (let i = 0; i < 60; i++) {
      const str = d.toLocaleDateString("fr-FR");
      if (dates.includes(str)) { s++; d.setDate(d.getDate() - 1); } else break;
    }
    return s;
  })();

  const bodyGoals = BODY_GOALS[lang] || BODY_GOALS.fr;
  const activityLevels = ACTIVITY_LEVELS[lang] || ACTIVITY_LEVELS.fr;

  if (editing) {
    return (
      <>
        <div className="app-header">
          <div className="logo-mark"><div className="logo-icon">G</div><span className="logo-text">GAINZ</span></div>
          <div className="header-badge">{t("profileTitle")}</div>
        </div>
        <div className="page-content fade-up">
          <div className="page-title">{lang === "en" ? "Your profile" : "Ton profil"}</div>
          <div className="page-sub">{lang === "en" ? "This information personalizes your program and nutrition." : "Ces informations personnalisent ton programme et ta nutrition."}</div>

          {avatarPicker && (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 14, marginBottom: 14 }}>
              <div className="section-label">{lang === "en" ? "Choose avatar" : "Choisir un avatar"}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {AVATARS.map(a => (
                  <div key={a} onClick={() => { setForm(f => ({ ...f, avatar: a })); setAvatarPicker(false); }}
                    style={{ width: 42, height: 42, background: form.avatar === a ? "var(--gold-dim)" : "var(--surface2)", border: `1px solid ${form.avatar === a ? "var(--gold)" : "var(--border)"}`, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, cursor: "pointer" }}>
                    {a}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 20 }}>
            <div className="profile-avatar" onClick={() => setAvatarPicker(v => !v)}>{form.avatar || "🏋️"}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text2)" }}>{t("avatarPrompt")}</div>
              <div style={{ fontSize: 11, color: "var(--text3)" }}>{t("avatarSub")}</div>
            </div>
          </div>

          <div className="section-label">{t("personalInfo")}</div>

          <div className="input-group" style={{ marginBottom: 10 }}>
            <div className="input-label">{t("firstNameLabel")}</div>
            <input className="input-field" type="text" placeholder={t("firstNamePlaceholder")} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>

          <div className="input-row" style={{ marginBottom: 10 }}>
            <div className="input-group">
              <div className="input-label">{t("ageLabel")}</div>
              <input className="input-field" type="number" placeholder="25" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} />
            </div>
            <div className="input-group">
              <div className="input-label">{t("sexLabel")}</div>
              <select className="input-field" value={form.sex} onChange={e => setForm(f => ({ ...f, sex: e.target.value }))}>
                <option value="m">{t("sexM")}</option>
                <option value="f">{t("sexF")}</option>
              </select>
            </div>
          </div>

          <div className="input-row">
            <div className="input-group">
              <div className="input-label">{t("weightLabel")}</div>
              <input className="input-field" type="number" placeholder="75" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} />
            </div>
            <div className="input-group">
              <div className="input-label">{t("heightLabel")}</div>
              <input className="input-field" type="number" placeholder="178" value={form.height} onChange={e => setForm(f => ({ ...f, height: e.target.value }))} />
            </div>
          </div>

          <div className="section-label">{t("activityLevel")}</div>
          <div className="chip-group">
            {activityLevels.map(a => <div key={a.id} className={`chip ${form.activity === a.id ? "selected" : ""}`} onClick={() => setForm(f => ({ ...f, activity: a.id }))}>{a.label}</div>)}
          </div>

          <div className="section-label">{t("bodyGoal")}</div>
          <div className="body-goal-list">
            {bodyGoals.map(g => (
              <div key={g.id} className={`body-goal-card ${form.bodyGoal === g.id ? "selected" : ""}`} onClick={() => setForm(f => ({ ...f, bodyGoal: g.id }))}>
                <div className="body-goal-inner">
                  <div className="body-goal-text">
                    <div className="body-goal-name">{g.name}</div>
                    <div className="body-goal-desc">{g.desc}</div>
                  </div>
                  <div className="body-goal-tag">{g.tag}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ height: 8 }} />
        </div>
        <div className="action-bar">
          <button className="btn-primary" disabled={!form.name || !form.weight || !form.height || !form.age} onClick={handleSave}>{t("saveProfile")}</button>
          {profile && <button className="btn-ghost" onClick={() => setEditing(false)}>{t("cancelBtn")}</button>}
        </div>
      </>
    );
  }

  const bgObj = bodyGoals.find(g => g.id === profile?.bodyGoal);

  return (
    <>
      <div className="app-header">
        <div className="logo-mark"><div className="logo-icon">G</div><span className="logo-text">GAINZ</span></div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-sm" onClick={() => setActiveSection(s => s === "settings" ? "profile" : "settings")}>
            {activeSection === "settings" ? (lang === "en" ? "Profile" : "Profil") : "⚙"}
          </button>
          {activeSection === "profile" && <button className="btn-sm" onClick={() => setEditing(true)}>{t("editBtn")}</button>}
        </div>
      </div>
      <div className="page-content">
        {activeSection === "settings" ? (
          <div className="fade-up">
            <div className="settings-title">{t("settingsTitle")}</div>

            {/* Language */}
            <div className="settings-item">
              <div>
                <div className="settings-item-label">{t("languageLabel")}</div>
              </div>
              <div className="lang-toggle">
                <button className={`lang-btn ${currentLang === "fr" ? "active" : ""}`} onClick={() => onLangChange("fr")}>FR</button>
                <button className={`lang-btn ${currentLang === "en" ? "active" : ""}`} onClick={() => onLangChange("en")}>EN</button>
              </div>
            </div>

            {/* Theme */}
            <div className="settings-item" style={{ marginTop: 10 }}>
              <div>
                <div className="settings-item-label">{lang === "en" ? "Appearance" : "Apparence"}</div>
                <div style={{ fontSize:11, color:"var(--text3)", marginTop:2 }}>
                  {lang === "en" ? "Interface colour" : "Couleur de l'interface"}
                </div>
              </div>
              <div className="lang-toggle">
                <button
                  className={`lang-btn ${theme === "dark" ? "active" : ""}`}
                  onClick={() => onThemeChange("dark")}
                  style={{ display:"flex", alignItems:"center", gap:5 }}>
                  ◑ {lang === "en" ? "Dark" : "Sombre"}
                </button>
                <button
                  className={`lang-btn ${theme === "light" ? "active" : ""}`}
                  onClick={() => onThemeChange("light")}
                  style={{ display:"flex", alignItems:"center", gap:5 }}>
                  ○ {lang === "en" ? "Light" : "Clair"}
                </button>
              </div>
            </div>

            <div className="info-box" style={{ marginTop: 14 }}>
              {lang === "en"
                ? "⚡ Settings are instant and saved permanently on this device."
                : "⚡ Les réglages sont instantanés et sauvegardés sur cet appareil."}
            </div>

            {/* PWA Install Tutorial */}
            <div style={{ marginTop: 28 }}>
              <div className="section-label" style={{ marginBottom: 10 }}>
                {lang === "en" ? "Install the app" : "Installer l'application"}
              </div>
              <div style={{ background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:14, overflow:"hidden" }}>
                {[
                  {
                    os: "iPhone / iPad",
                    icon: "📱",
                    steps: lang === "en"
                      ? ["Open gainz.vercel.app in Safari (not Chrome)", "Tap the Share button at the bottom (square with arrow ↑)", "Scroll down → tap \"Add to Home Screen\"", "Tap \"Add\" — the app icon appears on your home screen ✓"]
                      : ["Ouvre gainz.vercel.app dans Safari (pas Chrome)", "Appuie sur le bouton Partager en bas (carré avec flèche ↑)", "Descends → appuie sur \"Sur l'écran d'accueil\"", "Appuie sur \"Ajouter\" — l'icône apparaît sur ton écran ✓"],
                  },
                  {
                    os: "Android",
                    icon: "🤖",
                    steps: lang === "en"
                      ? ["Open gainz.vercel.app in Chrome", "Tap the 3 dots menu (top right)", "Tap \"Add to Home screen\" or \"Install app\"", "Confirm — GAINZ appears like a native app ✓"]
                      : ["Ouvre gainz.vercel.app dans Chrome", "Appuie sur les 3 points (en haut à droite)", "Appuie sur \"Ajouter à l'écran d'accueil\" ou \"Installer\"", "Confirme — GAINZ apparaît comme une vraie appli ✓"],
                  },
                ].map((item, i) => (
                    <div key={i} style={{ borderBottom: i === 0 ? "1px solid var(--border)" : "none" }}>
                      <div
                        onClick={() => setInstallOpen(s => ({ ...s, [i]: !s[i] }))}
                        style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 14px", cursor:"pointer", userSelect:"none" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                          <span style={{ fontSize:18 }}>{item.icon}</span>
                          <span style={{ fontFamily:"Outfit", fontSize:13, fontWeight:600, color:"var(--text)" }}>{item.os}</span>
                        </div>
                        <span style={{ fontSize:12, color:"var(--text3)", display:"inline-block", transform: installOpen[i] ? "rotate(180deg)" : "none", transition:"0.2s" }}>▾</span>
                      </div>
                      {installOpen[i] && (
                        <div style={{ padding:"0 14px 14px", display:"flex", flexDirection:"column", gap:7 }}>
                          {item.steps.map((step, j) => (
                            <div key={j} style={{ display:"flex", gap:9, alignItems:"flex-start" }}>
                              <div style={{ width:20, height:20, background:"var(--gold-dim)", border:"1px solid rgba(201,168,76,0.25)", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:"var(--gold)", flexShrink:0, fontFamily:"Outfit" }}>{j+1}</div>
                              <div style={{ fontSize:12, color:"var(--text2)", lineHeight:1.5, paddingTop:2 }}>{step}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
              <div style={{ marginTop:10, fontSize:11, color:"var(--text3)", textAlign:"center" }}>
                {lang === "en" ? "100% offline after install · No App Store required" : "100% hors-ligne après install · Sans App Store"}
              </div>
            </div>
          </div>
        ) : (
          <div className="fade-up">
            <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 8 }}>
              <div className="profile-avatar" style={{ cursor: "default" }}>{profile?.avatar || "🏋️"}</div>
              <div>
                <div className="profile-name">{profile?.name || (lang === "en" ? "Athlete" : "Athlète")}</div>
                <div className="profile-subtitle">{bgObj?.tag && <span style={{ color: "var(--gold)", fontWeight: 700, marginRight: 6 }}>{bgObj.tag}</span>}{bgObj?.name}</div>
              </div>
            </div>

            <div className="stat-grid">
              <div className="stat-card"><div className="stat-val">{profile?.weight || "—"}<span>kg</span></div><div className="stat-lbl">{t("weightLabel")?.replace(" (kg)","")}</div></div>
              <div className="stat-card"><div className="stat-val">{profile?.height || "—"}<span>cm</span></div><div className="stat-lbl">{t("heightLabel")?.replace(" (cm)","")}</div></div>
              <div className="stat-card"><div className="stat-val">{profile?.age || "—"}<span>{lang === "en" ? "y" : "ans"}</span></div><div className="stat-lbl">{t("ageLabel")}</div></div>
              <div className="stat-card"><div className="stat-val">{history.length}</div><div className="stat-lbl">{t("totalSessions")}</div></div>
            </div>

            <div className="streak-card">
              <span className="streak-icon">{streak > 2 ? "🔥" : "💪"}</span>
              <div className="streak-info">
                <div className="streak-num">{streak}</div>
                <div className="streak-label">{streak > 1 ? lang === "en" ? `${streak} day streak` : `${streak} jours de suite` : t("streak")}</div>
              </div>
            </div>

            {history.length > 0 && (
              <>
                <div className="section-label">{t("recentHistory")}</div>
                {history.slice(0, 7).map(h => (
                  <div key={h.id} className="history-item">
                    <span className="history-icon">✓</span>
                    <div className="history-info">
                      <div className="history-name">{h.dayName}</div>
                      <div className="history-meta">{h.programName}</div>
                    </div>
                    <div className="history-badge">{h.date}</div>
                  </div>
                ))}
              </>
            )}

            {!history.length && (
              <div className="card" style={{ textAlign: "center", marginTop: 14 }}>
                <div style={{ fontSize: 30, marginBottom: 7 }}>🏁</div>
                <div className="card-title">{t("noHistory")}</div>
                <div className="card-sub" style={{ marginTop: 3 }}>{t("noHistorySub")}</div>
              </div>
            )}
            <div style={{ height: 8 }} />
          </div>
        )}
      </div>
    </>
  );
}

// ── ONBOARDING VIEW ───────────────────────────────────────────────────────────
function OnboardingView({ onDone }) {
  const [selected, setSelected] = useState(null);
  const [animOut, setAnimOut] = useState(false);

  const choose = (lng) => {
    setSelected(lng);
    setAnimOut(true);
    setTimeout(() => onDone(lng), 380);
  };

  return (
    <div style={{
      position:"fixed",inset:0,background:"var(--bg)",
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      padding:"28px 24px",gap:0,
      animation: animOut ? "fadeOut 0.35s ease forwards" : "fadeIn 0.4s ease",
    }}>
      <style>{`@keyframes fadeOut{to{opacity:0;transform:scale(0.97)}}`}</style>

      {/* Logo */}
      <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:44 }}>
        <div className="logo-icon" style={{ width:42,height:42,borderRadius:12,fontSize:20 }}>G</div>
        <span style={{ fontFamily:"Outfit",fontSize:28,fontWeight:800,letterSpacing:0.8 }}>GAINZ</span>
      </div>

      <div style={{ fontSize:13,fontWeight:600,letterSpacing:1.5,textTransform:"uppercase",color:"var(--text3)",marginBottom:18,fontFamily:"Outfit" }}>
        Language / Langue
      </div>

      <div style={{ display:"flex",flexDirection:"column",gap:10,width:"100%",maxWidth:340 }}>
        {[
          { id:"fr", label:"Français", sub:"Continuer en français" },
          { id:"en", label:"English",  sub:"Continue in English" },
        ].map(lng => (
          <button key={lng.id}
            onClick={() => choose(lng.id)}
            style={{
              background: selected === lng.id ? "var(--gold-dim)" : "var(--surface)",
              border: `1px solid ${selected === lng.id ? "var(--gold)" : "var(--border)"}`,
              borderRadius:16,padding:"16px 20px",cursor:"pointer",
              display:"flex",alignItems:"center",justifyContent:"space-between",
              transition:"all 0.15s",WebkitTapHighlightColor:"transparent",
            }}>
            <div style={{ textAlign:"left" }}>
              <div style={{ fontFamily:"Outfit",fontSize:17,fontWeight:700,color: selected === lng.id ? "var(--gold)" : "var(--text)" }}>{lng.label}</div>
              <div style={{ fontSize:12,color:"var(--text3)",marginTop:2 }}>{lng.sub}</div>
            </div>
            {selected === lng.id && <span style={{ color:"var(--gold)",fontSize:18 }}>✓</span>}
          </button>
        ))}
      </div>

      <div style={{ marginTop:36,fontSize:12,color:"var(--text3)",textAlign:"center",lineHeight:1.6 }}>
        100% offline · No account required<br/>Aucun compte requis · Hors-ligne
      </div>
    </div>
  );
}

// ── PREMIUM MODAL ─────────────────────────────────────────────────────────────
function PremiumModal({ lang, onClose, onUnlock, isPremium }) {
  const isFr = lang !== "en";
  const perks = isFr
    ? [
        { icon:"∞", label:"Programmes illimités",     sub:"Sauvegarde autant de programmes que tu veux" },
        { icon:"◎", label:"Calculateur de nutrition",  sub:"Macros, calories, plan alimentaire personnalisé" },
        { icon:"✦", label:"Exercices avancés",         sub:"Bayesian curl, Nordic curl, Dragon flag..." },
        { icon:"◉", label:"Historique complet",        sub:"Analyse de progression sur 12 mois" },
      ]
    : [
        { icon:"∞", label:"Unlimited programs",        sub:"Save as many programs as you want" },
        { icon:"◎", label:"Nutrition calculator",       sub:"Macros, calories, personalized meal plan" },
        { icon:"✦", label:"Advanced exercises",         sub:"Bayesian curl, Nordic curl, Dragon flag..." },
        { icon:"◉", label:"Full history",               sub:"Progress analysis over 12 months" },
      ];

  if (isPremium) return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:1000,animation:"fadeIn 0.2s" }}>
      <div style={{ background:"var(--surface)",borderRadius:"24px 24px 0 0",padding:"28px 24px 36px",width:"100%",maxWidth:430,textAlign:"center" }}>
        <div style={{ fontSize:40,marginBottom:12 }}>⚡</div>
        <div style={{ fontFamily:"Outfit",fontSize:20,fontWeight:800,color:"var(--gold)",marginBottom:6 }}>GAINZ Premium</div>
        <div style={{ fontSize:13,color:"var(--green)",marginBottom:20,fontWeight:600 }}>{isFr ? "✓ Actif — Toutes les fonctionnalités débloquées" : "✓ Active — All features unlocked"}</div>
        <button className="btn-primary" onClick={onClose}>{isFr ? "Fermer" : "Close"}</button>
      </div>
    </div>
  );

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:1000,animation:"fadeIn 0.2s" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:"var(--surface)",borderRadius:"24px 24px 0 0",padding:"24px 22px 36px",width:"100%",maxWidth:430 }}>
        <div style={{ width:36,height:4,background:"var(--border2)",borderRadius:2,margin:"0 auto 22px" }} />

        <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:6 }}>
          <div className="logo-icon" style={{ width:34,height:34,borderRadius:9,fontSize:16 }}>G</div>
          <div>
            <div style={{ fontFamily:"Outfit",fontSize:17,fontWeight:800,color:"var(--gold)" }}>GAINZ Premium</div>
            <div style={{ fontSize:11,color:"var(--text3)" }}>{isFr ? "Débloque tout. Pour toujours." : "Unlock everything. Forever."}</div>
          </div>
        </div>

        <div style={{ background:"rgba(201,168,76,0.05)",border:"1px solid rgba(201,168,76,0.1)",borderRadius:14,padding:"14px 14px",margin:"16px 0",display:"flex",flexDirection:"column",gap:11 }}>
          {perks.map((p,i) => (
            <div key={i} style={{ display:"flex",alignItems:"flex-start",gap:11 }}>
              <div style={{ width:30,height:30,background:"var(--gold-dim)",border:"1px solid rgba(201,168,76,0.2)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"var(--gold)",flexShrink:0,fontFamily:"Outfit",fontWeight:700 }}>{p.icon}</div>
              <div>
                <div style={{ fontSize:13,fontWeight:600,color:"var(--text)" }}>{p.label}</div>
                <div style={{ fontSize:11,color:"var(--text3)",marginTop:1 }}>{p.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display:"flex",gap:8,marginBottom:12 }}>
          <div style={{ flex:1,background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:12,padding:"12px 10px",textAlign:"center" }}>
            <div style={{ fontFamily:"Outfit",fontSize:18,fontWeight:800,color:"var(--text)" }}>4,99€</div>
            <div style={{ fontSize:10,color:"var(--text3)",marginTop:2,textTransform:"uppercase",letterSpacing:0.5,fontFamily:"Outfit" }}>{isFr ? "par mois" : "per month"}</div>
          </div>
          <div style={{ flex:1,background:"var(--gold-dim)",border:"1px solid var(--gold)",borderRadius:12,padding:"12px 10px",textAlign:"center",position:"relative" }}>
            <div style={{ position:"absolute",top:-8,left:"50%",transform:"translateX(-50%)",background:"var(--gold)",color:"#0C0C0E",fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:6,fontFamily:"Outfit",letterSpacing:0.5,whiteSpace:"nowrap" }}>
              {isFr ? "ÉCONOMISE 33%" : "SAVE 33%"}
            </div>
            <div style={{ fontFamily:"Outfit",fontSize:18,fontWeight:800,color:"var(--gold)" }}>39,99€</div>
            <div style={{ fontSize:10,color:"var(--gold2)",marginTop:2,textTransform:"uppercase",letterSpacing:0.5,fontFamily:"Outfit" }}>{isFr ? "par an" : "per year"}</div>
          </div>
        </div>

        <button className="btn-primary" onClick={onUnlock} style={{ marginBottom:9 }}>
          {isFr ? "Débloquer Premium ✦" : "Unlock Premium ✦"}
        </button>
        <div style={{ textAlign:"center",fontSize:11,color:"var(--text3)" }}>
          {isFr ? "Paiement sécurisé · Annulable à tout moment" : "Secure payment · Cancel anytime"}
        </div>
      </div>
    </div>
  );
}

// ── PREMIUM GATE VIEW (replaces locked tab content) ───────────────────────────
function PremiumGateView({ lang, featureName, onUnlock }) {
  const isFr = lang !== "en";
  return (
    <>
      <div className="app-header">
        <div className="logo-mark"><div className="logo-icon">G</div><span className="logo-text">GAINZ</span></div>
        <div className="header-badge" style={{ color:"var(--gold)" }}>PREMIUM</div>
      </div>
      <div className="page-content fade-up" style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"60vh",textAlign:"center",gap:14 }}>
        <div style={{ width:56,height:56,background:"var(--gold-dim)",border:"1px solid var(--gold)",borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,color:"var(--gold)",fontFamily:"Outfit",fontWeight:800 }}>✦</div>
        <div>
          <div style={{ fontFamily:"Outfit",fontSize:20,fontWeight:800,color:"var(--text)",marginBottom:5 }}>{featureName}</div>
          <div style={{ fontSize:13,color:"var(--text3)",lineHeight:1.6,maxWidth:260,margin:"0 auto" }}>
            {isFr ? "Cette fonctionnalité est réservée aux membres Premium. Débloque l'accès complet pour 4,99€/mois." : "This feature is for Premium members. Unlock full access for €4.99/month."}
          </div>
        </div>
        <button className="btn-primary" style={{ width:"100%",maxWidth:280 }} onClick={onUnlock}>
          {isFr ? "Débloquer Premium ✦" : "Unlock Premium ✦"}
        </button>
        <div style={{ fontSize:11,color:"var(--text3)" }}>
          {isFr ? "Essaie 7 jours gratuitement" : "Try 7 days for free"}
        </div>
      </div>
    </>
  );
}

// ── SHARE MODAL ───────────────────────────────────────────────────────────────
function ShareModal({ lang, onClose }) {
  const isFr = lang !== "en";
  const shareUrl = window.location.href;
  const shareText = isFr
    ? "🔥 Je crée mes programmes de muscu avec GAINZ — 100% hors-ligne, gratuit. Essaie !"
    : "🔥 I build my workout programs with GAINZ — 100% offline, free. Check it out!";

  const doShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "GAINZ", text: shareText, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        alert(isFr ? "Lien copié !" : "Link copied!");
      }
    } catch {}
    onClose();
  };

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:1000,animation:"fadeIn 0.2s" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:"var(--surface)",borderRadius:"24px 24px 0 0",padding:"22px 22px 36px",width:"100%",maxWidth:430 }}>
        <div style={{ width:36,height:4,background:"var(--border2)",borderRadius:2,margin:"0 auto 20px" }} />

        <div style={{ textAlign:"center",marginBottom:18 }}>
          <div style={{ fontSize:32,marginBottom:8 }}>👥</div>
          <div style={{ fontFamily:"Outfit",fontSize:18,fontWeight:800,color:"var(--text)",marginBottom:4 }}>
            {isFr ? "Partage avec tes amis" : "Share with your friends"}
          </div>
          <div style={{ fontSize:13,color:"var(--text3)",lineHeight:1.55,maxWidth:280,margin:"0 auto" }}>
            {isFr
              ? "Tu aimes GAINZ ? Partage-le — c'est la meilleure façon d'aider le projet à grandir 🙏"
              : "Loving GAINZ? Share it — it's the best way to help the project grow 🙏"}
          </div>
        </div>

        <div style={{ background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:12,padding:"12px 14px",marginBottom:14,fontSize:12,color:"var(--text2)",fontStyle:"italic",lineHeight:1.5,textAlign:"center" }}>
          "{shareText}"
        </div>

        <button className="btn-primary" onClick={doShare} style={{ marginBottom:8 }}>
          {isFr ? "Partager maintenant ↗" : "Share now ↗"}
        </button>
        <button className="btn-ghost" onClick={onClose}>
          {isFr ? "Plus tard" : "Later"}
        </button>
      </div>
    </div>
  );
}