import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseAppEntity } from '../../shared/base-app-entity';
import { User } from '../user/user.entity';
import { Vendor } from '../vendor/vendor.entity';
import { PurchaseOrderModel, PurchaseOrderStatus } from './purchase-order.dto';
import { PurchaseOrderItem } from './purchase-order-item.entity';

@Entity('purchase_orders')
export class PurchaseOrder extends BaseAppEntity<PurchaseOrderModel> {
  @Column({ nullable: false, unique: true, length: 120 })
  purchaseOrderReferenceNumber: string;

  @Column({ nullable: false })
  vendorUid: string;

  @Column({ type: 'timestamptz', nullable: false })
  orderDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completionDate?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  approvedDate?: Date;

  @Column({ nullable: true })
  completedByUserUid?: string;

  @Column({ nullable: true })
  approvedByUserUid?: string;

  @Column({
    type: 'enum',
    enum: PurchaseOrderStatus,
    default: PurchaseOrderStatus.PENDING,
  })
  orderStatus: PurchaseOrderStatus;

  @ManyToOne(() => Vendor, { nullable: false })
  @JoinColumn({ name: 'vendorUid', referencedColumnName: 'uid' })
  vendor: Vendor;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'completedByUserUid', referencedColumnName: 'uid' })
  completedByUser?: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approvedByUserUid', referencedColumnName: 'uid' })
  approvedByUser?: User;

  @OneToMany(() => PurchaseOrderItem, (orderItem) => orderItem.purchaseOrder, {
    cascade: true,
    eager: true,
    orphanedRowAction: 'delete',
  })
  orderItems: PurchaseOrderItem[];

  toDTO(options?: { eager: boolean }): PurchaseOrderModel {
    return {
      id: this.uid,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      purchaseOrderReferenceNumber: this.purchaseOrderReferenceNumber,
      vendorId: this.vendorUid,
      vendor: this.vendor?.toDTO(),
      orderDate: this.orderDate.toISOString(),
      completionDate: this.completionDate?.toISOString(),
      approvedDate: this.approvedDate?.toISOString(),
      completedByUserId: this.completedByUserUid,
      completedByUser: this.completedByUser?.toDTO(),
      approvedByUserId: this.approvedByUserUid,
      approvedByUser: this.approvedByUser?.toDTO(),
      orderStatus: this.orderStatus,
      orderItems: this.orderItems ? this.orderItems.map((item) => item.toDTO()) : [],
      active: this.active,
      deleted: this.deleted,
      deletedAt: this.deletedAt?.toISOString(),
    };
  }
}
