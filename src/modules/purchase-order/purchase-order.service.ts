import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { In, Repository } from 'typeorm';
import { Expense } from '../expense/expense.entity';
import { User } from '../user/user.entity';
import { Vendor } from '../vendor/vendor.entity';
import {
  CreatePurchaseOrderDTO,
  CreatePurchaseOrderItemDTO,
  PurchaseOrderModel,
} from './purchase-order.dto';
import { PurchaseOrderItem } from './purchase-order-item.entity';
import { PurchaseOrder } from './purchase-order.entity';

@Injectable()
export class PurchaseOrderService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private repository: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseOrderItem)
    private itemRepository: Repository<PurchaseOrderItem>,
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
  ) {}

  async createPurchaseOrder(data: CreatePurchaseOrderDTO): Promise<PurchaseOrderModel> {
    try {
      await this.validatePurchaseOrderReferences(data);

      const payload = this.repository.create({
        uid: data.id,
        purchaseOrderReferenceNumber: data.purchaseOrderReferenceNumber,
        vendorUid: data.vendorId,
        orderDate: new Date(data.orderDate),
        completionDate: data.completionDate ? new Date(data.completionDate) : undefined,
        approvedDate: data.approvedDate ? new Date(data.approvedDate) : undefined,
        completedByUserUid: data.completedByUserId,
        approvedByUserUid: data.approvedByUserId,
        orderStatus: data.orderStatus,
        orderItems: data.orderItems.map((item) =>
          this.itemRepository.create({
            uid: randomUUID(),
            itemUid: item.itemId,
            description: item.description,
            amount: Number(item.amount),
          }),
        ),
      });

      const saved = await this.repository.save(payload);
      const entity = await this.repository.findOne({
        where: { uid: saved.uid },
        relations: {
          vendor: true,
          completedByUser: true,
          approvedByUser: true,
          orderItems: { item: true },
        },
      });

      return (entity ?? saved).toDTO();
    } catch (e) {
      Logger.error('Failed to create purchase order', e);
      throw e;
    }
  }

  async updatePurchaseOrder(data: CreatePurchaseOrderDTO): Promise<PurchaseOrderModel> {
    try {
      const entity = await this.repository.findOne({
        where: { uid: data.id },
        relations: { orderItems: true },
      });
      if (!entity) {
        throw new NotFoundException(`Purchase order with ID ${data.id} does not exist`);
      }

      await this.validatePurchaseOrderReferences(data);

      entity.purchaseOrderReferenceNumber =
        data.purchaseOrderReferenceNumber || entity.purchaseOrderReferenceNumber;
      entity.vendorUid = data.vendorId || entity.vendorUid;
      entity.orderDate = data.orderDate ? new Date(data.orderDate) : entity.orderDate;
      entity.completionDate = data.completionDate ? new Date(data.completionDate) : entity.completionDate;
      entity.approvedDate = data.approvedDate ? new Date(data.approvedDate) : entity.approvedDate;
      entity.completedByUserUid = data.completedByUserId ?? entity.completedByUserUid;
      entity.approvedByUserUid = data.approvedByUserId ?? entity.approvedByUserUid;
      entity.orderStatus = data.orderStatus || entity.orderStatus;
      entity.orderItems = data.orderItems.map((item) =>
        this.itemRepository.create({
          uid: randomUUID(),
          purchaseOrderUid: entity.uid,
          itemUid: item.itemId,
          description: item.description,
          amount: Number(item.amount),
        }),
      );

      const updated = await this.repository.save(entity);
      const refreshed = await this.repository.findOne({
        where: { uid: updated.uid },
        relations: {
          vendor: true,
          completedByUser: true,
          approvedByUser: true,
          orderItems: { item: true },
        },
      });

      return (refreshed ?? updated).toDTO();
    } catch (e) {
      Logger.error('Failed to update purchase order', e);
      throw e;
    }
  }

  async getAllPurchaseOrders(): Promise<PurchaseOrderModel[]> {
    try {
      const entities = await this.repository.find({
        relations: {
          vendor: true,
          completedByUser: true,
          approvedByUser: true,
          orderItems: { item: true },
        },
      });
      return entities.map((entity) => entity.toDTO());
    } catch (e) {
      Logger.error('Failed to get purchase orders', e);
      throw e;
    }
  }

  async getPurchaseOrderById(id: string): Promise<PurchaseOrderModel> {
    try {
      const entity = await this.repository.findOne({
        where: { uid: id },
        relations: {
          vendor: true,
          completedByUser: true,
          approvedByUser: true,
          orderItems: { item: true },
        },
      });
      if (!entity) {
        throw new NotFoundException(`Purchase order with ID ${id} not found`);
      }
      return entity.toDTO();
    } catch (e) {
      Logger.error('Failed to get purchase order by id', e);
      throw e;
    }
  }

  private async validatePurchaseOrderReferences(data: CreatePurchaseOrderDTO): Promise<void> {
    const vendor = await this.vendorRepository.findOne({ where: { uid: data.vendorId } });
    if (!vendor) {
      throw new BadRequestException(`Vendor with ID ${data.vendorId} not found`);
    }

    await this.validateUserIfProvided(data.completedByUserId, 'completedByUserId');
    await this.validateUserIfProvided(data.approvedByUserId, 'approvedByUserId');
    await this.validateOrderItems(data.orderItems);
  }

  private async validateUserIfProvided(userId: string | undefined, fieldName: string): Promise<void> {
    if (!userId) {
      return;
    }

    const user = await this.userRepository.findOne({ where: { uid: userId } });
    if (!user) {
      throw new BadRequestException(`User with ID ${userId} not found for ${fieldName}`);
    }
  }

  private async validateOrderItems(orderItems: CreatePurchaseOrderItemDTO[]): Promise<void> {
    const itemIds = orderItems.map((item) => item.itemId);
    const uniqueItemIds = [...new Set(itemIds)];
    const expenses = await this.expenseRepository.find({ where: { uid: In(uniqueItemIds) } });
    const expenseMap = new Set(expenses.map((expense) => expense.uid));

    for (const itemId of uniqueItemIds) {
      if (!expenseMap.has(itemId)) {
        throw new BadRequestException(`Expense with ID ${itemId} not found for orderItems`);
      }
    }
  }
}
