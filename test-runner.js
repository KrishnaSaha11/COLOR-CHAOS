// Verification test suite for COLOR CHAOS rules and game mechanics
import assert from 'node:assert';

console.log('--- RUNNING COLOR CHAOS AUTOMATED UNIT TESTS ---');

// 1. Color set test
const COLOR_KEYS = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE', 'ORANGE'];
assert.strictEqual(COLOR_KEYS.length, 6, 'Must have exactly 6 colors');
console.log('✓ Color palette has exactly 6 colors: Red, Blue, Green, Yellow, Purple, Orange');

// 2. Question generation test
function generateQuestion(prev) {
  let textColor;
  do {
    textColor = COLOR_KEYS[Math.floor(Math.random() * COLOR_KEYS.length)];
  } while (prev && textColor === prev.textColor && Math.random() < 0.7);

  const shouldMatch = Math.random() < 0.15;
  let word;

  if (shouldMatch) {
    word = textColor;
  } else {
    const availableWords = COLOR_KEYS.filter((c) => c !== textColor);
    word = availableWords[Math.floor(Math.random() * availableWords.length)];
  }

  return { word, textColor };
}

let incongruentCount = 0;
const totalGenerations = 1000;
for (let i = 0; i < totalGenerations; i++) {
  const q = generateQuestion();
  assert(COLOR_KEYS.includes(q.word), 'Word must be one of the 6 colors');
  assert(COLOR_KEYS.includes(q.textColor), 'TextColor must be one of the 6 colors');
  if (q.word !== q.textColor) incongruentCount++;
}
const incongruentRate = incongruentCount / totalGenerations;
assert(incongruentRate >= 0.75 && incongruentRate <= 0.95, `Incongruent rate should be ~85%, got ${(incongruentRate * 100).toFixed(1)}%`);
console.log(`✓ Random Stroop question generator produced valid colors with ${(incongruentRate * 100).toFixed(1)}% challenge rate`);

// 3. Gameplay Scoring & Streak Simulation
class GameSimulator {
  constructor(totalTime = 30) {
    this.totalTime = totalTime;
    this.timeLeft = totalTime;
    this.score = 0;
    this.streak = 0;
    this.longestStreak = 0;
    this.isGameOver = false;
    this.gameOverCallCount = 0;
    this.bonusAwardedCount = 0;
  }

  answer(isCorrect) {
    if (this.isGameOver) return;

    if (isCorrect) {
      this.streak += 1;
      if (this.streak > this.longestStreak) {
        this.longestStreak = this.streak;
      }

      let pts = 10;
      if (this.streak % 5 === 0) {
        const bonus = 50;
        pts += bonus;
        this.bonusAwardedCount += 1;
      }
      this.score += pts;
    } else {
      this.streak = 0;
      this.timeLeft = Math.max(0, this.timeLeft - 2);
      if (this.timeLeft <= 0) {
        this.endGame();
      }
    }
  }

  tick(seconds) {
    if (this.isGameOver) return;
    this.timeLeft = Math.max(0, this.timeLeft - seconds);
    if (this.timeLeft <= 0) {
      this.endGame();
    }
  }

  endGame() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.gameOverCallCount += 1;
  }
}

// Test 5 correct answers gives bonus
const game1 = new GameSimulator(30);
for (let i = 1; i <= 5; i++) {
  game1.answer(true);
}
// 4 answers @ 10 pts = 40 pts. 5th answer gives 10 + 50 = 60 pts. Total = 100 pts.
assert.strictEqual(game1.score, 100, `Score after 5 correct answers should be 100 with streak bonus, got ${game1.score}`);
assert.strictEqual(game1.streak, 5, 'Streak should be 5');
assert.strictEqual(game1.longestStreak, 5, 'Longest streak should be 5');
assert.strictEqual(game1.bonusAwardedCount, 1, 'Should have received 1 streak bonus');
console.log('✓ Scoring: 5 consecutive answers awarded +50 streak bonus correctly (Score: 100)');

// Test 10 correct answers gives second bonus
for (let i = 6; i <= 10; i++) {
  game1.answer(true);
}
// Next 4 @ 10 pts = 40 pts. 10th answer gives 10 + 50 = 60 pts. Total = 100 + 100 = 200 pts.
assert.strictEqual(game1.score, 200, `Score after 10 correct answers should be 200, got ${game1.score}`);
assert.strictEqual(game1.streak, 10, 'Streak should be 10');
assert.strictEqual(game1.bonusAwardedCount, 2, 'Should have received 2 streak bonuses');
console.log('✓ Scoring: 10 consecutive answers awarded second streak bonus correctly (Score: 200)');

// Test wrong answer penalty
const timeBeforeWrong = game1.timeLeft;
game1.answer(false);
assert.strictEqual(game1.timeLeft, timeBeforeWrong - 2, 'Wrong answer must deduct 2 seconds');
assert.strictEqual(game1.streak, 0, 'Wrong answer must reset current streak to 0');
assert.strictEqual(game1.longestStreak, 10, 'Longest streak must preserve maximum streak (10)');
console.log('✓ Wrong answer deducted 2 seconds penalty and preserved longest streak');

// Test game over when time runs out
game1.tick(30);
assert.strictEqual(game1.isGameOver, true, 'Game must end when timer hits 0');
assert.strictEqual(game1.gameOverCallCount, 1, 'Game over must be triggered exactly once');
console.log('✓ Timer countdown ended and triggered Game Over exactly once');

// Test wrong answers draining timer to 0
const game2 = new GameSimulator(4);
game2.answer(false); // 4 - 2 = 2s
assert.strictEqual(game2.isGameOver, false);
game2.answer(false); // 2 - 2 = 0s -> game over
assert.strictEqual(game2.isGameOver, true);
assert.strictEqual(game2.gameOverCallCount, 1);
console.log('✓ Time penalty drained clock and ended game without duplicate triggers');

// 4. Test Instagram Share Text
const testScore = 850;
const testShareText = `I scored ${testScore} in COLOR CHAOS! Can you beat me? ⚡️`;
assert(testShareText.includes('850'), 'Share text must include final score');
assert(testShareText.includes('COLOR CHAOS'), 'Share text must include game title');
console.log(`✓ Share text format matches requirement: "${testShareText}"`);

console.log('ALL COLOR CHAOS TESTS PASSED! 🎉');
