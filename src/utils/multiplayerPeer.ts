import mqtt, { MqttClient } from 'mqtt';
import { RoomState, MultiplayerSettings, PeerMessage, MultiplayerPlayer } from '../types/multiplayer';
import { getColorsForMultiplayer, generateMultiplayerQuestionSequence } from './multiplayerQuestions';

// Global high-speed WebSocket Secure brokers (port 8084 / 8884)
// These bypass all NAT, cellular (Jio/Airtel/Vi), and firewall blocks worldwide.
const BROKERS = [
  'wss://broker.emqx.io:8084/mqtt',
  'wss://broker.hivemq.com:8884/mqtt'
];

export class MultiplayerManager {
  private client: MqttClient | null = null;
  private currentRoomCode: string = '';
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private pendingHostCountdownTrigger: (() => void) | null = null;

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

  // 6-character clean room code generator (no easily confused chars)
  public static generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Connect to cloud broker with automatic fallback
  private connectBroker(brokerIndex = 0): Promise<MqttClient> {
    return new Promise((resolve, reject) => {
      const brokerUrl = BROKERS[brokerIndex] || BROKERS[0];
      const clientId = `cc_${Math.random().toString(16).substring(2, 10)}_${Date.now()}`;

      const client = mqtt.connect(brokerUrl, {
        clientId,
        clean: true,
        connectTimeout: 8000,
        keepalive: 30,
        reconnectPeriod: 3000
      });

      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          try { client.end(true); } catch {}
          if (brokerIndex + 1 < BROKERS.length) {
            console.warn(`[Multiplayer] Primary broker timeout, switching to fallback...`);
            this.connectBroker(brokerIndex + 1).then(resolve).catch(reject);
          } else {
            reject(new Error('Unable to connect to game network. Please check your internet connection.'));
          }
        }
      }, 7000);

