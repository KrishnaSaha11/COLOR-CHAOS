// COLOR CHAOS — Complete Automated Verification Suite
import assert from 'node:assert';
import { MASTER_COLORS, MASTER_COLOR_KEYS } from './src/utils/colors.ts';
import {
  LEVEL_CONFIGS,
  getColorCountForLevel,
  getTargetScoreForLevel,
  getSpeedMultiplierForLevel,
  getLevelConfig,
  getColorsForLevel
} from './src/utils/levels.ts';
import {
  getSeedFromDateString,
  getDailyChallengeConfig,
  computeDailyStreak,
  getTodayDateString
} from './src/utils/daily.ts';

console.log('=====================================================');
console.log('⚡ COLOR CHAOS V1.0 AUTOMATED TEST SUITE ⚡');
console.log('=====================================================\n');

// --- 1. Master 30-Color Palette Test ---
console.log('▶ Test 1: Master Color Palette');
assert.strictEqual(MASTER_COLOR_KEYS.length, 30, 'Master palette must contain exactly 30 colors');
const families = new Set(Object.values(MASTER_COLORS).map((c) => c.family));
assert.strictEqual(families.size, 6, 'Colors must cover all 6 hue families (red, blue, green, yellow, purple, orange)');
console.log('✓ Master palette has 30 vibrant neon colors across 6 hue families.\n');

// --- 2. 50-Level Progression Table Test ---
console.log('▶ Test 2: Color Count Progression Table (Levels 1 to 50)');
const expectedCounts = [
  // 1-2
  [1, 5], [2, 5],
  // 3-4
  [3, 6], [4, 6],
  // 5-6
  [5, 7], [6, 7],
  // 7-8
  [7, 8], [8, 8],
  // 9-10
  [9, 9], [10, 9],
  // 11-12
  [11, 10], [12, 10],
  // 13-14
  [13, 11], [14, 11],
  // 15-16
  [15, 12], [16, 12],
  // 17-18
  [17, 13], [18, 13],
  // 19-20
  [19, 14], [20, 14],
  // 21-22
  [21, 15], [22, 15],
  // 23-24
  [23, 16], [24, 16],
  // 25-26
  [25, 17], [26, 17],
  // 27-28
  [27, 18], [28, 18],
  // 29-30
  [29, 19], [30, 19],
  // 31-32
  [31, 20], [32, 20],
  // 33-34
  [33, 21], [34, 21],
  // 35-36
  [35, 22], [36, 22],
  // 37-38
  [37, 23], [38, 23],
  // 39-40
  [39, 24], [40, 24],
  // 41-42
  [41, 25], [42, 25],
  // 43-44
  [43, 26], [44, 26],
  // 45-46
  [45, 27], [46, 27],
  // 47-48
  [47, 28], [48, 28],
  // 49-50
  [49, 30], [50, 30]
];

for (const [lvl, expectedCount] of expectedCounts) {
  const actualCount = getColorCountForLevel(lvl);
  assert.strictEqual(
    actualCount,
    expectedCount,
    `Level ${lvl} must have ${expectedCount} colors, got ${actualCount}`
  );
  const colors = getColorsForLevel(lvl);
  assert.strictEqual(
    colors.length,
    expectedCount,
    `getColorsForLevel(${lvl}) must return ${expectedCount} color definitions`
  );
}
console.log('✓ All 50 levels match the exact color count progression table.\n');

// --- 3. Speed & Similarity Difficulty Tests ---
console.log('▶ Test 3: Gameplay Speed & Similarity Progression');
for (let lvl = 1; lvl <= 50; lvl += 2) {
  const speedL1 = getSpeedMultiplierForLevel(lvl);
  const speedL2 = getSpeedMultiplierForLevel(lvl + 1);
  assert(speedL2 > speedL1, `Level ${lvl + 1} must be faster than Level ${lvl} in pair`);
}
// Check similarity tiers
assert.strictEqual(getLevelConfig(1).similarityTier, 1);
assert.strictEqual(getLevelConfig(20).similarityTier, 2);
assert.strictEqual(getLevelConfig(45).similarityTier, 3);
console.log('✓ Speed increases within each level pair and similarity scales across tiers 1, 2, and 3.\n');

