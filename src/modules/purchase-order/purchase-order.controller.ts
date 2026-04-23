import { Body, Controller, Get, Param, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreatePurchaseOrderDTO, PurchaseOrderModel } from './purchase-order.dto';
import { PurchaseOrderService } from './purchase-order.service';

@Controller('purchase-orders')
export class PurchaseOrderController {
  constructor(private purchaseOrderService: PurchaseOrderService) {}

  @Get()
  async getAllPurchaseOrders(): Promise<PurchaseOrderModel[]> {
    return this.purchaseOrderService.getAllPurchaseOrders();
  }

  @Get('/:id')
  async getPurchaseOrderById(@Param('id') id: string): Promise<PurchaseOrderModel> {
    return this.purchaseOrderService.getPurchaseOrderById(id);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  async createPurchaseOrder(@Body() data: CreatePurchaseOrderDTO): Promise<PurchaseOrderModel> {
    return this.purchaseOrderService.createPurchaseOrder(data);
  }

  @Put()
  @UsePipes(new ValidationPipe())
  async updatePurchaseOrder(@Body() data: CreatePurchaseOrderDTO): Promise<PurchaseOrderModel> {
    return this.purchaseOrderService.updatePurchaseOrder(data);
  }
}
