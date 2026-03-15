import { Injectable } from '@angular/core';
import {
  IngredientInventory,
  OptimizationResult,
  Recipe,
  RecipeSelection
} from '../models/recipe.model';

@Injectable({
  providedIn: 'root'
})
export class OptimizerService {
  findOptimalRecipes(
    ingredients: IngredientInventory,
    recipes: Recipe[]
  ): OptimizationResult {
    let bestTotal = 0;
    let bestRemaining: IngredientInventory = { ...ingredients };
    let bestSelection: { recipe: Recipe; count: number }[] = [];

    const subtractIngredients = (
      current: IngredientInventory,
      recipe: Recipe
    ): IngredientInventory => {
      const next: IngredientInventory = { ...current };
      Object.entries(recipe.ingredients).forEach(([ingredient, amount]) => {
        next[ingredient] = (next[ingredient] ?? 0) - amount;
      });
      return next;
    };

    const maxPossible = (current: IngredientInventory, recipe: Recipe): number => {
      let max = Infinity;
      for (const [ingredient, amount] of Object.entries(recipe.ingredients)) {
        max = Math.min(max, Math.floor((current[ingredient] ?? 0) / amount));
      }
      return max === Infinity ? 0 : max;
    };

    const backtrack = (
      current: IngredientInventory,
      recipeIndex: number,
      selection: { recipe: Recipe; count: number }[],
      totalFed: number
    ) => {
      if (totalFed > bestTotal) {
        bestTotal = totalFed;
        bestRemaining = { ...current };
        bestSelection = selection.map(s => ({ ...s }));
      }

      let upperBound = totalFed;
      let tempIngredients = { ...current };
      for (let i = recipeIndex; i < recipes.length; i++) {
        const maxCount = maxPossible(tempIngredients, recipes[i]);
        upperBound += maxCount * recipes[i].feeds;
      }
      if (upperBound <= bestTotal) {
        // Can't beat current best, remove this branch
        return;
      }

      for (let i = recipeIndex; i < recipes.length; i++) {
        const recipe = recipes[i];
        const maxCount = maxPossible(current, recipe);
        
        for (let count = maxCount; count >= 1; count--) {
          let nextIngredients = { ...current };
          for (let j = 0; j < count; j++) {
            nextIngredients = subtractIngredients(nextIngredients, recipe);
          }
          
          const newSelection = [...selection, { recipe, count }];
          backtrack(
            nextIngredients,
            i + 1,
            newSelection,
            totalFed + recipe.feeds * count
          );
        }
      }
    };

    backtrack({ ...ingredients }, 0, [], 0);

    return {
      recipes: bestSelection,
      totalPeopleFed: bestTotal,
      remainingIngredients: bestRemaining
    };
  }
}
