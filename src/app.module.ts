import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { DatabaseModule } from './DbModule/db';
import { UsersModule } from './users/users.module';
import { UsersService } from './users/users.service';
import { RecipeModule } from './recipe/recipe.module';

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule, RecipeModule],
  controllers: [AppController],
  providers: [AppService, UsersService, AuthService],
})
export class AppModule {}
