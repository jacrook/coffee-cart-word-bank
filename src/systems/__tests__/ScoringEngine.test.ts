import { describe, it, expect, beforeEach } from 'vitest';
import { ScoringEngine } from '../ScoringEngine';
import type { DifficultyTier } from '../../types';

describe('ScoringEngine', () => {
  let engine: ScoringEngine;

  beforeEach(() => {
    engine = new ScoringEngine();
  });

  describe('initial state', () => {
    it('starts with zero score, streak, drinks, and mistakes', () => {
      expect(engine.getScore()).toBe(0);
      expect(engine.getStreak()).toBe(0);
      expect(engine.getDrinksCompleted()).toBe(0);
      expect(engine.getTotalMistakes()).toBe(0);
    });
  });

  describe('recordDrink', () => {
    it('awards 105 points for a perfect rookie drink (100 + streak bonus)', () => {
      const points = engine.recordDrink(0, 45000, 'rookie', true);

      expect(points).toBe(105);
      expect(engine.getScore()).toBe(105);
      expect(engine.getStreak()).toBe(1);
      expect(engine.getDrinksCompleted()).toBe(1);
      expect(engine.getTotalMistakes()).toBe(0);
    });

    it('does not apply mistake penalties on rookie tier', () => {
      const points = engine.recordDrink(3, 45000, 'rookie', false);

      // max(20, 100 - 45) = 55, no penalizeWrong deduction
      expect(points).toBe(55);
      expect(engine.getStreak()).toBe(0);
      expect(engine.getTotalMistakes()).toBe(3);
    });

    it('applies mistake penalties on shift_lead tier', () => {
      const points = engine.recordDrink(2, 45000, 'shift_lead', false);

      // max(20, 70) - 20 = 50
      expect(points).toBe(50);
      expect(engine.getStreak()).toBe(0);
      expect(engine.getTotalMistakes()).toBe(2);
    });

    it('floors drink score at zero on shift_lead with many mistakes', () => {
      const points = engine.recordDrink(6, 45000, 'shift_lead', false);

      expect(points).toBe(0);
      expect(engine.getScore()).toBe(0);
    });

    it('adds timed speed bonus on master tier when under 30 seconds', () => {
      const points = engine.recordDrink(0, 25000, 'master', true);

      // 100 + 25 timed + 5 streak = 130
      expect(points).toBe(130);
      expect(engine.getScore()).toBe(130);
    });

    it('does not add timed bonus on master when over 30 seconds', () => {
      const points = engine.recordDrink(0, 35000, 'master', true);

      // 100 + 5 streak = 105
      expect(points).toBe(105);
    });

    it('accumulates streak bonus across consecutive perfect drinks', () => {
      engine.recordDrink(0, 45000, 'shift_lead', true);
      const secondPoints = engine.recordDrink(0, 45000, 'shift_lead', true);

      // 100 + streak(2) * 5 = 110
      expect(secondPoints).toBe(110);
      expect(engine.getStreak()).toBe(2);
      expect(engine.getScore()).toBe(215);
    });

    it('resets streak after a non-perfect drink', () => {
      engine.recordDrink(0, 45000, 'shift_lead', true);
      engine.recordDrink(1, 45000, 'shift_lead', false);
      const thirdPoints = engine.recordDrink(0, 45000, 'shift_lead', true);

      expect(engine.getStreak()).toBe(1);
      expect(thirdPoints).toBe(105);
    });

    it('tracks cumulative drinks and mistakes across tiers', () => {
      engine.recordDrink(1, 10000, 'rookie', false);
      engine.recordDrink(2, 20000, 'shift_lead', false);
      engine.recordDrink(0, 15000, 'master', true);

      expect(engine.getDrinksCompleted()).toBe(3);
      expect(engine.getTotalMistakes()).toBe(3);
    });
  });

  describe('penalize', () => {
    it('returns 0 and does not change score on rookie tier', () => {
      engine.recordDrink(0, 10000, 'rookie', true);
      const penalty = engine.penalize('rookie');

      expect(penalty).toBe(0);
      expect(engine.getScore()).toBe(105);
    });

    it('deducts 5 points on shift_lead tier', () => {
      engine.recordDrink(0, 10000, 'shift_lead', true);
      const penalty = engine.penalize('shift_lead');

      expect(penalty).toBe(5);
      expect(engine.getScore()).toBe(100);
    });

    it('deducts 5 points on master tier', () => {
      // Use >30s elapsed to avoid timed speed bonus affecting baseline score
      engine.recordDrink(0, 35000, 'master', true);
      const penalty = engine.penalize('master');

      expect(penalty).toBe(5);
      expect(engine.getScore()).toBe(100);
    });

    it('never allows score to drop below zero', () => {
      engine.penalize('shift_lead');
      engine.penalize('shift_lead');

      expect(engine.getScore()).toBe(0);
    });
  });

  describe('reset', () => {
    it('clears all tracked stats', () => {
      engine.recordDrink(2, 10000, 'shift_lead', false);
      engine.penalize('shift_lead');

      engine.reset();

      expect(engine.getScore()).toBe(0);
      expect(engine.getStreak()).toBe(0);
      expect(engine.getDrinksCompleted()).toBe(0);
      expect(engine.getTotalMistakes()).toBe(0);
    });
  });

  describe('difficulty tier integration', () => {
    const tiers: DifficultyTier[] = ['rookie', 'shift_lead', 'master'];

    it.each(tiers)('records a drink for %s tier without error', (tier) => {
      const points = engine.recordDrink(0, 20000, tier, true);
      expect(points).toBeGreaterThan(0);
      expect(engine.getDrinksCompleted()).toBe(1);
    });
  });
});