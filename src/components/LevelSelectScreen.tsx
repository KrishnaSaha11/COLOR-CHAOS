import React from 'react';
import { ArrowLeft, Lock, Check, Zap, Target } from 'lucide-react';
import { LEVEL_CONFIGS } from '../utils/levels';
import { UserProgress } from '../types/game';
import { playTap } from '../utils/sound';

interface LevelSelectScreenProps {
  progress: UserProgress;
  currentSelectedLevel: number;
  onSelectLevel: (level: number) => void;
  onBack: () => void;
}

export const LevelSelectScreen: React.FC<LevelSelectScreenProps> = ({
  progress,
  currentSelectedLevel,
  onSelectLevel,
  onBack
}) => {
  const { highestLevelUnlocked, completedLevels, levelBestScores } = progress;
  const completedCount = completedLevels.length;
  const percentComplete = Math.round((completedCount / 50) * 100);

  const handleLevelClick = (lvl: number) => {
    if (lvl > highestLevelUnlocked) return; // Locked!
    playTap();
    onSelectLevel(lvl);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100%',
      flex: 1,
      padding: '16px 8px',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: '16px'
      }}>
        <button
          onClick={() => {
            playTap();
            onBack();
          }}
          className="btn-secondary"
          style={{ padding: '8px 14px', borderRadius: '12px' }}
        >
          <ArrowLeft size={18} />
          <span>HOME</span>
        </button>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#8C94B2', textTransform: 'uppercase' }}>
            PROGRESSION
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#00E5FF', fontFamily: 'var(--font-mono)' }}>
            LEVEL {highestLevelUnlocked} OF 50
          </div>
        </div>
      </div>

      {/* Progress Bar Card */}
      <div style={{
        background: 'rgba(20, 20, 36, 0.75)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '14px 18px',
        marginBottom: '18px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={16} color="#00E5FF" />
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFFFFF' }}>
              LEVEL CAMPAIGN
            </span>
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#00FF88', fontFamily: 'var(--font-mono)' }}>
            {completedCount}/50 COMPLETED ({percentComplete}%)
          </span>
        </div>

        <div style={{
          width: '100%',
          height: '8px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '999px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${percentComplete}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #B026FF, #00E5FF)',
            borderRadius: '999px',
            boxShadow: '0 0 10px #00E5FF',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* 50 Levels Grid (5 columns x 10 rows) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '8px',
        width: '100%',
        maxHeight: 'calc(100dvh - 210px)',
        overflowY: 'auto',
        paddingRight: '2px',
        paddingBottom: '20px'
      }}>
        {LEVEL_CONFIGS.map((cfg) => {
          const isUnlocked = cfg.level <= highestLevelUnlocked;
          const isCompleted = completedLevels.includes(cfg.level);
          const isCurrent = cfg.level === currentSelectedLevel;
          const bestScore = levelBestScores[cfg.level] || 0;

          return (
            <button
              key={cfg.level}
              onClick={() => handleLevelClick(cfg.level)}
              disabled={!isUnlocked}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                aspectRatio: '1',
                borderRadius: '14px',
                border: isCurrent
                  ? '2px solid #00E5FF'
                  : isCompleted
                  ? '1.5px solid rgba(0, 255, 136, 0.5)'
                  : isUnlocked
                  ? '1.5px solid rgba(255, 255, 255, 0.2)'
                  : '1px solid rgba(255, 255, 255, 0.06)',
                background: isCurrent
                  ? 'rgba(0, 229, 255, 0.15)'
                  : isCompleted
                  ? 'rgba(0, 255, 136, 0.08)'
                  : isUnlocked
                  ? 'rgba(255, 255, 255, 0.04)'
                  : 'rgba(10, 10, 18, 0.5)',
                color: isUnlocked ? '#FFFFFF' : '#4B5563',
                cursor: isUnlocked ? 'pointer' : 'not-allowed',
                boxShadow: isCurrent
                  ? '0 0 15px rgba(0, 229, 255, 0.4), inset 0 0 10px rgba(0, 229, 255, 0.2)'
                  : 'none',
                transition: 'all 0.12s ease',
                padding: '4px'
              }}
            >
              {isUnlocked ? (
                <>
                  <span style={{
                    fontSize: '1.15rem',
                    fontWeight: 900,
                    fontFamily: 'var(--font-mono)',
                    color: isCurrent ? '#00E5FF' : isCompleted ? '#00FF88' : '#FFFFFF'
                  }}>
                    {cfg.level}
                  </span>

                  {isCompleted ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginTop: '2px' }}>
                      <Check size={12} color="#00FF88" strokeWidth={3} />
                      <span style={{ fontSize: '0.62rem', color: '#8C94B2', fontFamily: 'var(--font-mono)' }}>
                        {bestScore}
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginTop: '2px' }}>
                      <Target size={10} color="#8C94B2" />
                      <span style={{ fontSize: '0.6rem', color: '#8C94B2' }}>
                        {cfg.colorCount}c
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  <Lock size={16} color="#4B5563" />
                  <span style={{ fontSize: '0.68rem', color: '#4B5563', fontWeight: 700 }}>
                    {cfg.level}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
