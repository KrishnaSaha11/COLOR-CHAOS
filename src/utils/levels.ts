import { LevelConfig, ColorDef } from '../types/game';
import { MASTER_COLORS } from './colors';

// Helper to get color count for each level according to the exact prompt specification
export function getColorCountForLevel(level: number): number {
  if (level <= 2) return 5;
  if (level <= 4) return 6;
  if (level <= 6) return 7;
  if (level <= 8) return 8;
  if (level <= 10) return 9;
  if (level <= 12) return 10;
  if (level <= 14) return 11;
  if (level <= 16) return 12;
  if (level <= 18) return 13;
  if (level <= 20) return 14;
  if (level <= 22) return 15;
  if (level <= 24) return 16;
  if (level <= 26) return 17;
  if (level <= 28) return 18;
  if (level <= 30) return 19;
  if (level <= 32) return 20;
  if (level <= 34) return 21;
  if (level <= 36) return 22;
  if (level <= 38) return 23;
  if (level <= 40) return 24;
  if (level <= 42) return 25;
  if (level <= 44) return 26;
  if (level <= 46) return 27;
  if (level <= 48) return 28;
  return 30; // 49-50
}

// Master ordered list of colors prioritized by similarity tier:
// Early levels pick from diverse primaries first; later levels add subtle neighboring shades.
const COLOR_ORDER_BY_SIMILARITY: string[] = [
  // Primary diverse set (5-6)
  'RED', 'CYAN', 'GREEN', 'YELLOW', 'PURPLE', 'ORANGE',
  // Tier 1 additions (7-12)
  'LIME', 'MAGENTA', 'BLUE', 'GOLD', 'CORAL', 'TEAL',
  // Tier 2 additions (13-20) - introduces neighboring family shades
  'CRIMSON', 'MINT', 'AMBER', 'VIOLET', 'TANGERINE', 'SKY', 'ROSE', 'EMERALD',
  // Tier 3 additions (21-30) - advanced subtle cousins
  'LEMON', 'ORCHID', 'PEACH', 'AQUA', 'JADE', 'CANARY', 'INDIGO', 'FLAME', 'RUBY', 'APRICOT'
];

// Target score calibrated to be demanding yet achievable in 30 seconds
export function getTargetScoreForLevel(level: number): number {
  if (level === 1) return 150;
  if (level === 2) return 170;
  if (level === 3) return 190;
  if (level === 4) return 210;
  if (level === 5) return 230;
  if (level <= 10) return 230 + (level - 5) * 18; // 248 to 320
  if (level <= 25) return 320 + (level - 10) * 10; // 330 to 470
  if (level <= 40) return 470 + (level - 25) * 8; // 478 to 590
  return 590 + (level - 40) * 6; // up to ~650 for level 50
}

// Speed multiplier: pairs share same color count, but 2nd level in each pair is slightly faster
export function getSpeedMultiplierForLevel(level: number): number {
  const base = 1.0 + Math.floor((level - 1) / 2) * 0.03;
  const isSecondInPair = level % 2 === 0;
  return Number((base + (isSecondInPair ? 0.03 : 0)).toFixed(2));
}

// Generate the 50 level configurations
export const LEVEL_CONFIGS: LevelConfig[] = Array.from({ length: 50 }, (_, i) => {
  const level = i + 1;
  const colorCount = getColorCountForLevel(level);
  const targetScore = getTargetScoreForLevel(level);
  const speedMultiplier = getSpeedMultiplierForLevel(level);
  const similarityTier: 1 | 2 | 3 = level <= 16 ? 1 : level <= 34 ? 2 : 3;

  const colorIds = COLOR_ORDER_BY_SIMILARITY.slice(0, colorCount);

  return {
    level,
    colorCount,
    targetScore,
    speedMultiplier,
    similarityTier,
    colorIds
  };
});

export function getLevelConfig(level: number): LevelConfig {
  const clamped = Math.max(1, Math.min(50, level));
  return LEVEL_CONFIGS[clamped - 1];
}

export function getColorsForLevel(level: number): ColorDef[] {
  const config = getLevelConfig(level);
  return config.colorIds.map((id) => MASTER_COLORS[id] || MASTER_COLORS.RED);
}
