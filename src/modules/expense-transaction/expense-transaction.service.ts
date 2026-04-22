import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { Expense } from '../expense/expense.entity';
import { CreateExpenseTransactionDTO, ExpenseTransactionModel } from './expense-transaction.dto';
import { ExpenseTransaction } from './expense-transaction.entity';
import { Vendor } from '../vendor/vendor.entity';

@Injectable()
export class ExpenseTransactionService {
  constructor(
    @InjectRepository(ExpenseTransaction)
    private repository: Repository<ExpenseTransaction>,
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
  ) {}

  async createExpenseTransaction(data: CreateExpenseTransactionDTO): Promise<ExpenseTransactionModel> {
    try {
      await this.validateExpense(data.expenseId);
      const transactionAmount = Number(data.transactionAmount);
      const unitPrice = Number(data.unitPrice);
      const quantity = Number(data.quantity);
      const vendor = await this.resolveVendor(data);

      const payload = this.repository.create({
        uid: data.id,
        expenseUid: data.expenseId,
        vendorUid: vendor.uid,
        vendor,
        description: data.description,
        transactionAmount,
        transactionDate: new Date(data.transactionDate),
        unitPrice,
        quantity,
        attachment: data.attachment,
      });

      const saved = await this.repository.save(payload);
      const entity = await this.repository.findOne({
        where: { uid: saved.uid },
        relations: { expense: true, vendor: true },
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
      const vendor = await this.resolveVendor(data, entity.vendorUid);

      entity.expenseUid = targetExpenseId;
      entity.vendorUid = vendor.uid;
      entity.vendor = vendor;
      entity.description = data.description ?? entity.description;
      entity.transactionAmount =
        data.transactionAmount !== undefined
          ? Number(data.transactionAmount)
          : entity.transactionAmount;
      entity.transactionDate = data.transactionDate ? new Date(data.transactionDate) : entity.transactionDate;
      entity.unitPrice = data.unitPrice !== undefined ? Number(data.unitPrice) : entity.unitPrice;
      entity.quantity = data.quantity !== undefined ? Number(data.quantity) : entity.quantity;
      entity.attachment = data.attachment ?? entity.attachment;

      const updated = await this.repository.save(entity);
      const refreshed = await this.repository.findOne({
        where: { uid: updated.uid },
        relations: { expense: true, vendor: true },
      });

      return (refreshed ?? updated).toDTO();
    } catch (e) {
      Logger.error('Failed to update expense transaction', e);
      throw e;
    }
  }

  async getAllExpenseTransactions(): Promise<ExpenseTransactionModel[]> {
    try {
      const entities = await this.repository.find({ relations: { expense: true, vendor: true } });
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
        relations: { expense: true, vendor: true },
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

  private async resolveVendor(
    data: Pick<CreateExpenseTransactionDTO, 'vendorId' | 'vendorName' | 'vendorTIN'>,
    currentVendorId?: string,
  ): Promise<Vendor> {
    if (data.vendorId) {
      return this.validateVendor(data.vendorId);
    }

    if (data.vendorName) {
      const vendorTIN = data.vendorTIN?.trim();
      const vendorName = data.vendorName.trim();
      let vendor = vendorTIN
        ? await this.vendorRepository.findOne({ where: { vendorTIN } })
        : await this.vendorRepository.findOne({ where: { vendorName } });

      if (!vendor) {
        vendor = this.vendorRepository.create({
          uid: randomUUID(),
          vendorName,
          vendorTIN,
        });
        vendor = await this.vendorRepository.save(vendor);
      }

      return vendor;
    }

    if (currentVendorId) {
      return this.validateVendor(currentVendorId);
    }

    throw new BadRequestException('vendorId or vendorName is required');
  }

  private async validateVendor(vendorId: string): Promise<Vendor> {
    const vendor = await this.vendorRepository.findOne({ where: { uid: vendorId } });
    if (!vendor) {
      throw new BadRequestException(`Vendor with ID ${vendorId} not found`);
    }
    return vendor;
  }
}