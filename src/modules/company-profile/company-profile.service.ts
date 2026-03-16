import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CompanyProfileModel,
  CreateCompanyProfileDTO,
} from './company-profile.dto';
import { CompanyProfile } from './company-profile.entity';

@Injectable()
export class CompanyProfileService {
  constructor(
    @InjectRepository(CompanyProfile)
    private repository: Repository<CompanyProfile>,
  ) {}

  async createCompanyProfile(
    data: CreateCompanyProfileDTO,
  ): Promise<CompanyProfileModel> {
    try {
      const payload = this.repository.create({
        uid: data.id,
        companyName: data.companyName,
        tin: data.tin,
        vrn: data.vrn,
        country: data.country,
        region: data.region,
        district: data.district,
        street: data.street,
        plot: data.plot,
        logo: data.logo,
        postalAddress: data.postalAddress,
        description: data.description,
        isActive: data.isActive ?? true,
      });
      const saved = await this.repository.save(payload);
      return saved.toDTO();
    } catch (e) {
      Logger.error('Failed to create company profile', e);
      throw e;
    }
  }

  async updateCompanyProfile(
    data: CreateCompanyProfileDTO,
  ): Promise<CompanyProfileModel> {
    try {
      const entity = await this.repository.findOne({ where: { uid: data.id } });
      if (!entity) {
        throw new NotFoundException(
          `Company profile with ID ${data.id} does not exist`,
        );
      }

      entity.companyName = data.companyName || entity.companyName;
      entity.tin = data.tin || entity.tin;
      entity.vrn = data.vrn || entity.vrn;
      entity.country = data.country || entity.country;
      entity.region = data.region || entity.region;
      entity.district = data.district || entity.district;
      entity.street = data.street || entity.street;
      entity.plot = data.plot || entity.plot;
      entity.postalAddress = data.postalAddress || entity.postalAddress;
      entity.description = data.description ?? entity.description;
      if (data.isActive !== undefined) {
        entity.isActive = data.isActive;
      }

      const updated = await this.repository.save(entity);
      return updated.toDTO();
    } catch (e) {
      Logger.error('Failed to update company profile', e);
      throw e;
    }
  }

  async getAllCompanyProfiles(): Promise<CompanyProfileModel> {
    try {
      const entities = await this.repository.find();
      const profile = entities[0];
      if (!profile) {
        throw new NotFoundException('No company profiles found');
      }
      return profile.toDTO();
    } catch (e) {
      Logger.error('Failed to get company profiles', e);
      throw e;
    }
  }

  async getCompanyProfileById(id: string): Promise<CompanyProfileModel> {
    try {
      const entity = await this.repository.findOne({ where: { uid: id } });
      if (!entity) {
        throw new NotFoundException(`Company profile with ID ${id} not found`);
      }
      return entity.toDTO();
    } catch (e) {
      Logger.error('Failed to get company profile by id', e);
      throw e;
    }
  }
}
