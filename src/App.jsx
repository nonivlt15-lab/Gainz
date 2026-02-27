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
  .muscle-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px}

  .muscle-card{
    background:var(--surface);border:1px solid var(--border);border-radius:var(--r);
    padding:12px 14px;cursor:pointer;transition:all 0.15s;
    position:relative;overflow:hidden;
    user-select:none;-webkit-tap-highlight-color:transparent;
  }

  .muscle-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--border);border-radius:0 2px 2px 0;transition:background 0.2s}
  .muscle-card.selected::before{background:var(--gold)}
  .muscle-card:active{transform:scale(0.96)}
  .muscle-card.selected{border-color:var(--gold);background:var(--gold-dim)}
  .muscle-label{font-size:13px;font-weight:500;color:var(--text2);padding-left:10px;display:block}
  .muscle-card.selected .muscle-label{color:var(--gold);font-weight:600}
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

  /* ANIMATIONS */
  @keyframes fadeUp{from{opacity:0;transform:translateY(9px)}to{opacity:1;transform:translateY(0)}}
  .fade-up{animation:fadeUp 0.28s ease both}
  @keyframes scaleIn{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}
  .scale-in{animation:scaleIn 0.22s ease both}
`;

// ─────────────────────────────────────────────────────────────────────────────
// MOTEUR DE GÉNÉRATION — HORS-LIGNE, SANS LIMITES
// ─────────────────────────────────────────────────────────────────────────────
const EXERCISE_DB = {
  chest: [
    { name: "Développé couché barre",     tip: "Descends lentement jusqu'à la poitrine, pousse en expirant fort.", equip: ["gym","barbell"] },
    { name: "Développé incliné haltères", tip: "Inclinaison 30-45°, coudes à 75° pour protéger les épaules.",    equip: ["gym","dumbbells"] },
    { name: "Écarté câble basse poulie",  tip: "Croise les mains en haut pour maximiser la contraction pectorale.", equip: ["gym","cables"] },
    { name: "Développé couché haltères",  tip: "Amplitude complète — descends jusqu'à l'étirement profond.",       equip: ["gym","dumbbells"] },
    { name: "Dips lestés",                tip: "Buste légèrement penché en avant pour cibler les pectoraux.",      equip: ["gym"] },
    { name: "Pec deck / Butterfly",       tip: "Maintiens 1 seconde contracté, relâche très lentement.",           equip: ["gym","machines"] },
    { name: "Pompes déclinées",           tip: "Pieds surélevés sur un banc — cible la partie haute des pecs.",   equip: ["any","bodyweight"] },
    { name: "Pompes",                     tip: "Corps parfaitement droit, poitrine au sol, dos neutre.",           equip: ["any","bodyweight"] },
    { name: "Développé décliné barre",    tip: "Angle négatif de 30°, axe sur la partie basse des pectoraux.",    equip: ["gym","barbell"] },
  ],
  back: [
    { name: "Tirage vertical prise large",   tip: "Étire bien en haut, contracte les omoplates en bas.",          equip: ["gym","cables"] },
    { name: "Rowing barre pronation",        tip: "Dos plat à 45°, tire vers le nombril, coudes collés.",         equip: ["gym","barbell"] },
    { name: "Rowing haltère unilatéral",     tip: "Appui banc, tire le coude vers le plafond, épaule immobile.",  equip: ["gym","dumbbells"] },
    { name: "Soulevé de terre roumain",      tip: "Dos neutre absolu, barre contre les jambes tout le trajet.",   equip: ["gym","barbell"] },
    { name: "Tirage poulie basse",           tip: "Tire vers le bas-ventre, serre les omoplates 1 seconde.",      equip: ["gym","cables"] },
    { name: "Pull-up / Traction",            tip: "Prise large, descends complètement, menton au-dessus.",        equip: ["gym","bodyweight"] },
    { name: "Rowing à la machine",           tip: "Appui poitrine, focus total sur les omoplates.",               equip: ["gym","machines"] },
    { name: "Tirage horizontal câble",       tip: "Coudes près du corps, contracte le dos 1 seconde.",            equip: ["gym","cables"] },
    { name: "Pull-over haltère",             tip: "Bras tendus, axe en grand dorsal — excellent stretch.",        equip: ["gym","dumbbells"] },
  ],
  shoulders: [
    { name: "Développé militaire barre",     tip: "Barre devant, pousse vertical, ne cambre pas le bas-dos.",    equip: ["gym","barbell"] },
    { name: "Élévations latérales haltères", tip: "Légèrement penché, coudes à 15°, monte à l'horizontal.",      equip: ["gym","dumbbells"] },
    { name: "Arnold Press",                  tip: "Rotation des paumes en montant — deltoïde antérieur++.",       equip: ["gym","dumbbells"] },
    { name: "Oiseau (élévations arrière)",   tip: "Buste à 90°, coudes légèrement fléchis, pince les omoplates.", equip: ["gym","dumbbells"] },
    { name: "Face pull câble",               tip: "Poulie haute, tire vers le visage en séparant les mains.",    equip: ["gym","cables"] },
    { name: "Développé haltères assis",      tip: "Coudes à 90°, pousse vers le haut sans verrouiller.",         equip: ["gym","dumbbells"] },
    { name: "Élévation frontale haltères",   tip: "Monte à hauteur des yeux, descends en 3 secondes.",           equip: ["gym","dumbbells"] },
  ],
  biceps: [
    { name: "Curl barre droite",             tip: "Coudes fixes — le mouvement vient du coude uniquement.",      equip: ["gym","barbell"] },
    { name: "Curl haltères alterné",         tip: "Supine le poignet en montant pour maximiser la contraction.", equip: ["gym","dumbbells"] },
    { name: "Curl marteau",                  tip: "Prise neutre — cible le brachial pour plus d'épaisseur.",     equip: ["gym","dumbbells"] },
    { name: "Curl concentré",                tip: "Coude contre la cuisse, amplitude complète, isolement parfait.", equip: ["gym","dumbbells"] },
    { name: "Curl câble basse poulie",       tip: "Tension constante tout le long — parfait en finisher.",       equip: ["gym","cables"] },
    { name: "Curl barre EZ",                 tip: "Prise en supination partielle — moins de stress poignets.",   equip: ["gym","barbell"] },
  ],
  triceps: [
    { name: "Pushdown câble prise haute",    tip: "Coudes fixes, étends complètement, descends lentement.",      equip: ["gym","cables"] },
    { name: "Extension triceps poulie haute",tip: "Bras derrière la tête, descends l'avant-bras, étends.",      equip: ["gym","cables"] },
    { name: "Dips (banc / barres parallèles)",tip: "Buste droit pour les triceps — penché = pectoraux.",         equip: ["gym","bodyweight"] },
    { name: "Skull crusher barre EZ",        tip: "Vers le front lentement, coudes fixes, extension explosive.", equip: ["gym","barbell"] },
    { name: "Extension haltère une main",    tip: "Bras vertical derrière la nuque, descends lentement.",        equip: ["gym","dumbbells"] },
    { name: "Kickback haltère",              tip: "Buste parallèle au sol, étends jusqu'à l'alignement.",        equip: ["gym","dumbbells"] },
  ],
  legs: [
    { name: "Squat barre",                   tip: "Pieds à largeur d'épaules, cuisses parallèles, dos neutre.", equip: ["gym","barbell"] },
    { name: "Presse à cuisse",               tip: "Pieds hauts = fessiers/ischio. Pieds bas = quadriceps.",     equip: ["gym","machines"] },
    { name: "Leg extension",                 tip: "Extension complète, 1 sec de contraction, descente lente.",  equip: ["gym","machines"] },
    { name: "Leg curl couché",               tip: "Hanche plaquée, ramène les talons vers les fessiers.",       equip: ["gym","machines"] },
    { name: "Fentes marchées haltères",      tip: "Grand pas, genou avant à 90°, genou arrière ne touche pas.", equip: ["gym","dumbbells"] },
    { name: "Romanian Deadlift (RDL)",       tip: "Charnière hanches, dos neutre, barre contre les jambes.",    equip: ["gym","barbell"] },
    { name: "Squat bulgare haltères",        tip: "Pied arrière surélevé, poussée sur le pied avant.",          equip: ["gym","dumbbells"] },
    { name: "Hack squat machine",            tip: "Pieds avant sur la plaque, amplitude profonde.",             equip: ["gym","machines"] },
    { name: "Squat poids du corps",          tip: "Bras tendus devant, descends lentement, dos neutre.",        equip: ["any","bodyweight"] },
  ],
  glutes: [
    { name: "Hip thrust barre",              tip: "Omoplate sur banc, poussée explosive, serres 2 secondes.",   equip: ["gym","barbell"] },
    { name: "Squat bulgare haltères",        tip: "Focus poussée pied avant — activation fessier maximale.",    equip: ["gym","dumbbells"] },
    { name: "Fentes inversées",              tip: "Recule un pied, genou à 90°, pousse sur le talon.",          equip: ["gym","dumbbells","bodyweight"] },
    { name: "Abducteur machine",             tip: "Amplitude complète, maintiens 1 sec en ouverture max.",      equip: ["gym","machines"] },
    { name: "Kickback câble",                tip: "Hanche stable, extension complète, contracte en haut.",      equip: ["gym","cables"] },
    { name: "Pont fessier",                  tip: "Poussée explosive, serre les fessiers 2 secondes.",          equip: ["any","bodyweight"] },
  ],
  abs: [
    { name: "Crunch à la poulie",            tip: "Arrondi du dos vers les genoux — pas juste incliner.",       equip: ["gym","cables"] },
    { name: "Relevé de jambes suspendu",     tip: "Jambes tendues, monte à la parallèle, descends en 4 sec.",  equip: ["gym","bodyweight"] },
    { name: "Planche frontale",              tip: "Corps aligné, serre le ventre fort, respire normalement.",   equip: ["any","bodyweight"] },
    { name: "Russian Twist lesté",           tip: "Pieds décollés, rotation complète, touche au sol chaque côté.", equip: ["gym","dumbbells"] },
    { name: "Crunch vélo",                   tip: "Coude vers genou opposé — rotation du buste réelle.",        equip: ["any","bodyweight"] },
    { name: "Ab wheel (molette)",            tip: "Déroule lentement, arrête avant de perdre le gainage.",      equip: ["gym"] },
    { name: "Crunch classique",              tip: "Sans tirer la nuque, soulève les épaules, contracte 1 sec.", equip: ["any","bodyweight"] },
  ],
  calves: [
    { name: "Mollets debout (machine)",      tip: "Amplitude maximale — descends en étirement complet.",        equip: ["gym","machines"] },
    { name: "Mollets assis (machine)",       tip: "Cible le soléaire — souvent négligé, très efficace.",        equip: ["gym","machines"] },
    { name: "Mollets à la presse",           tip: "Pieds en bas de la plaque, amplitude complète.",             equip: ["gym","machines"] },
    { name: "Mollets unilatéraux",           tip: "Une jambe à la fois sur une marche, amplitude complète.",    equip: ["any","bodyweight","dumbbells"] },
  ],
  traps: [
    { name: "Haussement d'épaules barre",    tip: "Monte vers les oreilles, tiens 1 sec, descends lentement.", equip: ["gym","barbell"] },
    { name: "Rowing menton",                 tip: "Prise serrée, tire vers le menton, coudes au-dessus.",      equip: ["gym","barbell","cables"] },
    { name: "Haussement haltères",           tip: "Mouvement pur épaule — pas de rotation du cou.",            equip: ["gym","dumbbells"] },
    { name: "Face pull câble",               tip: "Tire vers le visage en séparant — trapèze + deltoïde arrière.", equip: ["gym","cables"] },
  ],
  forearms: [
    { name: "Curl poignets barre",           tip: "Avant-bras sur cuisses, fléchis lentement, amplitude complète.", equip: ["gym","barbell"] },
    { name: "Reverse curl barre EZ",         tip: "Prise pronation, coudes fixes, monte à hauteur des épaules.", equip: ["gym","barbell"] },
    { name: "Farmer's carry haltères",       tip: "Marche avec des haltères lourds — renforce la préhension.",  equip: ["gym","dumbbells"] },
  ],
  fullbody: [
    { name: "Squat barre",            tip: "Mouvement roi. Dos neutre, cuisses parallèles.",             equip: ["gym","barbell"] },
    { name: "Développé couché barre", tip: "Descends lentement, pousse en expirant.",                   equip: ["gym","barbell"] },
    { name: "Soulevé de terre",       tip: "Dos neutre, poussée jambes, barre contre les tibias.",      equip: ["gym","barbell"] },
    { name: "Tirage vertical",        tip: "Prise large, contracte les omoplates en bas.",              equip: ["gym","cables"] },
    { name: "Développé militaire",    tip: "Barre devant, pousse vertical, abdos engagés.",             equip: ["gym","barbell"] },
    { name: "Curl barre",             tip: "Coudes fixes, supine en montant.",                          equip: ["gym","barbell"] },
    { name: "Planche frontale",       tip: "Corps aligné, respirations profondes.",                     equip: ["any","bodyweight"] },
    { name: "Hip thrust barre",       tip: "Poussée explosive, serre les fessiers en haut.",            equip: ["gym","barbell"] },
    { name: "Dips lestés",            tip: "Buste droit — isolation triceps.",                          equip: ["gym"] },
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
  chest: 3, back: 4, legs: 4, glutes: 3,
  shoulders: 3, abs: 3,
  biceps: 2, triceps: 2, calves: 2, traps: 2, forearms: 2,
  fullbody: 7,
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

function getAvailableExercises(muscleId, equipment) {
  const all = EXERCISE_DB[muscleId] || [];
  if (!equipment || equipment.length === 0) return all;
  return all.filter(ex => ex.equip.includes("any") || ex.equip.some(e => equipment.includes(e)));
}

function pickExercises(muscleId, count, equipment, usedNames = new Set()) {
  const available = getAvailableExercises(muscleId, equipment).filter(ex => !usedNames.has(ex.name));
  return [...available].sort(() => Math.random() - 0.5).slice(0, Math.min(count, available.length));
}

// SANDWICH TECHNIQUE pour hypertrophie :
// Muscle principal : 2 exercices → autres muscles → 1 finisher sur le muscle principal
// Inspiré du principe de pré-fatigue et de retour au muscle cible en fin de séance
function buildSandwichSession(primaryMuscle, secondaryMuscles, params, equipment, levelMult, goal) {
  const exercises = [];
  const usedNames = new Set();

  // 1. Muscle principal : 2 exercices de base
  const primaryCount = Math.max(2, Math.round(MUSCLE_EX_COUNT[primaryMuscle] * levelMult));
  const primaryExercises = pickExercises(primaryMuscle, primaryCount, equipment, usedNames);
  primaryExercises.forEach(ex => usedNames.add(ex.name));

  const mainSets = Math.max(2, Math.round(params.sets * levelMult));

  // Partie 1 : 2 exercices principaux
  primaryExercises.slice(0, 2).forEach(ex => {
    exercises.push({ ...ex, muscle: primaryMuscle.charAt(0).toUpperCase() + primaryMuscle.slice(1), sets: mainSets, reps: params.reps, rest: params.rest, restSec: params.restSec, tip: ex.tip });
  });

  // 2. Muscles secondaires au milieu
  secondaryMuscles.forEach(muscleId => {
    const count = Math.max(1, Math.round((MUSCLE_EX_COUNT[muscleId] || 2) * 0.8 * levelMult));
    const picked = pickExercises(muscleId, count, equipment, usedNames);
    picked.forEach(ex => usedNames.add(ex.name));
    picked.forEach(ex => exercises.push({
      ...ex,
      muscle: muscleId.charAt(0).toUpperCase() + muscleId.slice(1),
      sets: Math.max(2, Math.round(params.sets * levelMult * 0.9)),
      reps: params.reps,
      rest: params.rest,
      restSec: params.restSec,
      tip: ex.tip,
    }));
  });

  // 3. Finisher sur le muscle principal (dernier exercice — isolation / haute répétition)
  if (primaryExercises.length > 2) {
    const finisher = primaryExercises[2];
    exercises.push({
      ...finisher,
      muscle: primaryMuscle.charAt(0).toUpperCase() + primaryMuscle.slice(1),
      sets: Math.max(2, Math.round(params.sets * levelMult) - 1),
      reps: goal === "hypertrophy" ? "12-15" : params.reps,
      rest: goal === "hypertrophy" ? "60 sec" : params.rest,
      restSec: goal === "hypertrophy" ? 60 : params.restSec,
      tip: finisher.tip,
      isFinisher: true,
    });
  }

  return exercises.slice(0, 8);
}

function generateProgram(form) {
  const { muscles, goal, level, equipment, daysPerWeek } = form;
  const params = GOAL_PARAMS[goal] || GOAL_PARAMS.hypertrophy;
  const exMult = { strength: 0.7, hypertrophy: 1.0, endurance: 1.1, weight_loss: 1.1, toning: 1.0 }[goal] || 1.0;
  const levelMult = level === "beginner" ? 0.75 : level === "advanced" ? 1.15 : 1.0;
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
      // Sandwich : muscle principal (le plus grand) + secondaires
      const sorted = [...synGroup.activeMuscles].sort((a, b) =>
        (MUSCLE_EX_COUNT[b] || 2) - (MUSCLE_EX_COUNT[a] || 2)
      );
      const primary = sorted[0];
      const secondaries = sorted.slice(1);
      exercises = buildSandwichSession(primary, secondaries, params, equipment, levelMult, goal);
    } else {
      // Standard : séquence classique
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
      exercises = exercises.slice(0, 7);
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
  bulk:         +350,   // Surplus modéré — lean bulk
  cut:          -400,   // Déficit — perte de graisse
  recomp:         0,    // Maintien — recomposition (cycle)
  summer:       -350,   // Déficit doux — sèche
  maintain:       0,    // Maintien
  powerlifting: +200,   // Léger surplus pour la force
};

const BODY_GOAL_PROTEIN_FACTOR = {
  bulk: 2.0, cut: 2.4, recomp: 2.2, summer: 2.4, maintain: 1.8, powerlifting: 2.2,
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
  const isCut = bodyGoal === "cut" || bodyGoal === "summer";

  if (lang === "en") {
    return [
      { icon: "☀️", title: "Breakfast", kcal: Math.round(kcal * 0.25),
        items: isGain
          ? ["Oatmeal (80g) + whole milk","3 whole eggs scrambled","Banana + peanut butter (20g)"]
          : isCut
          ? ["3 scrambled eggs","1 slice whole wheat bread","Greek yogurt 0% (150g)"]
          : ["Oatmeal (60g) + semi-skim milk","2 eggs + 2 whites","Mixed berries"] },
      { icon: "🍽", title: "Lunch", kcal: Math.round(kcal * 0.35),
        items: isGain
          ? ["White rice cooked (200g)","Chicken or steak (200g)","Avocado + steamed vegetables","Olive oil (1 tbsp)"]
          : isCut
          ? ["Basmati rice cooked (150g)","Chicken breast (200g)","Green vegetables (unlimited)"]
          : ["Quinoa cooked (150g)","Salmon or chicken (150g)","Roasted veggies + olive oil"] },
      { icon: "🏋️", title: "Pre/Post Workout", kcal: Math.round(kcal * 0.15),
        items: isGain
          ? ["Protein shake (30g) + milk","Oats (40g) or rice cakes","Banana"]
          : isCut
          ? ["Greek yogurt 0% (200g) + berries","Protein shake if needed"]
          : ["Protein shake (25g)","Apple + almonds (20g)"] },
      { icon: "🌙", title: "Dinner", kcal: Math.round(kcal * 0.25),
        items: isGain
          ? ["Sweet potato (200g) or pasta","Beef 5% fat (200g) or tuna","Sautéed vegetables in olive oil"]
          : isCut
          ? ["Zucchini / green beans in abundance","White fish (200g) or tofu","Green salad"]
          : ["Sweet potato (150g)","2 whole eggs + 2 whites","Steamed vegetables"] },
    ];
  }

  return [
    { icon: "☀️", title: "Petit-déjeuner", kcal: Math.round(kcal * 0.25),
      items: isGain
        ? ["Flocons d'avoine (80g) + lait entier","3 œufs entiers brouillés","Banane + beurre de cacahuète (20g)"]
        : isCut
        ? ["3 œufs brouillés","1 tranche pain complet","Yaourt grec 0% (150g)"]
        : ["Flocons d'avoine (60g) + lait demi-écrémé","2 œufs + 2 blancs","Fruits rouges"] },
    { icon: "🍽", title: "Déjeuner", kcal: Math.round(kcal * 0.35),
      items: isGain
        ? ["Riz blanc cuit (200g)","Poulet ou steak (200g)","Avocat + légumes vapeur","Huile d'olive (1cs)"]
        : isCut
        ? ["Riz basmati cuit (150g)","Blanc de poulet (200g)","Légumes verts à volonté"]
        : ["Quinoa cuit (150g)","Saumon ou poulet (150g)","Légumes rôtis + huile d'olive"] },
    { icon: "🏋️", title: "Collation pré/post workout", kcal: Math.round(kcal * 0.15),
      items: isGain
        ? ["Shake protéiné (30g) + lait","Flocons (40g) ou riz cakes","Banane"]
        : isCut
        ? ["Yaourt grec 0% (200g) + fruits rouges","Shake protéiné si besoin"]
        : ["Shake protéiné (25g)","Pomme + amandes (20g)"] },
    { icon: "🌙", title: "Dîner", kcal: Math.round(kcal * 0.25),
      items: isGain
        ? ["Patate douce (200g) ou pâtes","Bœuf haché 5% (200g) ou thon","Légumes sautés huile d'olive"]
        : isCut
        ? ["Courgettes / haricots verts à volonté","Poisson blanc (200g) ou tofu","Salade verte"]
        : ["Patate douce (150g)","2 œufs entiers + 2 blancs","Légumes vapeur"] },
  ];
}

// ── DATA UI ───────────────────────────────────────────────────────────────────
const MUSCLES_UI = [
  { id: "chest",     label: "Pectoraux",  labelEn: "Chest",       icon: "🫁" },
  { id: "back",      label: "Dos",        labelEn: "Back",        icon: "🔙" },
  { id: "shoulders", label: "Épaules",    labelEn: "Shoulders",   icon: "🔺" },
  { id: "biceps",    label: "Biceps",     labelEn: "Biceps",      icon: "💪" },
  { id: "triceps",   label: "Triceps",    labelEn: "Triceps",     icon: "🦾" },
  { id: "legs",      label: "Jambes",     labelEn: "Legs",        icon: "🦵" },
  { id: "glutes",    label: "Fessiers",   labelEn: "Glutes",      icon: "🍑" },
  { id: "abs",       label: "Abdominaux", labelEn: "Abs",         icon: "⚡" },
  { id: "calves",    label: "Mollets",    labelEn: "Calves",      icon: "🦶" },
  { id: "traps",     label: "Trapèzes",   labelEn: "Traps",       icon: "🏔" },
  { id: "forearms",  label: "Avant-bras", labelEn: "Forearms",    icon: "🤜" },
  { id: "fullbody",  label: "Full Body",  labelEn: "Full Body",   icon: "🔥" },
];

// Objectifs entraînement
const GOALS_TRAINING = [
  { id: "strength",    label: "Force & Powerlifting", labelEn: "Strength & Powerlifting", desc: "Charges maximales — choix de méthode structurée",    descEn: "Max loads — choose a structured strength method", scheme: "1–6 reps" },
  { id: "hypertrophy", label: "Hypertrophie",          labelEn: "Hypertrophy",              desc: "Prise de masse musculaire",         descEn: "Muscle size & volume",           scheme: "8–12 reps" },
  { id: "endurance",   label: "Endurance musc.",       labelEn: "Muscular Endurance",       desc: "Résistance & capacité cardio",      descEn: "Resistance & cardio capacity",   scheme: "15–20 reps" },
  { id: "weight_loss", label: "Perte de poids",        labelEn: "Fat Loss",                 desc: "Brûle-graisses & circuits",         descEn: "Fat burn & circuits",            scheme: "12–15 reps" },
  { id: "toning",      label: "Tonification",          labelEn: "Toning",                   desc: "Définition & maintien musculaire",  descEn: "Definition & muscle maintenance",scheme: "10–15 reps" },
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
  { id: "gym",        label: "Salle complète",    labelEn: "Full gym" },
  { id: "barbell",    label: "Barre olympique",   labelEn: "Olympic barbell" },
  { id: "dumbbells",  label: "Haltères",          labelEn: "Dumbbells" },
  { id: "cables",     label: "Câbles / Poulies",  labelEn: "Cables / Pulleys" },
  { id: "machines",   label: "Machines guidées",  labelEn: "Guided machines" },
  { id: "bodyweight", label: "Poids du corps",    labelEn: "Bodyweight" },
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
async function loadLang() { try { const r = await window.storage.get("gainz:lang"); return r?.value || "fr"; } catch { return "fr"; } }
async function saveLang(l) { try { await window.storage.set("gainz:lang", l); } catch {} }

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("create");
  const [savedPrograms, setSavedPrograms] = useState([]);
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [dailyView, setDailyView] = useState(null);
  const [lang, setLang] = useState("fr");

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
  }, []);

  const switchLang = async (l) => { setLang(l); await saveLang(l); };

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
          <DailyView program={dailyView} onBack={() => setDailyView(null)} onWorkoutDone={handleWorkoutDone} />
        </div>
      </LangContext.Provider>
    );
  }

  const navItems = [
    { id: "create",    icon: "✦", label: t("navCreate") },
    { id: "programs",  icon: "▤",  label: t("navPrograms") },
    { id: "nutrition", icon: "◎", label: t("navNutrition") },
    { id: "profile",   icon: "◉", label: t("navProfile") },
  ];

  return (
    <LangContext.Provider value={lang}>
      <div className="app">
        {tab === "create"    && <CreateView onSave={handleSave} profile={profile} lang={lang} />}
        {tab === "programs"  && <ProgramsView programs={savedPrograms} onOpen={setDailyView} onDelete={handleDelete} lang={lang} />}
        {tab === "nutrition" && <NutritionView profile={profile} onGoToProfile={() => setTab("profile")} lang={lang} />}
        {tab === "profile"   && <ProfileView profile={profile} history={history} onSave={handleProfileSave} lang={lang} onLangChange={switchLang} currentLang={lang} />}

        <div className="bottom-nav">
          {navItems.map(t2 => (
            <button key={t2.id} className={`nav-tab ${tab === t2.id ? "active" : ""}`} onClick={() => setTab(t2.id)}>
              <span className="nav-tab-icon">{t2.icon}</span>
              <span className="nav-tab-label">{t2.label}</span>
            </button>
          ))}
        </div>
      </div>
    </LangContext.Provider>
  );
}

// ── CREATE VIEW ───────────────────────────────────────────────────────────────
function CreateView({ onSave, profile, lang }) {
  const t = (key) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.fr[key] ?? key;
  const [step, setStep] = useState(1);
  const defaultGoal = profile?.bodyGoal ? (BODY_GOAL_TO_TRAINING[profile.bodyGoal] || "") : "";
  const [form, setForm] = useState({ muscles: [], goal: defaultGoal, method: "", level: "intermediate", equipment: [], daysPerWeek: 4, notes: "" });
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

  const reset = () => { setStep(1); setProgram(null); setForm({ muscles: [], goal: defaultGoal, level: "intermediate", equipment: [], daysPerWeek: 4, notes: "" }); };
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
            <div className="page-title">{t("step1Title")}</div>
            <div className="page-sub">{t("step1Sub")}</div>
            <div className="muscle-grid">
              {MUSCLES_UI.map(m => (
                <div key={m.id} className={`muscle-card ${form.muscles.includes(m.id) ? "selected" : ""}`} onClick={() => toggle("muscles", m.id)}>
                  <span className="muscle-label">{getMuscleLabel(m)}</span>
                </div>
              ))}
            </div>
            {form.muscles.length > 0 && <div className="muscles-hint"><span>{form.muscles.length}</span> {lang === "en" ? `group${form.muscles.length > 1 ? "s" : ""} selected` : `groupe${form.muscles.length > 1 ? "s" : ""} sélectionné${form.muscles.length > 1 ? "s" : ""}`}</div>}
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
                onClick={() => setForm(f => ({ ...f, level: l.id }))}>{getLevelLabel(l)}</div>)}
            </div>
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
                <div className="section-label" style={{ marginTop: 22 }}>{t("equipment")}</div>
                <div className="chip-group">
                  {EQUIPMENT_UI.map(e => <div key={e.id} className={`chip ${form.equipment.includes(e.id) ? "selected" : ""}`} onClick={() => toggle("equipment", e.id)}>{getEquipLabel(e)}</div>)}
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
function ProgramsView({ programs, onOpen, onDelete, lang }) {
  const t = (key) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.fr[key] ?? key;
  return (
    <>
      <div className="app-header">
        <div className="logo-mark"><div className="logo-icon">G</div><span className="logo-text">GAINZ</span></div>
        <div className="header-badge">{programs.length}</div>
      </div>
      <div className="page-content">
        {programs.length === 0 ? (
          <div className="empty-state fade-up">
            <div className="empty-icon">▤</div>
            <div className="empty-title">{t("programsEmpty")}</div>
            <div className="empty-sub">{t("programsEmptySub")}</div>
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
function DailyView({ program, onBack, onWorkoutDone }) {
  const lang = useContext(LangContext);
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

  return (
    <>
      <div className="app-header">
        <div className="logo-mark"><div className="logo-icon">G</div><span className="logo-text">GAINZ</span></div>
        <div className="header-badge">{t("nutritionTitle")}</div>
      </div>
      <div className="page-content fade-up">
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

        <div className="macro-cards">
          {[
            { label: t("macroProteins"), val: protein, color: "#60A5FA" },
            { label: t("macroCarbs"), val: carbs, color: "#C9A84C" },
            { label: t("macroFats"), val: fat, color: "#A78BFA" },
          ].map(m => (
            <div key={m.label} className="macro-card">
              <div className="macro-card-val" style={{ color: m.color }}>{m.val}<span>g</span></div>
              <div className="macro-card-label">{m.label}</div>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginBottom: 13 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>💧</span>
            <div>
              <div className="card-title">{water}{t("waterDay")}</div>
              <div className="card-sub">{t("waterSub")}</div>
            </div>
          </div>
        </div>

        <div className="section-label">{t("mealPlan")}</div>
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
function ProfileView({ profile, history, onSave, lang, onLangChange, currentLang }) {
  const t = (key) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.fr[key] ?? key;
  const [editing, setEditing] = useState(!profile);
  const [activeSection, setActiveSection] = useState("profile"); // "profile" | "settings"
  const [form, setForm] = useState(profile || { name: "", age: "", weight: "", height: "", sex: "m", activity: "moderate", bodyGoal: "bulk", avatar: "🏋️" });
  const [avatarPicker, setAvatarPicker] = useState(false);

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
            <div className="settings-item">
              <div>
                <div className="settings-item-label">{t("languageLabel")}</div>
              </div>
              <div className="lang-toggle">
                <button className={`lang-btn ${currentLang === "fr" ? "active" : ""}`} onClick={() => onLangChange("fr")}>FR</button>
                <button className={`lang-btn ${currentLang === "en" ? "active" : ""}`} onClick={() => onLangChange("en")}>EN</button>
              </div>
            </div>
            <div className="info-box" style={{ marginTop: 16 }}>
              {lang === "en"
                ? "⚡ Language change is instant and saved permanently on this device."
                : "⚡ Le changement de langue est instantané et sauvegardé sur cet appareil."}
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