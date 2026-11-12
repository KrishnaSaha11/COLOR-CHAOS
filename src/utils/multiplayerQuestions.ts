import { ColorDef, Question } from '../types/game';
import { MASTER_COLORS, BASE_COLORS } from './colors';
import { mulberry32 } from './daily';

// Get subset of colors based on host settings — curated for maximum visual distinction
export function getColorsForMultiplayer(colorCount: 6 | 10 | 16): ColorDef[] {
  // 6 Colors: Pure distinct primaries & secondaries (Zero ambiguity)
  const colors6: ColorDef[] = [
    MASTER_COLORS.RED,
    MASTER_COLORS.BLUE,
    MASTER_COLORS.GREEN,
    MASTER_COLORS.YELLOW,
    MASTER_COLORS.PURPLE,
    MASTER_COLORS.ORANGE
  ];

  if (colorCount === 6) {
    return colors6;
  }

  // 10 Colors: 10 distinct vibrant hues across all families (Only 1 yellow, no confusing duplicates)
  const colors10: ColorDef[] = [
    ...colors6,
    MASTER_COLORS.CYAN,
    MASTER_COLORS.MAGENTA,
    MASTER_COLORS.LIME,
    MASTER_COLORS.CORAL
  ];

  if (colorCount === 10) {
    return colors10;
  }

  // 16 Colors: 16 diverse high-contrast shades (100% distinct hues, strictly 1 yellow)
  const colors16: ColorDef[] = [
    ...colors10,
    MASTER_COLORS.TEAL,
    MASTER_COLORS.VIOLET,
    MASTER_COLORS.PEACH,
    MASTER_COLORS.SKY,
    MASTER_COLORS.MINT,
    MASTER_COLORS.ROSE
  ];

  return colors16;
}

// Generate an identical deterministic sequence of questions using seed
export function generateMultiplayerQuestionSequence(
  colors: ColorDef[],
  seed: number = Date.now(),
  count: number = 120
): Question[] {
  const rng = mulberry32(seed);
  const questions: Question[] = [];
  const list = colors.length > 0 ? colors : BASE_COLORS;

  for (let i = 0; i < count; i++) {
    // Pick text color
    const textIndex = Math.floor(rng() * list.length);
    const textColor = list[textIndex].id;

    // ~85% mismatch and ~15% match for Stroop challenge
    const shouldMatch = rng() < 0.15;
    let word: string;

    if (shouldMatch) {
      word = textColor;
    } else {
      const otherColors = list.filter((c) => c.id !== textColor);
      if (otherColors.length > 0) {
        word = otherColors[Math.floor(rng() * otherColors.length)].id;
      } else {
        word = textColor;
      }
    }

    questions.push({
      id: i + 1,
      word,
      textColor
    });
  }

  return questions;
}
