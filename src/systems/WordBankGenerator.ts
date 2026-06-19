import wordBankData from '../data/wordBank.json';
import difficultyData from '../data/difficulty.json';
import type { DifficultyConfig, DifficultyTier, Token } from '../types';

const CUP_IDS = ['cup_8oz', 'cup_12oz', 'cup_16oz', 'demitasse'] as const;

export class WordBankGenerator {
  private allTokens: Token[];
  private difficulty: Record<DifficultyTier, DifficultyConfig>;

  constructor() {
    this.allTokens = wordBankData.tokens as Token[];
    this.difficulty = difficultyData as Record<DifficultyTier, DifficultyConfig>;
  }

  generate(sequence: string[], tier: DifficultyTier): Token[] {
    if (tier === 'shift_lead' || tier === 'master') {
      return this.shuffle([...this.allTokens]);
    }

    return this.generateRookieBank(sequence);
  }

  getDifficulty(tier: DifficultyTier): DifficultyConfig {
    return this.difficulty[tier];
  }

  private generateRookieBank(sequence: string[]): Token[] {
    const config = this.difficulty.rookie;
    const required = this.resolveTokens(sequence);
    const cups = this.resolveTokens([...CUP_IDS]);
    const base = this.uniqueTokens([...required, ...cups]);
    const baseIds = new Set(base.map((t) => t.id));

    if (base.length >= config.bankSize) {
      return this.shuffle(base);
    }

    const slotsRemaining = config.bankSize - base.length;
    const ingredientPool = this.allTokens.filter(
      (t) => t.category === 'ingredient' && !baseIds.has(t.id),
    );
    const distractors = this.pickDistractors(ingredientPool, slotsRemaining);

    return this.shuffle([...base, ...distractors]);
  }

  private resolveTokens(ids: string[]): Token[] {
    return ids
      .map((id) => this.allTokens.find((t) => t.id === id))
      .filter((t): t is Token => t !== undefined);
  }

  private uniqueTokens(tokens: Token[]): Token[] {
    const seen = new Set<string>();
    const unique: Token[] = [];

    for (const token of tokens) {
      if (!seen.has(token.id)) {
        seen.add(token.id);
        unique.push(token);
      }
    }

    return unique;
  }

  private pickDistractors(pool: Token[], count: number): Token[] {
    if (count === 0) return [];

    return this.shuffle([...pool]).slice(0, count);
  }

  private shuffle<T>(items: T[]): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}