# COLOR CHAOS ⚡️

> **"Trust your eyes. Beat the chaos."**

A fast-paced, addictive, mobile-first neon arcade color reaction browser game based on the cognitive **Stroop Effect**.

Play 50 progressive levels, tackle the daily seeded challenge, build your consecutive streak, and challenge your attention and reaction speed!

---

## 🎮 Gameplay & Rules

The player sees a color word displayed in ink of a different color (e.g., the word **RED** printed in **GREEN** text).
- **Core Rule:** Tap the button matching the **ink color** (Green), NOT the word meaning (Red)!
- **Round Duration:** 30 seconds.
- **Scoring:**
  - `+10` points for each correct match.
  - Correct answers build up your **Streak** multiplier.
  - **Streak Milestone Bonus:** Every 5 consecutive correct answers awards a celebratory bonus (`+50 pts`).
- **Time Penalty:** Incorrect taps trigger an error shake and deduct **2 seconds** from the clock!

---

## 🌟 Key Features

1. **50 Progressive Levels:**
   - Color count scales from 5 primary colors on Level 1 up to 30 subtle neon hues on Level 50.
   - Pacing increases smoothly across level pairs.
   - 3 Similarity Tiers (Primary hues -> Neighboring family shades -> Subtle cousin tints).
   - Replay any previously unlocked level anytime.
2. **Deterministic Daily Challenge:**
   - Seeded by the calendar date (`YYYY-MM-DD`). Every player worldwide receives the exact same challenge configuration on that day.
   - Replay allowed to beat your daily best score.
   - Live midnight countdown clock.
3. **Daily Streak Tracking:**
   - Consecutive day plays increase your Daily Streak.
   - Tracks current and longest daily streak.
4. **Rich About & Game Guide:**
   - In-depth guide explaining the cognitive science behind the Stroop effect.
   - Comprehensive FAQ section for players and search engines.
5. **Full SEO & Social Sharing:**
   - Open Graph and Twitter/X metadata with custom 1200x630 social card.
   - Schema.org `VideoGame`, `WebApplication`, and `FAQPage` JSON-LD structured data.
   - `sitemap.xml` and `robots.txt`.
6. **Mobile-First & Accessible:**
   - Responsive touch grid supporting 5 to 30 buttons without horizontal overflow.
   - Keyboard accessibility (Number keys `1`–`9` trigger color choices, `Escape` returns home).
   - `prefers-reduced-motion` compliance for users sensitive to motion.
   - Procedural Web Audio API sound generator (0 asset weight, zero latency).
   - `localStorage` automated progress saving.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:3000` in your browser.

### Production Build & Test

```bash
# Run unit & progression test suite
npx tsx test-runner.js

# Build production bundle
npm run build
```

---

## ☁️ Deployment on Vercel

1. Push your repository to GitHub: `https://github.com/KrishnaSaha11/COLOR-CHAOS`.
2. Go to [Vercel Dashboard](https://vercel.com/) and click **Add New Project**.
3. Import your `COLOR-CHAOS` repository.
4. Framework Preset: **Vite** (auto-detected).
5. Click **Deploy**.
