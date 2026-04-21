import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from '../expense/expense.entity';
import { CreateExpenseTransactionDTO, ExpenseTransactionModel } from './expense-transaction.dto';
import { ExpenseTransaction } from './expense-transaction.entity';

@Injectable()
export class ExpenseTransactionService {
  constructor(
    @InjectRepository(ExpenseTransaction)
    private repository: Repository<ExpenseTransaction>,
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
  ) {}

  async createExpenseTransaction(data: CreateExpenseTransactionDTO): Promise<ExpenseTransactionModel> {
    try {
      await this.validateExpense(data.expenseId);

      const payload = this.repository.create({
        uid: data.id,
        expenseUid: data.expenseId,
        vendorName: data.vendorName,
        vendorTIN: data.vendorTIN,
        transactionAmount: data.transactionAmount,
      });

      const saved = await this.repository.save(payload);
      const entity = await this.repository.findOne({
        where: { uid: saved.uid },
        relations: { expense: true },
      });

      return (entity ?? saved).toDTO();
    } catch (e) {
      Logger.error('Failed to create expense transaction', e);
      throw e;
    }
  }

  async updateExpenseTransaction(data: CreateExpenseTransactionDTO): Promise<ExpenseTransactionModel> {
    try {
      const entity = await this.repository.findOne({ where: { uid: data.id } });
      if (!entity) {
        throw new NotFoundException(`Expense transaction with ID ${data.id} does not exist`);
      }

      const targetExpenseId = data.expenseId || entity.expenseUid;
      await this.validateExpense(targetExpenseId);

      entity.expenseUid = targetExpenseId;
      entity.vendorName = data.vendorName || entity.vendorName;
      entity.vendorTIN = data.vendorTIN || entity.vendorTIN;
      entity.transactionAmount = data.transactionAmount ?? entity.transactionAmount;

      const updated = await this.repository.save(entity);
      const refreshed = await this.repository.findOne({
        where: { uid: updated.uid },
        relations: { expense: true },
      });

      return (refreshed ?? updated).toDTO();
    } catch (e) {
      Logger.error('Failed to update expense transaction', e);
      throw e;
    }
  }

  async getAllExpenseTransactions(): Promise<ExpenseTransactionModel[]> {
    try {
      const entities = await this.repository.find({ relations: { expense: true } });
      return entities.map((entity) => entity.toDTO());
    } catch (e) {
      Logger.error('Failed to get expense transactions', e);
      throw e;
    }
  }

  async getExpenseTransactionById(id: string): Promise<ExpenseTransactionModel> {
    try {
      const entity = await this.repository.findOne({
        where: { uid: id },
        relations: { expense: true },
      });
      if (!entity) {
        throw new NotFoundException(`Expense transaction with ID ${id} not found`);
      }
      return entity.toDTO();
    } catch (e) {
      Logger.error('Failed to get expense transaction by id', e);
      throw e;
    }
  }

  private async validateExpense(expenseId: string): Promise<void> {
    const expense = await this.expenseRepository.findOne({ where: { uid: expenseId } });
    if (!expense) {
      throw new BadRequestException(`Expense with ID ${expenseId} not found`);
    }
  }
}