import { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { GameState, GameMode, UserProgress } from './types/game';
import { HomeScreen } from './components/HomeScreen';
import { GameplayScreen } from './components/GameplayScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { LevelSelectScreen } from './components/LevelSelectScreen';
import { AboutSection } from './components/AboutSection';
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

  // Sync progress state changes with storage
  useEffect(() => {
    saveUserProgress(progress);
  }, [progress]);

  // Global Keyboard Navigation: Escape key returns to Home from modals/screens
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setGameState('HOME');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  // Determine current config and colors for GameplayScreen
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
      <main className="app-container">
        {gameState === 'HOME' && (
          <HomeScreen
            progress={progress}
            onStartLevel={handleStartLevel}
            onStartDaily={handleStartDaily}
            onOpenLevelSelect={() => setGameState('LEVEL_SELECT')}
            onOpenAbout={() => setGameState('ABOUT')}
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
      </main>
    </>
  );
}

export default App;
