import React, { useState } from 'react';
import { Volume2, VolumeX, Play, Zap, HelpCircle, Trophy, Flame } from 'lucide-react';
import { isSoundEnabled, toggleSound } from '../utils/sound';

interface HomeScreenProps {
  bestScore: number;
  longestStreak: number;
  onStartGame: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  bestScore,
  longestStreak,
  onStartGame
}) => {
  const [soundOn, setSoundOn] = useState<boolean>(isSoundEnabled());
  const [showHowTo, setShowHowTo] = useState<boolean>(false);

  const handleToggleSound = () => {
    const next = toggleSound();
    setSoundOn(next);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      minHeight: '100%',
      flex: 1,
      padding: '20px 8px 16px 8px',
      position: 'relative'
    }}>
      {/* Top Bar with Sound Toggle */}
      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 8px'
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
          <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: '#00E5FF' }}>
            ARCADE EDITION
          </span>
        </div>

        <button
          onClick={handleToggleSound}
          aria-label={soundOn ? 'Mute sound' : 'Unmute sound'}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            width: '42px',
            height: '42px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: soundOn ? '#00FF88' : '#8C94B2',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          {soundOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </div>

      {/* Hero Title Section */}
      <div style={{
        textAlign: 'center',
        margin: 'auto 0',
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
          padding: '6px 14px',
          borderRadius: '999px',
          background: 'rgba(176, 38, 255, 0.15)',
          border: '1px solid rgba(176, 38, 255, 0.4)',
          marginBottom: '16px',
          boxShadow: '0 0 15px rgba(176, 38, 255, 0.3)'
        }}>
          <span style={{ fontSize: '1rem' }}>⚡</span>
          <span style={{
            fontSize: '0.78rem',
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
          fontSize: 'clamp(2.6rem, 11vw, 3.8rem)',
          fontWeight: 900,
          lineHeight: 1.05,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          margin: '0 0 10px 0',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #00E5FF 50%, #B026FF 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 25px rgba(0, 229, 255, 0.5))'
        }}>
          COLOR<br />CHAOS
        </h1>

        {/* Tagline */}
        <p style={{
          fontSize: 'clamp(0.95rem, 3.8vw, 1.15rem)',
          fontWeight: 600,
          letterSpacing: '0.04em',
          color: '#A0AEC0',
          margin: '0 0 24px 0'
        }}>
          Trust your eyes. <span style={{ color: '#00E5FF', fontWeight: 800 }}>Beat the chaos.</span>
        </p>

        {/* Best Score Banner */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          background: 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '12px 24px',
          marginBottom: '28px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy size={18} color="#FFE600" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#8C94B2', textTransform: 'uppercase' }}>
                BEST SCORE
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF', fontFamily: 'var(--font-mono)' }}>
                {bestScore}
              </div>
            </div>
          </div>

          <div style={{ width: '1px', height: '28px', background: 'rgba(255, 255, 255, 0.1)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flame size={18} color="#FF7700" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#8C94B2', textTransform: 'uppercase' }}>
                MAX STREAK
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FF7700', fontFamily: 'var(--font-mono)' }}>
                {longestStreak}x
              </div>
            </div>
          </div>
        </div>

        {/* Big PLAY Button */}
        <button
          onClick={onStartGame}
          className="btn-primary"
          style={{
            width: '100%',
            maxWidth: '320px',
            fontSize: '1.35rem',
            padding: '20px 32px'
          }}
        >
          <Play fill="#FFFFFF" size={24} />
          <span>START GAME</span>
        </button>
      </div>

      {/* Bottom Section: How to play toggle */}
      <div style={{ width: '100%', maxWidth: '380px', marginTop: '16px' }}>
        <button
          onClick={() => setShowHowTo(!showHowTo)}
          style={{
            background: 'none',
            border: 'none',
            color: '#8C94B2',
            fontSize: '0.85rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            width: '100%',
            cursor: 'pointer',
            padding: '8px'
          }}
        >
          <HelpCircle size={16} />
          <span>{showHowTo ? 'Hide Instructions' : 'How to Play'}</span>
        </button>

        {showHowTo && (
          <div style={{
            background: 'rgba(18, 18, 32, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            padding: '16px',
            marginTop: '8px',
            fontSize: '0.86rem',
            lineHeight: 1.45,
            color: '#D1D5DB',
            animation: 'slide-up 0.2s ease-out'
          }}>
            <div style={{
              background: 'rgba(0, 0, 0, 0.35)',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(0, 229, 255, 0.2)',
              marginBottom: '10px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.78rem', color: '#8C94B2', marginBottom: '2px' }}>EXAMPLE</div>
              The word <span style={{ color: '#00FF88', fontWeight: 900, textShadow: '0 0 8px #00FF88' }}>RED</span> appears in green ink.
              <div style={{ fontWeight: 800, color: '#00FF88', marginTop: '4px' }}>
                👉 Tap GREEN, not RED!
              </div>
            </div>

            <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li><strong>30 Seconds:</strong> Score as much as you can.</li>
              <li><strong>+10 Points:</strong> Awarded for every correct color match.</li>
              <li><strong>Bonus Points:</strong> Every 5 consecutive streak wins bonus!</li>
              <li><strong style={{ color: '#FF3366' }}>-2 Seconds Penalty:</strong> Wrong taps deduct time!</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
