import { describe, it, expect } from 'vitest';
import wordBankData from '../../data/wordBank.json';
import { WordBankGenerator } from '../WordBankGenerator';
import type { DifficultyTier } from '../../types';

const ALL_STATION_TOKENS = wordBankData.tokens;
const CUP_IDS = ['cup_8oz', 'cup_12oz', 'cup_16oz', 'demitasse'];

describe('WordBankGenerator', () => {
  const generator = new WordBankGenerator();

  const LATTE_SEQUENCE = [
    'cup_12oz',
    'double_espresso_shot',
    'steam_milk',
    'microfoam',
    'serve',
  ];

  const COQUITO_SEQUENCE = [
    'cup_12oz',
    'ice',
    'coquito_mix',
    'espresso_shot',
    'oat_milk',
    'cinnamon',
    'serve',
  ];

  it('includes all required recipe tokens in the bank', () => {
    const sequence = [
      'cup_12oz',
      'double_espresso_shot',
      'steam_milk',
      'microfoam',
      'serve',
    ];

    const bank = generator.generate(sequence, 'shift_lead');
    const bankIds = bank.map((t) => t.id);

    sequence.forEach((id) => {
      expect(bankIds).toContain(id);
    });
  });

  it('limits rookie bank size and uses ingredient distractors', () => {
    const sequence = ['cup_12oz', 'double_espresso_shot', 'steam_milk', 'microfoam', 'serve'];
    const bank = generator.generate(sequence, 'rookie');

    expect(bank.length).toBe(10);
    CUP_IDS.forEach((id) => {
      expect(bank.map((t) => t.id)).toContain(id);
    });
    const distractors = bank.filter((t) => !sequence.includes(t.id) && !CUP_IDS.includes(t.id));
    distractors.forEach((token) => {
      expect(token.category).toBe('ingredient');
    });
  });

  it('returns the full station inventory for shift_lead', () => {
    const sequence = ['cup_12oz', 'double_espresso_shot', 'steam_milk', 'microfoam', 'serve'];
    const bank = generator.generate(sequence, 'shift_lead');

    expect(bank.length).toBe(ALL_STATION_TOKENS.length);
    const bankIds = new Set(bank.map((t) => t.id));
    ALL_STATION_TOKENS.forEach((token) => {
      expect(bankIds).toContain(token.id);
    });
  });

  it('includes plausible tokens in the full shift_lead inventory', () => {
    const sequence = ['cup_12oz', 'double_espresso_shot', 'steam_milk', 'microfoam', 'serve'];
    const bank = generator.generate(sequence, 'shift_lead');
    const bankIds = bank.map((t) => t.id);

    expect(bankIds).toContain('foam');
    expect(bankIds).toContain('espresso_shot');
    expect(bankIds).toContain('cup_8oz');
  });

  describe('difficulty tier configuration', () => {
    it('exposes rookie config with ingredient-only categories and bank size 10', () => {
      const config = generator.getDifficulty('rookie');

      expect(config.label).toBe('Rookie Barista');
      expect(config.bankSize).toBe(10);
      expect(config.categories).toEqual(['ingredient']);
      expect(config.penalizeWrong).toBe(false);
      expect(config.timed).toBe(false);
      expect(config.queueSize).toBe(1);
    });

    it('exposes shift_lead config with full categories and bank size 30', () => {
      const config = generator.getDifficulty('shift_lead');

      expect(config.label).toBe('Shift Lead');
      expect(config.bankSize).toBe(30);
      expect(config.categories).toEqual(['ingredient', 'action', 'equipment']);
      expect(config.penalizeWrong).toBe(true);
      expect(config.timed).toBe(false);
      expect(config.queueSize).toBe(1);
    });

    it('exposes master config with all categories and bank size 50', () => {
      const config = generator.getDifficulty('master');

      expect(config.label).toBe('Master Zemi Barista');
      expect(config.bankSize).toBe(50);
      expect(config.categories).toEqual(['*']);
      expect(config.penalizeWrong).toBe(true);
      expect(config.timed).toBe(true);
      expect(config.timeLimitSeconds).toBe(120);
      expect(config.queueSize).toBe(3);
      expect(config.hintOnWrong).toBe(false);
    });
  });

  describe('all difficulty tiers', () => {
    const tiers: DifficultyTier[] = ['rookie', 'shift_lead', 'master'];

    it.each(tiers)('returns only unique tokens for %s tier', (tier) => {
      const bank = generator.generate(LATTE_SEQUENCE, tier);
      const unique = new Set(bank.map((t) => t.id));

      expect(unique.size).toBe(bank.length);
    });

    it.each(tiers)('always includes every required sequence token for %s tier', (tier) => {
      const bank = generator.generate(LATTE_SEQUENCE, tier);
      const bankIds = bank.map((t) => t.id);

      LATTE_SEQUENCE.forEach((id) => {
        expect(bankIds).toContain(id);
      });
    });

    it('limits rookie bank to configured size with ingredient distractors only', () => {
      const bank = generator.generate(LATTE_SEQUENCE, 'rookie');

      expect(bank.length).toBe(10);
      CUP_IDS.forEach((id) => {
        expect(bank.map((t) => t.id)).toContain(id);
      });
      bank
        .filter((t) => !LATTE_SEQUENCE.includes(t.id) && !CUP_IDS.includes(t.id))
        .forEach((token) => {
          expect(token.category).toBe('ingredient');
        });
    });

    it('returns the full station inventory for shift_lead', () => {
      const bank = generator.generate(LATTE_SEQUENCE, 'shift_lead');

      expect(bank.length).toBe(ALL_STATION_TOKENS.length);
      const bankIds = new Set(bank.map((t) => t.id));
      ALL_STATION_TOKENS.forEach((token) => {
        expect(bankIds).toContain(token.id);
      });
    });

    it('returns the full station inventory for master', () => {
      const bank = generator.generate(LATTE_SEQUENCE, 'master');

      expect(bank.length).toBe(ALL_STATION_TOKENS.length);
      const bankIds = new Set(bank.map((t) => t.id));
      ALL_STATION_TOKENS.forEach((token) => {
        expect(bankIds).toContain(token.id);
      });
    });
  });

  describe('edge cases', () => {
    it('returns required tokens and all cups when base set exceeds bank size', () => {
      const bank = generator.generate(COQUITO_SEQUENCE, 'rookie');
      const bankIds = bank.map((t) => t.id);

      COQUITO_SEQUENCE.forEach((id) => {
        expect(bankIds).toContain(id);
      });
      CUP_IDS.forEach((id) => {
        expect(bankIds).toContain(id);
      });
      expect(bank.length).toBe(COQUITO_SEQUENCE.length + 3);
    });

    it('includes all required tokens and cups even when they outnumber configured bank size', () => {
      const longSequence = [
        ...COQUITO_SEQUENCE,
        'cup_8oz',
        'cup_16oz',
      ];

      const bank = generator.generate(longSequence, 'rookie');
      const bankIds = bank.map((t) => t.id);

      longSequence.forEach((id) => {
        expect(bankIds).toContain(id);
      });
      CUP_IDS.forEach((id) => {
        expect(bankIds).toContain(id);
      });
      expect(bank.length).toBe(longSequence.length + 1);
    });

    it('returns the full station inventory for master tier', () => {
      const bank = generator.generate(LATTE_SEQUENCE, 'master');

      expect(bank.length).toBe(ALL_STATION_TOKENS.length);
      expect(bank.length).toBeLessThanOrEqual(50);

      const unique = new Set(bank.map((t) => t.id));
      expect(unique.size).toBe(ALL_STATION_TOKENS.length);
    });

    it('uses all token categories in the full master inventory', () => {
      const bank = generator.generate(LATTE_SEQUENCE, 'master');
      const categories = new Set(bank.map((t) => t.category));

      expect(categories.has('ingredient')).toBe(true);
      expect(categories.has('action')).toBe(true);
      expect(categories.has('equipment')).toBe(true);
    });

    it('skips unknown sequence ids gracefully for shift_lead', () => {
      const sequenceWithUnknown = [...LATTE_SEQUENCE, 'nonexistent_token'];
      const bank = generator.generate(sequenceWithUnknown, 'shift_lead');
      const bankIds = bank.map((t) => t.id);

      expect(bankIds).not.toContain('nonexistent_token');
      expect(bank.length).toBe(ALL_STATION_TOKENS.length);
      LATTE_SEQUENCE.forEach((id) => {
        expect(bankIds).toContain(id);
      });
    });
  });
});