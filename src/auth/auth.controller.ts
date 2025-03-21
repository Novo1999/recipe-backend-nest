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
  signIn(@Body() signInDto: Record<string, string>) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @Post('register')
  signUp(@Body() signUpDto: Record<string, string>, @Query() query) {
    return this.authService.signUp(
      signUpDto.username,
      signUpDto.password,
      query.isChef,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
