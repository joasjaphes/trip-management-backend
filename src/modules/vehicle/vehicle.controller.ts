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
import { VehicleService } from './vehicle.service';
import { CreateVehicleDTO, VehicleModel } from './vehicle.dto';

@Controller('vehicles')
export class VehicleController {
  constructor(private vehicleService: VehicleService) {}

  @Get()
  async getAllVehicles(): Promise<VehicleModel[]> {
    return this.vehicleService.getAllVehicles();
  }

  @Get('/:id')
  async getVehicleById(@Param('id') id: string): Promise<VehicleModel> {
    return this.vehicleService.getVehicleById(id);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  async createVehicle(@Body() data: CreateVehicleDTO): Promise<VehicleModel> {
    return this.vehicleService.createVehicle(data);
  }

  @Put()
  @UsePipes(new ValidationPipe())
  async updateVehicle(@Body() data: CreateVehicleDTO): Promise<VehicleModel> {
    return this.vehicleService.updateVehicle(data);
  }
}
