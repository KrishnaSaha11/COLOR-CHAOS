import { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { GameState } from './types/game';
import { HomeScreen } from './components/HomeScreen';
import { GameplayScreen } from './components/GameplayScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { playGameOver, playTap } from './utils/sound';

const STORAGE_KEY_BEST = 'color_chaos_best_score';
const STORAGE_KEY_STREAK = 'color_chaos_longest_streak';

export function App() {
  const [gameState, setGameState] = useState<GameState>('HOME');
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(0);
  const [longestStreak, setLongestStreak] = useState<number>(0);
  const [isNewBest, setIsNewBest] = useState<boolean>(false);

  // Load high scores from localStorage
  useEffect(() => {
    try {
      const savedBest = localStorage.getItem(STORAGE_KEY_BEST);
      if (savedBest) {
        setBestScore(parseInt(savedBest, 10) || 0);
      }
      const savedStreak = localStorage.getItem(STORAGE_KEY_STREAK);
      if (savedStreak) {
        setLongestStreak(parseInt(savedStreak, 10) || 0);
      }
    } catch {
      // Local storage disabled or restricted
    }
  }, []);

  const triggerConfetti = () => {
    try {
      // Celebratory neon particle blast
      const count = 200;
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
      // canvas-confetti fallback
    }
  };

  const handleStartGame = () => {
    playTap();
    setIsNewBest(false);
    setCurrentScore(0);
    setCurrentStreak(0);
    setGameState('PLAYING');
  };

  const handleGameOver = useCallback((finalScore: number, roundLongestStreak: number) => {
    setCurrentScore(finalScore);
    setCurrentStreak(roundLongestStreak);

    let achievedNewBest = false;
    if (finalScore > bestScore && finalScore > 0) {
      achievedNewBest = true;
      setBestScore(finalScore);
      try {
        localStorage.setItem(STORAGE_KEY_BEST, String(finalScore));
      } catch {
        // ignore
      }
    }
    setIsNewBest(achievedNewBest);

    if (roundLongestStreak > longestStreak) {
      setLongestStreak(roundLongestStreak);
      try {
        localStorage.setItem(STORAGE_KEY_STREAK, String(roundLongestStreak));
      } catch {
        // ignore
      }
    }

    playGameOver(achievedNewBest);
    if (achievedNewBest) {
      triggerConfetti();
    }

    setGameState('GAMEOVER');
  }, [bestScore, longestStreak]);

  const handlePlayAgain = () => {
    handleStartGame();
  };

  const handleGoHome = () => {
    setGameState('HOME');
  };

  return (
    <>
      <div className="neon-backdrop" />
      <main className="app-container">
        {gameState === 'HOME' && (
          <HomeScreen
            bestScore={bestScore}
            longestStreak={longestStreak}
            onStartGame={handleStartGame}
          />
        )}

        {gameState === 'PLAYING' && (
          <GameplayScreen
            onGameOver={handleGameOver}
          />
        )}

        {gameState === 'GAMEOVER' && (
          <GameOverScreen
            finalScore={currentScore}
            bestScore={bestScore}
            longestStreak={currentStreak}
            isNewBest={isNewBest}
            onPlayAgain={handlePlayAgain}
            onGoHome={handleGoHome}
          />
        )}
      </main>
    </>
  );
}

export default App;
