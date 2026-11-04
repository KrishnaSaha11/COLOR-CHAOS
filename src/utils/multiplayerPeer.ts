import Peer from 'peerjs';
import type { DataConnection } from 'peerjs';
import { RoomState, MultiplayerSettings, PeerMessage, MultiplayerPlayer } from '../types/multiplayer';
import { getColorsForMultiplayer, generateMultiplayerQuestionSequence } from './multiplayerQuestions';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:global.stun.twilio.com:3478' }
];

/**
 * MULTIPLAYER MANAGER
 *
 * Architecture: Host-authoritative star topology over PeerJS WebRTC.
 *   - Host registers a deterministic peer ID (derived from room code) on PeerJS signaling.
 *   - Guests create a random peer ID, then connect to the host's peer ID.
 *   - All game state lives on the host; guests receive snapshots via ROOM_UPDATE.
 *
 * Key design decisions for reliability:
 *   1. Signaling keepalive: We periodically create+destroy a dummy Peer to probe the
 *      signaling server, AND auto-reconnect on 'disconnected' events.
 *   2. Data keepalive: Host & guests exchange PING/PONG every 4s; timeout at 15s.
 *   3. Countdown uses RELATIVE time (seconds from now) not absolute Date.now() timestamps,
 *      so network delay does not eat into the countdown.
 *   4. Status transitions: LOBBY → COUNTDOWN → PLAYING → RESULTS.
 */
export class MultiplayerManager {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private hostConnection: DataConnection | null = null;

  // Keepalive timers
  private signalingKeepAliveTimer: ReturnType<typeof setInterval> | null = null;
  private dataKeepAliveTimer: ReturnType<typeof setInterval> | null = null;
  private lastPeerSeen: Map<string, number> = new Map();
  private lastHostSeen: number = 0;
  private destroyed: boolean = false;

  public isHost: boolean = false;
  public myId: string = '';
  public myName: string = '';
  public roomState: RoomState | null = null;

  // Callbacks for UI
  public onStateUpdate: ((state: RoomState) => void) | null = null;
  public onCountdown: ((countdownStartMs: number, gameStartMs: number) => void) | null = null;
  public onGameStart: (() => void) | null = null;
  public onError: ((err: string) => void) | null = null;
  public onDisconnected: ((reason?: string) => void) | null = null;
  public onPlayerNotification: ((msg: string) => void) | null = null;

  // ------- Room Code -------

  public static generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  private static getPeerIdForRoom(roomCode: string): string {
    const clean = roomCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    return `cchaos-${clean.toLowerCase()}`;
  }

  // ------- Signaling Keepalive -------
  // The free PeerJS cloud signaling server (0.peerjs.com) closes idle WebSocket
  // connections after ~30-60s. We use peer.reconnect() on 'disconnected' events
  // and also poll every 5s to catch silent disconnects.

  private startSignalingKeepAlive() {
    this.stopSignalingKeepAlive();
    this.signalingKeepAliveTimer = setInterval(() => {
      if (!this.peer || this.peer.destroyed || this.destroyed) return;
      if (this.peer.disconnected) {
        console.warn('[PeerJS] Signaling disconnected. Reconnecting…');
        try { this.peer.reconnect(); } catch { /* ignore */ }
      }
    }, 5000);
  }

  private stopSignalingKeepAlive() {
    if (this.signalingKeepAliveTimer) {
      clearInterval(this.signalingKeepAliveTimer);
      this.signalingKeepAliveTimer = null;
    }
  }

  // ------- Data Keepalive -------

