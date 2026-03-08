import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TripExpense } from './trip-expense.entity';
import { CreateTripExpenseDTO, TripExpenseModel } from './trip-expense.dto';
import { Trip } from '../trip/trip.entity';
import { Expense } from '../expense/expense.entity';

@Injectable()
export class TripExpenseService {
  constructor(
    @InjectRepository(TripExpense)
    private repository: Repository<TripExpense>,
    @InjectRepository(Trip)
    private tripRepository: Repository<Trip>,
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
  ) {}

  async createTripExpense(data: CreateTripExpenseDTO): Promise<TripExpenseModel> {
    try {
      await this.validateReferences(data);

      const payload = this.repository.create({
        uid: data.id,
        tripUid: data.tripId,
        expenseUid: data.expenseId,
        amount: data.amount,
        receiptAttachment: data.receiptAttachment,
        date: new Date(data.date),
      });
      const saved = await this.repository.save(payload);
      return saved.toDTO();
    } catch (e) {
      Logger.error('Failed to create trip expense', e);
      throw e;
    }
  }

  async updateTripExpense(data: CreateTripExpenseDTO): Promise<TripExpenseModel> {
    try {
      const entity = await this.repository.findOne({ where: { uid: data.id } });
      if (!entity) {
        throw new NotFoundException(`Trip expense with ID ${data.id} does not exist`);
      }

      await this.validateReferences(data);

      entity.tripUid = data.tripId || entity.tripUid;
      entity.expenseUid = data.expenseId || entity.expenseUid;
      entity.amount = data.amount ?? entity.amount;
      entity.receiptAttachment = data.receiptAttachment ?? entity.receiptAttachment;
      entity.date = data.date ? new Date(data.date) : entity.date;

      const updated = await this.repository.save(entity);
      return updated.toDTO();
    } catch (e) {
      Logger.error('Failed to update trip expense', e);
      throw e;
    }
  }

  async getAllTripExpenses(): Promise<TripExpenseModel[]> {
    try {
      const entities = await this.repository.find();
      return entities.map((entity) => entity.toDTO());
    } catch (e) {
      Logger.error('Failed to get trip expenses', e);
      throw e;
    }
  }

  async getTripExpenseById(id: string): Promise<TripExpenseModel> {
    try {
      const entity = await this.repository.findOne({ where: { uid: id } });
      if (!entity) {
        throw new NotFoundException(`Trip expense with ID ${id} not found`);
      }
      return entity.toDTO();
    } catch (e) {
      Logger.error('Failed to get trip expense by id', e);
      throw e;
    }
  }

  private async validateReferences(data: CreateTripExpenseDTO): Promise<void> {
    const [trip, expense] = await Promise.all([
      this.tripRepository.findOne({ where: { uid: data.tripId } }),
      this.expenseRepository.findOne({ where: { uid: data.expenseId } }),
    ]);

    if (!trip) {
      throw new BadRequestException(`Trip with ID ${data.tripId} not found`);
    }
    if (!expense) {
      throw new BadRequestException(`Expense with ID ${data.expenseId} not found`);
    }
  }
}
