import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Put,
  Patch,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TripService } from './trip.service';
import {
  CreateTripDTO,
  TripModel,
  TripSummaryQueryDTO,
  TripSummaryStats,
  UpdateTripActualPositionDTO,
} from './trip.dto';

@Controller('trips')
export class TripController {
  constructor(private tripService: TripService) {}

  @Get()
  async getAllTrips(): Promise<TripModel[]> {
    return this.tripService.getAllTrips();
  }

  @Get('stats')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getTripSummaryStats(
    @Query() query: TripSummaryQueryDTO,
  ): Promise<TripSummaryStats> {
    return this.tripService.getTripSummaryStats(query);
  }

  @Get('inProgress/count')
  async getInprogressTripsCount(): Promise<{ count: number }> {
    return await this.tripService.getInprogressTripsCount();
  }

  @Get('/:id')
  async getTripById(@Param('id') id: string): Promise<TripModel> {
    return this.tripService.getTripById(id);
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

  @Patch('/:id/actualPosition')
  @UsePipes(new ValidationPipe())
  async updateTripActualPosition(
    @Param('id') id: string,
    @Body() data: UpdateTripActualPositionDTO,
  ): Promise<TripModel> {
    return this.tripService.updateTripActualPosition(id, data.tripActualPosition);
  }
}
