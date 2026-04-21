import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseAppEntity } from '../../shared/base-app-entity';
import { TripModel, TripStatus } from './trip.dto';
import { Vehicle } from '../vehicle/vehicle.entity';
import { Driver } from '../driver/driver.entity';
import { Route } from '../route/route.entity';
import { CargoType } from '../cargo-type/cargo-type.entity';
import { TripExpense } from '../trip-expense/trip-expense.entity';
import { Customer } from '../customer/customer.entity';
import { OffloadingPlace } from '../offloading-place/offloading-place.entity';
import { Invoice } from '../invoice/invoice.entity';

@Entity('trips')
export class Trip extends BaseAppEntity<TripModel> {
  @Column({ nullable: false, length: 50, default: `TRP-${Date.now()}` })
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

  @Column({ nullable: true })
  trailerUid?: string;

  @Column({ nullable: false })
  cargoTypeUid: string;

  @Column({ nullable: true, default: 0 })
  cargoQuantity?: number;
  
  @Column({ nullable: true, type: 'text' })
  tripDocument?: string;

  @Column({ nullable: true, type: 'text' })
  docNumber?: string;

  @Column({ nullable: true, type: 'text' })
  completionDocument?: string;

  @Column({ type: 'float', nullable: false })
  revenue: number;

  @Column({ type: 'float', nullable: true, default: 0 })
  vatAmount?: number;
  @Column({ type: 'float', nullable: true, default: 0 })
  subtotal?: number;

  @Column({ type: 'float', nullable: false, default: 0 })
  paidAmount: number;

  @Column({ type: 'float', nullable: false })
  income: number;

  @Column({ nullable: true })
  customerUid?: string;

  @Column({ nullable: true })
  offloadingPlaceUid?: string;

  @Column({ nullable: true })
  invoiceUid?: string;

  @Column({
    type: 'enum',
    enum: TripStatus,
    default: TripStatus.PENDING,
  })
  status: TripStatus;

  @Column({ nullable: true, type: 'text' })
  notes?: string;


  @ManyToOne(() => Vehicle, { nullable: false })
  @JoinColumn({ name: 'vehicleUid', referencedColumnName: 'uid' })
  vehicle: Vehicle;

  @ManyToOne(() => Vehicle, { nullable: true })
  @JoinColumn({ name: 'trailerUid', referencedColumnName: 'uid' })
  trailer: Vehicle;


  @ManyToOne(() => Driver, { nullable: false })
  @JoinColumn({ name: 'driverUid', referencedColumnName: 'uid' })
  driver: Driver;

  @ManyToOne(() => Route, { nullable: false, eager: true })
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

  @ManyToOne(() => OffloadingPlace, { nullable: true })
  @JoinColumn({ name: 'offloadingPlaceUid', referencedColumnName: 'uid' })
  offloadingPlace: OffloadingPlace;

  @ManyToOne(() => Invoice, { nullable: true })
  @JoinColumn({ name: 'invoiceUid', referencedColumnName: 'uid' })
  invoice?: Invoice;

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
      trailer: this.trailer ? this.trailer.toDTO() : undefined,
      driver: this.driver?.toDTO(),
      route: this.route?.toDTO(),
      cargoType: this.cargoType?.toDTO(),
      vehicleId: this.vehicleUid,
      trailerId: this.trailerUid,
      driverId: this.driverUid,
      routeId: this.routeUid,
      cargoTypeId: this.cargoTypeUid,
      cargoQuantity: this.cargoQuantity,
      docNumber: this.docNumber,
      customerId: this.customerUid,
      customer: this.customer?.toDTO(),
      offloadingPlaceId: this.offloadingPlaceUid,
      invoiceId: this.invoiceUid,
      offloadingPlaceName: this.offloadingPlace?.name,
      offloadingPlace: this.offloadingPlace?.toDTO(),
      revenue: this.revenue,
      vatAmount: this.vatAmount,
      subtotal: this.subtotal,
      paidAmount: this.paidAmount,
      income: this.income,
      expenses: eager ? (this.expenses ?? []).map((expense) => expense.toDTO()) : [],
      tripDocument: this.tripDocument,
      completionDocument: this.completionDocument,
      status: this.status,
      notes: this.notes,
      active: this.active,
      deleted: this.deleted,
      deletedAt: this.deletedAt?.toISOString(),
    };
  }
}
