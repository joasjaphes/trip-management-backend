import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseAppEntity } from '../../shared/base-app-entity';
import { TripExpenseModel } from './trip-expense.dto';
import { Trip } from '../trip/trip.entity';
import { Expense } from '../expense/expense.entity';

@Entity('trip_expenses')
export class TripExpense extends BaseAppEntity<TripExpenseModel> {
  @Column({ nullable: false })
  tripUid: string;

  @Column({ nullable: false })
  expenseUid: string;

  @Column({ type: 'float', nullable: false })
  amount: number;

  @Column({ nullable: true, type: 'text' })
  receiptAttachment?: string;

  @Column({ type: 'timestamptz', nullable: true })
  date?: Date;

  @ManyToOne(() => Trip, (trip) => trip.expenses, { nullable: false })
  @JoinColumn({ name: 'tripUid', referencedColumnName: 'uid' })
  trip: Trip;

  @ManyToOne(() => Expense, { nullable: false,eager: true })
  @JoinColumn({ name: 'expenseUid', referencedColumnName: 'uid' })
  expense: Expense;

  toDTO(options?: { eager: boolean }): TripExpenseModel {
    console.log('expense', this.expense);
    return {
      id: this.uid,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      tripId: this.tripUid,
      expenseId: this.expenseUid,
      expenseDescription: this.expense?.name,
      amount: this.amount,
      receiptAttachment: this.receiptAttachment,
      date: this.date ? new Date(this.date).toISOString() : '',
      active: this.active,
      deleted: this.deleted,
      deletedAt: this.deletedAt?.toISOString(),
    };
  }
}
