import React, { useState } from 'react';
import { Users, Copy, Check, Play, ArrowLeft, Clock, Palette, Crown, Share2, Sparkles } from 'lucide-react';
import { MultiplayerManager } from '../utils/multiplayerPeer';
import { RoomState, MultiplayerSettings } from '../types/multiplayer';
import { playTap } from '../utils/sound';

interface MultiplayerLobbyProps {
  manager: MultiplayerManager;
  roomState: RoomState | null;
  initialRoomCode?: string;
  onStartMatch: () => void;
  onLeave: () => void;
}

export const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({
  manager,
  roomState,
  initialRoomCode = '',
  onStartMatch,
  onLeave
}) => {
  // Saved player nickname from localStorage
  const [nickname, setNickname] = useState<string>(() => {
    try {
      return localStorage.getItem('color_chaos_nickname') || '';
    } catch {
      return '';
    }
  });

  const [activeTab, setActiveTab] = useState<'CREATE' | 'JOIN'>(initialRoomCode ? 'JOIN' : 'CREATE');
  const [joinCodeInput, setJoinCodeInput] = useState<string>(initialRoomCode);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Host configuration state
  const [selectedDuration, setSelectedDuration] = useState<30 | 40 | 60>(30);
  const [selectedColorCount, setSelectedColorCount] = useState<6 | 10 | 16>(6);

  // Save nickname to localStorage on change
  const handleNicknameChange = (val: string) => {
    setNickname(val);
    try {
      localStorage.setItem('color_chaos_nickname', val);
    } catch {
      // ignore
    }
  };

  // Create room handler
  const handleCreateRoom = async () => {
    if (!nickname.trim()) {
      setErrorMessage('Please enter your player nickname first!');
      return;
    }
    setErrorMessage(null);
    setIsConnecting(true);
    playTap();

    try {
      const settings: MultiplayerSettings = {
        duration: selectedDuration,
        colorCount: selectedColorCount
      };
      await manager.createRoom(nickname.trim(), settings);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to create room.');
    } finally {
      setIsConnecting(false);
    }
  };

  // Join room handler
  const handleJoinRoom = async () => {
    if (!nickname.trim()) {
      setErrorMessage('Please enter your player nickname first!');
      return;
    }
    if (!joinCodeInput.trim()) {
      setErrorMessage('Please enter a 6-character room code!');
      return;
    }
    setErrorMessage(null);
    setIsConnecting(true);
    playTap();

    try {
      await manager.joinRoom(joinCodeInput.trim().toUpperCase(), nickname.trim());
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Could not connect to room.');
    } finally {
      setIsConnecting(false);
    }
  };

  // Host updates settings
  const handleUpdateDuration = (duration: 30 | 40 | 60) => {
    setSelectedDuration(duration);
    if (manager.isHost && roomState) {
      manager.updateSettings({
        ...roomState.settings,
        duration
      });
    }
  };

  const handleUpdateColors = (colorCount: 6 | 10 | 16) => {
    setSelectedColorCount(colorCount);
    if (manager.isHost && roomState) {
      manager.updateSettings({
        ...roomState.settings,
        colorCount
      });
    }
  };

  const copyRoomCode = () => {
    if (!roomState) return;
    navigator.clipboard?.writeText(roomState.roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyRoomLink = () => {
    if (!roomState) return;
    const url = `${window.location.origin}${window.location.pathname}?room=${roomState.roomCode}`;
    if (navigator.share) {
      navigator.share({
        title: 'Join my COLOR CHAOS game!',
        text: `Play COLOR CHAOS with me! Room code: ${roomState.roomCode}`,
        url
      }).catch(() => {
        navigator.clipboard?.writeText(url);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      });
    } else {
      navigator.clipboard?.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // If in an active room lobby
  if (roomState) {
    const playersList = Object.values(roomState.players);
    const playerCount = playersList.length;
    const isHost = manager.isHost;

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
        {/* Top Header */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => {
              playTap();
              onLeave();
            }}
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <ArrowLeft size={16} />
            <span>LEAVE</span>
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(0, 229, 255, 0.1)',
            padding: '5px 12px',
            borderRadius: '999px',
            border: '1px solid rgba(0, 229, 255, 0.3)'
          }}>
            <Users size={14} color="#00E5FF" />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#00E5FF', letterSpacing: '0.06em' }}>
              {playerCount} / 5 PLAYERS
            </span>
          </div>
        </div>

        {/* Room Code Card */}
        <div style={{
          width: '100%',
          maxWidth: '380px',
          background: 'linear-gradient(135deg, rgba(20, 20, 36, 0.85) 0%, rgba(30, 20, 50, 0.85) 100%)',
          border: '1px solid rgba(0, 229, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 229, 255, 0.2)',
          borderRadius: '20px',
          padding: '16px 18px',
          textAlign: 'center',
          margin: '12px 0'
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#8C94B2', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            ROOM CODE
          </div>
          <div style={{
            fontSize: 'clamp(2.4rem, 10vw, 3.2rem)',
            fontWeight: 900,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.15em',
            color: '#00E5FF',
            textShadow: '0 0 25px rgba(0, 229, 255, 0.6)',
            margin: '4px 0 8px 0'
          }}>
            {roomState.roomCode}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              onClick={copyRoomCode}
              className="btn-secondary"
              style={{ padding: '8px 12px', fontSize: '0.8rem', borderRadius: '10px' }}
            >
              {copiedCode ? <Check size={14} color="#00FF88" /> : <Copy size={14} />}
              <span>{copiedCode ? 'COPIED!' : 'COPY CODE'}</span>
            </button>

            <button
              onClick={copyRoomLink}
              className="btn-secondary"
              style={{
                padding: '8px 12px',
                fontSize: '0.8rem',
                borderRadius: '10px',
                borderColor: '#00E5FF',
                color: '#00E5FF'
              }}
            >
              {copiedLink ? <Check size={14} color="#00FF88" /> : <Share2 size={14} />}
              <span>{copiedLink ? 'LINK COPIED' : 'INVITE LINK'}</span>
            </button>
          </div>
        </div>

        {/* Players in Room List */}
        <div style={{ width: '100%', maxWidth: '380px', flex: 1, margin: '8px 0' }}>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            color: '#8C94B2',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Users size={14} color="#B026FF" />
            <span>PLAYERS JOINED ({playerCount}/5)</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {playersList.map((player) => (
              <div
                key={player.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: player.id === manager.myId ? 'rgba(0, 229, 255, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                  border: player.id === manager.myId ? '1px solid rgba(0, 229, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  padding: '10px 14px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: player.isHost
                      ? 'linear-gradient(135deg, #FF7700, #FFE600)'
                      : 'linear-gradient(135deg, #B026FF, #00E5FF)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    color: '#070710',
                    fontSize: '0.85rem'
                  }}>
                    {player.name.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span>{player.name}</span>
                      {player.id === manager.myId && (
                        <span style={{ fontSize: '0.65rem', color: '#00E5FF', fontWeight: 700 }}>(You)</span>
                      )}
                    </div>
                    {player.isHost && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#FF7700', fontSize: '0.68rem', fontWeight: 800 }}>
                        <Crown size={11} />
                        <span>ROOM HOST</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#00FF88',
                  background: 'rgba(0, 255, 136, 0.1)',
                  padding: '3px 8px',
                  borderRadius: '999px',
                  border: '1px solid rgba(0, 255, 136, 0.3)'
                }}>
                  READY
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Host Game Settings (Host can change; Guest views) */}
        <div style={{
          width: '100%',
          maxWidth: '380px',
          background: 'rgba(20, 20, 36, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '12px 14px',
          margin: '8px 0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#8C94B2', textTransform: 'uppercase' }}>
              MATCH SETTINGS
            </span>
            <span style={{ fontSize: '0.68rem', color: isHost ? '#00E5FF' : '#8C94B2', fontWeight: 700 }}>
              {isHost ? '⚡ Host controls' : 'Set by host'}
            </span>
          </div>

          {/* Duration Selector */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#D1D5DB', fontWeight: 700 }}>
              <Clock size={14} color="#00E5FF" />
              <span>Duration:</span>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {([30, 40, 60] as const).map((sec) => (
                <button
                  key={sec}
                  disabled={!isHost}
                  onClick={() => handleUpdateDuration(sec)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    cursor: isHost ? 'pointer' : 'default',
                    background: roomState.settings.duration === sec ? '#00E5FF' : 'rgba(255, 255, 255, 0.06)',
                    color: roomState.settings.duration === sec ? '#070710' : '#8C94B2',
                    border: 'none'
                  }}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          {/* Color Count Selector */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#D1D5DB', fontWeight: 700 }}>
              <Palette size={14} color="#B026FF" />
              <span>Colors:</span>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {([6, 10, 16] as const).map((count) => (
                <button
                  key={count}
                  disabled={!isHost}
                  onClick={() => handleUpdateColors(count)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    cursor: isHost ? 'pointer' : 'default',
                    background: roomState.settings.colorCount === count ? '#B026FF' : 'rgba(255, 255, 255, 0.06)',
                    color: roomState.settings.colorCount === count ? '#FFFFFF' : '#8C94B2',
                    border: 'none'
                  }}
                >
                  {count}c
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Start / Waiting CTA */}
        <div style={{ width: '100%', maxWidth: '380px', marginTop: '6px' }}>
          {isHost ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button
                disabled={playerCount < 2}
                onClick={() => {
                  if (playerCount < 2) return;
                  playTap();
                  onStartMatch();
                }}
                className={playerCount >= 2 ? 'btn-primary' : 'btn-secondary'}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  fontSize: '1.15rem',
                  opacity: playerCount < 2 ? 0.65 : 1,
                  cursor: playerCount < 2 ? 'not-allowed' : 'pointer'
                }}
              >
                <Play size={22} fill={playerCount >= 2 ? '#FFFFFF' : '#8C94B2'} />
                <span>
                  {playerCount < 2
                    ? 'WAITING FOR A FRIEND TO JOIN...'
                    : `START MATCH (${playerCount} PLAYERS)`}
                </span>
              </button>
              {playerCount < 2 && (
                <div style={{ textAlign: 'center', fontSize: '0.74rem', color: '#FFE600', fontWeight: 700 }}>
                  ⚡ Need at least 2 players to start. Share the room code above!
                </div>
              )}
            </div>
          ) : (
            <div style={{
              background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.12) 0%, rgba(0, 255, 136, 0.12) 100%)',
              border: '1.5px solid rgba(0, 229, 255, 0.4)',
              borderRadius: '16px',
              padding: '16px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  display: 'inline-block',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#00FF88',
                  boxShadow: '0 0 10px #00FF88'
                }} />
                <span style={{ color: '#00FF88', fontWeight: 900, fontSize: '0.98rem' }}>
                  YOU ARE CONNECTED & READY!
                </span>
              </div>
              <div style={{ color: '#00E5FF', fontWeight: 700, fontSize: '0.84rem' }}>
                Waiting for Host ({playersList.find(p => p.isHost)?.name || 'Host'}) to click Start Match...
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- Initial Lobby Setup Screen: Enter Name & Create / Join ---
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
      {/* Top Header */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => {
            playTap();
            onLeave();
          }}
          className="btn-secondary"
          style={{ padding: '8px 14px', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={16} />
          <span>HOME</span>
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(176, 38, 255, 0.15)',
          padding: '5px 12px',
          borderRadius: '999px',
          border: '1px solid rgba(176, 38, 255, 0.4)'
        }}>
          <Users size={14} color="#B026FF" />
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#D88BFF', letterSpacing: '0.06em' }}>
            FRIENDS MULTIPLAYER
          </span>
        </div>
      </div>

      {/* Main Container Card */}
      <div style={{
        width: '100%',
        maxWidth: '380px',
        margin: 'auto 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 8vw, 2.8rem)',
            fontWeight: 900,
            textTransform: 'uppercase',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #00E5FF 50%, #B026FF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 4px 0'
          }}>
            FRIENDS ARENA
          </h1>
          <p style={{ color: '#8C94B2', fontSize: '0.85rem', fontWeight: 600 }}>
            Compete live with 2 to 5 friends on identical questions!
          </p>
        </div>

        {/* Nickname Input Card */}
        <div style={{
          background: 'rgba(20, 20, 36, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '14px 16px'
        }}>
          <label style={{
            display: 'block',
            fontSize: '0.72rem',
            fontWeight: 800,
            color: '#8C94B2',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '6px'
          }}>
            YOUR NICKNAME
          </label>
          <input
            type="text"
            maxLength={14}
            value={nickname}
            onChange={(e) => handleNicknameChange(e.target.value)}
            placeholder="Enter your name (e.g. Krishna)"
            style={{
              width: '100%',
              background: 'rgba(10, 10, 20, 0.8)',
              border: '1px solid rgba(0, 229, 255, 0.3)',
              borderRadius: '12px',
              padding: '12px 14px',
              color: '#FFFFFF',
              fontSize: '1rem',
              fontWeight: 700,
              outline: 'none',
              boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.5)'
            }}
          />
        </div>

        {/* Tab Switcher: CREATE vs JOIN */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px',
          background: 'rgba(10, 10, 20, 0.6)',
          padding: '4px',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <button
            onClick={() => {
              playTap();
              setActiveTab('CREATE');
            }}
            style={{
              padding: '10px',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'CREATE' ? 'linear-gradient(135deg, #B026FF, #00E5FF)' : 'transparent',
              color: activeTab === 'CREATE' ? '#FFFFFF' : '#8C94B2'
            }}
          >
            CREATE ROOM
          </button>

          <button
            onClick={() => {
              playTap();
              setActiveTab('JOIN');
            }}
            style={{
              padding: '10px',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'JOIN' ? 'linear-gradient(135deg, #00E5FF, #00FF88)' : 'transparent',
              color: activeTab === 'JOIN' ? '#070710' : '#8C94B2'
            }}
          >
            JOIN ROOM
          </button>
        </div>

        {/* Error message banner */}
        {errorMessage && (
          <div style={{
            background: 'rgba(255, 51, 102, 0.15)',
            border: '1px solid #FF3366',
            borderRadius: '12px',
            padding: '10px 14px',
            color: '#FF3366',
            fontSize: '0.82rem',
            fontWeight: 700,
            textAlign: 'center'
          }}>
            {errorMessage}
          </div>
        )}

        {/* CREATE ROOM PANEL */}
        {activeTab === 'CREATE' && (
          <div style={{
            background: 'rgba(20, 20, 36, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {/* Duration setting */}
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#8C94B2', textTransform: 'uppercase', marginBottom: '6px' }}>
                ROUND DURATION
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {([30, 40, 60] as const).map((sec) => (
                  <button
                    key={sec}
                    onClick={() => {
                      playTap();
                      setSelectedDuration(sec);
                    }}
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      background: selectedDuration === sec ? '#00E5FF' : 'rgba(255, 255, 255, 0.06)',
                      color: selectedDuration === sec ? '#070710' : '#8C94B2',
                      border: selectedDuration === sec ? '1px solid #00E5FF' : '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    {sec} SECS
                  </button>
                ))}
              </div>
            </div>

            {/* Colors count setting */}
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#8C94B2', textTransform: 'uppercase', marginBottom: '6px' }}>
                COLOR DIFFICULTY
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {[
                  { count: 6 as const, label: '6 Colors' },
                  { count: 10 as const, label: '10 Colors' },
                  { count: 16 as const, label: '16 Colors' }
                ].map(({ count, label }) => (
                  <button
                    key={count}
                    onClick={() => {
                      playTap();
                      setSelectedColorCount(count);
                    }}
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      background: selectedColorCount === count ? '#B026FF' : 'rgba(255, 255, 255, 0.06)',
                      color: selectedColorCount === count ? '#FFFFFF' : '#8C94B2',
                      border: selectedColorCount === count ? '1px solid #B026FF' : '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCreateRoom}
              disabled={isConnecting}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1.05rem', marginTop: '6px' }}
            >
              <Sparkles size={18} />
              <span>{isConnecting ? 'CREATING ROOM...' : 'CREATE ROOM CODE'}</span>
            </button>
          </div>
        )}

        {/* JOIN ROOM PANEL */}
        {activeTab === 'JOIN' && (
          <div style={{
            background: 'rgba(20, 20, 36, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#8C94B2',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '6px'
              }}>
                ENTER 6-CHARACTER ROOM CODE
              </label>
              <input
                type="text"
                maxLength={6}
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. X9K2P4"
                style={{
                  width: '100%',
                  background: 'rgba(10, 10, 20, 0.8)',
                  border: '1px solid rgba(0, 255, 136, 0.3)',
                  borderRadius: '12px',
                  padding: '14px',
                  color: '#00FF88',
                  fontSize: '1.3rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.2em',
                  textAlign: 'center',
                  outline: 'none',
                  textTransform: 'uppercase'
                }}
              />
            </div>

            <button
              onClick={handleJoinRoom}
              disabled={isConnecting}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1.05rem',
                background: 'linear-gradient(135deg, #00E5FF 0%, #00FF88 100%)',
                color: '#070710'
              }}
            >
              <Users size={18} />
              <span>{isConnecting ? 'CONNECTING...' : 'JOIN ROOM'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div style={{
        textAlign: 'center',
        fontSize: '0.74rem',
        color: '#8C94B2',
        maxWidth: '340px',
        lineHeight: 1.4
      }}>
        ⚡ All players receive the exact same sequence of questions for fair competition.
      </div>
    </div>
  );
};
