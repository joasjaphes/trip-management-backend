import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from './driver.entity';
import { CreateDriverDTO, DriverModel } from './driver.dto';

@Injectable()
export class DriverService {
  constructor(
    @InjectRepository(Driver)
    private repository: Repository<Driver>,
  ) {}

  async createDriver(data: CreateDriverDTO): Promise<DriverModel> {
    try {
      const payload = this.repository.create({
        uid: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        licenseNumber: data.licenseNumber,
        licenseIssueDate: new Date(data.licenseIssueDate),
        licenseExpiryDate: new Date(data.licenseExpiryDate),
        licenseClass: data.licenseClass,
        licenseFrontPagePhoto: data.licenseFrontPagePhoto,
        passportExpiryDate: data.passportExpiryDate ? new Date(data.passportExpiryDate) : undefined,
        passportNumber: data.passportNumber,
        driverPhoto: data.driverPhoto,
        isActive: data.isActive ?? true,
      });
      const saved = await this.repository.save(payload);
      return saved.toDTO();
    } catch (e) {
      Logger.error('Failed to create driver', e);
      throw e;
    }
  }

  async updateDriver(data: CreateDriverDTO): Promise<DriverModel> {
    try {
      const entity = await this.repository.findOne({ where: { uid: data.id } });
      if (!entity) {
        throw new NotFoundException(`Driver with ID ${data.id} does not exist`);
      }

      entity.firstName = data.firstName || entity.firstName;
      entity.lastName = data.lastName || entity.lastName;
      entity.email = data.email ?? entity.email;
      entity.phone = data.phone || entity.phone;
      entity.address = data.address ?? entity.address;
      entity.dateOfBirth = data.dateOfBirth
        ? new Date(data.dateOfBirth)
        : entity.dateOfBirth;
      entity.licenseNumber = data.licenseNumber || entity.licenseNumber;
      entity.licenseIssueDate = data.licenseIssueDate
        ? new Date(data.licenseIssueDate)
        : entity.licenseIssueDate;
      entity.licenseExpiryDate = data.licenseExpiryDate
        ? new Date(data.licenseExpiryDate)
        : entity.licenseExpiryDate;
      entity.licenseClass = data.licenseClass || entity.licenseClass;
      entity.licenseFrontPagePhoto =
        data.licenseFrontPagePhoto ?? entity.licenseFrontPagePhoto;
      entity.driverPhoto = data.driverPhoto ?? entity.driverPhoto;
      entity.passportExpiryDate = data.passportExpiryDate
        ? new Date(data.passportExpiryDate)
        : entity.passportExpiryDate;
      entity.passportNumber = data.passportNumber ?? entity.passportNumber;
      if (data.isActive !== undefined) {
        entity.isActive = data.isActive;
      }

      const updated = await this.repository.save(entity);
      return updated.toDTO();
    } catch (e) {
      Logger.error('Failed to update driver', e);
      throw e;
    }
  }

  async getAllDrivers(): Promise<DriverModel[]> {
    try {
      const entities = await this.repository.find();
      return entities.map((entity) => entity.toDTO());
    } catch (e) {
      Logger.error('Failed to get drivers', e);
      throw e;
    }
  }

  async getDriverById(id: string): Promise<DriverModel> {
    try {
      const entity = await this.repository.findOne({ where: { uid: id } });
      if (!entity) {
        throw new NotFoundException(`Driver with ID ${id} not found`);
      }
      return entity.toDTO();
    } catch (e) {
      Logger.error('Failed to get driver by id', e);
      throw e;
    }
  }
}
