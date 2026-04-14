import { Column, Entity } from 'typeorm';
import { BaseAppEntity } from '../../shared/base-app-entity';
import { ExpenseCategory, ExpenseModel, ExpenseType } from './expense.dto';

@Entity('expenses')
export class Expense extends BaseAppEntity<ExpenseModel> {
  @Column({ nullable: false, length: 120 })
  name: string;

  @Column({
    type: 'enum',
    enum: ExpenseCategory,
    default: ExpenseCategory.GENERAL,
  })
  category: ExpenseCategory;

  @Column({ nullable: true, type: 'text' })
  description?: string;

  @Column({
    type: 'enum',
    enum: ExpenseType,
    default: ExpenseType.TRIP,
  })
  type: ExpenseType;

  @Column({ default: true })
  isActive: boolean;

  toDTO(options?: { eager: boolean }): ExpenseModel {
    return {
      id: this.uid,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      name: this.name,
      category: this.category,
      type: this.type,
      description: this.description,
      isActive: this.isActive,
      active: this.active,
      deleted: this.deleted,
      deletedAt: this.deletedAt?.toISOString(),
    };
  }
}
