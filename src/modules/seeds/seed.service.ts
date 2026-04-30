import { Injectable, Logger } from '@nestjs/common';
import { UserSeed } from './user.seed';
import { CargoSeed } from './cargo.seed';
import { PermissionSeed } from './permission.seed';
import { RoleSeed } from './role.seed';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly userSeed: UserSeed,
    private readonly cargoSeed: CargoSeed,
    private readonly permissionSeed: PermissionSeed,
    private readonly roleSeed: RoleSeed,
  ) {}

  async run() {
    this.logger.log('Seeding started...');
    await this.permissionSeed.run();
    await this.roleSeed.run();
    await this.userSeed.run();
    await this.cargoSeed.run();
    this.logger.log('Seeding completed.');
  }
}