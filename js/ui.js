/**
 * UI Rendering Module
 * Builds and inserts DOM layouts for all application views
 */

import { progress } from './progress.js';

export const ui = {
  // 1. Render Authentication Screen
  renderAuth(container, isLogin, onToggle, onSubmit) {
    container.innerHTML = `
      <div class="auth-wrapper card animate-fade-in">
        <div class="auth-header">
          <h1 class="text-gradient">SkyPrep DGCA</h1>
          <p>${isLogin ? 'Log in to track your mock exam progress' : 'Create an account to start practicing'}</p>
        </div>
        
        <form id="authForm">
          <div class="form-group">
            <label class="form-label" for="username">Username</label>
            <input class="form-input" type="text" id="username" required placeholder="Enter username">
          </div>
          
          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <input class="form-input" type="password" id="password" required placeholder="Enter password">
          </div>
          
          ${!isLogin ? `
            <div class="form-group">
              <label class="form-label">Select Profile Icon</label>
              <div class="avatar-selector">
                <div class="avatar-option selected" data-avatar="avatar1.png">
                  <img src="https://api.dicebear.com/7.x/bottts/svg?seed=pilot1" alt="Bot 1">
                </div>
                <div class="avatar-option" data-avatar="avatar2.png">
                  <img src="https://api.dicebear.com/7.x/bottts/svg?seed=pilot2" alt="Bot 2">
                </div>
                <div class="avatar-option" data-avatar="avatar3.png">
                  <img src="https://api.dicebear.com/7.x/bottts/svg?seed=pilot3" alt="Bot 3">
                </div>
                <div class="avatar-option" data-avatar="avatar4.png">
                  <img src="https://api.dicebear.com/7.x/bottts/svg?seed=pilot4" alt="Bot 4">
                </div>
              </div>
            </div>
          ` : ''}
          
          <button class="btn btn-primary" type="submit" style="width: 100%; margin-top: 1rem;">
            ${isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        
        <div class="auth-toggle">
          ${isLogin ? "Don't have an account? <span id='toggleAuth'>Sign Up</span>" : "Already have an account? <span id='toggleAuth'>Login</span>"}
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
    if (avatar === 'avatar1.png') return 'https://api.dicebear.com/7.x/bottts/svg?seed=pilot1';
    if (avatar === 'avatar2.png') return 'https://api.dicebear.com/7.x/bottts/svg?seed=pilot2';
    if (avatar === 'avatar3.png') return 'https://api.dicebear.com/7.x/bottts/svg?seed=pilot3';
    if (avatar === 'avatar4.png') return 'https://api.dicebear.com/7.x/bottts/svg?seed=pilot4';
    return 'https://api.dicebear.com/7.x/bottts/svg?seed=pilot1';
  },

  // 2. Render Study Dashboard View
  renderDashboard(container, user, stats, subjects, onSubjectClick, onLogout) {
    const avatarUrl = this.getAvatarUrl(user.avatar);
    
    // Format total time: e.g. "12m 30s" or "1h 5m"
    const totalMinutes = Math.floor(stats.totalTime / 60);
    const timeDisplay = totalMinutes > 60 
      ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
      : `${totalMinutes}m ${stats.totalTime % 60}s`;

    // Map subjects into HTML cards
    let subjectCardsHTML = '';
    Object.values(subjects).forEach(sub => {
      const subProg = progress.getSubjectProgress(user.username, sub.id, sub.chapters.length);
      subjectCardsHTML += `
        <div class="card card-interactive subject-card animate-fade-in" data-id="${sub.id}">
          <div>
            <div class="subject-badge">${sub.category}</div>
            <div class="subject-info">
              <h3>${sub.title}</h3>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width: ${subProg.percentComplete}%;"></div>
            </div>
            <div class="progress-text">
              <span>${subProg.percentComplete}% Complete</span>
              <span>Avg: ${subProg.avgAccuracy}%</span>
            </div>
          </div>
        </div>
      `;
    });

    // Recent history items HTML
    let historyHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">No quizzes attempted yet. Start practicing below!</p>';
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
              <span class="history-meta">${formattedDate} • ${Math.floor(att.timeTaken / 60)}m ${att.timeTaken % 60}s</span>
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
            <p>DGCA Candidate</p>
          </div>
        </div>
        <button class="btn btn-outline" id="logoutBtn">Logout</button>
      </div>

      <!-- General Statistics -->
      <h2 class="section-title animate-fade-in">Performance Stats</h2>
      <div class="stats-grid animate-fade-in">
        <div class="card stat-card">
          <div class="stat-label">Quizzes Run</div>
          <div class="stat-value">${stats.totalAttempts}</div>
        </div>
        <div class="card stat-card">
          <div class="stat-label">Avg. Accuracy</div>
          <div class="stat-value">${stats.averageAccuracy}%</div>
        </div>
        <div class="card stat-card">
          <div class="stat-label">Total Time</div>
          <div class="stat-value">${timeDisplay}</div>
        </div>
        <div class="card stat-card">
          <div class="stat-label">Questions Checked</div>
          <div class="stat-value">${stats.totalQuestionsAnswered}</div>
        </div>
      </div>

      <!-- Subjects Section -->
      <h2 class="section-title animate-fade-in">Available Subjects</h2>
      <div class="subject-grid">
        ${subjectCardsHTML}
      </div>

      <!-- Recent Attempts -->
      <h2 class="section-title animate-fade-in">Recent Practice History</h2>
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

  // 3. Render Chapters selector list
  renderChapters(container, subject, user, onChapterClick, onBack) {
    const progressMap = progress.getChapterProgressMap(user.username, subject.id);
    
    // Map chapters into rows
    let chapterRowsHTML = '';
    subject.chapters.forEach(ch => {
      const chProgress = progressMap[ch.id];
      const hasAttempted = chProgress && chProgress.attemptsCount > 0;
      const statusClass = hasAttempted ? 'status-completed' : 'status-not-started';
      const statusText = hasAttempted ? `Completed (${chProgress.highScore}% High Score)` : 'Not Started';
      
      chapterRowsHTML += `
        <div class="chapter-row animate-fade-in">
          <div class="chapter-title-wrapper">
            <span class="chapter-title">${ch.displayName}</span>
            <span class="chapter-stats">${ch.questionsCount} Questions • ${chProgress ? chProgress.attemptsCount : 0} Attempt(s)</span>
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
        <button class="btn btn-outline" id="backToDashBtn">← Back to Dashboard</button>
        <div style="margin-left: 1rem;">
          <h2 class="text-gradient" style="font-size: 1.8rem;">${subject.title}</h2>
          <span style="font-size: 0.85rem; color: var(--text-secondary);">${subject.category} Subject</span>
        </div>
      </div>

      <!-- Subject Progress Info -->
      <div class="card animate-fade-in" style="margin-bottom: 2rem; padding: 1.5rem;">
        <div class="progress-container" style="margin-top: 0;">
          <div class="progress-bar-bg" style="height: 8px;">
            <div class="progress-bar-fill" style="width: ${subProg.percentComplete}%;"></div>
          </div>
          <div class="progress-text" style="font-size: 0.85rem;">
            <span>${subProg.percentComplete}% of Chapters Practiced</span>
            <span>Average Accuracy: ${subProg.avgAccuracy}%</span>
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

  // 4. Render active quiz playing interface
  renderQuiz(container, quizData, onOptionClick, onPrev, onNext, onSubmit, onQuit) {
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
          <span class="quiz-subtitle" id="quizSubTitle">Mock Test</span>
          <h2 style="font-size: 1.3rem;" id="quizMainTitle">Question Player</h2>
        </div>
        <div class="timer-box" id="quizTimer">⏱️ Time: 00:00</div>
      </div>

      <!-- Question Progress Bar -->
      <div class="quiz-progress-wrapper animate-fade-in">
        <div class="quiz-progress-text">
          <span>Question ${questionNumber} of ${totalQuestions}</span>
          <span>${progressPercent}% Done</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${progressPercent}%;"></div>
        </div>
      </div>

      <!-- Question Container -->
      <div class="card question-container animate-fade-in">
        <div class="question-text">${questionText.replace(/\n/g, '<br>')}</div>
        
        ${imageSrc ? `
          <div class="question-image-box">
            <img class="question-image" src="${imageSrc}" alt="Question Graphic">
          </div>
        ` : ''}
        
        <div class="options-list">
          ${optionsHTML}
        </div>
        
        <!-- Controls buttons -->
        <div class="quiz-controls">
          <button class="btn btn-outline" id="quizPrevBtn" ${questionNumber === 1 ? 'disabled style="opacity:0.4; pointer-events:none;"' : ''}>← Previous</button>
          <button class="btn btn-outline" id="quizQuitBtn" style="border-color: rgba(239, 68, 68, 0.4); color: var(--wrong-light)">Quit</button>
          
          ${questionNumber === totalQuestions ? `
            <button class="btn btn-primary" id="quizSubmitBtn" ${!isAnswered ? 'disabled style="opacity:0.4; pointer-events:none;"' : ''}>Finish Test</button>
          ` : `
            <button class="btn btn-secondary" id="quizNextBtn" ${!isAnswered ? 'disabled style="opacity:0.4; pointer-events:none;"' : ''}>Next →</button>
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
    document.getElementById('quizQuitBtn').addEventListener('click', onQuit);
    
    if (questionNumber === totalQuestions) {
      document.getElementById('quizSubmitBtn').addEventListener('click', onSubmit);
    } else {
      document.getElementById('quizNextBtn').addEventListener('click', onNext);
    }
  },

  // 5. Render final scorecard results
  renderResults(container, results, onRestart, onDashboard) {
    const { score, totalQuestions, timeTaken, accuracy, questionsReviewed } = results;
    
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;
    const timeDisplay = `${minutes}m ${seconds}s`;
    
    const isPassing = accuracy >= 70;

    // Build list of reviewed wrong answers
    const wrongAnswers = questionsReviewed.filter(q => !q.isCorrect);
    let reviewHTML = '';
    if (wrongAnswers.length > 0) {
      reviewHTML = `
        <div class="review-answers-section animate-fade-in">
          <h2 class="section-title">Review Incorrect Answers (${wrongAnswers.length})</h2>
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${wrongAnswers.map(q => {
              const correctText = q.options[q.correctAnswerIndex];
              const selectedText = q.selectedAnswerIndex !== null ? q.options[q.selectedAnswerIndex] : 'No Answer Selected';
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
          <h3 style="color: var(--correct-light); font-size: 1.3rem;">🎉 Perfect Score! No errors to review.</h3>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="results-wrapper card animate-fade-in">
        <h1 class="text-gradient" style="font-size: 2.2rem; margin-bottom: 0.5rem;">Test Results</h1>
        <p style="color: var(--text-secondary);">${isPassing ? 'Congratulations! You passed the mock test.' : 'Keep studying and try again to improve.'}</p>
        
        <!-- Score Circular Progress Loader -->
        <div class="result-circle-box">
          <svg class="result-circle-svg" viewBox="0 0 100 100">
            <circle class="circle-bg" cx="50" cy="50" r="45"></circle>
            <circle class="circle-fill ${isPassing ? 'pass' : 'fail'}" cx="50" cy="50" r="45" stroke-dasharray="283" stroke-dashoffset="${283 - (283 * accuracy) / 100}"></circle>
          </svg>
          <div class="result-percentage">${accuracy}%</div>
          <div class="result-score">${score} / ${totalQuestions} Correct</div>
        </div>

        <div class="results-stats-row">
          <div class="result-stat-item">
            <span class="result-stat-label">Time Spent</span>
            <span class="result-stat-value">${timeDisplay}</span>
          </div>
          <div class="result-stat-item">
            <span class="result-stat-label">Result Status</span>
            <span class="result-stat-value" style="color: ${isPassing ? 'var(--correct-light)' : 'var(--wrong-light)'};">
              ${isPassing ? 'PASSED' : 'FAILED'}
            </span>
          </div>
          <div class="result-stat-item">
            <span class="result-stat-label">Min. Pass Mark</span>
            <span class="result-stat-value">70%</span>
          </div>
        </div>

        <div style="display: flex; gap: 1rem; justify-content: center; margin-bottom: 2rem;">
          <button class="btn btn-primary" id="restartTestBtn">Retry Test</button>
          <button class="btn btn-secondary" id="returnDashBtn">Go to Dashboard</button>
        </div>

        ${reviewHTML}
      </div>
    `;

    // Hook listeners
    document.getElementById('restartTestBtn').addEventListener('click', onRestart);
    document.getElementById('returnDashBtn').addEventListener('click', onDashboard);
  }
};
