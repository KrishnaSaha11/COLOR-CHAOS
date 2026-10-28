import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Flame, Zap } from 'lucide-react';
import { ColorName, Question, FloatingNotification } from '../types/game';
import { COLORS, COLOR_LIST, generateQuestion } from '../utils/colors';
import { playCorrect, playWrong, playStreakBonus, playTick, isSoundEnabled, toggleSound } from '../utils/sound';

interface GameplayScreenProps {
  onGameOver: (finalScore: number, longestStreak: number) => void;
}

const TOTAL_TIME = 30; // 30 seconds round

export const GameplayScreen: React.FC<GameplayScreenProps> = ({ onGameOver }) => {
  const [timeLeft, setTimeLeft] = useState<number>(TOTAL_TIME);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [longestStreak, setLongestStreak] = useState<number>(0);
  const [question, setQuestion] = useState<Question>(() => generateQuestion());
  const [isWrong, setIsWrong] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<FloatingNotification[]>([]);
  const [soundOn, setSoundOn] = useState<boolean>(isSoundEnabled());

  // Refs for tracking accurate values in timer intervals without stale closures
  const isGameOverRef = useRef<boolean>(false);
  const timeLeftRef = useRef<number>(TOTAL_TIME);
  const scoreRef = useRef<number>(0);
  const streakRef = useRef<number>(0);
  const longestStreakRef = useRef<number>(0);
  const questionRef = useRef<Question>(question);
  const lastTickedSecondRef = useRef<number>(TOTAL_TIME);

  // Sync refs
  useEffect(() => {
    questionRef.current = question;
  }, [question]);

  // Handle game end safely once
  const triggerGameOver = useCallback(() => {
    if (isGameOverRef.current) return;
    isGameOverRef.current = true;
    onGameOver(scoreRef.current, longestStreakRef.current);
  }, [onGameOver]);

  // Main high-precision countdown loop
  useEffect(() => {
    const startTime = performance.now();
    let penaltySeconds = 0;

    const intervalId = setInterval(() => {
      if (isGameOverRef.current) {
        clearInterval(intervalId);
        return;
      }

      const elapsed = (performance.now() - startTime) / 1000;
      const calculatedRemaining = Math.max(0, TOTAL_TIME - elapsed - penaltySeconds);
      
      timeLeftRef.current = calculatedRemaining;
      setTimeLeft(calculatedRemaining);

      // Sound tick for the last 5 seconds
      const ceilSec = Math.ceil(calculatedRemaining);
      if (ceilSec <= 5 && ceilSec > 0 && ceilSec !== lastTickedSecondRef.current) {
        lastTickedSecondRef.current = ceilSec;
        playTick();
      }

      if (calculatedRemaining <= 0) {
        clearInterval(intervalId);
        triggerGameOver();
      }
    }, 50);

    // Save penalty applier to window / ref
    (window as unknown as { applyPenalty: (penalty: number) => void }).applyPenalty = (penalty: number) => {
      penaltySeconds += penalty;
      const newRemaining = Math.max(0, TOTAL_TIME - ((performance.now() - startTime) / 1000) - penaltySeconds);
      timeLeftRef.current = newRemaining;
      setTimeLeft(newRemaining);
      if (newRemaining <= 0) {
        clearInterval(intervalId);
        triggerGameOver();
      }
    };

    return () => {
      clearInterval(intervalId);
      delete (window as unknown as { applyPenalty?: unknown }).applyPenalty;
    };
  }, [triggerGameOver]);

  const addNotification = (text: string, type: 'correct' | 'wrong' | 'bonus') => {
    const id = `${Date.now()}-${Math.random()}`;
    const x = Math.random() * 40 - 20; // slight random offset
    const y = Math.random() * 10 - 5;
    setNotifications((prev) => [...prev, { id, text, type, x, y }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 650);
  };

  const handleColorChoice = (selectedColor: ColorName) => {
    if (isGameOverRef.current || timeLeftRef.current <= 0) return;

    const currentQ = questionRef.current;
    const isCorrect = selectedColor === currentQ.textColor;

    if (isCorrect) {
      // Haptic feedback
      if ('vibrate' in navigator) {
        try { navigator.vibrate(12); } catch { /* ignore */ }
      }

      const nextStreak = streakRef.current + 1;
      streakRef.current = nextStreak;
      setStreak(nextStreak);

      if (nextStreak > longestStreakRef.current) {
        longestStreakRef.current = nextStreak;
        setLongestStreak(nextStreak);
      }

      // Check if 5-streak milestone bonus applies
      let earnedPoints = 10;
      if (nextStreak % 5 === 0) {
        const bonus = 50;
        earnedPoints += bonus;
        playStreakBonus();
        addNotification(`🔥 ${nextStreak}X BONUS! +${bonus}`, 'bonus');
      } else {
        playCorrect(nextStreak);
        addNotification('+10', 'correct');
      }

      scoreRef.current += earnedPoints;
      setScore(scoreRef.current);

      // Generate next question
      setQuestion(generateQuestion(currentQ));
    } else {
      // Wrong answer!
      if ('vibrate' in navigator) {
        try { navigator.vibrate([30, 40, 30]); } catch { /* ignore */ }
      }

      playWrong();
      setIsWrong(true);
      setTimeout(() => setIsWrong(false), 380);

      // Reset streak
      streakRef.current = 0;
      setStreak(0);

      // Deduct 2 seconds
      const applyPenalty = (window as unknown as { applyPenalty?: (p: number) => void }).applyPenalty;
      if (applyPenalty) {
        applyPenalty(2);
      }

      addNotification('-2s', 'wrong');

      // Next question so player isn't stuck on a wrong answer
      setQuestion(generateQuestion(currentQ));
    }
  };

  const handleToggleSound = () => {
    const next = toggleSound();
    setSoundOn(next);
  };

  // Timer color dynamics
  const timerRatio = Math.max(0, Math.min(1, timeLeft / TOTAL_TIME));
  let timerBarColor = '#00E5FF';
  if (timeLeft <= 5) {
    timerBarColor = '#FF3366';
  } else if (timeLeft <= 10) {
    timerBarColor = '#FF7700';
  } else if (timeLeft <= 18) {
    timerBarColor = '#FFE600';
  }

  const currentDef = COLORS[question.textColor];

  return (
    <div
      className={`app-gameplay ${isWrong ? 'shake-effect wrong-flash' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        flex: 1,
        width: '100%',
        padding: '12px 6px 16px 6px',
        position: 'relative'
      }}
    >
      {/* HUD Header */}
      <div style={{ width: '100%' }}>
        <div className="hud-card">
          {/* Score */}
          <div>
            <div className="hud-stat-label">SCORE</div>
            <div className="hud-stat-value" style={{ color: '#00E5FF', textShadow: '0 0 10px rgba(0, 229, 255, 0.5)' }}>
              {score}
            </div>
          </div>

          {/* Streak Indicator */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className={`streak-pill ${streak >= 5 ? 'supercharged' : ''}`}>
              <Flame size={14} color={streak >= 5 ? '#00E5FF' : '#FF7700'} />
              <span>{streak}x {streak >= 5 ? 'FIRE' : 'STREAK'}</span>
            </div>
            {longestStreak > 0 && (
              <span style={{ fontSize: '0.68rem', color: '#8C94B2', marginTop: '2px', fontWeight: 600 }}>
                BEST: {longestStreak}x
              </span>
            )}
          </div>

          {/* Sound & Timer Text */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div className="hud-stat-label">TIME</div>
              <div
                className="hud-stat-value"
                style={{
                  color: timerBarColor,
                  textShadow: `0 0 12px ${timerBarColor}`,
                  fontWeight: 900
                }}
              >
                {Math.max(0, timeLeft).toFixed(1)}s
              </div>
            </div>

            <button
              onClick={handleToggleSound}
              aria-label={soundOn ? 'Mute' : 'Unmute'}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '10px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: soundOn ? '#00FF88' : '#8C94B2',
                cursor: 'pointer'
              }}
            >
              {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>
        </div>

        {/* Dynamic Timer Bar */}
        <div className="timer-track">
          <div
            className="timer-fill"
            style={{
              width: `${timerRatio * 100}%`,
              backgroundColor: timerBarColor,
              color: timerBarColor
            }}
          />
        </div>
      </div>

      {/* Central Arena: The Stroop Word & Floating Feedback */}
      <div style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 'auto 0',
        minHeight: '160px',
        width: '100%'
      }}>
        {/* Helper Cue */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.8rem',
          fontWeight: 700,
          color: '#8C94B2',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '10px'
        }}>
          <Zap size={14} color="#00E5FF" />
          <span>TAP THE COLOR OF THE INK</span>
        </div>

        {/* Main Color Word */}
        <div
          key={question.id}
          className="pop-animation"
          style={{
            fontSize: 'clamp(2.8rem, 13vw, 4.4rem)',
            fontWeight: 900,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: currentDef.hex,
            textShadow: `0 0 25px ${currentDef.glow}, 0 0 50px ${currentDef.glow}`,
            userSelect: 'none',
            textAlign: 'center',
            lineHeight: 1
          }}
        >
          {question.word}
        </div>

        {/* Floating Notifications */}
        {notifications.map((n) => (
          <div
            key={n.id}
            className="floating-feedback"
            style={{
              top: '40%',
              left: `calc(50% + ${n.x}px)`,
              transform: `translate(-50%, ${n.y}px)`,
              color: n.type === 'bonus' ? '#FFE600' : n.type === 'correct' ? '#00FF88' : '#FF3366'
            }}
          >
            {n.text}
          </div>
        ))}
      </div>

      {/* 6 Ergonomic Color Tap Buttons */}
      <div className="color-buttons-grid">
        {COLOR_LIST.map((color) => (
          <button
            key={color.id}
            onClick={() => handleColorChoice(color.id)}
            className="color-btn"
            style={{
              ['--btn-color' as string]: color.hex,
              ['--btn-glow' as string]: color.glow
            }}
          >
            <div className="color-indicator-dot" />
            <span>{color.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
