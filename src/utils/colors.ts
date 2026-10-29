import { ColorDef, Question } from '../types/game';

// Master palette of 30 vibrant, carefully-curated neon colors for arcade Stroop gameplay
export const MASTER_COLORS: Record<string, ColorDef> = {
  // --- RED FAMILY ---
  RED: {
    id: 'RED',
    name: 'RED',
    hex: '#FF3366',
    glow: 'rgba(255, 51, 102, 0.65)',
    darkHex: '#3D0014',
    rgb: '255, 51, 102',
    family: 'red'
  },
  CRIMSON: {
    id: 'CRIMSON',
    name: 'CRIMSON',
    hex: '#FF1744',
    glow: 'rgba(255, 23, 68, 0.65)',
    darkHex: '#3A000E',
    rgb: '255, 23, 68',
    family: 'red'
  },
  CORAL: {
    id: 'CORAL',
    name: 'CORAL',
    hex: '#FF6B6B',
    glow: 'rgba(255, 107, 107, 0.65)',
    darkHex: '#421414',
    rgb: '255, 107, 107',
    family: 'red'
  },
  ROSE: {
    id: 'ROSE',
    name: 'ROSE',
    hex: '#FF2A85',
    glow: 'rgba(255, 42, 133, 0.65)',
    darkHex: '#40001E',
    rgb: '255, 42, 133',
    family: 'red'
  },
  RUBY: {
    id: 'RUBY',
    name: 'RUBY',
    hex: '#E0115F',
    glow: 'rgba(224, 17, 95, 0.65)',
    darkHex: '#380017',
    rgb: '224, 17, 95',
    family: 'red'
  },

  // --- BLUE / CYAN FAMILY ---
  CYAN: {
    id: 'CYAN',
    name: 'CYAN',
    hex: '#00E5FF',
    glow: 'rgba(0, 229, 255, 0.65)',
    darkHex: '#002538',
    rgb: '0, 229, 255',
    family: 'blue'
  },
  BLUE: {
    id: 'BLUE',
    name: 'BLUE',
    hex: '#2979FF',
    glow: 'rgba(41, 121, 255, 0.65)',
    darkHex: '#001A4A',
    rgb: '41, 121, 255',
    family: 'blue'
  },
  SKY: {
    id: 'SKY',
    name: 'SKY',
    hex: '#00B0FF',
    glow: 'rgba(0, 176, 255, 0.65)',
    darkHex: '#00223B',
    rgb: '0, 176, 255',
    family: 'blue'
  },
  TEAL: {
    id: 'TEAL',
    name: 'TEAL',
    hex: '#00E5D0',
    glow: 'rgba(0, 229, 208, 0.65)',
    darkHex: '#002E29',
    rgb: '0, 229, 208',
    family: 'blue'
  },
  AQUA: {
    id: 'AQUA',
    name: 'AQUA',
    hex: '#18FFFF',
    glow: 'rgba(24, 255, 255, 0.65)',
    darkHex: '#003333',
    rgb: '24, 255, 255',
    family: 'blue'
  },

  // --- GREEN FAMILY ---
  GREEN: {
    id: 'GREEN',
    name: 'GREEN',
    hex: '#00FF88',
    glow: 'rgba(0, 255, 136, 0.65)',
    darkHex: '#003319',
    rgb: '0, 255, 136',
    family: 'green'
  },
  LIME: {
    id: 'LIME',
    name: 'LIME',
    hex: '#76FF03',
    glow: 'rgba(118, 255, 3, 0.65)',
    darkHex: '#183800',
    rgb: '118, 255, 3',
    family: 'green'
  },
  EMERALD: {
    id: 'EMERALD',
    name: 'EMERALD',
    hex: '#00E676',
    glow: 'rgba(0, 230, 118, 0.65)',
    darkHex: '#003619',
    rgb: '0, 230, 118',
    family: 'green'
  },
  MINT: {
    id: 'MINT',
    name: 'MINT',
    hex: '#69F0AE',
    glow: 'rgba(105, 240, 174, 0.65)',
    darkHex: '#123824',
    rgb: '105, 240, 174',
    family: 'green'
  },
  JADE: {
    id: 'JADE',
    name: 'JADE',
    hex: '#00C853',
    glow: 'rgba(0, 200, 83, 0.65)',
    darkHex: '#003314',
    rgb: '0, 200, 83',
    family: 'green'
  },

  // --- YELLOW / GOLD FAMILY ---
  YELLOW: {
    id: 'YELLOW',
    name: 'YELLOW',
    hex: '#FFE600',
    glow: 'rgba(255, 230, 0, 0.65)',
    darkHex: '#383000',
    rgb: '255, 230, 0',
    family: 'yellow'
  },
  GOLD: {
    id: 'GOLD',
    name: 'GOLD',
    hex: '#FFD700',
    glow: 'rgba(255, 215, 0, 0.65)',
    darkHex: '#382E00',
    rgb: '255, 215, 0',
    family: 'yellow'
  },
  AMBER: {
    id: 'AMBER',
    name: 'AMBER',
    hex: '#FFC400',
    glow: 'rgba(255, 196, 0, 0.65)',
    darkHex: '#3D2D00',
    rgb: '255, 196, 0',
    family: 'yellow'
  },
  LEMON: {
    id: 'LEMON',
    name: 'LEMON',
    hex: '#FFFF00',
    glow: 'rgba(255, 255, 0, 0.65)',
    darkHex: '#3B3B00',
    rgb: '255, 255, 0',
    family: 'yellow'
  },
  CANARY: {
    id: 'CANARY',
    name: 'CANARY',
    hex: '#FFEA00',
    glow: 'rgba(255, 234, 0, 0.65)',
    darkHex: '#3D3600',
    rgb: '255, 234, 0',
    family: 'yellow'
  },

  // --- PURPLE / VIOLET FAMILY ---
  PURPLE: {
    id: 'PURPLE',
    name: 'PURPLE',
    hex: '#B026FF',
    glow: 'rgba(176, 38, 255, 0.65)',
    darkHex: '#26003B',
    rgb: '176, 38, 255',
    family: 'purple'
  },
  VIOLET: {
    id: 'VIOLET',
    name: 'VIOLET',
    hex: '#7C4DFF',
    glow: 'rgba(124, 77, 255, 0.65)',
    darkHex: '#1B0A42',
    rgb: '124, 77, 255',
    family: 'purple'
  },
  MAGENTA: {
    id: 'MAGENTA',
    name: 'MAGENTA',
    hex: '#FF00FF',
    glow: 'rgba(255, 0, 255, 0.65)',
    darkHex: '#380038',
    rgb: '255, 0, 255',
    family: 'purple'
  },
  ORCHID: {
    id: 'ORCHID',
    name: 'ORCHID',
    hex: '#E040FB',
    glow: 'rgba(224, 64, 251, 0.65)',
    darkHex: '#33003B',
    rgb: '224, 64, 251',
    family: 'purple'
  },
  INDIGO: {
    id: 'INDIGO',
    name: 'INDIGO',
    hex: '#536DFE',
    glow: 'rgba(83, 109, 254, 0.65)',
    darkHex: '#0D1445',
    rgb: '83, 109, 254',
    family: 'purple'
  },

  // --- ORANGE FAMILY ---
  ORANGE: {
    id: 'ORANGE',
    name: 'ORANGE',
    hex: '#FF7700',
    glow: 'rgba(255, 119, 0, 0.65)',
    darkHex: '#3B1A00',
    rgb: '255, 119, 0',
    family: 'orange'
  },
  TANGERINE: {
    id: 'TANGERINE',
    name: 'TANGERINE',
    hex: '#FF9100',
    glow: 'rgba(255, 145, 0, 0.65)',
    darkHex: '#3D2000',
    rgb: '255, 145, 0',
    family: 'orange'
  },
  PEACH: {
    id: 'PEACH',
    name: 'PEACH',
    hex: '#FF8A65',
    glow: 'rgba(255, 138, 101, 0.65)',
    darkHex: '#3D1C12',
    rgb: '255, 138, 101',
    family: 'orange'
  },
  APRICOT: {
    id: 'APRICOT',
    name: 'APRICOT',
    hex: '#FFA726',
    glow: 'rgba(255, 167, 38, 0.65)',
    darkHex: '#3D2400',
    rgb: '255, 167, 38',
    family: 'orange'
  },
  FLAME: {
    id: 'FLAME',
    name: 'FLAME',
    hex: '#FF5722',
    glow: 'rgba(255, 87, 34, 0.65)',
    darkHex: '#3D1205',
    rgb: '255, 87, 34',
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
