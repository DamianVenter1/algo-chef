import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Recipe } from '../models/recipe.model';

const DEFAULT_RECIPES: Recipe[] = [
  {
    id: 'burger',
    name: 'Burger',
    feeds: 1,
    ingredients: {
      Meat: 1,
      Lettuce: 1,
      Tomato: 1,
      Cheese: 1,
      Dough: 1
    }
  },
  {
    id: 'pie',
    name: 'Pie',
    feeds: 1,
    ingredients: {
      Dough: 2,
      Meat: 2
    }
  },
  {
    id: 'sandwich',
    name: 'Sandwich',
    feeds: 1,
    ingredients: {
      Dough: 1,
      Cucumber: 1
    }
  },
  {
    id: 'pasta',
    name: 'Pasta',
    feeds: 2,
    ingredients: {
      Dough: 2,
      Tomato: 1,
      Cheese: 2,
      Meat: 1
    }
  },
  {
    id: 'salad',
    name: 'Salad',
    feeds: 3,
    ingredients: {
      Lettuce: 2,
      Tomato: 2,
      Cucumber: 1,
      Cheese: 2,
      Olives: 1
    }
  },
  {
    id: 'pizza',
    name: 'Pizza',
    feeds: 4,
    ingredients: {
      Dough: 3,
      Tomato: 2,
      Cheese: 3,
      Olives: 1
    }
  }
];

const STORAGE_KEY = 'algo-chef-recipes';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private readonly recipesSubject = new BehaviorSubject<Recipe[]>(this.loadFromStorage());

  constructor() {
    this.recipesSubject.subscribe(recipes => {
      this.saveToStorage(recipes);
    });
  }

  private loadFromStorage(): Recipe[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load recipes from localStorage', e);
    }

    return DEFAULT_RECIPES.map((recipe) => ({
      ...recipe,
      ingredients: { ...recipe.ingredients }
    }));
  }

  private saveToStorage(recipes: Recipe[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
    } catch (e) {
      console.warn('Failed to save recipes to localStorage', e);
    }
  }

  getRecipes() {
    return this.recipesSubject.asObservable();
  }

  addRecipe(recipe: Omit<Recipe, 'id'> | Recipe) {
    const id = 'id' in recipe && recipe.id ? recipe.id : this.createId(recipe.name);
    const newRecipe: Recipe = {
      ...recipe,
      id,
      ingredients: { ...recipe.ingredients }
    };
    this.recipesSubject.next([...this.recipesSubject.getValue(), newRecipe]);
  }

  updateRecipe(updatedRecipe: Recipe) {
    const recipes = this.recipesSubject.getValue();
    const next = recipes.map((recipe) =>
      recipe.id === updatedRecipe.id
        ? {
            ...updatedRecipe,
            ingredients: { ...updatedRecipe.ingredients }
          }
        : recipe
    );
    this.recipesSubject.next(next);
  }

  deleteRecipe(recipeId: string) {
    const next = this.recipesSubject.getValue().filter((recipe) => recipe.id !== recipeId);
    this.recipesSubject.next(next);
  }

  resetToDefaults() {
    this.recipesSubject.next(
      DEFAULT_RECIPES.map((recipe) => ({
        ...recipe,
        ingredients: { ...recipe.ingredients }
      }))
    );
  }

  private createId(name: string) {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    return `${slug}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
}
