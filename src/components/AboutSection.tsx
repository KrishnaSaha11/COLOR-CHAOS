import React, { useState } from 'react';
import { Play, ChevronDown, ChevronUp, Zap, HelpCircle, Target, Flame, Sparkles, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { playTap } from '../utils/sound';

interface AboutSectionProps {
  onPlayNow: () => void;
  onOpenLevelSelect?: () => void;
  onStartDaily?: () => void;
  onBackToHome?: () => void;
}

interface FAQItem {
  q: string;
  a: string;
}

const FAQS: FAQItem[] = [
  {
    q: 'Is COLOR CHAOS free to play?',
    a: 'Yes, COLOR CHAOS is 100% free with no paywalls, subscriptions, microtransactions, or mandatory account registrations. You can play directly in any modern desktop or mobile browser.'
  },
  {
    q: 'How do I play COLOR CHAOS?',
    a: 'Each question shows a color word in mismatched ink (such as the word "RED" written in green ink). Your goal is to tap the button matching the ink color (Green), not the word meaning (Red). Round timer is 30 seconds.'
  },
  {
    q: 'How many levels are there?',
    a: 'There are 50 progressive levels. Color counts start at 5 colors on Level 1 and scale up to 30 subtle neon colors on Level 50, accompanied by increasing speed and higher target score thresholds.'
  },
  {
    q: 'Does COLOR CHAOS save my progress?',
    a: 'Yes. Your highest unlocked level, level-by-level high scores, overall personal best, completed levels, and daily streak are automatically saved in your browser’s localStorage. Note that clearing your browser site data will reset your saved progress.'
  },
  {
    q: 'Can I play on mobile?',
    a: 'Yes, COLOR CHAOS is designed mobile-first. The responsive touch grid is optimized for comfortable one-handed thumb tapping with safe-area spacing, no page shifting, and haptic feedback on supported phones.'
  },
  {
    q: 'What is the Daily Challenge?',
    a: 'The Daily Challenge is a unique daily game mode where every player worldwide receives the exact same seeded color configuration for that calendar date. You can replay as many times as you like to beat your personal score for today and build your consecutive daily streak.'
  },
  {
    q: 'Does this game improve focus?',
    a: 'COLOR CHAOS tests and exercises skills such as selective visual attention, rapid color recognition, quick decision-making, and motor reaction speed under time constraints. These are skills the gameplay actively challenges rather than clinically guaranteed medical or cognitive improvements.'
  }
];

export const AboutSection: React.FC<AboutSectionProps> = ({
  onPlayNow,
  onOpenLevelSelect,
  onStartDaily,
  onBackToHome
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    playTap();
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <article
      className="about-guide-container"
      style={{
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
        padding: '16px 10px 40px 10px',
        color: '#E2E8F0',
        lineHeight: 1.6
      }}
    >
      {/* Top Navigation */}
      <nav aria-label="Game Navigation" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        {onBackToHome && (
          <button
            onClick={() => {
              playTap();
              onBackToHome();
            }}
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            ← BACK TO GAME
          </button>
        )}

        <button
          onClick={() => {
            playTap();
            onPlayNow();
          }}
          className="btn-primary"
          style={{ padding: '8px 18px', fontSize: '0.85rem' }}
        >
          <Play size={15} fill="#FFFFFF" />
          <span>PLAY NOW</span>
        </button>
      </nav>

      {/* Header Banner */}
      <header style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          borderRadius: '999px',
          background: 'rgba(0, 229, 255, 0.15)',
          border: '1px solid rgba(0, 229, 255, 0.4)',
          marginBottom: '8px'
        }}>
          <Sparkles size={13} color="#00E5FF" />
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#00E5FF', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Official Game Guide
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2rem, 8vw, 2.8rem)',
          fontWeight: 900,
          lineHeight: 1.1,
          letterSpacing: '0.04em',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #00E5FF 50%, #B026FF 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '8px'
        }}>
          ABOUT COLOR CHAOS
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '0.95rem' }}>
          Free online color reaction game based on the cognitive Stroop effect.
        </p>
      </header>

      {/* Section 1: What is COLOR CHAOS */}
      <section style={{
        background: 'rgba(20, 20, 36, 0.7)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '18px',
        padding: '18px',
        marginBottom: '16px'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={18} color="#00E5FF" />
          What is COLOR CHAOS?
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#CBD5E1', marginBottom: '10px' }}>
          <strong>COLOR CHAOS</strong> is a free, fast-paced browser game designed to challenge how quickly your brain processes conflicting sensory visual information.
        </p>
        <p style={{ fontSize: '0.9rem', color: '#CBD5E1' }}>
          In psychology, this phenomenon is called the <em>Stroop Effect</em>. When the meaning of a word and the color of its ink conflict, your brain experiences cognitive interference. COLOR CHAOS turns this mental battle into an addictive neon arcade race against the clock!
        </p>
      </section>

      {/* Section 2: How to Play */}
      <section style={{
        background: 'rgba(20, 20, 36, 0.7)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(0, 229, 255, 0.25)',
        borderRadius: '18px',
        padding: '18px',
        marginBottom: '16px'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#00E5FF', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target size={18} color="#00E5FF" />
          How to Play
        </h2>

        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          borderRadius: '12px',
          padding: '12px 14px',
          border: '1px solid rgba(0, 255, 136, 0.3)',
          marginBottom: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8C94B2', textTransform: 'uppercase' }}>THE GOLDEN RULE</div>
          <div style={{ fontSize: '1.1rem', margin: '4px 0' }}>
            Word is <span style={{ color: '#00FF88', fontWeight: 900, textShadow: '0 0 10px #00FF88' }}>RED</span> (printed in green ink).
          </div>
          <div style={{ fontWeight: 800, color: '#00FF88' }}>
            👉 Match the INK COLOR (Green), NOT the text word (Red)!
          </div>
        </div>

        <ul style={{ paddingLeft: '18px', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <li><strong>30-Second Rounds:</strong> Race against the countdown timer to reach each level’s target score.</li>
          <li><strong>+10 Points:</strong> Awarded for every correct color match.</li>
          <li><strong>Streak Bonuses:</strong> Every 5 consecutive correct answers triggers a massive <strong>+50 pts bonus</strong>!</li>
          <li><strong style={{ color: '#FF3366' }}>-2s Penalty:</strong> Mistaken taps deduct 2 seconds from your clock and reset your combo streak.</li>
        </ul>
      </section>

      {/* Section 3: What Skills the Game Challenges */}
      <section style={{
        background: 'rgba(20, 20, 36, 0.7)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '18px',
        padding: '18px',
        marginBottom: '16px'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} color="#FFE600" />
          What Skills Are Challenged?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.84rem' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <strong style={{ color: '#00E5FF' }}>👁️ Visual Recognition:</strong> Quickly separating text color from word morphology.
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <strong style={{ color: '#00FF88' }}>🧠 Selective Attention:</strong> Suppressing the brain’s automatic reading reflex.
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <strong style={{ color: '#FFE600' }}>⚡ Quick Decisions:</strong> Choosing accurately under high time pressure.
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <strong style={{ color: '#FF7700' }}>🎯 Motor Reaction Speed:</strong> Tapping targets before the countdown expires.
          </div>
        </div>
      </section>

      {/* Section 4: 50 Levels & Progression */}
      <section style={{
        background: 'rgba(20, 20, 36, 0.7)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '18px',
        padding: '18px',
        marginBottom: '16px'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#B026FF', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} color="#B026FF" />
          50 Progressive Levels
        </h2>
        <p style={{ fontSize: '0.88rem', color: '#CBD5E1', marginBottom: '10px' }}>
          The campaign spans 50 handcrafted stages. You start with 5 easily distinguishable primary colors on Level 1, gradually progressing to 30 subtle neon hues on Level 50.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.84rem', color: '#94A3B8' }}>
          <div>• <strong>Levels 1–16:</strong> 5 to 12 colors across distinct primary hue families.</div>
          <div>• <strong>Levels 17–34:</strong> 13 to 21 colors introducing neighboring shades (Red vs Coral, Cyan vs Blue).</div>
          <div>• <strong>Levels 35–50:</strong> 22 to 30 colors with subtle tints (Mint, Jade, Emerald, Amber, Canary).</div>
        </div>

        {onOpenLevelSelect && (
          <button
            onClick={() => {
              playTap();
              onOpenLevelSelect();
            }}
            style={{
              marginTop: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              color: '#00E5FF',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <span>View 50-Level Campaign Grid</span>
            <ArrowRight size={14} />
          </button>
        )}
      </section>

      {/* Section 5: Daily Challenge & Daily Streaks */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(255, 119, 0, 0.1) 0%, rgba(176, 38, 255, 0.1) 100%)',
        border: '1px solid rgba(255, 119, 0, 0.3)',
        borderRadius: '18px',
        padding: '18px',
        marginBottom: '18px'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FF7700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Flame size={18} color="#FF7700" />
          Daily Challenge & Streaks
        </h2>
        <p style={{ fontSize: '0.88rem', color: '#CBD5E1', marginBottom: '8px' }}>
          Every day at midnight, a new challenge is generated using a deterministic date seed. The challenge is identical for all players on that date.
        </p>
        <p style={{ fontSize: '0.88rem', color: '#CBD5E1', marginBottom: '10px' }}>
          Play consecutive calendar days to build your <strong>Daily Streak</strong>. You can replay the daily round as many times as you like to beat your high score.
        </p>

        {onStartDaily && (
          <button
            onClick={() => {
              playTap();
              onStartDaily();
            }}
            className="btn-secondary"
            style={{ width: '100%', borderColor: '#FF7700', color: '#FF7700', padding: '10px' }}
          >
            <Flame size={16} />
            <span>PLAY TODAY'S DAILY CHALLENGE</span>
          </button>
        )}
      </section>

      {/* Section 6: FAQ Accordion */}
      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HelpCircle size={18} color="#00E5FF" />
          Frequently Asked Questions
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                style={{
                  background: 'rgba(20, 20, 36, 0.75)',
                  border: isOpen ? '1px solid #00E5FF' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  transition: 'border-color 0.15s ease'
                }}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={isOpen}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    color: '#F0F4FF',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp size={18} color="#00E5FF" /> : <ChevronDown size={18} color="#8C94B2" />}
                </button>

                {isOpen && (
                  <div style={{
                    padding: '0 16px 14px 16px',
                    fontSize: '0.86rem',
                    color: '#94A3B8',
                    lineHeight: 1.5,
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Primary Call to Action */}
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <button
          onClick={() => {
            playTap();
            onPlayNow();
          }}
          className="btn-primary"
          style={{ width: '100%', fontSize: '1.25rem', padding: '18px 24px' }}
        >
          <Play size={22} fill="#FFFFFF" />
          <span>START PLAYING NOW</span>
        </button>
      </div>
    </article>
  );
};
