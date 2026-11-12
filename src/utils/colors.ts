import { ColorDef, Question } from '../types/game';

// Master palette of 30 high-voltage, vibrant neon arcade colors.
// Every color is meticulously calibrated to be super bright, crisp, and high-contrast
// on dark backgrounds with rich luminous glow — zero dim or muddy shades.
export const MASTER_COLORS: Record<string, ColorDef> = {
  // --- RED FAMILY ---
  RED: {
    id: 'RED',
    name: 'RED',
    hex: '#FF0055',
    glow: 'rgba(255, 0, 85, 0.8)',
    darkHex: '#3D0014',
    rgb: '255, 0, 85',
    family: 'red'
  },
  CRIMSON: {
    id: 'CRIMSON',
    name: 'CRIMSON',
    hex: '#FF2255',
    glow: 'rgba(255, 34, 85, 0.8)',
    darkHex: '#3A000E',
    rgb: '255, 34, 85',
    family: 'red'
  },
  CORAL: {
    id: 'CORAL',
    name: 'CORAL',
    hex: '#FF6B8B',
    glow: 'rgba(255, 107, 139, 0.8)',
    darkHex: '#42141E',
    rgb: '255, 107, 139',
    family: 'red'
  },
  ROSE: {
    id: 'ROSE',
    name: 'ROSE',
    hex: '#FF1493',
    glow: 'rgba(255, 20, 147, 0.8)',
    darkHex: '#400022',
    rgb: '255, 20, 147',
    family: 'red'
  },
  RUBY: {
    id: 'RUBY',
    name: 'RUBY',
    hex: '#FF3377',
    glow: 'rgba(255, 51, 119, 0.8)',
    darkHex: '#380018',
    rgb: '255, 51, 119',
    family: 'red'
  },

  // --- BLUE / CYAN FAMILY ---
  CYAN: {
    id: 'CYAN',
    name: 'CYAN',
    hex: '#00F0FF',
    glow: 'rgba(0, 240, 255, 0.85)',
    darkHex: '#002538',
    rgb: '0, 240, 255',
    family: 'blue'
  },
  BLUE: {
    id: 'BLUE',
    name: 'BLUE',
    hex: '#1A75FF',
    glow: 'rgba(26, 117, 255, 0.85)',
    darkHex: '#001A4A',
    rgb: '26, 117, 255',
    family: 'blue'
  },
  SKY: {
    id: 'SKY',
    name: 'SKY',
    hex: '#38B6FF',
    glow: 'rgba(56, 182, 255, 0.85)',
    darkHex: '#00263E',
    rgb: '56, 182, 255',
    family: 'blue'
  },
  TEAL: {
    id: 'TEAL',
    name: 'TEAL',
    hex: '#00FFAA',
    glow: 'rgba(0, 255, 170, 0.85)',
    darkHex: '#003322',
    rgb: '0, 255, 170',
    family: 'blue'
  },
  AQUA: {
    id: 'AQUA',
    name: 'AQUA',
    hex: '#00D4FF',
    glow: 'rgba(0, 212, 255, 0.85)',
    darkHex: '#002B36',
    rgb: '0, 212, 255',
    family: 'blue'
  },

  // --- GREEN FAMILY ---
  GREEN: {
    id: 'GREEN',
    name: 'GREEN',
    hex: '#00FF66',
    glow: 'rgba(0, 255, 102, 0.85)',
    darkHex: '#003314',
    rgb: '0, 255, 102',
    family: 'green'
  },
  LIME: {
    id: 'LIME',
    name: 'LIME',
    hex: '#A6FF00',
    glow: 'rgba(166, 255, 0, 0.85)',
    darkHex: '#223800',
    rgb: '166, 255, 0',
    family: 'green'
  },
  EMERALD: {
    id: 'EMERALD',
    name: 'EMERALD',
    hex: '#00E676',
    glow: 'rgba(0, 230, 118, 0.85)',
    darkHex: '#003619',
    rgb: '0, 230, 118',
    family: 'green'
  },
  MINT: {
    id: 'MINT',
    name: 'MINT',
    hex: '#69F0AE',
    glow: 'rgba(105, 240, 174, 0.85)',
    darkHex: '#123824',
    rgb: '105, 240, 174',
    family: 'green'
  },
  JADE: {
    id: 'JADE',
    name: 'JADE',
    hex: '#00FF9D',
    glow: 'rgba(0, 255, 157, 0.85)',
    darkHex: '#003820',
    rgb: '0, 255, 157',
    family: 'green'
  },

  // --- YELLOW / GOLD FAMILY ---
  YELLOW: {
    id: 'YELLOW',
    name: 'YELLOW',
    hex: '#FFE600',
    glow: 'rgba(255, 230, 0, 0.85)',
    darkHex: '#383000',
    rgb: '255, 230, 0',
    family: 'yellow'
  },
  GOLD: {
    id: 'GOLD',
    name: 'GOLD',
    hex: '#FFB700',
    glow: 'rgba(255, 183, 0, 0.85)',
    darkHex: '#3D2800',
    rgb: '255, 183, 0',
    family: 'yellow'
  },
  AMBER: {
    id: 'AMBER',
    name: 'AMBER',
    hex: '#FFA000',
    glow: 'rgba(255, 160, 0, 0.85)',
    darkHex: '#3D2200',
    rgb: '255, 160, 0',
    family: 'yellow'
  },
  LEMON: {
    id: 'LEMON',
    name: 'LEMON',
    hex: '#E8FF00',
    glow: 'rgba(232, 255, 0, 0.85)',
    darkHex: '#333800',
    rgb: '232, 255, 0',
    family: 'yellow'
  },
  CANARY: {
    id: 'CANARY',
    name: 'CANARY',
    hex: '#FFF700',
    glow: 'rgba(255, 247, 0, 0.85)',
    darkHex: '#383600',
    rgb: '255, 247, 0',
    family: 'yellow'
  },

  // --- PURPLE / VIOLET FAMILY ---
  PURPLE: {
    id: 'PURPLE',
    name: 'PURPLE',
    hex: '#B026FF',
    glow: 'rgba(176, 38, 255, 0.85)',
    darkHex: '#26003B',
    rgb: '176, 38, 255',
    family: 'purple'
  },
  VIOLET: {
    id: 'VIOLET',
    name: 'VIOLET',
    hex: '#C77DFF',
    glow: 'rgba(199, 125, 255, 0.85)',
    darkHex: '#2B123D',
    rgb: '199, 125, 255',
    family: 'purple'
  },
  MAGENTA: {
    id: 'MAGENTA',
    name: 'MAGENTA',
    hex: '#FF0099',
    glow: 'rgba(255, 0, 153, 0.85)',
    darkHex: '#380022',
    rgb: '255, 0, 153',
    family: 'purple'
  },
  ORCHID: {
    id: 'ORCHID',
    name: 'ORCHID',
    hex: '#E056FD',
    glow: 'rgba(224, 86, 253, 0.85)',
    darkHex: '#330A3B',
    rgb: '224, 86, 253',
    family: 'purple'
  },
  INDIGO: {
    id: 'INDIGO',
    name: 'INDIGO',
    hex: '#6C5CE7',
    glow: 'rgba(108, 92, 231, 0.85)',
    darkHex: '#15103A',
    rgb: '108, 92, 231',
    family: 'purple'
  },

  // --- ORANGE FAMILY ---
  ORANGE: {
    id: 'ORANGE',
    name: 'ORANGE',
    hex: '#FF7700',
    glow: 'rgba(255, 119, 0, 0.85)',
    darkHex: '#3B1A00',
    rgb: '255, 119, 0',
    family: 'orange'
  },
  TANGERINE: {
    id: 'TANGERINE',
    name: 'TANGERINE',
    hex: '#FF9100',
    glow: 'rgba(255, 145, 0, 0.85)',
    darkHex: '#3D2000',
    rgb: '255, 145, 0',
    family: 'orange'
  },
  PEACH: {
    id: 'PEACH',
    name: 'PEACH',
    hex: '#FFA07A',
    glow: 'rgba(255, 160, 122, 0.85)',
    darkHex: '#3D2218',
    rgb: '255, 160, 122',
    family: 'orange'
  },
  APRICOT: {
    id: 'APRICOT',
    name: 'APRICOT',
    hex: '#FFB347',
    glow: 'rgba(255, 179, 71, 0.85)',
    darkHex: '#3D2808',
    rgb: '255, 179, 71',
    family: 'orange'
  },
  FLAME: {
    id: 'FLAME',
    name: 'FLAME',
    hex: '#FF4500',
    glow: 'rgba(255, 69, 0, 0.85)',
    darkHex: '#3D1000',
    rgb: '255, 69, 0',
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
