import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Flame, Zap, Target, LogOut } from 'lucide-react';
import { ColorDef, Question, FloatingNotification, LevelConfig } from '../types/game';
import { generateQuestion } from '../utils/colors';
import { playCorrect, playWrong, playStreakBonus, playTick, isSoundEnabled, toggleSound } from '../utils/sound';

interface GameplayScreenProps {
  level: number;
  levelConfig: LevelConfig;
  availableColors: ColorDef[];
  isDaily?: boolean;
  onGameOver: (finalScore: number, longestStreak: number, passedTarget: boolean) => void;
  onQuit: () => void;
}

export const GameplayScreen: React.FC<GameplayScreenProps> = ({
  level,
  levelConfig,
  availableColors,
  isDaily = false,
  onGameOver,
  onQuit
}) => {
  const roundTime = levelConfig.totalTime;
  const penalty = levelConfig.wrongPenalty;

  const [timeLeft, setTimeLeft] = useState<number>(roundTime);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [longestStreak, setLongestStreak] = useState<number>(0);
  const [question, setQuestion] = useState<Question>(() => generateQuestion(availableColors));
  const [isWrong, setIsWrong] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<FloatingNotification[]>([]);
  const [soundOn, setSoundOn] = useState<boolean>(isSoundEnabled());
  const [showQuitModal, setShowQuitModal] = useState<boolean>(false);

  // Refs for tracking accurate values in timer intervals without stale closures
  const isGameOverRef = useRef<boolean>(false);
  const timeLeftRef = useRef<number>(roundTime);
  const scoreRef = useRef<number>(0);
  const streakRef = useRef<number>(0);
  const longestStreakRef = useRef<number>(0);
  const questionRef = useRef<Question>(question);
  const lastTickedSecondRef = useRef<number>(roundTime);

  // Pause tracking refs for quit modal
  const isPausedRef = useRef<boolean>(false);
  const pauseStartRef = useRef<number>(0);
  const totalPausedMsRef = useRef<number>(0);

  // Sync refs
  useEffect(() => {
    questionRef.current = question;
  }, [question]);

  const onGameOverRef = useRef(onGameOver);
  useEffect(() => {
    onGameOverRef.current = onGameOver;
  }, [onGameOver]);

  const roundStartTimeRef = useRef<number | null>(null);
  const penaltySecondsRef = useRef<number>(0);

  // Handle game end safely once
  const triggerGameOver = useCallback(() => {
    if (isGameOverRef.current) return;
    isGameOverRef.current = true;
    const finalScore = scoreRef.current;
    const passed = finalScore >= levelConfig.targetScore;
    if (onGameOverRef.current) {
      onGameOverRef.current(finalScore, longestStreakRef.current, passed);
    }
  }, [levelConfig.targetScore]);

  // Main high-precision countdown loop
  useEffect(() => {
    if (roundStartTimeRef.current === null) {
      roundStartTimeRef.current = performance.now();
    }

    const intervalId = setInterval(() => {
      if (isGameOverRef.current) {
        clearInterval(intervalId);
        return;
      }

      // Skip updates while paused
      if (isPausedRef.current) return;

      const startTime = roundStartTimeRef.current ?? performance.now();
      const elapsed = (performance.now() - startTime - totalPausedMsRef.current) / 1000;
      const calculatedRemaining = Math.max(0, roundTime - elapsed - penaltySecondsRef.current);

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
    (window as unknown as { applyPenalty: (p: number) => void }).applyPenalty = (p: number) => {
      penaltySecondsRef.current += p;
      const startTime = roundStartTimeRef.current ?? performance.now();
      const effectiveElapsed = (performance.now() - startTime - totalPausedMsRef.current) / 1000;
      const newRemaining = Math.max(0, roundTime - effectiveElapsed - penaltySecondsRef.current);
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
  }, [triggerGameOver, roundTime]);

  const addNotification = (text: string, type: 'correct' | 'wrong' | 'bonus') => {
    const id = `${Date.now()}-${Math.random()}`;
    const x = Math.random() * 30 - 15; // slight random horizontal offset
    const y = Math.random() * 8 - 4;
    setNotifications((prev) => [...prev, { id, text, type, x, y }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 850);
  };

  const handleColorChoice = (selectedColorId: string) => {
    if (isGameOverRef.current || timeLeftRef.current <= 0 || isPausedRef.current) return;

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
      // Wrong answer! Trigger full screen red flash & shake
      if ('vibrate' in navigator) {
        try { navigator.vibrate([40, 50, 40]); } catch { /* ignore */ }
      }

      playWrong();
      setIsWrong(true);
      setTimeout(() => setIsWrong(false), 380);

      // Reset streak
      streakRef.current = 0;
      setStreak(0);

      // Deduct penalty seconds (configured per level)
      const applyPenalty = (window as unknown as { applyPenalty?: (p: number) => void }).applyPenalty;
      if (applyPenalty) {
        applyPenalty(penalty);
      }

      // Show actual penalty value
      addNotification(`-${penalty}s`, 'wrong');

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

  // Quit modal handlers
  const handleOpenQuit = () => {
    if (isGameOverRef.current) return;
    // Pause the timer
    isPausedRef.current = true;
    pauseStartRef.current = performance.now();
    setShowQuitModal(true);
  };

  const handleResumeGame = () => {
    // Resume the timer — accumulate pause duration
    totalPausedMsRef.current += performance.now() - pauseStartRef.current;
    isPausedRef.current = false;
    setShowQuitModal(false);
  };

  const handleConfirmQuit = () => {
    isGameOverRef.current = true; // prevent any further timer callbacks
    setShowQuitModal(false);
    onQuit();
  };

  const handleToggleSound = () => {
    const next = toggleSound();
    setSoundOn(next);
  };

  // Timer color dynamics
  const timerRatio = Math.max(0, Math.min(1, timeLeft / roundTime));
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

  // Grid styling based on total number of colors — matches original aesthetic while fitting screen
  const colorCount = availableColors.length;
  let gridCols: number;
  let btnHeight: string;
  let btnFontSize: string;
  let dotSize: string;
  let gridGap: string;
  let btnPadding: string;
  let btnRadius: string;

  if (colorCount <= 6) {
    // Classic 2-column layout (Levels 1-4): tall, prominent, arcade feel!
    gridCols = 2;
    btnHeight = '58px';
    btnFontSize = '1.15rem';
    dotSize = '16px';
    gridGap = '12px';
    btnPadding = '0 16px';
    btnRadius = '16px';
  } else if (colorCount <= 8) {
    // 2 columns (Levels 5-8): comfortable 4-row layout
    gridCols = 2;
    btnHeight = '48px';
    btnFontSize = '1.02rem';
    dotSize = '14px';
    gridGap = '10px';
    btnPadding = '0 14px';
    btnRadius = '14px';
  } else if (colorCount <= 12) {
    // 3 columns (Levels 9-16): 3 to 4 rows
    gridCols = 3;
    btnHeight = '46px';
    btnFontSize = '0.88rem';
    dotSize = '13px';
    gridGap = '8px';
    btnPadding = '0 10px';
    btnRadius = '14px';
  } else if (colorCount <= 18) {
    // 3 columns (Levels 17-28): 5 to 6 rows
    gridCols = 3;
    btnHeight = '40px';
    btnFontSize = '0.80rem';
    dotSize = '12px';
    gridGap = '7px';
    btnPadding = '0 8px';
    btnRadius = '12px';
  } else if (colorCount <= 24) {
    // 4 columns (Levels 29-40): 5 to 6 rows
    gridCols = 4;
    btnHeight = '36px';
    btnFontSize = '0.74rem';
    dotSize = '11px';
    gridGap = '6px';
    btnPadding = '0 6px';
    btnRadius = '11px';
  } else {
    // 4 columns (Levels 41-50: 25 to 30 colors): 7 to 8 compact rows, guaranteed to fit
    gridCols = 4;
    btnHeight = '32px';
    btnFontSize = '0.68rem';
    dotSize = '10px';
    gridGap = '5px';
    btnPadding = '0 5px';
    btnRadius = '10px';
  }

  const reachedGoal = score >= levelConfig.targetScore;
  const penaltyDisplay = penalty % 1 === 0 ? `${penalty}` : `${penalty}`;

  return (
    <>
      {/* Full-screen red flash overlay when answering wrong */}
      {isWrong && <div className="screen-red-flash" aria-hidden="true" />}

      <div
        className={`app-gameplay ${isWrong ? 'shake-effect wrong-flash' : ''}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          flex: 1,
          width: '100%',
          padding: '8px 6px 10px 6px',
          position: 'relative',
          minHeight: '100%',
          overflow: 'hidden'
        }}
      >
        {/* HUD Header */}
        <div style={{ width: '100%', flexShrink: 0 }}>
          <div className="hud-card" style={{ padding: '8px 12px' }}>
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
                {!isDaily && roundTime > 30 && (
                  <span style={{
                    fontSize: '0.58rem',
                    fontWeight: 800,
                    color: '#00FF88',
                    background: 'rgba(0, 255, 136, 0.12)',
                    padding: '1px 5px',
                    borderRadius: '6px',
                    border: '1px solid rgba(0, 255, 136, 0.3)'
                  }}>
                    {roundTime}s
                  </span>
                )}
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
                <span style={{ fontSize: '0.62rem', color: '#8C94B2', marginTop: '2px', fontWeight: 600 }}>
                  BEST: {longestStreak}x
                </span>
              )}
            </div>

            {/* Sound, Quit & Timer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: soundOn ? '#00FF88' : '#8C94B2',
                  cursor: 'pointer'
                }}
              >
                {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
              </button>

              <button
                onClick={handleOpenQuit}
                aria-label="Quit game"
                style={{
                  background: 'rgba(255, 51, 102, 0.12)',
                  border: '1px solid rgba(255, 51, 102, 0.35)',
                  borderRadius: '10px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FF3366',
                  cursor: 'pointer'
                }}
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>

          {/* Dynamic Timer Bar */}
          <div className="timer-track" style={{ marginTop: '6px' }}>
            <div
              className="timer-fill"
              style={{
                width: `${timerRatio * 100}%`,
                backgroundColor: timerBarColor,
                color: timerBarColor
              }}
            />
          </div>

          {/* Penalty indicator */}
          {penalty < 2 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              marginTop: '4px',
              fontSize: '0.62rem',
              fontWeight: 700,
              color: '#8C94B2',
              letterSpacing: '0.04em'
            }}>
              <span>WRONG TAP: <span style={{ color: '#FF3366' }}>-{penaltyDisplay}s</span></span>
            </div>
          )}
        </div>

        {/* Central Arena: The Stroop Word & Floating Feedback */}
        <div style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          padding: colorCount > 18 ? '2px 0 6px 0' : '8px 0 14px 0',
          width: '100%'
        }}>
          {/* Helper Cue with Target Goal */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.74rem',
            fontWeight: 700,
            color: '#8C94B2',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: '4px'
          }}>
            <Zap size={13} color="#00E5FF" />
            <span>TAP INK COLOR</span>
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
              fontSize: colorCount > 18 ? 'clamp(2.4rem, 10vw, 3.4rem)' : 'clamp(2.8rem, 12vw, 4.2rem)',
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

          {/* Floating Score Notifications */}
          {notifications.map((n) => (
            <div
              key={n.id}
              className="floating-feedback"
              style={{
                top: '38%',
                left: `calc(50% + ${n.x}px)`,
                color: n.type === 'bonus' ? '#FFE600' : n.type === 'correct' ? '#00FF88' : '#FF3366',
                textShadow: n.type === 'bonus'
                  ? '0 0 20px #FFE600, 0 0 35px rgba(255, 230, 0, 0.8)'
                  : n.type === 'correct'
                  ? '0 0 20px #00FF88, 0 0 35px rgba(0, 255, 136, 0.8)'
                  : '0 0 20px #FF3366, 0 0 35px rgba(255, 51, 102, 0.8)'
              }}
            >
              {n.text}
            </div>
          ))}
        </div>

        {/* Color Tap Buttons Grid — Visible colors, rich glow, no off-screen clipping */}
        <div
          className="color-buttons-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
            gap: gridGap,
            width: '100%',
            flexShrink: 0,
            paddingBottom: '2px'
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
                // Rich color background tint so the color is immediately recognizable!
                background: `linear-gradient(145deg, rgba(${color.rgb}, 0.28) 0%, rgba(${color.rgb}, 0.12) 65%, rgba(14, 15, 28, 0.92) 100%)`,
                borderColor: color.hex,
                boxShadow: `0 0 12px ${color.glow}, inset 0 0 10px rgba(${color.rgb}, 0.18)`,
                minHeight: btnHeight,
                height: btnHeight,
                fontSize: btnFontSize,
                padding: btnPadding,
                borderRadius: btnRadius,
                gap: colorCount >= 19 ? '5px' : '8px'
              }}
            >
              {/* Vibrant Glowing Color Bead */}
              <div
                className="color-indicator-dot"
                style={{
                  width: dotSize,
                  height: dotSize,
                  backgroundColor: color.hex,
                  boxShadow: `0 0 8px ${color.hex}, 0 0 16px ${color.glow}`,
                  border: '1.5px solid rgba(255, 255, 255, 0.7)',
                  borderRadius: '50%',
                  flexShrink: 0
                }}
              />
              <span style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: '#FFFFFF',
                fontWeight: 900,
                textShadow: `0 1px 3px rgba(0, 0, 0, 0.9), 0 0 8px rgba(${color.rgb}, 0.5)`
              }}>
                {color.name}
              </span>
            </button>
          ))}
        </div>

        {/* Quit Confirmation Modal Overlay */}
        {showQuitModal && (
          <div
            className="quit-modal-overlay"
            onClick={handleResumeGame}
          >
            <div
              className="quit-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#FFFFFF',
                marginBottom: '4px'
              }}>
                Quit Game?
              </div>
              <p style={{
                fontSize: '0.88rem',
                color: '#A0AEC0',
                fontWeight: 600,
                marginBottom: '20px',
                lineHeight: 1.4
              }}>
                Your progress in this round will be lost.
                <br />
                Your best scores and level progress are safe.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                <button
                  onClick={handleResumeGame}
                  className="btn-primary"
                  style={{ width: '100%', padding: '14px 20px', fontSize: '1.05rem' }}
                >
                  <span>▶ CONTINUE PLAYING</span>
                </button>
                <button
                  onClick={handleConfirmQuit}
                  className="btn-secondary"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '0.95rem',
                    borderColor: 'rgba(255, 51, 102, 0.4)',
                    color: '#FF3366'
                  }}
                >
                  <LogOut size={16} />
                  <span>QUIT TO MENU</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
