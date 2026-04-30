import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from '../user/user.entity';
import { CargoType } from '../cargo-type/cargo-type.entity';
import { Permission } from '../permission/permission.entity';
import { Role } from '../role/role.entity';
import { SeedService } from './seed.service';
import { UserSeed } from './user.seed';
import { CargoSeed } from './cargo.seed';
import { PermissionSeed } from './permission.seed';
import { RoleSeed } from './role.seed';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forFeature([User, CargoType, Permission, Role]),
    DatabaseModule
  ],
  providers: [SeedService, UserSeed, CargoSeed, PermissionSeed, RoleSeed],
})
export class SeedModule {}