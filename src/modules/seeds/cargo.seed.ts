import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import * as bcrypt from 'bcrypt';
import { makeId } from '../../shared/constants';
import { CargoType } from '../cargo-type/cargo-type.entity';

@Injectable()
export class CargoSeed {
    private readonly logger = new Logger(CargoSeed.name);

    constructor(
        @InjectRepository(CargoType)
        private readonly cargoTypeRepository: Repository<CargoType>,
    ) { }

    async run() {

        const defaultCargoTypes = [
            'Container',
            'Fuel',
        ]

        for (const cargoName of defaultCargoTypes) {
            const existingCargo = await this.cargoTypeRepository.findOne({
                where: { name: cargoName },
            });

            if (existingCargo) {
                this.logger.log(`Cargo type already exists: ${cargoName}`);
                continue;
            }

            const cargo = this.cargoTypeRepository.create({
                uid: makeId(),
                name: cargoName,
                isActive: true,
            });

            await this.cargoTypeRepository.save(cargo);

            this.logger.log(`Cargo type created: ${cargoName}`);
        }
    }
}

