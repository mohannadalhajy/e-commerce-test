// database.module.ts
import { Module } from '@nestjs/common';
import { Pool } from 'pg';
import {
  DB_HOST,
  DB_NAME,
  DB_PASSWORD,
  DB_PORT,
  DB_USER,
} from 'src/config/server.config';

const poolProvider = {
  provide: 'DATABASE_POOL',
  useFactory: async () => {
    const pool = new Pool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
    });

    return pool;
  },
};

@Module({
  providers: [poolProvider],
  exports: [poolProvider],
})
export class DatabaseModule {}
