import recipesData from '../data/recipes.json';
import type { DifficultyTier, Order, PracticeOrder } from '../types';


interface DrinkData {
  id: string;
  name: string;
  sizes: Record<string, { displayName: string; sequence: string[] }>;
}

const MASTER_QUEUE: Array<{ drinkId: string; size: string }> = [
  { drinkId: 'latte', size: '12oz' },
  { drinkId: 'zemi_americano', size: '16oz' },
  { drinkId: 'macchiato', size: '8oz' },
];

export class OrderQueue {
  private drinks: DrinkData[];
  private queue: Order[] = [];
  private nextId = 1;

  constructor() {
    this.drinks = recipesData.drinks as unknown as DrinkData[];
  }

  generateQueue(tier: DifficultyTier, practiceOrder?: PracticeOrder): Order[] {
    this.queue = [];
    this.nextId = 1;

    if (practiceOrder) {
      this.queue.push(this.createOrder(practiceOrder.drinkId, practiceOrder.size));
      return [...this.queue];
    }

    if (tier === 'master') {
      MASTER_QUEUE.forEach(({ drinkId, size }) => {
        this.queue.push(this.createOrder(drinkId, size));
      });
      return [...this.queue];
    }

    const drink = this.pickRandomDrink();
    const sizes = Object.keys(drink.sizes);
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    this.queue.push(this.createOrder(drink.id, size));
    return [...this.queue];
  }

  getQueue(): Order[] {
    return [...this.queue];
  }

  private createOrder(drinkId: string, size: string): Order {
    const drink = this.drinks.find((d) => d.id === drinkId);
    const entry = drink?.sizes[size];
    return {
      id: this.nextId++,
      drinkId,
      size,
      displayName: entry?.displayName ?? `${size} ${drink?.name ?? drinkId}`,
    };
  }

  private pickRandomDrink(): DrinkData {
    return this.drinks[Math.floor(Math.random() * this.drinks.length)];
  }
}