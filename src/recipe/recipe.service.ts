import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { handleUpload } from './fileUpload/cloudinary';
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

    try {
      const recipes = await this.sql.unsafe(sqlQuery, queryParams);
      return recipes;
    } catch (error) {
      if (error instanceof HttpException)
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async addNewRecipe(recipe: Recipe, image: Express.Multer.File) {
    const b64 = Buffer.from(image.buffer).toString('base64');
    const dataURI = 'data:' + image.mimetype + ';base64,' + b64;
    const cloudinaryRes = await handleUpload(dataURI);
    const { chef_id, cooking_time, description, labels, name } = recipe ?? {};
    try {
      const newRecipe = await this.sql`
      INSERT INTO recipes (name, description, image_url, labels, chef_id, cooking_time)
      VALUES(${name}, ${description}, ${cloudinaryRes?.secure_url}, ${labels}, ${chef_id}, ${cooking_time}) RETURNING *`;
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
      if (error?.code === '23514') {
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
}