      client.on('connect', () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve(client);
        }
      });

      client.on('error', (err) => {
        console.warn(`[Multiplayer] Broker error on ${brokerUrl}:`, err);
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          try { client.end(true); } catch {}
          if (brokerIndex + 1 < BROKERS.length) {
            this.connectBroker(brokerIndex + 1).then(resolve).catch(reject);
          } else {
            reject(err);
          }
        }
      });
    });
  }

  // ======================================================================
  //  CREATE ROOM (HOST)
  // ======================================================================
  public async createRoom(
    hostName: string,
    settings: MultiplayerSettings = { duration: 30, colorCount: 6 }
  ): Promise<string> {
    this.destroy();
    this.isHost = true;
    this.myName = hostName.trim() || 'Host';

    const roomCode = MultiplayerManager.generateRoomCode();
    this.currentRoomCode = roomCode;

    try {
      this.client = await this.connectBroker();
      const hostId = `h_${Math.random().toString(16).substring(2, 8)}`;
      this.myId = hostId;

      const hostPlayer: MultiplayerPlayer = {
        id: hostId,
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
        hostId,
        settings,
        status: 'LOBBY',
        players: { [hostId]: hostPlayer },
        questions: [],
        countdownStartMs: 0,
        gameStartMs: 0
      };

      // Subscribe to host inbox and room broadcast
      const allTopic = `cchaos/v1/${roomCode}/all`;
      const hostTopic = `cchaos/v1/${roomCode}/host`;

      await new Promise<void>((resolveSub) => {
        this.client!.subscribe([allTopic, hostTopic], { qos: 1 }, () => resolveSub());
      });

      this.client.on('message', (topic, payload) => {
        try {
          const msg = JSON.parse(payload.toString()) as PeerMessage & { senderId?: string };
          this.handleHostIncoming(topic, msg);
        } catch {
          // ignore corrupted packet
        }
      });

      // Start host keepalive broadcast every 4s
      this.heartbeatTimer = setInterval(() => {
        if (this.client?.connected && this.roomState) {
          this.client.publish(
            `cchaos/v1/${roomCode}/all`,
            JSON.stringify({ type: 'PING', hostId }),
            { qos: 0 }
          );
        }
      }, 4000);

      if (this.onStateUpdate && this.roomState) {
        this.onStateUpdate(this.roomState);
      }

      return roomCode;
    } catch (err: unknown) {
      this.destroy();
      const msg = (err as Error).message || 'Failed to create room. Please try again.';
      if (this.onError) this.onError(msg);
      throw new Error(msg);
    }
  }

  // ======================================================================
  //  JOIN ROOM (GUEST)
  // ======================================================================
  public async joinRoom(roomCode: string, playerName: string): Promise<RoomState> {
    this.destroy();
    this.isHost = false;
    this.myName = playerName.trim() || 'Player';
    const formattedCode = roomCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    this.currentRoomCode = formattedCode;

    try {
      this.client = await this.connectBroker();
      const guestId = `g_${Math.random().toString(16).substring(2, 8)}`;
      this.myId = guestId;

      const allTopic = `cchaos/v1/${formattedCode}/all`;
      const playerTopic = `cchaos/v1/${formattedCode}/player/${guestId}`;

      // Subscribe to room broadcast and guest personal channel
      await new Promise<void>((resolveSub) => {
        this.client!.subscribe([allTopic, playerTopic], { qos: 1 }, () => resolveSub());
      });

      return new Promise<RoomState>((resolve, reject) => {
        let settled = false;

        // Up to 12s timeout with auto-re-pinging every 1.5s
        let pingInterval: ReturnType<typeof setInterval> | null = null;
        const timeout = setTimeout(() => {
          if (!settled) {
            settled = true;
            if (pingInterval) clearInterval(pingInterval);
            this.destroy();
            const err = new Error(`Room "${formattedCode}" not found or host is offline. Make sure the host has the room open.`);
            if (this.onError) this.onError(err.message);
            reject(err);
          }
        }, 12000);

        this.client!.on('message', (_topic, payload) => {
          try {
            const msg = JSON.parse(payload.toString()) as PeerMessage;
            if (msg.type === 'JOIN_ACCEPTED') {
              if (!settled) {
                settled = true;
                clearTimeout(timeout);
                if (pingInterval) clearInterval(pingInterval);
                this.roomState = msg.roomState;
                if (this.onStateUpdate) this.onStateUpdate(this.roomState);
                resolve(msg.roomState);
              }
            } else if (msg.type === 'JOIN_REJECTED') {
              if (!settled) {
                settled = true;
                clearTimeout(timeout);
                if (pingInterval) clearInterval(pingInterval);
                this.destroy();
                const err = new Error(msg.reason);
                if (this.onError) this.onError(msg.reason);
                reject(err);
              }
            } else {
              this.handleGuestIncoming(msg);
            }
          } catch {
            // ignore
          }
        });

        // Send JOIN_REQUEST immediately and repeat every 1.5s until accepted
        const sendJoinReq = () => {
          if (settled || !this.client?.connected) return;
          const req = {
            type: 'JOIN_REQUEST',
            playerId: guestId,
            name: this.myName
          };
          this.client.publish(
            `cchaos/v1/${formattedCode}/host`,
            JSON.stringify(req),
            { qos: 1 }
          );
        };

        sendJoinReq();
        pingInterval = setInterval(sendJoinReq, 1500);
      });
    } catch (err: unknown) {
      this.destroy();
      const msg = (err as Error).message || `Could not join room "${formattedCode}".`;
      if (this.onError) this.onError(msg);
      throw new Error(msg);
    }
  }

  // ======================================================================
  //  HOST MESSAGE ROUTER
  // ======================================================================
  private handleHostIncoming(topic: string, msg: PeerMessage & { playerId?: string; name?: string }) {
    if (!this.roomState || !this.client?.connected) return;

    if (msg.type === 'START_COUNTDOWN') {
      // Received broadcast echo from broker — trigger Host countdown in exact sync with Guest
      if (this.pendingHostCountdownTrigger) {
        this.pendingHostCountdownTrigger();
        this.pendingHostCountdownTrigger = null;
      }
      return;
    }

    if (msg.type === 'JOIN_REQUEST' && topic.endsWith('/host')) {
      const currentPlayers = Object.keys(this.roomState.players);
      const guestId = msg.playerId || `g_${Date.now()}`;
      const guestName = msg.name || 'Friend';

      // Check max capacity
      if (currentPlayers.length >= 5 && !this.roomState.players[guestId]) {
        this.client.publish(
          `cchaos/v1/${this.currentRoomCode}/player/${guestId}`,
          JSON.stringify({ type: 'JOIN_REJECTED', reason: 'Room is full (max 5 players).' }),
          { qos: 1 }
        );
        return;
      }

      // Check game state
      if (this.roomState.status !== 'LOBBY' && !this.roomState.players[guestId]) {
        this.client.publish(
          `cchaos/v1/${this.currentRoomCode}/player/${guestId}`,
          JSON.stringify({ type: 'JOIN_REJECTED', reason: 'A match is already in progress. Wait for rematch.' }),
          { qos: 1 }
        );
        return;
      }

      // Add or update player
      const isNew = !this.roomState.players[guestId];
      if (isNew) {
        this.roomState.players[guestId] = {
          id: guestId,
          name: guestName,
          isHost: false,
          isReady: true,
          score: 0,
          streak: 0,
          longestStreak: 0,
          correctAnswers: 0,
          wrongAnswers: 0,
          hasFinished: false
        };

        if (this.onPlayerNotification) {
          this.onPlayerNotification(`👋 ${guestName} joined the room!`);
        }
      }

      // Direct response to accepting player
      this.client.publish(
        `cchaos/v1/${this.currentRoomCode}/player/${guestId}`,
        JSON.stringify({
          type: 'JOIN_ACCEPTED',
          roomState: this.roomState,
          yourId: guestId
        }),
        { qos: 1 }
      );

      // Broadcast update to all
      this.broadcastRoomUpdate();
    } else if (msg.type === 'SCORE_UPDATE') {
      const p = this.roomState.players[msg.playerId];
      if (p) {
        p.score = msg.score;
        p.streak = msg.streak;
        if (msg.streak > p.longestStreak) p.longestStreak = msg.streak;
        if (msg.correct) p.correctAnswers += 1;
        else p.wrongAnswers += 1;

        // Broadcast to everyone
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
      this.handlePlayerLeft(msg.playerId);
    }
  }

  // ======================================================================
  //  GUEST MESSAGE ROUTER
  // ======================================================================
  private handleGuestIncoming(msg: PeerMessage) {
    if (msg.type === 'ROOM_UPDATE') {
      this.roomState = msg.roomState;
      if (this.onStateUpdate) this.onStateUpdate(this.roomState);
    } else if (msg.type === 'START_COUNTDOWN') {
      if (this.roomState) {
        this.roomState.status = 'COUNTDOWN';
        // Generate synchronized questions from seed or use questions array
        if (msg.seed) {
          const colors = getColorsForMultiplayer(this.roomState.settings.colorCount);
          this.roomState.questions = generateMultiplayerQuestionSequence(colors, msg.seed, 120);
        } else if (msg.questions) {
          this.roomState.questions = msg.questions;
        }

        const now = Date.now();
        this.roomState.countdownStartMs = now;
        this.roomState.gameStartMs = now + 3000;

        if (this.onStateUpdate) this.onStateUpdate(this.roomState);
      }
      if (this.onCountdown) {
        this.onCountdown(Date.now(), Date.now() + 3000);
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
      if (this.onDisconnected) {
        this.onDisconnected('The Host has left or closed the room.');
      }
    }
  }

  // Handle player leaving
  private handlePlayerLeft(playerId: string) {
    if (!this.roomState) return;
    const leaving = this.roomState.players[playerId];
    if (leaving) {
      delete this.roomState.players[playerId];
      if (this.onPlayerNotification) {
        this.onPlayerNotification(`⚠️ ${leaving.name} left the room.`);
      }

      if (this.roomState.status === 'COUNTDOWN' || this.roomState.status === 'PLAYING') {
        const remaining = Object.values(this.roomState.players);
        if (remaining.length > 0 && remaining.every((p) => p.hasFinished)) {
          this.roomState.status = 'RESULTS';
        }
      }

      this.broadcastRoomUpdate();
    }
  }

  // ======================================================================
  //  MATCH ACTIONS
  // ======================================================================
  public updateSettings(newSettings: MultiplayerSettings) {
    if (!this.isHost || !this.roomState) return;
    this.roomState.settings = newSettings;
    this.broadcastRoomUpdate();
  }

  public startMatch() {
    if (!this.isHost || !this.roomState || !this.client?.connected) return;

    const playerCount = Object.keys(this.roomState.players).length;
    if (playerCount < 2) {
      if (this.onError) this.onError('Need at least 2 players! Share the room code with a friend.');
      return;
    }

    // Reset player states
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
    const countdownStartMs = now;
    const gameStartMs = now + 3200;

    this.roomState.status = 'COUNTDOWN';
    this.roomState.questions = questions;
    this.roomState.countdownStartMs = countdownStartMs;
    this.roomState.gameStartMs = gameStartMs;

    const startMsg: PeerMessage = {
      type: 'START_COUNTDOWN',
      countdownStartMs,
      gameStartMs,
      seed,
      questions
    };

    let hostStarted = false;
    const triggerHost = () => {
      if (hostStarted) return;
      hostStarted = true;
      if (this.onStateUpdate && this.roomState) this.onStateUpdate(this.roomState);
      if (this.onCountdown) this.onCountdown(countdownStartMs, gameStartMs);
    };

    // Store trigger so handleHostIncoming executes it when the broker broadcasts the packet back
    this.pendingHostCountdownTrigger = triggerHost;

    // Publish to all subscribers in the room
    this.client.publish(
      `cchaos/v1/${this.currentRoomCode}/all`,
      JSON.stringify(startMsg),
      { qos: 1 }
    );

    // Fallback: If broker does not loop back to host within 200ms, start anyway
    setTimeout(() => {
      triggerHost();
    }, 200);

    setTimeout(() => {
      if (this.roomState && this.roomState.status === 'COUNTDOWN') {
        this.roomState.status = 'PLAYING';
      }
    }, 3700);
  }

  public sendScoreUpdate(score: number, streak: number, isCorrect: boolean) {
    if (!this.roomState || !this.client?.connected) return;

    if (this.isHost) {
      const p = this.roomState.players[this.myId];
      if (p) {
        p.score = score;
        p.streak = streak;
        if (streak > p.longestStreak) p.longestStreak = streak;
        if (isCorrect) p.correctAnswers += 1;
        else p.wrongAnswers += 1;
        this.broadcastRoomUpdate();
      }
    } else {
      const updateMsg = {
        type: 'SCORE_UPDATE',
        playerId: this.myId,
        score,
        streak,
        correct: isCorrect
      };
      this.client.publish(
        `cchaos/v1/${this.currentRoomCode}/host`,
        JSON.stringify(updateMsg),
        { qos: 1 }
      );
    }
  }

  public sendFinish(finalScore: number, longestStreak: number, correctCount: number, wrongCount: number) {
    if (!this.roomState || !this.client?.connected) return;

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
    } else {
      const finishMsg = {
        type: 'PLAYER_FINISHED',
        playerId: this.myId,
        finalScore,
        longestStreak,
        correctCount,
        wrongCount
      };
      this.client.publish(
        `cchaos/v1/${this.currentRoomCode}/host`,
        JSON.stringify(finishMsg),
        { qos: 1 }
      );
    }
  }

  public triggerRematch() {
    if (!this.isHost || !this.roomState || !this.client?.connected) return;

    this.roomState.status = 'LOBBY';
    Object.values(this.roomState.players).forEach((p) => {
      p.score = 0;
      p.streak = 0;
      p.longestStreak = 0;
      p.correctAnswers = 0;
      p.wrongAnswers = 0;
      p.hasFinished = false;
    });

    this.client.publish(
      `cchaos/v1/${this.currentRoomCode}/all`,
      JSON.stringify({ type: 'REMATCH' }),
      { qos: 1 }
    );
    this.broadcastRoomUpdate();
  }

  public leaveRoom() {
    if (this.client?.connected && this.currentRoomCode) {
      if (this.isHost) {
        this.client.publish(
          `cchaos/v1/${this.currentRoomCode}/all`,
          JSON.stringify({ type: 'HOST_CLOSED', reason: 'The Host has left the room.' }),
          { qos: 1 }
        );
      } else {
        this.client.publish(
          `cchaos/v1/${this.currentRoomCode}/host`,
          JSON.stringify({ type: 'PLAYER_LEFT', playerId: this.myId }),
          { qos: 1 }
        );
      }
    }
    setTimeout(() => this.destroy(), 100);
  }

  private broadcastRoomUpdate() {
    if (!this.roomState || !this.client?.connected) return;
    this.client.publish(
      `cchaos/v1/${this.currentRoomCode}/all`,
      JSON.stringify({ type: 'ROOM_UPDATE', roomState: this.roomState }),
      { qos: 1 }
    );
    if (this.onStateUpdate) {
      this.onStateUpdate(this.roomState);
    }
  }

  public destroy() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.client) {
      try {
        this.client.removeAllListeners();
        this.client.end(true);
      } catch {}
      this.client = null;
    }
    this.roomState = null;
    this.isHost = false;
    this.currentRoomCode = '';
  }
}
