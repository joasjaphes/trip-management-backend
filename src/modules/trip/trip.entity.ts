import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseAppEntity } from '../../shared/base-app-entity';
import { TripModel, TripStatus } from './trip.dto';
import { Vehicle } from '../vehicle/vehicle.entity';
import { Driver } from '../driver/driver.entity';
import { Route } from '../route/route.entity';
import { CargoType } from '../cargo-type/cargo-type.entity';
import { TripExpense } from '../trip-expense/trip-expense.entity';
import { Customer } from '../customer/customer.entity';

@Entity('trips')
export class Trip extends BaseAppEntity<TripModel> {
  @Column({ nullable: false, length: 50, default:`TRP-${Date.now()}` })
  tripReferenceNumber: string;

  @Column({ type: 'timestamptz', nullable: false })
  tripDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endDate?: Date;

  @Column({ nullable: false })
  vehicleUid: string;

  @Column({ nullable: false })
  driverUid: string;

  @Column({ nullable: false })
  routeUid: string;

  @Column({ nullable: false })
  cargoTypeUid: string;

  @Column({ type: 'float', nullable: false })
  revenue: number;

  @Column({ type: 'float', nullable: false, default: 0 })
  paidAmount: number;

  @Column({ type: 'float', nullable: false })
  income: number;

  @Column({ nullable: true })
  customerUid?: string;

  @Column({
    type: 'enum',
    enum: TripStatus,
    default: TripStatus.PENDING,
  })
  status: TripStatus;

  @ManyToOne(() => Vehicle, { nullable: false })
  @JoinColumn({ name: 'vehicleUid', referencedColumnName: 'uid' })
  vehicle: Vehicle;

  @ManyToOne(() => Driver, { nullable: false })
  @JoinColumn({ name: 'driverUid', referencedColumnName: 'uid' })
  driver: Driver;

  @ManyToOne(() => Route, { nullable: false, eager:true })
  @JoinColumn({ name: 'routeUid', referencedColumnName: 'uid' })
  route: Route;

  @ManyToOne(() => CargoType, { nullable: false })
  @JoinColumn({ name: 'cargoTypeUid', referencedColumnName: 'uid' })
  cargoType: CargoType;

  @OneToMany(() => TripExpense, (tripExpense) => tripExpense.trip)
  expenses: TripExpense[];

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'customerUid', referencedColumnName: 'uid' })
  customer: Customer;

  toDTO(options?: { eager: boolean }): TripModel {
    const { eager = false } = options ?? {};

    return {
      id: this.uid,
      tripReferenceNumber: this.tripReferenceNumber,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      tripDate: this.tripDate.toISOString(),
      endDate: this.endDate?.toISOString(),
      vehicle: this.vehicle?.toDTO(),
      driver: this.driver?.toDTO(),
      route: this.route?.toDTO(),
      cargoType: this.cargoType?.toDTO(),
      vehicleId: this.vehicleUid,
      driverId: this.driverUid,
      routeId: this.routeUid,
      cargoTypeId: this.cargoTypeUid,
      customerId: this.customerUid,
      customer: this.customer?.toDTO(),
      revenue: this.revenue,
      paidAmount: this.paidAmount,
      income: this.income,
      expenses: eager ? (this.expenses ?? []).map((expense) => expense.toDTO()) : [],
      status: this.status,
      active: this.active,
      deleted: this.deleted,
      deletedAt: this.deletedAt?.toISOString(),
    };
  }
}
