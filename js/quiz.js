/**
 * Quiz Player Module
 * Manages gameplay state, timer, shuffling, and option checking
 */

export class QuizPlayer {
  constructor(subjectId, chapter, username, mode = 'practice', callbacks) {
    this.subjectId = subjectId;
    this.chapter = chapter;
    this.username = username;
    this.mode = mode; // 'practice' or 'test'
    this.callbacks = callbacks; // { onQuestion, onComplete, onTick }
    
    this.questions = [];
    this.currentIndex = 0;
    this.score = 0;
    this.answers = []; // Array of { questionIndex, selectedAnswer, isCorrect }
    
    this.startTime = null;
    this.elapsedTime = 0; // in seconds
    this.timerInterval = null;
    this.jsonPath = `data/${subjectId}/${chapter.file}`;
  }

  // Load questions and start the quiz
  async start() {
    try {
      const response = await fetch(this.jsonPath);
      if (!response.ok) throw new Error('Failed to fetch quiz data.');
      const text = await response.text();
      
      let data;
      const trimmed = text.trim();
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        data = JSON.parse(trimmed);
      } else {
        // Decode base64 obfuscated content
        const decoded = atob(trimmed);
        data = JSON.parse(decoded);
      }
      
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Quiz file is empty or invalid.');
      }
      
      // Clone and shuffle questions
      this.questions = data.map((q, idx) => ({ ...q, originalIndex: idx }));
      this.shuffleArray(this.questions);
      
      // Initialize state
      this.currentIndex = 0;
      this.score = 0;
      this.answers = Array(this.questions.length).fill(null);
      this.startTime = Date.now();
      
      // Start timer
      this.startTimer();
      
      // Load first question
      this.loadQuestion();
    } catch (err) {
      console.error(err);
      alert('Error loading quiz data: ' + err.message);
    }
  }

  // Shuffle Utility
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Start timer ticking
  startTimer() {
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
      if (this.callbacks.onTick) {
        this.callbacks.onTick(this.elapsedTime);
      }
    }, 1000);
  }

  // Stop timer
  stopTimer() {
    clearInterval(this.timerInterval);
  }

  // Get path for images relative to the active JSON path
  resolveImagePath(imgPath) {
    if (!imgPath) return '';
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) return imgPath;
    
    const parts = this.jsonPath.split('/');
    parts.pop(); // remove file name, e.g. ["data", "IC-JOSHI"]
    
    const imgParts = imgPath.split('/');
    for (const part of imgParts) {
      if (part === '.') continue;
      if (part === '..') {
        parts.pop();
      } else {
        parts.push(part);
      }
    }
    return parts.join('/');
  }

  // Load the current question
  loadQuestion() {
    const q = this.questions[this.currentIndex];
    const prevAnswer = this.answers[this.currentIndex];
    
    const questionData = {
      questionNumber: this.currentIndex + 1,
      totalQuestions: this.questions.length,
      questionText: q.question,
      options: q.options,
      imageSrc: q.image ? this.resolveImagePath(q.image) : null,
      correctAnswerIndex: q.answer,
      selectedAnswerIndex: prevAnswer ? prevAnswer.selectedAnswer : null,
      isAnswered: prevAnswer !== null,
      mode: this.mode
    };

    if (this.callbacks.onQuestion) {
      this.callbacks.onQuestion(questionData);
    }
  }

  // Handle option selection
  selectOption(optionIndex) {
    if (this.mode === 'practice') {
      // If already answered, ignore
      if (this.answers[this.currentIndex] !== null) return;
    }
    
    const q = this.questions[this.currentIndex];
    const isCorrect = optionIndex === q.answer;
    
    this.answers[this.currentIndex] = {
      questionIndex: this.currentIndex,
      selectedAnswer: optionIndex,
      correctAnswer: q.answer,
      isCorrect
    };
    
    // Trigger callbacks with update
    this.loadQuestion();
  }

  // Next question
  next() {
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
      this.loadQuestion();
    }
  }

  // Previous question
  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.loadQuestion();
    }
  }

  // Submit the quiz
  submit() {
    this.stopTimer();
    
    let finalScore = 0;
    const questionsReviewed = this.questions.map((q, idx) => {
      const ans = this.answers[idx];
      const selectedAnswerIndex = ans ? ans.selectedAnswer : null;
      const isCorrect = ans ? (selectedAnswerIndex === q.answer) : false;
      if (isCorrect) {
        finalScore++;
      }
      return {
        questionText: q.question,
        options: q.options,
        correctAnswerIndex: q.answer,
        selectedAnswerIndex: selectedAnswerIndex,
        isCorrect: isCorrect
      };
    });
    
    const results = {
      score: finalScore,
      totalQuestions: this.questions.length,
      timeTaken: this.elapsedTime,
      accuracy: Math.round((finalScore / this.questions.length) * 100),
      questionsReviewed: questionsReviewed,
      mode: this.mode
    };

    if (this.callbacks.onComplete) {
      this.callbacks.onComplete(results);
    }
  }
}
