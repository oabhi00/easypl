/**
 * Progress Module
 * Saves and calculates user stats and accuracy per chapter/subject in LocalStorage
 */

const STORAGE_ATTEMPTS_PREFIX = 'easypl_attempts_';

export const progress = {
  // Save a quiz attempt
  saveAttempt(username, subjectId, chapterId, score, totalQuestions, timeTaken) {
    if (!username) return;
    
    const key = STORAGE_ATTEMPTS_PREFIX + username.toLowerCase();
    const attempts = this.getUserAttempts(username);
    
    const newAttempt = {
      subjectId,
      chapterId,
      score,
      totalQuestions,
      accuracy: totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0,
      timeTaken, // in seconds
      date: new Date().toISOString()
    };
    
    attempts.push(newAttempt);
    localStorage.setItem(key, JSON.stringify(attempts));
    return newAttempt;
  },

  // Get all attempts for a user
  getUserAttempts(username) {
    if (!username) return [];
    const key = STORAGE_ATTEMPTS_PREFIX + username.toLowerCase();
    const attempts = localStorage.getItem(key);
    return attempts ? JSON.parse(attempts) : [];
  },

  // Get aggregated stats for the dashboard
  getUserStats(username) {
    const attempts = this.getUserAttempts(username);
    if (attempts.length === 0) {
      return {
        totalAttempts: 0,
        averageAccuracy: 0,
        totalTime: 0,
        totalQuestionsAnswered: 0,
        recentAttempts: []
      };
    }
    
    let totalQuestionsAnswered = 0;
    let totalCorrectAnswers = 0;
    let totalTime = 0;
    
    attempts.forEach(att => {
      totalQuestionsAnswered += att.totalQuestions;
      totalCorrectAnswers += att.score;
      totalTime += att.timeTaken;
    });
    
    const averageAccuracy = totalQuestionsAnswered > 0 
      ? Math.round((totalCorrectAnswers / totalQuestionsAnswered) * 100) 
      : 0;
      
    // Return recent attempts (last 5) sorted by date descending
    const recentAttempts = [...attempts]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
      
    return {
      totalAttempts: attempts.length,
      averageAccuracy,
      totalTime, // in seconds
      totalQuestionsAnswered,
      recentAttempts
    };
  },

  // Get chapter progress (high score and attempts count)
  getChapterProgressMap(username, subjectId) {
    const attempts = this.getUserAttempts(username);
    const map = {}; // chapterId -> { highScore, attemptsCount }
    
    attempts.forEach(att => {
      if (att.subjectId === subjectId) {
        if (!map[att.chapterId]) {
          map[att.chapterId] = {
            highScore: 0,
            attemptsCount: 0
          };
        }
        map[att.chapterId].attemptsCount++;
        const percent = att.totalQuestions > 0 
          ? Math.round((att.score / att.totalQuestions) * 100) 
          : 0;
        if (percent > map[att.chapterId].highScore) {
          map[att.chapterId].highScore = percent;
        }
      }
    });
    
    return map;
  },

  // Get subject level progress
  getSubjectProgress(username, subjectId, totalChaptersCount) {
    if (totalChaptersCount === 0) return { percentComplete: 0, avgAccuracy: 0 };
    
    const chapterMap = this.getChapterProgressMap(username, subjectId);
    let completedChaptersCount = 0;
    let totalAccuracySum = 0;
    
    // Consider a chapter "completed" if it has at least 1 attempt
    Object.keys(chapterMap).forEach(chapterId => {
      const chData = chapterMap[chapterId];
      if (chData.attemptsCount > 0) {
        completedChaptersCount++;
        totalAccuracySum += chData.highScore;
      }
    });
    
    const percentComplete = Math.round((completedChaptersCount / totalChaptersCount) * 100);
    const avgAccuracy = completedChaptersCount > 0 
      ? Math.round(totalAccuracySum / completedChaptersCount) 
      : 0;
      
    return {
      percentComplete,
      avgAccuracy
    };
  },

  // Get category level progress (aggregated across all matching subjects)
  getCategoryProgress(username, categoryName, subjectsConfig) {
    const configCategory = categoryName === "Technical General" ? "Technical" : categoryName;
    const matchingSubjects = Object.values(subjectsConfig).filter(sub => sub.category === configCategory);
    
    if (matchingSubjects.length === 0) {
      return { percentComplete: 0, avgAccuracy: 0 };
    }
    
    let totalChapters = 0;
    let completedChapters = 0;
    let totalAccuracySum = 0;
    
    matchingSubjects.forEach(sub => {
      totalChapters += sub.chapters.length;
      const chapterMap = this.getChapterProgressMap(username, sub.id);
      Object.keys(chapterMap).forEach(chapterId => {
        const chData = chapterMap[chapterId];
        if (chData.attemptsCount > 0) {
          completedChapters++;
          totalAccuracySum += chData.highScore;
        }
      });
    });
    
    const percentComplete = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
    const avgAccuracy = completedChapters > 0 ? Math.round(totalAccuracySum / completedChapters) : 0;
    
    return {
      percentComplete,
      avgAccuracy
    };
  }
};
