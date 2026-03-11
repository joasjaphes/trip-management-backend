import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseAppEntity } from '../../shared/base-app-entity';
import { ReceiptModel } from './receipt.dto';
import { Invoice } from '../invoice/invoice.entity';

@Entity('receipts')
export class Receipt extends BaseAppEntity<ReceiptModel> {
  @Column({ nullable: false })
  invoiceUid: string;

  @Column({ type: 'float', nullable: false })
  amount: number;

  @Column({ type: 'timestamptz', nullable: false })
  paidAt: Date;

  @Column({ nullable: true, length: 120 })
  reference?: string;

  @Column({ nullable: true, type: 'text' })
  notes?: string;

  @Column({ nullable: true, type: 'text' })
  attachment?: string;

  @ManyToOne(() => Invoice, { nullable: false })
  @JoinColumn({ name: 'invoiceUid', referencedColumnName: 'uid' })
  invoice: Invoice;

  toDTO(options?: { eager: boolean }): ReceiptModel {
    return {
      id: this.uid,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      invoiceId: this.invoiceUid,
      invoice: this.invoice?.toDTO(),
      amount: this.amount,
      paidAt: this.paidAt.toISOString(),
      reference: this.reference,
      notes: this.notes,
      attachment: this.attachment,
      active: this.active,
      deleted: this.deleted,
      deletedAt: this.deletedAt?.toISOString(),
    };
  }
}
