/**
 * UI Rendering Module
 * Builds and inserts DOM layouts for all application views with an aviation cockpit HUD theme
 */

import { progress } from './progress.js';

// Premium Aviation SVG Graphic Generator
const getSubjectGraphic = (category) => {
  const normCat = (category || '').toUpperCase();
  
  if (normCat.includes('METEOROLOGY') || normCat.includes('MET')) {
    // Meteorology Weather Cloud, Sun and Lightning
    return `
      <svg viewBox="0 0 100 100" style="width: 100%; height: 100%;">
        <defs>
          <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="var(--accent-light)" stop-opacity="0.8" />
            <stop offset="100%" stop-color="var(--accent)" stop-opacity="0.2" />
          </linearGradient>
          <filter id="hudGlowMet" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <!-- Concentric range ring -->
        <circle cx="50" cy="50" r="45" fill="none" stroke="var(--accent)" stroke-width="1.2" opacity="0.2" />
        
        <!-- Stylized Sun outline behind cloud -->
        <circle cx="65" cy="35" r="12" fill="none" stroke="var(--hud-amber)" stroke-width="1.5" opacity="0.6" stroke-dasharray="2,2" class="met-sun" />
        
        <!-- Cloud body -->
        <path d="M 28 62 A 12 12 0 0 1 32 38 A 15 15 0 0 1 65 35 A 12 12 0 0 1 76 50 A 10 10 0 0 1 70 62 Z" fill="url(#cloudGrad)" stroke="var(--accent)" stroke-width="1.5" filter="url(#hudGlowMet)" class="met-cloud" />
        
        <!-- Lightning Bolt -->
        <path d="M 48 48 L 38 65 L 46 65 L 40 82 L 56 60 L 48 60 Z" fill="var(--hud-amber)" opacity="0.9" filter="url(#hudGlowMet)" class="met-lightning" />
        
        <!-- Raindrops -->
        <g stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round" class="met-rain">
          <line x1="28" y1="70" x2="25" y2="76" opacity="0.6" />
          <line x1="68" y1="70" x2="65" y2="76" opacity="0.6" />
          <line x1="60" y1="74" x2="57" y2="80" opacity="0.6" />
        </g>
      </svg>
    `;
  } else if (normCat.includes('NAVIGATION') || normCat.includes('NAV')) {
    // Custom Navigation SVG icon used for Air Navigation
    return `
      <img src="images/navigation.svg" class="subject-graphic-svg" style="width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 0 8px var(--accent-glow));" />
    `;
  } else if (normCat.includes('TECHNICAL') || normCat.includes('TECH')) {
    // Custom Technical SVG icon used for Technical General
    return `
      <img src="images/technical.svg" class="subject-graphic-svg" style="width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 0 8px var(--accent-glow));" />
    `;
  } else if (normCat.includes('REGULATION') || normCat.includes('REG')) {
    // Air Regulations Scales of Justice (Law)
    return `
      <svg viewBox="0 0 100 100" style="width: 100%; height: 100%;">
        <defs>
          <filter id="hudGlowReg" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <!-- Concentric range ring -->
        <circle cx="50" cy="50" r="45" fill="none" stroke="var(--correct)" stroke-width="1.2" opacity="0.2" />
        
        <!-- Scales of Justice -->
        <g class="reg-scales" stroke="var(--correct)" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#hudGlowReg)">
          <!-- Center Pillar -->
          <line x1="50" y1="20" x2="50" y2="78" stroke-width="2.5" />
          <path d="M 42 78 L 58 78" stroke-width="3" />
          <path d="M 46 74 L 54 74" stroke-width="2" />
          <circle cx="50" cy="18" r="3.5" fill="var(--correct)" />
          
          <!-- Balance Crossbar (Tiltable) -->
          <g class="reg-crossbar" style="transform-origin: 50px 26px;">
            <line x1="22" y1="26" x2="78" y2="26" stroke-width="2" />
            <circle cx="50" cy="26" r="2" fill="var(--bg-primary)" />
            
            <!-- Left Pan -->
            <g class="reg-left-pan">
              <line x1="22" y1="26" x2="14" y2="52" stroke-width="1" opacity="0.7" />
              <line x1="22" y1="26" x2="30" y2="52" stroke-width="1" opacity="0.7" />
              <path d="M 10 52 L 34 52 A 12 12 0 0 0 22 64 A 12 12 0 0 0 10 52" fill="var(--correct-glow)" stroke-width="1.5" />
            </g>
            
            <!-- Right Pan -->
            <g class="reg-right-pan">
              <line x1="78" y1="26" x2="70" y2="52" stroke-width="1" opacity="0.7" />
              <line x1="78" y1="26" x2="86" y2="52" stroke-width="1" opacity="0.7" />
              <path d="M 66 52 L 90 52 A 12 12 0 0 0 78 64 A 12 12 0 0 0 66 52" fill="var(--correct-glow)" stroke-width="1.5" />
            </g>
          </g>
        </g>
      </svg>
    `;
  } else if (normCat.includes('A320') || normCat.includes('AIRBUS')) {
    // Airbus A320 Overhead Silhouette
    return `
      <svg viewBox="0 0 100 100" style="width: 100%; height: 100%;">
        <defs>
          <filter id="hudGlowA320New" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <!-- Concentric HUD rings -->
        <circle cx="50" cy="50" r="45" fill="none" stroke="var(--accent)" stroke-width="1" opacity="0.15" />
        <circle cx="50" cy="50" r="35" fill="none" stroke="var(--accent)" stroke-width="1.2" stroke-dasharray="2 3" opacity="0.3" />
        
        <!-- HUD Flight path guidelines / alignment marks -->
        <line x1="15" y1="50" x2="30" y2="50" stroke="var(--accent)" stroke-width="1" opacity="0.4" />
        <line x1="70" y1="50" x2="85" y2="50" stroke="var(--accent)" stroke-width="1" opacity="0.4" />
        <line x1="50" y1="15" x2="50" y2="25" stroke="var(--accent)" stroke-width="1" opacity="0.4" />
        <line x1="50" y1="75" x2="50" y2="85" stroke="var(--accent)" stroke-width="1" opacity="0.4" />
        
        <!-- Airbus A320 Overhead Silhouette -->
        <g class="a320-silhouette" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" filter="url(#hudGlowA320New)">
          <!-- Fuselage -->
          <path d="M 50 18 C 47.5 22, 46.5 28, 46.5 45 L 46.5 75 C 46.5 78, 48.5 82, 50 82 C 51.5 82, 53.5 78, 53.5 75 L 53.5 45 C 53.5 28, 52.5 22, 50 18 Z" fill="var(--bg-tertiary)" stroke-width="1.8" />
                   
          <!-- Left Swept Wing & Winglet -->
          <path d="M 46.5 42 L 12 62 L 10 60 L 11 57 L 46.5 38 Z" fill="var(--bg-tertiary)" />
                   
          <!-- Right Swept Wing & Winglet -->
          <path d="M 53.5 42 L 88 62 L 90 60 L 89 57 L 53.5 38 Z" fill="var(--bg-tertiary)" />
                   
          <!-- Left Engine Nacelle -->
          <rect x="29" y="44" width="6" height="12" rx="3" fill="var(--bg-secondary)" stroke="var(--accent)" stroke-width="1.2" />
          <line x1="32" y1="44" x2="32" y2="38" stroke="var(--accent)" stroke-width="1" /> <!-- Pylon connection -->
          
          <!-- Right Engine Nacelle -->
          <rect x="65" y="44" width="6" height="12" rx="3" fill="var(--bg-secondary)" stroke="var(--accent)" stroke-width="1.2" />
          <line x1="68" y1="44" x2="68" y2="38" stroke="var(--accent)" stroke-width="1" /> <!-- Pylon connection -->
          
          <!-- Horizontal Stabilizers (Tailplanes) -->
          <path d="M 46.5 74 L 32 80 L 32 77 L 46.5 72 Z" fill="var(--bg-tertiary)" />
          <path d="M 53.5 74 L 68 80 L 68 77 L 53.5 72 Z" fill="var(--bg-tertiary)" />
        </g>
      </svg>
    `;
  } else if (normCat.includes('C172') || normCat.includes('CESSNA')) {
    // Cessna 172 Propeller Spinner
    return `
      <svg viewBox="0 0 100 100" style="width: 100%; height: 100%;">
        <!-- Range ring -->
        <circle cx="50" cy="50" r="45" fill="none" stroke="var(--hud-amber)" stroke-width="1.2" opacity="0.2"/>
        <circle cx="50" cy="50" r="41" fill="none" stroke="var(--hud-amber)" stroke-width="0.75" stroke-dasharray="2, 2" opacity="0.2"/>
        
        <!-- Cessna propeller spinner -->
        <g class="tech-turbofan" style="transform-origin: 50px 50px;">
          <!-- Propeller spinner hub -->
          <circle cx="50" cy="50" r="10" fill="var(--hud-amber)" opacity="0.9" />
          
          <!-- 2 Blades -->
          <path d="M 50 40 C 47 26 44 12 50 5 C 56 12 53 26 50 40 Z" fill="var(--hud-amber)" opacity="0.75" />
          <path d="M 50 60 C 53 74 56 88 50 95 C 44 88 47 74 50 60 Z" fill="var(--hud-amber)" opacity="0.75" />
          
          <!-- Center screw -->
          <circle cx="50" cy="50" r="3" fill="var(--bg-secondary)" />
        </g>
      </svg>
    `;
  } else if (normCat.includes('ATPL') || normCat.includes('AIRLINE')) {
    // Airline Exams Captain Epaulet
    return `
      <svg viewBox="0 0 100 100" style="width: 100%; height: 100%;">
        <defs>
          <filter id="hudGlowAirline" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <!-- Concentric range ring -->
        <circle cx="50" cy="50" r="45" fill="none" stroke="var(--hud-amber)" stroke-width="1.2" opacity="0.2" />
        
        <g class="airline-epaulet" filter="url(#hudGlowAirline)">
          <!-- Epaulet base shape -->
          <path d="M 32 80 L 32 26 C 32 23 37 19 50 19 C 63 19 68 23 68 26 L 68 80 Z" fill="var(--bg-tertiary)" stroke="var(--hud-amber)" stroke-width="1.5" />
          
          <!-- 4 Gold Stripes -->
          <rect x="36" y="69" width="28" height="4" fill="var(--hud-amber)" />
          <rect x="36" y="61" width="28" height="4" fill="var(--hud-amber)" />
          <rect x="36" y="53" width="28" height="4" fill="var(--hud-amber)" />
          <rect x="36" y="45" width="28" height="4" fill="var(--hud-amber)" />
          
          <!-- Gold Captain Star at the top -->
          <polygon points="50,25 52,30 57,30 53,33 55,38 50,35 45,38 47,33 43,30 48,30" fill="var(--hud-amber)" />
        </g>
      </svg>
    `;
  } else if (normCat.includes('RADIO') || normCat.includes('RTR') || normCat.includes('TELEPHONY')) {
    // Radio Telephony RTR-A Antenna
    return `
      <svg viewBox="0 0 100 100" style="width: 100%; height: 100%;">
        <defs>
          <filter id="hudGlowRtr" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <!-- Concentric range ring -->
        <circle cx="50" cy="50" r="45" fill="none" stroke="var(--correct)" stroke-width="1.2" opacity="0.2" />
        
        <g class="rtr-antenna" filter="url(#hudGlowRtr)">
          <!-- Antenna Tower legs -->
          <line x1="50" y1="35" x2="36" y2="85" stroke="var(--correct)" stroke-width="2" stroke-linecap="round" />
          <line x1="50" y1="35" x2="64" y2="85" stroke="var(--correct)" stroke-width="2" stroke-linecap="round" />
          
          <!-- Cross bracing -->
          <line x1="43" y1="60" x2="57" y2="60" stroke="var(--correct)" stroke-width="1.5" />
          <line x1="39" y1="72" x2="61" y2="72" stroke="var(--correct)" stroke-width="1.5" />
          <line x1="46.5" y1="48" x2="53.5" y2="48" stroke="var(--correct)" stroke-width="1.5" />
          
          <!-- Diagonal bracing -->
          <line x1="46.5" y1="48" x2="57" y2="60" stroke="var(--correct)" stroke-width="1" opacity="0.7" />
          <line x1="53.5" y1="48" x2="43" y2="60" stroke="var(--correct)" stroke-width="1" opacity="0.7" />
          <line x1="43" y1="60" x2="61" y2="72" stroke="var(--correct)" stroke-width="1" opacity="0.7" />
          <line x1="57" y1="60" x2="39" y2="72" stroke="var(--correct)" stroke-width="1" opacity="0.7" />
          
          <!-- Tower top beacon -->
          <circle cx="50" cy="32" r="3" fill="var(--correct)" />
          
          <!-- Radio waves (arcs) -->
          <path d="M 44 26 A 8 8 0 0 1 56 26" fill="none" stroke="var(--correct)" stroke-width="1.5" stroke-linecap="round" class="rtr-wave rtr-wave-1" />
          <path d="M 38 20 A 16 16 0 0 1 62 20" fill="none" stroke="var(--correct)" stroke-width="1.5" stroke-linecap="round" class="rtr-wave rtr-wave-2" />
          <path d="M 32 14 A 24 24 0 0 1 68 14" fill="none" stroke="var(--correct)" stroke-width="1.5" stroke-linecap="round" class="rtr-wave rtr-wave-3" />
        </g>
      </svg>
    `;
  } else {
    // Fallback/Generic Aviation Wings
    return `
      <svg viewBox="0 0 100 100" style="width: 100%; height: 100%;">
        <circle cx="50" cy="50" r="45" fill="none" stroke="var(--accent)" stroke-width="1.2" opacity="0.2" />
        <path d="M 15 48 C 25 35, 45 42, 50 48 C 55 42, 75 35, 85 48 C 75 55, 55 52, 50 50 C 45 52, 25 55, 15 48 Z" fill="none" stroke="var(--accent)" stroke-width="1.5" />
        <circle cx="50" cy="48" r="5" fill="var(--accent)" opacity="0.8" />
      </svg>
    `;
  }
};

// Tactical HUD Icons for performance indicators
const statIcons = {
  attempts: `
    <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
    </svg>
  `,
  accuracy: `
    <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
    </svg>
  `,
  time: `
    <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  `,
  questions: `
    <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z"></path>
    </svg>
  `
};