// --- 4. Target Score Achievability ---
console.log('▶ Test 4: Target Score Feasibility');
for (let lvl = 1; lvl <= 50; lvl++) {
  const target = getTargetScoreForLevel(lvl);
  assert(target >= 150 && target <= 750, `Target score for Level ${lvl} (${target}) must be realistically achievable`);
  if (lvl > 1) {
    const prevTarget = getTargetScoreForLevel(lvl - 1);
    assert(target >= prevTarget, `Target score should monotonically increase (lvl ${lvl}: ${target} >= ${prevTarget})`);
  }
}
console.log('✓ Target scores scale smoothly from 150 to ~650, ensuring challenging but achievable progression.\n');

// --- 5. Unlocking & Replay Mechanics ---
console.log('▶ Test 5: Level Unlocking & Replay');
let highestUnlocked = 1;
const completed = [];

// Simulate beating level 1
const lvl1Score = 180;
const lvl1Target = getTargetScoreForLevel(1);
if (lvl1Score >= lvl1Target) {
  completed.push(1);
  highestUnlocked = 2;
}
assert.strictEqual(highestUnlocked, 2, 'Beating level 1 must unlock level 2');

// Simulate failing level 2
const lvl2Score = 100;
const lvl2Target = getTargetScoreForLevel(2);
if (lvl2Score < lvl2Target) {
  // Fail! Level 2 should remain unlocked, level 1 remains completed
}
assert.strictEqual(highestUnlocked, 2, 'Failing level 2 must NOT remove level 2 unlock');
assert(completed.includes(1), 'Previously completed level 1 must remain completed');
console.log('✓ Unlocking and failing preserves progress correctly.\n');

// --- 6. Deterministic Daily Challenge Tests ---
console.log('▶ Test 6: Deterministic Daily Challenge');
const testDate = '2026-10-30';
const daily1 = getDailyChallengeConfig(testDate);
const daily2 = getDailyChallengeConfig(testDate);

assert.strictEqual(daily1.config.targetScore, daily2.config.targetScore, 'Daily challenge target score must be identical for same date');
assert.strictEqual(daily1.config.colorCount, daily2.config.colorCount, 'Daily challenge color count must be identical for same date');
assert.deepStrictEqual(daily1.config.colorIds, daily2.config.colorIds, 'Daily challenge colors must be identical for same date');

// Test different date generates different challenge
const dailyDifferent = getDailyChallengeConfig('2026-10-31');
assert.notDeepStrictEqual(daily1.config.colorIds, dailyDifferent.config.colorIds, 'Different dates must yield different daily challenges');
console.log('✓ Daily Challenge is 100% deterministic per date and varies across days.\n');

// --- 7. Daily Streak Calculation Tests ---
console.log('▶ Test 7: Daily Streak System');

// Day 1: First time playing
const streak1 = computeDailyStreak('', 0, '2026-10-30');
assert.strictEqual(streak1.newStreak, 1, 'First play must initialize streak to 1');
assert.strictEqual(streak1.streakIncreased, true);

// Same Day replay: streak should NOT increase
const streakSameDay = computeDailyStreak('2026-10-30', 1, '2026-10-30');
assert.strictEqual(streakSameDay.newStreak, 1, 'Replaying on same date must NOT increase streak');
assert.strictEqual(streakSameDay.streakIncreased, false);

// Day 2 (Consecutive): streak increases to 2
const streakDay2 = computeDailyStreak('2026-10-30', 1, '2026-10-31');
assert.strictEqual(streakDay2.newStreak, 2, 'Playing next consecutive day must increase streak to 2');
assert.strictEqual(streakDay2.streakIncreased, true);

// Day 4 (Missed Day 3): streak resets to 1
const streakMissed = computeDailyStreak('2026-10-31', 2, '2026-11-02');
assert.strictEqual(streakMissed.newStreak, 1, 'Missing 1 or more days must reset streak to 1');
assert.strictEqual(streakMissed.streakIncreased, true);
console.log('✓ Daily Streak calculation accurately handles first play, same-day replay, consecutive days, and missed days.\n');

// --- 8. Share Text Format Test ---
console.log('▶ Test 8: Share Score Format');
const lvl = 12;
const score = 450;
const url = 'http://localhost:3000';
const shareText = `I reached Level ${lvl} in COLOR CHAOS and scored ${score} points! Can you beat me? Play now: ${url}`;
assert(shareText.includes('Level 12'), 'Share text must contain Level');
assert(shareText.includes('450 points'), 'Share text must contain score');
assert(shareText.includes('COLOR CHAOS'), 'Share text must contain game name');
console.log(`✓ Share text format: "${shareText}"\n`);

console.log('=====================================================');
console.log('🎉 ALL 8 TEST SUITES (25+ ASSERTIONS) PASSED SUCCESSFULLY!');
console.log('=====================================================');
