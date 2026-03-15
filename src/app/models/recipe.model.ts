export interface Ingredient {
  name: string;
  quantity: number;
}

export interface Recipe {
  id: string;
  name: string;
  feeds: number;
  ingredients: { [ingredientName: string]: number };
}

export interface IngredientInventory {
  [ingredientName: string]: number;
}

export interface RecipeSelection {
  recipe: Recipe;
  count: number;
}

export interface OptimizationResult {
  recipes: RecipeSelection[];
  totalPeopleFed: number;
  remainingIngredients: IngredientInventory;
}
