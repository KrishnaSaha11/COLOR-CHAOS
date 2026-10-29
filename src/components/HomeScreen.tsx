import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Zap, HelpCircle, Trophy, Flame, Grid, Calendar, Clock, ArrowRight } from 'lucide-react';
import { isSoundEnabled, toggleSound, playTap } from '../utils/sound';
import { UserProgress } from '../types/game';
import { getTimeUntilMidnight, getTodayDateString } from '../utils/daily';

interface HomeScreenProps {
  progress: UserProgress;
  onStartLevel: (level: number) => void;
  onStartDaily: () => void;
  onOpenLevelSelect: () => void;
  onOpenAbout: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  progress,
  onStartLevel,
  onStartDaily,
  onOpenLevelSelect,
  onOpenAbout
}) => {
  const [soundOn, setSoundOn] = useState<boolean>(isSoundEnabled());
  const [showHowTo, setShowHowTo] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<string>('');

  const {
    highestLevelUnlocked,
    completedLevels,
    overallPersonalBest,
    dailyChallengeBestScore,
    currentDailyStreak
  } = progress;

  // Countdown timer to midnight
  useEffect(() => {
    const update = () => {
      setCountdown(getTimeUntilMidnight().formatted);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleSound = () => {
    const next = toggleSound();
    setSoundOn(next);
  };

  const todayStr = getTodayDateString();
  const playedDailyToday = progress.lastDailyChallengeDate === todayStr && dailyChallengeBestScore > 0;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      minHeight: '100%',
      flex: 1,
      padding: '16px 8px 14px 8px',
      position: 'relative'
    }}>
      {/* Top Bar with Sound Toggle & Badge */}
      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 4px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '6px 12px',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <Zap size={14} color="#00E5FF" />
          <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', color: '#00E5FF' }}>
            50 LEVELS • DAILY
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {overallPersonalBest > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(255, 230, 0, 0.1)',
              padding: '5px 10px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 230, 0, 0.25)'
            }}>
              <Trophy size={13} color="#FFE600" />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FFE600', fontFamily: 'var(--font-mono)' }}>
                BEST: {overallPersonalBest}
              </span>
            </div>
          )}

          <button
            onClick={handleToggleSound}
            aria-label={soundOn ? 'Mute sound' : 'Unmute sound'}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: soundOn ? '#00FF88' : '#8C94B2',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </div>

      {/* Hero Title Section */}
      <div style={{
        textAlign: 'center',
        margin: '12px 0',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Glow badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '5px 14px',
          borderRadius: '999px',
          background: 'rgba(176, 38, 255, 0.15)',
          border: '1px solid rgba(176, 38, 255, 0.4)',
          marginBottom: '10px',
          boxShadow: '0 0 15px rgba(176, 38, 255, 0.3)'
        }}>
          <span style={{ fontSize: '0.9rem' }}>⚡</span>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            letterSpacing: '0.12em',
            color: '#D88BFF',
            textTransform: 'uppercase'
          }}>
            Stroop Color Reaction
          </span>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(2.4rem, 10vw, 3.5rem)',
          fontWeight: 900,
          lineHeight: 1.05,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          margin: '0 0 6px 0',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #00E5FF 50%, #B026FF 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 25px rgba(0, 229, 255, 0.5))'
        }}>
          COLOR<br />CHAOS
        </h1>

        {/* Tagline */}
        <p style={{
          fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)',
          fontWeight: 600,
          letterSpacing: '0.04em',
          color: '#A0AEC0',
          margin: '0 0 16px 0'
        }}>
          Trust your eyes. <span style={{ color: '#00E5FF', fontWeight: 800 }}>Beat the chaos.</span>
        </p>

        {/* Campaign Progression Card */}
        <div style={{
          width: '100%',
          maxWidth: '360px',
          background: 'rgba(20, 20, 36, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '18px',
          padding: '14px 18px',
          marginBottom: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#8C94B2', textTransform: 'uppercase' }}>
              CAMPAIGN PROGRESS
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#00E5FF', fontFamily: 'var(--font-mono)' }}>
                LEVEL {highestLevelUnlocked}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#8C94B2', fontWeight: 700 }}>
                / 50 ({completedLevels.length} cleared)
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              playTap();
              onOpenLevelSelect();
            }}
            className="btn-secondary"
            style={{ padding: '8px 12px', fontSize: '0.8rem', borderRadius: '10px' }}
          >
            <Grid size={15} />
            <span>LEVELS</span>
          </button>
        </div>

        {/* Primary Play Button for Current Level */}
        <button
          onClick={() => {
            playTap();
            onStartLevel(highestLevelUnlocked);
          }}
          className="btn-primary"
          style={{
            width: '100%',
            maxWidth: '360px',
            fontSize: '1.25rem',
            padding: '18px 28px',
            marginBottom: '14px'
          }}
        >
          <Play fill="#FFFFFF" size={22} />
          <span>PLAY LEVEL {highestLevelUnlocked}</span>
        </button>

        {/* Daily Challenge Interactive Card */}
        <div style={{
          width: '100%',
          maxWidth: '360px',
          background: 'linear-gradient(135deg, rgba(255, 119, 0, 0.12) 0%, rgba(176, 38, 255, 0.12) 100%)',
          border: '1px solid rgba(255, 119, 0, 0.35)',
          borderRadius: '18px',
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          boxShadow: '0 4px 20px rgba(255, 119, 0, 0.15)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={15} color="#FF7700" />
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#FF7700', textTransform: 'uppercase' }}>
                DAILY CHALLENGE
              </span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(255, 119, 0, 0.2)',
              padding: '3px 8px',
              borderRadius: '999px',
              border: '1px solid rgba(255, 119, 0, 0.4)'
            }}>
              <Flame size={12} color="#FF7700" />
              <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#FF7700' }}>
                {currentDailyStreak} DAY STREAK
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#8C94B2', fontWeight: 700 }}>
                {playedDailyToday ? "TODAY'S BEST" : "TODAY'S STATUS"}
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#FFFFFF', fontFamily: 'var(--font-mono)' }}>
                {playedDailyToday ? `${dailyChallengeBestScore} PTS` : 'NOT PLAYED YET'}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.65rem', color: '#8C94B2', justifyContent: 'flex-end' }}>
                <Clock size={11} />
                <span>NEXT IN</span>
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#00E5FF', fontFamily: 'var(--font-mono)' }}>
                {countdown}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              playTap();
              onStartDaily();
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'rgba(255, 119, 0, 0.25)',
              border: '1px solid #FF7700',
              borderRadius: '12px',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.92rem',
              padding: '10px 14px',
              cursor: 'pointer',
              marginTop: '4px',
              transition: 'all 0.15s ease'
            }}
          >
            <span>{playedDailyToday ? 'REPLAY DAILY CHALLENGE' : 'PLAY DAILY CHALLENGE'}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Bottom Section: Quick Rules & Full Guide Links */}
      <footer style={{ width: '100%', maxWidth: '360px', marginTop: '10px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginBottom: '8px' }}>
          <button
            onClick={() => setShowHowTo(!showHowTo)}
            style={{
              background: 'none',
              border: 'none',
              color: '#8C94B2',
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <HelpCircle size={14} />
            <span>{showHowTo ? 'Hide Quick Rules' : 'Quick Rules'}</span>
          </button>

          <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>•</span>

          <button
            onClick={() => {
              playTap();
              onOpenAbout();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#00E5FF',
              fontSize: '0.8rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <Zap size={14} color="#00E5FF" />
            <span>About & FAQ</span>
          </button>
        </div>

        {showHowTo && (
          <div style={{
            background: 'rgba(18, 18, 32, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            padding: '14px',
            marginTop: '6px',
            fontSize: '0.82rem',
            lineHeight: 1.45,
            color: '#D1D5DB',
            animation: 'slide-up 0.2s ease-out',
            textAlign: 'left'
          }}>
            <div style={{
              background: 'rgba(0, 0, 0, 0.35)',
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1px solid rgba(0, 229, 255, 0.2)',
              marginBottom: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.72rem', color: '#8C94B2', marginBottom: '2px' }}>CORE RULE</div>
              The word <span style={{ color: '#00FF88', fontWeight: 900, textShadow: '0 0 8px #00FF88' }}>RED</span> appears in green ink.
              <div style={{ fontWeight: 800, color: '#00FF88', marginTop: '2px' }}>
                👉 Tap GREEN, not RED!
              </div>
            </div>

            <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li><strong>50 Levels:</strong> Reach target score to unlock the next level.</li>
              <li><strong>Daily Challenge:</strong> Play every day to build your Daily Streak!</li>
              <li><strong>Color Similarity:</strong> Colors get trickier and closer as you climb.</li>
              <li><strong style={{ color: '#FF3366' }}>-2s Penalty:</strong> Wrong taps cost 2 seconds!</li>
            </ul>

            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <button
                onClick={() => {
                  playTap();
                  onOpenAbout();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#00E5FF',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Read full Guide, Science & FAQ →
              </button>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
};
