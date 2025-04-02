import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Review } from './model/review';
import { ReviewService } from './reviews.service';

@Controller('reviews')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Get('/:recipe_id')
  async getReviews(@Param() id: number) {
    return await this.reviewService.getReviews(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:recipe_id')
  async postReview(@Body() body: Review, @Param() id: number) {
    return await this.reviewService.addReview(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:recipe_id')
  async editReview(@Body() body: Review, @Param() id: number) {
    return await this.reviewService.updateReview(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:recipe_id')
  async deleteReview(@Param() id: number) {
    return await this.reviewService.deleteReview(id);
  }
}
