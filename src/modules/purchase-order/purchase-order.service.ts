import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { EntityManager, In, Repository } from 'typeorm';
import { Expense } from '../expense/expense.entity';
import { User } from '../user/user.entity';
import { Vendor } from '../vendor/vendor.entity';
import {
  ApprovePurchaseOrderDTO,
  CompletePurchaseOrderDTO,
  CreatePurchaseOrderDTO,
  CreatePurchaseOrderItemDTO,
  PurchaseOrderModel,
  PurchaseOrderStatus,
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
      const vendor = await this.resolveVendor(data);
      await this.validatePurchaseOrderReferences(data);

      const payload = this.repository.create({
        uid: data.id,
        purchaseOrderReferenceNumber: `PO-${new Date().getTime()}`,
        vendorUid: vendor.uid,
        vendor,
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

      const vendor = await this.resolveVendor(data, entity.vendorUid);
      await this.validatePurchaseOrderReferences(data);

      entity.purchaseOrderReferenceNumber = entity.purchaseOrderReferenceNumber;
      entity.vendorUid = vendor.uid;
      entity.vendor = vendor;
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

  async approvePurchaseOrder(
    id: string,
    data: ApprovePurchaseOrderDTO,
    actorUserId?: string,
  ): Promise<PurchaseOrderModel> {
    try {
      const entity = await this.repository.findOne({ where: { uid: id } });
      if (!entity) {
        throw new NotFoundException(`Purchase order with ID ${id} not found`);
      }

      if (entity.orderStatus === PurchaseOrderStatus.COMPLETED) {
        throw new BadRequestException('Completed purchase orders cannot be approved again');
      }

      await this.validateUserIfProvided(actorUserId, 'approvedByUserId');
      await this.validateOrderItems(data.orderItems);

      await this.repository.manager.transaction(async (manager) => {
        const transactionRepository = manager.getRepository(PurchaseOrder);
        const purchaseOrder = await transactionRepository.findOne({ where: { uid: id } });
        if (!purchaseOrder) {
          throw new NotFoundException(`Purchase order with ID ${id} not found`);
        }

        purchaseOrder.orderStatus = PurchaseOrderStatus.APPROVED;
        purchaseOrder.approvedDate = data.approvedDate ? new Date(data.approvedDate) : new Date();
        purchaseOrder.approvedByUserUid = actorUserId ?? purchaseOrder.approvedByUserUid;

        await transactionRepository.save(purchaseOrder);
        await this.replaceOrderItems(manager, purchaseOrder.uid, data.orderItems);
      });

      return this.getPurchaseOrderById(id);
    } catch (e) {
      Logger.error('Failed to approve purchase order', e);
      throw e;
    }
  }

  async completePurchaseOrder(
    id: string,
    data: CompletePurchaseOrderDTO,
    actorUserId?: string,
  ): Promise<PurchaseOrderModel> {
    try {
      const entity = await this.repository.findOne({ where: { uid: id } });
      if (!entity) {
        throw new NotFoundException(`Purchase order with ID ${id} not found`);
      }

      if (entity.orderStatus === PurchaseOrderStatus.PENDING) {
        throw new BadRequestException('Purchase order must be approved before completion');
      }

      await this.validateUserIfProvided(actorUserId, 'completedByUserId');
      await this.validateOrderItems(data.orderItems);

      await this.repository.manager.transaction(async (manager) => {
        const transactionRepository = manager.getRepository(PurchaseOrder);
        const purchaseOrder = await transactionRepository.findOne({ where: { uid: id } });
        if (!purchaseOrder) {
          throw new NotFoundException(`Purchase order with ID ${id} not found`);
        }

        purchaseOrder.orderStatus = PurchaseOrderStatus.COMPLETED;
        purchaseOrder.completionDate = data.completionDate ? new Date(data.completionDate) : new Date();
        purchaseOrder.completedByUserUid = actorUserId ?? purchaseOrder.completedByUserUid;
        purchaseOrder.completionAttachment = data.completionAttachment ?? purchaseOrder.completionAttachment;

        await transactionRepository.save(purchaseOrder);
        await this.replaceOrderItems(manager, purchaseOrder.uid, data.orderItems);
      });

      return this.getPurchaseOrderById(id);
    } catch (e) {
      Logger.error('Failed to complete purchase order', e);
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
    await this.validateUserIfProvided(data.completedByUserId, 'completedByUserId');
    await this.validateUserIfProvided(data.approvedByUserId, 'approvedByUserId');
    await this.validateOrderItems(data.orderItems);
  }

  private async resolveVendor(
    data: Pick<CreatePurchaseOrderDTO, 'vendorId' | 'vendorName' | 'vendorTIN'>,
    currentVendorId?: string,
  ): Promise<Vendor> {
    const vendorId = data.vendorId?.trim();
    if (vendorId) {
      return this.validateVendor(vendorId);
    }

    const vendorName = data.vendorName?.trim();
    if (vendorName) {
      const vendorTIN = data.vendorTIN?.trim();
      let vendor = vendorTIN
        ? await this.vendorRepository.findOne({ where: { vendorTIN } })
        : await this.vendorRepository.findOne({ where: { vendorName } });

      if (!vendor) {
        vendor = this.vendorRepository.create({
          uid: randomUUID(),
          vendorName,
          vendorTIN,
        });
        vendor = await this.vendorRepository.save(vendor);
      }

      return vendor;
    }

    if (currentVendorId) {
      return this.validateVendor(currentVendorId);
    }

    throw new BadRequestException('vendorId or vendorName is required');
  }

  private async validateVendor(vendorId: string): Promise<Vendor> {
    const vendor = await this.vendorRepository.findOne({ where: { uid: vendorId } });
    if (!vendor) {
      throw new BadRequestException(`Vendor with ID ${vendorId} not found`);
    }
    return vendor;
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

  private async replaceOrderItems(
    manager: EntityManager,
    purchaseOrderUid: string,
    orderItems: CreatePurchaseOrderItemDTO[],
  ): Promise<void> {
    const transactionItemRepository = manager.getRepository(PurchaseOrderItem);

    await transactionItemRepository.delete({ purchaseOrderUid });

    const replacementItems = orderItems.map((item) =>
      transactionItemRepository.create({
        uid: randomUUID(),
        purchaseOrderUid,
        itemUid: item.itemId,
        description: item.description,
        amount: Number(item.amount),
      }),
    );

    await transactionItemRepository.save(replacementItems);
  }
}
