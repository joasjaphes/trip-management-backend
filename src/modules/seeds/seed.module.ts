import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from '../user/user.entity';
import { CargoType } from '../cargo-type/cargo-type.entity';
import { SeedService } from './seed.service';
import { UserSeed } from './user.seed';
import { CargoSeed } from './cargo.seed';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forFeature([User, CargoType]),
    DatabaseModule
  ],
  providers: [SeedService, UserSeed, CargoSeed],
})
export class SeedModule {}