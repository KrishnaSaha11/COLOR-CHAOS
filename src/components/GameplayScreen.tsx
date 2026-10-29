import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Flame, Zap, Target } from 'lucide-react';
import { ColorDef, Question, FloatingNotification, LevelConfig } from '../types/game';
import { generateQuestion } from '../utils/colors';
import { playCorrect, playWrong, playStreakBonus, playTick, isSoundEnabled, toggleSound } from '../utils/sound';

interface GameplayScreenProps {
  level: number;
  levelConfig: LevelConfig;
  availableColors: ColorDef[];
  isDaily?: boolean;
  onGameOver: (finalScore: number, longestStreak: number, passedTarget: boolean) => void;
}

const TOTAL_TIME = 30; // 30 seconds round

export const GameplayScreen: React.FC<GameplayScreenProps> = ({
  level,
  levelConfig,
  availableColors,
  isDaily = false,
  onGameOver
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(TOTAL_TIME);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [longestStreak, setLongestStreak] = useState<number>(0);
  const [question, setQuestion] = useState<Question>(() => generateQuestion(availableColors));
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
    const finalScore = scoreRef.current;
    const passed = finalScore >= levelConfig.targetScore;
    onGameOver(finalScore, longestStreakRef.current, passed);
  }, [onGameOver, levelConfig.targetScore]);

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

  const handleColorChoice = (selectedColorId: string) => {
    if (isGameOverRef.current || timeLeftRef.current <= 0) return;

    const currentQ = questionRef.current;
    const isCorrect = selectedColorId === currentQ.textColor;

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

      // 5-streak milestone bonus: +50 points
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
      setQuestion(generateQuestion(availableColors, currentQ));
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
      setQuestion(generateQuestion(availableColors, currentQ));
    }
  };

  // Keyboard accessibility: Keys 1 to 9 trigger matching color
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= availableColors.length) {
        handleColorChoice(availableColors[num - 1].id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [availableColors]);

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

  // Find color definition of question's text color
  const currentDef = availableColors.find((c) => c.id === question.textColor) || availableColors[0];

  // Grid styling based on total number of colors
  const colorCount = availableColors.length;
  let gridColumns = 'repeat(2, 1fr)';
  let btnHeight = '64px';
  let btnFontSize = '1.15rem';
  let dotSize = '14px';

  if (colorCount >= 21) {
    gridColumns = 'repeat(5, 1fr)';
    btnHeight = '38px';
    btnFontSize = '0.68rem';
    dotSize = '8px';
  } else if (colorCount >= 13) {
    gridColumns = 'repeat(4, 1fr)';
    btnHeight = '42px';
    btnFontSize = '0.78rem';
    dotSize = '9px';
  } else if (colorCount >= 7) {
    gridColumns = 'repeat(3, 1fr)';
    btnHeight = '48px';
    btnFontSize = '0.92rem';
    dotSize = '11px';
  }

  const reachedGoal = score >= levelConfig.targetScore;

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
        padding: '10px 6px 14px 6px',
        position: 'relative'
      }}
    >
      {/* HUD Header */}
      <div style={{ width: '100%' }}>
        <div className="hud-card" style={{ padding: '10px 14px' }}>
          {/* Level Info & Score */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: isDaily ? '#FF7700' : '#00E5FF',
                textTransform: 'uppercase',
                letterSpacing: '0.06em'
              }}>
                {isDaily ? 'DAILY CHALLENGE' : `LEVEL ${level}`}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span className="hud-stat-value" style={{ color: '#00E5FF', textShadow: '0 0 10px rgba(0, 229, 255, 0.5)' }}>
                {score}
              </span>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: reachedGoal ? '#00FF88' : '#8C94B2',
                fontFamily: 'var(--font-mono)'
              }}>
                / {levelConfig.targetScore}
              </span>
            </div>
          </div>

          {/* Streak Indicator */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className={`streak-pill ${streak >= 5 ? 'supercharged' : ''}`}>
              <Flame size={13} color={streak >= 5 ? '#00E5FF' : '#FF7700'} />
              <span>{streak}x {streak >= 5 ? 'FIRE' : 'STREAK'}</span>
            </div>
            {longestStreak > 0 && (
              <span style={{ fontSize: '0.65rem', color: '#8C94B2', marginTop: '2px', fontWeight: 600 }}>
                BEST: {longestStreak}x
              </span>
            )}
          </div>

          {/* Sound & Timer Text */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                width: '34px',
                height: '34px',
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
        <div className="timer-track" style={{ marginTop: '8px' }}>
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
        minHeight: '130px',
        width: '100%'
      }}>
        {/* Helper Cue with Target Goal */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.78rem',
          fontWeight: 700,
          color: '#8C94B2',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: '8px'
        }}>
          <Zap size={13} color="#00E5FF" />
          <span>TAP COLOR OF INK</span>
          <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>•</span>
          <Target size={12} color={reachedGoal ? '#00FF88' : '#FFE600'} />
          <span style={{ color: reachedGoal ? '#00FF88' : '#FFE600' }}>
            {reachedGoal ? 'GOAL MET!' : `NEED ${levelConfig.targetScore}`}
          </span>
        </div>

        {/* Main Color Word */}
        <div
          key={question.id}
          className="pop-animation"
          style={{
            fontSize: 'clamp(2.5rem, 11vw, 4rem)',
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

      {/* Dynamic Responsive Color Tap Buttons Grid */}
      <div
        className="color-buttons-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: gridColumns,
          gap: colorCount >= 21 ? '6px' : colorCount >= 13 ? '8px' : '10px',
          width: '100%',
          maxHeight: '45vh',
          overflowY: 'auto',
          paddingBottom: '4px'
        }}
      >
        {availableColors.map((color, idx) => (
          <button
            key={color.id}
            onClick={() => handleColorChoice(color.id)}
            className="color-btn"
            aria-label={`Select color ${color.name}${idx < 9 ? ` (Key ${idx + 1})` : ''}`}
            aria-keyshortcuts={idx < 9 ? `${idx + 1}` : undefined}
            style={{
              ['--btn-color' as string]: color.hex,
              ['--btn-glow' as string]: color.glow,
              minHeight: btnHeight,
              height: btnHeight,
              fontSize: btnFontSize,
              gap: colorCount >= 13 ? '5px' : '8px',
              padding: colorCount >= 21 ? '0 4px' : '0 8px',
              borderRadius: colorCount >= 21 ? '10px' : '14px'
            }}
          >
            <div
              className="color-indicator-dot"
              style={{
                width: dotSize,
                height: dotSize
              }}
            />
            <span style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {color.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
