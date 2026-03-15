import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import {
  IngredientInventory,
  OptimizationResult,
  Recipe
} from '../../models/recipe.model';
import { IngredientService } from '../../services/ingredient.service';
import { OptimizerService } from '../../services/optimizer.service';
import { RecipeService } from '../../services/recipe.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  ingredients: { name: string; quantity: number }[] = [];
  recipes: Recipe[] = [];
  result?: OptimizationResult;
  isCalculated = false;
  isLoading = false;
  private readonly destroy$ = new Subject<void>();
  private skipNextUpdate = false;

  constructor(
    private readonly ingredientService: IngredientService,
    private readonly recipeService: RecipeService,
    private readonly optimizerService: OptimizerService
  ) {}

  ngOnInit() {
    this.ingredientService
      .getIngredients()
      .pipe(takeUntil(this.destroy$))
      .subscribe((ingredients) => {
        if (this.skipNextUpdate) {
          this.skipNextUpdate = false;
          return;
        }
        this.ingredients = Object.entries(ingredients).map(([name, quantity]) => ({
          name,
          quantity
        }));
      });

    this.recipeService
      .getRecipes()
      .pipe(takeUntil(this.destroy$))
      .subscribe((recipes) => {
        this.recipes = recipes;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onIngredientChange(name: string, quantity: number) {
    this.skipNextUpdate = true;
    this.ingredientService.updateIngredient(name, Number(quantity));
  }

  resetDefaults() {
    this.ingredientService.resetToDefaults();
    this.isCalculated = false;
    this.result = undefined;
  }

  findBestRecipes() {
    this.isLoading = true;
    this.isCalculated = false;
    
    // Use setTimeout to allow UI to update with loading state
    setTimeout(() => {
      const currentInventory = this.ingredients.reduce<IngredientInventory>(
        (acc, ingredient) => {
          acc[ingredient.name] = Number(ingredient.quantity) || 0;
          return acc;
        },
        {}
      );
      this.result = this.optimizerService.findOptimalRecipes(currentInventory, this.recipes);
      this.isLoading = false;
      this.isCalculated = true;
    }, 0);
  }
}
