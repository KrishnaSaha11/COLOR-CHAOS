import React, { useState } from 'react';
import { RotateCcw, Home, Share2, Trophy, Flame, Zap, Check } from 'lucide-react';
import { playTap } from '../utils/sound';

interface GameOverScreenProps {
  finalScore: number;
  bestScore: number;
  longestStreak: number;
  isNewBest: boolean;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  finalScore,
  bestScore,
  longestStreak,
  isNewBest,
  onPlayAgain,
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
    const shareText = `I scored ${finalScore} in COLOR CHAOS! Can you beat me? ⚡️`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'COLOR CHAOS - Neon Reaction Game',
          text: shareText,
          url: shareUrl
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fallback to copy
        if ((err as Error)?.name !== 'AbortError') {
          copyToClipboard(`${shareText} ${shareUrl}`);
        }
      }
    } else {
      copyToClipboard(`${shareText} ${shareUrl}`);
    }
  };

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('Score & link copied! Paste into Instagram 📋');
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
      showToast('Score & link copied! Paste into Instagram 📋');
    } catch {
      showToast('Score: ' + finalScore + ' | ' + window.location.href);
    }
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
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-banner">
          <Check size={18} color="#00FF88" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        {isNewBest ? (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '999px',
            background: 'linear-gradient(135deg, rgba(255, 230, 0, 0.2), rgba(255, 119, 0, 0.2))',
            border: '1px solid #FFE600',
            boxShadow: '0 0 20px rgba(255, 230, 0, 0.4)',
            marginBottom: '10px',
            animation: 'pulse-badge 1s infinite alternate'
          }}>
            <Trophy size={18} color="#FFE600" />
            <span style={{
              fontSize: '0.85rem',
              fontWeight: 900,
              letterSpacing: '0.1em',
              color: '#FFE600',
              textTransform: 'uppercase'
            }}>
              NEW PERSONAL RECORD!
            </span>
          </div>
        ) : (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '999px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '10px'
          }}>
            <Zap size={14} color="#00E5FF" />
            <span style={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.1em', color: '#8C94B2' }}>
              ROUND FINISHED
            </span>
          </div>
        )}

        <h1 style={{
          fontSize: 'clamp(2.4rem, 10vw, 3.4rem)',
          fontWeight: 900,
          lineHeight: 1.05,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          margin: 0,
          background: isNewBest
            ? 'linear-gradient(135deg, #FFE600 0%, #FF7700 100%)'
            : 'linear-gradient(135deg, #FFFFFF 0%, #00E5FF 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: isNewBest ? 'drop-shadow(0 0 20px rgba(255, 230, 0, 0.5))' : 'drop-shadow(0 0 15px rgba(0, 229, 255, 0.4))'
        }}>
          {isNewBest ? 'CHAMPION!' : 'GAME OVER'}
        </h1>
      </div>

      {/* Main Stats Card */}
      <div style={{
        width: '100%',
        maxWidth: '380px',
        margin: 'auto 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        {/* Big Final Score Card */}
        <div style={{
          background: 'rgba(20, 20, 36, 0.75)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          padding: '24px 20px',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{
            fontSize: '0.85rem',
            fontWeight: 800,
            letterSpacing: '0.12em',
            color: '#8C94B2',
            textTransform: 'uppercase',
            marginBottom: '4px'
          }}>
            FINAL SCORE
          </div>
          <div style={{
            fontSize: 'clamp(3.5rem, 15vw, 4.8rem)',
            fontWeight: 900,
            lineHeight: 1,
            fontFamily: 'var(--font-mono)',
            color: '#00E5FF',
            textShadow: '0 0 25px rgba(0, 229, 255, 0.6)'
          }}>
            {finalScore}
          </div>
        </div>

        {/* 2-Column Stats: Best Score & Longest Streak */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {/* Best Score */}
          <div style={{
            background: 'rgba(20, 20, 36, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Trophy size={16} color="#FFE600" />
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#8C94B2', textTransform: 'uppercase' }}>
                BEST SCORE
              </span>
            </div>
            <div style={{
              fontSize: '1.6rem',
              fontWeight: 900,
              fontFamily: 'var(--font-mono)',
              color: '#FFFFFF'
            }}>
              {bestScore}
            </div>
          </div>

          {/* Longest Streak */}
          <div style={{
            background: 'rgba(20, 20, 36, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flame size={16} color="#FF7700" />
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#8C94B2', textTransform: 'uppercase' }}>
                MAX STREAK
              </span>
            </div>
            <div style={{
              fontSize: '1.6rem',
              fontWeight: 900,
              fontFamily: 'var(--font-mono)',
              color: '#FF7700'
            }}>
              {longestStreak}x
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        width: '100%',
        maxWidth: '380px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginTop: '12px'
      }}>
        {/* Play Again (Primary CTA) */}
        <button
          onClick={() => {
            playTap();
            onPlayAgain();
          }}
          className="btn-primary"
          style={{ width: '100%', padding: '18px 24px', fontSize: '1.25rem' }}
        >
          <RotateCcw size={22} />
          <span>PLAY AGAIN</span>
        </button>

        {/* Share Score Button */}
        <button
          onClick={handleShare}
          className="btn-secondary"
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, rgba(255, 51, 102, 0.15), rgba(176, 38, 255, 0.15))',
            borderColor: 'rgba(255, 51, 102, 0.4)',
            color: '#FFFFFF'
          }}
        >
          <Share2 size={18} color="#FF3366" />
          <span>SHARE SCORE</span>
        </button>

        {/* Home Button */}
        <button
          onClick={() => {
            playTap();
            onGoHome();
          }}
          className="btn-secondary"
          style={{ width: '100%' }}
        >
          <Home size={18} />
          <span>HOME</span>
        </button>
      </div>
    </div>
  );
};
