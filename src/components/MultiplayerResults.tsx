import React, { useEffect } from 'react';
import { Crown, Flame, RotateCcw, Home, Target } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MultiplayerManager } from '../utils/multiplayerPeer';
import { RoomState } from '../types/multiplayer';
import { playGameOver, playTap } from '../utils/sound';

interface MultiplayerResultsProps {
  manager: MultiplayerManager;
  roomState: RoomState;
  onRematch: () => void;
  onLeave: () => void;
}

export const MultiplayerResults: React.FC<MultiplayerResultsProps> = ({
  manager,
  roomState,
  onRematch,
  onLeave
}) => {
  const playersList = Object.values(roomState.players);
  // Sort by final score descending
  const rankedPlayers = [...playersList].sort((a, b) => b.score - a.score);
  const winner = rankedPlayers[0];
  const isMeWinner = winner && winner.id === manager.myId;
  const isHost = manager.isHost;

  useEffect(() => {
    playGameOver(isMeWinner);
    if (isMeWinner) {
      try {
        confetti({
          particleCount: 200,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#FFE600', '#FF7700', '#00E5FF', '#00FF88', '#B026FF']
        });
      } catch {
        // ignore
      }
    }
  }, [isMeWinner]);

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
      {/* Top Banner */}
      <div style={{ textAlign: 'center', marginTop: '6px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '999px',
          background: 'linear-gradient(135deg, rgba(255, 230, 0, 0.2), rgba(255, 119, 0, 0.2))',
          border: '1px solid #FFE600',
          boxShadow: '0 0 20px rgba(255, 230, 0, 0.4)',
          marginBottom: '8px'
        }}>
          <Crown size={16} color="#FFE600" />
          <span style={{ fontSize: '0.82rem', fontWeight: 900, color: '#FFE600', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            MATCH COMPLETE
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.2rem, 9vw, 3rem)',
          fontWeight: 900,
          textTransform: 'uppercase',
          margin: 0,
          background: isMeWinner
            ? 'linear-gradient(135deg, #FFE600 0%, #FF7700 50%, #00FF88 100%)'
            : 'linear-gradient(135deg, #FFFFFF 0%, #00E5FF 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: isMeWinner ? 'drop-shadow(0 0 20px rgba(255, 230, 0, 0.5))' : 'drop-shadow(0 0 15px rgba(0, 229, 255, 0.4))'
        }}>
          {isMeWinner ? '🏆 YOU WON!' : `${winner?.name} WINS!`}
        </h1>
      </div>

      {/* Leaderboard Podium List */}
      <div style={{
        width: '100%',
        maxWidth: '380px',
        margin: '12px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {rankedPlayers.map((player, idx) => {
          const rank = idx + 1;
          const isWinner = rank === 1;
          const isMe = player.id === manager.myId;
          const totalAnswers = player.correctAnswers + player.wrongAnswers;
          const accuracy = totalAnswers > 0 ? Math.round((player.correctAnswers / totalAnswers) * 100) : 0;

          return (
            <div
              key={player.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: isWinner
                  ? 'linear-gradient(135deg, rgba(255, 230, 0, 0.18) 0%, rgba(20, 20, 36, 0.85) 100%)'
                  : isMe
                  ? 'rgba(0, 229, 255, 0.12)'
                  : 'rgba(20, 20, 36, 0.7)',
                border: isWinner
                  ? '1.5px solid #FFE600'
                  : isMe
                  ? '1.5px solid rgba(0, 229, 255, 0.4)'
                  : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: isWinner ? '0 0 20px rgba(255, 230, 0, 0.25)' : 'none',
                borderRadius: '16px',
                padding: '12px 14px'
              }}
            >
              {/* Left: Rank & Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: isWinner
                    ? 'linear-gradient(135deg, #FFE600, #FF7700)'
                    : rank === 2
                    ? 'linear-gradient(135deg, #E2E8F0, #94A3B8)'
                    : rank === 3
                    ? 'linear-gradient(135deg, #D97706, #92400E)'
                    : 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                  color: isWinner ? '#070710' : '#FFFFFF'
                }}>
                  {isWinner ? <Crown size={18} color="#070710" /> : `#${rank}`}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      color: isWinner ? '#FFE600' : '#FFFFFF'
                    }}>
                      {player.name}
                    </span>
                    {isMe && (
                      <span style={{ fontSize: '0.65rem', color: '#00E5FF', fontWeight: 800 }}>(You)</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.68rem', color: '#8C94B2', marginTop: '2px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <Flame size={10} color="#FF7700" />
                      {player.longestStreak}x Streak
                    </span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <Target size={10} color="#00FF88" />
                      {accuracy}% Acc
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Score */}
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: '1.4rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: isWinner ? '#FFE600' : '#00E5FF',
                  textShadow: isWinner ? '0 0 10px rgba(255, 230, 0, 0.5)' : 'none'
                }}>
                  {player.score}
                </div>
                <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#8C94B2' }}>POINTS</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Buttons */}
      <div style={{
        width: '100%',
        maxWidth: '380px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginTop: '6px'
      }}>
        {isHost ? (
          playersList.length < 2 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button
                onClick={() => {
                  playTap();
                  onRematch();
                }}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '1.05rem',
                  background: 'linear-gradient(135deg, #FF7700, #FFE600)'
                }}
              >
                <RotateCcw size={20} />
                <span>RETURN TO LOBBY (INVITE PLAYERS)</span>
              </button>
              <div style={{ textAlign: 'center', fontSize: '0.74rem', color: '#FF7700', fontWeight: 700 }}>
                ⚠️ Other player(s) left the room. Go to lobby to invite friends.
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                playTap();
                onRematch();
              }}
              className="btn-primary"
              style={{ width: '100%', padding: '16px', fontSize: '1.15rem' }}
            >
              <RotateCcw size={20} />
              <span>PLAY AGAIN / REMATCH ({playersList.length} PLAYERS)</span>
            </button>
          )
        ) : (
          <div style={{
            background: 'rgba(0, 229, 255, 0.1)',
            border: '1px solid rgba(0, 229, 255, 0.3)',
            borderRadius: '14px',
            padding: '12px',
            textAlign: 'center',
            color: '#00E5FF',
            fontSize: '0.85rem',
            fontWeight: 800
          }}>
            ⏳ Waiting for Host to start rematch...
          </div>
        )}

        <button
          onClick={() => {
            playTap();
            onLeave();
          }}
          className="btn-secondary"
          style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
        >
          <Home size={16} />
          <span>RETURN TO HOME</span>
        </button>
      </div>
    </div>
  );
};
