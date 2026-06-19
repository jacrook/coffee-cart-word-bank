import type { DifficultyTier } from '../types';
import { WordBankGenerator } from './WordBankGenerator';

export class ScoringEngine {
  private score = 0;
  private streak = 0;
  private drinksCompleted = 0;
  private totalMistakes = 0;
  private generator = new WordBankGenerator();

  getScore(): number {
    return this.score;
  }

  getStreak(): number {
    return this.streak;
  }

  getDrinksCompleted(): number {
    return this.drinksCompleted;
  }

  getTotalMistakes(): number {
    return this.totalMistakes;
  }

  recordDrink(mistakes: number, timeElapsedMs: number, tier: DifficultyTier, perfect: boolean): number {
    const config = this.generator.getDifficulty(tier);
    this.drinksCompleted++;
    this.totalMistakes += mistakes;

    let points = perfect ? 100 : Math.max(20, 100 - mistakes * 15);

    if (config.penalizeWrong) {
      points -= mistakes * 10;
    }

    if (config.timed && timeElapsedMs < 30000) {
      points += 25;
    }

    if (perfect) {
      this.streak++;
      points += this.streak * 5;
    } else {
      this.streak = 0;
    }

    points = Math.max(0, points);
    this.score += points;
    return points;
  }

  penalize(tier: DifficultyTier): number {
    const config = this.generator.getDifficulty(tier);
    if (!config.penalizeWrong) return 0;
    this.score = Math.max(0, this.score - 5);
    return 5;
  }

  reset(): void {
    this.score = 0;
    this.streak = 0;
    this.drinksCompleted = 0;
    this.totalMistakes = 0;
  }
}