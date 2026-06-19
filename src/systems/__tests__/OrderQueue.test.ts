import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OrderQueue } from '../OrderQueue';

describe('OrderQueue', () => {
  let queue: OrderQueue;

  beforeEach(() => {
    queue = new OrderQueue();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('master tier', () => {
    it('generates exactly 3 specific drinks in fixed order', () => {
      const orders = queue.generateQueue('master');

      expect(orders).toHaveLength(3);
      expect(orders[0]).toMatchObject({
        id: 1,
        drinkId: 'latte',
        size: '12oz',
        displayName: '12oz Latte',
      });
      expect(orders[1]).toMatchObject({
        id: 2,
        drinkId: 'zemi_americano',
        size: '16oz',
        displayName: '16oz Zemi Americano',
      });
      expect(orders[2]).toMatchObject({
        id: 3,
        drinkId: 'macchiato',
        size: '8oz',
        displayName: '8oz Macchiato',
      });
    });

    it('resets queue ids when regenerated', () => {
      queue.generateQueue('master');
      const secondRun = queue.generateQueue('master');

      expect(secondRun[0].id).toBe(1);
      expect(secondRun[2].id).toBe(3);
    });
  });

  describe('rookie tier', () => {
    it('generates a single random order', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0);

      const orders = queue.generateQueue('rookie');

      expect(orders).toHaveLength(1);
      expect(orders[0].id).toBe(1);
      expect(orders[0].drinkId).toBeTruthy();
      expect(orders[0].size).toBeTruthy();
      expect(orders[0].displayName).toBeTruthy();
    });
  });

  describe('shift_lead tier', () => {
    it('generates a single random order', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);

      const orders = queue.generateQueue('shift_lead');

      expect(orders).toHaveLength(1);
      expect(orders[0].id).toBe(1);
    });
  });

  describe('getQueue', () => {
    it('returns a copy of the internal queue', () => {
      const generated = queue.generateQueue('master');
      const retrieved = queue.getQueue();

      expect(retrieved).toEqual(generated);
      expect(retrieved).not.toBe(generated);

      retrieved.push({
        id: 99,
        drinkId: 'latte',
        size: '12oz',
        displayName: 'Mutated',
      });

      expect(queue.getQueue()).toHaveLength(3);
    });
  });
});