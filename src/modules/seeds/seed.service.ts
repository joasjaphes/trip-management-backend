import { Injectable, Logger } from '@nestjs/common';
import { UserSeed } from './user.seed';
import { CargoSeed } from './cargo.seed';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly userSeed: UserSeed,
    private readonly cargoSeed: CargoSeed,
  ) {}

  async run() {
    this.logger.log('Seeding started...');
    await this.userSeed.run();
    await this.cargoSeed.run();
    this.logger.log('Seeding completed.');
  }
}