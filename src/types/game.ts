export type ColorName = 'RED' | 'BLUE' | 'GREEN' | 'YELLOW' | 'PURPLE' | 'ORANGE';

export interface ColorDef {
  id: ColorName;
  name: string;
  hex: string;
  glow: string;
  darkHex: string;
  rgb: string;
}

export interface Question {
  id: number;
  word: ColorName;
  textColor: ColorName;
}

export type GameState = 'HOME' | 'PLAYING' | 'GAMEOVER';

export interface FloatingNotification {
  id: string;
  text: string;
  type: 'correct' | 'wrong' | 'bonus';
  x: number;
  y: number;
}
