import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BaseAppModel } from '../../shared/base-app-dto';
import { BaseCreateAppDTO } from '../../shared/base-create-app.dto';
import type { ExpenseModel } from '../expense/expense.dto';
import type { UserModel } from '../user/user.dto';
import type { VendorModel } from '../vendor/vendor.dto';

export enum PurchaseOrderStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  COMPLETED = 'Completed',
}

export interface PurchaseOrderItemModel extends BaseAppModel {
  itemId: string;
  item?: ExpenseModel;
  description: string;
  amount: number;
}

export interface PurchaseOrderModel extends BaseAppModel {
  purchaseOrderReferenceNumber: string;
  vendorId: string;
  vendor?: VendorModel;
  orderDate: string;
  completionDate?: string;
  approvedDate?: string;
  completedByUserId?: string;
  completedByUser?: UserModel;
  approvedByUserId?: string;
  approvedByUser?: UserModel;
  orderStatus: PurchaseOrderStatus;
  orderItems: PurchaseOrderItemModel[];
}

export class CreatePurchaseOrderItemDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'expense-uid-123' })
  itemId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Fuel for trip operations' })
  description: string;

  @IsNumber()
  @Min(0.01)
  @ApiProperty({ example: 350000 })
  amount: number;
}

export class CreatePurchaseOrderDTO extends BaseCreateAppDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'PO-2026-001' })
  purchaseOrderReferenceNumber: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'vendor-uid-123' })
  vendorId: string;

  @IsDateString()
  @ApiProperty({ example: '2026-04-22T10:30:00.000Z' })
  orderDate: string;

  @IsDateString()
  @IsOptional()
  @ApiProperty({ example: '2026-04-25T14:00:00.000Z', required: false })
  completionDate?: string;

  @IsDateString()
  @IsOptional()
  @ApiProperty({ example: '2026-04-23T09:00:00.000Z', required: false })
  approvedDate?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'user-uid-123', required: false })
  completedByUserId?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'user-uid-456', required: false })
  approvedByUserId?: string;

  @IsEnum(PurchaseOrderStatus)
  @ApiProperty({ enum: PurchaseOrderStatus, example: PurchaseOrderStatus.PENDING })
  orderStatus: PurchaseOrderStatus;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderItemDTO)
  @ApiProperty({
    type: [CreatePurchaseOrderItemDTO],
    example: [
      {
        itemId: 'expense-uid-123',
        description: 'Fuel for trip operations',
        amount: 350000,
      },
    ],
  })
  orderItems: CreatePurchaseOrderItemDTO[];
}
