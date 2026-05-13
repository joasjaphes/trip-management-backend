import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ExpenditureFilterDTO, TripRevenueFilterDTO, DebtorsFilterDTO, CashReportFilterDTO } from './reports.dto';

@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('driversPermitStatus')
  async driversPermitStatus() {
    return this.reportsService.getDriversPermitStatus();
  }

  @Get('vehiclesPermitStatus')
  async vehiclesPermitStatus() {
    return this.reportsService.getVehiclesPermitStatus();
  }

  @Get('expenditure')
  @UsePipes(new ValidationPipe({ transform: true }))
  async expenditureReport(@Query() filter: ExpenditureFilterDTO) {
    return this.reportsService.getExpenditureReport(filter);
  }

  @Get('tripRevenue')
  @UsePipes(new ValidationPipe({ transform: true }))
  async tripRevenueReport(@Query() filter: TripRevenueFilterDTO) {
    return this.reportsService.getTripRevenueReport(filter);
  }

  @Get('debtors')
  @UsePipes(new ValidationPipe({ transform: true }))
  async debtorsReport(@Query() filter: DebtorsFilterDTO) {
    return this.reportsService.getDebtorsReport(filter);
  }

  @Get('cash')
  @UsePipes(new ValidationPipe({ transform: true }))
  async cashReport(@Query() filter: CashReportFilterDTO) {
    return this.reportsService.getCashReport(filter);
  }
}
