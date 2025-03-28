import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: Record<string, string | boolean>) {
    return this.authService.signIn(
      signInDto.username as string,
      signInDto.password as string,
      signInDto.is_chef as boolean,
    );
  }

  @Post('register')
  signUp(
    @Body() signUpDto: Record<string, string>,
    @Query() query: { is_chef: string },
  ) {
    return this.authService.signUp(
      signUpDto.username,
      signUpDto.password,
      query.is_chef,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
