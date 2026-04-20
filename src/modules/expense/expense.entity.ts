import { Column, Entity, JoinColumn, ManyToOne, OneToMany, VirtualColumn } from 'typeorm';
import { BaseAppEntity } from '../../shared/base-app-entity';
import { ExpenseCategory, ExpenseModel, ExpenseType } from './expense.dto';

@Entity('expenses')
export class Expense extends BaseAppEntity<ExpenseModel> {
  @Column({ nullable: false, length: 120 })
  name: string;

  @Column({nullable: true})
  parentId?: string;

  @ManyToOne(() => Expense, { nullable: true })
  @JoinColumn({ name: 'parentId', referencedColumnName: 'uid' })
  parent?: Expense;

  @OneToMany(() => Expense, (expense) => expense.parent)
  @JoinColumn({ name: 'uid', referencedColumnName: 'parentId' })
  children?: Expense[];

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

  @Column({ default: false })
  isPurchase: boolean;

  @Column({ default: true })
  isActive: boolean;

  toDTO(options?: { eager: boolean }): ExpenseModel {
    return {
      id: this.uid,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      name: this.name,
      category: this.category,
      parentId: this.parentId,
      parent: this.parent ? this.parent.toDTO() : undefined,
      isPurchase: this.isPurchase,
      children: this.children ? this.children.map(child => child?.toDTO()) : undefined,
      type: this.type,
      description: this.description,
      isActive: this.isActive,
      status: this.isActive  ? 'Active' : 'Inactive',
      active: this.active,
      deleted: this.deleted,
      deletedAt: this.deletedAt?.toISOString(),
    };
  }
}
