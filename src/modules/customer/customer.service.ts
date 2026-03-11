import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './customer.entity';
import { CreateCustomerDTO, CustomerModel } from './customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private repository: Repository<Customer>,
  ) {}

  async createCustomer(data: CreateCustomerDTO): Promise<CustomerModel> {
    try {
      const payload = this.repository.create({
        uid: data.id,
        name: data.name,
        tin: data.tin,
        phone: data.phone,
      });
      const saved = await this.repository.save(payload);
      return saved.toDTO();
    } catch (e) {
      Logger.error('Failed to create customer', e);
      throw e;
    }
  }

  async findOrCreateByTin(tin: string, name: string, phone?: string): Promise<Customer> {
    let customer = await this.repository.findOne({ where: { tin } });
    if (!customer) {
      customer = this.repository.create({
        uid: require('crypto').randomUUID(),
        name,
        tin,
        phone,
      });
      customer = await this.repository.save(customer);
    }
    return customer;
  }

  async getAllCustomers(): Promise<CustomerModel[]> {
    try {
      const entities = await this.repository.find();
      return entities.map((e) => e.toDTO());
    } catch (e) {
      Logger.error('Failed to get customers', e);
      throw e;
    }
  }

  async getCustomerById(id: string): Promise<CustomerModel> {
    try {
      const entity = await this.repository.findOne({ where: { uid: id } });
      if (!entity) {
        throw new NotFoundException(`Customer with ID ${id} not found`);
      }
      return entity.toDTO();
    } catch (e) {
      Logger.error('Failed to get customer by id', e);
      throw e;
    }
  }

  async updateCustomer(data: CreateCustomerDTO): Promise<CustomerModel> {
    try {
      const entity = await this.repository.findOne({ where: { uid: data.id } });
      if (!entity) {
        throw new NotFoundException(`Customer with ID ${data.id} does not exist`);
      }
      entity.name = data.name ?? entity.name;
      entity.tin = data.tin ?? entity.tin;
      entity.phone = data.phone ?? entity.phone;
      const updated = await this.repository.save(entity);
      return updated.toDTO();
    } catch (e) {
      Logger.error('Failed to update customer', e);
      throw e;
    }
  }
}
