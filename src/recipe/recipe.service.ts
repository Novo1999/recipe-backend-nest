import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Recipe } from './model/recipe';

@Injectable()
export class RecipeService {
  constructor(@Inject('POSTGRES_POOL') private readonly sql: any) {}

  async findAllRecipes(
    query: Record<string, string>,
  ): Promise<Recipe[] | undefined> {
    const {
      search,
      chef_id,
      labels,
      page,
      limit,
      cooking_time_start,
      cooking_time_end,
    } = query ?? {};
    const queryParams: any[] = [];
    let sqlQuery = 'SELECT * FROM recipes';

    const conditions: string[] = [];

    if (search) {
      conditions.push(
        `(name ILIKE $${queryParams.length + 1} OR description ILIKE $${queryParams.length + 1})`,
      );
      queryParams.push(`%${search}%`);
    }

    if (chef_id) {
      conditions.push(`chef_id = $${queryParams.length + 1}`);
      queryParams.push(chef_id);
    }

    if (labels) {
      const labelsArray = labels.split(',').map(Number);
      conditions.push(`labels && $${queryParams.length + 1}::int[]`);
      queryParams.push(labelsArray);
    }

    if (cooking_time_start && cooking_time_end) {
      conditions.push(
        `cooking_time BETWEEN $${queryParams.length + 1}::TIME AND $${queryParams.length + 2}::TIME`,
      );
      queryParams.push(cooking_time_start);
      queryParams.push(cooking_time_end);
    }

    if (conditions.length) {
      sqlQuery += ` WHERE ${conditions.join(' AND ')}`;
    }
    if (limit) {
      sqlQuery += ` LIMIT ${limit}`;
    }

    if (page) {
      sqlQuery += ` OFFSET ${(Number(page) - 1) * 10}`;
    }

    console.log({ sqlQuery, conditions, queryParams });
    try {
      const recipes = await this.sql.unsafe(sqlQuery, queryParams);
      return recipes;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
