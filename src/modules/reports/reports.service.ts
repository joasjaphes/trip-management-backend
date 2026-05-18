import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from '../driver/driver.entity';
import { Vehicle } from '../vehicle/vehicle.entity';
import { VehiclePermit } from '../vehicle-permit/vehicle-permit.entity';
import { TripExpense } from '../trip-expense/trip-expense.entity';
import { Trip } from '../trip/trip.entity';
import { Invoice } from '../invoice/invoice.entity';
import { Receipt } from '../receipt/receipt.entity';
import { PurchaseOrder } from '../purchase-order/purchase-order.entity';
import { PurchaseOrderItem } from '../purchase-order/purchase-order-item.entity';
import { ExpenseTransaction } from '../expense-transaction/expense-transaction.entity';
import {
  ExpenditureFilterDTO,
  ExpenditureReportDTO,
  DriverPermitDTO,
  TripRevenueFilterDTO,
  TripRevenueReportDTO,
  VehiclePermitDTO,
  DebtorRowDTO,
  CashReportFilterDTO,
  CashReportDTO,
} from './reports.dto';
import { TripStatus } from '../trip/trip.dto';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Driver)
    private driverRepo: Repository<Driver>,
    @InjectRepository(Vehicle)
    private vehicleRepo: Repository<Vehicle>,
    @InjectRepository(VehiclePermit)
    private vehiclePermitRepo: Repository<VehiclePermit>,
    @InjectRepository(TripExpense)
    private tripExpenseRepo: Repository<TripExpense>,
    @InjectRepository(Trip)
    private tripRepo: Repository<Trip>,
    @InjectRepository(Invoice)
    private invoiceRepo: Repository<Invoice>,
    @InjectRepository(Receipt)
    private receiptRepo: Repository<Receipt>,
    @InjectRepository(PurchaseOrder)
    private purchaseOrderRepo: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseOrderItem)
    private purchaseOrderItemRepo: Repository<PurchaseOrderItem>,
    @InjectRepository(ExpenseTransaction)
    private expenseTransactionRepo: Repository<ExpenseTransaction>,
  ) { }

  async getDriversPermitStatus(): Promise<DriverPermitDTO[]> {
    const drivers = await this.driverRepo.find();
    const now = new Date();
    return drivers.map((d) => {
      const licenseExpiry = d.licenseExpiryDate ? new Date(d.licenseExpiryDate) : null;
      const passportExpiry = d.passportExpiryDate ? new Date(d.passportExpiryDate) : null;

      const calcDays = (expiry: Date | null) => {
        if (!expiry) return null;
        let days = Math.ceil((expiry.getTime() - now.getTime()) / MS_PER_DAY);
        if (days <= 0) {
          return 0;
        }
        return days;
      };

      const permits = [
        {
          permitName: 'Driving License',
          daysToExpiry: calcDays(licenseExpiry),
          expiryDate: licenseExpiry ? licenseExpiry.toISOString() : null,
        },
        {
          permitName: 'Passport',
          daysToExpiry: calcDays(passportExpiry),
          expiryDate: passportExpiry ? passportExpiry.toISOString() : null,
        },
      ];

      return {
        driverName: `${d.firstName} ${d.lastName}`.trim(),
        phoneNumber: d.phone,
        permits: permits.filter((p) => p.daysToExpiry !== null && p.daysToExpiry <= 60),
      } as DriverPermitDTO;
    }).filter((d) => d.permits.length > 0);
  }

  async getVehiclesPermitStatus(): Promise<VehiclePermitDTO[]> {
    // fetch vehicles with permits eager not always set; join manually
    const vehicles = await this.vehicleRepo.find({ relations: ['permits'] });
    const now = new Date();
    const calcDays = (expiry: Date | null) => {
      if (!expiry) return null;
      let days = Math.ceil((expiry.getTime() - now.getTime()) / MS_PER_DAY);
      if (days <= 0) {
        return 0;
      };
      return days;
    };

    return vehicles.map((v) => {
      const permits = (v.permits ?? []).map((p) => ({
        name: p.description,
        issuingAuthority: null,
        expiryDate: p.endDate ? new Date(p.endDate).toISOString() : null,
        daysToExpiry: p.endDate ? calcDays(new Date(p.endDate)) : null,
      })).filter((perm) => perm?.daysToExpiry !== null && perm?.daysToExpiry <= 60);

      return {
        registrationNo: v.registrationNo,
        vehicleType: v.type?.toString() ?? 'Unknown',
        permits,
      } as VehiclePermitDTO;
    }).filter((v) => v.permits.length > 0);
  }

  async getExpenditureReport(filter: ExpenditureFilterDTO): Promise<ExpenditureReportDTO> {
    const start = filter.startDate ? new Date(filter.startDate) : undefined;
    const end = filter.endDate ? new Date(filter.endDate) : undefined;

    // Trip Expenses: aggregate by expenseUid
    const tripQuery = this.tripExpenseRepo.createQueryBuilder('te')
      .select('te.expenseUid', 'itemId')
      .addSelect('expense.name', 'itemName')
      .addSelect('SUM(te.amount)', 'total')
      .leftJoin('te.expense', 'expense')
      .groupBy('te.expenseUid')
      .addGroupBy('expense.name');

    if (start) tripQuery.andWhere('te.date >= :start', { start });
    if (end) tripQuery.andWhere('te.date <= :end', { end });

    const tripRows: any[] = await tripQuery.getRawMany();
    const tripItems = tripRows.map((r) => ({ itemId: r.itemId, itemName: r.itemName ?? null, totalAmount: Number(r.total) }));
    const tripTotal = tripItems.reduce((s, it) => s + it.totalAmount, 0);

    // Purchases: aggregate by itemUid from purchase_order_items joined to purchase_orders
    const purchaseQuery = this.purchaseOrderItemRepo.createQueryBuilder('poi')
      .select('poi.itemUid', 'itemId')
      .addSelect('item.name', 'itemName')
      .addSelect('SUM(poi.amount * poi.quantity)', 'total')
      .leftJoin('poi.item', 'item')
      .innerJoin('poi.purchaseOrder', 'po')
      .groupBy('poi.itemUid')
      .addGroupBy('item.name');

    if (start) purchaseQuery.andWhere('po.orderDate >= :start', { start });
    if (end) purchaseQuery.andWhere('po.orderDate <= :end', { end });

    const purchaseRows: any[] = await purchaseQuery.getRawMany();
    const purchaseItems = purchaseRows.map((r) => ({ itemId: r.itemId, itemName: r.itemName ?? null, totalAmount: Number(r.total) }));
    const purchaseTotal = purchaseItems.reduce((s, it) => s + it.totalAmount, 0);

    // Office Expenses: aggregate by expenseUid from expense_transactions
    const officeQuery = this.expenseTransactionRepo.createQueryBuilder('et')
      .select('et.expenseUid', 'itemId')
      .addSelect('expense.name', 'itemName')
      .addSelect('SUM(et.transactionAmount)', 'total')
      .leftJoin('et.expense', 'expense')
      .groupBy('et.expenseUid')
      .addGroupBy('expense.name');

    if (start) officeQuery.andWhere('et.transactionDate >= :start', { start });
    if (end) officeQuery.andWhere('et.transactionDate <= :end', { end });

    const officeRows: any[] = await officeQuery.getRawMany();
    const officeItems = officeRows.map((r) => ({ itemId: r.itemId, itemName: r.itemName ?? null, totalAmount: Number(r.total) }));
    const officeTotal = officeItems.reduce((s, it) => s + it.totalAmount, 0);

    const grandTotal = tripTotal + purchaseTotal + officeTotal;

    return {
      tripExpenses: { items: tripItems, total: tripTotal },
      purchases: { items: purchaseItems, total: purchaseTotal },
      officeExpenses: { items: officeItems, total: officeTotal },
      grandTotal,
    };
  }

  async getTripRevenueReport(filter: TripRevenueFilterDTO): Promise<TripRevenueReportDTO> {
    const start = filter.startDate ? new Date(filter.startDate) : undefined;
    const end = filter.endDate ? new Date(filter.endDate) : undefined;

    const query = this.tripRepo
      .createQueryBuilder('trip')
      .leftJoinAndSelect('trip.route', 'route')
      .leftJoinAndSelect('trip.customer', 'customer')
      .leftJoinAndSelect('trip.expenses', 'expense')
      .orderBy('trip.tripDate', 'DESC');

    if (start) query.andWhere('trip.tripDate >= :start', { start });
    if (end) query.andWhere('trip.tripDate <= :end', { end });
    query.andWhere('trip.status = :completedStatus', { completedStatus: TripStatus.COMPLETED });

    const trips = await query.getMany();

    const items = trips.map((trip) => {
      const isUsd = String(trip.route?.routeCurrency ?? 'TZS').toUpperCase() === 'USD';
      const exchangeRate = Number(trip.exchangeRate ?? 1);
      const tripRevenue = isUsd
        ? Number(trip.revenue ?? 0) * exchangeRate
        : Number(trip.revenue ?? 0);
      const totalTripExpenses = (trip.expenses ?? []).reduce(
        (sum, tripExpense) => sum + Number(tripExpense.amount ?? 0),
        0,
      );
      const netIncome = tripRevenue - totalTripExpenses;

      return {
        tripDate: trip.tripDate?.toISOString(),
        tripNumber: trip.tripReferenceNumber,
        route: trip.route?.name ?? '',
        customerName: trip.customer?.name ?? '',
        tripRevenue,
        totalTripExpenses,
        netIncome,
      };
    });

    const totalTripRevenue = items.reduce((sum, item) => sum + item.tripRevenue, 0);
    const totalTripExpenses = items.reduce((sum, item) => sum + item.totalTripExpenses, 0);
    const totalNetIncome = items.reduce((sum, item) => sum + item.netIncome, 0);

    return {
      items,
      totalTripRevenue,
      totalTripExpenses,
      totalNetIncome,
    };
  }

  async getDebtorsReport(filter: import('./reports.dto').DebtorsFilterDTO): Promise<import('./reports.dto').DebtorsReportDTO> {
    const start = filter.startDate ? new Date(filter.startDate) : undefined;
    const end = filter.endDate ? new Date(filter.endDate) : undefined;

    const query = this.invoiceRepo.createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.customer', 'customer')
      .orderBy('invoice.createdAt', 'DESC');

    if (start) query.andWhere('invoice.createdAt >= :start', { start });
    if (end) query.andWhere('invoice.createdAt <= :end', { end });

    const invoices = await query.getMany();

    const invoiceUids = invoices.map((i) => i.uid);

    // fetch receipts in the provided date range for these invoices
    const receiptQuery = this.receiptRepo.createQueryBuilder('r')
      .where('r.invoiceUid IN (:...uids)', { uids: invoiceUids });
    if (start) receiptQuery.andWhere('r.paidAt >= :start', { start });
    if (end) receiptQuery.andWhere('r.paidAt <= :end', { end });
    const receipts = await receiptQuery.getMany();

    const receiptsByInvoice = receipts.reduce((map, r) => {
      const arr = map.get(r.invoiceUid) ?? [];
      arr.push(r);
      map.set(r.invoiceUid, arr);
      return map;
    }, new Map<string, typeof receipts>());

    const byCustomer = new Map<string, { customerName: string; invoices: any[] }>();

    invoices.forEach((inv) => {
      const custUid = inv.customerUid ?? 'unknown';
      const custName = inv.customer?.name ?? 'Unknown';
      const isUsd = String(inv.currency ?? 'TZS').toUpperCase() === 'USD';
      const rate = Number(inv.exchangeRate ?? 1);
      const amountTzs = isUsd ? Number(inv.amount ?? 0) * rate : Number(inv.amount ?? 0);

      const invReceipts = receiptsByInvoice.get(inv.uid) ?? [];
      const paidSum = invReceipts.reduce((s, r) => s + Number(r.amount ?? 0), 0);
      const paidTzs = isUsd ? paidSum * rate : paidSum;

      const outstanding = amountTzs - paidTzs;

      // only include invoices that have outstanding > 0
      if (outstanding <= 0) return;

      const row = {
        invoiceNumber: inv.invoiceNumber,
        amount: amountTzs,
        paidAmount: paidTzs,
        outstanding,
        issuedAt: inv.createdAt.toISOString(),
      };

      const prev = byCustomer.get(custUid);
      if (prev) {
        prev.invoices.push(row);
      } else {
        byCustomer.set(custUid, { customerName: custName, invoices: [row] });
      }
    });

    const items: DebtorRowDTO[] = [];
    let totalInvoiced = 0;
    let totalPaid = 0;
    let totalOutstanding = 0;

    for (const [, data] of byCustomer) {
      const custTotalInvoiced = data.invoices.reduce((s, i) => s + i.amount, 0);
      const custTotalPaid = data.invoices.reduce((s, i) => s + i.paidAmount, 0);
      const custOutstanding = data.invoices.reduce((s, i) => s + i.outstanding, 0);

      items.push({
        customerName: data.customerName,
        totalInvoicedAmount: custTotalInvoiced,
        totalPaidAmount: custTotalPaid,
        outstandingAmount: custOutstanding,
        invoices: data.invoices,
      });

      totalInvoiced += custTotalInvoiced;
      totalPaid += custTotalPaid;
      totalOutstanding += custOutstanding;
    }


    return {
      items,
      totalInvoicedAmount: totalInvoiced,
      totalPaidAmount: totalPaid,
      totalOutstandingAmount: totalOutstanding,
    };
  }

  async getCashReport(filter: CashReportFilterDTO): Promise<CashReportDTO> {
    const start = filter.startDate ? new Date(filter.startDate) : undefined;
    const end = filter.endDate ? new Date(filter.endDate) : undefined;

    const invoiceQuery = this.invoiceRepo
      .createQueryBuilder('invoice')
      .orderBy('COALESCE(invoice.issuedAt, invoice.createdAt)', 'DESC');

    if (start) {
      invoiceQuery.andWhere('COALESCE(invoice.issuedAt, invoice.createdAt) >= :start', { start });
    }
    if (end) {
      invoiceQuery.andWhere('COALESCE(invoice.issuedAt, invoice.createdAt) <= :end', { end });
    }

    const invoices = await invoiceQuery.getMany();
    if (invoices.length === 0) {
      return {
        items: [],
        totalInvoicedAmount: 0,
        totalActualReceivedAmount: 0,
      };
    }

    const invoiceUids = invoices.map((invoice) => invoice.uid);

    const receiptQuery = this.receiptRepo
      .createQueryBuilder('receipt')
      .select('receipt.invoiceUid', 'invoiceUid')
      .addSelect('SUM(receipt.amount)', 'totalReceived')
      .where('receipt.invoiceUid IN (:...invoiceUids)', { invoiceUids })
      .groupBy('receipt.invoiceUid');

    if (start) {
      receiptQuery.andWhere('receipt.paidAt >= :start', { start });
    }
    if (end) {
      receiptQuery.andWhere('receipt.paidAt <= :end', { end });
    }

    const receiptRows: Array<{ invoiceUid: string; totalReceived: string }> = await receiptQuery.getRawMany();
    const receivedByInvoice = new Map(
      receiptRows.map((row) => [row.invoiceUid, Number(row.totalReceived ?? 0)]),
    );

    const items = invoices.map((invoice) => {
      const isUsd = String(invoice.currency ?? 'TZS').toUpperCase() === 'USD';
      const rate = Number(invoice.exchangeRate ?? 1);
      const invoiceAmount = Number(invoice.amount ?? 0);
      const receivedAmount = receivedByInvoice.get(invoice.uid) ?? 0;

      const invoicedAmount = isUsd ? invoiceAmount * rate : invoiceAmount;
      const actualReceivedAmount = isUsd ? receivedAmount * rate : receivedAmount;

      return {
        invoiceDate: (invoice.issuedAt ?? invoice.createdAt).toISOString(),
        invoiceNumber: invoice.invoiceNumber,
        invoicedAmount,
        actualReceivedAmount,
      };
    });

    return {
      items,
      totalInvoicedAmount: items.reduce((sum, item) => sum + item.invoicedAmount, 0),
      totalActualReceivedAmount: items.reduce((sum, item) => sum + item.actualReceivedAmount, 0),
    };
  }
}