export const ui = {
  // 0. Render Cockpit Landing/Splash Screen
  renderLanding(container, onStart, onLogin, onToolsClick, onCX3Click) {
    const metSVG = getSubjectGraphic('Meteorology');
    const navSVG = getSubjectGraphic('Navigation');
    const techSVG = getSubjectGraphic('Technical');
    const regSVG = getSubjectGraphic('Regulations');
    const a320SVG = getSubjectGraphic('A320');
    const c172SVG = getSubjectGraphic('C172');
    const airlineSVG = getSubjectGraphic('Airline');
    const rtrSVG = getSubjectGraphic('Radio');

    container.innerHTML = `
      <div class="landing-container animate-fade-in">
        <!-- Top Navigation Bar -->
        <header class="landing-header">
          <div class="landing-logo">
            <img src="images/easypl_logo.svg" alt="EasyPL Logo" class="logo-img">
          </div>
          <div class="landing-nav-actions">
            <button class="btn btn-outline" id="landingLoginBtn" style="padding: 0.5rem 1.2rem; font-size: 0.8rem;">Login</button>
          </div>
        </header>

        <!-- Hero Section (Centered with Attitude BG) -->
        <section class="landing-hero-centered landing-section-snap">
          <!-- Hero Text & CTAs -->
          <div class="hero-content">
            <h1 class="hero-title text-gradient">Clear Your DGCA & Airline Exams</h1>
            <p class="hero-description">
              Access over <strong>30,000+ questions</strong> covering every aviation topic. From core DGCA pilot subjects to type ratings like Airbus A320, Cessna 172, Radio Telephony (RTR-A), and comprehensive airline preparation exams.
            </p>
            <div class="hero-actions">
              <button class="btn btn-primary" id="engageCockpitBtn" style="padding: 0.9rem 2.2rem; font-size: 1rem; letter-spacing: 0.05em; box-shadow: 0 0 20px var(--accent-glow);">
                Start Practicing
              </button>
              <button class="btn btn-outline" id="exploreSystemsBtn" style="padding: 0.9rem 1.8rem; font-size: 0.9rem;">
                Explore Subjects
              </button>
            </div>
          </div>

          <!-- Background Attitude Indicator is now globally rendered in index.html -->
      </section>

      <!-- Subjects Grid Showcase -->
      <section class="subjects-section landing-section-snap">
        <div class="landing-section-title">Exam Subjects</div>
        <div class="landing-features-grid">
          <div class="card landing-feature-card">
            <div class="landing-feature-icon">${metSVG}</div>
            <h3>Meteorology</h3>
            <p>Study weather reports (METAR/TAF), pressure structures, clouds, winds, and global climate patterns.</p>
          </div>
          
          <div class="card landing-feature-card">
            <div class="landing-feature-icon">${navSVG}</div>
            <h3>Air Navigation</h3>
            <p>Practice track plotting, wind triangles, chart scales, radio aids (VOR/ADF/ILS), and instruments.</p>
          </div>
          
          <div class="card landing-feature-card">
            <div class="landing-feature-icon">${techSVG}</div>
            <h3>Technical General</h3>
            <p>Understand jet turbine engines, airframe systems, aerodynamics, electrical grids, and hydraulics.</p>
          </div>
          
          <div class="card landing-feature-card">
            <div class="landing-feature-icon">${regSVG}</div>
            <h3>Air Regulations</h3>
            <p>Learn aviation law, airspace divisions, flight priority rules, and ICAO standards.</p>
          </div>

          <div class="card landing-feature-card">
            <div class="landing-feature-icon">${a320SVG}</div>
            <h3>Airbus A320</h3>
            <p>Master the A320 type rating syllabus, FBW systems, FMGS navigation, auto-flight modes, and ECAM actions.</p>
          </div>

          <div class="card landing-feature-card">
            <div class="landing-feature-icon">${c172SVG}</div>
            <h3>Cessna 172</h3>
            <p>Understand piston engine operations, basic airframe systems, flight instruments, and weight & balance guidelines.</p>
          </div>

          <div class="card landing-feature-card">
            <div class="landing-feature-icon">${airlineSVG}</div>
            <h3>Airline Exams</h3>
            <p>Prepare for airline recruitment tests, simulator prep, ATPL theory questions, and compass tests.</p>
          </div>

          <div class="card landing-feature-card">
            <div class="landing-feature-icon">${rtrSVG}</div>
            <h3>Radio Telephony (RTR)</h3>
            <p>Perfect transmission procedures, phraseology, emergency communication, and frequency management skills.</p>
          </div>
        </div>
      </section>

      <!-- Tools Section -->
      <section class="tools-section landing-section-snap">
        <div class="landing-section-title">Aviation Tools</div>
        <div class="landing-features-grid">
          <div class="card card-interactive landing-feature-card tool-card" data-tool="metar">
            <div class="landing-feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
                <path d="M17.5 19A3.5 3.5 0 0 0 13 15.7V8.3a3 3 0 1 0-2 0v7.4A3.5 3.5 0 1 0 6.5 19Z" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            </div>
            <h3>METAR Decoder</h3>
            <p>Decode real-time weather reports, including winds, visibility, clouds, temperature, and altimeter settings.</p>
          </div>
          
          <div class="card card-interactive landing-feature-card tool-card" data-tool="taf">
            <div class="landing-feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <h3>TAF Decoder</h3>
            <p>Translate Terminal Aerodrome Forecasts to understand future weather transitions and planning requirements.</p>
          </div>

          <div class="card card-interactive landing-feature-card tool-card" data-tool="cx3">
            <div class="landing-feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
                <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                <line x1="8" y1="6" x2="16" y2="6" />
                <circle cx="8" cy="11" r="1" />
                <circle cx="12" cy="11" r="1" />
                <circle cx="16" cy="11" r="1" />
                <circle cx="8" cy="15" r="1" />
                <circle cx="12" cy="15" r="1" />
                <circle cx="16" cy="15" r="1" />
                <circle cx="8" cy="19" r="1" />
                <circle cx="12" cy="19" r="1" />
                <circle cx="16" cy="19" r="1" />
              </svg>
            </div>
            <h3>CX-3 Calculator</h3>
            <p>Perform essential flight computer calculations like wind correction angle, true airspeed, and fuel burn rate.</p>
          </div>

          <div class="card card-interactive landing-feature-card tool-card" data-tool="density-alt">
            <div class="landing-feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
                <path d="M4 14.5L12 3l8 11.5H4z" />
                <path d="M2 20h20M6 17h12" />
              </svg>
            </div>
            <h3>Density Altitude</h3>
            <p>Calculate aircraft performance altitude based on pressure altitude, temperature, and humidity settings.</p>
          </div>

          <div class="card card-interactive landing-feature-card tool-card" data-tool="crosswind">
            <div class="landing-feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
                <line x1="12" y1="2" x2="12" y2="22" stroke-dasharray="3,3" />
                <line x1="6" y1="5" x2="18" y2="5" />
                <line x1="6" y1="19" x2="18" y2="19" />
                <path d="M3 12h18M18 9l3 3-3 3" />
              </svg>
            </div>
            <h3>Crosswind Calculator</h3>
            <p>Resolve headwind and crosswind components quickly for any given runway heading and wind velocity vector.</p>
          </div>

          <div class="card card-interactive landing-feature-card tool-card" data-tool="ground-speed">
            <div class="landing-feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
                <path d="M12 2a10 10 0 0 1 10 10c0 2.2-.7 4.2-1.9 5.9L12 12V3.1" />
                <path d="M12 2A10 10 0 1 0 2 12c0 2.2.7 4.2 1.9 5.9L12 12" />
                <polyline points="12 12 16.5 8.5" />
              </svg>
            </div>
            <h3>Ground Speed</h3>
            <p>Compute ground speed using True Airspeed (TAS), wind direction, wind velocity, and aircraft heading.</p>
          </div>

          <div class="card card-interactive landing-feature-card tool-card" data-tool="duration">
            <div class="landing-feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
                <path d="M5 2h14M5 22h14M19 2v6c0 2.2-1.8 4-4 4h-6c-2.2 0-4-1.8-4-4V2M19 22v-6c0-2.2-1.8-4-4-4h-6c-2.2 0-4-1.8-4 4v6" />
              </svg>
            </div>
            <h3>Flight Duration</h3>
            <p>Determine estimated time en route (ETE) or endurance based on distance, speed, and fuel consumption rate.</p>
          </div>

          <div class="card card-interactive landing-feature-card tool-card" data-tool="holding">
            <div class="landing-feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
                <rect x="2" y="6" width="20" height="12" rx="6" />
                <path d="M12 6v12M15 9l3 3-3 3" />
              </svg>
            </div>
            <h3>Holding Pattern</h3>
            <p>Visualize holding pattern entries (Direct, Parallel, or Teardrop) based on aircraft heading and holding radial.</p>
          </div>
        </div>
      </section>

      <!-- Pre-Flight Checklist Steps -->
      <section class="landing-steps-section landing-section-snap">
        <div class="landing-section-title">How It Works</div>
        <div class="landing-steps-grid">
          <div class="landing-step-card">
            <div class="landing-step-num">STEP 01 //</div>
            <h4>Create Account</h4>
            <p>Enter your details, make an account, and start practicing in no time.</p>
          </div>
          
          <div class="landing-step-card">
            <div class="landing-step-num">STEP 02 //</div>
            <h4>Select Study Book</h4>
            <p>Choose your preferred books or mock papers for targeted preparation sessions.</p>
          </div>
          
          <div class="landing-step-card">
            <div class="landing-step-num">STEP 03 //</div>
            <h4>Practice Mock Tests</h4>
            <p>Answer questions in a clean, timed environment designed to mimic real exams.</p>
          </div>
          
          <div class="landing-step-card">
            <div class="landing-step-num">STEP 04 //</div>
            <h4>Track Your Progress</h4>
            <p>Review wrong answers and monitor your average score and study time stats.</p>
          </div>
        </div>
      </section>

      <!-- System Stats Telemetry Footer -->
      <div class="landing-footer">
        <span>EasyPL Ventures — Keep Learning. Fly Safe.</span>
        <div style="margin-top: 0.5rem; font-size: 0.7rem;">
          Built with ❤️ by <a href="https://www.hughjass.in" target="_blank">HughJass Foundation</a>.
        </div>
      </div>
    </div>
  `;

  // Hook clicks
  document.getElementById('engageCockpitBtn').addEventListener('click', onStart);
  document.getElementById('landingLoginBtn').addEventListener('click', onLogin);

  // Hook tool cards click
  if (onToolsClick) {
    const toolCards = container.querySelectorAll('.tool-card');
    toolCards.forEach(card => {
      card.addEventListener('click', () => {
        const toolId = card.dataset.tool || '';
        if (toolId === 'cx3') {
          const popupLeft = screen.width - 410;
          window.open('cx3.html', 'CX3_Calculator', `width=380,height=750,left=${popupLeft},top=50,status=no,menubar=no,toolbar=no,location=no,scrollbars=yes,resizable=yes`);
          if (onCX3Click) onCX3Click();
        } else {
          onToolsClick();
        }
      });
    });
  }
  
  document.getElementById('exploreSystemsBtn').addEventListener('click', () => {
    const target = document.querySelector('.landing-section-title');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  // Card mousemove spotlight tracker
  const cards = container.querySelectorAll('.landing-feature-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
},

  // 1. Render Authentication Screen (Pre-Flight BRIEFING Terminal)
  renderAuth(container, isLogin, onToggle, onSubmit, onBackToSplash) {
    let infoTitle = "Clear Your DGCA Exams with Ease";
    let infoDesc = "Study smart and clear your DGCA CPL papers. EasyPL provides high-quality mock tests, performance logs, and real exam conditions for Indian CPL candidates.";

    if (isLogin) {
      const welcomeMessages = [
        {
          title: "Welcome Back, Captain!",
          desc: "Your runway to success is clear. Log in to continue your pre-flight preparation and log those study hours!"
        },
        {
          title: "Clear Skies Ahead",
          desc: "Consistency is key to mastering the airspace. Log in now, review your logs, and clear your next DGCA paper."
        },
        {
          title: "Ready for Departure?",
          desc: "The cockpit is prepped and the engines are starting. Let's practice some mock questions and sharpen those pilot skills!"
        },
        {
          title: "Aim High, Study Smart",
          desc: "Every successful flight begins with a thorough briefing. Log in to study Meteorology, Regulations, and Air Navigation today."
        },
        {
          title: "Log Your Progress",
          desc: "A great pilot never stops learning. Let's get back to the books and push that quiz accuracy closer to 100%!"
        }
      ];
      const randomMsg = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
      infoTitle = randomMsg.title;
      infoDesc = randomMsg.desc;
    }

    container.innerHTML = `
      <div class="auth-split-layout">
        <div class="auth-info-pane">
          <h1 class="auth-info-title animate-fade-in-left">${infoTitle}</h1>
          <p class="auth-info-desc animate-fade-in-left">
            ${infoDesc}
          </p>
        </div>
        
        <div class="auth-form-pane">
          <div class="auth-wrapper card animate-fade-in">
            ${onBackToSplash ? `
              <div class="auth-back" id="authBackBtn" title="Back to Home">
                ✕ BACK TO HOME
              </div>
            ` : ''}
            <div class="auth-header">
              <img src="images/easypl_logo.svg" alt="EasyPL Logo" class="logo-img-auth">
              <p>${isLogin ? 'LOG IN TO YOUR ACCOUNT' : 'CREATE YOUR PILOT PROFILE'}</p>
            </div>
            
            <form id="authForm">
              <div class="form-group">
                <label class="form-label" for="username">Username</label>
                <input class="form-input" type="text" id="username" required placeholder="Enter username" autocomplete="off">
              </div>
              
              <div class="form-group">
                <label class="form-label" for="password">Password</label>
                <input class="form-input" type="password" id="password" required placeholder="Enter password">
              </div>
              
              ${!isLogin ? `
                <div class="form-group">
                  <label class="form-label">Select Pilot Avatar</label>
                  <div class="avatar-selector" style="grid-template-columns: repeat(2, 1fr); max-width: 240px; margin: 0 auto;">
                    <div class="avatar-option selected" data-avatar="avatar1.png" title="Male Pilot (Felix)">
                      <img src="images/avatar1.png" alt="Male Pilot">
                    </div>
                    <div class="avatar-option" data-avatar="avatar2.png" title="Female Pilot (Sara)">
                      <img src="images/avatar2.png" alt="Female Pilot">
                    </div>
                  </div>
                </div>
              ` : ''}
              
              <button class="btn btn-primary" type="submit" style="width: 100%; margin-top: 1rem;">
                ${isLogin ? 'Log In' : 'Register'}
              </button>
            </form>
            
            <div class="auth-toggle">
              ${isLogin ? "Don't have a profile? <span id='toggleAuth'>Create Profile</span>" : "Already have a profile? <span id='toggleAuth'>Log In</span>"}
            </div>
          </div>
        </div>
      </div>
    `;

    // Handle form submit
    const form = document.getElementById('authForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      let avatar = 'avatar1.png';
      
      if (!isLogin) {
        const selected = document.querySelector('.avatar-option.selected');
        if (selected) avatar = selected.dataset.avatar;
      }
      
      onSubmit(username, password, avatar);
    });

    // Handle toggle between Login & Register
    document.getElementById('toggleAuth').addEventListener('click', onToggle);

    if (onBackToSplash && document.getElementById('authBackBtn')) {
      document.getElementById('authBackBtn').addEventListener('click', onBackToSplash);
    }

    // Handle avatar selection clicks
    if (!isLogin) {
      const options = document.querySelectorAll('.avatar-option');
      options.forEach(opt => {
        opt.addEventListener('click', () => {
          options.forEach(o => o.classList.remove('selected'));
          opt.classList.add('selected');
        });
      });
    }
  },

  // Get avatar image URL based on selected avatar value
  getAvatarUrl(avatar) {
    if (avatar === 'avatar1.png') return 'images/avatar1.png';
    if (avatar === 'avatar2.png') return 'images/avatar2.png';
    return 'images/avatar1.png';
  },

  // 2. Render Study Dashboard View (Flight Command Console)
  renderDashboard(container, user, stats, subjects, onSubjectClick, onLogout, onReattempt, onProfile, onClearAttempts, onToolsClick) {
    const avatarUrl = this.getAvatarUrl(user.avatar);
    
    // Format total time: e.g. "12m 30s" or "1h 5m"
    const totalMinutes = Math.floor(stats.totalTime / 60);
    const timeDisplay = totalMinutes > 60 
      ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
      : `${totalMinutes}m ${stats.totalTime % 60}s`;

    // Map main 4 subjects/categories into HTML cards with custom vector drawings
    const mainCategories = [
      { id: 'Meteorology', title: 'Meteorology', category: 'DGCA CORE SUBJECT', iconCat: 'Meteorology' },
      { id: 'Navigation', title: 'Navigation', category: 'DGCA CORE SUBJECT', iconCat: 'Navigation' },
      { id: 'Technical General', title: 'Technical General', category: 'DGCA CORE SUBJECT', iconCat: 'Technical' },
      { id: 'Regulations', title: 'Regulations', category: 'DGCA CORE SUBJECT', iconCat: 'Regulations' }
    ];

    let subjectCardsHTML = '';
    mainCategories.forEach(cat => {
      const catProg = progress.getCategoryProgress(user.username, cat.id, subjects);
      const graphicSVG = getSubjectGraphic(cat.iconCat);
      
      subjectCardsHTML += `
        <div class="card card-interactive subject-card animate-fade-in" data-id="${cat.id}">
          <div class="subject-content">
            <div>
              <div class="subject-badge">${cat.category}</div>
              <div class="subject-info">
                <h3>${cat.title}</h3>
              </div>
            </div>
            <div class="progress-container">
              <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: ${catProg.percentComplete}%;"></div>
              </div>
              <div class="progress-text">
                <span>Completed: <strong>${catProg.percentComplete}%</strong></span>
                <span>Accuracy: <strong>${catProg.avgAccuracy}%</strong></span>
              </div>
            </div>
          </div>
          <div class="subject-graphic">
            ${graphicSVG}
          </div>
        </div>
      `;
    });

    // Recent history items HTML
    let historyHTML = '<p style="color: var(--text-secondary); font-family: var(--font-mono); font-size: 0.85rem; padding: 1.5rem; text-align: center;">NO EXAM ATTEMPTS FOUND. START PRACTICING BELOW.</p>';
    if (stats.recentAttempts.length > 0) {
      historyHTML = stats.recentAttempts.map(att => {
        const sub = subjects[att.subjectId];
        const chapter = sub ? sub.chapters.find(c => c.id === att.chapterId) : null;
        const subTitle = sub ? sub.title : att.subjectId;
        const chTitle = chapter ? chapter.displayName : att.chapterId;
        const formattedDate = new Date(att.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'});
        
        return `
          <div class="history-item">
            <div class="history-info">
              <span class="history-subject">${subTitle} - ${chTitle}</span>
              <span class="history-meta">${formattedDate} &bull; ${Math.floor(att.timeTaken / 60)}m ${att.timeTaken % 60}s</span>
            </div>
            <div class="history-actions" style="margin-left: auto; margin-right: 1.5rem;">
              <button class="btn btn-secondary btn-reattempt" data-subject-id="${att.subjectId}" data-chapter-id="${att.chapterId}" style="padding: 0.35rem 0.85rem; font-size: 0.72rem; letter-spacing: 0.03em;">
                Reattempt
              </button>
            </div>
            <div class="history-score ${att.accuracy >= 70 ? 'score-pass' : 'score-fail'}">
              ${att.score}/${att.totalQuestions} (${att.accuracy}%)
            </div>
          </div>
        `;
      }).join('');
    }

    container.innerHTML = `
      <div class="dashboard-header animate-fade-in">
        <div style="display: flex; align-items: center; gap: 1.25rem;">
          <!-- High-Tech Cockpit Hamburger Menu Button -->
          <button class="hamburger-menu-btn" id="dashboardMenuBtn" aria-label="Open Instrument Panel Menu">
            <div class="hamburger-lines">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
          <div class="profile-card">
            <img class="profile-avatar" src="${avatarUrl}" alt="User Avatar">
            <div class="profile-info">
              <h3>Welcome, ${user.fullName || user.username}</h3>
              <p>STUDENT PILOT</p>
            </div>
          </div>
        </div>
        <div class="header-actions" style="display: flex; gap: 0.75rem;">
          <button class="btn btn-outline" id="logoutBtn">Log Out</button>
        </div>
      </div>

      <!-- Navigation Sidebar Drawer Backdrop -->
      <div class="tools-drawer-backdrop" id="toolsDrawerBackdrop">
        <div class="tools-drawer">
          <!-- Top Row: Logo Only -->
          <div class="drawer-header-row" style="justify-content: center; margin-bottom: 1rem;">
            <div class="drawer-brand" style="padding-left: 0;">
              <img src="images/easypl_logo.svg" alt="EasyPL Logo" class="brand-logo-img" style="width: 230px; height: auto; display: block;" />
            </div>
          </div>

          <div class="drawer-content">
            <div class="drawer-nav-list" style="margin-top: 0.5rem;">
              <!-- Active Dashboard Link -->
              <div class="drawer-nav-item active-nav">
                <svg class="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <span>Dashboard</span>
              </div>

              <!-- Tools Link -->
              <div class="drawer-nav-item clickable" id="drawerToolsLink">
                <svg class="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                </svg>
                <span>Aviation Tools</span>
              </div>

              <!-- Profile Link -->
              <div class="drawer-nav-item clickable" id="drawerProfileLink">
                <svg class="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>Profile Settings</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Centered Tools Popup Modal Backdrop -->
      <div class="tools-modal-backdrop" id="toolsModalBackdrop">
        <div class="tools-modal-card">
          <div class="tools-modal-header">
            <h2>Aviation Instruments & Tools</h2>
            <button id="closeToolsModalBtn" aria-label="Close Instruments">&times;</button>
          </div>
          <div class="tools-modal-body">
            <div class="tools-modal-grid">
              <!-- METAR Decoder -->
              <div class="drawer-tool-card card card-interactive" data-tool="metar">
                <span class="tool-emoji">🌩️</span>
                <div>
                  <h4>METAR Decoder</h4>
                  <p>Decode weather reports</p>
                </div>
              </div>
              <!-- TAF Decoder -->
              <div class="drawer-tool-card card card-interactive" data-tool="taf">
                <span class="tool-emoji">🌐</span>
                <div>
                  <h4>TAF Decoder</h4>
                  <p>Translate aerodrome forecasts</p>
                </div>
              </div>
              <!-- CX-3 Calculator -->
              <div class="drawer-tool-card card card-interactive" data-tool="cx3">
                <span class="tool-emoji">🧮</span>
                <div>
                  <h4>CX-3 Calculator</h4>
                  <p>Perform flight computer math</p>
                </div>
              </div>
              <!-- Density Altitude -->
              <div class="drawer-tool-card card card-interactive" data-tool="density-alt">
                <span class="tool-emoji">🏔️</span>
                <div>
                  <h4>Density Altitude</h4>
                  <p>Resolve aircraft performance alt</p>
                </div>
              </div>
              <!-- Crosswind Calculator -->
              <div class="drawer-tool-card card card-interactive" data-tool="crosswind">
                <span class="tool-emoji">💨</span>
                <div>
                  <h4>Crosswind Calculator</h4>
                  <p>Compute wind velocity vectors</p>
                </div>
              </div>
              <!-- Ground Speed -->
              <div class="drawer-tool-card card card-interactive" data-tool="ground-speed">
                <span class="tool-emoji">⏱️</span>
                <div>
                  <h4>Ground Speed</h4>
                  <p>Calculate speed with wind offsets</p>
                </div>
              </div>
              <!-- Flight Duration -->
              <div class="drawer-tool-card card card-interactive" data-tool="duration">
                <span class="tool-emoji">⏳</span>
                <div>
                  <h4>Flight Duration</h4>
                  <p>Determine enroute endurance time</p>
                </div>
              </div>
              <!-- Holding Pattern -->
              <div class="drawer-tool-card card card-interactive" data-tool="holding">
                <span class="tool-emoji">🔄</span>
                <div>
                  <h4>Holding Pattern</h4>
                  <p>Visualize hold entries and radials</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- General Statistics -->
      <h2 class="section-title animate-fade-in">Performance Stats</h2>
      <div class="stats-grid animate-fade-in">
        <div class="card stat-card">
          ${statIcons.attempts}
          <div class="stat-value">${stats.totalAttempts}</div>
          <div class="stat-label">Tests Attempted</div>
        </div>
        <div class="card stat-card">
          ${statIcons.accuracy}
          <div class="stat-value">${stats.averageAccuracy}%</div>
          <div class="stat-label">Average Score</div>
        </div>
        <div class="card stat-card">
          ${statIcons.time}
          <div class="stat-value">${timeDisplay}</div>
          <div class="stat-label">Study Time</div>
        </div>
        <div class="card stat-card">
          ${statIcons.questions}
          <div class="stat-value">${stats.totalQuestionsAnswered}</div>
          <div class="stat-label">Questions Answered</div>
        </div>
      </div>

      <!-- Subjects Section -->
      <h2 class="section-title animate-fade-in">DGCA Subjects</h2>
      <div class="subject-grid">
        ${subjectCardsHTML}
      </div>

      <!-- Recent Attempts -->
      <div class="animate-fade-in" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; margin-top: 1.5rem;">
        <h2 class="section-title" style="margin-bottom: 0;">Recent Attempts</h2>
        ${stats.recentAttempts.length > 0 ? `
          <button class="btn btn-outline" id="clearAttemptsBtn" style="padding: 0.4rem 0.8rem; font-size: 0.72rem; display: flex; align-items: center; gap: 0.35rem; color: var(--wrong-light); border-color: rgba(255, 74, 118, 0.25); background: rgba(255, 74, 118, 0.02);">
            🗑️ Clear History
          </button>
        ` : ''}
      </div>
      <div class="card history-list animate-fade-in">
        ${historyHTML}
      </div>

      <!-- Footer -->
      <div class="landing-footer">
        <span>EasyPL Ventures — Keep Learning. Fly Safe.</span>
        <div style="margin-top: 0.5rem; font-size: 0.7rem;">
          Built with ❤️ by <a href="https://www.hughjass.in" target="_blank">HughJass Foundation</a>.
        </div>
      </div>
    `;

    console.log("ui.js renderDashboard starting...");
    // Clean up any old sidebar drawer backdrop from document.body to avoid duplicates
    const oldBackdrop = document.querySelector('body > #toolsDrawerBackdrop');
    console.log("oldBackdrop found on body:", oldBackdrop);
    if (oldBackdrop) {
      oldBackdrop.remove();
      console.log("oldBackdrop removed.");
    }
    
    // Find the new backdrop in the container and move it to document.body
    const drawerBackdrop = container.querySelector('#toolsDrawerBackdrop');
    console.log("drawerBackdrop query inside container:", drawerBackdrop);
    if (drawerBackdrop) {
      document.body.appendChild(drawerBackdrop);
      console.log("drawerBackdrop appended to document.body");
    }

    // Hook listeners
    document.getElementById('logoutBtn').addEventListener('click', onLogout);

    // Tools Drawer Toggle mechanics
    const menuBtn = document.getElementById('dashboardMenuBtn');

    if (menuBtn) {
      // Toggle Drawer
      menuBtn.addEventListener('click', (e) => {
        console.log("Hamburger menu clicked!");
        const backdrop = document.getElementById('toolsDrawerBackdrop');
        console.log("Backdrop found:", backdrop);
        if (backdrop) {
          backdrop.classList.add('active');
          console.log("Active class added to backdrop.");
        }
      });

      const closeDrawer = () => {
        console.log("Closing drawer...");
        const backdrop = document.getElementById('toolsDrawerBackdrop');
        if (backdrop) backdrop.classList.remove('active');
      };

      // Handle backdrop clicking to close
      document.addEventListener('click', (e) => {
        const backdrop = document.getElementById('toolsDrawerBackdrop');
        if (backdrop && e.target === backdrop) {
          closeDrawer();
        }
      });

      // Redirect drawer "Tools" click to separate Tools Dashboard
      const drawerToolsLink = document.getElementById('drawerToolsLink');
      if (drawerToolsLink && onToolsClick) {
        drawerToolsLink.addEventListener('click', () => {
          closeDrawer();
          setTimeout(() => {
            onToolsClick();
          }, 300); // Let drawer slide shut first
        });
      }

      // Redirect drawer "Profile Settings" click
      const drawerProfileLink = document.getElementById('drawerProfileLink');
      if (drawerProfileLink && onProfile) {
        drawerProfileLink.addEventListener('click', () => {
          closeDrawer();
          setTimeout(() => {
            onProfile();
          }, 300); // Let drawer slide shut first
        });
      }
    }
    
    const clearBtn = document.getElementById('clearAttemptsBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.showConfirmModal(
          "Clear Flight History",
          "Are you sure you want to permanently clear all your recent exam attempts?",
          onClearAttempts
        );
      });
    }
    
    const cards = document.querySelectorAll('.subject-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        onSubjectClick(card.dataset.id);
      });
    });

    const reattemptBtns = container.querySelectorAll('.btn-reattempt');
    reattemptBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        onReattempt(btn.dataset.subjectId, btn.dataset.chapterId);
      });
    });
  },

  // 2b. Render Dedicated Aviation Tools Dashboard View
  renderToolsDashboard(container, user, onSubjectClick, onLogout, onProfile, onDashboardClick, onCX3Click) {
    const avatarUrl = this.getAvatarUrl(user.avatar);

    container.innerHTML = `
      <div class="dashboard-header animate-fade-in">
        <div style="display: flex; align-items: center; gap: 1.25rem;">
          <!-- High-Tech Cockpit Hamburger Menu Button -->
          <button class="hamburger-menu-btn" id="dashboardMenuBtn" aria-label="Open Instrument Panel Menu">
            <div class="hamburger-lines">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
          <div class="profile-card">
            <img class="profile-avatar" src="${avatarUrl}" alt="User Avatar">
            <div class="profile-info">
              <h3>Welcome, ${user.fullName || user.username}</h3>
              <p>STUDENT PILOT</p>
            </div>
          </div>
        </div>
        <div class="header-actions" style="display: flex; gap: 0.75rem;">
          <button class="btn btn-outline" id="logoutBtn">Log Out</button>
        </div>
      </div>

      <!-- Navigation Sidebar Drawer Backdrop -->
      <div class="tools-drawer-backdrop" id="toolsDrawerBackdrop">
        <div class="tools-drawer">
          <!-- Top Row: Logo Only -->
          <div class="drawer-header-row" style="justify-content: center; margin-bottom: 1rem;">
            <div class="drawer-brand" style="padding-left: 0;">
              <img src="images/easypl_logo.svg" alt="EasyPL Logo" class="brand-logo-img" style="width: 230px; height: auto; display: block;" />
            </div>
          </div>

          <div class="drawer-content">
            <div class="drawer-nav-list" style="margin-top: 0.5rem;">
              <!-- Clickable Dashboard Link -->
              <div class="drawer-nav-item clickable" id="drawerDashboardLink">
                <svg class="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <span>Dashboard</span>
              </div>

              <!-- Tools Link (Active in this view) -->
              <div class="drawer-nav-item active-nav" id="drawerToolsLink">
                <svg class="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                </svg>
                <span>Aviation Tools</span>
              </div>

              <!-- Profile Link -->
              <div class="drawer-nav-item clickable" id="drawerProfileLink">
                <svg class="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>Profile Settings</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Aviation Tools Grid Content Area -->
      <h2 class="section-title animate-fade-in">Aviation Instruments & Tools</h2>
      <div class="tools-grid animate-fade-in" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
        
        <!-- METAR Decoder -->
        <div class="card card-interactive tool-dashboard-card animate-fade-in" data-tool="metar" style="display: flex; flex-direction: column; gap: 0.75rem; padding: 1.5rem;">
          <div style="font-size: 2.2rem;">🌩️</div>
          <h3 style="margin: 0; font-family: var(--font-display); font-size: 1.15rem; font-weight: 700; color: var(--text-highlight);">METAR Decoder</h3>
          <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">Decode real-time METAR weather reports, winds, pressure, temp and clouds.</p>
        </div>

        <!-- TAF Decoder -->
        <div class="card card-interactive tool-dashboard-card animate-fade-in" data-tool="taf" style="display: flex; flex-direction: column; gap: 0.75rem; padding: 1.5rem;">
          <div style="font-size: 2.2rem;">🌐</div>
          <h3 style="margin: 0; font-family: var(--font-display); font-size: 1.15rem; font-weight: 700; color: var(--text-highlight);">TAF Decoder</h3>
          <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">Translate Aerodrome Forecast reports to plan route weather trends.</p>
        </div>

        <!-- CX-3 Calculator -->
        <div class="card card-interactive tool-dashboard-card animate-fade-in" data-tool="cx3" style="display: flex; flex-direction: column; gap: 0.75rem; padding: 1.5rem;">
          <div style="font-size: 2.2rem;">🧮</div>
          <h3 style="margin: 0; font-family: var(--font-display); font-size: 1.15rem; font-weight: 700; color: var(--text-highlight);">CX-3 Calculator</h3>
          <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">Solve heading wind corrections, airspeed calculations, and fuel burn metrics.</p>
        </div>

        <!-- Density Altitude -->
        <div class="card card-interactive tool-dashboard-card animate-fade-in" data-tool="density-alt" style="display: flex; flex-direction: column; gap: 0.75rem; padding: 1.5rem;">
          <div style="font-size: 2.2rem;">🏔️</div>
          <h3 style="margin: 0; font-family: var(--font-display); font-size: 1.15rem; font-weight: 700; color: var(--text-highlight);">Density Altitude</h3>
          <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">Perform temperature and humidity offsets to determine density alt performance.</p>
        </div>

        <!-- Crosswind Calculator -->
        <div class="card card-interactive tool-dashboard-card animate-fade-in" data-tool="crosswind" style="display: flex; flex-direction: column; gap: 0.75rem; padding: 1.5rem;">
          <div style="font-size: 2.2rem;">💨</div>
          <h3 style="margin: 0; font-family: var(--font-display); font-size: 1.15rem; font-weight: 700; color: var(--text-highlight);">Crosswind Calculator</h3>
          <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">Calculate headwind and crosswind components relative to runway heading.</p>
        </div>

        <!-- Ground Speed -->
        <div class="card card-interactive tool-dashboard-card animate-fade-in" data-tool="ground-speed" style="display: flex; flex-direction: column; gap: 0.75rem; padding: 1.5rem;">
          <div style="font-size: 2.2rem;">⏱️</div>
          <h3 style="margin: 0; font-family: var(--font-display); font-size: 1.15rem; font-weight: 700; color: var(--text-highlight);">Ground Speed</h3>
          <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">Compute true ground speed by adjusting true airspeed for wind drift.</p>
        </div>

        <!-- Flight Duration -->
        <div class="card card-interactive tool-dashboard-card animate-fade-in" data-tool="duration" style="display: flex; flex-direction: column; gap: 0.75rem; padding: 1.5rem;">
          <div style="font-size: 2.2rem;">⏳</div>
          <h3 style="margin: 0; font-family: var(--font-display); font-size: 1.15rem; font-weight: 700; color: var(--text-highlight);">Flight Duration</h3>
          <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">Resolve estimated time enroute (ETE) and fuel endurance calculations.</p>
        </div>

        <!-- Holding Pattern -->
        <div class="card card-interactive tool-dashboard-card animate-fade-in" data-tool="holding" style="display: flex; flex-direction: column; gap: 0.75rem; padding: 1.5rem;">
          <div style="font-size: 2.2rem;">🔄</div>
          <h3 style="margin: 0; font-family: var(--font-display); font-size: 1.15rem; font-weight: 700; color: var(--text-highlight);">Holding Pattern</h3>
          <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">Visualize hold entries (direct, teardrop, parallel) and timing parameters.</p>
        </div>

      </div>

      <!-- Footer -->
      <div class="landing-footer">
        <span>EasyPL Ventures — Keep Learning. Fly Safe.</span>
        <div style="margin-top: 0.5rem; font-size: 0.7rem;">
          Built with ❤️ by <a href="https://www.hughjass.in" target="_blank">HughJass Foundation</a>.
        </div>
      </div>
    `;

    console.log("ui.js renderToolsDashboard starting...");
    // Clean up any old sidebar drawer backdrop from document.body to avoid duplicates
    const oldBackdrop = document.querySelector('body > #toolsDrawerBackdrop');
    console.log("oldBackdrop found on Tools body:", oldBackdrop);
    if (oldBackdrop) {
      oldBackdrop.remove();
      console.log("oldBackdrop removed on Tools view.");
    }
    
    // Find the new backdrop in the container and move it to document.body
    const drawerBackdrop = container.querySelector('#toolsDrawerBackdrop');
    console.log("drawerBackdrop query inside Tools container:", drawerBackdrop);
    if (drawerBackdrop) {
      document.body.appendChild(drawerBackdrop);
      console.log("drawerBackdrop appended to document.body on Tools view.");
    }

    // Hook listeners
    document.getElementById('logoutBtn').addEventListener('click', onLogout);

    // Tools Drawer Toggle mechanics
    const menuBtn = document.getElementById('dashboardMenuBtn');

    if (menuBtn) {
      // Toggle Drawer
      menuBtn.addEventListener('click', (e) => {
        console.log("Tools Dashboard hamburger menu clicked!");
        const backdrop = document.getElementById('toolsDrawerBackdrop');
        console.log("Backdrop found:", backdrop);
        if (backdrop) {
          backdrop.classList.add('active');
          console.log("Active class added to backdrop on Tools view.");
        }
      });

      const closeDrawer = () => {
        console.log("Closing Tools drawer...");
        const backdrop = document.getElementById('toolsDrawerBackdrop');
        if (backdrop) backdrop.classList.remove('active');
      };

      // Handle backdrop clicking to close
      document.addEventListener('click', (e) => {
        const backdrop = document.getElementById('toolsDrawerBackdrop');
        if (backdrop && e.target === backdrop) {
          closeDrawer();
        }
      });

      // Redirect drawer "Dashboard" click back to Study Dashboard
      const drawerDashboardLink = document.getElementById('drawerDashboardLink');
      if (drawerDashboardLink && onDashboardClick) {
        drawerDashboardLink.addEventListener('click', () => {
          closeDrawer();
          setTimeout(() => {
            onDashboardClick();
          }, 300); // Let drawer slide shut first
        });
      }

      // Redirect drawer "Profile Settings" click
      const drawerProfileLink = document.getElementById('drawerProfileLink');
      if (drawerProfileLink && onProfile) {
        drawerProfileLink.addEventListener('click', () => {
          closeDrawer();
          setTimeout(() => {
            onProfile();
          }, 300); // Let drawer slide shut first
        });
      }
    }

    // Bind alerts on clicking tools grid cards in Tools Dashboard
    const toolDashboardCards = container.querySelectorAll('.tool-dashboard-card');
    toolDashboardCards.forEach(card => {
      card.addEventListener('click', () => {
        const toolId = card.dataset.tool || '';
        const toolName = card.querySelector('h3').textContent;
        if (toolId === 'cx3') {
          const popupLeft = screen.width - 410;
          window.open('cx3.html', 'CX3_Calculator', `width=380,height=750,left=${popupLeft},top=50,status=no,menubar=no,toolbar=no,location=no,scrollbars=yes,resizable=yes`);
          if (onCX3Click) onCX3Click();
        } else {
          this.showAlertModal(
            toolName,
            `${toolName} tool will be fully integrated as an interactive utility in a later flight training phase.`
          );
        }
      });
    });
  },

  // 2b-2. Render Dedicated CX-3 Info View
  renderCX3Info(container, user, onBack) {
    container.innerHTML = `
      <div class="dashboard-header animate-fade-in">
        <div style="display: flex; align-items: center; gap: 1.25rem;">
          <button class="btn btn-outline" id="cx3InfoBackBtn" style="padding: 0.5rem 1.25rem; display: flex; align-items: center; gap: 0.5rem; font-weight: 600;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back
          </button>
        </div>
      </div>

      <div class="cx3-info-content animate-fade-in" style="max-width: 640px; margin: 2rem 0 2rem 3rem; padding: 0 1rem; color: var(--text-primary);">
        <header style="margin-bottom: 2.5rem; border-bottom: 1px solid var(--border); padding-bottom: 2rem;">
          <h1 style="font-size: 2.5rem; font-weight: 800; font-family: var(--font-display); color: var(--text-highlight); margin-bottom: 0.75rem;">CX-3 Flight Computer</h1>
          <p style="font-size: 1.1rem; line-height: 1.6; color: var(--text-secondary); margin: 0;">
            The CX-3 is the electronic version of the classic E6B flight computer. It replaces the manual whiz-wheel with a button-driven calculator that produces the same answers faster and with fewer user errors. It is the calculator most Indian and international flight schools recommend for new students learning navigation and flight planning.
          </p>
        </header>

        <!-- What is the CX-3 -->
        <div class="card" style="padding: 2rem; margin-bottom: 2rem; border-radius: 12px;">
          <h3 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 1rem; color: var(--text-highlight); display: flex; align-items: center; gap: 0.75rem;">
            <span>🧮</span> What is the CX-3?
          </h3>
          <p style="line-height: 1.6; color: var(--text-secondary); margin: 0; font-size: 0.95rem;">
            The CX-3 is an electronic flight computer manufactured and sold by Sporty's, one of the oldest pilot-supply companies in the world. It is the modern, button-driven successor to the analogue E6B that pilots have used for flight planning since the Second World War.
          </p>
        </div>

        <!-- What can the CX-3 calculate -->
        <div class="card" style="padding: 2rem; margin-bottom: 2rem; border-radius: 12px;">
          <h3 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 1rem; color: var(--text-highlight); display: flex; align-items: center; gap: 0.75rem;">
            <span>⚡</span> What can the CX-3 calculate?
          </h3>
          <p style="line-height: 1.6; color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.95rem;">
            The CX-3 covers the full standard flight-planning syllabus in a single device. Each capability below is a separate mode on the calculator.
          </p>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.25rem;">
            <div style="background: var(--bg-secondary); border: 1px solid var(--border); padding: 1.25rem; border-radius: 8px;">
              <h4 style="margin: 0 0 0.5rem 0; color: var(--text-highlight); font-weight: 600; font-size: 1rem;">Time, Speed, Distance</h4>
              <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.45;">Solve any TSD leg in either direction—find time-en-route from groundspeed and distance, or work backwards from the time you have available.</p>
            </div>
            <div style="background: var(--bg-secondary); border: 1px solid var(--border); padding: 1.25rem; border-radius: 8px;">
              <h4 style="margin: 0 0 0.5rem 0; color: var(--text-highlight); font-weight: 600; font-size: 1rem;">Fuel planning</h4>
              <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.45;">Compute fuel burn, endurance, and range from fuel flow. Useful for route planning and working through DGCA navigation problems on paper.</p>
            </div>
            <div style="background: var(--bg-secondary); border: 1px solid var(--border); padding: 1.25rem; border-radius: 8px;">
              <h4 style="margin: 0 0 0.5rem 0; color: var(--text-highlight); font-weight: 600; font-size: 1rem;">Wind triangle</h4>
              <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.45;">Resolve heading, ground speed, wind correction angle, or the true wind itself when you only know the other components.</p>
            </div>
            <div style="background: var(--bg-secondary); border: 1px solid var(--border); padding: 1.25rem; border-radius: 8px;">
              <h4 style="margin: 0 0 0.5rem 0; color: var(--text-highlight); font-weight: 600; font-size: 1rem;">Density altitude & TAS</h4>
              <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.45;">Calculate density altitude from pressure altitude and OAT, and turn calibrated airspeed into true airspeed for cruise performance work.</p>
            </div>
            <div style="background: var(--bg-secondary); border: 1px solid var(--border); padding: 1.25rem; border-radius: 8px;">
              <h4 style="margin: 0 0 0.5rem 0; color: var(--text-highlight); font-weight: 600; font-size: 1rem;">Mach & ISA deviation</h4>
              <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.45;">Useful for ATPL-level questions—convert between Mach number and TAS, and check ISA deviation against a temperature lapse rate.</p>
            </div>
            <div style="background: var(--bg-secondary); border: 1px solid var(--border); padding: 1.25rem; border-radius: 8px;">
              <h4 style="margin: 0 0 0.5rem 0; color: var(--text-highlight); font-weight: 600; font-size: 1rem;">Weight & balance</h4>
              <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.45;">Run a centre-of-gravity calculation given station moments and weights. Same answers you would get from an aircraft loading sheet.</p>
            </div>
            <div style="background: var(--bg-secondary); border: 1px solid var(--border); padding: 1.25rem; border-radius: 8px;">
              <h4 style="margin: 0 0 0.5rem 0; color: var(--text-highlight); font-weight: 600; font-size: 1rem;">Unit conversions</h4>
              <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.45;">Distance, weight, volume, pressure, temperature—every conversion the syllabus expects, without juggling separate formulas or tables.</p>
            </div>
            <div style="background: var(--bg-secondary); border: 1px solid var(--border); padding: 1.25rem; border-radius: 8px;">
              <h4 style="margin: 0 0 0.5rem 0; color: var(--text-highlight); font-weight: 600; font-size: 1rem;">Cross-country planning</h4>
              <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.45;">Stitch the individual modes together to build a full cross-country plan: leg distance, ETE, fuel, wind correction, and arrival time.</p>
            </div>
          </div>
        </div>

        <!-- Who uses the CX-3 -->
        <div class="card" style="padding: 2rem; margin-bottom: 2rem; border-radius: 12px;">
          <h3 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 1.25rem; color: var(--text-highlight); display: flex; align-items: center; gap: 0.75rem;">
            <span>👨‍✈️</span> Who uses the CX-3?
          </h3>
          <div style="display: grid; grid-template-columns: 1fr; gap: 1rem;">
            <div style="background: var(--bg-secondary); border: 1px solid var(--border); padding: 1rem 1.25rem; border-radius: 8px; font-size: 0.95rem; line-height: 1.5; color: var(--text-secondary);">
              Student pilots learning navigation and flight planning for the first time, who need a faster way to check their manual whiz-wheel work.
            </div>
            <div style="background: var(--bg-secondary); border: 1px solid var(--border); padding: 1rem 1.25rem; border-radius: 8px; font-size: 0.95rem; line-height: 1.5; color: var(--text-secondary);">
              CPL and ATPL trainees preparing for DGCA Navigation, Air Navigation, and Flight Planning papers where speed of calculation matters.
            </div>
            <div style="background: var(--bg-secondary); border: 1px solid var(--border); padding: 1rem 1.25rem; border-radius: 8px; font-size: 0.95rem; line-height: 1.5; color: var(--text-secondary);">
              Instructors who want a shared online calculator they can demo on a screen during ground school.
            </div>
          </div>
        </div>

        <!-- Frequently Asked Questions -->
        <div class="card" style="padding: 2rem; border-radius: 12px; margin-bottom: 4rem;">
          <h3 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 1.5rem; color: var(--text-highlight); display: flex; align-items: center; gap: 0.75rem;">
            <span>❓</span> Frequently Asked Questions
          </h3>
          
          <div style="margin-bottom: 1.5rem;">
            <h4 style="margin: 0 0 0.5rem 0; color: var(--text-highlight); font-weight: 600; font-size: 1.05rem;">Is the online CX-3 the same as the physical handheld unit?</h4>
            <p style="margin: 0; color: var(--text-secondary); line-height: 1.5; font-size: 0.92rem;">Yes—the calculator wrapper hosted on this site runs the official CX-3 web emulator hosted by Sporty's. The interface, buttons, modes, and answers are identical to the handheld unit.</p>
          </div>

          <div style="margin-bottom: 1.5rem;">
            <h4 style="margin: 0 0 0.5rem 0; color: var(--text-highlight); font-weight: 600; font-size: 1.05rem;">Can I use this calculator on a mobile phone?</h4>
            <p style="margin: 0; color: var(--text-secondary); line-height: 1.5; font-size: 0.92rem;">Yes. When launched, the browser sizes the popup window perfectly for a standard mobile layout, so it stays responsive and easy to tap.</p>
          </div>

          <div style="margin-bottom: 1.5rem;">
            <h4 style="margin: 0 0 0.5rem 0; color: var(--text-highlight); font-weight: 600; font-size: 1.05rem;">Does it cost anything?</h4>
            <p style="margin: 0; color: var(--text-secondary); line-height: 1.5; font-size: 0.92rem;">No. The E6B CX-3 integration is completely free to use directly in your browser on EasyPL.</p>
          </div>

          <div>
            <h4 style="margin: 0 0 0.5rem 0; color: var(--text-highlight); font-weight: 600; font-size: 1.05rem;">Can I use the CX-3 in the DGCA exam?</h4>
            <p style="margin: 0; color: var(--text-secondary); line-height: 1.5; font-size: 0.92rem;">DGCA Computer Based Exams currently allow the CX-3 (and equivalent electronic flight computers) for the navigation and flight planning papers. Always check the latest DGCA exam guidelines to confirm.</p>
          </div>
        </div>
      </div>
    `;

    document.getElementById('cx3InfoBackBtn').addEventListener('click', onBack);
  },

  // 2c. Render Books selector list (sub-databases under a major subject)
  renderBooks(container, categoryName, subjectsConfig, user, onBookSelect, onBack) {
    const configCategory = categoryName === "Technical General" ? "Technical" : categoryName;
    const matchingSubjects = Object.values(subjectsConfig).filter(sub => sub.category === configCategory);
    const catProg = progress.getCategoryProgress(user.username, categoryName, subjectsConfig);
    
    let bookCardsHTML = '';
    matchingSubjects.forEach(sub => {
      const subProg = progress.getSubjectProgress(user.username, sub.id, sub.chapters.length);
      const graphicSVG = getSubjectGraphic(sub.category || sub.title);
      
      bookCardsHTML += `
        <div class="card card-interactive subject-card animate-fade-in" data-id="${sub.id}">
          <div class="subject-content">
            <div>
              <div class="subject-badge">${sub.chapters.length} Modules / Chapters</div>
              <div class="subject-info">
                <h3>${sub.title}</h3>
              </div>
            </div>
            <div class="progress-container">
              <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: ${subProg.percentComplete}%;"></div>
              </div>
              <div class="progress-text">
                <span>Completed: <strong>${subProg.percentComplete}%</strong></span>
                <span>Accuracy: <strong>${subProg.avgAccuracy}%</strong></span>
              </div>
            </div>
          </div>
          <div class="subject-graphic">
            ${graphicSVG}
          </div>
        </div>
      `;
    });
    
    container.innerHTML = `
      <div class="chapter-list-header animate-fade-in">
        <button class="btn btn-outline" id="backToDashBtn">&larr; Dashboard</button>
        <div style="margin-left: 1rem;">
          <h2 class="text-gradient" style="font-size: 1.8rem;">${categoryName}</h2>
          <span style="font-size: 0.85rem; color: var(--accent); font-family: var(--font-mono); text-transform: uppercase;">DGCA Core Subject</span>
        </div>
      </div>
      
      <!-- Category Progress Info -->
      <div class="card animate-fade-in" style="margin-bottom: 2rem; padding: 1.5rem; border-color: rgba(0, 210, 255, 0.15)">
        <div class="progress-container" style="margin-top: 0;">
          <div class="progress-bar-bg" style="height: 10px;">
            <div class="progress-bar-fill" style="width: ${catProg.percentComplete}%;"></div>
          </div>
          <div class="progress-text" style="font-size: 0.85rem;">
            <span>Subject Completion: <strong>${catProg.percentComplete}%</strong></span>
            <span>Subject Accuracy: <strong>${catProg.avgAccuracy}%</strong></span>
          </div>
        </div>
      </div>
      
      <!-- Books Grid -->
      <h2 class="section-title animate-fade-in">Select Exam Book</h2>
      <div class="subject-grid">
        ${bookCardsHTML}
      </div>

      <!-- Footer -->
      <div class="landing-footer">
        <span>EasyPL Ventures — Keep Learning. Fly Safe.</span>
        <div style="margin-top: 0.5rem; font-size: 0.7rem;">
          Built with ❤️ by <a href="https://www.hughjass.in" target="_blank">HughJass Foundation</a>.
        </div>
      </div>
    `;
    
    // Hook listeners
    document.getElementById('backToDashBtn').addEventListener('click', onBack);
    
    const cards = container.querySelectorAll('.subject-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        onBookSelect(card.dataset.id);
      });
    });
  },

  // 3. Render Chapters selector list
  renderChapters(container, subject, user, onChapterClick, onBack) {
    const progressMap = progress.getChapterProgressMap(user.username, subject.id);
    
    // Map chapters into rows
    let chapterRowsHTML = '';
    subject.chapters.forEach(ch => {
      const chProgress = progressMap[ch.id];
      const hasAttempted = chProgress && chProgress.attemptsCount > 0;
      
      let statusClass = 'status-not-started';
      let statusText = 'NOT STARTED';
      
      if (hasAttempted) {
        const passed = chProgress.highScore >= 70;
        statusClass = passed ? 'status-completed' : 'status-failed';
        statusText = passed ? `PASS (${chProgress.highScore}% SCORE)` : `FAIL (${chProgress.highScore}% SCORE)`;
      }
      
      chapterRowsHTML += `
        <div class="chapter-row animate-fade-in">
          <div class="chapter-title-wrapper">
            <span class="chapter-title">${ch.displayName}</span>
            <span class="chapter-stats">${ch.questionsCount} questions &bull; ${chProgress ? chProgress.attemptsCount : 0} attempts</span>
          </div>
          <div class="chapter-action">
            <span class="badge-status ${statusClass}">${statusText}</span>
            <button class="btn btn-secondary btn-start-chapter" data-id="${ch.id}">Start</button>
          </div>
        </div>
      `;
    });

    const subProg = progress.getSubjectProgress(user.username, subject.id, subject.chapters.length);

    container.innerHTML = `
      <div class="chapter-list-header animate-fade-in">
        <button class="btn btn-outline" id="backToDashBtn">&larr; Books</button>
        <div style="margin-left: 1rem;">
          <h2 class="text-gradient" style="font-size: 1.8rem;">${subject.title}</h2>
          <span style="font-size: 0.85rem; color: var(--accent); font-family: var(--font-mono); text-transform: uppercase;">Category: ${subject.category}</span>
        </div>
      </div>

      <!-- Subject Progress Info -->
      <div class="card animate-fade-in" style="margin-bottom: 2rem; padding: 1.5rem; border-color: rgba(0, 210, 255, 0.15)">
        <div class="progress-container" style="margin-top: 0;">
          <div class="progress-bar-bg" style="height: 10px;">
            <div class="progress-bar-fill" style="width: ${subProg.percentComplete}%;"></div>
          </div>
          <div class="progress-text" style="font-size: 0.8rem;">
            <span>Completed: <strong>${subProg.percentComplete}%</strong></span>
            <span>Average score: <strong>${subProg.avgAccuracy}%</strong></span>
          </div>
        </div>
      </div>

      <!-- Chapters List -->
      <h2 class="section-title animate-fade-in">Select Chapter</h2>
      <div class="chapter-grid">
        ${chapterRowsHTML}
      </div>

      <!-- Footer -->
      <div class="landing-footer">
        <span>EasyPL Ventures — Keep Learning. Fly Safe.</span>
        <div style="margin-top: 0.5rem; font-size: 0.7rem;">
          Built with ❤️ by <a href="https://www.hughjass.in" target="_blank">HughJass Foundation</a>.
        </div>
      </div>
    `;

    // Hook listeners
    document.getElementById('backToDashBtn').addEventListener('click', onBack);
    
    const startBtns = document.querySelectorAll('.btn-start-chapter');
    startBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const chapter = subject.chapters.find(c => c.id === btn.dataset.id);
        onChapterClick(chapter);
      });
    });
  },

  // 4. Render active quiz playing interface (Cockpit HUD Terminal)
  renderQuiz(container, quizData, onOptionClick, onPrev, onNext, onSubmit, onQuitDiscard, onQuitSubmit) {
    const { questionNumber, totalQuestions, questionText, options, imageSrc, selectedAnswerIndex, isAnswered, correctAnswerIndex, mode } = quizData;
    
    // Check if we can perform a partial update instead of rebuilding the entire DOM
    const activeQNumEl = container.querySelector('#activeQuestionNum');
    if (activeQNumEl && parseInt(activeQNumEl.dataset.qnum) === questionNumber) {
      // Same question (just option selection or state change for the same question)
      const optionBtns = container.querySelectorAll('.option-btn');
      optionBtns.forEach((btn) => {
        const idx = parseInt(btn.dataset.idx);
        
        // Reset classes
        btn.className = 'option-btn';
        btn.removeAttribute('disabled');
        
        if (mode === 'test') {
          if (selectedAnswerIndex === idx) {
            btn.classList.add('selected-test');
          }
        } else {
          if (isAnswered) {
            if (idx === correctAnswerIndex) {
              btn.classList.add('show-correct');
            }
            if (selectedAnswerIndex === idx) {
              btn.classList.add(selectedAnswerIndex === correctAnswerIndex ? 'selected-correct' : 'selected-wrong');
            }
            btn.setAttribute('disabled', 'true');
          }
        }
      });
      
      // Update next/submit button states
      const nextBtn = container.querySelector('#quizNextBtn');
      const submitBtn = container.querySelector('#quizSubmitBtn');
      const canNavigate = (mode === 'test') || isAnswered;
      
      if (nextBtn) {
        if (canNavigate) {
          nextBtn.removeAttribute('disabled');
          nextBtn.style.opacity = '';
          nextBtn.style.pointerEvents = '';
        } else {
          nextBtn.setAttribute('disabled', 'true');
          nextBtn.style.opacity = '0.3';
          nextBtn.style.pointerEvents = 'none';
        }
      }
      
      if (submitBtn) {
        if (canNavigate) {
          submitBtn.removeAttribute('disabled');
          submitBtn.style.opacity = '';
          submitBtn.style.pointerEvents = '';
        } else {
          submitBtn.setAttribute('disabled', 'true');
          submitBtn.style.opacity = '0.3';
          submitBtn.style.pointerEvents = 'none';
        }
      }
      return;
    }

    // Generate options HTML list
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    let optionsHTML = '';
    options.forEach((opt, idx) => {
      let stateClass = '';
      let isDisabledAttr = '';
      
      if (mode === 'test') {
        if (selectedAnswerIndex === idx) {
          stateClass = 'selected-test';
        }
      } else {
        if (isAnswered) {
          if (idx === correctAnswerIndex) {
            stateClass = 'show-correct';
          }
          if (selectedAnswerIndex === idx) {
            stateClass = selectedAnswerIndex === correctAnswerIndex ? 'selected-correct' : 'selected-wrong';
          }
          isDisabledAttr = 'disabled';
        }
      }
      
      optionsHTML += `
        <button class="option-btn ${stateClass}" data-idx="${idx}" ${isDisabledAttr}>
          <div class="option-letter">${letters[idx] || (idx + 1)}</div>
          <div class="option-text">${opt}</div>
        </button>
      `;
    });

    const progressPercent = Math.round((questionNumber / totalQuestions) * 100);
    const canNavigate = (mode === 'test') || isAnswered;
    const navDisabledAttr = canNavigate ? '' : 'disabled style="opacity:0.3; pointer-events:none;"';

    container.innerHTML = `
      <div class="quiz-header animate-fade-in">
        <div class="quiz-title-box">
          <span class="quiz-subtitle" id="quizSubTitle">${mode === 'test' ? 'MOCK TEST EXAM' : 'PRACTICE SESSION'}</span>
          <h2 style="font-size: 1.3rem; text-transform: uppercase;" id="quizMainTitle">Question</h2>
        </div>
        <div style="display: flex; align-items: center; gap: 1rem;">
          <div class="timer-box" id="quizTimer">⏱️ Time: 00:00</div>
          <button class="quiz-exit-btn" id="quizExitBtn" aria-label="Exit Quiz">&times;</button>
        </div>
      </div>

      <!-- Question Progress Bar -->
      <div class="quiz-progress-wrapper animate-fade-in">
        <div class="quiz-progress-text">
          <span>Question <strong id="activeQuestionNum" data-qnum="${questionNumber}">${questionNumber}</strong> of <strong>${totalQuestions}</strong></span>
          <span>Exam progress: <strong>${progressPercent}%</strong></span>
        </div>
        <div class="progress-bar-bg" style="height: 8px;">
          <div class="progress-bar-fill" style="width: ${progressPercent}%;"></div>
        </div>
      </div>

      <!-- Question Container -->
      <div class="card question-container animate-fade-in">
        <div class="question-text">${questionText.replace(/\n/g, '<br>')}</div>
        
        ${imageSrc ? `
          <div class="question-image-box">
            <img class="question-image" src="${imageSrc}" alt="Question Image">
          </div>
        ` : ''}
        
        <div class="options-list">
          ${optionsHTML}
        </div>
        
        <!-- Controls buttons -->
        <div class="quiz-controls">
          <button class="btn btn-outline" id="quizPrevBtn" ${questionNumber === 1 ? 'disabled style="opacity:0.25; pointer-events:none;"' : ''}>&larr; Prev Question</button>
          
          ${questionNumber === totalQuestions ? `
            <button class="btn btn-primary" id="quizSubmitBtn" ${navDisabledAttr}>Submit Exam</button>
          ` : `
            <button class="btn btn-secondary" id="quizNextBtn" ${navDisabledAttr}>Next Question &rarr;</button>
          `}
        </div>
      </div>
    `;

    // Hook listeners
    const optionBtns = document.querySelectorAll('.option-btn');
    optionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        onOptionClick(parseInt(btn.dataset.idx));
      });
    });

    document.getElementById('quizPrevBtn').addEventListener('click', onPrev);
    
    document.getElementById('quizExitBtn').addEventListener('click', () => {
      this.showQuitConfirmModal(onQuitSubmit, onQuitDiscard, () => {});
    });
    
    if (questionNumber === totalQuestions) {
      document.getElementById('quizSubmitBtn').addEventListener('click', onSubmit);
    } else {
      document.getElementById('quizNextBtn').addEventListener('click', onNext);
    }
  },

  // 5. Render final scorecard results (Sleek Cockpit Progress Bar Theme)
  renderResults(container, results, onRestart, onDashboard) {
    const { score, totalQuestions, timeTaken, accuracy, questionsReviewed } = results;
    
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;
    const timeDisplay = `${minutes}m ${seconds}s`;
    
    const isPassing = accuracy >= 70;

    const passMessages = [
      "Woohoo! You nailed it!",
      "Hooray! Clear for Takeoff!",
      "Fantastic Job! Test Cleared!",
      "Excellent! Mission Accomplished!",
      "Awesome! You passed with flying colors!",
      "Brilliant! Perfect Flight Path!"
    ];

    const failMessages = [
      "Keep climbing! Try again.",
      "Study harder! Check the manuals.",
      "Checklist incomplete. Study and retry!",
      "Almost there! Run another briefing.",
      "Failure is just a learning loop. Try again!",
      "Adjust your trim and try again!"
    ];

    const headerText = isPassing 
      ? passMessages[Math.floor(Math.random() * passMessages.length)]
      : failMessages[Math.floor(Math.random() * failMessages.length)];
    const headerColor = isPassing ? 'var(--correct)' : 'var(--wrong)';
    const headerGlow = isPassing ? 'var(--correct-glow)' : 'var(--wrong-glow)';

    // Sleek minimal round progress bar
    const strokeDashOffset = 276 - (276 * accuracy) / 100;
    const progressColor = isPassing ? 'var(--correct)' : 'var(--wrong)';
    const progressSVG = `
      <svg class="result-circle-svg" viewBox="0 0 100 100" style="position: absolute; top:0; left:0; width:100%; height:100%; z-index: 1;">
        <defs>
          <filter id="progressArcGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        <!-- Track Circle (Grey background ring) -->
        <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255, 255, 255, 0.05)" stroke-width="4"></circle>
        
        <!-- Progress Arc -->
        <circle cx="50" cy="50" r="44" fill="none" 
                stroke="${progressColor}" 
                stroke-width="5" 
                stroke-linecap="round" 
                stroke-dasharray="276" 
                stroke-dashoffset="${strokeDashOffset}" 
                transform="rotate(-90 50 50)"
                filter="url(#progressArcGlow)">
        </circle>
      </svg>
    `;

    // Filter questions based on activeTab
    const renderFilteredQuestions = (tab) => {
      let filtered = [];
      if (tab === 'all') {
        filtered = questionsReviewed;
      } else if (tab === 'incorrect') {
        filtered = questionsReviewed.filter(q => !q.isCorrect);
      } else if (tab === 'correct') {
        filtered = questionsReviewed.filter(q => q.isCorrect);
      }

      if (filtered.length === 0) {
        return `<p style="text-align: center; color: var(--text-secondary); padding: 2.5rem; font-family: var(--font-mono); font-size: 0.9rem;">NO QUESTIONS TO DISPLAY FOR THIS FILTER.</p>`;
      }

      return filtered.map((q) => {
        // Find index of the question in the original array
        const originalIdx = questionsReviewed.indexOf(q);
        const qNum = originalIdx + 1;
        
        const isCorrect = q.isCorrect;
        const hasAnswered = q.selectedAnswerIndex !== null;
        
        let cardClass = 'wrong-item';
        let badgeClass = 'badge-wrong';
        let statusText = 'Incorrect';
        
        if (isCorrect) {
          cardClass = 'correct-item';
          badgeClass = 'badge-correct';
          statusText = 'Correct';
        } else if (!hasAnswered) {
          cardClass = 'wrong-item';
          badgeClass = 'badge-unanswered';
          statusText = 'Unanswered';
        }

        const selectedText = hasAnswered ? q.options[q.selectedAnswerIndex] : 'NO ANSWER SELECTED';
        const correctText = q.options[q.correctAnswerIndex];

        return `
          <div class="review-question-card ${cardClass} animate-fade-in" style="position: relative;">
            <span class="review-status-badge ${badgeClass}">${statusText}</span>
            <div class="review-question-title">
              <strong style="color: var(--accent); font-family: var(--font-mono); margin-right: 0.5rem;">Q${qNum} //</strong>
              ${q.questionText.replace(/\n/g, '<br>')}
            </div>
            <div class="review-details">
              <span>Your Answer: <strong style="color: ${isCorrect ? 'var(--correct-light)' : (hasAnswered ? 'var(--wrong-light)' : 'var(--hud-amber)')};">${selectedText}</strong></span>
              ${!isCorrect ? `<span>Correct Answer: <strong style="color: var(--correct-light);">${correctText}</strong></span>` : ''}
            </div>
          </div>
        `;
      }).join('');
    };

    container.innerHTML = `
      <div class="results-wrapper card animate-fade-in">
        <h1 style="font-size: 2rem; margin-bottom: 0.5rem; text-transform: uppercase; color: ${headerColor}; text-shadow: 0 0 15px ${headerGlow}; font-weight: 800;">${headerText}</h1>
        <p style="color: var(--text-secondary); font-family: var(--font-mono); font-size: 0.85rem; margin-bottom: 1.5rem; text-transform: uppercase;">
          MODE: <span style="color: var(--accent); font-weight: bold;">${results.mode === 'test' ? 'MOCK TEST EXAM' : 'PRACTICE MODE'}</span> &bull; 
          STATUS: <span style="color: ${isPassing ? 'var(--correct)' : 'var(--wrong)'}; font-weight: bold;">${isPassing ? 'SUCCESS' : 'FAILED'}</span>
        </p>
        
        <!-- Sleek round progress bar score display -->
        <div class="result-circle-box">
          ${progressSVG}
          <div class="result-percentage" style="z-index: 10;">${accuracy}%</div>
          <div class="result-score" style="z-index: 10;">${score} / ${totalQuestions} QUESTIONS</div>
        </div>

        <div class="results-stats-row">
          <div class="result-stat-item">
            <span class="result-stat-label">Time Taken</span>
            <span class="result-stat-value">${timeDisplay}</span>
          </div>
          <div class="result-stat-item">
            <span class="result-stat-label">Status</span>
            <span class="result-stat-value" style="color: ${isPassing ? 'var(--correct)' : 'var(--wrong)'}; text-shadow: 0 0 8px ${isPassing ? 'var(--correct-glow)' : 'var(--wrong-glow)'};">
              ${isPassing ? 'PASS' : 'FAIL'}
            </span>
          </div>
        </div>

        <div style="display: flex; gap: 1rem; justify-content: center; margin-bottom: 2rem;">
          <button class="btn btn-primary" id="restartTestBtn">Retry Exam</button>
          <button class="btn btn-secondary" id="returnDashBtn">Back to Dashboard</button>
        </div>

        <!-- Dynamic Questions Review Analysis -->
        <div class="review-answers-section animate-fade-in">
          <h2 class="section-title">Question Review & Analysis</h2>
          
          <div class="report-tabs">
            <button class="tab-btn active" data-tab="all">All (${questionsReviewed.length})</button>
            <button class="tab-btn" data-tab="incorrect">Incorrect (${questionsReviewed.filter(q => !q.isCorrect).length})</button>
            <button class="tab-btn" data-tab="correct">Correct (${questionsReviewed.filter(q => q.isCorrect).length})</button>
          </div>
          
          <div id="review-list-container" style="display: flex; flex-direction: column; gap: 1rem;">
            ${renderFilteredQuestions('all')}
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="landing-footer">
        <span>EasyPL Ventures — Keep Learning. Fly Safe.</span>
        <div style="margin-top: 0.5rem; font-size: 0.7rem;">
          Built with ❤️ by <a href="https://www.hughjass.in" target="_blank">HughJass Foundation</a>.
        </div>
      </div>
    `;

    // Hook listeners
    document.getElementById('restartTestBtn').addEventListener('click', onRestart);
    document.getElementById('returnDashBtn').addEventListener('click', onDashboard);

    const tabs = container.querySelectorAll('.tab-btn');
    const listContainer = container.querySelector('#review-list-container');
    if (tabs && listContainer) {
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          listContainer.innerHTML = renderFilteredQuestions(tab.dataset.tab);
        });
      });
    }
  },

  // 6. Show overlay modal for practice/test mode selection
  showModeSelectionModal(container, chapterName, onSelect, onCancel) {
    // Create the overlay container
    const overlay = document.createElement('div');
    overlay.className = 'mode-modal-overlay';
    overlay.id = 'modeSelectionModal';
    
    overlay.innerHTML = `
      <div class="mode-modal-card">
        <h2 class="mode-title">Flight Mode Briefing</h2>
        <p class="mode-desc">Select operational mode for <strong>${chapterName}</strong></p>
        
        <div class="mode-options-container">
          <div class="mode-option-box" data-mode="practice">
            <span class="mode-name">Practice Mode</span>
            <span class="mode-detail">Instant correctness feedback. Questions lock upon answer. Ideal for learning.</span>
          </div>
          
          <div class="mode-option-box" data-mode="test">
            <span class="mode-name">Test Mode</span>
            <span class="mode-detail">No correctness cues. Answers can be changed. Report summary at the end.</span>
          </div>
        </div>
        
        <button class="btn btn-outline" id="modeCancelBtn" style="align-self: center; padding: 0.5rem 1.5rem; font-size: 0.85rem;">Cancel</button>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Trigger transition animation
    setTimeout(() => {
      overlay.classList.add('show');
    }, 10);
    
    // Bind option box clicks
    const options = overlay.querySelectorAll('.mode-option-box');
    options.forEach(opt => {
      opt.addEventListener('click', () => {
        const mode = opt.dataset.mode;
        overlay.classList.remove('show');
        setTimeout(() => {
          overlay.remove();
          onSelect(mode);
        }, 300);
      });
    });
    
    // Bind cancel click
    const cancelBtn = overlay.querySelector('#modeCancelBtn');
    cancelBtn.addEventListener('click', () => {
      overlay.classList.remove('show');
      setTimeout(() => {
        overlay.remove();
        onCancel();
      }, 300);
    });
  },

  // 7. Show profile edit modal overlay
  showProfileEditModal(user, onSave, onCancel) {
    const overlay = document.createElement('div');
    overlay.className = 'profile-modal-overlay';
    overlay.id = 'profileEditModal';

    const avatarUrl1 = this.getAvatarUrl('avatar1.png');
    const avatarUrl2 = this.getAvatarUrl('avatar2.png');
    const isAvatar1 = user.avatar === 'avatar1.png';
    const isAvatar2 = user.avatar === 'avatar2.png';

    overlay.innerHTML = `
      <div class="profile-modal-card">
        <h2 class="profile-modal-title">PILOT CREW PROFILE</h2>
        <p class="profile-modal-desc">Update your credentials and select your pilot avatar</p>
        
        <form id="profileEditForm" style="display: flex; flex-direction: column; gap: 1rem; width: 100%;">
          <div class="form-group" style="text-align: left; margin-bottom: 0.75rem;">
            <label class="form-label" for="profileFullName">Full Name</label>
            <input class="form-input" type="text" id="profileFullName" placeholder="Enter full name" value="${user.fullName || ''}" autocomplete="off">
          </div>
          
          <div class="form-group" style="text-align: left; margin-bottom: 0.75rem;">
            <label class="form-label" for="profileEmail">Email Address</label>
            <input class="form-input" type="email" id="profileEmail" placeholder="Enter email address" value="${user.email || ''}" autocomplete="off">
          </div>

          <div class="form-group" style="text-align: left; margin-bottom: 0.75rem;">
            <label class="form-label">Password Settings</label>
            <button class="btn btn-outline" type="button" id="updatePasswordBtn" style="width: 100%; font-size: 0.8rem; padding: 0.6rem 1rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
              🔑 Update Password
            </button>
          </div>
          
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label">Select Pilot Avatar</label>
            <div class="avatar-selector" style="grid-template-columns: repeat(2, 1fr); max-width: 240px; margin: 0.5rem auto 0 auto;">
              <div class="avatar-option ${isAvatar1 ? 'selected' : ''}" data-avatar="avatar1.png" title="Male Pilot (Felix)">
                <img src="${avatarUrl1}" alt="Male Pilot">
              </div>
              <div class="avatar-option ${isAvatar2 ? 'selected' : ''}" data-avatar="avatar2.png" title="Female Pilot (Sara)">
                <img src="${avatarUrl2}" alt="Female Pilot">
              </div>
            </div>
          </div>
          
          <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 0.5rem;">
            <button class="btn btn-outline" type="button" id="profileCancelBtn" style="padding: 0.6rem 1.5rem; font-size: 0.85rem;">Cancel</button>
            <button class="btn btn-primary" type="submit" style="padding: 0.6rem 1.5rem; font-size: 0.85rem;">Save Changes</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);
    
    // Trigger transition animation
    setTimeout(() => {
      overlay.classList.add('show');
    }, 10);

    let tempPassword = '';
    const updatePasswordBtn = overlay.querySelector('#updatePasswordBtn');
    updatePasswordBtn.addEventListener('click', () => {
      this.showPromptModal(
        'Update Password',
        'Enter new password (minimum 6 characters)',
        (newPassword) => {
          if (!newPassword || newPassword.trim().length < 6) {
            this.showAlertModal(
              'Password Error',
              'Password must be at least 6 characters long.'
            );
            return;
          }
          tempPassword = newPassword.trim();
          updatePasswordBtn.textContent = '✅ Password Updated';
          updatePasswordBtn.style.borderColor = 'var(--correct)';
          updatePasswordBtn.style.color = 'var(--correct-light)';
        },
        () => {} // User cancelled
      );
    });

    // Handle avatar selection clicks
    const options = overlay.querySelectorAll('.avatar-option');
    options.forEach(opt => {
      opt.addEventListener('click', () => {
        options.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
      });
    });

    // Handle cancel click
    const cancelBtn = overlay.querySelector('#profileCancelBtn');
    cancelBtn.addEventListener('click', () => {
      overlay.classList.remove('show');
      setTimeout(() => {
        overlay.remove();
        onCancel();
      }, 300);
    });

    // Handle form submit
    const form = overlay.querySelector('#profileEditForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const fullName = document.getElementById('profileFullName').value;
      const email = document.getElementById('profileEmail').value;
      
      let avatar = user.avatar;
      const selected = overlay.querySelector('.avatar-option.selected');
      if (selected) {
        avatar = selected.dataset.avatar;
      }

      const updatedDetails = { fullName, email, avatar };
      if (tempPassword) {
        updatedDetails.password = tempPassword;
      }

      overlay.classList.remove('show');
      setTimeout(() => {
        overlay.remove();
        onSave(updatedDetails);
      }, 300);
    });
  },

  // 8. Show confirmation modal (Yes/No)
  showConfirmModal(title, message, onYes, onNo) {
    const overlay = document.createElement('div');
    overlay.className = 'mode-modal-overlay';
    overlay.id = 'confirmModal';
    overlay.style.zIndex = '1200';

    overlay.innerHTML = `
      <div class="mode-modal-card" style="max-width: 400px; gap: 1.25rem;">
        <h2 class="mode-title" style="color: var(--wrong-light); font-size: 1.35rem;">${title}</h2>
        <p class="mode-desc" style="color: var(--text-primary); font-family: var(--font-mono); font-size: 0.8rem; line-height: 1.5; text-transform: uppercase; margin: 0;">${message}</p>
        
        <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 0.5rem;">
          <button class="btn btn-outline" id="confirmNoBtn" style="padding: 0.6rem 1.5rem; font-size: 0.85rem;">No</button>
          <button class="btn btn-primary" id="confirmYesBtn" style="padding: 0.6rem 1.5rem; font-size: 0.85rem; background: var(--wrong); border-color: var(--wrong);">Yes</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.classList.add('show');
    }, 10);

    overlay.querySelector('#confirmYesBtn').addEventListener('click', () => {
      overlay.classList.remove('show');
      setTimeout(() => {
        overlay.remove();
        onYes();
      }, 300);
    });

    const handleClose = () => {
      overlay.classList.remove('show');
      setTimeout(() => {
        overlay.remove();
        if (onNo) onNo();
      }, 300);
    };

    overlay.querySelector('#confirmNoBtn').addEventListener('click', handleClose);
  },

  // 8.5. Show quit confirmation modal with Save, Discard, and Cancel options
  showQuitConfirmModal(onSave, onDiscard, onCancel) {
    const overlay = document.createElement('div');
    overlay.className = 'mode-modal-overlay';
    overlay.id = 'quitConfirmModal';
    overlay.style.zIndex = '1200';

    overlay.innerHTML = `
      <div class="mode-modal-card" style="max-width: 420px; gap: 1.25rem; position: relative;">
        <button id="modalCloseBtn" style="position: absolute; top: 1rem; right: 1rem; background: transparent; border: none; cursor: pointer; color: var(--text-secondary); font-size: 1.2rem;">✕</button>
        <h2 class="mode-title" style="color: var(--accent); font-size: 1.35rem;">Quit Session</h2>
        <p class="mode-desc" style="color: var(--text-primary); font-family: var(--font-mono); font-size: 0.8rem; line-height: 1.5; text-transform: uppercase; margin: 0;">
          Do you want to save your current score and submit the exam, or discard your progress entirely?
        </p>
        
        <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-top: 0.5rem; width: 100%;">
          <button class="btn btn-primary" id="quitSaveBtn" style="padding: 0.75rem 1.5rem; font-size: 0.95rem; width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
            💾 Save & Submit
          </button>
          <button class="btn btn-outline" id="quitDiscardBtn" style="padding: 0.75rem 1.5rem; font-size: 0.95rem; border-color: rgba(255, 74, 118, 0.4); color: var(--wrong-light); width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
            🗑️ Discard Progress
          </button>
          <button class="btn btn-outline" id="quitCancelBtn" style="padding: 0.75rem 1.5rem; font-size: 0.95rem; width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
            ↩️ Resume Quiz
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.classList.add('show');
    }, 10);

    const closeOverlay = (callback) => {
      overlay.classList.remove('show');
      setTimeout(() => {
        overlay.remove();
        if (callback) callback();
      }, 300);
    };

    overlay.querySelector('#quitSaveBtn').addEventListener('click', () => {
      closeOverlay(onSave);
    });

    overlay.querySelector('#quitDiscardBtn').addEventListener('click', () => {
      closeOverlay(onDiscard);
    });

    overlay.querySelector('#quitCancelBtn').addEventListener('click', () => {
      closeOverlay(onCancel);
    });
    
    overlay.querySelector('#modalCloseBtn').addEventListener('click', () => {
      closeOverlay(onCancel);
    });
  },

  // 8.6. Show alert modal
  showAlertModal(title, message, onClose) {
    const overlay = document.createElement('div');
    overlay.className = 'mode-modal-overlay';
    overlay.id = 'alertModal';
    overlay.style.zIndex = '1400'; // High z-index to overlay on top of any other modal

    overlay.innerHTML = `
      <div class="mode-modal-card" style="max-width: 400px; gap: 1.25rem;">
        <h2 class="mode-title" style="color: var(--wrong-light); font-size: 1.35rem;">${title}</h2>
        <p class="mode-desc" style="color: var(--text-primary); font-family: var(--font-mono); font-size: 0.8rem; line-height: 1.5; text-transform: uppercase; margin: 0;">${message}</p>
        
        <div style="display: flex; justify-content: center; margin-top: 0.5rem;">
          <button class="btn btn-primary" id="alertOkBtn" style="padding: 0.6rem 2rem; font-size: 0.85rem;">OK</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.classList.add('show');
    }, 10);

    overlay.querySelector('#alertOkBtn').addEventListener('click', () => {
      overlay.classList.remove('show');
      setTimeout(() => {
        overlay.remove();
        if (onClose) onClose();
      }, 300);
    });
  },

  // 8.7. Show prompt modal
  showPromptModal(title, placeholder, onSubmit, onCancel) {
    const overlay = document.createElement('div');
    overlay.className = 'mode-modal-overlay';
    overlay.id = 'promptModal';
    overlay.style.zIndex = '1300'; // High z-index to overlay on profile edit modal

    overlay.innerHTML = `
      <div class="mode-modal-card" style="max-width: 400px; gap: 1.25rem;">
        <h2 class="mode-title" style="color: var(--accent); font-size: 1.35rem;">${title}</h2>
        <div class="form-group" style="text-align: left; width: 100%;">
          <input class="form-input" type="password" id="promptInput" placeholder="${placeholder}" style="width: 100%;" autocomplete="new-password">
        </div>
        
        <div style="display: flex; gap: 1rem; justify-content: center; width: 100%;">
          <button class="btn btn-outline" id="promptCancelBtn" style="padding: 0.6rem 1.5rem; font-size: 0.85rem;">Cancel</button>
          <button class="btn btn-primary" id="promptSubmitBtn" style="padding: 0.6rem 1.5rem; font-size: 0.85rem;">Submit</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    
    // Focus the input
    setTimeout(() => {
      overlay.classList.add('show');
      overlay.querySelector('#promptInput').focus();
    }, 10);

    const closeOverlay = (callback) => {
      overlay.classList.remove('show');
      setTimeout(() => {
        overlay.remove();
        if (callback) callback();
      }, 300);
    };

    overlay.querySelector('#promptSubmitBtn').addEventListener('click', () => {
      const val = overlay.querySelector('#promptInput').value;
      closeOverlay(() => onSubmit(val));
    });

    overlay.querySelector('#promptCancelBtn').addEventListener('click', () => {
      closeOverlay(onCancel);
    });

    // Support enter key on input
    overlay.querySelector('#promptInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const val = overlay.querySelector('#promptInput').value;
        closeOverlay(() => onSubmit(val));
      }
    });
  },

  // 9. Show daily random question briefing challenge (Aviation Trivia)
  showRandomQuestionModal(questionData, onAnswer, onClose) {
    const overlay = document.createElement('div');
    overlay.className = 'mode-modal-overlay';
    overlay.id = 'challengeModal';
    overlay.style.zIndex = '1150';

    overlay.innerHTML = `
      <div class="mode-modal-card" style="max-width: 550px; text-align: left; padding: 2rem; max-height: 90vh; overflow-y: auto; gap: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed var(--border); padding-bottom: 0.75rem; margin-bottom: 0.25rem;">
          <h2 class="mode-title" style="font-size: 1.15rem; color: var(--accent); display: flex; align-items: center; gap: 0.5rem; margin: 0;">
            ✈️ Aviation Trivia
          </h2>
          <button class="btn btn-outline" id="challengeCloseBtn" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; border-color: transparent; background: transparent; cursor: pointer; color: var(--text-secondary);">
            ✕
          </button>
        </div>
        
        <p style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-secondary); margin: 0; text-transform: uppercase; letter-spacing: 0.05em;">
          Subject: <span style="color: var(--accent); font-weight: bold;">${questionData.subjectTitle}</span> &bull; Chapter: <span>${questionData.chapterTitle}</span>
        </p>
        
        <div style="font-size: 0.98rem; color: var(--text-highlight); font-weight: 600; line-height: 1.45; margin-bottom: 0.25rem; font-family: var(--font-body);">
          ${questionData.questionText}
        </div>
        
        ${questionData.imageSrc ? `
          <div style="text-align: center; margin-bottom: 0.5rem; max-height: 180px; overflow: hidden; border: 1px solid var(--border); border-radius: 6px; background: rgba(0, 0, 0, 0.2);">
            <img src="${questionData.imageSrc}" alt="Challenge Reference" style="max-height: 180px; max-width: 100%; object-fit: contain;">
          </div>
        ` : ''}
        
        <div style="display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 0.5rem; width: 100%;">
          ${questionData.options.map((opt, idx) => `
            <button class="option-btn" data-idx="${idx}" style="padding: 0.75rem 1.1rem; font-size: 0.85rem; width: 100%;">
              <span class="option-letter" style="display: inline-block; width: 20px; height: 20px; line-height: 20px; text-align: center; border-radius: 4px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); font-family: var(--font-mono); font-size: 0.75rem; font-weight: bold; margin-right: 0.5rem;">
                ${['A', 'B', 'C', 'D', 'E', 'F'][idx]}
              </span>
              <span class="option-text">${opt}</span>
            </button>
          `).join('')}
        </div>

        <!-- Explanation Container (Initially Hidden) -->
        <div id="challengeExplanationBox" style="display: none; margin-top: 0.5rem; padding: 1.25rem; border-radius: 8px; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.02); font-family: var(--font-body); font-size: 0.88rem; line-height: 1.5; animation: fadeIn 0.4s ease-out;">
        </div>
        
        <div style="display: flex; justify-content: flex-end; gap: 0.75rem; border-top: 1px dashed var(--border); padding-top: 1rem; margin-top: 0.5rem; width: 100%;">
          <button class="btn btn-outline" id="challengeSkipBtn" style="padding: 0.5rem 1.2rem; font-size: 0.8rem;">Skip Challenge</button>
          <button class="btn btn-primary" id="challengeSubmitBtn" style="padding: 0.5rem 1.2rem; font-size: 0.8rem;" disabled>Submit Answer</button>
          <button class="btn btn-primary" id="challengeDoneBtn" style="padding: 0.5rem 1.2rem; font-size: 0.8rem; display: none;">Continue</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.classList.add('show');
    }, 10);

    let selectedIdx = null;
    const optionBtns = overlay.querySelectorAll('.option-btn');
    const submitBtn = overlay.querySelector('#challengeSubmitBtn');

    // Handle option selection
    optionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (submitBtn.style.display === 'none') return; // Already submitted

        selectedIdx = parseInt(btn.dataset.idx);

        optionBtns.forEach(b => b.classList.remove('selected-test'));
        btn.classList.add('selected-test');

        submitBtn.removeAttribute('disabled');
      });
    });

    // Handle submit answer
    submitBtn.addEventListener('click', () => {
      if (selectedIdx === null) return;

      const correctIdx = questionData.correctAnswerIndex;
      const isCorrect = selectedIdx === correctIdx;

      optionBtns.forEach(b => {
        b.setAttribute('disabled', 'true');
        b.classList.remove('selected-test');
        const bIdx = parseInt(b.dataset.idx);
        if (bIdx === correctIdx) {
          b.classList.add('show-correct');
        }
      });

      if (isCorrect) {
        optionBtns[selectedIdx].classList.add('selected-correct');
      } else {
        optionBtns[selectedIdx].classList.add('selected-wrong');
      }

      // Generate explanation dynamically based on context/keywords
      const explanation = generateExplanation(
        questionData.questionText,
        questionData.options,
        correctIdx,
        questionData.subjectTitle
      );

      const expBox = overlay.querySelector('#challengeExplanationBox');
      expBox.innerHTML = `
        <div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--accent); font-weight: bold; text-transform: uppercase; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.35rem;">
          💡 Explanation
        </div>
        <div style="color: var(--text-primary);">${explanation}</div>
      `;
      expBox.style.display = 'block';

      // Toggle action buttons
      submitBtn.style.display = 'none';
      overlay.querySelector('#challengeSkipBtn').style.display = 'none';
      overlay.querySelector('#challengeDoneBtn').style.display = 'block';

      onAnswer(isCorrect);
    });

    const handleClose = () => {
      overlay.classList.remove('show');
      setTimeout(() => {
        overlay.remove();
        onClose();
      }, 300);
    };

    overlay.querySelector('#challengeCloseBtn').addEventListener('click', handleClose);
    overlay.querySelector('#challengeSkipBtn').addEventListener('click', handleClose);
    overlay.querySelector('#challengeDoneBtn').addEventListener('click', handleClose);
  }
};

// Helper function to generate explanations dynamically for the random question challenge
const generateExplanation = (questionText, options, answerIndex, subjectTitle) => {
  const answerText = options[answerIndex];
  const qStr = questionText.toLowerCase();
  
  // Specific high-fidelity aviation explanations
  if (qStr.includes('gym') || qStr.includes('workout') || qStr.includes('hyperventilation')) {
    return "During physical exertion, muscle activity increases carbon dioxide (CO₂) production. The rising CO₂ concentration in the blood triggers the brain's respiratory center to increase breathing depth and frequency. If this response is excessive, it leads to hyperventilation (over-breathing), which expels carbon dioxide and can cause respiratory alkalosis.";
  }
  if (qStr.includes('density') && qStr.includes('poles')) {
    return "Air density is inversely proportional to temperature. Since polar regions are significantly colder than equatorial regions, the air at the poles is colder, heavier, and more compressed. Therefore, at sea level, air density is higher at the poles than at the equator.";
  }
  if (qStr.includes('density altitude') || qStr.includes('density-altitude')) {
    return "Density altitude is pressure altitude corrected for non-standard temperature. High temperatures expand the air, reducing its density. This corresponds to a higher density altitude, which degrades aerodynamic lift and engine performance.";
  }
  if (qStr.includes('coriolis')) {
    return "The Coriolis force is an apparent deflection of moving air caused by the Earth's rotation. It deflects air flow to the right in the Northern Hemisphere and to the left in the Southern Hemisphere. The force is directly proportional to wind speed and sine of latitude, making it maximum at the poles and zero at the equator.";
  }
  if (qStr.includes('dew point') || qStr.includes('relative humidity') || qStr.includes('dewpoint')) {
    return "Dew point is the temperature at which air becomes fully saturated and condensation begins. When the air temperature cools to the dew point temperature, the relative humidity reaches 100%, leading to condensation, dew, or cloud formation.";
  }
  if (qStr.includes('radiation fog')) {
    return "Radiation fog forms over land on clear, calm nights when the Earth's surface cools rapidly by longwave radiation. It requires light wind (2–5 knots) to mix the cold air and high relative humidity near the surface.";
  }
  if (qStr.includes('advection fog')) {
    return "Advection fog forms when warm, moist air moves horizontally over a cold surface, cooling the air to its dew point. Unlike radiation fog, it can form under stronger winds and is common in coastal/maritime areas.";
  }
  if (qStr.includes('fog') || qStr.includes('haze')) {
    return "Fog is defined as water droplets suspended in the air near the surface that reduce horizontal visibility to less than 1 km. It typically forms when the temperature-dewpoint spread is narrow (within 2°C) and condensation nuclei are present.";
  }
  if (qStr.includes('thunderstorm') || qStr.includes('cumulonimbus')) {
    return "A thunderstorm (cumulonimbus cloud) requires three essential ingredients: instability (to allow rising air), abundant moisture, and a lifting mechanism (like a frontal boundary, mountain, or solar heating) to trigger the updraft.";
  }
  if (qStr.includes('icao') || qStr.includes('annex') || qStr.includes('chicago convention')) {
    return "International air regulations are standardized under the ICAO (International Civil Aviation Organization) Chicago Convention. Member states align their national aviation laws (such as DGCA requirements in India) with ICAO Annexes to ensure global safety and inter-operability.";
  }
  if (qStr.includes('hypoxia')) {
    return "Hypoxia is a physiological state where the body's tissues are deprived of adequate oxygen supply. At altitude, this is caused by the reduced partial pressure of oxygen in the ambient air, making it harder for hemoglobin to bind and transport oxygen.";
  }
  if (qStr.includes('carbon monoxide') || qStr.includes('co poisoning')) {
    return "Carbon monoxide (CO) is a highly toxic, colorless, and odorless gas. It binds to the hemoglobin in red blood cells with an affinity roughly 200 times greater than oxygen, blocking oxygen transport and causing rapid, subtle hypoxia.";
  }
  if (qStr.includes('spool') || qStr.includes('twin-spool') || qStr.includes('compressor spool')) {
    return "In a multi-spool (twin-spool) gas turbine engine, each spool consists of a turbine stage connected to a compressor stage via concentric, independently rotating shafts. The Low Pressure (LP) Turbine is connected to and drives the LP Compressor, while the High Pressure (HP) Turbine is connected to and drives the HP Compressor. This optimizes compressor efficiency across different RPMs.";
  }
  if (qStr.includes('constant speed') || qStr.includes('constant-speed') || qStr.includes('governor') || qStr.includes('propeller blade pitch')) {
    return "A constant-speed propeller system uses a governor (CSU) to automatically adjust the blade pitch using oil pressure. This maintains a constant engine RPM selected by the pilot, allowing the engine to operate at its most efficient speed throughout all flight phases.";
  }
  if (qStr.includes('supercharger') || qStr.includes('turbocharger') || qStr.includes('wastegate')) {
    return "Superchargers and turbochargers compress intake air to maintain engine manifold pressure at high altitudes. A supercharger is mechanically driven by the crankshaft, whereas a turbocharger is driven by engine exhaust gases and regulated by a wastegate.";
  }
  if (qStr.includes('octane') || qStr.includes('detonation') || qStr.includes('pre-ignition') || qStr.includes('preignition')) {
    return "Detonation is the uncontrolled, explosive ignition of the fuel-air mixture inside the cylinder, usually caused by low octane fuel or excessive temperatures. Pre-ignition is the premature ignition of the mixture before the spark plug fires, typically caused by hot spots like carbon deposits.";
  }
  if (qStr.includes('carburetor icing') || qStr.includes('carb icing') || qStr.includes('venturi')) {
    return "Carburetor icing occurs inside the venturi due to fuel vaporization cooling and pressure drops. It can occur in temperatures up to +30°C under high humidity, and is indicated by a drop in manifold pressure (constant speed prop) or RPM (fixed pitch prop).";
  }
  if (qStr.includes('fuel injection') || qStr.includes('injector')) {
    return "Fuel injection systems spray vaporized fuel directly into the intake port or cylinder head, eliminating the carburetor venturi throat and its associated icing risk, while providing more uniform fuel distribution and improved efficiency.";
  }
  if (qStr.includes('vibrat') && (qStr.includes('altimeter') || qStr.includes('linkage') || qStr.includes('friction') || qStr.includes('stiction'))) {
    return "The vibrating device (or vibrator) in a mechanical altimeter is designed to continuously tap the instrument casing or internal gear linkages. This reduces static friction (stiction) in the mechanical pivots, enabling the pointers to move smoothly and respond immediately to slight changes in static pressure.";
  }
  if (qStr.includes('hysteresis') || qStr.includes('elastic lag') || qStr.includes('elastic lag error')) {
    return "Hysteresis (elastic lag) in an altimeter is caused by the delay in the expansion or contraction of the aneroid capsule after a rapid change in altitude. Because the capsule metal takes time to return to its equilibrium shape, the altimeter displays a small lag error.";
  }
  if (qStr.includes('static port') && (qStr.includes('block') || qStr.includes('clog')) && qStr.includes('altimeter')) {
    return "When the static port is blocked, pressure inside the altimeter casing remains sealed at the altitude where the blockage occurred. The altimeter will freeze and continue to show that altitude, regardless of climbs or descents.";
  }
  if (qStr.includes('pitot') && (qStr.includes('block') || qStr.includes('clog')) && (qStr.includes('airspeed') || qStr.includes('indicator') || qStr.includes('asi'))) {
    return "If the pitot tube's pressure entry port blocks while its drain hole remains open, dynamic pressure drops to zero and the airspeed indicator (ASI) drops to zero. If both entry and drain block, the ASI will act like an altimeter, reading higher as the aircraft climbs and lower as it descends.";
  }
  if (qStr.includes('gyro') || qStr.includes('precession') || qStr.includes('rigidity')) {
    return "Gyroscopic flight instruments rely on two fundamental properties: Rigidity in Space (resisting forces to maintain axis direction) and Precession (the deflection of the rotor axis 90 degrees in the direction of rotation when a force is applied).";
  }
  if (qStr.includes('qnh') || qStr.includes('qfe') || qStr.includes('qne') || qStr.includes('altimeter setting') || qStr.includes('subscale')) {
    return "QNH is the barometric pressure setting which, when dialed into the altimeter subscale, causes the altimeter to indicate altitude above mean sea level. Standard altimeter setting for transitioning into flight levels is 1013.2 hPa / 29.92 inHg.";
  }

  // Clean up question text for synthesis display
  let cleanQ = questionText.trim();
  if (!cleanQ.endsWith('?') && !cleanQ.endsWith('.') && !cleanQ.endsWith(':')) {
    cleanQ += '...';
  }

  // Subject-specific fallbacks dynamically matching the question and correct answer
  const subTitleLower = (subjectTitle || '').toLowerCase();
  
  if (subTitleLower.includes('met')) {
    return `For the meteorology question: <em>"${cleanQ}"</em>, the correct answer is <strong>"${answerText}"</strong>. This concept relates to atmospheric dynamics, pressure gradients, and meteorological reporting procedures.`;
  }
  if (subTitleLower.includes('reg') || subTitleLower.includes('rule') || subTitleLower.includes('law')) {
    return `For the regulations question: <em>"${cleanQ}"</em>, the correct answer is <strong>"${answerText}"</strong>. This is a regulatory standard established to coordinate flight safety, air traffic operations, and pilot licensing requirements.`;
  }
  if (subTitleLower.includes('nav') || subTitleLower.includes('plot') || subTitleLower.includes('rkb') || subTitleLower.includes('bali')) {
    return `For the navigation question: <em>"${cleanQ}"</em>, the correct answer is <strong>"${answerText}"</strong>. This governs flight planning calculations, courses, heading correction, or chart coordinates.`;
  }
  if (subTitleLower.includes('tech') || subTitleLower.includes('engine') || subTitleLower.includes('system') || subTitleLower.includes('aircraft')) {
    return `For the technical systems question: <em>"${cleanQ}"</em>, the correct answer is <strong>"${answerText}"</strong>. This is a technical design requirement for aircraft powerplants, structural systems, or instruments to verify airworthiness.`;
  }
  
  return `Regarding the aviation question: <em>"${cleanQ}"</em>, the correct choice is <strong>"${answerText}"</strong>. This concept is essential to support flight safety, operational decision-making, and pilot theory preparation.`;
};
