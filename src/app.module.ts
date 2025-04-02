import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { DatabaseModule } from './DbModule/db';
import { RecipeModule } from './recipe/recipe.module';
import { ReviewModule } from './reviews/reviews.module';
import { UsersModule } from './users/users.module';
import { UsersService } from './users/users.service';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UsersModule,
    RecipeModule,
    ReviewModule,
  ],
  controllers: [AppController],
  providers: [AppService, UsersService, AuthService],
})
export class AppModule {}
