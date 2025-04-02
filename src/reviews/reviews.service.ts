import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Review } from './model/review';

@Injectable()
export class ReviewService {
  constructor(@Inject('POSTGRES_POOL') private readonly sql: any) {}

  async getReviews(recipeId: number) {
    try {
      const reviews = await this.sql`
      SELECT * FROM reviews
      WHERE recipe_id = ${recipeId}`;
      return reviews;
    } catch (error) {
      if (error)
        throw new HttpException(
          'Failed to get review',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
  }

  async addReview(recipeId: number, review: Review) {
    try {
      const newReview = await this.sql`
      INSERT INTO reviews(recipe_id, rating, review_text)
      VALUES(${recipeId}, ${review.rating}, ${review.review_text})
      RETURNING *`;
      return newReview;
    } catch (error) {
      if (error)
        throw new HttpException(
          'Failed to add review',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
  }

  async updateReview(reviewId: number, review: Review) {
    try {
      const update = await this.sql`
      UPDATE reviews 
      set rating = ${review.rating}, review_text = ${review.review_text})
      WHERE id = ${reviewId}
      RETURNING *`;
      return update;
    } catch (error) {
      if (error)
        throw new HttpException(
          'Failed to edit review',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
  }

  async deleteReview(reviewId: number) {
    try {
      const deleted = await this.sql`
      DELETE FROM reviews
      WHERE id = ${reviewId}`;
      return deleted;
    } catch (error) {
      if (error)
        throw new HttpException(
          'Failed to delete review',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
  }
}
