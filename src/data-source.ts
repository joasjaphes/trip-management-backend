import 'dotenv/config';
import { DataSource } from 'typeorm';
import { entities } from './shared/entities';

const DATABASE_HOST = process.env.DATABASE_HOST ?? 'localhost';
const DATABASE_PORT = Number.parseInt(process.env.DATABASE_PORT ?? '5432', 10);
const DATABASE_USERNAME = process.env.DATABASE_USERNAME ?? 'postgres';
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD ?? 'postgres';
const DATABASE_NAME = process.env.DATABASE_NAME ?? 'trips';

export default new DataSource({
  type: 'postgres',
  host: DATABASE_HOST,
  port: DATABASE_PORT,
  username: DATABASE_USERNAME,
  password: DATABASE_PASSWORD,
  database: DATABASE_NAME,
  entities,
  migrations: ['src/migrations/*.ts'],
});
