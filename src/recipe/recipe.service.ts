import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { DataListResponse } from '../dto/DataListResponse';
import { handleUpload } from './fileUpload/cloudinary';
import { Ingredient } from './model/ingredient';
import { Recipe } from './model/recipe';

@Injectable()
export class RecipeService {
  constructor(@Inject('POSTGRES_POOL') private readonly sql: any) {}

  async findAllRecipes(
    query: Record<string, string>,
  ): Promise<DataListResponse<Recipe> | undefined> {
    const {
      search,
      chef_id,
      labels,
      page = 1,
      limit = 10,
      cooking_time_start,
      cooking_time_end,
      status,
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
    if (status) {
      conditions.push(`status = $${queryParams.length + 1}`);
      queryParams.push(status);
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

    const total = await this.sql`
    SELECT COUNT(*) FROM recipes`;

    try {
      const recipes: Recipe[] = await this.sql.unsafe(sqlQuery, queryParams);
      return new DataListResponse<Recipe>(
        recipes,
        Number(total[0]?.count || 0),
        Math.ceil((total[0]?.count || 0) / Number(limit)),
      );
    } catch (error) {
      if (error instanceof HttpException)
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async addNewRecipe(recipe: Recipe, image: Express.Multer.File) {
    const b64 = Buffer.from(image.buffer).toString('base64');
    const dataURI = 'data:' + image.mimetype + ';base64,' + b64;
    const cloudinaryRes = await handleUpload(dataURI);
    const { chef_id, cooking_time, description, labels, name, status } =
      recipe ?? {};
    try {
      const newRecipe = await this.sql`
      INSERT INTO recipes (name, description, image_url, labels, chef_id, cooking_time, status)
      VALUES(${name}, ${description}, ${cloudinaryRes?.secure_url}, ${labels}, ${chef_id}, ${cooking_time}, ${status}) RETURNING *`;
      return newRecipe;
    } catch (error) {
      if (error instanceof HttpException)
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateStatus(id: string, newStatus: 'draft' | 'published') {
    try {
      const update = await this.sql`
        UPDATE recipes SET status = ${newStatus}
        WHERE id = ${id} RETURNING *`;
      return update;
    } catch (error) {
      if (error?.constraint_name === 'check_status_value') {
        throw new HttpException(
          'Invalid status value. Allowed values: draft, published.',
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        'An error occurred while updating the status.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async addIngredients(ingredients: Ingredient[]) {
    const ingredientValues = ingredients.map((ing) => [
      ing.recipe_id,
      ing.name,
      ing.quantity,
    ]);

    try {
      const newIngredient = await this.sql`
      INSERT INTO ingredients (recipe_id, name, quantity)
      VALUES ${this.sql(ingredientValues)} RETURNING *`;
      return newIngredient;
    } catch (error) {
      if (error.code === 'UNDEFINED_VALUE') {
        throw new HttpException(
          'Please insert the desired values',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (error?.constraint_name === 'unique_name') {
        throw new HttpException(
          'Ingredient name cannot be similar for the same recipe',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Failed to add ingredient',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
