import recipesData from '../data/recipes.json';
import wordBankData from '../data/wordBank.json';
import type { PlaceResult, Token } from '../types';

interface RecipeSize {
  displayName: string;
  sequence: string[];
}

interface DrinkData {
  id: string;
  name: string;
  sizes: Record<string, RecipeSize>;
}

export class SequenceEngine {
  private drinks: Map<string, DrinkData>;
  private tokens: Map<string, Token>;
  private expectedSequence: string[] = [];
  private builtSequence: string[] = [];
  private stepIndex = 0;
  private mistakes = 0;
  private displayName = '';

  constructor() {
    this.drinks = new Map();
    (recipesData.drinks as unknown as DrinkData[]).forEach((d) => this.drinks.set(d.id, d));

    this.tokens = new Map();
    (wordBankData.tokens as Token[]).forEach((t) => this.tokens.set(t.id, t));
  }

  startOrder(drinkId: string, size: string): boolean {
    const drink = this.drinks.get(drinkId);
    if (!drink) return false;

    const sizeEntry = drink.sizes[size];
    if (!sizeEntry) return false;

    this.expectedSequence = [...sizeEntry.sequence];
    this.displayName = sizeEntry.displayName;
    this.builtSequence = [];
    this.stepIndex = 0;
    this.mistakes = 0;
    return true;
  }

  getDisplayName(): string {
    return this.displayName;
  }

  getExpectedSequence(): string[] {
    return [...this.expectedSequence];
  }

  getBuiltSequence(): string[] {
    return [...this.builtSequence];
  }

  getToken(id: string): Token | undefined {
    return this.tokens.get(id);
  }

  getMistakes(): number {
    return this.mistakes;
  }

  isComplete(): boolean {
    return this.stepIndex >= this.expectedSequence.length;
  }

  getStepIndex(): number {
    return this.stepIndex;
  }

  getTotalSteps(): number {
    return this.expectedSequence.length;
  }

  undoLastToken(): { success: boolean; removedTokenId?: string } {
    if (this.builtSequence.length === 0) {
      return { success: false };
    }

    const removedTokenId = this.builtSequence.pop();
    this.stepIndex--;
    return { success: true, removedTokenId };
  }

  clearBuiltSequence(): void {
    this.builtSequence = [];
    this.stepIndex = 0;
  }

  placeToken(tokenId: string): PlaceResult {
    if (this.isComplete()) {
      return { correct: false, feedback: 'Drink already complete!', isComplete: true };
    }

    const expected = this.expectedSequence[this.stepIndex];

    if (tokenId === expected) {
      this.builtSequence.push(tokenId);
      this.stepIndex++;
      const isComplete = this.isComplete();
      const nextId = this.expectedSequence[this.stepIndex];
      const nextLabel = nextId ? this.tokens.get(nextId)?.label : undefined;

      return {
        correct: true,
        feedback: isComplete ? 'Perfect! Drink ready to serve.' : `Correct! Next: ${nextLabel ?? 'finish'}`,
        isComplete,
        expectedNext: nextId,
      };
    }

    this.mistakes++;
    const expectedLabel = this.tokens.get(expected)?.label ?? expected;
    return {
      correct: false,
      feedback: `Wrong step. Expected: ${expectedLabel}`,
      isComplete: false,
      expectedNext: expected,
    };
  }

  reset(): void {
    this.expectedSequence = [];
    this.builtSequence = [];
    this.stepIndex = 0;
    this.mistakes = 0;
    this.displayName = '';
  }
}