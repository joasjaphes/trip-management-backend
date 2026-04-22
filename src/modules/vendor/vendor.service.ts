import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { CreateVendorDTO, VendorModel } from './vendor.dto';
import { Vendor } from './vendor.entity';

@Injectable()
export class VendorService {
  constructor(
    @InjectRepository(Vendor)
    private repository: Repository<Vendor>,
  ) {}

  async createVendor(data: CreateVendorDTO): Promise<VendorModel> {
    try {
      const payload = this.repository.create({
        uid: data.id,
        vendorName: data.vendorName,
        vendorTIN: data.vendorTIN,
        vendorContact: data.vendorContact,
        vendorAddress: data.vendorAddress,
      });
      const saved = await this.repository.save(payload);
      return saved.toDTO();
    } catch (e) {
      Logger.error('Failed to create vendor', e);
      throw e;
    }
  }

  async updateVendor(data: CreateVendorDTO): Promise<VendorModel> {
    try {
      const entity = await this.repository.findOne({ where: { uid: data.id } });
      if (!entity) {
        throw new NotFoundException(`Vendor with ID ${data.id} does not exist`);
      }

      entity.vendorName = data.vendorName || entity.vendorName;
      entity.vendorTIN = data.vendorTIN ?? entity.vendorTIN;
      entity.vendorContact = data.vendorContact ?? entity.vendorContact;
      entity.vendorAddress = data.vendorAddress ?? entity.vendorAddress;

      const updated = await this.repository.save(entity);
      return updated.toDTO();
    } catch (e) {
      Logger.error('Failed to update vendor', e);
      throw e;
    }
  }

  async getAllVendors(): Promise<VendorModel[]> {
    try {
      const entities = await this.repository.find();
      return entities.map((entity) => entity.toDTO());
    } catch (e) {
      Logger.error('Failed to get vendors', e);
      throw e;
    }
  }

  async getVendorById(id: string): Promise<VendorModel> {
    try {
      const entity = await this.repository.findOne({ where: { uid: id } });
      if (!entity) {
        throw new NotFoundException(`Vendor with ID ${id} not found`);
      }
      return entity.toDTO();
    } catch (e) {
      Logger.error('Failed to get vendor by id', e);
      throw e;
    }
  }

  async findVendorById(id: string): Promise<Vendor> {
    const vendor = await this.repository.findOne({ where: { uid: id } });
    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }
    return vendor;
  }

  async findOrCreateVendorByDetails(data: {
    vendorName: string;
    vendorTIN?: string;
    vendorContact?: string;
    vendorAddress?: string;
  }): Promise<Vendor> {
    const vendorTIN = data.vendorTIN?.trim();
    const vendorName = data.vendorName.trim();

    let vendor = vendorTIN
      ? await this.repository.findOne({ where: { vendorTIN } })
      : await this.repository.findOne({ where: { vendorName } });

    if (!vendor) {
      vendor = this.repository.create({
        uid: randomUUID(),
        vendorName,
        vendorTIN,
        vendorContact: data.vendorContact,
        vendorAddress: data.vendorAddress,
      });
      vendor = await this.repository.save(vendor);
    }

    return vendor;
  }
}