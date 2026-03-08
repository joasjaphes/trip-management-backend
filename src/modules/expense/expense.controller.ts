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
import { ExpenseService } from './expense.service';
import { CreateExpenseDTO, ExpenseModel } from './expense.dto';

@Controller('expenses')
export class ExpenseController {
  constructor(private expenseService: ExpenseService) {}

  @Get()
  async getAllExpenses(): Promise<ExpenseModel[]> {
    return this.expenseService.getAllExpenses();
  }

  @Get('/:id')
  async getExpenseById(@Param('id') id: string): Promise<ExpenseModel> {
    return this.expenseService.getExpenseById(id);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  async createExpense(@Body() data: CreateExpenseDTO): Promise<ExpenseModel> {
    return this.expenseService.createExpense(data);
  }

  @Put()
  @UsePipes(new ValidationPipe())
  async updateExpense(@Body() data: CreateExpenseDTO): Promise<ExpenseModel> {
    return this.expenseService.updateExpense(data);
  }
}
