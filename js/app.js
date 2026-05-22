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
  }

  // Initialize the application
  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    // Wire up light/dark mode theme selector
    this.initTheme();

    // Initialize global parallax for landing/auth backgrounds
    this.initParallax();

    // Check existing session
    this.currentUser = auth.getCurrentUser();
    
    if (this.currentUser) {
      this.navigate('dashboard');
    } else {
      this.navigate('landing');
    }
  }

  // Bind click listener for theme toggle
  initTheme() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

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
      if (!document.body.classList.contains('landing-view')) return;
      
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
    });

    document.addEventListener('mouseleave', () => {
      if (!document.body.classList.contains('landing-view')) return;
      
      const bgHorizon = document.querySelector('.bg-horizon-group');
      const bgAttitude = document.querySelector('.landing-bg-attitude');
      
      if (bgHorizon) {
        bgHorizon.style.transform = 'rotate(0deg) translate(0px, 0px)';
      }
      if (bgAttitude) {
        bgAttitude.style.transform = 'translate(-50%, -50%)';
      }
    });
  }

  // Router / Navigation Controller
  navigate(view) {
    this.currentView = view;
    this.container.innerHTML = ''; // Clear container

    // Add landing-view class if viewing landing page or auth page
    document.body.classList.remove('view-landing', 'view-auth');
    if (view === 'landing' || view === 'auth') {
      document.body.classList.add('landing-view');
      document.body.classList.add(`view-${view}`);
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
  }

  // Render the cockpit landing/splash view
  renderLandingView() {
    ui.renderLanding(
      this.container,
      // Engage callback
      () => {
        this.isLoginView = false;
        this.navigate('auth');
      }
    );
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
        } catch (err) {
          alert(err.message);
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
              alert(err.message);
            }
          },
          // onCancel
          () => {
            // No action needed on cancel
          }
        );
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
            results.timeTaken
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
        if (confirm('Are you sure you want to submit your answers?')) {
          this.activeQuizPlayer.submit();
        }
      },
      // Quit & Discard callback
      () => {
        if (confirm('Are you sure you want to quit? Your progress for this attempt will be lost.')) {
          this.activeQuizPlayer.stopTimer();
          this.activeQuizPlayer = null;
          this.navigate('chapters');
        }
      },
      // Quit & Submit callback
      () => {
        if (confirm('Are you sure you want to end the test early and submit your current score? Unanswered questions will be marked as incorrect.')) {
          this.activeQuizPlayer.submit();
        }
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
}

// Export single global instance
export const app = new App();
export default app;
