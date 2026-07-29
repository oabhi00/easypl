/**
 * UI Rendering Module
 * Builds and inserts DOM layouts for all application views with an aviation cockpit HUD theme
 */

import { progress } from './progress.js';
import { parseMETAR } from './metarParser.js';
import { parseTAF, decodeTAFGroup } from './tafParser.js';
import { calculateHoldingPattern } from './holdingCalculator.js';

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
  renderLanding(container, onStart, onLogin, onToolsClick, onCX3Click, onMETARClick, onTAFClick, onHoldingClick) {
    const metSVG = getSubjectGraphic('Meteorology');
    const navSVG = getSubjectGraphic('Navigation');
    const techSVG = getSubjectGraphic('Technical');
    const regSVG = getSubjectGraphic('Regulations');
    const a320SVG = getSubjectGraphic('A320');
    const c172SVG = getSubjectGraphic('C172');
    const airlineSVG = getSubjectGraphic('Airline');
    const rtrSVG = getSubjectGraphic('Radio');

    const titles = [
      "Clear Your DGCA & Airline Exams",
      "Ace Your DGCA & CPL Exams",
      "Master Your Aviation Theory Exams",
      "Your Flight Deck to Pass DGCA",
      "Command Your Aviation Pilot Exams",
      "Prep Smart, Fly Safe, Pass Easy"
    ];
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];

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
            <h1 class="hero-title text-gradient">${randomTitle}</h1>
            <p class="hero-description">
              Access over <strong>30,000+ questions</strong> covering every aviation topic. From core DGCA pilot subjects to type ratings like Airbus A320, Cessna 172, Radio Telephony (RTR-A), and comprehensive airline preparation exams.
            </p>
            <div class="hero-actions">
              <button class="btn btn-primary" id="engageCockpitBtn" style="padding: 0.9rem 2.2rem; font-size: 1rem; letter-spacing: 0.05em; box-shadow: 0 0 20px var(--accent-glow);">
                Start Practicing
              </button>
              <button class="btn btn-outline" id="exploreSystemsBtn" style="padding: 0.9rem 1.8rem; font-size: 0.9rem;">
                Aviation Tools
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
          window.open('cx3/index.html', 'CX3_Calculator', `width=380,height=750,left=${popupLeft},top=50,status=no,menubar=no,toolbar=no,location=no,scrollbars=yes,resizable=yes`);
          if (onCX3Click) onCX3Click();
        } else if (toolId === 'metar') {
          if (onMETARClick) onMETARClick();
        } else if (toolId === 'taf') {
          if (onTAFClick) onTAFClick();
        } else if (toolId === 'holding') {
          if (onHoldingClick) onHoldingClick();
        } else {
          onToolsClick();
        }
      });
    });
  }
  
  document.getElementById('exploreSystemsBtn').addEventListener('click', () => {
    ui.showAviationToolsModal(onCX3Click, onMETARClick, onTAFClick, onHoldingClick);
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

              <!-- Question Search Link -->
              <div class="drawer-nav-item clickable" id="drawerSearchLink">
                <svg class="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <span>Search Questions</span>
              </div>

              <!-- Profile Link -->
              <div class="drawer-nav-item clickable" id="drawerProfileLink">
                <svg class="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>Profile Settings</span>
              </div>

              <!-- Clear Stats Link -->
              <div class="drawer-nav-item clickable" id="drawerClearStatsLink" style="margin-top: 2rem; border-top: 1px dashed rgba(255, 255, 255, 0.08); padding-top: 1rem; color: var(--wrong-light);">
                <svg class="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--wrong);">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                <span>Clear Stats</span>
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
        <div class="card stat-card card-interactive" data-stat="attempts">
          ${statIcons.attempts}
          <div class="stat-value">${stats.totalAttempts}</div>
          <div class="stat-label">Tests Attempted</div>
        </div>
        <div class="card stat-card card-interactive" data-stat="accuracy">
          ${statIcons.accuracy}
          <div class="stat-value">${stats.averageAccuracy}%</div>
          <div class="stat-label">Average Score</div>
        </div>
        <div class="card stat-card card-interactive" data-stat="time">
          ${statIcons.time}
          <div class="stat-value">${timeDisplay}</div>
          <div class="stat-label">Study Time</div>
        </div>
        <div class="card stat-card card-interactive" data-stat="questions">
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

      // Redirect drawer "Search Questions" click
      const drawerSearchLink = document.getElementById('drawerSearchLink');
      if (drawerSearchLink) {
        drawerSearchLink.addEventListener('click', () => {
          closeDrawer();
          setTimeout(() => {
            this.showQuestionSearchModal();
          }, 300);
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

      // Redirect drawer "Clear Stats" click
      const drawerClearStatsLink = document.getElementById('drawerClearStatsLink');
      if (drawerClearStatsLink && onClearAttempts) {
        drawerClearStatsLink.addEventListener('click', () => {
          closeDrawer();
          setTimeout(() => {
            this.showConfirmModal(
              "Clear Flight History",
              "Are you sure you want to permanently clear all your recent exam attempts?",
              onClearAttempts
            );
          }, 300);
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

    const statCards = container.querySelectorAll('.stat-card');
    statCards.forEach(card => {
      card.addEventListener('click', () => {
        const statType = card.dataset.stat;
        this.showStatsDetailModal(statType, user.username, subjects);
      });
    });

    const reattemptBtns = container.querySelectorAll('.btn-reattempt');
    reattemptBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        onReattempt(btn.dataset.subjectId, btn.dataset.chapterId);
      });
    });

    // Setup global listeners and automatic scheduling for the flying jet easter egg
    window.triggerJetFlyby = () => this.triggerJetFlyby();

    if (!window.hasFlyingJetListeners) {
      window.hasFlyingJetListeners = true;
      
      document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key === 'f' || e.key === 'F') {
          if (document.body.classList.contains('view-dashboard') || document.body.classList.contains('view-tools')) {
            if (typeof window.triggerJetFlyby === 'function') {
              window.triggerJetFlyby();
            }
          }
        }
      });
      
      const scheduleNextFlyby = () => {
        const delay = Math.floor(Math.random() * 20000) + 20000; // random 20s to 40s interval
        setTimeout(() => {
          if (document.body.classList.contains('view-dashboard') || document.body.classList.contains('view-tools')) {
            if (typeof window.triggerJetFlyby === 'function') {
              window.triggerJetFlyby();
            }
          }
          scheduleNextFlyby();
        }, delay);
      };
      scheduleNextFlyby();
    }
  },

  // 2b. Render Dedicated Aviation Tools Dashboard View
  renderToolsDashboard(container, user, onSubjectClick, onLogout, onProfile, onDashboardClick, onCX3Click, onMETARClick, onTAFClick, onHoldingClick) {
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

              <!-- Question Search Link -->
              <div class="drawer-nav-item clickable" id="drawerSearchLink">
                <svg class="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <span>Search Questions</span>
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

      // Redirect drawer "Search Questions" click
      const drawerSearchLink = document.getElementById('drawerSearchLink');
      if (drawerSearchLink) {
        drawerSearchLink.addEventListener('click', () => {
          closeDrawer();
          setTimeout(() => {
            this.showQuestionSearchModal();
          }, 300);
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

      // Bind click events on the drawer tool cards
      const drawerToolCards = document.querySelectorAll('.drawer-tool-card');
      drawerToolCards.forEach(card => {
        card.addEventListener('click', () => {
          const toolId = card.dataset.tool || '';
          const toolName = card.querySelector('h4').textContent;
          closeDrawer();
          setTimeout(() => {
            if (toolId === 'cx3') {
              const popupLeft = screen.width - 410;
              window.open('cx3/index.html', 'CX3_Calculator', `width=380,height=750,left=${popupLeft},top=50,status=no,menubar=no,toolbar=no,location=no,scrollbars=yes,resizable=yes`);
              if (onCX3Click) onCX3Click();
            } else if (toolId === 'metar') {
              if (onMETARClick) onMETARClick();
            } else if (toolId === 'taf') {
              if (onTAFClick) onTAFClick();
            } else if (toolId === 'holding') {
              if (onHoldingClick) onHoldingClick();
            } else {
              this.showAlertModal(
                toolName,
                `${toolName} tool will be fully integrated as an interactive utility in a later flight training phase.`
              );
            }
          }, 300);
        });
      });
    }

    // Bind alerts on clicking tools grid cards in Tools Dashboard
    const toolDashboardCards = container.querySelectorAll('.tool-dashboard-card');
    toolDashboardCards.forEach(card => {
      card.addEventListener('click', () => {
        const toolId = card.dataset.tool || '';
        const toolName = card.querySelector('h3').textContent;
        if (toolId === 'cx3') {
          const popupLeft = screen.width - 410;
          window.open('cx3/index.html', 'CX3_Calculator', `width=380,height=750,left=${popupLeft},top=50,status=no,menubar=no,toolbar=no,location=no,scrollbars=yes,resizable=yes`);
          if (onCX3Click) onCX3Click();
        } else if (toolId === 'metar') {
          if (onMETARClick) onMETARClick();
        } else if (toolId === 'taf') {
          if (onTAFClick) onTAFClick();
        } else if (toolId === 'holding') {
          if (onHoldingClick) onHoldingClick();
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

  // 2b-3. Render METAR Decoder View
  renderMETARDecoder(container, user, onBack) {
    container.innerHTML = `
      <div class="dashboard-header animate-fade-in">
        <div style="display: flex; align-items: center; gap: 1.25rem;">
          <button class="btn btn-outline" id="metarDecoderBackBtn" style="padding: 0.5rem 1.25rem; display: flex; align-items: center; gap: 0.5rem; font-weight: 600;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back
          </button>
        </div>
      </div>

      <div class="cx3-info-content animate-fade-in" style="max-width: 900px; margin: 2rem auto; padding: 0 1rem; color: var(--text-primary);">
        <header style="margin-bottom: 2rem;">
          <h1 style="font-size: 2.2rem; font-weight: 800; font-family: var(--font-display); color: var(--text-highlight); margin-bottom: 0.5rem;">METAR Weather Decoder</h1>
          <p style="font-size: 1rem; color: var(--text-secondary); margin: 0;">
            Enter an ICAO code (e.g. VIDP, KJFK, EGLL) to fetch live reports, or paste a raw METAR string to translate it instantly.
          </p>
        </header>

        <!-- Decoder Input Box -->
        <div class="card" style="padding: 1.5rem; margin-bottom: 2rem; border-radius: 12px;">
          <div style="display: flex; gap: 0.75rem;">
            <input type="text" id="metarInput" placeholder="e.g. VIDP or METAR KJFK 121651Z 18004KT..." style="flex: 1; padding: 0.75rem 1rem; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-secondary); color: var(--text-primary); font-size: 0.95rem; outline: none;" />
            <button class="btn btn-primary" id="metarDecodeBtn" style="padding: 0.75rem 1.5rem; font-weight: 600;">Decode</button>
          </div>
          <div id="metarError" style="color: var(--destructive); font-size: 0.85rem; margin-top: 0.5rem; display: none;"></div>
        </div>

        <!-- Decoder Results Area -->
        <div id="metarResults" style="display: none; margin-bottom: 2rem;"></div>

        <!-- What is a METAR -->
        <div class="card" style="padding: 2rem; margin-bottom: 2rem; border-radius: 12px;">
          <h3 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 1rem; color: var(--text-highlight); display: flex; align-items: center; gap: 0.75rem;">
            <span>🌩️</span> What is a METAR?
          </h3>
          <p style="line-height: 1.6; color: var(--text-secondary); margin: 0; font-size: 0.95rem;">
            A METAR is a routine weather report updated hourly. It makes pilots and aviation professionals aware of the current weather situation at a specific airfield. It provides wind speed/direction, visibility, cloud cover, temperature, dew point, and atmospheric pressure.
          </p>
        </div>

        <!-- Why Use a METAR Decoder -->
        <div class="card" style="padding: 2rem; margin-bottom: 2rem; border-radius: 12px;">
          <h3 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 1rem; color: var(--text-highlight); display: flex; align-items: center; gap: 0.75rem;">
            <span>💡</span> Why Use a METAR Decoder?
          </h3>
          <p style="line-height: 1.6; color: var(--text-secondary); margin-bottom: 1.25rem; font-size: 0.95rem;">
            Reading METARs manually takes time and practice. A METAR decoder tool helps you:
          </p>
          <ul style="margin: 0; padding-left: 1.2rem; color: var(--text-secondary); line-height: 1.6; font-size: 0.95rem;">
            <li style="margin-bottom: 0.5rem;">Translate coded weather strings instantly into plain English.</li>
            <li style="margin-bottom: 0.5rem;">Save time during route flight planning.</li>
            <li style="margin-bottom: 0.5rem;">Avoid critical mistakes in interpreting severe weather conditions.</li>
            <li>Learn the remarks codes by comparing side-by-side.</li>
          </ul>
        </div>

        <!-- Frequently Asked Questions -->
        <div class="card" style="padding: 2rem; border-radius: 12px; margin-bottom: 4rem;">
          <h3 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 1.5rem; color: var(--text-highlight); display: flex; align-items: center; gap: 0.75rem;">
            <span>❓</span> Frequently Asked Questions
          </h3>
          
          <div style="margin-bottom: 1.5rem;">
            <h4 style="margin: 0 0 0.5rem 0; color: var(--text-highlight); font-weight: 600; font-size: 1.05rem;">How is a METAR different from a TAF?</h4>
            <p style="margin: 0; color: var(--text-secondary); line-height: 1.5; font-size: 0.92rem;">A METAR reports what the weather is doing right now. A TAF (Terminal Aerodrome Forecast) is a forecast of expected weather conditions over the next 24 to 30 hours.</p>
          </div>

          <div style="margin-bottom: 1.5rem;">
            <h4 style="margin: 0 0 0.5rem 0; color: var(--text-highlight); font-weight: 600; font-size: 1.05rem;">What does the flight category (VFR / MVFR / IFR / LIFR) mean?</h4>
            <p style="margin: 0; color: var(--text-secondary); line-height: 1.5; font-size: 0.92rem;">Flight category is a quick summary of an airfield's usability based on visibility and cloud ceilings. VFR indicates visibility > 5 SM and ceiling > 3,000 ft. LIFR is visibility < 1 SM or ceiling < 500 ft.</p>
          </div>

          <div>
            <h4 style="margin: 0 0 0.5rem 0; color: var(--text-highlight); font-weight: 600; font-size: 1.05rem;">Where does live data come from?</h4>
            <p style="margin: 0; color: var(--text-secondary); line-height: 1.5; font-size: 0.92rem;">Live METAR & TAF weather reports are fetched directly from NOAA's Aviation Weather Center (aviationweather.gov).</p>
          </div>
        </div>
      </div>
    `;

    document.getElementById('metarDecoderBackBtn').addEventListener('click', onBack);

    const metarInput = document.getElementById('metarInput');
    const metarDecodeBtn = document.getElementById('metarDecodeBtn');
    const metarResults = document.getElementById('metarResults');
    const metarError = document.getElementById('metarError');

    const handleDecode = async () => {
      metarError.style.display = 'none';
      const input = metarInput.value.trim();
      if (!input) {
        metarError.textContent = 'Please enter an ICAO code or paste a METAR string.';
        metarError.style.display = 'block';
        return;
      }

      // Check if it is a simple 4-letter code
      if (/^[a-zA-Z]{4}$/.test(input)) {
        // Fetch live report
        metarResults.style.display = 'block';
        metarResults.innerHTML = '<div style="color: var(--text-secondary);">Fetching live reports from NOAA...</div>';
        try {
          const metarRes = await fetch(`https://aviationweather.gov/api/data/metar?ids=${input.toUpperCase()}`);
          const rawMetar = await metarRes.text();
          if (!rawMetar || rawMetar.includes('No data') || rawMetar.trim().length < 5) {
            throw new Error(`No active METAR reports found for ICAO code "${input.toUpperCase()}"`);
          }
          
          let rawTaf = '';
          try {
            const tafRes = await fetch(`https://aviationweather.gov/api/data/taf?ids=${input.toUpperCase()}`);
            rawTaf = await tafRes.text();
          } catch(e) {
            console.log("No TAF found");
          }

          renderDecodedReport(rawMetar.trim(), rawTaf.trim());
        } catch(err) {
          metarResults.style.display = 'none';
          metarError.textContent = err.message || 'Failed to fetch METAR from NOAA. Try pasting a raw METAR string.';
          metarError.style.display = 'block';
        }
      } else {
        // Parse raw string locally
        renderDecodedReport(input);
      }
    };

    const renderDecodedReport = (rawMetar, rawTaf = '') => {
      const decoded = parseMETAR(rawMetar);
      if (!decoded) {
        metarResults.style.display = 'none';
        metarError.textContent = 'Failed to parse raw METAR string. Check format.';
        metarError.style.display = 'block';
        return;
      }

      // Category color variables
      const catColors = {
        VFR: '#10b981', // green
        MVFR: '#3b82f6', // blue
        IFR: '#ef4444', // red
        LIFR: '#d946ef' // magenta
      };
      const catColor = catColors[decoded.flightCategory] || '#6b7280';

      let cloudsHtml = decoded.clouds.length > 0
        ? decoded.clouds.map(c => `<div style="margin-bottom: 0.25rem;">☁️ ${c.label}</div>`).join('')
        : 'Sky Clear';

      let remarksHtml = decoded.remarks.length > 0
        ? decoded.remarks.join(' ')
        : 'None';

      metarResults.innerHTML = `
        <div class="card" style="padding: 2rem; border-radius: 12px; border: 1.5px solid ${catColor}; background: var(--bg-primary);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h3 style="margin: 0; font-size: 1.3rem; font-weight: 700; color: var(--text-highlight);">${decoded.stationId} Weather Report</h3>
            <span style="background: ${catColor}; color: white; padding: 0.35rem 0.85rem; border-radius: 999px; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.05em;">
              ${decoded.flightCategory}
            </span>
          </div>

          <div style="margin-bottom: 1.25rem; padding: 0.75rem; background: var(--bg-secondary); border-radius: 6px; border: 1px solid var(--border); font-family: monospace; font-size: 0.9rem; word-break: break-all; color: var(--text-primary);">
            <strong>RAW:</strong> ${decoded.raw}
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.25rem; font-size: 0.9rem; color: var(--text-secondary);">
            <div>
              <div style="font-weight: 600; color: var(--text-highlight); margin-bottom: 0.25rem;">💨 Wind</div>
              <div>Direction: ${decoded.wind.direction}</div>
              <div>Speed: ${decoded.wind.speed} ${decoded.wind.unit} ${decoded.wind.gust ? `(Gusts up to ${decoded.wind.gust} ${decoded.wind.unit})` : ''}</div>
            </div>
            <div>
              <div style="font-weight: 600; color: var(--text-highlight); margin-bottom: 0.25rem;">👁️ Visibility</div>
              <div>${decoded.visibility.value} ${decoded.visibility.unit}</div>
            </div>
            <div>
              <div style="font-weight: 600; color: var(--text-highlight); margin-bottom: 0.25rem;">☁️ Clouds & Ceiling</div>
              <div>${cloudsHtml}</div>
            </div>
            <div>
              <div style="font-weight: 600; color: var(--text-highlight); margin-bottom: 0.25rem;">🌡️ Temp & Dewpoint</div>
              <div>Temp: ${decoded.tempDewpoint.temp !== null ? `${decoded.tempDewpoint.temp}°C` : 'N/A'}</div>
              <div>Dewpoint: ${decoded.tempDewpoint.dewpoint !== null ? `${decoded.tempDewpoint.dewpoint}°C` : 'N/A'}</div>
            </div>
            <div>
              <div style="font-weight: 600; color: var(--text-highlight); margin-bottom: 0.25rem;">🎛️ Altimeter</div>
              <div>${decoded.altimeter.value !== null ? `${decoded.altimeter.value} ${decoded.altimeter.unit}` : 'N/A'}</div>
            </div>
            <div>
              <div style="font-weight: 600; color: var(--text-highlight); margin-bottom: 0.25rem;">✏️ Remarks</div>
              <div>${remarksHtml}</div>
            </div>
          </div>

          ${rawTaf ? `
            <div style="margin-top: 1.5rem; border-top: 1px solid var(--border); padding-top: 1.5rem;">
              <h4 style="margin: 0 0 0.5rem 0; color: var(--text-highlight); font-weight: 700; font-size: 1rem;">Forecast (TAF)</h4>
              <div style="padding: 0.75rem; background: var(--bg-secondary); border-radius: 6px; border: 1px solid var(--border); font-family: monospace; font-size: 0.85rem; word-break: break-all; white-space: pre-wrap; color: var(--text-primary);">${rawTaf}</div>
            </div>
          ` : ''}
        </div>
      `;
      metarResults.style.display = 'block';
    };

    metarDecodeBtn.addEventListener('click', handleDecode);
    metarInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleDecode();
    });
    metarDecodeBtn.addEventListener('click', handleDecode);
    metarInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleDecode();
    });
  },

  // 2b-4. Render TAF Decoder View
  renderTAFDecoder(container, user, onBack) {
    container.innerHTML = `
      <div class="dashboard-header animate-fade-in">
        <div style="display: flex; align-items: center; gap: 1.25rem;">
          <button class="btn btn-outline" id="tafDecoderBackBtn" style="padding: 0.5rem 1.25rem; display: flex; align-items: center; gap: 0.5rem; font-weight: 600;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back
          </button>
        </div>
      </div>

      <div class="cx3-info-content animate-fade-in" style="max-width: 900px; margin: 2rem auto; padding: 0 1rem; color: var(--text-primary);">
        <header style="margin-bottom: 2rem;">
          <h1 style="font-size: 2.2rem; font-weight: 800; font-family: var(--font-display); color: var(--text-highlight); margin-bottom: 0.5rem;">TAF Forecast Decoder</h1>
          <p style="font-size: 1rem; color: var(--text-secondary); margin: 0;">
            Enter an ICAO code (e.g. VIDP, KJFK, EGLL) to fetch live forecasts, or paste a raw TAF string to translate it instantly.
          </p>
        </header>

        <!-- Decoder Input Box -->
        <div class="card" style="padding: 1.5rem; margin-bottom: 2rem; border-radius: 12px;">
          <div style="display: flex; gap: 0.75rem;">
            <input type="text" id="tafInput" placeholder="e.g. VIDP or TAF VIDP 040900Z 0412/0518 28010KT..." style="flex: 1; padding: 0.75rem 1rem; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-secondary); color: var(--text-primary); font-size: 0.95rem; outline: none;" />
            <button class="btn btn-primary" id="tafDecodeBtn" style="padding: 0.75rem 1.5rem; font-weight: 600;">Decode</button>
          </div>
          <div id="tafError" style="color: var(--destructive); font-size: 0.85rem; margin-top: 0.5rem; display: none;"></div>
        </div>

        <!-- Decoder Results Area -->
        <div id="tafResults" style="display: none; margin-bottom: 2rem;"></div>

        <!-- What is a TAF -->
        <div class="card" style="padding: 2rem; margin-bottom: 2rem; border-radius: 12px;">
          <h3 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 1rem; color: var(--text-highlight); display: flex; align-items: center; gap: 0.75rem;">
            <span>📅</span> What is a TAF?
          </h3>
          <p style="line-height: 1.6; color: var(--text-secondary); margin: 0; font-size: 0.95rem;">
            A TAF (Terminal Aerodrome Forecast) is a coded forecast of the weather expected at an airport, normally valid for 24 or 30 hours. It is the primary forecast product pilots use when planning a flight: the METAR tells you what the airport is doing right now, the TAF tells you what it will be doing when you arrive.
          </p>
        </div>

        <!-- Understanding Change Groups -->
        <div class="card" style="padding: 2rem; margin-bottom: 2rem; border-radius: 12px;">
          <h3 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 1rem; color: var(--text-highlight); display: flex; align-items: center; gap: 0.75rem;">
            <span>⏱️</span> TAF Change Groups Explained
          </h3>
          <p style="line-height: 1.6; color: var(--text-secondary); margin-bottom: 1.25rem; font-size: 0.95rem;">
            A TAF is broken down into base conditions and change groups representing transitions over time:
          </p>
          <ul style="margin: 0; padding-left: 1.2rem; color: var(--text-secondary); line-height: 1.6; font-size: 0.95rem;">
            <li style="margin-bottom: 0.5rem;"><strong>FM (From):</strong> Marks an instantaneous transition to a new set of conditions at a specific time.</li>
            <li style="margin-bottom: 0.5rem;"><strong>BECMG (Becoming):</strong> Marks a gradual change ending in new conditions over a stated window.</li>
            <li style="margin-bottom: 0.5rem;"><strong>TEMPO (Temporary):</strong> Marks short-lived temporary fluctuations during a window.</li>
            <li><strong>PROB30 / PROB40:</strong> Indicates a 30% or 40% probability of the listed conditions during the window.</li>
          </ul>
        </div>

        <!-- Frequently Asked Questions -->
        <div class="card" style="padding: 2rem; border-radius: 12px; margin-bottom: 4rem;">
          <h3 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 1.5rem; color: var(--text-highlight); display: flex; align-items: center; gap: 0.75rem;">
            <span>❓</span> Frequently Asked Questions
          </h3>
          
          <div style="margin-bottom: 1.5rem;">
            <h4 style="margin: 0 0 0.5rem 0; color: var(--text-highlight); font-weight: 600; font-size: 1.05rem;">Why does my TAF show CNL or AMD?</h4>
            <p style="margin: 0; color: var(--text-secondary); line-height: 1.5; font-size: 0.92rem;">AMD means the TAF has been amended — a new forecast supersedes the previous one because weather conditions shifted. CNL means the forecast is cancelled.</p>
          </div>

          <div>
            <h4 style="margin: 0 0 0.5rem 0; color: var(--text-highlight); font-weight: 600; font-size: 1.05rem;">Where does TAF data come from?</h4>
            <p style="margin: 0; color: var(--text-secondary); line-height: 1.5; font-size: 0.92rem;">Live forecasts are fetched in real-time from NOAA's Aviation Weather Center API (aviationweather.gov).</p>
          </div>
        </div>
      </div>
    `;

    document.getElementById('tafDecoderBackBtn').addEventListener('click', onBack);

    const tafInput = document.getElementById('tafInput');
    const tafDecodeBtn = document.getElementById('tafDecodeBtn');
    const tafResults = document.getElementById('tafResults');
    const tafError = document.getElementById('tafError');

    const handleDecode = async () => {
      tafError.style.display = 'none';
      const input = tafInput.value.trim();
      if (!input) {
        tafError.textContent = 'Please enter an ICAO code or paste a TAF string.';
        tafError.style.display = 'block';
        return;
      }

      if (/^[a-zA-Z]{4}$/.test(input)) {
        tafResults.style.display = 'block';
        tafResults.innerHTML = '<div style="color: var(--text-secondary);">Fetching live forecast from NOAA...</div>';
        try {
          const tafRes = await fetch(`https://aviationweather.gov/api/data/taf?ids=${input.toUpperCase()}`);
          const rawTaf = await tafRes.text();
          if (!rawTaf || rawTaf.includes('No data') || rawTaf.trim().length < 5) {
            throw new Error(`No active TAF forecast found for ICAO code "${input.toUpperCase()}"`);
          }

          let rawMetar = '';
          try {
            const metarRes = await fetch(`https://aviationweather.gov/api/data/metar?ids=${input.toUpperCase()}`);
            rawMetar = await metarRes.text();
          } catch(e) {}

          renderDecodedForecast(rawTaf.trim(), rawMetar.trim());
        } catch(err) {
          tafResults.style.display = 'none';
          tafError.textContent = err.message || 'Failed to fetch TAF from NOAA. Try pasting a raw TAF string.';
          tafError.style.display = 'block';
        }
      } else {
        renderDecodedForecast(input);
      }
    };

    const renderDecodedForecast = (rawTaf, rawMetar = '') => {
      const decoded = parseTAF(rawTaf);
      if (!decoded) {
        tafResults.style.display = 'none';
        tafError.textContent = 'Failed to parse raw TAF string. Check format.';
        tafError.style.display = 'block';
        return;
      }

      const baseDecoded = decodeTAFGroup(decoded.baseForecast);

      let groupsHtml = decoded.changeGroups.map(group => {
        const decodedGroup = decodeTAFGroup(group.tokens);
        let timeLabel = '';
        
        // Find validity token (contains /) or time identifier in tokens
        const valToken = group.tokens.find(t => t.includes('/'));
        if (valToken) {
          timeLabel = `Period: ${valToken}`;
        } else if (group.indicator.startsWith('FM')) {
          const hours = group.indicator.slice(4, 6);
          const mins = group.indicator.slice(6, 8);
          timeLabel = `From time: ${hours}:${mins}Z`;
        }

        return `
          <div style="padding: 1rem; border: 1px solid var(--border); background: var(--bg-secondary); border-radius: 8px; margin-bottom: 0.75rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span style="font-weight: 700; color: var(--text-highlight); text-transform: uppercase;">
                ⚠️ ${group.indicator} Group
              </span>
              <span style="font-size: 0.8rem; color: var(--text-secondary); font-family: monospace;">${timeLabel}</span>
            </div>
            <div style="font-size: 0.9rem; line-height: 1.5; color: var(--text-primary);">
              <div>💨 ${decodedGroup.wind}</div>
              <div>👁️ Visibility: ${decodedGroup.visibility !== 'Normal' ? decodedGroup.visibility : 'No change'}</div>
              <div>☁️ Clouds: ${decodedGroup.clouds.length > 0 ? decodedGroup.clouds.join(', ') : 'No change'}</div>
              ${decodedGroup.weather.length > 0 ? `<div>🌧️ Weather: ${decodedGroup.weather.join(', ')}</div>` : ''}
            </div>
          </div>
        `;
      }).join('');

      tafResults.innerHTML = `
        <div class="card" style="padding: 2rem; border-radius: 12px; background: var(--bg-primary);">
          <h3 style="margin: 0 0 1.5rem 0; font-size: 1.3rem; font-weight: 700; color: var(--text-highlight);">${decoded.stationId} Terminal Forecast</h3>
          
          <div style="margin-bottom: 1.25rem; padding: 0.75rem; background: var(--bg-secondary); border-radius: 6px; border: 1px solid var(--border); font-family: monospace; font-size: 0.85rem; word-break: break-all; color: var(--text-primary); white-space: pre-wrap;">
            <strong>RAW:</strong> ${decoded.raw}
          </div>

          <div style="padding: 1rem; border: 1.5px solid var(--accent); background: var(--bg-secondary); border-radius: 8px; margin-bottom: 1.5rem;">
            <h4 style="margin: 0 0 0.5rem 0; font-weight: 700; color: var(--text-highlight);">Initial Base Forecast</h4>
            <div style="font-size: 0.9rem; line-height: 1.5; color: var(--text-primary);">
              <div>💨 ${baseDecoded.wind}</div>
              <div>👁️ Visibility: ${baseDecoded.visibility}</div>
              <div>☁️ Clouds: ${baseDecoded.clouds.length > 0 ? baseDecoded.clouds.join(', ') : 'No significant cloud'}</div>
              ${baseDecoded.weather.length > 0 ? `<div>🌧️ Weather: ${baseDecoded.weather.join(', ')}</div>` : ''}
            </div>
          </div>

          ${groupsHtml ? `
            <div style="margin-bottom: 1.5rem;">
              <h4 style="margin: 0 0 0.75rem 0; font-weight: 700; color: var(--text-highlight);">Forecast Transitions & Changes</h4>
              ${groupsHtml}
            </div>
          ` : ''}

          ${rawMetar ? `
            <div style="margin-top: 1.5rem; border-top: 1px solid var(--border); padding-top: 1.5rem;">
              <h4 style="margin: 0 0 0.5rem 0; color: var(--text-highlight); font-weight: 700; font-size: 1rem;">Current Conditions (METAR)</h4>
              <div style="padding: 0.75rem; background: var(--bg-secondary); border-radius: 6px; border: 1px solid var(--border); font-family: monospace; font-size: 0.85rem; word-break: break-all; color: var(--text-primary);">${rawMetar}</div>
            </div>
          ` : ''}
        </div>
      `;
      tafResults.style.display = 'block';
    };

    tafDecodeBtn.addEventListener('click', handleDecode);
    tafInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleDecode();
    });
  },

  // 2b-5. Render Holding Pattern Calculator
  renderHoldingPatternCalculator(container, user, onBack) {
    container.innerHTML = `
      <div class="dashboard-header animate-fade-in">
        <div style="display: flex; align-items: center; gap: 1.25rem;">
          <button class="btn btn-outline" id="holdingBackBtn" style="padding: 0.5rem 1.25rem; display: flex; align-items: center; gap: 0.5rem; font-weight: 600;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back
          </button>
        </div>
      </div>

      <div class="cx3-info-content animate-fade-in" style="max-width: 1100px; margin: 2rem auto; padding: 0 1rem; color: var(--text-primary);">
        <header style="margin-bottom: 2rem;">
          <h1 style="font-size: 2.2rem; font-weight: 800; font-family: var(--font-display); color: var(--text-highlight); margin-bottom: 0.5rem;">Holding Pattern Calculator</h1>
          <p style="font-size: 1rem; color: var(--text-secondary); margin: 0;">
            Enter the inbound course, aircraft heading, and turn direction to instantly determine the correct entry (Direct, Parallel, or Teardrop) per FAA and ICAO rules.
          </p>
        </header>

        <div style="display: grid; grid-template-columns: 1fr; gap: 1.5rem; margin-bottom: 2rem;" class="grid-calculator">
          <!-- Inputs Column -->
          <div class="card" style="padding: 1.5rem; border-radius: 12px; height: fit-content; display: flex; flex-direction: column; gap: 1.25rem;">
            <h3 style="margin: 0; font-size: 1.15rem; color: var(--text-highlight); border-bottom: 1px solid var(--border); padding-bottom: 0.75rem;">Hold Parameters</h3>
            
            <div style="display: flex; flex-direction: column; gap: 0.4rem;">
              <label for="holdInbound" style="font-size: 0.9rem; font-weight: 600; color: var(--text-secondary);">Inbound Course (°)</label>
              <input type="number" id="holdInbound" value="360" min="0" max="359" style="padding: 0.6rem; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-secondary); color: var(--text-primary); outline: none; font-family: monospace;" />
              <span style="font-size: 0.75rem; color: var(--text-secondary);">The published magnetic track flown to the fix on the inbound leg.</span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 0.4rem;">
              <label for="holdHeading" style="font-size: 0.9rem; font-weight: 600; color: var(--text-secondary);">Aircraft Heading (°)</label>
              <input type="number" id="holdHeading" value="200" min="0" max="359" style="padding: 0.6rem; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-secondary); color: var(--text-primary); outline: none; font-family: monospace;" />
              <span style="font-size: 0.75rem; color: var(--text-secondary);">Your current heading when arriving at the fix.</span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 0.4rem;">
              <label style="font-size: 0.9rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.2rem;">Turn Direction</label>
              <div style="display: flex; gap: 0.5rem;">
                <button class="btn btn-outline" id="btnRightTurn" style="flex: 1; padding: 0.5rem; font-size: 0.85rem; font-weight: 600; border-color: var(--accent); background: rgba(0, 210, 255, 0.1);">Right (Standard)</button>
                <button class="btn btn-outline" id="btnLeftTurn" style="flex: 1; padding: 0.5rem; font-size: 0.85rem; font-weight: 600;">Left (Non-Standard)</button>
              </div>
            </div>

            <div style="display: flex; gap: 1rem;">
              <div style="flex: 1; display: flex; flex-direction: column; gap: 0.4rem;">
                <label for="holdCategory" style="font-size: 0.9rem; font-weight: 600; color: var(--text-secondary);">Aircraft Cat</label>
                <select id="holdCategory" style="padding: 0.6rem; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-secondary); color: var(--text-primary); outline: none;">
                  <option value="A">Cat A (Light)</option>
                  <option value="B">Cat B (Medium)</option>
                  <option value="C">Cat C (High)</option>
                  <option value="D">Cat D (Military/Jet)</option>
                </select>
              </div>
              <div style="flex: 1; display: flex; flex-direction: column; gap: 0.4rem;">
                <label for="holdAltitude" style="font-size: 0.9rem; font-weight: 600; color: var(--text-secondary);">Altitude (ft)</label>
                <input type="number" id="holdAltitude" value="8000" min="0" max="50000" step="500" style="padding: 0.6rem; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-secondary); color: var(--text-primary); outline: none; font-family: monospace;" />
              </div>
            </div>
          </div>

          <!-- Outputs & Diagram Column -->
          <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <!-- Recommended Entry Card -->
            <div class="card" style="padding: 1.5rem; border-radius: 12px; display: flex; align-items: flex-start; gap: 1rem; border-left: 5px solid var(--accent);">
              <div style="display: flex; height: 3rem; width: 3rem; min-width: 3rem; align-items: center; justify-content: center; border-radius: 50%; background: rgba(0, 210, 255, 0.1); border: 1px solid var(--accent); color: var(--accent);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px;">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                </svg>
              </div>
              <div style="flex: 1;">
                <span style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: var(--text-secondary); letter-spacing: 0.05em;">Recommended Entry</span>
                <h2 id="recommendedEntryTitle" style="margin: 0.1rem 0 0.5rem 0; font-size: 1.75rem; font-weight: 800; color: var(--text-highlight);">Teardrop Entry</h2>
                <p id="recommendedEntryDesc" style="margin: 0; font-size: 0.95rem; line-height: 1.5; color: var(--text-secondary);">
                  Cross the fix and turn right onto a heading 30° offset from the outbound course...
                </p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 1rem; border-top: 1px solid var(--border); margin-top: 1rem; padding-top: 1rem;">
                  <div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Inbound Leg</div>
                    <div id="outInboundVal" style="font-size: 1.1rem; font-weight: 700; font-family: monospace; color: var(--text-primary);">000°</div>
                  </div>
                  <div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Heading</div>
                    <div id="outHeadingVal" style="font-size: 1.1rem; font-weight: 700; font-family: monospace; color: var(--text-primary);">200°</div>
                  </div>
                  <div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Leg Time</div>
                    <div id="outLegTime" style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary);">1.0 min</div>
                  </div>
                  <div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Max Speed</div>
                    <div id="outMaxSpeed" style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary);">230 KIAS</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Interactive Diagram Card -->
            <div class="card" style="padding: 1.5rem; border-radius: 12px; display: flex; flex-direction: column; align-items: center;">
              <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem; align-self: flex-start; color: var(--text-highlight);">Sector Visualizer</h3>
              
              <div id="diagramContainer" style="width: 100%; max-width: 450px; aspect-ratio: 1; margin: 0 auto; display: flex; justify-content: center;">
                <!-- SVG injected dynamically -->
              </div>

              <!-- Legends -->
              <div style="display: flex; gap: 1.5rem; margin-top: 1.5rem; flex-wrap: wrap; justify-content: center;">
                <div style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; color: var(--text-secondary);">
                  <span style="display: inline-block; width: 12px; height: 12px; border-radius: 3px; background: rgba(16, 185, 129, 0.25); border: 1px solid rgb(16, 185, 129);"></span>
                  Direct Sector
                </div>
                <div style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; color: var(--text-secondary);">
                  <span style="display: inline-block; width: 12px; height: 12px; border-radius: 3px; background: rgba(245, 158, 11, 0.25); border: 1px solid rgb(245, 158, 11);"></span>
                  Teardrop Sector
                </div>
                <div style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; color: var(--text-secondary);">
                  <span style="display: inline-block; width: 12px; height: 12px; border-radius: 3px; background: rgba(139, 92, 246, 0.25); border: 1px solid rgb(139, 92, 246);"></span>
                  Parallel Sector
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Educational Reference Section -->
        <section style="margin-top: 3rem;">
          <h2 style="font-size: 1.75rem; font-weight: 800; font-family: var(--font-display); color: var(--text-highlight); margin-bottom: 1.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem;">Understanding Holding Patterns</h2>
          
          <div style="display: grid; grid-template-columns: 1fr; gap: 1.5rem;" class="grid-calculator">
            <div class="card" style="padding: 1.5rem; border-radius: 12px;">
              <h3 style="margin-top: 0; color: var(--accent); font-size: 1.2rem;">Standard vs Non-Standard Holds</h3>
              <p style="font-size: 0.95rem; line-height: 1.6; color: var(--text-secondary);">
                A <strong>standard</strong> holding pattern uses right-hand turns. A <strong>non-standard</strong> pattern uses left-hand turns. Turn direction alters which side of the holding fix is considered the "holding side" versus the "non-holding side" (safe side), which determines entry sector geometry.
              </p>
              
              <h4 style="color: var(--text-primary); margin-bottom: 0.5rem; font-size: 1rem;">Sector Angles (Right Turns)</h4>
              <ul style="font-size: 0.9rem; color: var(--text-secondary); padding-left: 1.2rem; line-height: 1.6;">
                <li><strong>Parallel Entry (Sector 1):</strong> 110° wide sector on the non-holding side (West).</li>
                <li><strong>Teardrop Entry (Sector 2):</strong> 70° wide sector on the holding side (East).</li>
                <li><strong>Direct Entry (Sector 3):</strong> 180° wide sector.</li>
              </ul>
            </div>

            <div class="card" style="padding: 1.5rem; border-radius: 12px;">
              <h3 style="margin-top: 0; color: var(--accent); font-size: 1.2rem;">Airspeed Limits</h3>
              <p style="font-size: 0.95rem; line-height: 1.6; color: var(--text-secondary);">
                To keep aircraft within protected airspace, regulatory bodies set maximum holding speeds based on altitude:
              </p>
              
              <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; text-align: left; margin-top: 1rem;">
                <thead>
                  <tr style="border-bottom: 1px solid var(--border); color: var(--text-primary);">
                    <th style="padding: 0.5rem;">Altitude MSL</th>
                    <th style="padding: 0.5rem;">FAA Limit</th>
                    <th style="padding: 0.5rem;">ICAO Limit</th>
                  </tr>
                </thead>
                <tbody style="color: var(--text-secondary);">
                  <tr style="border-bottom: 1px solid var(--border);">
                    <td style="padding: 0.5rem;">Up to 6,000 ft</td>
                    <td style="padding: 0.5rem;">200 KIAS</td>
                    <td style="padding: 0.5rem;">230 KIAS</td>
                  </tr>
                  <tr style="border-bottom: 1px solid var(--border);">
                    <td style="padding: 0.5rem;">6,001 to 14,000 ft</td>
                    <td style="padding: 0.5rem;">230 KIAS</td>
                    <td style="padding: 0.5rem;">230 KIAS</td>
                  </tr>
                  <tr>
                    <td style="padding: 0.5rem;">Above 14,000 ft</td>
                    <td style="padding: 0.5rem;">265 KIAS</td>
                    <td style="padding: 0.5rem;">240 KIAS / 265 KIAS</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    `;

    // Dynamic Style insertion for grid layouts
    if (!document.getElementById('grid-calculator-style')) {
      const style = document.createElement('style');
      style.id = 'grid-calculator-style';
      style.innerHTML = `
        @media (min-width: 768px) {
          .grid-calculator {
            grid-template-columns: 360px 1fr !important;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Wiring up input elements
    const holdInbound = document.getElementById('holdInbound');
    const holdHeading = document.getElementById('holdHeading');
    const btnRightTurn = document.getElementById('btnRightTurn');
    const btnLeftTurn = document.getElementById('btnLeftTurn');
    const holdCategory = document.getElementById('holdCategory');
    const holdAltitude = document.getElementById('holdAltitude');
    const recommendedEntryTitle = document.getElementById('recommendedEntryTitle');
    const recommendedEntryDesc = document.getElementById('recommendedEntryDesc');
    const outInboundVal = document.getElementById('outInboundVal');
    const outHeadingVal = document.getElementById('outHeadingVal');
    const outLegTime = document.getElementById('outLegTime');
    const outMaxSpeed = document.getElementById('outMaxSpeed');
    const diagramContainer = document.getElementById('diagramContainer');

    let isLeftTurn = false;

    // Helper functions for Trig
    function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
      const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
      return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
      };
    }

    function describeArc(x, y, radius, startAngle, endAngle) {
      const start = polarToCartesian(x, y, radius, endAngle);
      const end = polarToCartesian(x, y, radius, startAngle);
      const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
      return [
        "M", x, y,
        "L", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
        "Z"
      ].join(" ");
    }

    const updateCalculator = () => {
      const inbound = parseInt(holdInbound.value) || 0;
      const heading = parseInt(holdHeading.value) || 0;
      const altitude = parseInt(holdAltitude.value) || 0;
      const cat = holdCategory.value;

      const result = calculateHoldingPattern(inbound, heading, isLeftTurn, altitude);

      // Update text outputs
      recommendedEntryTitle.innerText = result.entryType;
      recommendedEntryDesc.innerText = result.description;
      outInboundVal.innerText = `${String(inbound).padStart(3, '0')}°`;
      outHeadingVal.innerText = `${String(heading).padStart(3, '0')}°`;
      outLegTime.innerText = result.legTime;
      
      const categoryLabel = `Cat ${cat}`;
      outMaxSpeed.innerHTML = `${result.icaoSpeed} <span style="font-size: 0.75rem; color: var(--text-secondary);">ICAO</span> / ${result.faaSpeed} <span style="font-size: 0.75rem; color: var(--text-secondary);">FAA (${categoryLabel})</span>`;

      // Set accent border color based on recommended entry
      let entryColor = 'rgb(16, 185, 129)'; // Direct: Green
      if (result.sectorClass === 'teardrop') {
        entryColor = 'rgb(245, 158, 11)'; // Teardrop: Orange
      } else if (result.sectorClass === 'parallel') {
        entryColor = 'rgb(139, 92, 246)'; // Parallel: Purple
      }
      recommendedEntryTitle.parentElement.parentElement.style.borderLeftColor = entryColor;

      // Draw dynamic SVG Diagram
      const cx = 300;
      const cy = 300;
      const r = 240;

      // Generate sector paths
      let teardropPath = '';
      let parallelPath = '';
      let directPath = '';

      if (!isLeftTurn) {
        // Right turns:
        // Teardrop: 0 to 70
        teardropPath = describeArc(cx, cy, r, 0, 70);
        // Direct: 70 to 250
        directPath = describeArc(cx, cy, r, 70, 250);
        // Parallel: 250 to 360
        parallelPath = describeArc(cx, cy, r, 250, 360);
      } else {
        // Left turns:
        // Parallel: 0 to 110
        parallelPath = describeArc(cx, cy, r, 0, 110);
        // Direct: 110 to 290
        directPath = describeArc(cx, cy, r, 110, 290);
        // Teardrop: 290 to 360
        teardropPath = describeArc(cx, cy, r, 290, 360);
      }

      // Calculate aircraft position based on approach direction
      const aircraftHdgDiff = (heading - inbound + 360) % 360;
      const aircraftPos = polarToCartesian(cx, cy, 170, result.approachAngle);

      // Render the full SVG
      diagramContainer.innerHTML = `
        <svg viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
          <!-- Background Outer Circle -->
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--border)" stroke-width="1.5" stroke-opacity="0.3"></circle>
          
          <!-- Shaded Sectors -->
          <path d="${directPath}" fill="rgba(16, 185, 129, 0.08)" stroke="rgba(16, 185, 129, 0.4)" stroke-width="1.5"></path>
          <path d="${teardropPath}" fill="rgba(245, 158, 11, 0.08)" stroke="rgba(245, 158, 11, 0.4)" stroke-width="1.5"></path>
          <path d="${parallelPath}" fill="rgba(139, 92, 246, 0.08)" stroke="rgba(139, 92, 246, 0.4)" stroke-width="1.5"></path>

          <!-- Vertical course centerline (Inbound / Outbound track line) -->
          <line x1="${cx}" y1="${cy - r}" x2="${cx}" y2="${cy + r}" stroke="var(--text-secondary)" stroke-dasharray="6 4" stroke-opacity="0.4" stroke-width="1.5"></line>

          <!-- Holding Fix and Race Track Preview -->
          <circle cx="${cx}" cy="${cy}" r="6" fill="var(--text-highlight)"></circle>
          <text x="${cx + 12}" y="${cy + 5}" font-size="14" font-weight="700" fill="var(--text-primary)">FIX</text>

          <!-- Racetrack Outline -->
          <!-- Standard holds go outbound right, Non-standard go outbound left -->
          ${!isLeftTurn ? `
            <!-- Standard Right Pattern -->
            <path d="M 300 300 L 300 420 A 60 60 0 0 0 420 420 L 420 300 A 60 60 0 0 0 300 300 Z" fill="none" stroke="var(--text-primary)" stroke-opacity="0.5" stroke-width="2.5"></path>
          ` : `
            <!-- Non-Standard Left Pattern -->
            <path d="M 300 300 L 300 420 A 60 60 0 0 1 180 420 L 180 300 A 60 60 0 0 1 300 300 Z" fill="none" stroke="var(--text-primary)" stroke-opacity="0.5" stroke-width="2.5"></path>
          `}

          <!-- Sector labels -->
          ${!isLeftTurn ? `
            <text x="300" y="500" font-size="12" font-weight="700" text-anchor="middle" fill="rgb(16, 185, 129)" class="uppercase">direct</text>
            <text x="410" y="140" font-size="12" font-weight="700" text-anchor="middle" fill="rgb(245, 158, 11)" class="uppercase">teardrop</text>
            <text x="190" y="140" font-size="12" font-weight="700" text-anchor="middle" fill="rgb(139, 92, 246)" class="uppercase">parallel</text>
          ` : `
            <text x="300" y="500" font-size="12" font-weight="700" text-anchor="middle" fill="rgb(16, 185, 129)" class="uppercase">direct</text>
            <text x="190" y="140" font-size="12" font-weight="700" text-anchor="middle" fill="rgb(245, 158, 11)" class="uppercase">teardrop</text>
            <text x="410" y="140" font-size="12" font-weight="700" text-anchor="middle" fill="rgb(139, 92, 246)" class="uppercase">parallel</text>
          `}

          <!-- Compass Rose Cardinal N -->
          <g transform="translate(48 48)">
            <circle r="22" fill="var(--bg-secondary)" stroke="var(--border)" stroke-width="1"></circle>
            <path d="M 0 -14 L 5 4 L 0 1 L -5 4 Z" fill="var(--text-primary)"></path>
            <text x="0" y="-22" font-size="10" font-weight="800" text-anchor="middle" fill="var(--text-primary)">N</text>
          </g>

          <!-- Aircraft Icon Positioned and Rotated -->
          <g transform="translate(${aircraftPos.x} ${aircraftPos.y}) rotate(${aircraftHdgDiff})">
            <circle r="20" fill="var(--bg-secondary)" opacity="0.9" stroke="${entryColor}" stroke-width="2"></circle>
            <!-- Jet shape pointing straight up in its coordinate space -->
            <path d="M 0 -14 L 11 9 L 0 4 L -11 9 Z" fill="${entryColor}" stroke="var(--text-primary)" stroke-width="1"></path>
          </g>
          <!-- Heading Tag text below aircraft -->
          <text x="${aircraftPos.x}" y="${aircraftPos.y + 35}" font-size="11" font-weight="700" text-anchor="middle" fill="var(--text-primary)">
            ${String(heading).padStart(3, '0')}° Hdg
          </text>
        </svg>
      `;
    };

    // Event hooks
    holdInbound.addEventListener('input', updateCalculator);
    holdHeading.addEventListener('input', updateCalculator);
    holdAltitude.addEventListener('input', updateCalculator);
    holdCategory.addEventListener('change', updateCalculator);

    btnRightTurn.addEventListener('click', () => {
      isLeftTurn = false;
      btnRightTurn.style.background = 'rgba(0, 210, 255, 0.1)';
      btnRightTurn.style.borderColor = 'var(--accent)';
      btnLeftTurn.style.background = 'transparent';
      btnLeftTurn.style.borderColor = 'var(--border)';
      updateCalculator();
    });

    btnLeftTurn.addEventListener('click', () => {
      isLeftTurn = true;
      btnLeftTurn.style.background = 'rgba(0, 210, 255, 0.1)';
      btnLeftTurn.style.borderColor = 'var(--accent)';
      btnRightTurn.style.background = 'transparent';
      btnRightTurn.style.borderColor = 'var(--border)';
      updateCalculator();
    });

    document.getElementById('holdingBackBtn').addEventListener('click', onBack);

    // Initial render
    updateCalculator();
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
        <div style="position: absolute; left: 0; display: flex; align-items: center;">
          <div class="timer-box" id="quizTimer">⏱️ Time: 00:00</div>
        </div>
        <div class="quiz-title-box">
          <span class="quiz-subtitle" id="quizSubTitle">${mode === 'test' ? 'MOCK TEST EXAM' : 'PRACTICE SESSION'}</span>
          <h2 style="font-size: 1.3rem; text-transform: uppercase;" id="quizMainTitle">Question</h2>
        </div>
        <div style="position: absolute; right: 0; display: flex; align-items: center;">
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

  // 8.5b. Show Aviation Tools list modal
  showAviationToolsModal(onCX3Click, onMETARClick, onTAFClick, onHoldingClick) {
    const overlay = document.createElement('div');
    overlay.className = 'mode-modal-overlay';
    overlay.id = 'aviationToolsModal';
    overlay.style.zIndex = '1300';
    
    // Disable background scrolling
    document.body.style.overflow = 'hidden';

    overlay.innerHTML = `
      <style>
        #aviationToolsModal .mode-title {
          font-family: var(--font-mono) !important;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        #aviationToolsModal .tools-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          width: 100%;
        }
        @media (max-width: 900px) {
          #aviationToolsModal .tools-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        #aviationToolsModal .modal-tool-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1.25rem 1rem;
          border-radius: 12px;
          cursor: pointer;
          text-align: center;
          gap: 0.5rem;
          min-height: 110px;
        }
        #aviationToolsModal .modal-tool-card h4 {
          font-family: var(--font-mono) !important;
          font-size: 0.82rem !important;
          font-weight: 700 !important;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          margin: 0;
        }
        #aviationToolsModal .modal-tool-card:hover {
          transform: translateY(-4px) scale(1.02);
          border-color: var(--accent);
          box-shadow: 0 8px 24px rgba(0, 210, 255, 0.18);
          background: var(--bg-tertiary);
        }
        #closeToolsModalBtn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          font-size: 1.4rem;
          cursor: pointer;
          transition: all 0.2s ease;
          line-height: 1;
        }
        #closeToolsModalBtn:hover {
          background: rgba(239, 68, 68, 0.2);
          color: rgb(239, 68, 68);
          border-color: rgb(239, 68, 68);
          transform: rotate(90deg);
        }
        #aviationToolsModal .landing-feature-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: rgba(0, 210, 255, 0.08);
          padding: 6px;
        }
      </style>
      <div class="mode-modal-card" style="max-width: 850px; width: 92%; gap: 1.25rem; padding: 2rem; background: var(--glass); border: 1px solid var(--glass-border); box-shadow: 0 10px 50px rgba(0, 210, 255, 0.15); border-radius: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 1rem; width: 100%;">
          <h2 class="mode-title" style="color: var(--text-highlight); font-size: 1.6rem; margin: 0; font-family: var(--font-display); font-weight: 800; letter-spacing: -0.02em;">Aviation Flight Tools</h2>
          <button id="closeToolsModalBtn" aria-label="Close tools panel">&times;</button>
        </div>

        <div class="tools-grid">
          <!-- METAR Decoder -->
          <div class="card card-interactive modal-tool-card" data-tool="metar">
            <div class="landing-feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
                <path d="M17.5 19A3.5 3.5 0 0 0 13 15.7V8.3a3 3 0 1 0-2 0v7.4A3.5 3.5 0 1 0 6.5 19Z" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            </div>
            <h4 style="margin: 0; font-family: var(--font-display); font-size: 1.05rem; font-weight: 700; color: var(--text-highlight);">METAR Decoder</h4>
          </div>

          <!-- TAF Decoder -->
          <div class="card card-interactive modal-tool-card" data-tool="taf">
            <div class="landing-feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <h4 style="margin: 0; font-family: var(--font-display); font-size: 1.05rem; font-weight: 700; color: var(--text-highlight);">TAF Decoder</h4>
          </div>

          <!-- Holding Pattern -->
          <div class="card card-interactive modal-tool-card" data-tool="holding">
            <div class="landing-feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
                <rect x="2" y="6" width="20" height="12" rx="6" />
                <path d="M12 6v12M15 9l3 3-3 3" />
              </svg>
            </div>
            <h4 style="margin: 0; font-family: var(--font-display); font-size: 1.05rem; font-weight: 700; color: var(--text-highlight);">Holding Pattern</h4>
          </div>

          <!-- CX-3 Calculator -->
          <div class="card card-interactive modal-tool-card" data-tool="cx3">
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
            <h4 style="margin: 0; font-family: var(--font-display); font-size: 1.05rem; font-weight: 700; color: var(--text-highlight);">CX-3 Calculator</h4>
          </div>

          <!-- Density Altitude -->
          <div class="card card-interactive modal-tool-card" data-tool="density-alt" style="opacity: 0.6;">
            <div class="landing-feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
                <path d="M4 14.5L12 3l8 11.5H4z" />
                <path d="M2 20h20M6 17h12" />
              </svg>
            </div>
            <h4 style="margin: 0; font-family: var(--font-display); font-size: 1.05rem; font-weight: 700; color: var(--text-highlight);">Density Altitude</h4>
          </div>

          <!-- Crosswind Calculator -->
          <div class="card card-interactive modal-tool-card" data-tool="crosswind" style="opacity: 0.6;">
            <div class="landing-feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
                <line x1="12" y1="2" x2="12" y2="22" stroke-dasharray="3,3" />
                <line x1="6" y1="5" x2="18" y2="5" />
                <line x1="6" y1="19" x2="18" y2="19" />
                <path d="M3 12h18M18 9l3 3-3 3" />
              </svg>
            </div>
            <h4 style="margin: 0; font-family: var(--font-display); font-size: 1.05rem; font-weight: 700; color: var(--text-highlight);">Crosswind Calculator</h4>
          </div>

          <!-- Ground Speed -->
          <div class="card card-interactive modal-tool-card" data-tool="ground-speed" style="opacity: 0.6;">
            <div class="landing-feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
                <path d="M12 2a10 10 0 0 1 10 10c0 2.2-.7 4.2-1.9 5.9L12 12V3.1" />
                <path d="M12 2A10 10 0 1 0 2 12c0 2.2.7 4.2 1.9 5.9L12 12" />
                <polyline points="12 12 16.5 8.5" />
              </svg>
            </div>
            <h4 style="margin: 0; font-family: var(--font-display); font-size: 1.05rem; font-weight: 700; color: var(--text-highlight);">Ground Speed</h4>
          </div>

          <!-- Flight Duration -->
          <div class="card card-interactive modal-tool-card" data-tool="duration" style="opacity: 0.6;">
            <div class="landing-feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
                <path d="M5 2h14M5 22h14M19 2v6c0 2.2-1.8 4-4 4h-6c-2.2 0-4-1.8-4-4V2M19 22v-6c0-2.2-1.8-4-4-4h-6c-2.2 0-4-1.8-4 4v6" />
              </svg>
            </div>
            <h4 style="margin: 0; font-family: var(--font-display); font-size: 1.05rem; font-weight: 700; color: var(--text-highlight);">Flight Duration</h4>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.classList.add('show');
    }, 10);

    const closeToolsModal = () => {
      overlay.classList.remove('show');
      document.body.style.overflow = ''; // Restore background scrolling
      setTimeout(() => {
        overlay.remove();
      }, 300);
    };

    overlay.querySelector('#closeToolsModalBtn').addEventListener('click', closeToolsModal);
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeToolsModal();
      }
    });

    const modalToolCards = overlay.querySelectorAll('.modal-tool-card');
    modalToolCards.forEach(card => {
      card.addEventListener('click', () => {
        const toolId = card.dataset.tool || '';
        const toolName = card.querySelector('h4').textContent;
        
        if (toolId === 'cx3') {
          closeToolsModal();
          const popupLeft = screen.width - 410;
          window.open('cx3/index.html', 'CX3_Calculator', `width=380,height=750,left=${popupLeft},top=50,status=no,menubar=no,toolbar=no,location=no,scrollbars=yes,resizable=yes`);
          if (onCX3Click) onCX3Click();
        } else if (toolId === 'metar') {
          closeToolsModal();
          if (onMETARClick) onMETARClick();
        } else if (toolId === 'taf') {
          closeToolsModal();
          if (onTAFClick) onTAFClick();
        } else if (toolId === 'holding') {
          closeToolsModal();
          if (onHoldingClick) onHoldingClick();
        } else {
          this.showAlertModal(
            toolName,
            `${toolName} tool will be fully integrated as an interactive utility in a later flight training phase.`
          );
        }
      });
    });
  },

  // 8.5bb. Show detailed stats modal when clicking performance stat card
  showStatsDetailModal(statType, username, subjectsConfig) {
    const oldModal = document.getElementById('statsDetailModalBackdrop');
    if (oldModal) oldModal.remove();

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const backdrop = document.createElement('div');
    backdrop.className = 'stats-detail-modal-backdrop';
    backdrop.id = 'statsDetailModalBackdrop';

    // Fetch user attempts
    const attempts = progress.getUserAttempts(username);

    // Group attempts by book/subjectId
    const bookStats = {};
    attempts.forEach(att => {
      const bookId = att.subjectId;
      if (!bookStats[bookId]) {
        const bookConf = subjectsConfig[bookId] || { title: bookId, category: 'Unknown', chapters: [] };
        bookStats[bookId] = {
          id: bookId,
          title: bookConf.title,
          category: bookConf.category,
          chaptersCount: bookConf.chapters ? bookConf.chapters.length : 0,
          attemptsCount: 0,
          totalQuestions: 0,
          totalCorrect: 0,
          totalTime: 0,
          attemptsList: []
        };
      }
      const bs = bookStats[bookId];
      bs.attemptsCount++;
      bs.totalQuestions += att.totalQuestions;
      bs.totalCorrect += att.score;
      bs.totalTime += att.timeTaken;
      bs.attemptsList.push(att);
    });

    let titleText = "Performance Details";
    let bodyHTML = "";

    const formatTime = (secs) => {
      const h = Math.floor(secs / 3600);
      const m = Math.floor((secs % 3600) / 60);
      const s = secs % 60;
      if (h > 0) return `${h}h ${m}m ${s}s`;
      if (m > 0) return `${m}m ${s}s`;
      return `${s}s`;
    };

    const keys = Object.keys(bookStats);
    if (keys.length === 0) {
      bodyHTML = `
        <div class="preview-empty-state" style="padding-top: 4rem; text-align: center;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 48px; height: 48px; opacity: 0.25; margin-bottom: 1rem;">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <div style="font-family: var(--font-mono); font-size: 0.9rem; color: var(--text-secondary);">No attempts logged yet. Start a quiz to track statistics!</div>
        </div>
      `;
    } else {
      if (statType === 'attempts') {
        titleText = "Tests Attempted Log";
        keys.forEach(bookId => {
          const bs = bookStats[bookId];
          const subProg = progress.getSubjectProgress(username, bs.id, bs.chaptersCount);
          
          // Generate detailed list of attempts
          const attemptsHTML = bs.attemptsList.map(att => {
            const chConf = (subjectsConfig[bs.id].chapters || []).find(c => c.id === att.chapterId) || { displayName: att.chapterId };
            const formattedDate = new Date(att.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            return `
              <div class="stats-detail-attempt-item">
                <span class="stats-detail-attempt-chapter">${chConf.displayName}</span>
                <span class="stats-detail-attempt-score">${att.score} / ${att.totalQuestions} (${att.accuracy}%) &bull; ${formattedDate}</span>
              </div>
            `;
          }).join('');

          bodyHTML += `
            <div class="stats-detail-book-row clickable-book-row" style="cursor: pointer;">
              <div class="stats-detail-book-header" style="border-bottom: none; display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div class="stats-detail-book-title">
                  <h3 style="font-size: 0.9rem; color: var(--accent); text-transform: uppercase; font-family: var(--font-mono); font-weight: 700; margin-bottom: 0.25rem;">${bs.category}</h3>
                  <div style="font-size: 1.1rem; color: var(--text-primary); font-family: var(--font-display); font-weight: 600;">${bs.title}</div>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                  <span class="stats-detail-high-level-value" style="font-size: 1.15rem; font-weight: 700; color: var(--accent); font-family: var(--font-mono);">${bs.attemptsCount} tests</span>
                  <span class="stats-detail-chevron" style="transition: transform 0.25s ease; color: var(--text-secondary); font-size: 0.75rem;">▼</span>
                </div>
              </div>
              
              <div class="stats-detail-book-collapse" style="display: none; padding-top: 1rem; border-top: 1px dashed rgba(255, 255, 255, 0.08); margin-top: 0.25rem;">
                <div class="stats-detail-metrics-grid">
                  <div class="stats-detail-metric-item">
                    <div class="stats-detail-metric-label">Completion</div>
                    <div class="stats-detail-metric-value">${subProg.percentComplete}%</div>
                  </div>
                  <div class="stats-detail-metric-item">
                    <div class="stats-detail-metric-label">Tests Taken</div>
                    <div class="stats-detail-metric-value">${bs.attemptsCount}</div>
                  </div>
                </div>
                <div class="stats-detail-attempts-sublist">
                  <div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--accent); margin-bottom: 0.25rem; font-weight: 700; text-transform: uppercase;">Attempts History</div>
                  ${attemptsHTML}
                </div>
              </div>
            </div>
          `;
        });
      } else if (statType === 'accuracy') {
        titleText = "Average Score Breakdown";
        keys.forEach(bookId => {
          const bs = bookStats[bookId];
          const avgScore = bs.totalQuestions > 0 ? Math.round((bs.totalCorrect / bs.totalQuestions) * 100) : 0;
          const accuracies = bs.attemptsList.map(a => a.accuracy);
          const maxAccuracy = accuracies.length > 0 ? Math.max(...accuracies) : 0;

          bodyHTML += `
            <div class="stats-detail-book-row clickable-book-row" style="cursor: pointer;">
              <div class="stats-detail-book-header" style="border-bottom: none; display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div class="stats-detail-book-title">
                  <h3 style="font-size: 0.9rem; color: var(--accent); text-transform: uppercase; font-family: var(--font-mono); font-weight: 700; margin-bottom: 0.25rem;">${bs.category}</h3>
                  <div style="font-size: 1.1rem; color: var(--text-primary); font-family: var(--font-display); font-weight: 600;">${bs.title}</div>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                  <span class="stats-detail-high-level-value" style="font-size: 1.15rem; font-weight: 700; color: var(--wrong-light); font-family: var(--font-mono);">${avgScore}%</span>
                  <span class="stats-detail-chevron" style="transition: transform 0.25s ease; color: var(--text-secondary); font-size: 0.75rem;">▼</span>
                </div>
              </div>
              
              <div class="stats-detail-book-collapse" style="display: none; padding-top: 1rem; border-top: 1px dashed rgba(255, 255, 255, 0.08); margin-top: 0.25rem;">
                <div class="stats-detail-metrics-grid">
                  <div class="stats-detail-metric-item">
                    <div class="stats-detail-metric-label">Average Score</div>
                    <div class="stats-detail-metric-value" style="color: var(--wrong-light);">${avgScore}%</div>
                  </div>
                  <div class="stats-detail-metric-item">
                    <div class="stats-detail-metric-label">Highest Score</div>
                    <div class="stats-detail-metric-value" style="color: #10b981;">${maxAccuracy}%</div>
                  </div>
                  <div class="stats-detail-metric-item">
                    <div class="stats-detail-metric-label">Correct Answers</div>
                    <div class="stats-detail-metric-value">${bs.totalCorrect} / ${bs.totalQuestions}</div>
                  </div>
                </div>
              </div>
            </div>
          `;
        });
      } else if (statType === 'time') {
        titleText = "Study Time Breakdown";
        keys.forEach(bookId => {
          const bs = bookStats[bookId];
          const avgTime = Math.round(bs.totalTime / bs.attemptsCount);

          bodyHTML += `
            <div class="stats-detail-book-row clickable-book-row" style="cursor: pointer;">
              <div class="stats-detail-book-header" style="border-bottom: none; display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div class="stats-detail-book-title">
                  <h3 style="font-size: 0.9rem; color: var(--accent); text-transform: uppercase; font-family: var(--font-mono); font-weight: 700; margin-bottom: 0.25rem;">${bs.category}</h3>
                  <div style="font-size: 1.1rem; color: var(--text-primary); font-family: var(--font-display); font-weight: 600;">${bs.title}</div>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                  <span class="stats-detail-high-level-value" style="font-size: 1.15rem; font-weight: 700; color: var(--accent); font-family: var(--font-mono);">${formatTime(bs.totalTime)}</span>
                  <span class="stats-detail-chevron" style="transition: transform 0.25s ease; color: var(--text-secondary); font-size: 0.75rem;">▼</span>
                </div>
              </div>
              
              <div class="stats-detail-book-collapse" style="display: none; padding-top: 1rem; border-top: 1px dashed rgba(255, 255, 255, 0.08); margin-top: 0.25rem;">
                <div class="stats-detail-metrics-grid">
                  <div class="stats-detail-metric-item">
                    <div class="stats-detail-metric-label">Total Time Spent</div>
                    <div class="stats-detail-metric-value">${formatTime(bs.totalTime)}</div>
                  </div>
                  <div class="stats-detail-metric-item">
                    <div class="stats-detail-metric-label">Average Time / Test</div>
                    <div class="stats-detail-metric-value">${formatTime(avgTime)}</div>
                  </div>
                  <div class="stats-detail-metric-item">
                    <div class="stats-detail-metric-label">Active Modules</div>
                    <div class="stats-detail-metric-value">${bs.attemptsCount}</div>
                  </div>
                </div>
              </div>
            </div>
          `;
        });
      } else if (statType === 'questions') {
        titleText = "Questions Answered Breakdown";
        keys.forEach(bookId => {
          const bs = bookStats[bookId];
          const avgScore = bs.totalQuestions > 0 ? Math.round((bs.totalCorrect / bs.totalQuestions) * 100) : 0;

          bodyHTML += `
            <div class="stats-detail-book-row clickable-book-row" style="cursor: pointer;">
              <div class="stats-detail-book-header" style="border-bottom: none; display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div class="stats-detail-book-title">
                  <h3 style="font-size: 0.9rem; color: var(--accent); text-transform: uppercase; font-family: var(--font-mono); font-weight: 700; margin-bottom: 0.25rem;">${bs.category}</h3>
                  <div style="font-size: 1.1rem; color: var(--text-primary); font-family: var(--font-display); font-weight: 600;">${bs.title}</div>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                  <span class="stats-detail-high-level-value" style="font-size: 1.15rem; font-weight: 700; color: var(--accent); font-family: var(--font-mono);">${bs.totalQuestions} Qs</span>
                  <span class="stats-detail-chevron" style="transition: transform 0.25s ease; color: var(--text-secondary); font-size: 0.75rem;">▼</span>
                </div>
              </div>
              
              <div class="stats-detail-book-collapse" style="display: none; padding-top: 1rem; border-top: 1px dashed rgba(255, 255, 255, 0.08); margin-top: 0.25rem;">
                <div class="stats-detail-metrics-grid">
                  <div class="stats-detail-metric-item">
                    <div class="stats-detail-metric-label">Questions Answered</div>
                    <div class="stats-detail-metric-value">${bs.totalQuestions}</div>
                  </div>
                  <div class="stats-detail-metric-item">
                    <div class="stats-detail-metric-label">Correct Answers</div>
                    <div class="stats-detail-metric-value" style="color: #10b981;">${bs.totalCorrect}</div>
                  </div>
                  <div class="stats-detail-metric-item">
                    <div class="stats-detail-metric-label">Incorrect Answers</div>
                    <div class="stats-detail-metric-value" style="color: var(--wrong);">${bs.totalQuestions - bs.totalCorrect}</div>
                  </div>
                  <div class="stats-detail-metric-item">
                    <div class="stats-detail-metric-label">Average Accuracy</div>
                    <div class="stats-detail-metric-value">${avgScore}%</div>
                  </div>
                </div>
              </div>
            </div>
          `;
        });
      }
    }

    backdrop.innerHTML = `
      <div class="stats-detail-modal-card">
        <div class="stats-detail-modal-header">
          <h2>${titleText}</h2>
          <button id="closeStatsModalBtn" aria-label="Close details" class="close-btn" style="background: none; border: none; color: var(--text-secondary); font-size: 2.2rem; cursor: pointer; line-height: 1; display: flex; align-items: center; justify-content: center; transition: color 0.2s, transform 0.2s;">&times;</button>
        </div>
        <div class="stats-detail-modal-body">
          ${bodyHTML}
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    setTimeout(() => backdrop.classList.add('active'), 50);

    const closeStatsModal = () => {
      backdrop.classList.remove('active');
      document.body.style.overflow = originalOverflow;
      setTimeout(() => backdrop.remove(), 300);
    };

    backdrop.querySelector('#closeStatsModalBtn').addEventListener('click', closeStatsModal);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeStatsModal();
    });

    // Accordion interaction logic
    const bookRows = backdrop.querySelectorAll('.clickable-book-row');
    bookRows.forEach(row => {
      row.addEventListener('click', (e) => {
        const collapseBody = row.querySelector('.stats-detail-book-collapse');
        const chevron = row.querySelector('.stats-detail-chevron');
        const header = row.querySelector('.stats-detail-book-header');
        const isCollapsed = collapseBody.style.display === 'none';

        // Collapse all others
        bookRows.forEach(otherRow => {
          otherRow.querySelector('.stats-detail-book-collapse').style.display = 'none';
          otherRow.querySelector('.stats-detail-chevron').style.transform = 'rotate(0deg)';
          otherRow.querySelector('.stats-detail-book-header').style.borderBottom = 'none';
          otherRow.querySelector('.stats-detail-book-header').style.paddingBottom = '0';
        });

        // Toggle selected
        if (isCollapsed) {
          collapseBody.style.display = 'block';
          chevron.style.transform = 'rotate(180deg)';
          header.style.borderBottom = '1px dashed rgba(255, 255, 255, 0.08)';
          header.style.paddingBottom = '0.5rem';
          if (document.body.classList.contains('light-mode')) {
            header.style.borderBottomColor = 'rgba(0, 0, 0, 0.06)';
          }
        }
      });
    });
  },

  // 8.5bb-2. Trigger Flying Jet Easter Egg
  triggerJetFlyby() {
    let jet = document.getElementById('dashboardFlyingJet');
    if (!jet) {
      jet = document.createElement('img');
      jet.id = 'dashboardFlyingJet';
      jet.src = '/images/easypl_aircraft.png';
      jet.style.position = 'absolute';
      jet.style.pointerEvents = 'none';
      jet.style.zIndex = '2'; // placed relative to background layers/clouds
      jet.style.width = '240px'; // 2x larger
      jet.style.height = 'auto';
      jet.style.opacity = '0';
      jet.style.filter = 'drop-shadow(0 12px 24px rgba(0,0,0,0.45))';
      
      const bg = document.querySelector('.poster-parallax-bg') || document.querySelector('.global-sky-bg') || document.body;
      bg.appendChild(jet);
    }
    
    if (jet.dataset.flying === 'true') return;
    jet.dataset.flying = 'true';
    
    const startY = Math.floor(Math.random() * (window.innerHeight - 350)) + 100;
    const endY = startY + (Math.random() * 200 - 100);
    
    jet.style.transition = 'none';
    jet.style.opacity = '0';
    
    // Always fly left to right (facing forward naturally)
    jet.style.left = '-300px';
    jet.style.top = `${startY}px`;
    jet.style.transform = 'scaleX(1) rotate(5deg)';
    
    setTimeout(() => {
      jet.style.transition = 'left 8.0s linear, top 8.0s linear, opacity 0.8s ease';
      jet.style.opacity = '0.9'; // blend into background
      jet.style.left = `${window.innerWidth + 300}px`;
      jet.style.top = `${endY}px`;
      jet.style.transform = 'scaleX(1) rotate(10deg)';
    }, 50);
    
    setTimeout(() => {
      jet.style.opacity = '0';
      jet.dataset.flying = 'false';
    }, 8500);
  },

  // 8.5c. Show Question Search Modal
  showQuestionSearchModal() {
    // 1. Remove existing backdrop to prevent duplicates
    const oldModal = document.getElementById('questionSearchModalBackdrop');
    if (oldModal) oldModal.remove();

    // 2. Disable body overflow scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // 3. Create the backdrop element
    const backdrop = document.createElement('div');
    backdrop.className = 'search-modal-backdrop';
    backdrop.id = 'questionSearchModalBackdrop';

    backdrop.innerHTML = `
      <div class="search-modal-card">
        <div class="search-modal-header">
          <h2>Search Questions</h2>
          <button id="closeSearchModalBtn" aria-label="Close Search">&times;</button>
        </div>
        <div class="search-modal-body">
          <!-- Left Column: Search & Results -->
          <div class="search-sidebar">
            <div class="search-input-container">
              <input type="text" class="search-bar-input" id="searchBarInput" placeholder="Type keywords to search..." autocomplete="off">
            </div>
            <div class="search-meta-results" id="searchMetaResults">
              Enter keywords to search across all topics
            </div>
            <div class="search-results-list" id="searchResultsList">
              <div class="preview-empty-state" style="padding-top: 2rem;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <span>Type above to start looking up questions</span>
              </div>
            </div>
          </div>
          <!-- Right Column: Question Preview -->
          <div class="search-preview-pane" id="searchPreviewPane">
            <div class="preview-empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <span>Select a question from the list to preview details</span>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    // Trigger transition
    setTimeout(() => backdrop.classList.add('active'), 50);

    const closeSearchModal = () => {
      backdrop.classList.remove('active');
      document.body.style.overflow = originalOverflow;
      setTimeout(() => backdrop.remove(), 300);
    };

    backdrop.querySelector('#closeSearchModalBtn').addEventListener('click', closeSearchModal);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeSearchModal();
    });

    const searchInput = backdrop.querySelector('#searchBarInput');
    const resultsList = backdrop.querySelector('#searchResultsList');
    const metaResults = backdrop.querySelector('#searchMetaResults');
    const previewPane = backdrop.querySelector('#searchPreviewPane');

    let allQuestions = [];

    // Load static search index
    const loadSearchIndex = async () => {
      if (window.searchIndexCache) {
        allQuestions = window.searchIndexCache;
        return;
      }
      try {
        metaResults.textContent = "Loading questions database...";
        const res = await fetch('search_index.json');
        if (!res.ok) throw new Error('Search index load failed');
        allQuestions = await res.json();
        window.searchIndexCache = allQuestions;
        metaResults.textContent = `Indexed ${allQuestions.length} total questions`;
      } catch (err) {
        console.error(err);
        metaResults.textContent = "Failed to load questions database";
      }
    };

    loadSearchIndex();

    // Render results
    const renderResults = (results, query) => {
      if (results.length === 0) {
        metaResults.textContent = `0 matches found`;
        resultsList.innerHTML = `
          <div class="preview-empty-state" style="padding-top: 2rem;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span>No questions matched "${query}"</span>
          </div>
        `;
        return;
      }

      metaResults.textContent = `${results.length} matches found`;
      resultsList.innerHTML = '';

      results.forEach((item) => {
        const itemCard = document.createElement('div');
        itemCard.className = 'search-item-card animate-fade-in';
        itemCard.innerHTML = `
          <div class="search-item-meta">
            <span class="tag-subject">${item.subjectTitle}</span>
            <span class="tag-chapter">&gt; ${item.chapterTitle}</span>
          </div>
          <div class="search-item-text">${highlightText(item.questionText, query)}</div>
        `;

        itemCard.addEventListener('click', () => {
          // Highlight selected card
          resultsList.querySelectorAll('.search-item-card').forEach(c => c.classList.remove('selected'));
          itemCard.classList.add('selected');
          
          // Render preview
          renderPreview(item);
        });

        resultsList.appendChild(itemCard);
      });
    };

    const highlightText = (text, query) => {
      if (!query) return text;
      const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`(${escapedQuery})`, 'gi');
      return text.replace(regex, '<mark style="background: rgba(0, 210, 255, 0.25); color: inherit; padding: 0.1rem 0.2rem; border-radius: 2px;">$1</mark>');
    };

    const renderPreview = (item) => {
      const letters = ['A', 'B', 'C', 'D'];
      const optionsHTML = (item.options || []).map((opt, oIdx) => {
        const isCorrect = oIdx === item.answer;
        return `
          <div class="preview-option-item ${isCorrect ? 'correct-answer' : ''}">
            <div class="preview-option-letter">${letters[oIdx] || (oIdx + 1)}</div>
            <div class="preview-option-text">${opt}</div>
          </div>
        `;
      }).join('');

      previewPane.innerHTML = `
        <div class="preview-meta-section">
          <span class="preview-meta-badge">${item.subjectTitle}</span>
          <span class="preview-meta-chapter">${item.chapterTitle}</span>
        </div>
        <div class="preview-question-box">
          ${item.questionText}
        </div>
        <div class="preview-options-list">
          ${optionsHTML}
        </div>
      `;
    };

    // Filter listener
    let searchDebounce;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchDebounce);
      const query = e.target.value.trim().toLowerCase();
      
      if (!query) {
        metaResults.textContent = `Indexed ${allQuestions.length} total questions`;
        resultsList.innerHTML = `
          <div class="preview-empty-state" style="padding-top: 2rem;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span>Type above to start looking up questions</span>
          </div>
        `;
        previewPane.innerHTML = `
          <div class="preview-empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>Select a question from the list to preview details</span>
          </div>
        `;
        return;
      }

      searchDebounce = setTimeout(() => {
        const queryTerms = query.split(/\s+/).filter(t => t.length > 0);
        const matches = allQuestions.filter(q => {
          const qText = q.questionText.toLowerCase();
          // Match all terms
          return queryTerms.every(term => qText.includes(term));
        });
        // Limit to top 50 matches for performance/scrolling ease
        renderResults(matches.slice(0, 50), query);
      }, 200);
    });

    // Auto-focus search input
    setTimeout(() => searchInput.focus(), 150);
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
