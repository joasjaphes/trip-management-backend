import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { entities } from './shared/entities';
import { ServeStaticModule } from '@nestjs/serve-static';
import { UserController } from './modules/user/user.controller';
import { UserService } from './modules/user/user.service';
import { CargoTypeController } from './modules/cargo-type/cargo-type.controller';
import { CargoTypeService } from './modules/cargo-type/cargo-type.service';
import { DriverController } from './modules/driver/driver.controller';
import { DriverService } from './modules/driver/driver.service';
import { ExpenseController } from './modules/expense/expense.controller';
import { ExpenseService } from './modules/expense/expense.service';
import { RouteController } from './modules/route/route.controller';
import { RouteService } from './modules/route/route.service';
import { TripExpenseController } from './modules/trip-expense/trip-expense.controller';
import { TripExpenseService } from './modules/trip-expense/trip-expense.service';
import { TripController } from './modules/trip/trip.controller';
import { TripService } from './modules/trip/trip.service';
import { VehiclePermitController } from './modules/vehicle-permit/vehicle-permit.controller';
import { VehiclePermitService } from './modules/vehicle-permit/vehicle-permit.service';
import { VehicleController } from './modules/vehicle/vehicle.controller';
import { VehicleService } from './modules/vehicle/vehicle.service';
import { SeedModule } from './modules/seeds/seed.module';


const DATABASE_HOST = process.env.DATABASE_HOST;
const DATABASE_PORT: number = Number.parseInt('' + process.env.DATABASE_PORT);
const DATABASE_USERNAME = process.env.DATABASE_USERNAME;
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;
const DATABASE_NAME = process.env.DATABASE_NAME;
const isProduction = process.env.NODE_ENV === 'production';

@Module({
  imports: [

      TypeOrmModule.forRoot({
      type: 'postgres',
      host: DATABASE_HOST,
      port: DATABASE_PORT,
      username: DATABASE_USERNAME,
      password: DATABASE_PASSWORD,
      database: DATABASE_NAME,
      entities,
      migrations: ['src/migrations/*.ts'],
      synchronize: !isProduction,
    }),
    TypeOrmModule.forFeature([...entities]),
    SeedModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      exclude: ['/api/{*test}'],
      serveStaticOptions: {
        fallthrough: false,
      },
    }),
  ],
  controllers: [
    AppController,
    UserController,
    CargoTypeController,
    ExpenseController,
    DriverController,
    RouteController,
    VehicleController,
    VehiclePermitController,
    TripController,
    TripExpenseController,
  ],
  providers: [
    AppService,
    UserService,
    CargoTypeService,
    ExpenseService,
    DriverService,
    RouteService,
    VehicleService,
    VehiclePermitService,
    TripService,
    TripExpenseService,
  ],
})
export class AppModule {}
