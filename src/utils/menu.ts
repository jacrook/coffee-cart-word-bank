import recipesData from '../data/recipes.json';
import wordBankData from '../data/wordBank.json';
import type { PracticeOrder } from '../types';

interface DrinkData {
  id: string;
  name: string;
  sizes: Record<string, { displayName: string; sequence: string[] }>;
}

const MENU_DRINK_IDS = [
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
] as const;

export function getMenuDrinks(): DrinkData[] {
  return recipesData.drinks as unknown as DrinkData[];
}

export function getPracticeOptions(): PracticeOrder[] {
  const drinks = getMenuDrinks();
  const options: PracticeOrder[] = [];

  drinks.forEach((drink) => {
    Object.keys(drink.sizes).forEach((size) => {
      options.push({ drinkId: drink.id, size });
    });
  });

  return options.sort((a, b) => {
    const nameA = drinks.find((d) => d.id === a.drinkId)?.sizes[a.size]?.displayName ?? '';
    const nameB = drinks.find((d) => d.id === b.drinkId)?.sizes[b.size]?.displayName ?? '';
    return nameA.localeCompare(nameB);
  });
}

export function getPracticeLabel(order: PracticeOrder): string {
  const drink = getMenuDrinks().find((d) => d.id === order.drinkId);
  return drink?.sizes[order.size]?.displayName ?? `${order.size} ${drink?.name ?? order.drinkId}`;
}

export function getAllTokenIds(): Set<string> {
  return new Set(wordBankData.tokens.map((t) => t.id));
}

export function getMenuDrinkIds(): string[] {
  return getMenuDrinks().map((d) => d.id);
}

export function validateMenuCoverage(): { missingDrinks: string[]; missingTokens: string[] } {
  const menuIds = new Set(getMenuDrinkIds());
  const missingDrinks = MENU_DRINK_IDS.filter((id) => !menuIds.has(id));

  const tokenIds = getAllTokenIds();
  const missingTokens = new Set<string>();

  getMenuDrinks().forEach((drink) => {
    Object.values(drink.sizes).forEach((size) => {
      size.sequence.forEach((tokenId) => {
        if (!tokenIds.has(tokenId)) {
          missingTokens.add(tokenId);
        }
      });
    });
  });

  return {
    missingDrinks,
    missingTokens: [...missingTokens],
  };
}