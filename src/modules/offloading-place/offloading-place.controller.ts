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
import { OffloadingPlaceService } from './offloading-place.service';
import {
  CreateOffloadingPlaceDTO,
  OffloadingPlaceModel,
} from './offloading-place.dto';

@Controller('offloading-places')
export class OffloadingPlaceController {
  constructor(private offloadingPlaceService: OffloadingPlaceService) {}

  @Get()
  async getAllOffloadingPlaces(): Promise<OffloadingPlaceModel[]> {
    return this.offloadingPlaceService.getAllOffloadingPlaces();
  }

  @Get('/:id')
  async getOffloadingPlaceById(
    @Param('id') id: string,
  ): Promise<OffloadingPlaceModel> {
    return this.offloadingPlaceService.getOffloadingPlaceById(id);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  async createOffloadingPlace(
    @Body() data: CreateOffloadingPlaceDTO,
  ): Promise<OffloadingPlaceModel> {
    return this.offloadingPlaceService.createOffloadingPlace(data);
  }

  @Put()
  @UsePipes(new ValidationPipe())
  async updateOffloadingPlace(
    @Body() data: CreateOffloadingPlaceDTO,
  ): Promise<OffloadingPlaceModel> {
    return this.offloadingPlaceService.updateOffloadingPlace(data);
  }
}