import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Recipe } from '../../models/recipe.model';
import { RecipeService } from '../../services/recipe.service';

interface RecipeDraft {
  name: string;
  feeds: number;
  ingredientsText: string;
}

interface RecipeView extends Recipe {
  isEditing: boolean;
}

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recipes.component.html',
  styleUrl: './recipes.component.scss'
})
export class RecipesComponent implements OnInit, OnDestroy {
  recipes: RecipeView[] = [];
  drafts: { [id: string]: RecipeDraft } = {};
  newRecipe: RecipeDraft = {
    name: '',
    feeds: 1,
    ingredientsText: ''
  };
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly recipeService: RecipeService) {}

  ngOnInit() {
    this.recipeService
      .getRecipes()
      .pipe(takeUntil(this.destroy$))
      .subscribe((recipes) => {
        this.recipes = recipes.map((recipe) => ({
          ...recipe,
          ingredients: { ...recipe.ingredients },
          isEditing: false
        }));
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  startEdit(recipe: RecipeView) {
    this.drafts[recipe.id] = {
      name: recipe.name,
      feeds: recipe.feeds,
      ingredientsText: this.ingredientsToText(recipe.ingredients)
    };
    recipe.isEditing = true;
  }

  cancelEdit(recipe: RecipeView) {
    delete this.drafts[recipe.id];
    recipe.isEditing = false;
  }

  saveEdit(recipe: RecipeView) {
    const draft = this.drafts[recipe.id];
    if (!draft) {
      return;
    }

    const name = draft.name.trim();
    if (!name) {
      return;
    }

    const feeds = Number(draft.feeds) || 1;
    const ingredients = this.parseIngredients(draft.ingredientsText);

    this.recipeService.updateRecipe({
      id: recipe.id,
      name,
      feeds,
      ingredients
    });

    recipe.isEditing = false;
    delete this.drafts[recipe.id];
  }

  deleteRecipe(recipe: RecipeView) {
    const confirmed = confirm(`Delete ${recipe.name}?`);
    if (confirmed) {
      this.recipeService.deleteRecipe(recipe.id);
    }
  }

  addRecipe() {
    const name = this.newRecipe.name.trim();
    if (!name) {
      return;
    }

    const feeds = Number(this.newRecipe.feeds) || 1;
    const ingredients = this.parseIngredients(this.newRecipe.ingredientsText);

    this.recipeService.addRecipe({
      name,
      feeds,
      ingredients
    });

    this.newRecipe = {
      name: '',
      feeds: 1,
      ingredientsText: ''
    };
  }

  resetDefaults() {
    this.recipeService.resetToDefaults();
  }

  ingredientsToText(ingredients: { [name: string]: number }) {
    return Object.entries(ingredients)
      .map(([name, amount]) => `${name}: ${amount}`)
      .join('\n');
  }

  parseIngredients(text: string) {
    const inventory: { [name: string]: number } = {};
    text
      .split(/[\n,]+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .forEach((line) => {
        const [rawName, rawAmount] = line.split(':');
        if (!rawName || rawAmount === undefined) {
          return;
        }
        const name = rawName.trim();
        const amount = Number(rawAmount.trim());
        if (!name || !Number.isFinite(amount) || amount <= 0) {
          return;
        }
        inventory[name] = amount;
      });
    return inventory;
  }
}
