import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './expense.entity';
import { CreateExpenseDTO, ExpenseModel } from './expense.dto';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private repository: Repository<Expense>,
  ) {}

  async createExpense(data: CreateExpenseDTO): Promise<ExpenseModel> {
    try {
      const payload = this.repository.create({
        uid: data.id,
        name: data.name,
        category: data.category,
        description: data.description,
        parentId: data.parentId,
        type: data.type,
        isActive: data.isActive ?? true,
      });
      const saved = await this.repository.save(payload);
      return saved.toDTO();
    } catch (e) {
      Logger.error('Failed to create expense', e);
      throw e;
    }
  }

  async updateExpense(data: CreateExpenseDTO): Promise<ExpenseModel> {
    try {
      const entity = await this.repository.findOne({ where: { uid: data.id } });
      if (!entity) {
        throw new NotFoundException(`Expense with ID ${data.id} does not exist`);
      }

      entity.name = data.name || entity.name;
      entity.category = data.category || entity.category;
      entity.description = data.description ?? entity.description;
      entity.parentId = data.parentId ?? entity.parentId;
      entity.type = data.type ?? entity.type;
      if (data.isActive !== undefined) {
        entity.isActive = data.isActive;
      }

      const updated = await this.repository.save(entity);
      return updated.toDTO();
    } catch (e) {
      Logger.error('Failed to update expense', e);
      throw e;
    }
  }

  async getAllExpenses(): Promise<ExpenseModel[]> {
    try {
      const entities = await this.repository.find({relations: ['parent', 'children']});
      return entities.map((entity) => entity.toDTO());
    } catch (e) {
      Logger.error('Failed to get expenses', e);
      throw e;
    }
  }

  async getExpenseById(id: string): Promise<ExpenseModel> {
    try {
      const entity = await this.repository.findOne({ where: { uid: id }, relations: ['parent', 'children'] });
      if (!entity) {
        throw new NotFoundException(`Expense with ID ${id} not found`);
      }
      return entity.toDTO();
    } catch (e) {
      Logger.error('Failed to get expense by id', e);
      throw e;
    }
  }
}
