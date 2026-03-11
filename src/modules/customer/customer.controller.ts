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
import { CustomerService } from './customer.service';
import { CreateCustomerDTO, CustomerModel } from './customer.dto';

@Controller('customers')
export class CustomerController {
  constructor(private customerService: CustomerService) {}

  @Get()
  async getAllCustomers(): Promise<CustomerModel[]> {
    return this.customerService.getAllCustomers();
  }

  @Get('/:id')
  async getCustomerById(@Param('id') id: string): Promise<CustomerModel> {
    return this.customerService.getCustomerById(id);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  async createCustomer(@Body() data: CreateCustomerDTO): Promise<CustomerModel> {
    return this.customerService.createCustomer(data);
  }

  @Put()
  @UsePipes(new ValidationPipe())
  async updateCustomer(@Body() data: CreateCustomerDTO): Promise<CustomerModel> {
    return this.customerService.updateCustomer(data);
  }
}
