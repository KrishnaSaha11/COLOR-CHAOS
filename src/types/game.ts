export interface ColorDef {
  id: string;
  name: string;
  hex: string;
  glow: string;
  darkHex: string;
  rgb: string;
  family: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';
}

export interface Question {
  id: number;
  word: string;
  textColor: string;
}

export type GameState =
  | 'HOME'
  | 'LEVEL_SELECT'
  | 'PLAYING'
  | 'RESULTS'
  | 'ABOUT'
  | 'MULTIPLAYER_LOBBY'
  | 'MULTIPLAYER_PLAYING'
  | 'MULTIPLAYER_RESULTS';

export type GameMode = 'LEVEL' | 'DAILY';

export interface FloatingNotification {
  id: string;
  text: string;
  type: 'correct' | 'wrong' | 'bonus';
  x: number;
  y: number;
}

export interface LevelConfig {
  level: number;
  colorCount: number;
  targetScore: number;
  speedMultiplier: number;
  similarityTier: 1 | 2 | 3; // 1 = Easy/Distinct, 2 = Medium/Related, 3 = Advanced/Subtle
  colorIds: string[];
  totalTime: number;      // Total round time in seconds (scales with level)
  wrongPenalty: number;    // Time penalty in seconds for wrong answer (decreases at higher levels)
}

export interface UserProgress {
  highestLevelUnlocked: number;
  completedLevels: number[];
  levelBestScores: Record<number, number>;
  overallPersonalBest: number;
  totalGamesPlayed: number;
  dailyChallengeBestScore: number;
  currentDailyStreak: number;
  longestDailyStreak: number;
  lastDailyChallengeDate: string; // YYYY-MM-DD
}
