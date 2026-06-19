import { describe, it, expect } from 'vitest';
import {
  getMenuDrinks,
  getPracticeOptions,
  validateMenuCoverage,
  getAllTokenIds,
} from '../../utils/menu';
import { SequenceEngine } from '../SequenceEngine';

const FULL_MENU = [
  'espresso',
  'macchiato',
  'cortado',
  'cappuccino',
  'latte',
  'cafe_con_leche',
  'zemi_americano',
  'cold_brew',
  'apple_cider',
  'coquito_latte',
  'mocha',
  'peppermint_mocha',
  'hot_chocolate',
  'chai_latte',
  'dirty_chai',
];

describe('menu coverage', () => {
  it('includes all 15 Zemi menu drinks', () => {
    const ids = getMenuDrinks().map((d) => d.id);
    FULL_MENU.forEach((id) => {
      expect(ids).toContain(id);
    });
    expect(ids.length).toBe(15);
  });

  it('has every recipe token available in the word bank', () => {
    const { missingDrinks, missingTokens } = validateMenuCoverage();
    expect(missingDrinks).toEqual([]);
    expect(missingTokens).toEqual([]);
  });

  it('exposes a practice option for every drink size variant', () => {
    const drinks = getMenuDrinks();
    const options = getPracticeOptions();
    let expectedCount = 0;
    drinks.forEach((d) => {
      expectedCount += Object.keys(d.sizes).length;
    });
    expect(options.length).toBe(expectedCount);
    expect(options.length).toBeGreaterThanOrEqual(24);
  });

  it('can start and complete every menu drink sequence', () => {
    const engine = new SequenceEngine();
    const tokenIds = getAllTokenIds();

    getMenuDrinks().forEach((drink) => {
      Object.entries(drink.sizes).forEach(([size, entry]) => {
        expect(engine.startOrder(drink.id, size)).toBe(true);
        entry.sequence.forEach((tokenId) => {
          expect(tokenIds.has(tokenId)).toBe(true);
          const result = engine.placeToken(tokenId);
          expect(result.correct).toBe(true);
        });
        expect(engine.isComplete()).toBe(true);
        engine.reset();
      });
    });
  });
});