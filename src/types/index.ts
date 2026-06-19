export type TokenCategory = 'ingredient' | 'action' | 'equipment';

export type DifficultyTier = 'rookie' | 'shift_lead' | 'master';

export interface Token {
  id: string;
  label: string;
  category: TokenCategory;
  icon?: string;
}

export interface RecipeEntry {
  displayName: string;
  sequence: string[];
}

export interface DrinkRecipes {
  id: string;
  name: string;
  sizes: Record<string, RecipeEntry>;
}

export interface DifficultyConfig {
  label: string;
  bankSize: number;
  categories: Array<TokenCategory | '*'>;
  penalizeWrong: boolean;
  timed: boolean;
  timeLimitSeconds: number;
  queueSize: number;
  hintOnWrong: boolean;
}

export interface Order {
  id: number;
  drinkId: string;
  size: string;
  displayName: string;
}

export interface PracticeOrder {
  drinkId: string;
  size: string;
}

export interface PlaceResult {
  correct: boolean;
  feedback: string;
  isComplete: boolean;
  expectedNext?: string;
}

export interface DrinkResult {
  correct: boolean;
  mistakes: number;
  timeElapsedMs: number;
  score: number;
}