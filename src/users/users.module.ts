import { Module } from '@nestjs/common';
import { DatabaseModule } from '../DbModule/db';
import { UsersService } from './users.service';

@Module({
  imports: [DatabaseModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
