import { CargoType } from '../modules/cargo-type/cargo-type.entity';
import { Driver } from '../modules/driver/driver.entity';
import { Expense } from '../modules/expense/expense.entity';
import { Route } from '../modules/route/route.entity';
import { TripExpense } from '../modules/trip-expense/trip-expense.entity';
import { Trip } from '../modules/trip/trip.entity';
import { User } from '../modules/user/user.entity';
import { VehiclePermit } from '../modules/vehicle-permit/vehicle-permit.entity';
import { Vehicle } from '../modules/vehicle/vehicle.entity';
import { BaseAppEntity } from './base-app-entity';

export const entities = [
  User,
  CargoType,
  Expense,
  Driver,
  Route,
  Vehicle,
  VehiclePermit,
  Trip,
  TripExpense,
];
