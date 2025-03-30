import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Ingredient } from './model/ingredient';
import { Recipe } from './model/recipe';
import { Steps } from './model/steps';
import { RecipeService } from './recipe.service';

@Controller('recipes')
export class RecipeController {
  constructor(private recipeService: RecipeService) {}
  @Get('/')
  async getAllRecipes(@Query() query: Record<string, string>) {
    return this.recipeService.findAllRecipes(query);
  }

  @Get('/:id')
  async getRecipe(@Param('id') id: string) {
    return this.recipeService.findRecipe(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['chef'])
  @Post('/')
  @UseInterceptors(FileInterceptor('image'))
  async postRecipe(
    @Body() body: Recipe,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: '.(png|jpeg|jpg)',
        })
        .addMaxSizeValidator({
          maxSize: 1000000,
          message: 'Image cannot be more than 1MB',
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    image: Express.Multer.File,
  ) {
    return this.recipeService.addNewRecipe(body, image);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['chef'])
  @Put('/:id')
  @UseInterceptors(FileInterceptor('image'))
  async updateRecipe(
    @Body() body: Recipe,
    @UploadedFile()
    image: Express.Multer.File,
    @Param('id') id: string,
  ) {
    return this.recipeService.updateRecipe(body, image, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['chef'])
  @Delete('/:id')
  async deleteRecipe(@Param('id') id: string) {
    return this.recipeService.deleteRecipe(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['chef'])
  @Patch('/:id')
  async updateRecipeStatus(
    @Body() body: { status: 'draft' | 'published' },
    @Param('id') id: string,
  ) {
    return this.recipeService.updateStatus(id, body.status);
  }

  @Get('/ingredients/:id')
  async getRecipeIngredient(@Param('id') id: string) {
    return this.recipeService.getIngredient(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['chef'])
  @Post('/ingredients')
  async addRecipeIngredients(@Body() body: Ingredient[]) {
    return this.recipeService.addIngredients(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['chef'])
  @Patch('/ingredients/:id')
  async updateRecipeIngredients(
    @Body() body: Ingredient,
    @Param('id') id: string,
  ) {
    return this.recipeService.updateIngredient(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['chef'])
  @Post('/steps')
  async addRecipeSteps(@Body() body: Steps) {
    return this.recipeService.addSteps(body);
  }

  @Get('/steps/:id')
  async getRecipeSteps(@Param('id') id: string) {
    return this.recipeService.getSteps(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['chef'])
  @Put('/steps/:recipe_id')
  async updateRecipeSteps(@Body() body: Steps, @Param('recipe_id') id: string) {
    return this.recipeService.updateSteps(id, body);
  }
}
