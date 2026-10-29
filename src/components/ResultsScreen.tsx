import React, { useState } from 'react';
import { RotateCcw, Home, Share2, Trophy, Flame, Zap, Check, ArrowRight, Grid, XCircle } from 'lucide-react';
import { playTap } from '../utils/sound';

interface ResultsScreenProps {
  finalScore: number;
  targetScore: number;
  level: number;
  isDaily: boolean;
  passedTarget: boolean;
  isNewBest: boolean;
  personalBest: number;
  levelBest: number;
  highestLevelUnlocked: number;
  currentDailyStreak: number;
  longestStreak: number;
  onPlayNextLevel?: () => void;
  onRetryLevel: () => void;
  onGoLevelSelect: () => void;
  onGoHome: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  finalScore,
  targetScore,
  level,
  isDaily,
  passedTarget,
  isNewBest,
  personalBest,
  levelBest,
  highestLevelUnlocked,
  currentDailyStreak,
  longestStreak,
  onPlayNextLevel,
  onRetryLevel,
  onGoLevelSelect,
  onGoHome
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleShare = async () => {
    playTap();
    const shareUrl = window.location.href;
    const shareText = isDaily
      ? `I scored ${finalScore} in today's COLOR CHAOS Daily Challenge! 🔥 My streak is ${currentDailyStreak} days! Can you beat me? Play now: ${shareUrl}`
      : `I reached Level ${level} in COLOR CHAOS and scored ${finalScore} points! Can you beat me? Play now: ${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'COLOR CHAOS - Neon Stroop Reaction Game',
          text: shareText,
          url: shareUrl
        });
        return;
      } catch (err) {
        if ((err as Error)?.name !== 'AbortError') {
          copyToClipboard(shareText);
        }
      }
    } else {
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('Score & link copied! Paste to Instagram 📋');
      }).catch(() => {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  };

  const fallbackCopy = (text: string) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast('Score & link copied! Paste to Instagram 📋');
    } catch {
      showToast('Score: ' + finalScore + ' | ' + window.location.href);
    }
  };

  const isLevel50Victory = !isDaily && level === 50 && passedTarget;
  const pointsShort = Math.max(0, targetScore - finalScore);

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
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-banner">
          <Check size={18} color="#00FF88" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginTop: '6px' }}>
        {isLevel50Victory ? (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '999px',
            background: 'linear-gradient(135deg, rgba(255, 230, 0, 0.25), rgba(255, 119, 0, 0.25))',
            border: '1px solid #FFE600',
            boxShadow: '0 0 25px rgba(255, 230, 0, 0.5)',
            marginBottom: '8px',
            animation: 'pulse-badge 1s infinite alternate'
          }}>
            <Trophy size={18} color="#FFE600" />
            <span style={{
              fontSize: '0.85rem',
              fontWeight: 900,
              letterSpacing: '0.12em',
              color: '#FFE600',
              textTransform: 'uppercase'
            }}>
              CAMPAIGN COMPLETE! 🏆
            </span>
          </div>
        ) : passedTarget ? (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 16px',
            borderRadius: '999px',
            background: 'rgba(0, 255, 136, 0.15)',
            border: '1px solid #00FF88',
            boxShadow: '0 0 15px rgba(0, 255, 136, 0.35)',
            marginBottom: '8px'
          }}>
            <Check size={16} color="#00FF88" strokeWidth={3} />
            <span style={{
              fontSize: '0.8rem',
              fontWeight: 900,
              letterSpacing: '0.1em',
              color: '#00FF88',
              textTransform: 'uppercase'
            }}>
              {isDaily ? 'DAILY CHALLENGE CLEARED!' : `LEVEL ${level} CLEARED!`}
            </span>
          </div>
        ) : (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '999px',
            background: 'rgba(255, 51, 102, 0.15)',
            border: '1px solid #FF3366',
            boxShadow: '0 0 15px rgba(255, 51, 102, 0.3)',
            marginBottom: '8px'
          }}>
            <XCircle size={16} color="#FF3366" />
            <span style={{ fontSize: '0.8rem', fontWeight: 900, letterSpacing: '0.1em', color: '#FF3366' }}>
              TARGET NOT MET ({pointsShort} PTS SHORT)
            </span>
          </div>
        )}

        <h1 style={{
          fontSize: 'clamp(2.2rem, 9vw, 3.2rem)',
          fontWeight: 900,
          lineHeight: 1.05,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          margin: 0,
          background: isLevel50Victory
            ? 'linear-gradient(135deg, #FFE600 0%, #FF7700 50%, #B026FF 100%)'
            : passedTarget
            ? 'linear-gradient(135deg, #FFFFFF 0%, #00FF88 100%)'
            : 'linear-gradient(135deg, #FFFFFF 0%, #FF3366 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: passedTarget ? 'drop-shadow(0 0 20px rgba(0, 255, 136, 0.5))' : 'drop-shadow(0 0 15px rgba(255, 51, 102, 0.4))'
        }}>
          {isLevel50Victory ? 'YOU BEAT COLOR CHAOS!' : passedTarget ? 'VICTORY!' : 'LEVEL FAILED'}
        </h1>
      </div>

      {/* Main Stats Card */}
      <div style={{
        width: '100%',
        maxWidth: '380px',
        margin: 'auto 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {/* Big Score Card */}
        <div style={{
          background: 'rgba(20, 20, 36, 0.75)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '22px',
          padding: '20px 18px',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '4px'
          }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#8C94B2', textTransform: 'uppercase' }}>
              FINAL SCORE
            </span>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              color: passedTarget ? '#00FF88' : '#FFE600',
              fontFamily: 'var(--font-mono)'
            }}>
              GOAL: {targetScore}
            </span>
          </div>

          <div style={{
            fontSize: 'clamp(3.2rem, 14vw, 4.4rem)',
            fontWeight: 900,
            lineHeight: 1,
            fontFamily: 'var(--font-mono)',
            color: passedTarget ? '#00FF88' : '#00E5FF',
            textShadow: passedTarget ? '0 0 25px rgba(0, 255, 136, 0.6)' : '0 0 25px rgba(0, 229, 255, 0.5)'
          }}>
            {finalScore}
          </div>

          {isNewBest && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              color: '#FFE600',
              fontSize: '0.75rem',
              fontWeight: 900,
              letterSpacing: '0.08em',
              marginTop: '6px'
            }}>
              <Zap size={14} color="#FFE600" />
              <span>NEW ALL-TIME RECORD!</span>
            </div>
          )}
        </div>

        {/* 2-Column Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {/* Level Best / Personal Best */}
          <div style={{
            background: 'rgba(20, 20, 36, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Trophy size={14} color="#FFE600" />
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#8C94B2', textTransform: 'uppercase' }}>
                {isDaily ? 'DAILY BEST' : 'LEVEL BEST'}
              </span>
            </div>
            <div style={{
              fontSize: '1.45rem',
              fontWeight: 900,
              fontFamily: 'var(--font-mono)',
              color: '#FFFFFF'
            }}>
              {levelBest}
            </div>
            {personalBest > 0 && (
              <span style={{ fontSize: '0.62rem', color: '#8C94B2', fontWeight: 600 }}>
                RECORD: {personalBest}
              </span>
            )}
          </div>

          {/* Campaign or Daily Streak */}
          <div style={{
            background: 'rgba(20, 20, 36, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Flame size={14} color="#FF7700" />
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#8C94B2', textTransform: 'uppercase' }}>
                {isDaily ? 'DAILY STREAK' : 'UNLOCKED'}
              </span>
            </div>
            <div style={{
              fontSize: '1.45rem',
              fontWeight: 900,
              fontFamily: 'var(--font-mono)',
              color: '#FF7700'
            }}>
              {isDaily ? `${currentDailyStreak} DAYS` : `LVL ${highestLevelUnlocked}/50`}
            </div>
            {longestStreak > 0 && (
              <span style={{ fontSize: '0.62rem', color: '#8C94B2', fontWeight: 600 }}>
                ROUND STREAK: {longestStreak}x
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        width: '100%',
        maxWidth: '380px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginTop: '10px'
      }}>
        {/* Next Level (if passed and not daily and level < 50) */}
        {passedTarget && !isDaily && level < 50 && onPlayNextLevel && (
          <button
            onClick={() => {
              playTap();
              onPlayNextLevel();
            }}
            className="btn-primary"
            style={{ width: '100%', padding: '16px 24px', fontSize: '1.2rem' }}
          >
            <span>NEXT LEVEL ({level + 1})</span>
            <ArrowRight size={20} />
          </button>
        )}

        {/* Retry / Replay Level */}
        <button
          onClick={() => {
            playTap();
            onRetryLevel();
          }}
          className={passedTarget && !isDaily && level < 50 ? 'btn-secondary' : 'btn-primary'}
          style={{
            width: '100%',
            padding: passedTarget && !isDaily && level < 50 ? '14px 20px' : '16px 24px',
            fontSize: passedTarget && !isDaily && level < 50 ? '1rem' : '1.2rem'
          }}
        >
          <RotateCcw size={20} />
          <span>{passedTarget ? 'REPLAY LEVEL' : 'RETRY LEVEL'}</span>
        </button>

        {/* Level Select & Share Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button
            onClick={() => {
              playTap();
              onGoLevelSelect();
            }}
            className="btn-secondary"
            style={{ padding: '12px 14px' }}
          >
            <Grid size={16} />
            <span>LEVELS</span>
          </button>

          <button
            onClick={handleShare}
            className="btn-secondary"
            style={{
              padding: '12px 14px',
              background: 'linear-gradient(135deg, rgba(255, 51, 102, 0.15), rgba(176, 38, 255, 0.15))',
              borderColor: 'rgba(255, 51, 102, 0.4)',
              color: '#FFFFFF'
            }}
          >
            <Share2 size={16} color="#FF3366" />
            <span>SHARE</span>
          </button>
        </div>

        {/* Home Button */}
        <button
          onClick={() => {
            playTap();
            onGoHome();
          }}
          className="btn-secondary"
          style={{ width: '100%', padding: '10px 16px', fontSize: '0.9rem' }}
        >
          <Home size={16} />
          <span>HOME</span>
        </button>
      </div>
    </div>
  );
};
