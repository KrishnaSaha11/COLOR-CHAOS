import { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { GameState, GameMode, UserProgress } from './types/game';
import { HomeScreen } from './components/HomeScreen';
import { GameplayScreen } from './components/GameplayScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { LevelSelectScreen } from './components/LevelSelectScreen';
import { AboutSection } from './components/AboutSection';
import { MultiplayerLobby } from './components/MultiplayerLobby';
import { MultiplayerGameplay } from './components/MultiplayerGameplay';
import { MultiplayerResults } from './components/MultiplayerResults';
import { MultiplayerManager } from './utils/multiplayerPeer';
import { RoomState } from './types/multiplayer';
import { loadUserProgress, saveUserProgress } from './utils/storage';
import { getLevelConfig, getColorsForLevel } from './utils/levels';
import { getDailyChallengeConfig, computeDailyStreak, getTodayDateString } from './utils/daily';
import { playGameOver, playTap } from './utils/sound';

export function App() {
  const [gameState, setGameState] = useState<GameState>('HOME');
  const [gameMode, setGameMode] = useState<GameMode>('LEVEL');
  const [activeLevel, setActiveLevel] = useState<number>(1);
  const [progress, setProgress] = useState<UserProgress>(loadUserProgress);

  // Result state
  const [lastScore, setLastScore] = useState<number>(0);
  const [lastLongestStreak, setLastLongestStreak] = useState<number>(0);
  const [lastPassedTarget, setLastPassedTarget] = useState<boolean>(false);
  const [lastIsNewBest, setLastIsNewBest] = useState<boolean>(false);

  // Multiplayer Peer State
  const [multiplayerManager] = useState<MultiplayerManager>(() => new MultiplayerManager());
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [initialJoinCode, setInitialJoinCode] = useState<string>('');
  const [multiplayerNotice, setMultiplayerNotice] = useState<string | null>(null);
  const [disconnectNotice, setDisconnectNotice] = useState<string | null>(null);

  // Check URL query parameters for invite links (?room=CODE)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      if (roomParam) {
        setInitialJoinCode(roomParam.toUpperCase());
        setGameState('MULTIPLAYER_LOBBY');
      }
    }
  }, []);

  // Listen to multiplayer peer events
  useEffect(() => {
    multiplayerManager.onStateUpdate = (state) => {
      setRoomState({ ...state });

      // ★ Only change gameState when the STATUS actually warrants a screen transition.
      //   During COUNTDOWN/PLAYING, the gameplay component is already mounted.
      //   We must NOT call setGameState redundantly for every score broadcast,
      //   because it can cause subtle re-render timing issues.
      if (state.status === 'LOBBY') {
        setGameState((prev) => {
          // Only switch to lobby if we're not in a solo game
          if (prev === 'MULTIPLAYER_LOBBY' || prev === 'MULTIPLAYER_PLAYING' || prev === 'MULTIPLAYER_RESULTS') {
            return 'MULTIPLAYER_LOBBY';
          }
          // First time joining → go to lobby
          if (prev === 'HOME') return 'MULTIPLAYER_LOBBY';
          return prev;
        });
      } else if (state.status === 'COUNTDOWN' || state.status === 'PLAYING') {
        setGameState((prev) => {
          // Only transition TO gameplay if not already there
          if (prev !== 'MULTIPLAYER_PLAYING') return 'MULTIPLAYER_PLAYING';
          return prev;
        });
      } else if (state.status === 'RESULTS') {
        setGameState('MULTIPLAYER_RESULTS');
      }
    };

    multiplayerManager.onCountdown = () => {
      setGameState('MULTIPLAYER_PLAYING');
    };

    multiplayerManager.onDisconnected = (reason?: string) => {
      setRoomState(null);
      setGameState('HOME');
      if (reason) {
        setDisconnectNotice(reason);
      }
    };

    multiplayerManager.onPlayerNotification = (msg: string) => {
      setMultiplayerNotice(msg);
      setTimeout(() => {
        setMultiplayerNotice((prev) => (prev === msg ? null : prev));
      }, 4000);
    };

    multiplayerManager.onError = (errMsg: string) => {
      setDisconnectNotice(errMsg);
    };

    return () => {
      multiplayerManager.destroy();
    };
  }, [multiplayerManager]);

  // Sync progress state changes with storage
  useEffect(() => {
    saveUserProgress(progress);
  }, [progress]);

  // Global Keyboard Navigation: Escape key returns to Home from modals/screens
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (gameState !== 'PLAYING' && gameState !== 'MULTIPLAYER_PLAYING') {
          if (roomState) {
            multiplayerManager.destroy();
            setRoomState(null);
          }
          setGameState('HOME');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, roomState, multiplayerManager]);

  const triggerConfetti = () => {
    try {
      const count = 220;
      const defaults = {
        origin: { y: 0.7 },
        colors: ['#00E5FF', '#B026FF', '#00FF88', '#FFE600', '#FF3366', '#FF7700']
      };

      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio)
        });
      };

      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    } catch {
      // confetti fallback
    }
  };

  const handleStartLevel = (lvl: number) => {
    playTap();
    setActiveLevel(lvl);
    setGameMode('LEVEL');
    setGameState('PLAYING');
  };

  const handleStartDaily = () => {
    playTap();
    setActiveLevel(0);
    setGameMode('DAILY');
    setGameState('PLAYING');
  };

  const handleGameOver = useCallback((finalScore: number, longestStreak: number, passedTarget: boolean) => {
    setLastScore(finalScore);
    setLastLongestStreak(longestStreak);
    setLastPassedTarget(passedTarget);

    setProgress((prev) => {
      let isNewAllTimeBest = false;
      const newOverallBest = Math.max(prev.overallPersonalBest, finalScore);
      if (finalScore > prev.overallPersonalBest && finalScore > 0) {
        isNewAllTimeBest = true;
      }
      setLastIsNewBest(isNewAllTimeBest);

      if (gameMode === 'DAILY') {
        const todayStr = getTodayDateString();
        const { newStreak } = computeDailyStreak(
          prev.lastDailyChallengeDate,
          prev.currentDailyStreak,
          todayStr
        );
        const newDailyBest = Math.max(prev.dailyChallengeBestScore, finalScore);
        const longestDaily = Math.max(prev.longestDailyStreak, newStreak);

        return {
          ...prev,
          totalGamesPlayed: prev.totalGamesPlayed + 1,
          overallPersonalBest: newOverallBest,
          dailyChallengeBestScore: newDailyBest,
          currentDailyStreak: newStreak,
          longestDailyStreak: longestDaily,
          lastDailyChallengeDate: todayStr
        };
      } else {
        // Level Campaign mode
        const lvl = activeLevel;
        const currentLevelBest = Math.max(prev.levelBestScores[lvl] || 0, finalScore);
        const nextCompleted = passedTarget && !prev.completedLevels.includes(lvl)
          ? [...prev.completedLevels, lvl]
          : prev.completedLevels;

        let nextHighestUnlocked = prev.highestLevelUnlocked;
        if (passedTarget && lvl === prev.highestLevelUnlocked && lvl < 50) {
          nextHighestUnlocked = lvl + 1;
        }

        return {
          ...prev,
          totalGamesPlayed: prev.totalGamesPlayed + 1,
          overallPersonalBest: newOverallBest,
          highestLevelUnlocked: nextHighestUnlocked,
          completedLevels: nextCompleted,
          levelBestScores: {
            ...prev.levelBestScores,
            [lvl]: currentLevelBest
          }
        };
      }
    });

    playGameOver(passedTarget);
    if (passedTarget) {
      triggerConfetti();
    }

    setGameState('RESULTS');
  }, [activeLevel, gameMode]);

  const handlePlayNextLevel = () => {
    if (activeLevel < 50) {
      handleStartLevel(activeLevel + 1);
    }
  };

  const handleRetryLevel = () => {
    if (gameMode === 'DAILY') {
      handleStartDaily();
    } else {
      handleStartLevel(activeLevel);
    }
  };

  const handleQuitGame = () => {
    setGameState('HOME');
  };

  const handleMultiplayerGameOver = useCallback(() => {
    setGameState('MULTIPLAYER_RESULTS');
  }, []);

  const handleMultiplayerQuit = useCallback(() => {
    multiplayerManager.leaveRoom();
    setRoomState(null);
    setGameState('HOME');
  }, [multiplayerManager]);

  // Determine current config and colors for solo GameplayScreen
  let currentLevelConfig;
  let currentColors;
  if (gameMode === 'DAILY') {
    const daily = getDailyChallengeConfig();
    currentLevelConfig = daily.config;
    currentColors = daily.colors;
  } else {
    currentLevelConfig = getLevelConfig(activeLevel);
    currentColors = getColorsForLevel(activeLevel);
  }

  return (
    <>
      <div className="neon-backdrop" />

      {/* Floating Multiplayer Notification Toast */}
      {multiplayerNotice && (
        <div style={{
          position: 'fixed',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          background: 'rgba(20, 20, 36, 0.95)',
          border: '1px solid #FFE600',
          color: '#FFE600',
          padding: '8px 18px',
          borderRadius: '999px',
          boxShadow: '0 0 20px rgba(255, 230, 0, 0.4)',
          fontWeight: 800,
          fontSize: '0.86rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          pointerEvents: 'none'
        }}>
          <span>{multiplayerNotice}</span>
        </div>
      )}

      {/* Disconnect Alert Modal */}
      {disconnectNotice && (
        <div className="quit-modal-overlay" onClick={() => setDisconnectNotice(null)}>
          <div className="quit-modal" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>📡</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#FFFFFF', marginBottom: '8px' }}>
              Multiplayer Notice
            </div>
            <p style={{ fontSize: '0.88rem', color: '#8C94B2', marginBottom: '18px' }}>
              {disconnectNotice}
            </p>
            <button
              onClick={() => setDisconnectNotice(null)}
              className="btn-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              OKAY
            </button>
          </div>
        </div>
      )}

      <main className="app-container">
        {gameState === 'HOME' && (
          <HomeScreen
            progress={progress}
            onStartLevel={handleStartLevel}
            onStartDaily={handleStartDaily}
            onOpenLevelSelect={() => setGameState('LEVEL_SELECT')}
            onOpenAbout={() => setGameState('ABOUT')}
            onOpenMultiplayer={() => setGameState('MULTIPLAYER_LOBBY')}
          />
        )}

        {gameState === 'ABOUT' && (
          <AboutSection
            onPlayNow={() => handleStartLevel(progress.highestLevelUnlocked)}
            onOpenLevelSelect={() => setGameState('LEVEL_SELECT')}
            onStartDaily={handleStartDaily}
            onBackToHome={() => setGameState('HOME')}
          />
        )}

        {gameState === 'LEVEL_SELECT' && (
          <LevelSelectScreen
            progress={progress}
            currentSelectedLevel={activeLevel}
            onSelectLevel={(lvl) => handleStartLevel(lvl)}
            onBack={() => setGameState('HOME')}
          />
        )}

        {gameState === 'PLAYING' && (
          <GameplayScreen
            level={activeLevel}
            levelConfig={currentLevelConfig}
            availableColors={currentColors}
            isDaily={gameMode === 'DAILY'}
            onGameOver={handleGameOver}
            onQuit={handleQuitGame}
          />
        )}

        {gameState === 'RESULTS' && (
          <ResultsScreen
            finalScore={lastScore}
            targetScore={currentLevelConfig.targetScore}
            level={activeLevel}
            isDaily={gameMode === 'DAILY'}
            passedTarget={lastPassedTarget}
            isNewBest={lastIsNewBest}
            personalBest={progress.overallPersonalBest}
            levelBest={gameMode === 'DAILY' ? progress.dailyChallengeBestScore : (progress.levelBestScores[activeLevel] || 0)}
            highestLevelUnlocked={progress.highestLevelUnlocked}
            currentDailyStreak={progress.currentDailyStreak}
            longestStreak={lastLongestStreak}
            onPlayNextLevel={handlePlayNextLevel}
            onRetryLevel={handleRetryLevel}
            onGoLevelSelect={() => setGameState('LEVEL_SELECT')}
            onGoHome={() => setGameState('HOME')}
          />
        )}

        {/* MULTIPLAYER FLOW */}
        {gameState === 'MULTIPLAYER_LOBBY' && (
          <MultiplayerLobby
            manager={multiplayerManager}
            roomState={roomState}
            initialRoomCode={initialJoinCode}
            onStartMatch={() => multiplayerManager.startMatch()}
            onLeave={handleMultiplayerQuit}
          />
        )}

        {gameState === 'MULTIPLAYER_PLAYING' && roomState && (
          <MultiplayerGameplay
            manager={multiplayerManager}
            roomState={roomState}
            onGameOver={handleMultiplayerGameOver}
            onQuit={handleMultiplayerQuit}
          />
        )}

        {gameState === 'MULTIPLAYER_RESULTS' && roomState && (
          <MultiplayerResults
            manager={multiplayerManager}
            roomState={roomState}
            onRematch={() => multiplayerManager.triggerRematch()}
            onLeave={handleMultiplayerQuit}
          />
        )}
      </main>
    </>
  );
}

export default App;
