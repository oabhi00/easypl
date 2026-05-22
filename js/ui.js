/**
 * UI Rendering Module
 * Builds and inserts DOM layouts for all application views with an aviation cockpit HUD theme
 */

import { progress } from './progress.js';

// Premium Aviation SVG Graphic Generator
const getSubjectGraphic = (category) => {
  const normCat = (category || '').toUpperCase();
  
  if (normCat.includes('METEOROLOGY') || normCat.includes('MET')) {
    // Meteorology Radar display
    return `
      <svg viewBox="0 0 100 100" style="width: 100%; height: 100%;">
        <circle cx="50" cy="50" r="45" fill="none" stroke="var(--correct)" stroke-width="1.5" opacity="0.3"/>
        <circle cx="50" cy="50" r="30" fill="none" stroke="var(--correct)" stroke-width="0.75" stroke-dasharray="3, 3" opacity="0.25"/>
        <circle cx="50" cy="50" r="15" fill="none" stroke="var(--correct)" stroke-width="0.75" stroke-dasharray="3, 3" opacity="0.25"/>
        <line x1="5" y1="50" x2="95" y2="50" stroke="var(--correct)" stroke-width="0.5" opacity="0.2"/>
        <line x1="50" y1="5" x2="50" y2="95" stroke="var(--correct)" stroke-width="0.5" opacity="0.2"/>
        <path d="M50,50 L50,6 A44,44 0 0,1 81,18 Z" fill="url(#radarGradient)" class="met-radar-sweep" />
        <path d="M63,33 Q67,29 70,34 Q73,39 67,41 Z" fill="var(--correct)" opacity="0.5" />
        <path d="M28,62 Q31,60 33,63 Q35,66 30,68 Z" fill="var(--correct)" opacity="0.3" />
        <defs>
          <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="var(--correct)" stop-opacity="0.35"/>
            <stop offset="90%" stop-color="var(--correct)" stop-opacity="0.05"/>
            <stop offset="100%" stop-color="var(--correct)" stop-opacity="0"/>
          </radialGradient>
        </defs>
      </svg>
    `;
  } else if (normCat.includes('NAVIGATION') || normCat.includes('NAV')) {
    // Air Navigation Compass Rose
    return `
      <svg viewBox="0 0 100 100" class="nav-compass-rose" style="width: 100%; height: 100%;">
        <circle cx="50" cy="50" r="45" fill="none" stroke="var(--accent)" stroke-width="1.5" opacity="0.3"/>
        <circle cx="50" cy="50" r="41" fill="none" stroke="var(--accent)" stroke-dasharray="1, 3" stroke-width="1" opacity="0.4"/>
        <line x1="50" y1="5" x2="50" y2="10" stroke="var(--accent)" stroke-width="2" />
        <line x1="50" y1="90" x2="50" y2="95" stroke="var(--accent)" stroke-width="1.5" />
        <line x1="5" y1="50" x2="10" y2="50" stroke="var(--accent)" stroke-width="1.5" />
        <line x1="90" y1="50" x2="95" y2="50" stroke="var(--accent)" stroke-width="1.5" />
        <text x="50" y="16" fill="var(--accent-light)" font-size="9" font-family="var(--font-mono)" text-anchor="middle" font-weight="bold">N</text>
        <text x="50" y="89" fill="var(--accent-light)" font-size="8" font-family="var(--font-mono)" text-anchor="middle">S</text>
        <text x="17" y="53" fill="var(--accent-light)" font-size="8" font-family="var(--font-mono)" text-anchor="middle">W</text>
        <text x="83" y="53" fill="var(--accent-light)" font-size="8" font-family="var(--font-mono)" text-anchor="middle">E</text>
        <path d="M50,28 L53,42 L66,46 L53,50 L53,64 L59,68 L50,66 L41,68 L47,64 L47,50 L34,46 L47,42 Z" fill="var(--accent)" opacity="0.85" />
        <line x1="50" y1="28" x2="50" y2="18" stroke="var(--accent)" stroke-width="1" stroke-dasharray="2,2" />
      </svg>
    `;
  } else if (normCat.includes('TECHNICAL') || normCat.includes('TECH')) {
    // Technical jet turbine icon
    return `
      <svg viewBox="0 0 100 100" style="width: 100%; height: 100%;">
        <circle cx="50" cy="50" r="45" fill="none" stroke="var(--hud-amber)" stroke-width="2" opacity="0.3"/>
        <circle cx="50" cy="50" r="41" fill="none" stroke="var(--hud-amber)" stroke-width="0.75" stroke-dasharray="2, 2" opacity="0.25"/>
        <g class="tech-turbofan">
          <circle cx="50" cy="50" r="12" fill="none" stroke="var(--hud-amber)" stroke-width="1.5" />
          <path d="M50,38 C52,24 43,14 43,14 C43,14 56,24 50,38 Z" fill="var(--hud-amber)" opacity="0.7"/>
          <path d="M50,62 C48,76 57,86 57,86 C57,86 44,76 50,62 Z" fill="var(--hud-amber)" opacity="0.7"/>
          <path d="M38,50 C24,48 14,57 14,57 C14,57 24,44 38,50 Z" fill="var(--hud-amber)" opacity="0.7"/>
          <path d="M62,50 C76,52 86,43 86,43 C86,43 76,57 62,50 Z" fill="var(--hud-amber)" opacity="0.7"/>
          <path d="M41,41 C30,30 22,38 22,38 C22,38 35,35 41,41 Z" fill="var(--hud-amber)" opacity="0.7"/>
          <path d="M59,59 C70,70 78,62 78,62 C78,62 65,65 59,59 Z" fill="var(--hud-amber)" opacity="0.7"/>
          <path d="M41,59 C30,70 38,78 38,78 C38,78 35,65 41,59 Z" fill="var(--hud-amber)" opacity="0.7"/>
          <path d="M59,41 C70,30 62,22 62,22 C62,22 65,35 59,41 Z" fill="var(--hud-amber)" opacity="0.7"/>
          <circle cx="50" cy="50" r="6" fill="var(--bg-secondary)"/>
          <path d="M50,47 C52,47 53,49 50,53 C48,51 48,47 50,47 Z" fill="var(--hud-amber)"/>
        </g>
      </svg>
    `;
  } else {
    // Air Regulations landing chart / runway indicator
    return `
      <svg viewBox="0 0 100 100" style="width: 100%; height: 100%;">
        <circle cx="50" cy="50" r="45" fill="none" stroke="var(--accent)" stroke-width="1" opacity="0.2"/>
        <line x1="50" y1="12" x2="50" y2="88" stroke="var(--accent)" stroke-width="5" opacity="0.15" />
        <line x1="50" y1="12" x2="50" y2="88" stroke="var(--accent)" stroke-width="1.2" stroke-dasharray="4,4" class="runway-guidance" />
        <line x1="43" y1="20" x2="43" y2="80" stroke="var(--accent)" stroke-width="1.5" opacity="0.3" />
        <line x1="57" y1="20" x2="57" y2="80" stroke="var(--accent)" stroke-width="1.5" opacity="0.3" />
        <circle cx="50" cy="50" r="9" fill="none" stroke="var(--accent)" stroke-width="1.5" />
        <line x1="22" y1="50" x2="78" y2="50" stroke="var(--accent)" stroke-width="0.75" stroke-dasharray="3, 3" />
        <line x1="50" y1="22" x2="50" y2="78" stroke="var(--accent)" stroke-width="0.75" stroke-dasharray="3, 3" />
        <line x1="38" y1="80" x2="62" y2="80" stroke="var(--accent)" stroke-width="1" opacity="0.5" />
        <line x1="40" y1="84" x2="60" y2="84" stroke="var(--accent)" stroke-width="1" opacity="0.5" />
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
  renderLanding(container, onEngage) {
    const metSVG = getSubjectGraphic('Meteorology');
    const navSVG = getSubjectGraphic('Navigation');
    const techSVG = getSubjectGraphic('Technical');
    const regSVG = getSubjectGraphic('Regulations');

    container.innerHTML = `
      <div class="landing-container animate-fade-in">
        <!-- Top Navigation Bar -->
        <header class="landing-header">
          <div class="landing-logo">
            <span class="logo-icon">✈️</span>
            <span class="logo-text">EasyPL</span>
          </div>
          <div class="landing-nav-actions">
            <button class="btn btn-outline" id="landingLoginBtn" style="padding: 0.5rem 1.2rem; font-size: 0.8rem;">Log In</button>
          </div>
        </header>

        <!-- Hero Section (Split Grid) -->
        <section class="landing-hero-split">
          <!-- Left: Hero Text & CTAs -->
          <div class="hero-content">
            <div class="hero-badge">✈️ DGCA Exam Preparation</div>
            <h1 class="hero-title text-gradient">Clear Your DGCA Exams with Confidence</h1>
            <p class="hero-description">
              Study smart and pass your pilot theory papers. EasyPL provides high-quality mock tests, performance logs, and real exam conditions for Indian commercial pilot license candidates.
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

          <!-- Right: Interactive Glass Dashboard Widget Preview -->
          <div class="hero-widget-container">
            <div class="glass-widget" style="transform-style: preserve-3d; perspective: 1000px;">
              <div class="widget-header">
                <span class="status-indicator"></span>
                <span class="widget-title">FLIGHT INSTRUMENT MONITOR</span>
              </div>
              <div class="widget-body">
                <div class="widget-gyro-wrapper" style="transform: translateZ(30px);">
                  <svg class="interactive-gyro" viewBox="0 0 100 100">
                    <!-- HUD Dial circle -->
                    <circle cx="50" cy="50" r="45" fill="none" stroke="var(--accent)" stroke-width="1" opacity="0.3"/>
                    <circle cx="50" cy="50" r="38" fill="none" stroke="var(--accent)" stroke-width="1" stroke-dasharray="2 3" opacity="0.4"/>
                    
                    <!-- Gyro horizon pitch tape -->
                    <g class="gyro-rotator" style="transform-origin: 50px 50px; transition: transform 0.1s ease-out;">
                      <line x1="25" y1="50" x2="75" y2="50" stroke="var(--accent)" stroke-width="1.5"/>
                      <line x1="35" y1="42" x2="65" y2="42" stroke="var(--accent)" stroke-width="0.8" opacity="0.8"/>
                      <line x1="35" y1="58" x2="65" y2="58" stroke="var(--accent)" stroke-width="0.8" opacity="0.8"/>
                    </g>
                    
                    <!-- Airplane symbol -->
                    <path d="M42,50 L47,50 L50,45 L53,50 L58,50 M50,45 L50,53" fill="none" stroke="var(--wrong)" stroke-width="1.8" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="widget-stats" style="transform: translateZ(20px); width: 100%;">
                  <div class="widget-stat-item">
                    <span class="stat-lbl">Active Mode</span>
                    <span class="stat-val text-accent">Exam Prep</span>
                  </div>
                  <div class="widget-stat-item">
                    <span class="stat-lbl">Safety Margin</span>
                    <span class="stat-val text-correct">100% Safe</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Subjects Grid Showcase -->
        <div>
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
          </div>
        </div>

        <!-- Pre-Flight Checklist Steps -->
        <div class="landing-steps-section">
          <div class="landing-section-title">How It Works</div>
          <div class="landing-steps-grid">
            <div class="landing-step-card">
              <div class="landing-step-num">STEP 01 //</div>
              <h4>Create Account</h4>
              <p>Set up your pilot profile, choose your custom crew avatar, and get ready to study.</p>
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
        </div>

        <!-- System Stats Telemetry Footer -->
        <div class="landing-footer">
          <span>EasyPL Pilot Examination Helper — Keep Learning, Fly Safe.</span>
        </div>
      </div>
    `;

    // Hook clicks
    document.getElementById('engageCockpitBtn').addEventListener('click', onEngage);
    document.getElementById('landingLoginBtn').addEventListener('click', onEngage);
    
    document.getElementById('exploreSystemsBtn').addEventListener('click', () => {
      const target = document.querySelector('.landing-section-title');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    // Interactive mouse move rotation effect on the gyro widget
    const glassWidget = container.querySelector('.glass-widget');
    const gyroRotator = container.querySelector('.gyro-rotator');
    if (glassWidget && gyroRotator) {
      glassWidget.addEventListener('mousemove', (e) => {
        const rect = glassWidget.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        // Tilt the card slightly
        glassWidget.style.transform = `translateY(-5px) rotateX(${-y / 15}deg) rotateY(${x / 15}deg) scale(1.02)`;
        // Rotate the gyro line inside slightly
        gyroRotator.style.transform = `rotate(${x / 4}deg)`;
      });
      glassWidget.addEventListener('mouseleave', () => {
        glassWidget.style.transform = '';
        gyroRotator.style.transform = '';
      });
    }
  },

  // 1. Render Authentication Screen (Pre-Flight BRIEFING Terminal)
  renderAuth(container, isLogin, onToggle, onSubmit, onBackToSplash) {
    container.innerHTML = `
      <div class="auth-wrapper card animate-fade-in">
        ${onBackToSplash ? `
          <div class="auth-back" id="authBackBtn" title="Back to Home">
            ✕ BACK TO HOME
          </div>
        ` : ''}
        <div class="auth-header">
          <h1 class="text-gradient">EasyPL</h1>
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
              <div class="avatar-selector">
                <div class="avatar-option selected" data-avatar="avatar1.png">
                  <img src="https://api.dicebear.com/7.x/bottts/svg?seed=captain" alt="Captain">
                </div>
                <div class="avatar-option" data-avatar="avatar2.png">
                  <img src="https://api.dicebear.com/7.x/bottts/svg?seed=aviator" alt="Aviator">
                </div>
                <div class="avatar-option" data-avatar="avatar3.png">
                  <img src="https://api.dicebear.com/7.x/bottts/svg?seed=airman" alt="Airman">
                </div>
                <div class="avatar-option" data-avatar="avatar4.png">
                  <img src="https://api.dicebear.com/7.x/bottts/svg?seed=flightdesk" alt="Crew">
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
    if (avatar === 'avatar1.png') return 'https://api.dicebear.com/7.x/bottts/svg?seed=captain';
    if (avatar === 'avatar2.png') return 'https://api.dicebear.com/7.x/bottts/svg?seed=aviator';
    if (avatar === 'avatar3.png') return 'https://api.dicebear.com/7.x/bottts/svg?seed=airman';
    if (avatar === 'avatar4.png') return 'https://api.dicebear.com/7.x/bottts/svg?seed=flightdesk';
    return 'https://api.dicebear.com/7.x/bottts/svg?seed=captain';
  },

  // 2. Render Study Dashboard View (Flight Command Console)
  renderDashboard(container, user, stats, subjects, onSubjectClick, onLogout) {
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
            <div class="history-score ${att.accuracy >= 70 ? 'score-pass' : 'score-fail'}">
              ${att.score}/${att.totalQuestions} (${att.accuracy}%)
            </div>
          </div>
        `;
      }).join('');
    }

    container.innerHTML = `
      <div class="dashboard-header animate-fade-in">
        <div class="profile-card">
          <img class="profile-avatar" src="${avatarUrl}" alt="User Avatar">
          <div class="profile-info">
            <h3>Welcome, ${user.username}</h3>
            <p>STUDENT PILOT</p>
          </div>
        </div>
        <button class="btn btn-outline" id="logoutBtn">Log Out</button>
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
      <h2 class="section-title animate-fade-in">Recent Attempts</h2>
      <div class="card history-list animate-fade-in">
        ${historyHTML}
      </div>
    `;

    // Hook listeners
    document.getElementById('logoutBtn').addEventListener('click', onLogout);
    
    const cards = document.querySelectorAll('.subject-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        onSubjectClick(card.dataset.id);
      });
    });
  },

  // 2b. Render Books selector list (sub-databases under a major subject)
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
      const statusClass = hasAttempted ? 'status-completed' : 'status-not-started';
      const statusText = hasAttempted ? `Passed (${chProgress.highScore}% score)` : 'NOT STARTED';
      
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
    const { questionNumber, totalQuestions, questionText, options, imageSrc, selectedAnswerIndex, isAnswered, correctAnswerIndex } = quizData;
    
    // Generate options HTML list
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    let optionsHTML = '';
    options.forEach((opt, idx) => {
      let stateClass = '';
      
      // If user answered, display color codes
      if (isAnswered) {
        if (idx === correctAnswerIndex) {
          stateClass = 'show-correct';
        }
        if (selectedAnswerIndex === idx) {
          stateClass = selectedAnswerIndex === correctAnswerIndex ? 'selected-correct' : 'selected-wrong';
        }
      }
      
      optionsHTML += `
        <button class="option-btn ${stateClass}" data-idx="${idx}" ${isAnswered ? 'disabled' : ''}>
          <div class="option-letter">${letters[idx] || (idx + 1)}</div>
          <div class="option-text">${opt}</div>
        </button>
      `;
    });

    const progressPercent = Math.round((questionNumber / totalQuestions) * 100);

    container.innerHTML = `
      <div class="quiz-header animate-fade-in">
        <div class="quiz-title-box">
          <span class="quiz-subtitle" id="quizSubTitle">EXAM IN PROGRESS</span>
          <h2 style="font-size: 1.3rem; text-transform: uppercase;" id="quizMainTitle">Question</h2>
        </div>
        <div class="timer-box" id="quizTimer">⏱️ Time: 00:00</div>
      </div>

      <!-- Question Progress Bar -->
      <div class="quiz-progress-wrapper animate-fade-in">
        <div class="quiz-progress-text">
          <span>Question <strong>${questionNumber}</strong> of <strong>${totalQuestions}</strong></span>
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
          
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: center;">
            <button class="btn btn-outline" id="quizQuitDiscardBtn" style="border-color: rgba(255, 74, 118, 0.4); color: var(--wrong-light)">Quit & Discard</button>
            <button class="btn btn-outline" id="quizQuitSubmitBtn" style="border-color: rgba(5, 243, 173, 0.4); color: var(--correct-light)">Quit & Submit</button>
          </div>
          
          ${questionNumber === totalQuestions ? `
            <button class="btn btn-primary" id="quizSubmitBtn" ${!isAnswered ? 'disabled style="opacity:0.3; pointer-events:none;"' : ''}>Submit Exam</button>
          ` : `
            <button class="btn btn-secondary" id="quizNextBtn" ${!isAnswered ? 'disabled style="opacity:0.3; pointer-events:none;"' : ''}>Next Question &rarr;</button>
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
    document.getElementById('quizQuitDiscardBtn').addEventListener('click', onQuitDiscard);
    document.getElementById('quizQuitSubmitBtn').addEventListener('click', onQuitSubmit);
    
    if (questionNumber === totalQuestions) {
      document.getElementById('quizSubmitBtn').addEventListener('click', onSubmit);
    } else {
      document.getElementById('quizNextBtn').addEventListener('click', onNext);
    }
  },

  // 5. Render final scorecard results (Cockpit ATTITUDE INDICATOR Theme)
  renderResults(container, results, onRestart, onDashboard) {
    const { score, totalQuestions, timeTaken, accuracy, questionsReviewed } = results;
    
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;
    const timeDisplay = `${minutes}m ${seconds}s`;
    
    const isPassing = accuracy >= 70;
    const pitchOffset = isPassing ? -15 : 20; // altitude pitch adjustments
    const rollAngle = isPassing ? -8 : 12;    // bank angle rotation

    // Dynamic flight instrument: Attitude Indicator (Sky/Ground HUD dial)
    const attitudeSVG = `
      <svg class="result-circle-svg" viewBox="0 0 100 100" style="position: absolute; top:0; left:0; width:100%; height:100%; z-index: 1;">
        <defs>
          <clipPath id="aiCircleClip">
            <circle cx="50" cy="50" r="45" />
          </clipPath>
        </defs>
        
        <g clip-path="url(#aiCircleClip)">
          <!-- Sky region -->
          <rect x="-10" y="-10" width="120" height="120" fill="#0069a5"/>
          <!-- Ground region rotated by Bank angle and translated by Pitch -->
          <g transform="translate(50, 50) rotate(${rollAngle}) translate(-50, -50)">
            <rect x="-20" y="${50 + pitchOffset}" width="140" height="100" fill="#4d320c" stroke="#fff" stroke-width="0.5" />
            <!-- Horizon white line -->
            <line x1="-20" y1="${50 + pitchOffset}" x2="120" y2="${50 + pitchOffset}" stroke="#fff" stroke-width="1.5"/>
            
            <!-- Pitch Grid Indicators -->
            <line x1="42" y1="${35 + pitchOffset}" x2="58" y2="${35 + pitchOffset}" stroke="rgba(255,255,255,0.7)" stroke-width="0.75" />
            <text x="35" y="${37 + pitchOffset}" fill="rgba(255,255,255,0.7)" font-size="5" font-family="var(--font-mono)">10</text>
            <text x="61" y="${37 + pitchOffset}" fill="rgba(255,255,255,0.7)" font-size="5" font-family="var(--font-mono)">10</text>
            
            <line x1="42" y1="${65 + pitchOffset}" x2="58" y2="${65 + pitchOffset}" stroke="rgba(255,255,255,0.7)" stroke-width="0.75" />
            <text x="35" y="${67 + pitchOffset}" fill="rgba(255,255,255,0.7)" font-size="5" font-family="var(--font-mono)">10</text>
            <text x="61" y="${67 + pitchOffset}" fill="rgba(255,255,255,0.7)" font-size="5" font-family="var(--font-mono)">10</text>
          </g>
        </g>
        
        <!-- Arc Progress Gauge -->
        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="3"></circle>
        <circle cx="50" cy="50" r="45" fill="none" stroke="${isPassing ? 'var(--correct)' : 'var(--wrong)'}" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="283" stroke-dashoffset="${283 - (283 * accuracy) / 100}" transform="rotate(-90 50 50)"></circle>
        
        <!-- Standard markings -->
        <path d="M50,9 L50,13 M35,11 L37,14 M65,11 L63,14 M21,17 L24,19 M79,17 L76,19" stroke="#fff" stroke-width="0.75" opacity="0.6" />
        <polygon points="50,13 48,17 52,17" fill="var(--hud-amber)" />
        
        <!-- Airplane silhouette reference mark -->
        <rect x="33" y="49" width="13" height="2" fill="#ff4a76" stroke="#000" stroke-width="0.5" />
        <rect x="54" y="49" width="13" height="2" fill="#ff4a76" stroke="#000" stroke-width="0.5" />
        <circle cx="50" cy="50" r="2" fill="#ff4a76" stroke="#000" stroke-width="0.5" />
      </svg>
    `;

    // Build list of reviewed wrong answers
    const wrongAnswers = questionsReviewed.filter(q => !q.isCorrect);
    let reviewHTML = '';
    if (wrongAnswers.length > 0) {
      reviewHTML = `
        <div class="review-answers-section animate-fade-in">
          <h2 class="section-title">Incorrect Answers (${wrongAnswers.length})</h2>
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${wrongAnswers.map(q => {
              const correctText = q.options[q.correctAnswerIndex];
              const selectedText = q.selectedAnswerIndex !== null ? q.options[q.selectedAnswerIndex] : 'NO ANSWER SELECTED';
              return `
                <div class="review-question-card wrong-item">
                  <div class="review-question-title">${q.questionText.replace(/\n/g, '<br>')}</div>
                  <div class="review-details">
                    <span>❌ Your Answer: <strong style="color: var(--wrong-light);">${selectedText}</strong></span>
                    <span>✅ Correct Answer: <strong style="color: var(--correct-light);">${correctText}</strong></span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    } else {
      reviewHTML = `
        <div class="review-answers-section animate-fade-in" style="text-align: center;">
          <h3 style="color: var(--correct-light); font-size: 1.3rem; text-shadow: 0 0 10px var(--correct-glow);">🎉 CONGRATULATIONS! ALL QUESTIONS ANSWERED CORRECTLY.</h3>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="results-wrapper card animate-fade-in">
        <h1 class="text-gradient" style="font-size: 2.2rem; margin-bottom: 0.5rem; text-transform: uppercase;">Exam Results</h1>
        <p style="color: var(--text-secondary); font-family: var(--font-mono); font-size: 0.85rem;">
          ${isPassing ? 'SUCCESS: PASS MARK EXCEEDED.' : 'FAILED: PASS MARK NOT MET. RETRY REQUIRED.'}
        </p>
        
        <!-- Cockpit Attitude Indicator score display -->
        <div class="result-circle-box">
          ${attitudeSVG}
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
          <div class="result-stat-item">
            <span class="result-stat-label">Target Minimum</span>
            <span class="result-stat-value">70%</span>
          </div>
        </div>

        <div style="display: flex; gap: 1rem; justify-content: center; margin-bottom: 2rem;">
          <button class="btn btn-primary" id="restartTestBtn">Retry Exam</button>
          <button class="btn btn-secondary" id="returnDashBtn">Back to Dashboard</button>
        </div>

        ${reviewHTML}
      </div>
    `;

    // Hook listeners
    document.getElementById('restartTestBtn').addEventListener('click', onRestart);
    document.getElementById('returnDashBtn').addEventListener('click', onDashboard);
  }
};
