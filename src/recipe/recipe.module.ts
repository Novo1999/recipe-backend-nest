import { Module } from '@nestjs/common';
import { DatabaseModule } from '../DbModule/db';
import { RecipeController } from './recipe.controller';
import { RecipeService } from './recipe.service';

@Module({
  imports: [DatabaseModule],
  providers: [RecipeService],
  controllers: [RecipeController],
})
export class RecipeModule {}

