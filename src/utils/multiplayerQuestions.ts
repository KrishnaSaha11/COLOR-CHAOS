import { ColorDef, Question } from '../types/game';
import { MASTER_COLORS, BASE_COLORS } from './colors';
import { mulberry32 } from './daily';

// Get subset of colors based on host settings
export function getColorsForMultiplayer(colorCount: 6 | 10 | 16): ColorDef[] {
  if (colorCount === 6) {
    return BASE_COLORS;
  }
  
  const allColors = Object.values(MASTER_COLORS);
  return allColors.slice(0, colorCount);
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
