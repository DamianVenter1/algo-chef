# Algo-Chef

A recipe optimizer that calculates the best combination of recipes to feed the maximum number of people given your available ingredients.

## Getting Started

```bash
npm install
ng serve
```

Open http://localhost:4200

## Features

- **Home page**: Adjust ingredient quantities and find optimal recipes
- **Recipes page**: Add, edit, or delete recipes
- **Dark/light mode**: Toggle in navbar, defaults to system preference

## Architecture

### State & Persistence

All user changes (ingredients, recipes, theme) persist to localStorage and survive page reloads.

### Optimization Algorithm

The recipe finder uses recursive backtracking with pruning to maximize people fed:

1. Process recipes in order to avoid duplicate combinations
2. For each recipe, try making 0 to N copies (where N = max possible with current ingredients)
3. Calculate upper bound at each branch; prune if it can't beat current best
4. Track the combination that feeds the most people

This is a variant of the bounded knapsack problem. The pruning keeps it fast for typical ingredient/recipe counts.

## Project Structure

```
src/
  app/
    models/          # Data interfaces (Recipe, Ingredient, etc.)
    services/        # Business logic, state management, persistence
    components/      # Reusable UI components (navbar)
    pages/           # Route-level components (home, recipes)
```

This follows clean architecture principles while keeping the project simple:
- models define the domain
- services handle logic and state
- components & pages handle presentation <br/>
Dependencies flow inward—UI depends on services, services depend on models, but never the reverse.
