import { ColorDef, Question } from '../types/game';

// Master palette of 30 vibrant, high-perceptual-contrast colors for arcade Stroop gameplay
// Every single color has a distinct hue angle, brightness, and personality to prevent visual confusion.
export const MASTER_COLORS: Record<string, ColorDef> = {
  // --- RED FAMILY (5 distinct personalities) ---
  RED: {
    id: 'RED',
    name: 'RED',
    hex: '#FF0055',
    glow: 'rgba(255, 0, 85, 0.75)',
    darkHex: '#3D0014',
    rgb: '255, 0, 85',
    family: 'red'
  },
  CRIMSON: {
    id: 'CRIMSON',
    name: 'CRIMSON',
    hex: '#8B0000',
    glow: 'rgba(220, 20, 60, 0.75)',
    darkHex: '#2A0000',
    rgb: '139, 0, 0',
    family: 'red'
  },
  CORAL: {
    id: 'CORAL',
    name: 'CORAL',
    hex: '#FF7F7F',
    glow: 'rgba(255, 127, 127, 0.75)',
    darkHex: '#3D1C1C',
    rgb: '255, 127, 127',
    family: 'red'
  },
  ROSE: {
    id: 'ROSE',
    name: 'ROSE',
    hex: '#FF1493',
    glow: 'rgba(255, 20, 147, 0.75)',
    darkHex: '#3D0022',
    rgb: '255, 20, 147',
    family: 'red'
  },
  RUBY: {
    id: 'RUBY',
    name: 'RUBY',
    hex: '#6B003B',
    glow: 'rgba(180, 0, 90, 0.75)',
    darkHex: '#2E0018',
    rgb: '107, 0, 59',
    family: 'red'
  },

  // --- BLUE / CYAN FAMILY (5 distinct personalities) ---
  CYAN: {
    id: 'CYAN',
    name: 'CYAN',
    hex: '#00F0FF',
    glow: 'rgba(0, 240, 255, 0.75)',
    darkHex: '#002538',
    rgb: '0, 240, 255',
    family: 'blue'
  },
  BLUE: {
    id: 'BLUE',
    name: 'BLUE',
    hex: '#1E50FF',
    glow: 'rgba(30, 80, 255, 0.75)',
    darkHex: '#001A4A',
    rgb: '30, 80, 255',
    family: 'blue'
  },
  SKY: {
    id: 'SKY',
    name: 'SKY',
    hex: '#8CE8FF',
    glow: 'rgba(140, 232, 255, 0.75)',
    darkHex: '#14303B',
    rgb: '140, 232, 255',
    family: 'blue'
  },
  TEAL: {
    id: 'TEAL',
    name: 'TEAL',
    hex: '#008080',
    glow: 'rgba(0, 200, 200, 0.65)',
    darkHex: '#002222',
    rgb: '0, 128, 128',
    family: 'blue'
  },
  AQUA: {
    id: 'AQUA',
    name: 'AQUA',
    hex: '#002F6C',
    glow: 'rgba(0, 100, 220, 0.75)',
    darkHex: '#001433',
    rgb: '0, 47, 108',
    family: 'blue'
  },

  // --- GREEN FAMILY (5 distinct personalities) ---
  GREEN: {
    id: 'GREEN',
    name: 'GREEN',
    hex: '#00FF66',
    glow: 'rgba(0, 255, 102, 0.75)',
    darkHex: '#003314',
    rgb: '0, 255, 102',
    family: 'green'
  },
  LIME: {
    id: 'LIME',
    name: 'LIME',
    hex: '#BFFF00',
    glow: 'rgba(191, 255, 0, 0.75)',
    darkHex: '#253300',
    rgb: '191, 255, 0',
    family: 'green'
  },
  EMERALD: {
    id: 'EMERALD',
    name: 'EMERALD',
    hex: '#005C2B',
    glow: 'rgba(0, 160, 75, 0.75)',
    darkHex: '#002410',
    rgb: '0, 92, 43',
    family: 'green'
  },
  MINT: {
    id: 'MINT',
    name: 'MINT',
    hex: '#98FFD9',
    glow: 'rgba(152, 255, 217, 0.75)',
    darkHex: '#143828',
    rgb: '152, 255, 217',
    family: 'green'
  },
  JADE: {
    id: 'JADE',
    name: 'JADE',
    hex: '#556B2F',
    glow: 'rgba(120, 150, 70, 0.75)',
    darkHex: '#1F290F',
    rgb: '85, 107, 47',
    family: 'green'
  },

  // --- YELLOW / GOLD FAMILY (5 distinct personalities) ---
  YELLOW: {
    id: 'YELLOW',
    name: 'YELLOW',
    hex: '#FFFF00',
    glow: 'rgba(255, 255, 0, 0.75)',
    darkHex: '#383800',
    rgb: '255, 255, 0',
    family: 'yellow'
  },
  GOLD: {
    id: 'GOLD',
    name: 'GOLD',
    hex: '#B8860B',
    glow: 'rgba(218, 165, 32, 0.75)',
    darkHex: '#2E2203',
    rgb: '184, 134, 11',
    family: 'yellow'
  },
  AMBER: {
    id: 'AMBER',
    name: 'AMBER',
    hex: '#D97706',
    glow: 'rgba(217, 119, 6, 0.75)',
    darkHex: '#3D1F00',
    rgb: '217, 119, 6',
    family: 'yellow'
  },
  LEMON: {
    id: 'LEMON',
    name: 'LEMON',
    hex: '#FFF9B0',
    glow: 'rgba(255, 249, 176, 0.75)',
    darkHex: '#3B3A24',
    rgb: '255, 249, 176',
    family: 'yellow'
  },
  CANARY: {
    id: 'CANARY',
    name: 'CANARY',
    hex: '#FFE066',
    glow: 'rgba(255, 224, 102, 0.75)',
    darkHex: '#382F0A',
    rgb: '255, 224, 102',
    family: 'yellow'
  },

  // --- PURPLE / VIOLET FAMILY (5 distinct personalities) ---
  PURPLE: {
    id: 'PURPLE',
    name: 'PURPLE',
    hex: '#9D00FF',
    glow: 'rgba(157, 0, 255, 0.75)',
    darkHex: '#26003B',
    rgb: '157, 0, 255',
    family: 'purple'
  },
  VIOLET: {
    id: 'VIOLET',
    name: 'VIOLET',
    hex: '#D1B3FF',
    glow: 'rgba(209, 179, 255, 0.75)',
    darkHex: '#2B1F3D',
    rgb: '209, 179, 255',
    family: 'purple'
  },
  MAGENTA: {
    id: 'MAGENTA',
    name: 'MAGENTA',
    hex: '#FF00AA',
    glow: 'rgba(255, 0, 170, 0.75)',
    darkHex: '#380026',
    rgb: '255, 0, 170',
    family: 'purple'
  },
  ORCHID: {
    id: 'ORCHID',
    name: 'ORCHID',
    hex: '#52006A',
    glow: 'rgba(140, 0, 180, 0.75)',
    darkHex: '#21002B',
    rgb: '82, 0, 106',
    family: 'purple'
  },
  INDIGO: {
    id: 'INDIGO',
    name: 'INDIGO',
    hex: '#2B1A78',
    glow: 'rgba(80, 50, 220, 0.75)',
    darkHex: '#120A38',
    rgb: '43, 26, 120',
    family: 'purple'
  },

  // --- ORANGE FAMILY (5 distinct personalities) ---
  ORANGE: {
    id: 'ORANGE',
    name: 'ORANGE',
    hex: '#FF5500',
    glow: 'rgba(255, 85, 0, 0.75)',
    darkHex: '#3B1400',
    rgb: '255, 85, 0',
    family: 'orange'
  },
  TANGERINE: {
    id: 'TANGERINE',
    name: 'TANGERINE',
    hex: '#8C3200',
    glow: 'rgba(140, 50, 0, 0.75)',
    darkHex: '#290E00',
    rgb: '140, 50, 0',
    family: 'orange'
  },
  PEACH: {
    id: 'PEACH',
    name: 'PEACH',
    hex: '#FFD1B3',
    glow: 'rgba(255, 209, 179, 0.75)',
    darkHex: '#3B291F',
    rgb: '255, 209, 179',
    family: 'orange'
  },
  APRICOT: {
    id: 'APRICOT',
    name: 'APRICOT',
    hex: '#FF9E1B',
    glow: 'rgba(255, 158, 27, 0.75)',
    darkHex: '#382003',
    rgb: '255, 158, 27',
    family: 'orange'
  },
  FLAME: {
    id: 'FLAME',
    name: 'FLAME',
    hex: '#FF2A00',
    glow: 'rgba(255, 42, 0, 0.75)',
    darkHex: '#3D0A00',
    rgb: '255, 42, 0',
    family: 'orange'
  }
};

