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
import { CargoTypeService } from './cargo-type.service';
import { CargoTypeModel, CreateCargoTypeDTO } from './cargo-type.dto';

@Controller('cargo-types')
export class CargoTypeController {
  constructor(private cargoTypeService: CargoTypeService) {}

  @Get()
  async getAllCargoTypes(): Promise<CargoTypeModel[]> {
    return this.cargoTypeService.getAllCargoTypes();
  }

  @Get('/:id')
  async getCargoTypeById(@Param('id') id: string): Promise<CargoTypeModel> {
    return this.cargoTypeService.getCargoTypeById(id);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  async createCargoType(@Body() data: CreateCargoTypeDTO): Promise<CargoTypeModel> {
    return this.cargoTypeService.createCargoType(data);
  }

  @Put()
  @UsePipes(new ValidationPipe())
  async updateCargoType(@Body() data: CreateCargoTypeDTO): Promise<CargoTypeModel> {
    return this.cargoTypeService.updateCargoType(data);
  }
}
