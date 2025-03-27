import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Recipe } from './model/recipe';
import { RecipeService } from './recipe.service';

@Controller('recipes')
export class RecipeController {
  constructor(private recipeService: RecipeService) {}
  @Get('/')
  async getAllRecipes(@Query() query: Record<string, string>) {
    return this.recipeService.findAllRecipes(query);
  }

  @Post('/')
  async postRecipe(@Body() body: Recipe) {
    return this.recipeService.addNewRecipe(body);
  }
}
