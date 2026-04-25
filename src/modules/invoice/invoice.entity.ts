import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
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
  customerUid: string;

  @Column({ type: 'float', nullable: false })
  amount: number;

  @Column({ type: 'float', nullable: false, default: 0 })
  subtotal: number;

  @Column({ type: 'float', nullable: true, default: 0 })
  vatAmount?: number;

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

  @Column({ type: 'int', nullable: false, default: 1 })
  quantity: number;

  @Column({ nullable: true, default: 'TZS' })
  currency?: 'USD' | 'TZS';

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.ISSUED,
  })
  status: InvoiceStatus;

  @Column({ type: 'timestamptz', nullable: true })
  issuedAt?: Date;

  @OneToMany(() => Trip, (trip) => trip.invoice)
  trips: Trip[];

  @ManyToOne(() => Customer, { nullable: false })
  @JoinColumn({ name: 'customerUid', referencedColumnName: 'uid' })
  customer: Customer;

  toDTO(options?: { eager: boolean }): InvoiceModel {
    return {
      id: this.uid,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      invoiceNumber: this.invoiceNumber,
      tripIds: (this.trips ?? []).map((trip) => trip.uid),
      customerId: this.customerUid,
      customer: this.customer?.toDTO(),
      trips: (this.trips ?? []).map((trip) => trip.toDTO({ eager: true })),
      trucks: this.trips?.map(trip => `${trip.toDTO({eager:true}).vehicle?.registrationNo} & ${trip.toDTO({eager:true}).trailer?.registrationNo}`).join(', '),
      tripReferenceNumber: this.trips?.map((trip) => trip.tripReferenceNumber)?.join(', '),
      amount: this.amount,
      subtotal: this.subtotal,
      vatAmount: this.vatAmount,
      paidAmount: this.paidAmount,
      paymentStatus: this.paymentStatus,
      description: `${this.description} (${this.trips?.map(trip => trip.docNumber).join(', ')})`,
      quantity: this.quantity,
      rate: Number(this.subtotal) / Number(this.quantity || 1),
      status: this.status,
      issuedAt: this.issuedAt?.toISOString(),
      currency: this.currency,
      active: this.active,
      deleted: this.deleted,
      deletedAt: this.deletedAt?.toISOString(),
    };
  }
}
