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
import { VehiclePermitService } from './vehicle-permit.service';
import {
  CreateVehiclePermitDTO,
  VehiclePermitModel,
} from './vehicle-permit.dto';

@Controller('vehicle-permits')
export class VehiclePermitController {
  constructor(private vehiclePermitService: VehiclePermitService) {}

  @Get()
  async getAllVehiclePermits(): Promise<VehiclePermitModel[]> {
    return this.vehiclePermitService.getAllVehiclePermits();
  }

  @Get('/:id')
  async getVehiclePermitById(@Param('id') id: string): Promise<VehiclePermitModel> {
    return this.vehiclePermitService.getVehiclePermitById(id);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  async createVehiclePermit(
    @Body() data: CreateVehiclePermitDTO,
  ): Promise<VehiclePermitModel> {
    return this.vehiclePermitService.createVehiclePermit(data);
  }

  @Put()
  @UsePipes(new ValidationPipe())
  async updateVehiclePermit(
    @Body() data: CreateVehiclePermitDTO,
  ): Promise<VehiclePermitModel> {
    return this.vehiclePermitService.updateVehiclePermit(data);
  }
}
