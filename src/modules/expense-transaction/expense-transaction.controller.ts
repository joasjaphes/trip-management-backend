import { Body, Controller, Get, Param, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateExpenseTransactionDTO, ExpenseTransactionModel } from './expense-transaction.dto';
import { ExpenseTransactionService } from './expense-transaction.service';

@Controller('expenseTransactions')
export class ExpenseTransactionController {
  constructor(private expenseTransactionService: ExpenseTransactionService) {}

  @Get()
  async getAllExpenseTransactions(): Promise<ExpenseTransactionModel[]> {
    return this.expenseTransactionService.getAllExpenseTransactions();
  }

  @Get('/:id')
  async getExpenseTransactionById(@Param('id') id: string): Promise<ExpenseTransactionModel> {
    return this.expenseTransactionService.getExpenseTransactionById(id);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  async createExpenseTransaction(@Body() data: CreateExpenseTransactionDTO): Promise<ExpenseTransactionModel> {
    return this.expenseTransactionService.createExpenseTransaction(data);
  }

  @Put()
  @UsePipes(new ValidationPipe())
  async updateExpenseTransaction(@Body() data: CreateExpenseTransactionDTO): Promise<ExpenseTransactionModel> {
    return this.expenseTransactionService.updateExpenseTransaction(data);
  }
}