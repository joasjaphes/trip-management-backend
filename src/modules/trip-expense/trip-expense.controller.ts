import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TripExpenseService } from './trip-expense.service';
import { CreateTripExpenseDTO, TripExpenseModel } from './trip-expense.dto';

@Controller('trip-expenses')
export class TripExpenseController {
  constructor(private tripExpenseService: TripExpenseService) {}

  @Get()
  async getAllTripExpenses(): Promise<TripExpenseModel[]> {
    return this.tripExpenseService.getAllTripExpenses();
  }

  @Get('/:id')
  async getTripExpenseById(@Param('id') id: string): Promise<TripExpenseModel> {
    return this.tripExpenseService.getTripExpenseById(id);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  async createTripExpense(@Body() data: CreateTripExpenseDTO): Promise<TripExpenseModel> {
    return this.tripExpenseService.createTripExpense(data);
  }

  @Put()
  @UsePipes(new ValidationPipe())
  async updateTripExpense(@Body() data: CreateTripExpenseDTO): Promise<TripExpenseModel> {
    return this.tripExpenseService.updateTripExpense(data);
  }

  @Delete('/:id')
  async deleteTripExpense(@Param('id') id: string): Promise<TripExpenseModel> {
    return this.tripExpenseService.deleteTripExpense(id);
  }
}
