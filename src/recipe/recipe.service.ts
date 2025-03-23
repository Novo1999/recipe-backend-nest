import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Recipe } from './model/recipe';

@Injectable()
export class RecipeService {
  constructor(@Inject('POSTGRES_POOL') private readonly sql: any) {}

  async findAllRecipes(
    query: Record<string, string>,
  ): Promise<Recipe | undefined> {
    const { search } = query ?? {};
    let recipes;

    try {
      if (search) {
        const sanitizedSearch = `%${search}%`;
        recipes = await this.sql`
        SELECT * FROM recipes 
        WHERE name LIKE ${sanitizedSearch} OR description LIKE ${sanitizedSearch};
      `;
      } else {
        recipes = await this.sql`
        SELECT * FROM recipes;
      `;
      }
      return recipes;
    } catch (error) {
      if (error instanceof HttpException)
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
