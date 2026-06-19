import { describe, it, expect } from 'vitest';
import wordBankData from '../../data/wordBank.json';
import recipesData from '../../data/recipes.json';
import { WordBankGenerator } from '../WordBankGenerator';

const REMOVED_REDUNDANT_ACTIONS = [
  'select_cup',
  'add_ice',
  'add_water',
  'add_syrup',
  'add_powder',
  'top_drink',
  'garnish',
  'pull_espresso',
  'pour_beverage',
];

const CUP_IDS = ['cup_8oz', 'cup_12oz', 'cup_16oz', 'demitasse'];

describe('data audit', () => {
  const bankIds = new Set(wordBankData.tokens.map((t) => t.id));

  it('does not include redundant add_* action tokens', () => {
    REMOVED_REDUNDANT_ACTIONS.forEach((id) => {
      expect(bankIds.has(id)).toBe(false);
    });
  });

  it('includes all cup sizes in the word bank', () => {
    CUP_IDS.forEach((id) => {
      expect(bankIds.has(id)).toBe(true);
    });
  });

  it('does not reference removed tokens in any recipe', () => {
    const usedTokens = new Set<string>();

    recipesData.drinks.forEach((drink) => {
      Object.values(drink.sizes).forEach((size) => {
        size.sequence.forEach((tokenId: string) => usedTokens.add(tokenId));
      });
    });

    REMOVED_REDUNDANT_ACTIONS.forEach((id) => {
      expect(usedTokens.has(id)).toBe(false);
    });
  });

  it('does not duplicate ingredient/action pairs in recipe sequences', () => {
    const ingredientActionPairs: Record<string, string> = {
      ice: 'add_ice',
      hot_water: 'add_water',
      water: 'add_water',
      vanilla_syrup: 'add_syrup',
      peppermint_syrup: 'add_syrup',
      cinnamon_syrup: 'add_syrup',
      cocoa_powder: 'add_powder',
      cinnamon: 'garnish',
      coco_topper: 'top_drink',
      espresso_shot: 'pull_espresso',
      double_espresso_shot: 'pull_espresso',
    };

    recipesData.drinks.forEach((drink) => {
      Object.values(drink.sizes).forEach((size) => {
        Object.entries(ingredientActionPairs).forEach(([ingredient, action]) => {
          const hasIngredient = size.sequence.includes(ingredient);
          const hasAction = size.sequence.includes(action);
          expect(hasIngredient && hasAction).toBe(false);
        });
      });
    });
  });

  it('offers coquito latte in 12oz and 16oz only', () => {
    const coquito = recipesData.drinks.find((d) => d.id === 'coquito_latte');
    expect(coquito).toBeDefined();
    if (!coquito) return;

    expect(Object.keys(coquito.sizes).sort()).toEqual(['12oz', '16oz']);
    expect(coquito.sizes['12oz']?.sequence[0]).toBe('cup_12oz');
    expect(coquito.sizes['16oz']?.sequence[0]).toBe('cup_16oz');
  });

  it('exposes every cup size on shift_lead and master tiers', () => {
    const generator = new WordBankGenerator();
    const sampleSequence = ['cup_12oz', 'espresso_shot', 'serve'];

    ['shift_lead', 'master'].forEach((tier) => {
      const bank = generator.generate(sampleSequence, tier as 'shift_lead' | 'master');
      const ids = bank.map((t) => t.id);
      CUP_IDS.forEach((cupId) => {
        expect(ids).toContain(cupId);
      });
      expect(bank.length).toBe(wordBankData.tokens.length);
    });
  });
});