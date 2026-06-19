import { describe, it, expect, beforeEach } from 'vitest';
import { SequenceEngine } from '../SequenceEngine';

describe('SequenceEngine', () => {
  let engine: SequenceEngine;

  beforeEach(() => {
    engine = new SequenceEngine();
  });

  it('starts a 12oz latte order with the correct expected sequence', () => {
    const started = engine.startOrder('latte', '12oz');
    expect(started).toBe(true);
    expect(engine.getExpectedSequence()).toEqual([
      'cup_12oz',
      'double_espresso_shot',
      'steam_milk',
      'microfoam',
      'serve',
    ]);
  });

  it('accepts correct tokens in order for a latte', () => {
    engine.startOrder('latte', '12oz');

    const steps = [
      'cup_12oz',
      'double_espresso_shot',
      'steam_milk',
      'microfoam',
      'serve',
    ];

    steps.forEach((tokenId, index) => {
      const result = engine.placeToken(tokenId);
      expect(result.correct).toBe(true);
      if (index < steps.length - 1) {
        expect(result.isComplete).toBe(false);
      } else {
        expect(result.isComplete).toBe(true);
      }
    });
  });

  it('rejects wrong tokens and tracks mistakes', () => {
    engine.startOrder('latte', '12oz');

    const wrong = engine.placeToken('foam');
    expect(wrong.correct).toBe(false);
    expect(wrong.isComplete).toBe(false);
    expect(engine.getMistakes()).toBe(1);

    const right = engine.placeToken('cup_12oz');
    expect(right.correct).toBe(true);
  });

  it('validates coquito latte sequence', () => {
    engine.startOrder('coquito_latte', '12oz');

    const sequence = [
      'cup_12oz',
      'ice',
      'coquito_mix',
      'espresso_shot',
      'oat_milk',
      'cinnamon',
      'serve',
    ];

    sequence.forEach((tokenId) => {
      const result = engine.placeToken(tokenId);
      expect(result.correct).toBe(true);
    });

    expect(engine.isComplete()).toBe(true);
  });

  it('returns false when starting unknown drink', () => {
    expect(engine.startOrder('unknown_drink', '12oz')).toBe(false);
  });

  it('undoes the last placed token', () => {
    engine.startOrder('latte', '12oz');
    engine.placeToken('cup_12oz');
    engine.placeToken('double_espresso_shot');

    const undo = engine.undoLastToken();
    expect(undo.success).toBe(true);
    expect(undo.removedTokenId).toBe('double_espresso_shot');
    expect(engine.getBuiltSequence()).toEqual(['cup_12oz']);
    expect(engine.getStepIndex()).toBe(1);
  });

  it('returns failure when undoing with empty sequence', () => {
    engine.startOrder('latte', '12oz');
    const undo = engine.undoLastToken();
    expect(undo.success).toBe(false);
  });

  it('clears built sequence without resetting mistakes or expected order', () => {
    engine.startOrder('latte', '12oz');
    engine.placeToken('cup_12oz');
    engine.placeToken('foam');

    engine.clearBuiltSequence();

    expect(engine.getBuiltSequence()).toEqual([]);
    expect(engine.getStepIndex()).toBe(0);
    expect(engine.getMistakes()).toBe(1);
    expect(engine.getExpectedSequence()).toEqual([
      'cup_12oz',
      'double_espresso_shot',
      'steam_milk',
      'microfoam',
      'serve',
    ]);
  });

  it('reports step progress', () => {
    engine.startOrder('latte', '12oz');
    expect(engine.getTotalSteps()).toBe(5);
    expect(engine.getStepIndex()).toBe(0);

    engine.placeToken('cup_12oz');
    expect(engine.getStepIndex()).toBe(1);
  });
});