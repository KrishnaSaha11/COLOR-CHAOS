# COLOR CHAOS ⚡️

> **"Trust your eyes. Beat the chaos."**

A fast-paced, addictive, mobile-first neon arcade color reaction browser game based on the cognitive **Stroop Effect**. Designed specifically for Instagram Reels, TikTok showcases, and viral mobile gameplay.

---

## 🎮 Gameplay & Rules

The player sees a color word displayed in ink of a different color (e.g., the word **RED** printed in **GREEN** text).
- **Goal:** Tap the **text color** (GREEN), not the word meaning (RED), as quickly as possible!
- **Round Duration:** 30 seconds.
- **Scoring:**
  - `+10` points for each correct match.
  - Correct answers build up a **Streak**.
  - **Streak Bonus:** Every 5 consecutive correct answers awards a celebratory bonus (`+50 pts`).
- **Time Penalty:** Incorrect taps trigger an error shake and deduct **2 seconds** from the clock!
- **Color Palette (6 Colors):**
  - 🔴 **Red** (`#FF3366`)
  - 🔵 **Blue** (`#00E5FF`)
  - 🟢 **Green** (`#00FF88`)
  - 🟡 **Yellow** (`#FFE600`)
  - 🟣 **Purple** (`#B026FF`)
  - 🟠 **Orange** (`#FF7700`)

---

## ✨ Features

- **Neon Arcade Visuals:** Dark obsidian backdrop (`#070710`) with radial neon mesh glows, glowing glassmorphic HUD, pop animations, and floating score notifications (`+10`, `+50 BONUS`, `-2s`).
- **Web Audio API Procedural Audio:** Zero sound asset dependencies! Dynamic rising chimes as your streak climbs, arcade arpeggios for streak milestones, error buzzers, and celebratory fanfare for new high scores. Includes a mute toggle button.
- **Mobile-First Ergonomics:**
  - 2×3 thumb-friendly color button layout with >48px touch targets.
  - Safe-area insets support (`env(safe-area-inset-*)`).
  - `touch-action: manipulation; user-select: none;` prevents unwanted zooming and text selection during fast tapping.
  - Haptic feedback support (`navigator.vibrate`) on supported mobile devices.
- **High Scores:** Best score and longest streak automatically saved in `localStorage`.
- **Instagram Score Sharing:** One-tap `SHARE SCORE` button using the native Web Share API with an automatic fallback that copies the score message and game link to clipboard.
- **Celebratory Confetti:** Multi-colored neon particle explosion on new personal records.

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

Visit `http://localhost:3000` in your browser.

### Production Build

```bash
npm run build
```

The output will be in the `dist/` directory.

---

## ☁️ Deployment to Vercel

This project is built with React + Vite + TypeScript and requires no backend, database, or API keys.

### Deploy via Vercel CLI
```bash
npm install -g vercel
vercel
```

### Deploy via GitHub
1. Push this folder to a GitHub repository.
2. In the [Vercel Dashboard](https://vercel.com), click **Add New Project**.
3. Import your GitHub repository.
4. Framework Preset: **Vite** (auto-detected).
5. Click **Deploy**.
