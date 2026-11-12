import { Question } from './game';

export interface MultiplayerPlayer {
  id: string;              // Peer ID
  name: string;            // Display Name (e.g. Krishna)
  isHost: boolean;
  isReady: boolean;
  score: number;
  streak: number;
  longestStreak: number;
  correctAnswers: number;
  wrongAnswers: number;
  hasFinished: boolean;
}

export interface MultiplayerSettings {
  duration: 30 | 40 | 60;   // Round duration in seconds
  colorCount: 6 | 10 | 16;  // 6 = Classic, 10 = Arcade, 16 = Pro
}

export interface RoomState {
  roomCode: string;
  hostId: string;
  settings: MultiplayerSettings;
  status: 'LOBBY' | 'COUNTDOWN' | 'PLAYING' | 'RESULTS';
  players: Record<string, MultiplayerPlayer>;
  questions: Question[];    // Pre-generated synchronized questions (identical for everyone)
  countdownStartMs: number;
  gameStartMs: number;
}

// Peer Message Protocols
export type PeerMessage =
  | { type: 'JOIN_REQUEST'; name: string }
  | { type: 'JOIN_ACCEPTED'; roomState: RoomState; yourId: string }
  | { type: 'JOIN_REJECTED'; reason: string }
  | { type: 'ROOM_UPDATE'; roomState: RoomState }
  | { type: 'SETTINGS_UPDATE'; settings: MultiplayerSettings }
  | { type: 'START_COUNTDOWN'; countdownStartMs: number; gameStartMs: number; questions?: Question[]; seed?: number; hostStartTime?: number }
  | { type: 'SCORE_UPDATE'; playerId: string; score: number; streak: number; correct: boolean }
  | { type: 'PLAYER_FINISHED'; playerId: string; finalScore: number; longestStreak: number; correctCount: number; wrongCount: number }
  | { type: 'REMATCH' }
  | { type: 'PLAYER_LEFT'; playerId: string; playerName?: string }
  | { type: 'HOST_CLOSED'; reason: string }
  | { type: 'PING'; clientTime?: number; senderId?: string; hostId?: string }
  | { type: 'PONG'; clientTime?: number; hostTime?: number };
