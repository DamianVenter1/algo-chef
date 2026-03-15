import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IngredientInventory } from '../models/recipe.model';

const DEFAULT_INGREDIENTS: IngredientInventory = {
  Cucumber: 2,
  Olives: 2,
  Lettuce: 3,
  Meat: 6,
  Tomato: 6,
  Cheese: 8,
  Dough: 10
};

const STORAGE_KEY = 'algo-chef-ingredients';

@Injectable({
  providedIn: 'root'
})
export class IngredientService {
  private readonly ingredientsSubject = new BehaviorSubject<IngredientInventory>(
    this.loadFromStorage()
  );

  constructor() {
    // Save to localStorage whenever ingredients change
    this.ingredientsSubject.subscribe(ingredients => {
      this.saveToStorage(ingredients);
    });
  }

  private loadFromStorage(): IngredientInventory {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load ingredients from localStorage', e);
    }
    return { ...DEFAULT_INGREDIENTS };
  }

  private saveToStorage(ingredients: IngredientInventory): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ingredients));
    } catch (e) {
      console.warn('Failed to save ingredients to localStorage', e);
    }
  }

  getIngredients() {
    return this.ingredientsSubject.asObservable();
  }

  updateIngredient(name: string, quantity: number) {
    const safeQuantity = Number.isFinite(quantity) ? Math.max(0, quantity) : 0;
    const current = this.ingredientsSubject.getValue();
    this.ingredientsSubject.next({
      ...current,
      [name]: safeQuantity
    });
  }

  resetToDefaults() {
    this.ingredientsSubject.next({ ...DEFAULT_INGREDIENTS });
  }
}
