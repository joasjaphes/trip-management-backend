import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseAppEntity } from '../../shared/base-app-entity';
import { ExpenseTransactionModel } from './expense-transaction.dto';
import { Expense } from '../expense/expense.entity';

@Entity('expense_transactions')
export class ExpenseTransaction extends BaseAppEntity<ExpenseTransactionModel> {
  @Column({ nullable: false })
  expenseUid: string;

  @Column({ nullable: false, length: 120 })
  vendorName: string;

  @Column({ nullable: false, length: 60 })
  vendorTIN: string;

  @Column({ type: 'float', nullable: false })
  transactionAmount: number;

  @ManyToOne(() => Expense, (expense) => expense.transactions, { nullable: false })
  @JoinColumn({ name: 'expenseUid', referencedColumnName: 'uid' })
  expense: Expense;

  toDTO(options?: { eager: boolean }): ExpenseTransactionModel {
    return {
      id: this.uid,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      expenseId: this.expenseUid,
      vendorName: this.vendorName,
      vendorTIN: this.vendorTIN,
      transactionAmount: this.transactionAmount,
      active: this.active,
      deleted: this.deleted,
      deletedAt: this.deletedAt?.toISOString(),
    };
  }
}