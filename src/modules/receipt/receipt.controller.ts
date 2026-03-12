import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateReceiptDTO, ReceiptModel } from './receipt.dto';
import { ReceiptService } from './receipt.service';

@Controller('receipts')
export class ReceiptController {
  constructor(private receiptService: ReceiptService) {}

  @Get()
  async getAllReceipts(): Promise<ReceiptModel[]> {
    return this.receiptService.getAllReceipts();
  }

  @Get('/:id')
  async getReceiptById(@Param('id') id: string): Promise<ReceiptModel> {
    return this.receiptService.getReceiptById(id);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  async createReceipt(@Body() data: CreateReceiptDTO): Promise<ReceiptModel> {
    return this.receiptService.createReceipt(data);
  }

  @Put()
  @UsePipes(new ValidationPipe())
  async updateReceipt(@Body() data: CreateReceiptDTO): Promise<ReceiptModel> {
    return this.receiptService.updateReceipt(data);
  }
}
