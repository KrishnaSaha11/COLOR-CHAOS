import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Flame, Zap, Crown, Users, LogOut } from 'lucide-react';
import { Question, FloatingNotification } from '../types/game';
import { MultiplayerManager } from '../utils/multiplayerPeer';
import { RoomState } from '../types/multiplayer';
import { playCorrect, playWrong, playStreakBonus, playTick, isSoundEnabled, toggleSound } from '../utils/sound';
import { getColorsForMultiplayer } from '../utils/multiplayerQuestions';

interface MultiplayerGameplayProps {
  manager: MultiplayerManager;
  roomState: RoomState;
  onGameOver: () => void;
  onQuit: () => void;
}

export const MultiplayerGameplay: React.FC<MultiplayerGameplayProps> = ({
  manager,
  roomState,
  onGameOver,
  onQuit
}) => {
  // ★ Capture settings on mount so roomState prop changes during gameplay
  //   never reset our local game state.
  const [roundDuration] = useState(() => roomState.settings.duration);
  const [availableColors] = useState(() => getColorsForMultiplayer(roomState.settings.colorCount));
  const [questions] = useState(() => roomState.questions);

  // Countdown state before gameplay begins (3... 2... 1... GO!)
  const [countdownText, setCountdownText] = useState<string>('3');
  const [isCountingDown, setIsCountingDown] = useState<boolean>(true);
  const countdownDoneRef = useRef<boolean>(false);

  // Gameplay state
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(roundDuration);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [longestStreak, setLongestStreak] = useState<number>(0);
  const [isWrong, setIsWrong] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<FloatingNotification[]>([]);
  const [soundOn, setSoundOn] = useState<boolean>(isSoundEnabled());
  const [showQuitModal, setShowQuitModal] = useState<boolean>(false);

  // Refs for high-precision timer
  const isGameOverRef = useRef<boolean>(false);
  const timeLeftRef = useRef<number>(roundDuration);
  const scoreRef = useRef<number>(0);
  const streakRef = useRef<number>(0);
  const longestStreakRef = useRef<number>(0);
  const correctCountRef = useRef<number>(0);
  const wrongCountRef = useRef<number>(0);
  const lastTickedSecondRef = useRef<number>(roundDuration);

  // ★ Stable ref for onGameOver callback — never changes identity
  const onGameOverRef = useRef(onGameOver);
  useEffect(() => {
    onGameOverRef.current = onGameOver;
  }, [onGameOver]);

  const roundStartTimeRef = useRef<number | null>(null);
  const penaltySecondsRef = useRef<number>(0);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Handle Game End
  const triggerGameOver = useCallback(() => {
    if (isGameOverRef.current) return;
    isGameOverRef.current = true;

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    manager.sendFinish(
      scoreRef.current,
      longestStreakRef.current,
      correctCountRef.current,
      wrongCountRef.current
    );

    if (onGameOverRef.current) {
      onGameOverRef.current();
    }
  }, [manager]);

  // ★ COUNTDOWN EFFECT — Uses monotonic performance.now()
  //   Guarantees exact 3.0s (3... 2... 1... GO!) countdown on both Host & Guest,
  //   completely immune to OS clock drift between phone and laptop!
  useEffect(() => {
    if (countdownDoneRef.current) return;

    const startPerf = performance.now();
    const TOTAL_COUNTDOWN_MS = 3000;

    const check = () => {
      const elapsed = performance.now() - startPerf;
      const remainingMs = TOTAL_COUNTDOWN_MS - elapsed;

      if (remainingMs > 2000) {
        setCountdownText('3');
      } else if (remainingMs > 1000) {
        setCountdownText('2');
      } else if (remainingMs > 0) {
        setCountdownText('1');
      } else {
        // Countdown finished
        setCountdownText('GO!');
        if (!countdownDoneRef.current) {
          countdownDoneRef.current = true;
          setTimeout(() => setIsCountingDown(false), 250);
        }
        return true;
      }
      return false;
    };

    if (check()) return;

    const interval = setInterval(() => {
      if (check()) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // ★ MAIN GAME TIMER — starts precisely when isCountingDown becomes false.
  //   Uses performance.now() anchored once. Completely immune to re-renders.
  useEffect(() => {
    if (isCountingDown) return;
    if (isGameOverRef.current) return;

    // Lock the start time exactly once
    if (roundStartTimeRef.current === null) {
      roundStartTimeRef.current = performance.now();
    }

    const intervalId = setInterval(() => {
      if (isGameOverRef.current) {
        clearInterval(intervalId);
        return;
      }

      const startTime = roundStartTimeRef.current!;
      const elapsed = (performance.now() - startTime) / 1000;
      const remaining = Math.max(0, roundDuration - elapsed - penaltySecondsRef.current);

      timeLeftRef.current = remaining;
      setTimeLeft(remaining);

      const ceilSec = Math.ceil(remaining);
      if (ceilSec <= 5 && ceilSec > 0 && ceilSec !== lastTickedSecondRef.current) {
        lastTickedSecondRef.current = ceilSec;
        playTick();
      }

      if (remaining <= 0) {
        clearInterval(intervalId);
        triggerGameOver();
      }
    }, 50);

    timerIntervalRef.current = intervalId;

    return () => {
      clearInterval(intervalId);
      timerIntervalRef.current = null;
    };
    // ★ No `triggerGameOver` in deps — we use isGameOverRef guard instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCountingDown, roundDuration]);

  // Clean, self-contained penalty applicator
  const applyWrongPenalty = (penaltySec: number) => {
    penaltySecondsRef.current += penaltySec;
    const startTime = roundStartTimeRef.current ?? performance.now();
    const elapsed = (performance.now() - startTime) / 1000;
    const newRemaining = Math.max(0, roundDuration - elapsed - penaltySecondsRef.current);
    timeLeftRef.current = newRemaining;
    setTimeLeft(newRemaining);
    if (newRemaining <= 0) {
      triggerGameOver();
    }
  };

  const addNotification = (text: string, type: 'correct' | 'wrong' | 'bonus') => {
    const id = `${Date.now()}-${Math.random()}`;
    const x = Math.random() * 30 - 15;
    const y = Math.random() * 8 - 4;
    setNotifications((prev) => [...prev, { id, text, type, x, y }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 850);
  };

  // Safe question from pre-generated deterministic sequence
  const currentQ: Question = (questions && questions.length > 0)
    ? questions[questionIndex % questions.length]
    : { id: 1, word: 'RED', textColor: 'RED' };

  const currentDef = availableColors.find((c) => c.id === currentQ.textColor) || availableColors[0] || {
    id: 'RED',
    name: 'Red',
    hex: '#FF0055',
    rgb: '255, 0, 85',
    glow: 'rgba(255, 0, 85, 0.6)'
  };

  const handleColorChoice = (selectedColorId: string) => {
    if (isGameOverRef.current || isCountingDown || timeLeftRef.current <= 0) return;

    const isCorrect = selectedColorId === currentQ.textColor;

    if (isCorrect) {
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
      correctCountRef.current += 1;
      setScore(scoreRef.current);

      // Broadcast live score
      manager.sendScoreUpdate(scoreRef.current, nextStreak, true);

      // Advance to next identical question
      setQuestionIndex((prev) => prev + 1);
    } else {
      // Wrong choice
      if ('vibrate' in navigator) {
        try { navigator.vibrate([40, 50, 40]); } catch { /* ignore */ }
      }

      playWrong();
      setIsWrong(true);
      setTimeout(() => setIsWrong(false), 380);

      streakRef.current = 0;
      wrongCountRef.current += 1;
      setStreak(0);

      applyWrongPenalty(2);
      addNotification('-2s', 'wrong');

      manager.sendScoreUpdate(scoreRef.current, 0, false);
      setQuestionIndex((prev) => prev + 1);
    }
  };

  // Keyboard support (1-9)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= availableColors.length) {
        handleColorChoice(availableColors[num - 1].id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [availableColors, questionIndex, isCountingDown]);

  // Rank sorting for live ticker
  const playersList = Object.values(roomState.players);
  const sortedPlayers = [...playersList].sort((a, b) => b.score - a.score);
  const myRank = sortedPlayers.findIndex((p) => p.id === manager.myId) + 1;
  const currentLeader = sortedPlayers[0];

  // Timer color dynamics
  const timerRatio = Math.max(0, Math.min(1, timeLeft / roundDuration));
  let timerBarColor = '#00E5FF';
  if (timeLeft <= 5) {
    timerBarColor = '#FF3366';
  } else if (timeLeft <= 10) {
    timerBarColor = '#FF7700';
  } else if (timeLeft <= 18) {
    timerBarColor = '#FFE600';
  }

  // Button grid dimensions
  const colorCount = availableColors.length;
  let gridCols = 2;
  let btnHeight = '58px';
  let btnFontSize = '1.15rem';
  let dotSize = '16px';
  let gridGap = '12px';

  if (colorCount <= 6) {
    gridCols = 2;
    btnHeight = '58px';
    btnFontSize = '1.15rem';
    dotSize = '16px';
    gridGap = '12px';
  } else if (colorCount <= 10) {
    gridCols = 2;
    btnHeight = '46px';
    btnFontSize = '0.96rem';
    dotSize = '14px';
    gridGap = '8px';
  } else {
    // 16 colors
    gridCols = 3;
    btnHeight = '42px';
    btnFontSize = '0.82rem';
    dotSize = '12px';
    gridGap = '7px';
  }

  return (
    <>
      {/* Full screen red flash overlay on wrong selection */}
      {isWrong && <div className="screen-red-flash" aria-hidden="true" />}

      {/* Synchronized 3-2-1 Countdown Overlay */}
      {isCountingDown && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 500,
          background: 'rgba(5, 5, 12, 0.92)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            fontSize: '0.9rem',
            fontWeight: 800,
            letterSpacing: '0.15em',
            color: '#00E5FF',
            textTransform: 'uppercase',
            marginBottom: '12px'
          }}>
            MATCH STARTING
          </div>
          <div style={{
            fontSize: 'clamp(5rem, 25vw, 8rem)',
            fontWeight: 900,
            fontFamily: 'var(--font-mono)',
            color: countdownText === 'GO!' ? '#00FF88' : '#FFE600',
            textShadow: countdownText === 'GO!' ? '0 0 50px #00FF88' : '0 0 50px #FFE600',
            animation: 'scale-up 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)'
          }}>
            {countdownText}
          </div>
        </div>
      )}

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
        {/* Top Live Leaderboard & HUD */}
        <div style={{ width: '100%', flexShrink: 0 }}>
          {/* Live Mini Ranking Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(10, 10, 20, 0.8)',
            border: '1px solid rgba(0, 229, 255, 0.25)',
            borderRadius: '12px',
            padding: '6px 12px',
            marginBottom: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                background: myRank === 1 ? 'linear-gradient(135deg, #FFE600, #FF7700)' : 'rgba(255, 255, 255, 0.1)',
                color: myRank === 1 ? '#070710' : '#FFFFFF',
                borderRadius: '6px',
                padding: '2px 6px',
                fontSize: '0.72rem',
                fontWeight: 900
              }}>
                #{myRank}
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FFFFFF' }}>
                YOU: <span style={{ color: '#00E5FF' }}>{score} pts</span>
              </span>
            </div>

            {currentLeader && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#8C94B2', fontWeight: 700 }}>
                <Crown size={12} color="#FFE600" />
                <span>1st: {currentLeader.name} ({currentLeader.score})</span>
              </div>
            )}
          </div>

          {/* Main HUD Card */}
          <div className="hud-card" style={{ padding: '8px 12px' }}>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#B026FF', textTransform: 'uppercase' }}>
                MULTIPLAYER MATCH
              </div>
              <div className="hud-stat-value" style={{ color: '#00E5FF', textShadow: '0 0 10px rgba(0, 229, 255, 0.5)' }}>
                {score}
              </div>
            </div>

            {/* Streak */}
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
                  style={{ color: timerBarColor, textShadow: `0 0 12px ${timerBarColor}`, fontWeight: 900 }}
                >
                  {Math.max(0, timeLeft).toFixed(1)}s
                </div>
              </div>

              <button
                onClick={() => {
                  const next = toggleSound();
                  setSoundOn(next);
                }}
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
                onClick={() => setShowQuitModal(true)}
                aria-label="Leave match"
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

          {/* Timer bar */}
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
        </div>

        {/* Central Arena: Stroop Word */}
        <div style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px 0 12px 0',
          width: '100%',
          flexShrink: 0
        }}>
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
            <Users size={12} color="#00FF88" />
            <span style={{ color: '#00FF88' }}>QUESTION #{questionIndex + 1}</span>
          </div>

          <div
            key={currentQ.id}
            className="pop-animation"
            style={{
              fontSize: 'clamp(2.8rem, 12vw, 4.2rem)',
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
            {currentQ.word}
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

        {/* Color Tap Buttons Grid */}
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
                background: `linear-gradient(145deg, rgba(${color.rgb}, 0.28) 0%, rgba(${color.rgb}, 0.12) 65%, rgba(14, 15, 28, 0.92) 100%)`,
                borderColor: color.hex,
                boxShadow: `0 0 12px ${color.glow}, inset 0 0 10px rgba(${color.rgb}, 0.18)`,
                minHeight: btnHeight,
                height: btnHeight,
                fontSize: btnFontSize,
                borderRadius: '14px',
                gap: '8px'
              }}
            >
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

        {/* Quit Modal */}
        {showQuitModal && (
          <div className="quit-modal-overlay" onClick={() => setShowQuitModal(false)}>
            <div className="quit-modal" onClick={(e) => e.stopPropagation()}>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FFFFFF', marginBottom: '6px' }}>
                Leave Match?
              </div>
              <p style={{ fontSize: '0.86rem', color: '#8C94B2', marginBottom: '18px' }}>
                Leaving will disconnect you from this room.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => setShowQuitModal(false)}
                  className="btn-primary"
                  style={{ width: '100%', padding: '12px' }}
                >
                  KEEP PLAYING
                </button>
                <button
                  onClick={() => {
                    setShowQuitModal(false);
                    onQuit();
                  }}
                  className="btn-secondary"
                  style={{ width: '100%', padding: '12px', color: '#FF3366', borderColor: '#FF3366' }}
                >
                  LEAVE ROOM
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
