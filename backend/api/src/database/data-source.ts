import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Task } from '../tasks/task.model.js';

const currentDir = dirname(fileURLToPath(import.meta.url));

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT || 5432),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,

  entities: [Task],
  migrations: [join(currentDir, 'migrations', '*.{js,ts}')],

  synchronize: false,
});
