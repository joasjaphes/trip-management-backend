import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export interface DriverPermitDTO {
  driverName: string;
  phoneNumber: string;
  permits: {
    permitName: string;
    daysToExpiry: number | null;
    expiryDate?: string | null;
  }[];
}

export interface VehiclePermitDTO {
  registrationNo: string;
  vehicleType: string;
  permits: {
    name: string;
    issuingAuthority?: string | null;
    expiryDate?: string | null;
    daysToExpiry: number | null;
  }[];
}

export class ExpenditureFilterDTO {
  @IsOptional()
  @IsDateString()
  @ApiProperty({ required: false, example: '2025-01-01' })
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ required: false, example: '2025-01-31' })
  endDate?: string;
}

export class TripRevenueFilterDTO {
  @IsOptional()
  @IsDateString()
  @ApiProperty({ required: false, example: '2025-01-01' })
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ required: false, example: '2025-01-31' })
  endDate?: string;
}

export interface AggregatedItem {
  itemId: string;
  itemName?: string;
  totalAmount: number;
}

export interface ExpenditureReportDTO {
  tripExpenses: { items: AggregatedItem[]; total: number };
  purchases: { items: AggregatedItem[]; total: number };
  officeExpenses: { items: AggregatedItem[]; total: number };
  grandTotal: number;
}

export interface TripRevenueRowDTO {
  tripDate: string;
  tripNumber: string;
  route: string;
  customerName: string;
  tripRevenue: number;
  totalTripExpenses: number;
  netIncome: number;
}

export interface TripRevenueReportDTO {
  items: TripRevenueRowDTO[];
  totalTripRevenue: number;
  totalTripExpenses: number;
  totalNetIncome: number;
}

export class DebtorsFilterDTO {
  @IsOptional()
  @IsDateString()
  @ApiProperty({ required: false, example: '2025-01-01' })
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ required: false, example: '2025-01-31' })
  endDate?: string;
}

export interface DebtorInvoiceDTO {
  invoiceNumber: string;
  amount: number; // in TZS
  paidAmount: number; // in TZS
  outstanding: number; // in TZS
  issuedAt?: string | null;
}

export interface DebtorRowDTO {
  customerName: string;
  totalInvoicedAmount: number; // in TZS
  totalPaidAmount: number; // in TZS
  outstandingAmount: number; // in TZS
  invoices: DebtorInvoiceDTO[];
}

export interface DebtorsReportDTO {
  items: DebtorRowDTO[];
  totalInvoicedAmount: number;
  totalPaidAmount: number;
  totalOutstandingAmount: number;
}
