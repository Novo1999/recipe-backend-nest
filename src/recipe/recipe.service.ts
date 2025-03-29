import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { DataListResponse } from '../dto/DataListResponse';
import { Ingredient } from './model/ingredient';
import { Recipe } from './model/recipe';
import getCloudinaryRes from './util/getCloudinaryRes';

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
      skill_level,
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

    if (skill_level) {
      conditions.push(`skill_level = $${queryParams.length + 1}`);
      queryParams.push(skill_level);
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
      if (error)
        throw new HttpException(
          'Error getting recipes',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
  }

  async addNewRecipe(recipe: Recipe, image: Express.Multer.File) {
    const cloudinaryRes = await getCloudinaryRes(image);
    const {
      chef_id,
      cooking_time,
      description,
      labels,
      name,
      status,
      skill_level,
    } = recipe ?? {};
    try {
      const newRecipe = await this.sql`
      INSERT INTO recipes (name, description, image_url, labels, chef_id, cooking_time, status, skill_level)
      VALUES(${name}, ${description}, ${cloudinaryRes?.secure_url}, ${labels}, ${chef_id}, ${cooking_time}, ${status}, ${skill_level}) RETURNING *`;
      return newRecipe;
    } catch (error) {
      if (error)
        throw new HttpException(
          'Failed to add recipe',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
  }
  async updateRecipe(recipe: Recipe, image: Express.Multer.File, id: string) {
    let imageUrl: string;
    const {
      chef_id,
      cooking_time,
      description,
      image_url,
      labels,
      name,
      status,
      skill_level,
    } = recipe ?? {};

    if (image) {
      const cloudinaryRes = await getCloudinaryRes(image);
      imageUrl = cloudinaryRes.secure_url;
    } else {
      imageUrl = image_url;
    }

    try {
      const update = await this.sql`
      UPDATE recipes SET name = ${name}, description = ${description},
      image_url = ${imageUrl}, labels = ${labels}, chef_id = ${chef_id},
      cooking_time = ${cooking_time}, status = ${status}, skill_level = ${skill_level} WHERE id = ${id}
      RETURNING *`;
      return update;
    } catch (error) {
      if (error)
        throw new HttpException(
          'Failed to edit recipe',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
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
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateIngredient(id: string, ingredient: Ingredient) {
    const { name, quantity } = ingredient ?? {};
    const conditions: string[] = [];
    const queryParams: any[] = [];

    let sqlQuery = 'UPDATE ingredients SET ';

    if (ingredient.name) {
      conditions.push(`name = $${queryParams.length + 1}`);
      queryParams.push(name);
    }
    if (ingredient.quantity) {
      conditions.push(`quantity = $${queryParams.length + 1}`);
      queryParams.push(quantity);
    }

    if (conditions.length) {
      sqlQuery += `${conditions.join(', ')}`;
    }

    sqlQuery += ` WHERE id = ${id} RETURNING *`;
    try {
      const update = await this.sql.unsafe(sqlQuery, queryParams);
      return update;
    } catch (error) {
      if (error)
        throw new HttpException(
          'Failed to edit ingredient',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
  }
}