  private startDataKeepAlive() {
    this.stopDataKeepAlive();
    this.dataKeepAliveTimer = setInterval(() => {
      if (this.destroyed) return;
      const now = Date.now();

      if (this.isHost) {
        // Host pings each connected guest
        this.connections.forEach((conn, peerId) => {
          if (conn.open) {
            try { conn.send({ type: 'PING' }); } catch { /* ignore */ }
          }
          // Only disconnect if genuinely dead (90s of silence or closed WebRTC connection)
          const last = this.lastPeerSeen.get(peerId) ?? now;
          const isIceFailed = (conn.peerConnection as unknown as { iceConnectionState?: string })?.iceConnectionState === 'failed';
          const isConnClosed = (conn.peerConnection as unknown as { connectionState?: string })?.connectionState === 'closed';

          if (isIceFailed || isConnClosed || (now - last > 90000)) {
            console.warn('[Multiplayer] Guest truly disconnected:', peerId);
            this.handlePlayerDisconnect(peerId);
          }
        });
      } else if (this.hostConnection?.open) {
        // Guest pings host
        try { this.hostConnection.send({ type: 'PING' }); } catch { /* ignore */ }
        const isIceFailed = (this.hostConnection.peerConnection as unknown as { iceConnectionState?: string })?.iceConnectionState === 'failed';
        const isConnClosed = (this.hostConnection.peerConnection as unknown as { connectionState?: string })?.connectionState === 'closed';

        if (isIceFailed || isConnClosed || (this.lastHostSeen > 0 && now - this.lastHostSeen > 90000)) {
          console.warn('[Multiplayer] Host connection failed');
          this.handleHostDisconnected('Lost connection to Host.');
        }
      }
    }, 4000);
  }

  private stopDataKeepAlive() {
    if (this.dataKeepAliveTimer) {
      clearInterval(this.dataKeepAliveTimer);
      this.dataKeepAliveTimer = null;
    }
  }

  // ======================================================================
  //  CREATE ROOM (HOST)
  // ======================================================================

