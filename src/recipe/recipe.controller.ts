import {
  Body,
  Controller,
  Get,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
    console.log(image);
    return this.recipeService.addNewRecipe(body, image);
  }
}
