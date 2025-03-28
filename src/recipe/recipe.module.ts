import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { DatabaseModule } from '../DbModule/db';
import { RecipeController } from './recipe.controller';
import { RecipeService } from './recipe.service';

@Module({
  imports: [
    DatabaseModule,
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  providers: [RecipeService],
  controllers: [RecipeController],
})
export class RecipeModule {}