  public async createRoom(
    hostName: string,
    settings: MultiplayerSettings = { duration: 30, colorCount: 6 }
  ): Promise<string> {
    this.destroy();
    this.destroyed = false;
    this.isHost = true;
    this.myName = hostName.trim() || 'Host';

    const roomCode = MultiplayerManager.generateRoomCode();
    const hostPeerId = MultiplayerManager.getPeerIdForRoom(roomCode);

    return new Promise((resolve, reject) => {
      try {
        this.peer = new Peer(hostPeerId, {
          config: { iceServers: ICE_SERVERS },
          debug: 0
        });

        this.peer.on('open', (id) => {
          this.myId = id;
          const hostPlayer: MultiplayerPlayer = {
            id,
            name: this.myName,
            isHost: true,
            isReady: true,
            score: 0,
            streak: 0,
            longestStreak: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            hasFinished: false
          };

          this.roomState = {
            roomCode,
            hostId: id,
            settings,
            status: 'LOBBY',
            players: { [id]: hostPlayer },
            questions: [],
            countdownStartMs: 0,
            gameStartMs: 0
          };

          this.setupHostListeners();
          this.startSignalingKeepAlive();
          this.startDataKeepAlive();

          if (this.onStateUpdate && this.roomState) {
            this.onStateUpdate(this.roomState);
          }
          resolve(roomCode);
        });

        this.peer.on('disconnected', () => {
          console.warn('[PeerJS Host] Disconnected from signaling. Reconnecting…');
          if (this.peer && !this.peer.destroyed) {
            try { this.peer.reconnect(); } catch { /* ignore */ }
          }
        });

        this.peer.on('error', (err) => {
          console.error('PeerJS Host Error:', err);
          if (err.type === 'unavailable-id') {
            this.createRoom(hostName, settings).then(resolve).catch(reject);
          } else {
            const msg = err.message || 'Failed to create room. Please check your internet.';
            if (this.onError) this.onError(msg);
            reject(new Error(msg));
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  // ======================================================================
  //  JOIN ROOM (GUEST)
  // ======================================================================

  public async joinRoom(
    roomCode: string,
    playerName: string,
    retryCount = 0
  ): Promise<RoomState> {
    if (retryCount === 0) {
      this.destroy();
      this.destroyed = false;
    }
    this.isHost = false;
    this.myName = playerName.trim() || 'Player';
    const formattedCode = roomCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const hostPeerId = MultiplayerManager.getPeerIdForRoom(formattedCode);

    return new Promise((resolve, reject) => {
      try {
        this.peer = new Peer({
          config: { iceServers: ICE_SERVERS },
          debug: 0
        });

        let settled = false;
        const timeout = setTimeout(() => {
          if (!settled) {
            settled = true;
            reject(new Error(
              `Room "${formattedCode}" not found or host is offline.\n` +
              'Make sure the host has the room open and the code is correct.'
            ));
          }
        }, 12000);

        this.peer.on('open', (id) => {
          this.myId = id;
          this.startSignalingKeepAlive();

          const conn = this.peer!.connect(hostPeerId, { reliable: true });
          this.hostConnection = conn;

          conn.on('open', () => {
            clearTimeout(timeout);
            this.lastHostSeen = Date.now();
            this.startDataKeepAlive();

            const msg: PeerMessage = { type: 'JOIN_REQUEST', name: this.myName };
            conn.send(msg);
          });

          conn.on('data', (data) => {
            this.lastHostSeen = Date.now();
            const msg = data as PeerMessage;
            this.handleGuestMessage(msg, (state) => {
              if (!settled) {
                settled = true;
                clearTimeout(timeout);
                resolve(state);
              }
            }, (err) => {
              if (!settled) {
                settled = true;
                clearTimeout(timeout);
                reject(err);
              }
            });
          });

          conn.on('close', () => {
            if (!settled) {
              settled = true;
              clearTimeout(timeout);
              reject(new Error('Connection to host was lost before joining.'));
            } else {
              this.handleHostDisconnected('The host has disconnected or closed the room.');
            }
          });

          conn.on('error', (err) => {
            console.error('Data connection error:', err);
            if (!settled) {
              settled = true;
              clearTimeout(timeout);
              reject(new Error('Connection to host failed.'));
            }
          });
        });

        this.peer.on('disconnected', () => {
          if (this.peer && !this.peer.destroyed) {
            try { this.peer.reconnect(); } catch { /* ignore */ }
          }
        });

        this.peer.on('error', (err) => {
          console.error('PeerJS Guest Error:', err);
          if (settled) return;

          // Retry once on peer-unavailable (host may be briefly reconnecting signaling)
          if (err.type === 'peer-unavailable' && retryCount < 2) {
            clearTimeout(timeout);
            const delayMs = 1000 + retryCount * 800;
            console.log(`[PeerJS] peer-unavailable, retry ${retryCount + 1} in ${delayMs}ms…`);
            setTimeout(() => {
              this.joinRoom(formattedCode, playerName, retryCount + 1)
                .then(resolve)
                .catch(reject);
            }, delayMs);
            return;
          }

          settled = true;
          clearTimeout(timeout);
          const msg = err.type === 'peer-unavailable'
            ? `Room "${formattedCode}" does not exist or host is offline.`
            : 'Failed to join room. Please check your connection.';
          if (this.onError) this.onError(msg);
          reject(new Error(msg));
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  // ======================================================================
  //  HOST LISTENERS
  // ======================================================================

  private setupHostListeners() {
    if (!this.peer) return;

    this.peer.on('connection', (conn) => {
      this.lastPeerSeen.set(conn.peer, Date.now());

      conn.on('data', (data) => {
        this.lastPeerSeen.set(conn.peer, Date.now());
        this.handleHostIncomingMessage(conn, data as PeerMessage);
      });

      conn.on('close', () => {
        this.handlePlayerDisconnect(conn.peer);
      });

      conn.on('error', (err) => {
        console.warn('Peer connection error:', conn.peer, err);
        this.handlePlayerDisconnect(conn.peer);
      });
    });
  }

  // ======================================================================
  //  HOST MESSAGE HANDLER
  // ======================================================================

  private handleHostIncomingMessage(conn: DataConnection, msg: PeerMessage) {
    if (!this.roomState) return;

    if (msg.type === 'PING') {
      try { conn.send({ type: 'PONG' }); } catch { /* ignore */ }
      return;
    }
    if (msg.type === 'PONG') return;

    if (msg.type === 'JOIN_REQUEST') {
      const playerCount = Object.keys(this.roomState.players).length;

      if (playerCount >= 5) {
        try { conn.send({ type: 'JOIN_REJECTED', reason: 'Room is full (max 5 players).' } as PeerMessage); } catch {}
        conn.close();
        return;
      }

      if (this.roomState.status !== 'LOBBY') {
        try { conn.send({ type: 'JOIN_REJECTED', reason: 'A match is already in progress. Wait for rematch.' } as PeerMessage); } catch {}
        conn.close();
        return;
      }

      const newPlayer: MultiplayerPlayer = {
        id: conn.peer,
        name: msg.name || `Player ${playerCount + 1}`,
        isHost: false,
        isReady: true,
        score: 0,
        streak: 0,
        longestStreak: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        hasFinished: false
      };

      this.connections.set(conn.peer, conn);
      this.roomState.players[conn.peer] = newPlayer;

      if (this.onPlayerNotification) {
        this.onPlayerNotification(`👋 ${newPlayer.name} joined the room!`);
      }

      try {
        conn.send({
          type: 'JOIN_ACCEPTED',
          roomState: this.roomState,
          yourId: conn.peer
        } as PeerMessage);
      } catch {}

      this.broadcastRoomUpdate();
    } else if (msg.type === 'SCORE_UPDATE') {
      const p = this.roomState.players[msg.playerId];
      if (p) {
        p.score = msg.score;
        p.streak = msg.streak;
        if (msg.streak > p.longestStreak) p.longestStreak = msg.streak;
        if (msg.correct) p.correctAnswers += 1;
        else p.wrongAnswers += 1;
        this.broadcastRoomUpdate();
      }
    } else if (msg.type === 'PLAYER_FINISHED') {
      const p = this.roomState.players[msg.playerId];
      if (p) {
        p.score = msg.finalScore;
        p.longestStreak = msg.longestStreak;
        p.correctAnswers = msg.correctCount;
        p.wrongAnswers = msg.wrongCount;
        p.hasFinished = true;

        const allDone = Object.values(this.roomState.players).every((pl) => pl.hasFinished);
        if (allDone) {
          this.roomState.status = 'RESULTS';
        }
        this.broadcastRoomUpdate();
      }
    } else if (msg.type === 'PLAYER_LEFT') {
      this.handlePlayerDisconnect(msg.playerId, msg.playerName);
    }
  }

  // ======================================================================
  //  GUEST MESSAGE HANDLER
  // ======================================================================

  private handleGuestMessage(
    msg: PeerMessage,
    onJoinResolved?: (state: RoomState) => void,
    onJoinRejected?: (err: Error) => void
  ) {
    if (msg.type === 'PING') {
      if (this.hostConnection?.open) {
        try { this.hostConnection.send({ type: 'PONG' }); } catch { /* ignore */ }
      }
      return;
    }
    if (msg.type === 'PONG') return;

    if (msg.type === 'JOIN_ACCEPTED') {
      this.roomState = msg.roomState;
      this.myId = msg.yourId;
      if (onJoinResolved) onJoinResolved(msg.roomState);
      if (this.onStateUpdate) this.onStateUpdate(msg.roomState);

    } else if (msg.type === 'JOIN_REJECTED') {
      if (onJoinRejected) onJoinRejected(new Error(msg.reason));
      if (this.onError) this.onError(msg.reason);

    } else if (msg.type === 'ROOM_UPDATE') {
      this.roomState = msg.roomState;
      if (this.onStateUpdate) this.onStateUpdate(msg.roomState);

    } else if (msg.type === 'START_COUNTDOWN') {
      if (this.roomState) {
        this.roomState.status = 'COUNTDOWN';
        this.roomState.questions = msg.questions;
        // ★ KEY FIX: Re-anchor timestamps to the GUEST's own clock.
        // The host sent "countdownStartMs" and "gameStartMs" based on ITS Date.now().
        // By the time this arrives, network latency has eaten some of that time.
        // Instead, we calculate the game start time relative to NOW on the guest,
        // preserving the same countdown duration the host intended.
        const intendedCountdownDurationMs = msg.gameStartMs - msg.countdownStartMs;
        const now = Date.now();
        this.roomState.countdownStartMs = now;
        this.roomState.gameStartMs = now + intendedCountdownDurationMs;

        if (this.onStateUpdate) this.onStateUpdate(this.roomState);
      }
      if (this.onCountdown) {
        this.onCountdown(
          this.roomState?.countdownStartMs ?? Date.now(),
          this.roomState?.gameStartMs ?? Date.now() + 3200
        );
      }

    } else if (msg.type === 'REMATCH') {
      if (this.roomState) {
        this.roomState.status = 'LOBBY';
        Object.values(this.roomState.players).forEach((p) => {
          p.score = 0;
          p.streak = 0;
          p.longestStreak = 0;
          p.correctAnswers = 0;
          p.wrongAnswers = 0;
          p.hasFinished = false;
        });
        if (this.onStateUpdate) this.onStateUpdate(this.roomState);
      }

    } else if (msg.type === 'HOST_CLOSED') {
      this.handleHostDisconnected(msg.reason || 'The Host has left the room.');
    }
  }

  // ======================================================================
  //  DISCONNECT HANDLERS
  // ======================================================================

  private handlePlayerDisconnect(playerId: string, playerName?: string) {
    this.connections.delete(playerId);
    this.lastPeerSeen.delete(playerId);

    if (this.roomState && this.roomState.players[playerId]) {
      const leavingName = playerName || this.roomState.players[playerId].name;
      delete this.roomState.players[playerId];

      if (this.onPlayerNotification) {
        this.onPlayerNotification(`⚠️ ${leavingName} left the room.`);
      }

      // If the match was live and now everyone remaining is done → go to results
      if (this.roomState.status === 'COUNTDOWN' || this.roomState.status === 'PLAYING') {
        const remaining = Object.values(this.roomState.players);
        if (remaining.length > 0 && remaining.every((p) => p.hasFinished)) {
          this.roomState.status = 'RESULTS';
        }
      }

      this.broadcastRoomUpdate();
    }
  }

  private handleHostDisconnected(reason: string) {
    if (this.destroyed) return;
    if (this.onDisconnected) {
      this.onDisconnected(reason);
    }
  }

  // ======================================================================
  //  SETTINGS
  // ======================================================================

  public updateSettings(newSettings: MultiplayerSettings) {
    if (!this.isHost || !this.roomState) return;
    this.roomState.settings = newSettings;
    this.broadcastRoomUpdate();
  }

  // ======================================================================
  //  START MATCH  (HOST ONLY)
  // ======================================================================

  public startMatch() {
    if (!this.isHost || !this.roomState) return;

    const playerCount = Object.keys(this.roomState.players).length;
    if (playerCount < 2) {
      if (this.onError) this.onError('Need at least 2 players! Share the room code with a friend.');
      return;
    }

    // Reset all player stats
    Object.values(this.roomState.players).forEach((p) => {
      p.score = 0;
      p.streak = 0;
      p.longestStreak = 0;
      p.correctAnswers = 0;
      p.wrongAnswers = 0;
      p.hasFinished = false;
    });

    const colors = getColorsForMultiplayer(this.roomState.settings.colorCount);
    const seed = Date.now();
    const questions = generateMultiplayerQuestionSequence(colors, seed, 120);

    const now = Date.now();
    const countdownDurationMs = 3200;
    const countdownStartMs = now;
    const gameStartMs = now + countdownDurationMs;

    this.roomState.status = 'COUNTDOWN';
    this.roomState.questions = questions;
    this.roomState.countdownStartMs = countdownStartMs;
    this.roomState.gameStartMs = gameStartMs;

    // ★ Send countdown + game start info. Guest will re-anchor to own clock.
    const startMsg: PeerMessage = {
      type: 'START_COUNTDOWN',
      countdownStartMs,
      gameStartMs,
      questions
    };
    this.broadcastMessage(startMsg);

    if (this.onStateUpdate) this.onStateUpdate(this.roomState);
    if (this.onCountdown) this.onCountdown(countdownStartMs, gameStartMs);

    // ★ Transition status from COUNTDOWN → PLAYING after the countdown period
    setTimeout(() => {
      if (this.roomState && this.roomState.status === 'COUNTDOWN') {
        this.roomState.status = 'PLAYING';
        // Don't broadcast this – it's just an internal status for disconnect handling
      }
    }, countdownDurationMs + 500);
  }

  // ======================================================================
  //  SCORE & FINISH
  // ======================================================================

  public sendScoreUpdate(score: number, streak: number, isCorrect: boolean) {
    if (!this.roomState) return;

    if (this.isHost) {
      const p = this.roomState.players[this.myId];
      if (p) {
        p.score = score;
        p.streak = streak;
        if (streak > p.longestStreak) p.longestStreak = streak;
        if (isCorrect) p.correctAnswers += 1;
        else p.wrongAnswers += 1;
      }
      this.broadcastRoomUpdate();
    } else if (this.hostConnection?.open) {
      try {
        this.hostConnection.send({
          type: 'SCORE_UPDATE',
          playerId: this.myId,
          score,
          streak,
          correct: isCorrect
        } as PeerMessage);
      } catch { /* ignore */ }
    }
  }

  public sendFinish(finalScore: number, longestStreak: number, correctCount: number, wrongCount: number) {
    if (!this.roomState) return;

    if (this.isHost) {
      const p = this.roomState.players[this.myId];
      if (p) {
        p.score = finalScore;
        p.longestStreak = longestStreak;
        p.correctAnswers = correctCount;
        p.wrongAnswers = wrongCount;
        p.hasFinished = true;
      }
      const allDone = Object.values(this.roomState.players).every((pl) => pl.hasFinished);
      if (allDone) {
        this.roomState.status = 'RESULTS';
      }
      this.broadcastRoomUpdate();
    } else if (this.hostConnection?.open) {
      try {
        this.hostConnection.send({
          type: 'PLAYER_FINISHED',
          playerId: this.myId,
          finalScore,
          longestStreak,
          correctCount,
          wrongCount
        } as PeerMessage);
      } catch { /* ignore */ }
    }
  }

  // ======================================================================
  //  REMATCH
  // ======================================================================

  public triggerRematch() {
    if (!this.isHost || !this.roomState) return;

    this.roomState.status = 'LOBBY';
    Object.values(this.roomState.players).forEach((p) => {
      p.score = 0;
      p.streak = 0;
      p.longestStreak = 0;
      p.correctAnswers = 0;
      p.wrongAnswers = 0;
      p.hasFinished = false;
    });

    this.broadcastMessage({ type: 'REMATCH' } as PeerMessage);
    this.broadcastRoomUpdate();
  }

  // ======================================================================
  //  LEAVE ROOM (graceful goodbye)
  // ======================================================================

  public leaveRoom() {
    if (this.isHost) {
      const msg: PeerMessage = { type: 'HOST_CLOSED', reason: 'The host has left or closed the room.' };
      this.broadcastMessage(msg);
    } else if (this.hostConnection?.open) {
      try {
        this.hostConnection.send({
          type: 'PLAYER_LEFT',
          playerId: this.myId,
          playerName: this.myName
        } as PeerMessage);
      } catch { /* ignore */ }
    }

    // Small delay so the goodbye message reaches the wire before teardown
    setTimeout(() => this.destroy(), 120);
  }

  // ======================================================================
  //  BROADCAST HELPERS
  // ======================================================================

  private broadcastMessage(msg: PeerMessage) {
    this.connections.forEach((conn) => {
      if (conn.open) {
        try { conn.send(msg); } catch { /* ignore */ }
      }
    });
  }

  private broadcastRoomUpdate() {
    if (!this.roomState) return;
    const msg: PeerMessage = { type: 'ROOM_UPDATE', roomState: this.roomState };
    this.broadcastMessage(msg);
    if (this.onStateUpdate) {
      this.onStateUpdate(this.roomState);
    }
  }

  // ======================================================================
  //  DESTROY (full teardown)
  // ======================================================================

  public destroy() {
    this.destroyed = true;
    this.stopSignalingKeepAlive();
    this.stopDataKeepAlive();

    try {
      this.connections.forEach((conn) => { try { conn.close(); } catch {} });
      this.connections.clear();
      this.lastPeerSeen.clear();

      if (this.hostConnection) {
        try { this.hostConnection.close(); } catch {}
        this.hostConnection = null;
      }
      if (this.peer) {
        try { this.peer.destroy(); } catch {}
        this.peer = null;
      }
    } catch { /* ignore */ }

    this.roomState = null;
    this.isHost = false;
    this.lastHostSeen = 0;
  }
}
