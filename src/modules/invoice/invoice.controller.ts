import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDTO, InvoiceModel, InvoiceStatus } from './invoice.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

class UpdateInvoiceStatusDTO {
  @IsEnum(InvoiceStatus)
  @ApiProperty({ enum: InvoiceStatus })
  status: InvoiceStatus;
}

@Controller('invoices')
export class InvoiceController {
  constructor(private invoiceService: InvoiceService) {}

  @Get()
  async getAllInvoices(): Promise<InvoiceModel[]> {
    return this.invoiceService.getAllInvoices();
  }

  @Get('/:id')
  async getInvoiceById(@Param('id') id: string): Promise<InvoiceModel> {
    return this.invoiceService.getInvoiceById(id);
  }

  @Get('/trip/:tripId')
  async getInvoiceByTripId(@Param('tripId') tripId: string): Promise<InvoiceModel> {
    return this.invoiceService.getInvoiceByTripId(tripId);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  async generateInvoice(@Body() data: CreateInvoiceDTO): Promise<InvoiceModel> {
    return this.invoiceService.generateInvoiceForTrip(data);
  }

  @Patch('/:id/status')
  @UsePipes(new ValidationPipe())
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateInvoiceStatusDTO,
  ): Promise<InvoiceModel> {
    return this.invoiceService.updateInvoiceStatus(id, body.status);
  }
}
