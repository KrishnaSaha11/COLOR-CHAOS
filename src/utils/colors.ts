import { ColorDef, ColorName, Question } from '../types/game';

export const COLORS: Record<ColorName, ColorDef> = {
  RED: {
    id: 'RED',
    name: 'RED',
    hex: '#FF3366',
    glow: 'rgba(255, 51, 102, 0.65)',
    darkHex: '#3D0014',
    rgb: '255, 51, 102'
  },
  BLUE: {
    id: 'BLUE',
    name: 'BLUE',
    hex: '#00E5FF',
    glow: 'rgba(0, 229, 255, 0.65)',
    darkHex: '#002538',
    rgb: '0, 229, 255'
  },
  GREEN: {
    id: 'GREEN',
    name: 'GREEN',
    hex: '#00FF88',
    glow: 'rgba(0, 255, 136, 0.65)',
    darkHex: '#003319',
    rgb: '0, 255, 136'
  },
  YELLOW: {
    id: 'YELLOW',
    name: 'YELLOW',
    hex: '#FFE600',
    glow: 'rgba(255, 230, 0, 0.65)',
    darkHex: '#383000',
    rgb: '255, 230, 0'
  },
  PURPLE: {
    id: 'PURPLE',
    name: 'PURPLE',
    hex: '#B026FF',
    glow: 'rgba(176, 38, 255, 0.65)',
    darkHex: '#26003B',
    rgb: '176, 38, 255'
  },
  ORANGE: {
    id: 'ORANGE',
    name: 'ORANGE',
    hex: '#FF7700',
    glow: 'rgba(255, 119, 0, 0.65)',
    darkHex: '#3B1A00',
    rgb: '255, 119, 0'
  }
};

export const COLOR_KEYS: ColorName[] = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE', 'ORANGE'];
export const COLOR_LIST: ColorDef[] = COLOR_KEYS.map((key) => COLORS[key]);

let questionCounter = 0;

export function generateQuestion(prev?: Question): Question {
  questionCounter += 1;
  
  // Pick text color
  let textColor: ColorName;
  do {
    textColor = COLOR_KEYS[Math.floor(Math.random() * COLOR_KEYS.length)];
  } while (prev && textColor === prev.textColor && Math.random() < 0.7);

  // In Stroop tests, ~85% mismatch and ~15% match keeps players challenged without letting them auto-negate
  const shouldMatch = Math.random() < 0.15;
  let word: ColorName;

  if (shouldMatch) {
    word = textColor;
  } else {
    // Pick different color word
    const availableWords = COLOR_KEYS.filter((c) => c !== textColor);
    word = availableWords[Math.floor(Math.random() * availableWords.length)];
  }

  return {
    id: questionCounter,
    word,
    textColor
  };
}
