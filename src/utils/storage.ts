import { UserProgress } from '../types/game';

const STORAGE_KEY = 'color_chaos_v1_progress';

const DEFAULT_PROGRESS: UserProgress = {
  highestLevelUnlocked: 1,
  completedLevels: [],
  levelBestScores: {},
  overallPersonalBest: 0,
  totalGamesPlayed: 0,
  dailyChallengeBestScore: 0,
  currentDailyStreak: 0,
  longestDailyStreak: 0,
  lastDailyChallengeDate: ''
};

export function loadUserProgress(): UserProgress {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Check for legacy v0 keys
      const legacyBest = localStorage.getItem('color_chaos_best_score');
      const legacyStreak = localStorage.getItem('color_chaos_longest_streak');

      const initial: UserProgress = {
        ...DEFAULT_PROGRESS,
        overallPersonalBest: legacyBest ? parseInt(legacyBest, 10) || 0 : 0,
        longestDailyStreak: legacyStreak ? parseInt(legacyStreak, 10) || 0 : 0
      };
      saveUserProgress(initial);
      return initial;
    }

    const parsed = JSON.parse(raw) as Partial<UserProgress>;
    return {
      highestLevelUnlocked: Math.max(1, Math.min(50, parsed.highestLevelUnlocked || 1)),
      completedLevels: Array.isArray(parsed.completedLevels) ? parsed.completedLevels : [],
      levelBestScores: parsed.levelBestScores && typeof parsed.levelBestScores === 'object' ? parsed.levelBestScores : {},
      overallPersonalBest: typeof parsed.overallPersonalBest === 'number' ? parsed.overallPersonalBest : 0,
      totalGamesPlayed: typeof parsed.totalGamesPlayed === 'number' ? parsed.totalGamesPlayed : 0,
      dailyChallengeBestScore: typeof parsed.dailyChallengeBestScore === 'number' ? parsed.dailyChallengeBestScore : 0,
      currentDailyStreak: typeof parsed.currentDailyStreak === 'number' ? parsed.currentDailyStreak : 0,
      longestDailyStreak: typeof parsed.longestDailyStreak === 'number' ? parsed.longestDailyStreak : 0,
      lastDailyChallengeDate: typeof parsed.lastDailyChallengeDate === 'string' ? parsed.lastDailyChallengeDate : ''
    };
  } catch (err) {
    console.warn('Failed to load user progress from localStorage, using defaults:', err);
    return DEFAULT_PROGRESS;
  }
}

export function saveUserProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    // Also mirror overall personal best to legacy key for backwards compatibility
    localStorage.setItem('color_chaos_best_score', String(progress.overallPersonalBest));
  } catch (err) {
    console.warn('Failed to save user progress to localStorage:', err);
  }
}
