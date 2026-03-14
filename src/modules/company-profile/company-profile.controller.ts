import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  CompanyProfileModel,
  CreateCompanyProfileDTO,
} from './company-profile.dto';
import { CompanyProfileService } from './company-profile.service';

@Controller('company-profiles')
export class CompanyProfileController {
  constructor(private companyProfileService: CompanyProfileService) {}

  @Get()
  async getAllCompanyProfiles(): Promise<CompanyProfileModel[]> {
    return this.companyProfileService.getAllCompanyProfiles();
  }

  @Get('/:id')
  async getCompanyProfileById(
    @Param('id') id: string,
  ): Promise<CompanyProfileModel> {
    return this.companyProfileService.getCompanyProfileById(id);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  async createCompanyProfile(
    @Body() data: CreateCompanyProfileDTO,
  ): Promise<CompanyProfileModel> {
    return this.companyProfileService.createCompanyProfile(data);
  }

  @Put()
  @UsePipes(new ValidationPipe())
  async updateCompanyProfile(
    @Body() data: CreateCompanyProfileDTO,
  ): Promise<CompanyProfileModel> {
    return this.companyProfileService.updateCompanyProfile(data);
  }
}
