import { ColorDef, LevelConfig } from '../types/game';
import { MASTER_COLOR_LIST } from './colors';

// Mulberry32 deterministic PRNG from a 32-bit integer seed
export function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Generate an integer seed from 'YYYY-MM-DD'
export function getSeedFromDateString(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash) || 12345;
}

// Format local date as YYYY-MM-DD
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Deterministically generate Daily Challenge config for a given date
export function getDailyChallengeConfig(dateStr: string = getTodayDateString()): {
  config: LevelConfig;
  colors: ColorDef[];
  dateStr: string;
} {
  const seed = getSeedFromDateString(dateStr);
  const rng = mulberry32(seed);

  // Pick color count between 8 and 14 for the daily challenge
  const colorCount = 8 + Math.floor(rng() * 7); // 8 to 14 colors
  const targetScore = 250 + Math.floor(rng() * 150); // 250 to 400
  const speedMultiplier = Number((1.1 + rng() * 0.3).toFixed(2)); // 1.1 to 1.4

  // Shuffle master colors deterministically
  const shuffled = [...MASTER_COLOR_LIST];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const selectedColors = shuffled.slice(0, colorCount);
  const colorIds = selectedColors.map((c) => c.id);

  return {
    dateStr,
    colors: selectedColors,
    config: {
      level: 0, // 0 signifies Daily Challenge
      colorCount,
      targetScore,
      speedMultiplier,
      similarityTier: 2,
      colorIds
    }
  };
}

// Calculate streak update given last played date and today's date
export function computeDailyStreak(
  lastPlayedDate: string,
  currentStreak: number,
  todayStr: string = getTodayDateString()
): { newStreak: number; streakIncreased: boolean } {
  if (!lastPlayedDate) {
    return { newStreak: 1, streakIncreased: true };
  }

  if (lastPlayedDate === todayStr) {
    // Already played today, streak doesn't increase again
    return { newStreak: Math.max(1, currentStreak), streakIncreased: false };
  }

  // Parse dates to compare calendar difference
  const [lastY, lastM, lastD] = lastPlayedDate.split('-').map(Number);
  const [todayY, todayM, todayD] = todayStr.split('-').map(Number);

  const lastDate = new Date(lastY, lastM - 1, lastD);
  const todayDate = new Date(todayY, todayM - 1, todayD);

  const diffTime = todayDate.getTime() - lastDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

  if (diffDays === 1) {
    // Played yesterday! Streak increments
    return { newStreak: currentStreak + 1, streakIncreased: true };
  } else if (diffDays > 1) {
    // Missed at least one day, reset to 1
    return { newStreak: 1, streakIncreased: true };
  }

  return { newStreak: currentStreak, streakIncreased: false };
}

// Calculate time remaining until midnight
export function getTimeUntilMidnight(): { hours: number; minutes: number; seconds: number; formatted: string } {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);

  const diffMs = Math.max(0, midnight.getTime() - now.getTime());
  const totalSeconds = Math.floor(diffMs / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return { hours, minutes, seconds, formatted };
}
