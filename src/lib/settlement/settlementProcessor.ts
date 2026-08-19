import { SettlementBatch, SettlementProcessor, Transaction } from '../../types';

export interface ProcessorFeeStructure {
  fixedFee: number;
  percentageFee: number;
  capFee: number;
  payoutSla: string;
  description: string;
}

export interface PayoutExecutionResult {
  success: boolean;
  batchId: string;
  payoutReference: string;
  grossAmount: number;
  processingFee: number;
  netAmount: number;
  processor: SettlementProcessor;
  settledAt: string;
  message: string;
}

export interface ISettlementAdapter {
  readonly name: SettlementProcessor;
  readonly feeStructure: ProcessorFeeStructure;
  calculateFee(grossAmount: number, txCount: number): number;
  executePayout(
    batch: Omit<SettlementBatch, 'id' | 'payoutReference' | 'status' | 'processingFee' | 'netPayout'>,
    destinationBank: { bankName: string; accountNumber: string; accountName: string; nubanCode: string }
  ): Promise<PayoutExecutionResult>;
}

export class NIBSSInstantPaymentAdapter implements ISettlementAdapter {
  readonly name: SettlementProcessor = 'NIBSS';
  readonly feeStructure: ProcessorFeeStructure = {
    fixedFee: 10,
    percentageFee: 0.0075, // 0.75%
    capFee: 1200,
    payoutSla: 'Instant / T+0 Direct NIP Clearing',
    description: 'Direct integration with Nigeria Inter-Bank Settlement System (NIBSS) NIP rail for sub-second interbank clearing.'
  };

  calculateFee(grossAmount: number, _txCount: number): number {
    const variable = grossAmount * this.feeStructure.percentageFee;
    const fee = Math.min(variable + this.feeStructure.fixedFee, this.feeStructure.capFee);
    return Math.round(fee * 100) / 100;
  }

  async executePayout(
    batch: Omit<SettlementBatch, 'id' | 'payoutReference' | 'status' | 'processingFee' | 'netPayout'>,
    destinationBank: { bankName: string; accountNumber: string; accountName: string; nubanCode: string }
  ): Promise<PayoutExecutionResult> {
    const fee = this.calculateFee(batch.grossAmount, batch.transactionCount);
    const net = batch.grossAmount - fee;
    const ref = `NIBSS-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 8999 + 1000)}`;

    return {
      success: true,
      batchId: `BATCH-${Date.now().toString().slice(-6)}`,
      payoutReference: ref,
      grossAmount: batch.grossAmount,
      processingFee: fee,
      netAmount: net,
      processor: this.name,
      settledAt: new Date().toISOString(),
      message: `₦${net.toLocaleString()} disbursed via NIBSS NIP to ${destinationBank.accountNumber} (${destinationBank.bankName}) successfully.`
    };
  }
}

export class InterswitchDirectPayAdapter implements ISettlementAdapter {
  readonly name: SettlementProcessor = 'Interswitch';
  readonly feeStructure: ProcessorFeeStructure = {
    fixedFee: 25,
    percentageFee: 0.012, // 1.2%
    capFee: 1500,
    payoutSla: '3-Hour Scheduled Batch Settlement',
    description: 'Licensed switch processor routing via Interswitch Paynet & Verve merchant ecosystem.'
  };

  calculateFee(grossAmount: number, _txCount: number): number {
    const variable = grossAmount * this.feeStructure.percentageFee;
    const fee = Math.min(variable + this.feeStructure.fixedFee, this.feeStructure.capFee);
    return Math.round(fee * 100) / 100;
  }

  async executePayout(
    batch: Omit<SettlementBatch, 'id' | 'payoutReference' | 'status' | 'processingFee' | 'netPayout'>,
    destinationBank: { bankName: string; accountNumber: string; accountName: string; nubanCode: string }
  ): Promise<PayoutExecutionResult> {
    const fee = this.calculateFee(batch.grossAmount, batch.transactionCount);
    const net = batch.grossAmount - fee;
    const ref = `ISW-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 8999 + 1000)}`;

    return {
      success: true,
      batchId: `BATCH-${Date.now().toString().slice(-6)}`,
      payoutReference: ref,
      grossAmount: batch.grossAmount,
      processingFee: fee,
      netAmount: net,
      processor: this.name,
      settledAt: new Date().toISOString(),
      message: `₦${net.toLocaleString()} queued for settlement via Interswitch to ${destinationBank.bankName} Account.`
    };
  }
}

export class PaystackSubaccountAdapter implements ISettlementAdapter {
  readonly name: SettlementProcessor = 'Paystack';
  readonly feeStructure: ProcessorFeeStructure = {
    fixedFee: 50,
    percentageFee: 0.015, // 1.5%
    capFee: 2000,
    payoutSla: 'T+1 Automatic Bank Settlement at 06:00 AM',
    description: 'Automated subaccount payout split with multi-bank reconciliation webhooks.'
  };

