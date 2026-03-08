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
import { DriverService } from './driver.service';
import { CreateDriverDTO, DriverModel } from './driver.dto';

@Controller('drivers')
export class DriverController {
  constructor(private driverService: DriverService) {}

  @Get()
  async getAllDrivers(): Promise<DriverModel[]> {
    return this.driverService.getAllDrivers();
  }

  @Get('/:id')
  async getDriverById(@Param('id') id: string): Promise<DriverModel> {
    return this.driverService.getDriverById(id);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  async createDriver(@Body() data: CreateDriverDTO): Promise<DriverModel> {
    return this.driverService.createDriver(data);
  }

  @Put()
  @UsePipes(new ValidationPipe())
  async updateDriver(@Body() data: CreateDriverDTO): Promise<DriverModel> {
    return this.driverService.updateDriver(data);
  }
}
