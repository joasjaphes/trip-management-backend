import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from '../../shared/entities';

const DATABASE_HOST = process.env.DATABASE_HOST;
const DATABASE_PORT: number = Number.parseInt('' + process.env.DATABASE_PORT);
const DATABASE_USERNAME = process.env.DATABASE_USERNAME;
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;
const DATABASE_NAME = process.env.DATABASE_NAME;
const isProduction = process.env.NODE_ENV === 'production';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: DATABASE_HOST,
            port: DATABASE_PORT,
            username: DATABASE_USERNAME,
            password: DATABASE_PASSWORD,
            database: DATABASE_NAME,
            entities,
            migrations: ['src/migrations/*.ts'],
            synchronize: !isProduction,

        }),
    ],
})
export class DatabaseModule { }