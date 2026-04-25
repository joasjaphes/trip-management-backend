import { Body, Controller, Get, Param, Post, Put, Request, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { CurrentUserInterceptor } from '../../interceptors/current-user.interceptor';
import {
  ApprovePurchaseOrderDTO,
  CompletePurchaseOrderDTO,
  CreatePurchaseOrderDTO,
  PurchaseOrderModel,
} from './purchase-order.dto';
import { PurchaseOrderService } from './purchase-order.service';

@Controller('purchaseOrders')
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

  @Put('/:id/approve')
  @UseInterceptors(CurrentUserInterceptor)
  @UsePipes(new ValidationPipe())
  async approvePurchaseOrder(
    @Param('id') id: string,
    @Body() data: ApprovePurchaseOrderDTO,
    @Request() req: any,
  ): Promise<PurchaseOrderModel> {
    return this.purchaseOrderService.approvePurchaseOrder(id, data, req.currentUser?.uid ?? req.currentUser?.id);
  }

  @Put('/:id/complete')
  @UseInterceptors(CurrentUserInterceptor)
  @UsePipes(new ValidationPipe())
  async completePurchaseOrder(
    @Param('id') id: string,
    @Body() data: CompletePurchaseOrderDTO,
    @Request() req: any,
  ): Promise<PurchaseOrderModel> {
    return this.purchaseOrderService.completePurchaseOrder(id, data, req.currentUser?.uid ?? req.currentUser?.id);
  }
}
