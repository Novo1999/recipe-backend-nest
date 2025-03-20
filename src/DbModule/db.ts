import { Module } from '@nestjs/common';
import { config } from 'dotenv';
import postgres from 'postgres';

config({
  path: ['.env', '.env.production', '.env.local'],
});

const sql = postgres(process.env.DATABASE_URL || '', { ssl: 'require' });

const dbProvider = {
  provide: 'POSTGRES_POOL',
  useValue: sql,
};

@Module({
  providers: [dbProvider],
  exports: [dbProvider],
})
export class DatabaseModule {}
