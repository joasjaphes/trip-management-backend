import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseAppEntity } from '../../shared/base-app-entity';
import { ExpenseTransactionModel } from './expense-transaction.dto';
import { Expense } from '../expense/expense.entity';
import { Vendor } from '../vendor/vendor.entity';

@Entity('expense_transactions')
export class ExpenseTransaction extends BaseAppEntity<ExpenseTransactionModel> {
  @Column({ nullable: false })
  expenseUid: string;

  @Column({ nullable: false })
  vendorUid: string;

  @Column({ nullable: true, type: 'text' })
  description?: string;

  @Column({ type: 'float', nullable: false })
  transactionAmount: number;

  @Column({ type: 'timestamptz', nullable: false })
  transactionDate: Date;

  @Column({ type: 'float', nullable: false })
  unitPrice: number;

  @Column({ type: 'float', nullable: false })
  quantity: number;

  @Column({ nullable: true, type: 'text' })
  attachment?: string;

  @ManyToOne(() => Expense, (expense) => expense.transactions, { nullable: false })
  @JoinColumn({ name: 'expenseUid', referencedColumnName: 'uid' })
  expense: Expense;

  @ManyToOne(() => Vendor, { nullable: false })
  @JoinColumn({ name: 'vendorUid', referencedColumnName: 'uid' })
  vendor: Vendor;

  toDTO(options?: { eager: boolean }): ExpenseTransactionModel {
    return {
      id: this.uid,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      expenseId: this.expenseUid,
      vendorId: this.vendorUid,
      vendor: this.vendor?.toDTO(),
      vendorName: this.vendor?.vendorName,
      vendorTIN: this.vendor?.vendorTIN,
      description: this.description,
      transactionAmount: this.transactionAmount,
      transactionDate: this.transactionDate.toISOString(),
      unitPrice: this.unitPrice,
      quantity: this.quantity,
      attachment: this.attachment,
      active: this.active,
      deleted: this.deleted,
      deletedAt: this.deletedAt?.toISOString(),
    };
  }
}