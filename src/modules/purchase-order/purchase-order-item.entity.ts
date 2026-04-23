import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseAppEntity } from '../../shared/base-app-entity';
import { Expense } from '../expense/expense.entity';
import { PurchaseOrderItemModel } from './purchase-order.dto';
import { PurchaseOrder } from './purchase-order.entity';

@Entity('purchase_order_items')
export class PurchaseOrderItem extends BaseAppEntity<PurchaseOrderItemModel> {
  @Column({ nullable: false })
  purchaseOrderUid: string;

  @Column({ nullable: false })
  itemUid: string;

  @Column({ nullable: false, type: 'text' })
  description: string;

  @Column({ type: 'float', nullable: false })
  amount: number;

  @ManyToOne(() => PurchaseOrder, (purchaseOrder) => purchaseOrder.orderItems, { nullable: false })
  @JoinColumn({ name: 'purchaseOrderUid', referencedColumnName: 'uid' })
  purchaseOrder: PurchaseOrder;

  @ManyToOne(() => Expense, { nullable: false, eager: true })
  @JoinColumn({ name: 'itemUid', referencedColumnName: 'uid' })
  item: Expense;

  toDTO(options?: { eager: boolean }): PurchaseOrderItemModel {
    return {
      id: this.uid,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      itemId: this.itemUid,
      item: this.item?.toDTO(),
      description: this.description,
      amount: this.amount,
      active: this.active,
      deleted: this.deleted,
      deletedAt: this.deletedAt?.toISOString(),
    };
  }
}
