import { Module } from '@nestjs/common';
import { DatabaseModule } from '../DbModule/db';
import { ReviewController } from './reviews.controller';
import { ReviewService } from './reviews.service';

@Module({
  imports: [DatabaseModule],
  providers: [ReviewService],
  controllers: [ReviewController],
})
export class ReviewModule {}
