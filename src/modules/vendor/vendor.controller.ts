import { Body, Controller, Get, Param, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateVendorDTO, VendorModel } from './vendor.dto';
import { VendorService } from './vendor.service';

@Controller('vendors')
export class VendorController {
  constructor(private vendorService: VendorService) {}

  @Get()
  async getAllVendors(): Promise<VendorModel[]> {
    return this.vendorService.getAllVendors();
  }

  @Get('/:id')
  async getVendorById(@Param('id') id: string): Promise<VendorModel> {
    return this.vendorService.getVendorById(id);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  async createVendor(@Body() data: CreateVendorDTO): Promise<VendorModel> {
    return this.vendorService.createVendor(data);
  }

  @Put()
  @UsePipes(new ValidationPipe())
  async updateVendor(@Body() data: CreateVendorDTO): Promise<VendorModel> {
    return this.vendorService.updateVendor(data);
  }
}