export const MASTER_COLOR_KEYS = Object.keys(MASTER_COLORS);
export const MASTER_COLOR_LIST = Object.values(MASTER_COLORS);

// Default base 6 colors for backwards compatibility
export const BASE_COLORS = [
  MASTER_COLORS.RED,
  MASTER_COLORS.CYAN,
  MASTER_COLORS.GREEN,
  MASTER_COLORS.YELLOW,
  MASTER_COLORS.PURPLE,
  MASTER_COLORS.ORANGE
];

let questionCounter = 0;

export function generateQuestion(availableColors: ColorDef[] = BASE_COLORS, prev?: Question): Question {
  questionCounter += 1;
  const list = availableColors.length > 0 ? availableColors : BASE_COLORS;
  
  // Pick text color
  let textIndex: number;
  do {
    textIndex = Math.floor(Math.random() * list.length);
  } while (prev && list[textIndex].id === prev.textColor && list.length > 1 && Math.random() < 0.7);

  const textColor = list[textIndex].id;

  // In Stroop tests, ~85% mismatch and ~15% match keeps players challenged without letting them auto-negate
  const shouldMatch = Math.random() < 0.15;
  let word: string;

  if (shouldMatch) {
    word = textColor;
  } else {
    // Pick different color word from the available colors
    const otherColors = list.filter((c) => c.id !== textColor);
    if (otherColors.length > 0) {
      word = otherColors[Math.floor(Math.random() * otherColors.length)].id;
    } else {
      word = textColor;
    }
  }

  return {
    id: questionCounter,
    word,
    textColor
  };
}
