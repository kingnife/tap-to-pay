export type PaymentMethod = 
  | 'nfc_tap' 
  | 'transfer' 
  | 'qr_code' 
  | 'card' 
  | 'payment_link' 
  | 'bill_payment' 
  | 'top_up';

export type TransactionCategory = 
  | 'retail' 
  | 'dining' 
  | 'groceries' 
  | 'transport' 
  | 'services' 
  | 'utilities' 
  | 'transfer' 
  | 'deposit';

export type TransactionStatus = 'successful' | 'pending' | 'failed' | 'reversed' | 'disputed';

export type DisputeStatus = 'none' | 'under_review' | 'approved_refunded' | 'rejected';

export type DisputeReason = 
  | 'failed_tap_debited'
  | 'double_charge'
  | 'wrong_amount'
  | 'service_not_rendered'
  | 'terminal_hardware_error'
  | 'unauthorized_charge';

export interface DisputeTimelineEvent {
  timestamp: string;
  status: DisputeStatus;
  note: string;
  actor: 'customer' | 'merchant' | 'system' | 'support';
}

export interface Transaction {
  id: string;
  reference: string;
  timestamp: string;
  amount: number; // In Naira (₦)
  currency: 'NGN';
  type: 'debit' | 'credit';
  paymentMethod: PaymentMethod;
  category: TransactionCategory;
  
  // Parties
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerTag?: string; // e.g. @bolaji
  
  merchantId?: string;
  merchantName?: string;
  merchantCategory?: string;
  
  // Destination for interbank transfers
  destinationBank?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    bankCode: string;
  };
  
  // Terminal details (for NFC POS / counter tap)
  terminalId?: string;
  terminalCode?: string;
  terminalName?: string;
  location?: string;
  
  description: string;
  status: TransactionStatus;
  failureReason?: string;
  offlineQueued: boolean;
  syncedAt?: string;
  latencyMs: number;
  cryptographicTapHash?: string;
  processorReference: string;
  
  // Bill payment specifics
  billDetails?: {
    billerType: 'airtime' | 'data' | 'electricity' | 'cable_tv' | 'internet';
    provider: string;
    packageOrPlan?: string;
    meterOrSmartCardNumber?: string;
    customerPhoneOrId?: string;
    token?: string; // e.g. electricity token
  };
  
  // Dispute fields
  disputeReason?: DisputeReason;
  disputeDescription?: string;
  disputeStatus: DisputeStatus;
  disputeCreatedAt?: string;
  disputeResolvedAt?: string;
  disputeTimeline?: DisputeTimelineEvent[];
  disputeRefundAmount?: number;
}

export type TerminalType = 
  | 'android_smart_pos' 
  | 'contactless_countertop' 
  | 'mobile_nfc_softpos' 
  | 'unattended_kiosk';

export type SignalStrength = '4G' | '3G' | '2G' | 'WIFI' | 'OFFLINE';

export interface TerminalTelemetry {
  batteryPct: number;
  isCharging: boolean;
  signalStrength: SignalStrength;
  firmwareVersion: string;
  lastHeartbeat: string;
  queuedOfflineCount: number;
  cpuTempC: number;
  storageUsagePct: number;
  readerHealth: 'healthy' | 'warning' | 'error';
}

export interface Terminal {
  id: string;
  code: string;
  name: string;
  type: TerminalType;
  location: string;
  assignedStaffOrStore: string;
  status: 'online' | 'offline' | 'degraded';
  telemetry: TerminalTelemetry;
  totalTapsToday: number;
  totalRevenueToday: number;
  merchantId: string;
}

export type SettlementProcessor = 'Paystack' | 'Flutterwave' | 'Interswitch' | 'NIBSS';

export interface SettlementBatch {
  id: string;
  batchNumber: string;
  date: string;
  periodStart: string;
  periodEnd: string;
  transactionCount: number;
  grossAmount: number;
  processingFee: number;
  netPayout: number;
  status: 'completed' | 'processing' | 'scheduled';
  processor: SettlementProcessor;
  destinationBank: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    nubanCode: string;
  };
  payoutReference: string;
}

export interface VirtualAccount {
  bank: string;
  accountNumber: string;
  accountName: string;
  ussdPrefix: string;
}

export type KycTier = 'tier_1' | 'tier_2' | 'tier_3';

export interface ConsumerProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  userTag: string; // e.g. @bolaji
  cardUid: string;
  nfcToken: string;
  balance: number;
  kycTier: KycTier;
  bvnVerified: boolean;
  ninVerified: boolean;
  dailyTransferLimit: number;
  autoTopUpEnabled: boolean;
  autoTopUpThreshold: number;
  autoTopUpAmount: number;
  virtualAccount: VirtualAccount;
  linkedNfcHardware: 'phone_hce' | 'physical_card' | 'keyfob' | 'smart_band';
  avatarUrl?: string;
}

export type UserRole = 'owner' | 'manager' | 'cashier' | 'finance' | 'technician';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: 'active' | 'invited';
  lastActive: string;
  permissions: string[];
}

export interface MerchantProfile {
  id: string;
  businessName: string;
  tradingName: string;
  category: string; // e.g. Supermarket, Cafe & Bakery, Fashion Retail
  cacRcNumber: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  settlementAccount: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    settlementFrequency: 'instant' | 't_plus_1' | 'daily_midnight';
  };
  activeProcessor: SettlementProcessor;
  qrCodeUrl?: string;
  paymentLinkUrl?: string;
}

export interface TopUpRequest {
  amount: number;
  method: 'bank_transfer' | 'card' | 'ussd';
  provider?: string;
  cardNumber?: string;
  ussdBank?: string;
}

export interface SendMoneyRequest {
  amount: number;
  recipientType: 'taplink_user' | 'bank_account';
  taplinkTagOrPhone?: string;
  bankName?: string;
  bankCode?: string;
  accountNumber?: string;
  accountName?: string;
  narration?: string;
  pin?: string;
}

export interface BillPaymentRequest {
  category: 'airtime' | 'data' | 'electricity' | 'cable_tv' | 'internet';
  provider: string;
  packageOrPlan?: string;
  recipient: string; // phone, meter number, smartcard number
  amount: number;
}
