import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseAppEntity } from '../../shared/base-app-entity';
import {
  InvoiceModel,
  InvoicePaymentStatus,
  InvoiceStatus,
} from './invoice.dto';
import { Trip } from '../trip/trip.entity';
import { Customer } from '../customer/customer.entity';

@Entity('invoices')
export class Invoice extends BaseAppEntity<InvoiceModel> {
  @Column({ nullable: false, unique: true, length: 50 })
  invoiceNumber: string;

  @Column({ nullable: false })
  tripUid: string;

  @Column({ nullable: false })
  customerUid: string;

  @Column({ type: 'float', nullable: false })
  amount: number;

  @Column({ type: 'float', nullable: false, default: 0 })
  paidAmount: number;

  @Column({
    type: 'enum',
    enum: InvoicePaymentStatus,
    default: InvoicePaymentStatus.UNPAID,
  })
  paymentStatus: InvoicePaymentStatus;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.ISSUED,
  })
  status: InvoiceStatus;

  @Column({ type: 'timestamptz', nullable: true })
  issuedAt?: Date;

  @ManyToOne(() => Trip, { nullable: false })
  @JoinColumn({ name: 'tripUid', referencedColumnName: 'uid' })
  trip: Trip;

  @ManyToOne(() => Customer, { nullable: false })
  @JoinColumn({ name: 'customerUid', referencedColumnName: 'uid' })
  customer: Customer;

  toDTO(options?: { eager: boolean }): InvoiceModel {
    return {
      id: this.uid,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      invoiceNumber: this.invoiceNumber,
      tripId: this.tripUid,
      customerId: this.customerUid,
      customer: this.customer?.toDTO(),
      trip: this.trip?.toDTO(),
      amount: this.amount,
      paidAmount: this.paidAmount,
      paymentStatus: this.paymentStatus,
      description: this.description,
      status: this.status,
      issuedAt: this.issuedAt?.toISOString(),
      active: this.active,
      deleted: this.deleted,
      deletedAt: this.deletedAt?.toISOString(),
    };
  }
}