  calculateFee(grossAmount: number, _txCount: number): number {
    const variable = grossAmount * this.feeStructure.percentageFee;
    const fee = Math.min(variable + (grossAmount > 2500 ? this.feeStructure.fixedFee : 0), this.feeStructure.capFee);
    return Math.round(fee * 100) / 100;
  }

  async executePayout(
    batch: Omit<SettlementBatch, 'id' | 'payoutReference' | 'status' | 'processingFee' | 'netPayout'>,
    destinationBank: { bankName: string; accountNumber: string; accountName: string; nubanCode: string }
  ): Promise<PayoutExecutionResult> {
    const fee = this.calculateFee(batch.grossAmount, batch.transactionCount);
    const net = batch.grossAmount - fee;
    const ref = `PSTK-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 8999 + 1000)}`;

    return {
      success: true,
      batchId: `BATCH-${Date.now().toString().slice(-6)}`,
      payoutReference: ref,
      grossAmount: batch.grossAmount,
      processingFee: fee,
      netAmount: net,
      processor: this.name,
      settledAt: new Date().toISOString(),
      message: `₦${net.toLocaleString()} initiated via Paystack Transfer API to ${destinationBank.bankName}.`
    };
  }
}

export class FlutterwaveDisbursementAdapter implements ISettlementAdapter {
  readonly name: SettlementProcessor = 'Flutterwave';
  readonly feeStructure: ProcessorFeeStructure = {
    fixedFee: 20,
    percentageFee: 0.014, // 1.4%
    capFee: 2000,
    payoutSla: 'Instant Multi-Currency and NGN Rails',
    description: 'Direct to commercial banks and mobile money wallets across Nigeria.'
  };

  calculateFee(grossAmount: number, _txCount: number): number {
    const fee = Math.min(grossAmount * this.feeStructure.percentageFee + this.feeStructure.fixedFee, this.feeStructure.capFee);
    return Math.round(fee * 100) / 100;
  }

  async executePayout(
    batch: Omit<SettlementBatch, 'id' | 'payoutReference' | 'status' | 'processingFee' | 'netPayout'>,
    destinationBank: { bankName: string; accountNumber: string; accountName: string; nubanCode: string }
  ): Promise<PayoutExecutionResult> {
    const fee = this.calculateFee(batch.grossAmount, batch.transactionCount);
    const net = batch.grossAmount - fee;
    const ref = `FLW-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 8999 + 1000)}`;

    return {
      success: true,
      batchId: `BATCH-${Date.now().toString().slice(-6)}`,
      payoutReference: ref,
      grossAmount: batch.grossAmount,
      processingFee: fee,
      netAmount: net,
      processor: this.name,
      settledAt: new Date().toISOString(),
      message: `₦${net.toLocaleString()} disbursed to ${destinationBank.accountNumber} via Flutterwave Payout.`
    };
  }
}

export class SettlementRegistry {
  private adapters: Map<SettlementProcessor, ISettlementAdapter> = new Map();

  constructor() {
    this.register(new NIBSSInstantPaymentAdapter());
    this.register(new InterswitchDirectPayAdapter());
    this.register(new PaystackSubaccountAdapter());
    this.register(new FlutterwaveDisbursementAdapter());
  }

  public register(adapter: ISettlementAdapter): void {
    this.adapters.set(adapter.name, adapter);
  }

  public getAdapter(processor: SettlementProcessor): ISettlementAdapter {
    const adapter = this.adapters.get(processor);
    if (!adapter) {
      throw new Error(`Settlement processor "${processor}" is not registered.`);
    }
    return adapter;
  }

  public getAllProcessors(): { id: SettlementProcessor; adapter: ISettlementAdapter }[] {
    return Array.from(this.adapters.entries()).map(([id, adapter]) => ({ id, adapter }));
  }

  public calculateBatchFromTransactions(
    transactions: Transaction[],
    processor: SettlementProcessor,
    destinationBank: { bankName: string; accountNumber: string; accountName: string; nubanCode: string }
  ): SettlementBatch {
    const successfulTx = transactions.filter(t => t.status === 'successful');
    const gross = successfulTx.reduce((sum, t) => sum + t.amount, 0);
    const adapter = this.getAdapter(processor);
    const fee = adapter.calculateFee(gross, successfulTx.length);
    const net = Math.max(0, gross - fee);

    return {
      id: `BATCH-${Date.now().toString().slice(-6)}`,
      batchNumber: `TPL-SET-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 899 + 100)}`,
      date: new Date().toISOString(),
      periodStart: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      periodEnd: new Date().toISOString(),
      transactionCount: successfulTx.length,
      grossAmount: gross,
      processingFee: fee,
      netPayout: net,
      status: 'scheduled',
      processor,
      destinationBank,
      payoutReference: `PENDING-${processor.toUpperCase()}`
    };
  }
}

export const settlementRegistry = new SettlementRegistry();
