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
import { TripService } from './trip.service';
import { CreateTripDTO, TripModel } from './trip.dto';

@Controller('trips')
export class TripController {
  constructor(private tripService: TripService) {}

  @Get()
  async getAllTrips(): Promise<TripModel[]> {
    return this.tripService.getAllTrips();
  }

  @Get('/:id')
  async getTripById(@Param('id') id: string): Promise<TripModel> {
    return this.tripService.getTripById(id);
  }

  @Get('inProgress/count')
  async getInprogressTripsCount(): Promise<{ count: number }> {
    return await this.tripService.getInprogressTripsCount();
  }

  @Post()
  @UsePipes(new ValidationPipe())
  async createTrip(@Body() data: CreateTripDTO): Promise<TripModel> {
    return this.tripService.createTrip(data);
  }

  @Put()
  @UsePipes(new ValidationPipe())
  async updateTrip(@Body() data: CreateTripDTO): Promise<TripModel> {
    return this.tripService.updateTrip(data);
  }
}
