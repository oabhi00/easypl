/**
 * Main Application Module (SPA Router & Controller)
 * Orchestrates views, handles navigation events, and coordinates modules
 */

import { auth } from './auth.js';
import { progress } from './progress.js';
import { ui } from './ui.js';
import { QuizPlayer } from './quiz.js';
import { subjects } from './subjects_config.js';

class App {
  constructor() {
    this.container = null;
    this.currentUser = null;
    
    // View state
    this.currentView = 'landing'; // landing, auth, dashboard, books, chapters, quiz, results
    this.isLoginView = false;
    
    // Active selections
    this.activeCategory = null;
    this.activeSubjectId = null;
    this.activeChapter = null;
    this.activeQuizPlayer = null;
    
    // Parallax animation state variables
    this.virtualScrollY = 0;
    this.animatedScrollY = 0;

    // Interactive title cursor gradient state
    this.targetMouseX = 50;
    this.targetMouseY = 50;
    this.currentMouseX = 50;
    this.currentMouseY = 50;
  }

  // Initialize the application
  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    // Wire up light/dark mode theme selector
    this.initTheme();

    // Initialize global parallax for landing/auth backgrounds
    this.initParallax();

    // Check existing session after a 5 second splash load delay
    setTimeout(() => {
      this.currentUser = auth.getCurrentUser();
      
      if (this.currentUser) {
        this.navigate('dashboard');
      } else {
        this.navigate('landing');
      }
    }, 5000);
  }

  // Bind click listener for theme toggle
  initTheme() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    // Check system preference if no manual setting exists
    const savedTheme = localStorage.getItem('easypl_theme');
    if (!savedTheme) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
      const handleThemeChange = (e) => {
        if (!localStorage.getItem('easypl_theme')) {
          if (e.matches) {
            document.body.classList.add('light-mode');
          } else {
            document.body.classList.remove('light-mode');
          }
        }
      };
      mediaQuery.addEventListener('change', handleThemeChange);
    }

    toggleBtn.addEventListener('click', () => {
      const isLight = document.body.classList.contains('light-mode');
      if (isLight) {
        document.body.classList.remove('light-mode');
        localStorage.setItem('easypl_theme', 'dark');
      } else {
        document.body.classList.add('light-mode');
        localStorage.setItem('easypl_theme', 'light');
      }
    });
  }

  // Initialize global attitude indicator parallax & tilt effect
  initParallax() {
    document.addEventListener('mousemove', (e) => {
      // Update cursor coordinates globally for background spotlight
      const percentX = (e.clientX / window.innerWidth) * 100;
      const percentY = (e.clientY / window.innerHeight) * 100;
      document.documentElement.style.setProperty('--cursor-x', `${percentX}%`);
      document.documentElement.style.setProperty('--cursor-y', `${percentY}%`);

      if (document.body.classList.contains('landing-view')) {
        const bgHorizon = document.querySelector('.bg-horizon-group');
        const bgAttitude = document.querySelector('.landing-bg-attitude');
        
        if (bgHorizon) {
          const width = window.innerWidth;
          const height = window.innerHeight;
          const x = e.clientX - width / 2;
          const y = e.clientY - height / 2;
          
          // Calculate smooth bank and pitch angles
          const rollAngle = (x / width) * 35; // max 35 deg bank
          const pitchOffset = (y / height) * 25; // max 25px translation
          
          bgHorizon.style.transform = `rotate(${rollAngle}deg) translate(0px, ${pitchOffset}px)`;

          // Subtle parallax effect on the attitude instrument frame
          if (bgAttitude) {
            const parallaxX = (x / width) * -15; // move slightly opposite to cursor
            const parallaxY = (y / height) * -15;
            bgAttitude.style.transform = `translate(calc(-50% + ${parallaxX}px), calc(-50% + ${parallaxY}px))`;
          }
        }
      } else {
        // Dashboard HUD parallax
        const hudOverlay = document.querySelector('.hud-background-overlay');
        if (hudOverlay) {
          const width = window.innerWidth;
          const height = window.innerHeight;
          const x = e.clientX - width / 2;
          const y = e.clientY - height / 2;
          
          // HUD shift (up to 20px translation and 1.5deg rotation)
          const translateX = (x / width) * 20;
          const translateY = (y / height) * 20;
          const rotateAngle = (x / width) * 1.5;
          
          hudOverlay.style.transform = `translate(calc(-50% + ${translateX}px), calc(-50% + ${translateY}px)) rotate(${rotateAngle}deg)`;
        }
      }
    });

    document.addEventListener('mouseleave', () => {
      if (document.body.classList.contains('landing-view')) {
        const bgHorizon = document.querySelector('.bg-horizon-group');
        const bgAttitude = document.querySelector('.landing-bg-attitude');
        
        if (bgHorizon) {
          bgHorizon.style.transform = 'rotate(0deg) translate(0px, 0px)';
        }
        if (bgAttitude) {
          bgAttitude.style.transform = 'translate(-50%, -50%)';
        }
      } else {
        const hudOverlay = document.querySelector('.hud-background-overlay');
        if (hudOverlay) {
          hudOverlay.style.transform = 'translate(-50%, -50%) rotate(0deg)';
        }
      }
    });

    // Maintain a virtual scroll tracker for stationary views (like auth page)
    this.virtualScrollY = 0;

    window.addEventListener('wheel', (e) => {
      if (document.body.classList.contains('view-auth')) {
        // Only allow scrolling DOWN (plane flies UP/FORWARD, e.deltaY > 0)
        if (e.deltaY > 0) {
          this.virtualScrollY += e.deltaY * 0.45;
          this.updateFloatingLogo();
        }
      }
    }, { passive: true });

    let touchStartY = 0;
    window.addEventListener('touchstart', (e) => {
      if (document.body.classList.contains('view-auth')) {
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (document.body.classList.contains('view-auth')) {
        const touchY = e.touches[0].clientY;
        const deltaY = touchStartY - touchY;
        touchStartY = touchY;
        // Only allow scrolling DOWN (plane flies UP/FORWARD, deltaY > 0)
        if (deltaY > 0) {
          this.virtualScrollY += deltaY * 1.2;
          this.updateFloatingLogo();
        }
      }
    }, { passive: true });

    window.addEventListener('scroll', () => {
      this.updateFloatingLogo();
    }, { passive: true });

    // Start the requestAnimationFrame animation frame loop
    this.initParallaxLoop();
  }

  // Router / Navigation Controller
  navigate(view) {
    this.currentView = view;
    this.container.innerHTML = ''; // Clear container

    // Reset scroll values on transition
    this.virtualScrollY = 0;
    this.animatedScrollY = 0;
    document.documentElement.style.setProperty('--scroll-y', '0');

    // Clean up sidebar drawer elements from document.body on navigate
    const activeDrawer = document.body.querySelector('#toolsDrawerBackdrop');
    if (activeDrawer) {
      activeDrawer.remove();
    }

    // Add landing-view class if viewing landing page or auth page
    document.body.classList.remove('view-landing', 'view-auth', 'view-dashboard', 'view-tools', 'view-books', 'view-chapters', 'view-quiz', 'view-results');
    document.body.classList.add(`view-${view}`);
    if (view === 'landing' || view === 'auth') {
      document.body.classList.add('landing-view');
    } else {
      document.body.classList.remove('landing-view');
    }

    switch (view) {
      case 'landing':
        this.renderLandingView();
        break;
      case 'auth':
        this.renderAuthView();
        break;
      case 'dashboard':
        this.renderDashboardView();
        break;
      case 'tools':
        this.renderToolsView();
        break;
      case 'cx3-info':
        this.renderCX3InfoView();
        break;
      case 'metar':
        this.renderMETARDecoderView();
        break;
      case 'taf':
        this.renderTAFDecoderView();
        break;
      case 'holding':
        this.renderHoldingPatternView();
        break;
      case 'books':
        this.renderBooksView();
        break;
      case 'chapters':
        this.renderChaptersView();
        break;
      case 'quiz':
        this.container.innerHTML = `
          <div class="flex-center animate-fade-in" style="min-height: 50vh; flex-direction: column; gap: 1rem;">
            <p style="color: var(--text-secondary);">Loading mock test questions...</p>
          </div>
        `;
        break;
      case 'results':
        this.renderResultsView();
        break;
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Update floating logo visibility
    this.updateFloatingLogo();
  }

  // Toggle floating logo visibility based on view context and scroll offset
  updateFloatingLogo() {
    const floatingLogo = document.querySelector('.floating-logo-container');
    if (floatingLogo) {
      const isLanding = document.body.classList.contains('view-landing');
      const scrollY = window.scrollY;
      if (!isLanding || scrollY > 150) {
        floatingLogo.classList.add('visible');
      } else {
        floatingLogo.classList.remove('visible');
      }
    }
  }

  // Render the cockpit landing/splash view
  renderLandingView() {
    ui.renderLanding(
      this.container,
      // Start callback (leads to Register)
      () => {
        this.isLoginView = false;
        this.navigate('auth');
      },
      // Login callback (leads to Login)
      () => {
        this.isLoginView = true;
        this.navigate('auth');
      },
      // Tools click callback
      () => {
        this.navigate('tools');
      },
      // CX-3 click callback
      () => {
        this.navigate('cx3-info');
      },
      // METAR Decoder click callback
      () => {
        this.navigate('metar');
      },
      // TAF Decoder click callback
      () => {
        this.navigate('taf');
      },
      // Holding Pattern Click callback
      () => {
        this.navigate('holding');
      }
    );

    // Wire up interactive cursor-following title gradient
    const title = this.container.querySelector('.hero-title');
    if (title) {
      title.addEventListener('mousemove', (e) => {
        const rect = title.getBoundingClientRect();
        this.targetMouseX = ((e.clientX - rect.left) / rect.width) * 100;
        this.targetMouseY = ((e.clientY - rect.top) / rect.height) * 100;
      });
      // Removed mouseleave listener entirely so the gradient coordinates persist!
    }
  }

  // Render registration or login view
  renderAuthView() {
    ui.renderAuth(
      this.container,
      this.isLoginView,
      // Toggle callback
      () => {
        this.isLoginView = !this.isLoginView;
        this.navigate('auth');
      },
      // Submit callback
      (username, password, avatar) => {
        try {
          if (this.isLoginView) {
            this.currentUser = auth.login(username, password);
          } else {
            this.currentUser = auth.register(username, password, avatar);
          }
          this.navigate('dashboard');
          this.triggerRandomQuestionChallenge();
        } catch (err) {
          ui.showAlertModal('Authentication Error', err.message);
        }
      },
      // Back to splash callback
      () => {
        this.navigate('landing');
      }
    );
  }

  // Render the dashboard view
  renderDashboardView() {
    if (!this.currentUser) {
      this.navigate('landing');
      return;
    }

    const stats = progress.getUserStats(this.currentUser.username);
    
    ui.renderDashboard(
      this.container,
      this.currentUser,
      stats,
      subjects,
      // Subject category clicked callback
      (categoryName) => {
        this.activeCategory = categoryName;
        this.navigate('books');
      },
      // Logout callback
      () => {
        auth.logout();
        this.currentUser = null;
        this.isLoginView = false;
        this.navigate('landing');
      },
      // Reattempt callback
      (subjectId, chapterId) => {
        this.activeSubjectId = subjectId;
        const subject = subjects[subjectId];
        if (subject) {
          const chapter = subject.chapters.find(c => c.id === chapterId);
          if (chapter) {
            this.activeChapter = chapter;
            this.promptModeSelection(() => {
              this.navigate('dashboard');
            });
          }
        }
      },
      // Profile click callback
      () => {
        const allUsers = auth.getAllUsers();
        const userFullDetails = allUsers[this.currentUser.username.toLowerCase()] || this.currentUser;
        
        ui.showProfileEditModal(
          userFullDetails,
          // onSave
          (updatedDetails) => {
            try {
              auth.updateProfile(this.currentUser.username, updatedDetails);
              this.currentUser = auth.getCurrentUser();
              this.navigate('dashboard');
            } catch (err) {
              ui.showAlertModal('Profile Update Error', err.message);
            }
          },
          // onCancel
          () => {
            // No action needed on cancel
          }
        );
      },
      // Clear attempts callback
      () => {
        progress.clearAttempts(this.currentUser.username);
        this.navigate('dashboard');
      },
      // Tools navigation callback
      () => {
        this.navigate('tools');
      }
    );
  }

  // Render the tools dashboard view
  renderToolsView() {
    if (!this.currentUser) {
      this.navigate('auth');
      return;
    }

    ui.renderToolsDashboard(
      this.container,
      this.currentUser,
      // Subject category clicked callback
      (categoryName) => {
        this.activeCategory = categoryName;
        this.navigate('books');
      },
      // Logout callback
      () => {
        auth.logout();
        this.currentUser = null;
        this.isLoginView = false;
        this.navigate('landing');
      },
      // Profile click callback
      () => {
        const allUsers = auth.getAllUsers();
        const userFullDetails = allUsers[this.currentUser.username.toLowerCase()] || this.currentUser;
        
        ui.showProfileEditModal(
          userFullDetails,
          // onSave
          (updatedDetails) => {
            try {
              auth.updateProfile(this.currentUser.username, updatedDetails);
              this.currentUser = auth.getCurrentUser();
              this.navigate('tools');
            } catch (err) {
              ui.showAlertModal('Profile Update Error', err.message);
            }
          },
          // onCancel
          () => {}
        );
      },
      // Dashboard click callback (leads back to main dashboard)
      () => {
        this.navigate('dashboard');
      },
      // CX-3 info navigation callback
      () => {
        this.navigate('cx3-info');
      },
      // METAR Decoder navigation callback
      () => {
        this.navigate('metar');
      },
      // TAF Decoder navigation callback
      () => {
        this.navigate('taf');
      },
      // Holding Pattern navigation callback
      () => {
        this.navigate('holding');
      }
    );
  }

  // Render the CX-3 information view
  renderCX3InfoView() {
    ui.renderCX3Info(
      this.container,
      this.currentUser || { username: 'Guest', avatar: 'avatar1' },
      () => {
        if (this.currentUser) {
          this.navigate('tools');
        } else {
          this.navigate('landing');
        }
      }
    );
  }

  // Render the METAR weather decoder view
  renderMETARDecoderView() {
    ui.renderMETARDecoder(
      this.container,
      this.currentUser || { username: 'Guest', avatar: 'avatar1' },
      () => {
        if (this.currentUser) {
          this.navigate('tools');
        } else {
          this.navigate('landing');
        }
      }
    );
  }

  // Render the TAF forecast decoder view
  renderTAFDecoderView() {
    ui.renderTAFDecoder(
      this.container,
      this.currentUser || { username: 'Guest', avatar: 'avatar1' },
      () => {
        if (this.currentUser) {
          this.navigate('tools');
        } else {
          this.navigate('landing');
        }
      }
    );
  }

  // Render the Holding Pattern calculator view
  renderHoldingPatternView() {
    ui.renderHoldingPatternCalculator(
      this.container,
      this.currentUser || { username: 'Guest', avatar: 'avatar1' },
      () => {
        if (this.currentUser) {
          this.navigate('tools');
        } else {
          this.navigate('landing');
        }
      }
    );
  }

  // Render books/databases list view
  renderBooksView() {
    if (!this.currentUser) {
      this.navigate('landing');
      return;
    }

    if (!this.activeCategory) {
      this.navigate('dashboard');
      return;
    }

    ui.renderBooks(
      this.container,
      this.activeCategory,
      subjects,
      this.currentUser,
      // Book selected callback
      (subjectId) => {
        this.activeSubjectId = subjectId;
        this.navigate('chapters');
      },
      // Back callback
      () => {
        this.navigate('dashboard');
      }
    );
  }

  // Render chapters selection view
  renderChaptersView() {
    if (!this.currentUser) {
      this.navigate('landing');
      return;
    }

    const subject = subjects[this.activeSubjectId];
    if (!subject) {
      this.navigate('dashboard');
      return;
    }

    ui.renderChapters(
      this.container,
      subject,
      this.currentUser,
      // Chapter clicked callback
      (chapter) => {
        this.activeChapter = chapter;
        this.promptModeSelection(() => {
          this.navigate('chapters');
        });
      },
      // Back button callback
      () => {
        this.navigate('books');
      }
    );
  }

  // Prompt the user for mode selection before starting the mock test
  promptModeSelection(onCancel = null) {
    ui.showModeSelectionModal(
      this.container,
      this.activeChapter.displayName,
      (mode) => {
        this.startQuiz(mode);
      },
      () => {
        if (onCancel) {
          onCancel();
        } else {
          this.navigate('chapters');
        }
      }
    );
  }

  // Start the quiz player
  startQuiz(mode = 'practice') {
    const subject = subjects[this.activeSubjectId];
    
    this.activeQuizPlayer = new QuizPlayer(
      this.activeSubjectId,
      this.activeChapter,
      this.currentUser.username,
      mode,
      {
        // On question load/reload callback
        onQuestion: (quizData) => {
          this.renderQuizFrame(quizData);
        },
        
        // On complete callback
        onComplete: (results) => {
          // Save stats locally
          progress.saveAttempt(
            this.currentUser.username,
            this.activeSubjectId,
            this.activeChapter.id,
            results.score,
            results.totalQuestions,
            results.timeTaken,
            results.questionsAnsweredCount
          );
          
          this.activeResults = results;
          this.navigate('results');
        },
        
        // On timer ticking callback
        onTick: (elapsedSeconds) => {
          const timerEl = document.getElementById('quizTimer');
          if (timerEl) {
            const minutes = Math.floor(elapsedSeconds / 60);
            const seconds = elapsedSeconds % 60;
            timerEl.textContent = `⏱️ Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
          }
        }
      }
    );

    this.navigate('quiz');
    this.activeQuizPlayer.start();
  }

  // Render quiz player view
  renderQuizFrame(quizData) {
    const subject = subjects[this.activeSubjectId];
    
    ui.renderQuiz(
      this.container,
      quizData,
      // Option clicked callback
      (optionIndex) => {
        this.activeQuizPlayer.selectOption(optionIndex);
      },
      // Previous button callback
      () => {
        this.activeQuizPlayer.prev();
      },
      // Next button callback
      () => {
        this.activeQuizPlayer.next();
      },
      // Submit callback
      () => {
        ui.showConfirmModal(
          'Submit Exam',
          'Are you sure you want to submit your answers?',
          () => {
            this.activeQuizPlayer.submit();
          }
        );
      },
      // Quit & Discard callback
      () => {
        this.activeQuizPlayer.stopTimer();
        this.activeQuizPlayer = null;
        this.navigate('chapters');
      },
      // Quit & Submit callback
      () => {
        this.activeQuizPlayer.submit();
      }
    );
    
    // Set headers
    const subTitle = document.getElementById('quizSubTitle');
    const mainTitle = document.getElementById('quizMainTitle');
    if (subTitle && mainTitle) {
      subTitle.textContent = subject.title;
      mainTitle.textContent = this.activeChapter.displayName;
    }
  }

  // Render final score results view
  renderResultsView() {
    if (!this.currentUser || !this.activeResults) {
      this.navigate('dashboard');
      return;
    }

    ui.renderResults(
      this.container,
      this.activeResults,
      // Retry callback
      () => {
        this.promptModeSelection(() => {
          this.navigate('chapters');
        });
      },
      // Go to dashboard callback
      () => {
        this.activeResults = null;
        this.activeQuizPlayer = null;
        this.navigate('dashboard');
      }
    );
  }

  // Trigger a random question challenge for the pilot upon login
  async triggerRandomQuestionChallenge() {
    try {
      const subjectKeys = Object.keys(subjects);
      if (subjectKeys.length === 0) return;
      
      const randomSubjId = subjectKeys[Math.floor(Math.random() * subjectKeys.length)];
      const subject = subjects[randomSubjId];
      
      if (!subject.chapters || subject.chapters.length === 0) return;
      const randomChapter = subject.chapters[Math.floor(Math.random() * subject.chapters.length)];
      
      const response = await fetch(`data/${randomSubjId}/${randomChapter.file}`);
      if (!response.ok) throw new Error('Failed to fetch challenge question.');
      
      const text = await response.text();
      let questions;
      const trimmed = text.trim();
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        questions = JSON.parse(trimmed);
      } else {
        // Decode base64 obfuscated content (with UTF-8 support)
        const binaryString = atob(trimmed);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const decoded = new TextDecoder('utf-8').decode(bytes);
        questions = JSON.parse(decoded);
      }
      
      if (!Array.isArray(questions) || questions.length === 0) return;
      
      const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
      
      const questionData = {
        subjectTitle: subject.title,
        chapterTitle: randomChapter.displayName,
        questionText: randomQuestion.question,
        options: randomQuestion.options,
        correctAnswerIndex: randomQuestion.answer,
        imageSrc: randomQuestion.image ? `data/${randomSubjId}/${randomQuestion.image}` : null
      };
      
      ui.showRandomQuestionModal(
        questionData,
        (isCorrect) => {
          console.log("Random challenge answered. Correct?", isCorrect);
        },
        () => {
          console.log("Random challenge dismissed.");
        }
      );
    } catch (err) {
      console.error("Error launching random question challenge:", err);
    }
  }

  // Animation frame loop for physics-based smooth (lerped) scroll parallax
  initParallaxLoop() {
    const tick = () => {
      const isLanding = document.body.classList.contains('view-landing');
      const isAuth = document.body.classList.contains('view-auth');
      const isDashboard = document.body.classList.contains('view-dashboard');

      if (isAuth) {
        // Smooth transition toward virtual scroll target
        this.animatedScrollY += (this.virtualScrollY - this.animatedScrollY) * 0.08;
        if (Math.abs(this.virtualScrollY - this.animatedScrollY) < 0.1) {
          this.animatedScrollY = this.virtualScrollY;
        }
        // Continuous loop every 1200px
        const loopScrollY = this.animatedScrollY % 1200;
        document.documentElement.style.setProperty('--scroll-y', `${loopScrollY}`);
      } else if (isLanding || isDashboard) {
        // Smooth transition toward actual scroll offset
        const targetScroll = window.scrollY;
        this.animatedScrollY += (targetScroll - this.animatedScrollY) * 0.12;
        if (Math.abs(targetScroll - this.animatedScrollY) < 0.1) {
          this.animatedScrollY = targetScroll;
        }
        document.documentElement.style.setProperty('--scroll-y', `${this.animatedScrollY}`);

        // Gradually ease cursor spotlight coordinates
        if (isLanding) {
          this.currentMouseX += (this.targetMouseX - this.currentMouseX) * 0.07;
          this.currentMouseY += (this.targetMouseY - this.currentMouseY) * 0.07;
          const title = document.querySelector('.hero-title');
          if (title) {
            title.style.setProperty('--mouse-x', `${this.currentMouseX}%`);
            title.style.setProperty('--mouse-y', `${this.currentMouseY}%`);
          }
        }
      }

      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}

// Export single global instance
export const app = new App();
export default app;
