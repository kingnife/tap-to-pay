import { 
  Transaction, 
  Terminal, 
  ConsumerProfile, 
  MerchantProfile, 
  SettlementBatch, 
  TeamMember, 
  TopUpRequest,
  SendMoneyRequest,
  BillPaymentRequest,
  DisputeReason,
  SettlementProcessor,
  UserRole
} from '../../types';
import { settlementRegistry } from '../settlement/settlementProcessor';
import { nfcService } from '../payments/nfc/nfcService';
import { billerService } from '../billers/billerService';

const STORAGE_KEYS = {
  TRANSACTIONS: 'taplink_transactions_v3',
  TERMINALS: 'taplink_terminals_v3',
  CONSUMERS: 'taplink_consumers_v3',
  ACTIVE_CONSUMER_ID: 'taplink_active_consumer_id_v3',
  MERCHANT: 'taplink_merchant_v3',
  SETTLEMENTS: 'taplink_settlements_v3',
  TEAM: 'taplink_team_v3',
  IS_NETWORK_OFFLINE: 'taplink_is_network_offline_v3'
};

export interface NigerianBank {
  name: string;
  code: string;
  slug: string;
}

export const NIGERIAN_BANKS: NigerianBank[] = [
  { name: 'Access Bank', code: '044', slug: 'access-bank' },
  { name: 'Guaranty Trust Bank (GTBank)', code: '058', slug: 'gtbank' },
  { name: 'Zenith Bank', code: '057', slug: 'zenith-bank' },
  { name: 'United Bank for Africa (UBA)', code: '033', slug: 'uba' },
  { name: 'First Bank of Nigeria', code: '011', slug: 'first-bank' },
  { name: 'Kuda Microfinance Bank', code: '50211', slug: 'kuda-bank' },
  { name: 'OPay Digital Services', code: '999992', slug: 'opay' },
  { name: 'PalmPay Nigeria', code: '999991', slug: 'palmpay' },
  { name: 'Moniepoint MFB', code: '50515', slug: 'moniepoint' },
  { name: 'Sterling Bank', code: '232', slug: 'sterling-bank' },
  { name: 'Stanbic IBTC Bank', code: '221', slug: 'stanbic-ibtc' },
  { name: 'Wema Bank (ALAT)', code: '035', slug: 'wema-bank' },
  { name: 'Fidelity Bank', code: '070', slug: 'fidelity-bank' },
  { name: 'First City Monument Bank (FCMB)', code: '214', slug: 'fcmb' },
  { name: 'Union Bank of Nigeria', code: '032', slug: 'union-bank' }
];

const INITIAL_CONSUMERS: ConsumerProfile[] = [
  {
    id: 'user-bolaji',
    fullName: 'Bolaji Adebayo',
    email: 'bolaji.adebayo@gmail.com',
    phone: '+234 803 491 8820',
    userTag: '@bolaji',
    cardUid: 'TPL-NFC-994182',
    nfcToken: '0x8FA492B19C91',
    balance: 38500,
    kycTier: 'tier_2',
    bvnVerified: true,
    ninVerified: true,
    dailyTransferLimit: 200000,
    autoTopUpEnabled: true,
    autoTopUpThreshold: 1000,
    autoTopUpAmount: 5000,
    virtualAccount: {
      bank: 'Wema Bank (ALAT)',
      accountNumber: '9102938471',
      accountName: 'TAPLINK - BOLAJI ADEBAYO',
      ussdPrefix: '*945*9102938471#'
    },
    linkedNfcHardware: 'phone_hce',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-chioma',
    fullName: 'Chioma Okafor',
    email: 'chioma.okafor@gmail.com',
    phone: '+234 812 884 9012',
    userTag: '@chioma_o',
    cardUid: 'TPL-NFC-773104',
    nfcToken: '0x3CE881A49019',
    balance: 14200,
    kycTier: 'tier_3',
    bvnVerified: true,
    ninVerified: true,
    dailyTransferLimit: 1000000,
    autoTopUpEnabled: false,
    autoTopUpThreshold: 500,
    autoTopUpAmount: 2000,
    virtualAccount: {
      bank: 'Sterling Bank',
      accountNumber: '8839102941',
      accountName: 'TAPLINK - CHIOMA OKAFOR',
      ussdPrefix: '*822*8839102941#'
    },
    linkedNfcHardware: 'physical_card',
    avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80'
  }
];

const INITIAL_MERCHANT: MerchantProfile = {
  id: 'merch-primemart',
  businessName: 'PrimeMart Retail & Gourmet Groceries Ltd',
  tradingName: 'PrimeMart Express Store',
  category: 'Supermarket, Gourmet & Convenience',
  cacRcNumber: 'RC-1849204',
  contactEmail: 'finance@primemart.ng',
  contactPhone: '+234 1 892 4000',
  address: 'Block 4, Admiralty Way, Lekki Phase 1, Lagos',
  settlementAccount: {
    bankName: 'Zenith Bank PLC',
    accountNumber: '1019284721',
    accountName: 'PRIMEMART RETAIL LTD - SETTLEMENT',
    settlementFrequency: 'instant'
  },
  activeProcessor: 'NIBSS',
  qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=taplink://pay/merch-primemart',
  paymentLinkUrl: 'https://pay.taplink.ng/primemart-express'
};

const INITIAL_TERMINALS: Terminal[] = [
  {
    id: 'term-pos-01',
    code: 'POS-LEK-01',
    name: 'Smart POS Checkout Lane 1',
    type: 'android_smart_pos',
    location: 'Lekki Flagship Store - Till 1',
    assignedStaffOrStore: 'Chinedu Eze (Cashier)',
    status: 'online',
    telemetry: {
      batteryPct: 92,
      isCharging: true,
      signalStrength: '4G',
      firmwareVersion: 'v3.2.0-pos',
      lastHeartbeat: new Date().toISOString(),
      queuedOfflineCount: 0,
      cpuTempC: 37,
      storageUsagePct: 22,
      readerHealth: 'healthy'
    },
    totalTapsToday: 184,
    totalRevenueToday: 342500,
    merchantId: 'merch-primemart'
  },
  {
    id: 'term-pos-02',
    code: 'POS-LEK-02',
    name: 'Smart POS Checkout Lane 2',
    type: 'android_smart_pos',
    location: 'Lekki Flagship Store - Till 2',
    assignedStaffOrStore: 'Fatima Aliu (Cashier)',
    status: 'online',
    telemetry: {
      batteryPct: 78,
      isCharging: false,
      signalStrength: '4G',
      firmwareVersion: 'v3.2.0-pos',
      lastHeartbeat: new Date(Date.now() - 30000).toISOString(),
      queuedOfflineCount: 0,
      cpuTempC: 39,
      storageUsagePct: 28,
      readerHealth: 'healthy'
    },
    totalTapsToday: 142,
    totalRevenueToday: 268000,
    merchantId: 'merch-primemart'
  },
  {
    id: 'term-counter-01',
    code: 'PAD-CAFE-01',
    name: 'Countertop NFC Tap Reader',
    type: 'contactless_countertop',
    location: 'Espresso & Bakery Counter',
    assignedStaffOrStore: 'Barista Counter Station',
    status: 'online',
    telemetry: {
      batteryPct: 100,
      isCharging: true,
      signalStrength: 'WIFI',
      firmwareVersion: 'v3.2.0-pos',
      lastHeartbeat: new Date(Date.now() - 15000).toISOString(),
      queuedOfflineCount: 0,
      cpuTempC: 35,
      storageUsagePct: 15,
      readerHealth: 'healthy'
    },
    totalTapsToday: 98,
    totalRevenueToday: 147500,
    merchantId: 'merch-primemart'
  },
  {
    id: 'term-softpos-01',
    code: 'SOFTPOS-MGR',
    name: 'Mobile Floor Manager SoftPOS',
    type: 'mobile_nfc_softpos',
    location: 'Floor Roaming & VIP Curbside',
    assignedStaffOrStore: 'Emeka Nwosu (Floor Mgr)',
    status: 'online',
    telemetry: {
      batteryPct: 64,
      isCharging: false,
      signalStrength: '4G',
      firmwareVersion: 'v3.2.0-pos',
      lastHeartbeat: new Date(Date.now() - 60000).toISOString(),
      queuedOfflineCount: 0,
      cpuTempC: 40,
      storageUsagePct: 34,
      readerHealth: 'healthy'
    },
    totalTapsToday: 45,
    totalRevenueToday: 189000,
    merchantId: 'merch-primemart'
  }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-001',
    reference: 'TPL-TX-910248',
    timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    amount: 8500,
    currency: 'NGN',
    type: 'debit',
    paymentMethod: 'nfc_tap',
    category: 'groceries',
    customerId: 'user-bolaji',
    customerName: 'Bolaji Adebayo',
    customerTag: '@bolaji',
    merchantId: 'merch-primemart',
    merchantName: 'PrimeMart Express Store',
    terminalId: 'term-pos-01',
    terminalCode: 'POS-LEK-01',
    terminalName: 'Smart POS Checkout Lane 1',
    location: 'Lekki Phase 1, Lagos',
    description: 'Groceries & Household Supplies',
    status: 'successful',
    offlineQueued: false,
    latencyMs: 142,
    cryptographicTapHash: '0xTPL_89A149C0_38d9f10a82b4',
    processorReference: 'NIP-8491024',
    disputeStatus: 'none'
  },
  {
    id: 'tx-002',
    reference: 'TPL-TX-849102',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    amount: 15000,
    currency: 'NGN',
    type: 'debit',
    paymentMethod: 'transfer',
    category: 'transfer',
    customerId: 'user-bolaji',
    customerName: 'Bolaji Adebayo',
    customerTag: '@bolaji',
    destinationBank: {
      bankName: 'Guaranty Trust Bank (GTBank)',
      accountNumber: '0129481729',
      accountName: 'IBRAHIM SULEIMAN',
      bankCode: '058'
    },
    description: 'Interbank Transfer to Ibrahim Suleiman',
    status: 'successful',
    offlineQueued: false,
    latencyMs: 380,
    processorReference: 'NIP-7731920',
    disputeStatus: 'none'
  },
  {
    id: 'tx-003',
    reference: 'TPL-TX-773819',
    timestamp: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    amount: 3000,
    currency: 'NGN',
    type: 'debit',
    paymentMethod: 'bill_payment',
    category: 'utilities',
    customerId: 'user-bolaji',
    customerName: 'Bolaji Adebayo',
    customerTag: '@bolaji',
    description: 'MTN 10GB Monthly Super Data Plan',
    billDetails: {
      billerType: 'data',
      provider: 'MTN Nigeria',
      packageOrPlan: '10GB Monthly Super Plan',
      customerPhoneOrId: '08034918820'
    },
    status: 'successful',
    offlineQueued: false,
    latencyMs: 290,
    processorReference: 'VTU-MTN-884102',
    disputeStatus: 'none'
  },
  {
    id: 'tx-004',
    reference: 'TPL-TX-662910',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    amount: 2200,
    currency: 'NGN',
    type: 'debit',
    paymentMethod: 'qr_code',
    category: 'dining',
    customerId: 'user-bolaji',
    customerName: 'Bolaji Adebayo',
    customerTag: '@bolaji',
    merchantId: 'merch-primemart',
    merchantName: 'PrimeMart Espresso Bar',
    location: 'Lekki Bakery Counter',
    description: 'Fresh Cappuccino & Butter Croissant',
    status: 'successful',
    offlineQueued: false,
    latencyMs: 195,
    processorReference: 'QR-PSTK-449102',
    disputeStatus: 'none'
  },
  {
    id: 'tx-005',
    reference: 'TPL-TX-551029',
    timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    amount: 50000,
    currency: 'NGN',
    type: 'credit',
    paymentMethod: 'top_up',
    category: 'deposit',
    customerId: 'user-bolaji',
    customerName: 'Bolaji Adebayo',
    customerTag: '@bolaji',
    description: 'Direct Bank Transfer Inflow via ALAT NUBAN (9102938471)',
    status: 'successful',
    offlineQueued: false,
    latencyMs: 120,
    processorReference: 'NIP-CR-992014',
    disputeStatus: 'none'
  },
  {
    id: 'tx-006',
    reference: 'TPL-TX-440192',
    timestamp: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    amount: 6200,
    currency: 'NGN',
    type: 'debit',
    paymentMethod: 'nfc_tap',
    category: 'groceries',
    customerId: 'user-chioma',
    customerName: 'Chioma Okafor',
    customerTag: '@chioma_o',
    merchantId: 'merch-primemart',
    merchantName: 'PrimeMart Express Store',
    terminalId: 'term-pos-02',
    terminalCode: 'POS-LEK-02',
    terminalName: 'Smart POS Checkout Lane 2',
    location: 'Lekki Phase 1, Lagos',
    description: 'Prime Bakery & Fresh Fruits',
    status: 'disputed',
    offlineQueued: false,
    latencyMs: 138,
    cryptographicTapHash: '0xTPL_3CE881A4_99214ab9102c',
    processorReference: 'NIP-6610294',
    disputeReason: 'double_charge',
    disputeDescription: 'NFC reader beeped twice during payment. Tapped once but debited twice.',
    disputeStatus: 'under_review',
    disputeCreatedAt: new Date(Date.now() - 13 * 3600 * 1000).toISOString(),
    disputeTimeline: [
      {
        timestamp: new Date(Date.now() - 13 * 3600 * 1000).toISOString(),
        status: 'under_review',
        note: 'Customer filed 1-click dispute: Duplicate charge on Smart POS Checkout Lane 2',
        actor: 'customer'
      },
      {
        timestamp: new Date(Date.now() - 13 * 3600 * 1000 + 1500).toISOString(),
        status: 'under_review',
        note: 'Taplink AI Audit Engine: Confirmed duplicate transaction signature within 42 seconds. Flagged for automatic instant reversal.',
        actor: 'system'
      }
    ]
  }
];

const INITIAL_SETTLEMENTS: SettlementBatch[] = [
  {
    id: 'BATCH-883192',
    batchNumber: 'TPL-SET-20260818-801',
    date: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    periodStart: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    periodEnd: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    transactionCount: 420,
    grossAmount: 947500,
    processingFee: 7106,
    netPayout: 940394,
    status: 'completed',
    processor: 'NIBSS',
    destinationBank: {
      bankName: 'Zenith Bank PLC',
      accountNumber: '1019284721',
      accountName: 'PRIMEMART RETAIL LTD',
      nubanCode: '057'
    },
    payoutReference: 'NIBSS-NIP-PAYOUT-9941829'
  }
];

const INITIAL_TEAM: TeamMember[] = [
  {
    id: 'team-01',
    name: 'Adewale Balogun',
    email: 'adewale@primemart.ng',
    phone: '+234 802 334 9011',
    role: 'owner',
    status: 'active',
    lastActive: 'Just now',
    permissions: ['all']
  },
  {
    id: 'team-02',
    name: 'Emeka Nwosu',
    email: 'emeka.n@primemart.ng',
    phone: '+234 813 902 4410',
    role: 'manager',
    status: 'active',
    lastActive: '10 mins ago',
    permissions: ['manage_terminals', 'view_reports', 'reboot_devices', 'issue_refunds']
  },
  {
    id: 'team-03',
    name: 'Khadijah Bello',
    email: 'khadijah@primemart.ng',
    phone: '+234 809 112 8830',
    role: 'finance',
    status: 'active',
    lastActive: '1 hour ago',
    permissions: ['execute_settlement', 'approve_refunds', 'export_ledger', 'view_reconciliation']
  },
  {
    id: 'team-04',
    name: 'Chinedu Eze',
    email: 'chinedu.e@primemart.ng',
    phone: '+234 805 774 1920',
    role: 'cashier',
    status: 'active',
    lastActive: '2 mins ago',
    permissions: ['accept_payments', 'view_terminal_status']
  }
];

type Listener = () => void;

class TaplinkStateService {
  private transactions: Transaction[] = [];
  private terminals: Terminal[] = [];
  private consumers: ConsumerProfile[] = [];
  private activeConsumerId: string = 'user-bolaji';
  private merchant: MerchantProfile = INITIAL_MERCHANT;
  private settlements: SettlementBatch[] = [];
  private team: TeamMember[] = [];
  private isNetworkOffline: boolean = false;
  private listeners: Set<Listener> = new Set();
  private telemetryInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.loadState();
    this.startTelemetryHeartbeat();
  }

  private loadState(): void {
    if (typeof window === 'undefined') return;

    try {
      const tx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      this.transactions = tx ? JSON.parse(tx) : INITIAL_TRANSACTIONS;

      const terms = localStorage.getItem(STORAGE_KEYS.TERMINALS);
      this.terminals = terms ? JSON.parse(terms) : INITIAL_TERMINALS;

      const cons = localStorage.getItem(STORAGE_KEYS.CONSUMERS);
      this.consumers = cons ? JSON.parse(cons) : INITIAL_CONSUMERS;

      const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_CONSUMER_ID);
      if (activeId && this.consumers.some(c => c.id === activeId)) {
        this.activeConsumerId = activeId;
      }

      const merch = localStorage.getItem(STORAGE_KEYS.MERCHANT);
      this.merchant = merch ? JSON.parse(merch) : INITIAL_MERCHANT;

      const sets = localStorage.getItem(STORAGE_KEYS.SETTLEMENTS);
      this.settlements = sets ? JSON.parse(sets) : INITIAL_SETTLEMENTS;

      const tm = localStorage.getItem(STORAGE_KEYS.TEAM);
      this.team = tm ? JSON.parse(tm) : INITIAL_TEAM;

      const netOff = localStorage.getItem(STORAGE_KEYS.IS_NETWORK_OFFLINE);
      this.isNetworkOffline = netOff === 'true';
    } catch {
      this.transactions = INITIAL_TRANSACTIONS;
      this.terminals = INITIAL_TERMINALS;
      this.consumers = INITIAL_CONSUMERS;
      this.merchant = INITIAL_MERCHANT;
      this.settlements = INITIAL_SETTLEMENTS;
      this.team = INITIAL_TEAM;
      this.isNetworkOffline = false;
    }
  }

  private saveState(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(this.transactions));
      localStorage.setItem(STORAGE_KEYS.TERMINALS, JSON.stringify(this.terminals));
      localStorage.setItem(STORAGE_KEYS.CONSUMERS, JSON.stringify(this.consumers));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CONSUMER_ID, this.activeConsumerId);
      localStorage.setItem(STORAGE_KEYS.MERCHANT, JSON.stringify(this.merchant));
      localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(this.settlements));
      localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(this.team));
      localStorage.setItem(STORAGE_KEYS.IS_NETWORK_OFFLINE, String(this.isNetworkOffline));
    } catch {
      // storage quota fallback
    }
    this.notify();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(l => l());
  }

  // Live Telemetry Simulation Heartbeat
  private startTelemetryHeartbeat(): void {
    if (this.telemetryInterval) return;
    this.telemetryInterval = setInterval(() => {
      this.terminals = this.terminals.map(term => {
        const battChange = term.telemetry.isCharging ? 0.5 : -0.1;
        const newBatt = Math.min(100, Math.max(12, Math.round((term.telemetry.batteryPct + battChange) * 10) / 10));
        
        return {
          ...term,
          telemetry: {
            ...term.telemetry,
            batteryPct: newBatt,
            lastHeartbeat: new Date().toISOString(),
            signalStrength: this.isNetworkOffline ? 'OFFLINE' : (term.telemetry.signalStrength === 'OFFLINE' ? '4G' : term.telemetry.signalStrength)
          }
        };
      });
      this.saveState();
    }, 20000);
  }

  // Getters
  public getTransactions(): Transaction[] {
    return [...this.transactions];
  }

  public getTerminals(): Terminal[] {
    return [...this.terminals];
  }

  public getConsumers(): ConsumerProfile[] {
    return [...this.consumers];
  }

  public getConsumerById(id: string): ConsumerProfile | undefined {
    return this.consumers.find(c => c.id === id);
  }

  public getActiveConsumer(): ConsumerProfile {
    return this.consumers.find(c => c.id === this.activeConsumerId) || this.consumers[0];
  }

  public getMerchant(): MerchantProfile {
    return { ...this.merchant };
  }

  // Alias for backward compatibility
  public getOperator(): MerchantProfile {
    return this.getMerchant();
  }

  public getSettlements(): SettlementBatch[] {
    return [...this.settlements];
  }

  public getTeam(): TeamMember[] {
    return [...this.team];
  }

  public getIsNetworkOffline(): boolean {
    return this.isNetworkOffline;
  }

  public setActiveConsumer(id: string): void {
    if (this.consumers.some(c => c.id === id)) {
      this.activeConsumerId = id;
      this.saveState();
    }
  }

  public toggleGlobalOffline(isOffline?: boolean): boolean {
    this.isNetworkOffline = isOffline !== undefined ? isOffline : !this.isNetworkOffline;
    this.terminals = this.terminals.map(t => ({
      ...t,
      status: this.isNetworkOffline ? 'offline' : 'online',
      telemetry: {
        ...t.telemetry,
        signalStrength: this.isNetworkOffline ? 'OFFLINE' : '4G'
      }
    }));
    this.saveState();
    return this.isNetworkOffline;
  }

  // Interbank Account Name Resolution Simulation
  public resolveBankAccount(bankCode: string, accountNumber: string): { valid: boolean; accountName: string; bankName: string } {
    if (accountNumber.length !== 10) {
      return { valid: false, accountName: '', bankName: '' };
    }
    const bank = NIGERIAN_BANKS.find(b => b.code === bankCode) || NIGERIAN_BANKS[0];
    
    const names = [
      'OLUWASEUN ADEKUNLE & SONS',
      'IBRAHIM ABDULLAHI SULE',
      'CHUKWUDI EMMANUEL EZE',
      'FATIMA ALIYU MOHAMMED',
      'BLESSING NNENNA OKAFOR',
      'KAYODE BABATUNDE ENGR'
    ];
    const index = (parseInt(accountNumber.slice(-2), 10) || 0) % names.length;

    return {
      valid: true,
      accountName: names[index],
      bankName: bank.name
    };
  }

  // 1. CORE NFC TAP PAYMENT (<300ms execution target)
  public async executeTapPayment(
    consumerId: string,
    terminalId: string,
    customAmount?: number
  ): Promise<{ success: boolean; transaction: Transaction; message: string; balanceRemaining: number }> {
    const consumer = this.consumers.find(c => c.id === consumerId);
    const terminal = this.terminals.find(t => t.id === terminalId);

    if (!consumer) throw new Error('Consumer profile not found.');
    if (!terminal) throw new Error('POS Terminal not found.');

    const amount = customAmount !== undefined ? customAmount : 2500;
    const isOffline = this.isNetworkOffline || terminal.status === 'offline';

    // Call dedicated NFC service module
    const auth = await nfcService.authorizeTap({
      cardUid: consumer.cardUid,
      nfcToken: consumer.nfcToken,
      consumerId: consumer.id,
      terminalId: terminal.id,
      amount,
      currency: 'NGN'
    }, isOffline);

    // Insufficient funds check
    if (consumer.balance < amount) {
      const failedTx: Transaction = {
        id: `tx-${Date.now().toString().slice(-6)}`,
        reference: `TPL-TX-${Math.floor(Math.random() * 899999 + 100000)}`,
        timestamp: new Date().toISOString(),
        amount,
        currency: 'NGN',
        type: 'debit',
        paymentMethod: 'nfc_tap',
        category: 'groceries',
        customerId: consumer.id,
        customerName: consumer.fullName,
        customerTag: consumer.userTag,
        merchantId: this.merchant.id,
        merchantName: this.merchant.tradingName,
        terminalId: terminal.id,
        terminalCode: terminal.code,
        terminalName: terminal.name,
        location: terminal.location,
        description: `NFC Tap at ${terminal.name}`,
        status: 'failed',
        failureReason: `Insufficient balance (Balance: ₦${consumer.balance.toLocaleString()}, Needed: ₦${amount.toLocaleString()})`,
        offlineQueued: false,
        latencyMs: auth.latencyMs,
        cryptographicTapHash: auth.cryptographicHash,
        processorReference: 'DECLINED-INSUFFICIENT-FUNDS',
        disputeStatus: 'none'
      };

      this.transactions.unshift(failedTx);
      this.saveState();

      return {
        success: false,
        transaction: failedTx,
        message: `Tap declined: Insufficient balance. Available ₦${consumer.balance.toLocaleString()}, required ₦${amount.toLocaleString()}.`,
        balanceRemaining: consumer.balance
      };
    }

    // Success or Queued (Offline)
    consumer.balance -= amount;
    const txStatus = isOffline ? 'pending' : 'successful';

    const tx: Transaction = {
      id: `tx-${Date.now().toString().slice(-6)}`,
      reference: `TPL-TX-${Math.floor(Math.random() * 899999 + 100000)}`,
      timestamp: new Date().toISOString(),
      amount,
      currency: 'NGN',
      type: 'debit',
      paymentMethod: 'nfc_tap',
      category: 'groceries',
      customerId: consumer.id,
      customerName: consumer.fullName,
      customerTag: consumer.userTag,
      merchantId: this.merchant.id,
      merchantName: this.merchant.tradingName,
      terminalId: terminal.id,
      terminalCode: terminal.code,
      terminalName: terminal.name,
      location: terminal.location,
      description: `Contactless NFC Payment at ${terminal.name}`,
      status: txStatus,
      offlineQueued: isOffline,
      syncedAt: isOffline ? undefined : new Date().toISOString(),
      latencyMs: auth.latencyMs,
      cryptographicTapHash: auth.cryptographicHash,
      processorReference: auth.authorizationCode,
      disputeStatus: 'none'
    };

    // Update Terminal stats
    terminal.totalTapsToday += 1;
    terminal.totalRevenueToday += amount;
    if (isOffline) {
      terminal.telemetry.queuedOfflineCount += 1;
    }

    this.transactions.unshift(tx);
    this.saveState();

    return {
      success: true,
      transaction: tx,
      message: isOffline 
        ? `NFC Tap Authenticated Offline (Queued). ₦${amount.toLocaleString()} debited locally.` 
        : `NFC Tap Approved in ${auth.latencyMs}ms! ₦${amount.toLocaleString()} paid to ${this.merchant.tradingName}.`,
      balanceRemaining: consumer.balance
    };
  }

  // 2. SEND MONEY (INTERBANK & TAPLINK P2P)
  public async sendMoney(req: SendMoneyRequest): Promise<{ success: boolean; transaction: Transaction; message: string }> {
    const sender = this.getActiveConsumer();
    if (sender.balance < req.amount) {
      throw new Error(`Insufficient wallet balance. Available: ₦${sender.balance.toLocaleString()}`);
    }

    if (req.amount > sender.dailyTransferLimit) {
      throw new Error(`Transfer amount exceeds daily limit of ₦${sender.dailyTransferLimit.toLocaleString()} for KYC ${sender.kycTier.toUpperCase()}`);
    }

    // Micro delay simulating interbank switch
    await new Promise(res => setTimeout(res, 400));

    sender.balance -= req.amount;

    let desc = '';
    let counterpartyName = '';

    if (req.recipientType === 'taplink_user') {
      desc = `Taplink Transfer to ${req.taplinkTagOrPhone}`;
      counterpartyName = req.taplinkTagOrPhone || '@recipient';
      
      // If recipient is in local consumer database, credit them
      const recipientUser = this.consumers.find(c => c.userTag.toLowerCase() === req.taplinkTagOrPhone?.toLowerCase() || c.phone === req.taplinkTagOrPhone);
      if (recipientUser) {
        recipientUser.balance += req.amount;
        counterpartyName = recipientUser.fullName;
      }
    } else {
      desc = `Interbank Transfer to ${req.accountName || req.accountNumber} (${req.bankName})`;
      counterpartyName = req.accountName || 'Beneficiary';
    }

    const tx: Transaction = {
      id: `tx-${Date.now().toString().slice(-6)}`,
      reference: `TPL-TRF-${Math.floor(Math.random() * 899999 + 100000)}`,
      timestamp: new Date().toISOString(),
      amount: req.amount,
      currency: 'NGN',
      type: 'debit',
      paymentMethod: 'transfer',
      category: 'transfer',
      customerId: sender.id,
      customerName: sender.fullName,
      customerTag: sender.userTag,
      destinationBank: req.recipientType === 'bank_account' ? {
        bankName: req.bankName || 'Access Bank',
        accountNumber: req.accountNumber || '0000000000',
        accountName: req.accountName || 'Beneficiary',
        bankCode: req.bankCode || '044'
      } : undefined,
      description: req.narration ? `${desc} - ${req.narration}` : desc,
      status: 'successful',
      offlineQueued: false,
      latencyMs: 380,
      processorReference: `NIP-TRF-${Math.floor(Math.random() * 8999999 + 1000000)}`,
      disputeStatus: 'none'
    };

    this.transactions.unshift(tx);
    this.saveState();

    return {
      success: true,
      transaction: tx,
      message: `₦${req.amount.toLocaleString()} transferred successfully to ${counterpartyName}.`
    };
  }

  // 3. BILL PAYMENT & AIRTIME
  public async payBill(req: BillPaymentRequest): Promise<{ success: boolean; transaction: Transaction; message: string; meterToken?: string }> {
    const consumer = this.getActiveConsumer();
    if (consumer.balance < req.amount) {
      throw new Error(`Insufficient funds for bill payment. Available: ₦${consumer.balance.toLocaleString()}`);
    }

    await new Promise(res => setTimeout(res, 350));
    consumer.balance -= req.amount;

    let token: string | undefined;
    if (req.category === 'electricity') {
      token = billerService.generateMeterToken();
    }

    const tx: Transaction = {
      id: `tx-${Date.now().toString().slice(-6)}`,
      reference: `TPL-BIL-${Math.floor(Math.random() * 899999 + 100000)}`,
      timestamp: new Date().toISOString(),
      amount: req.amount,
      currency: 'NGN',
      type: 'debit',
      paymentMethod: 'bill_payment',
      category: 'utilities',
      customerId: consumer.id,
      customerName: consumer.fullName,
      customerTag: consumer.userTag,
      description: `${req.provider} ${req.packageOrPlan || req.category.toUpperCase()} (${req.recipient})`,
      billDetails: {
        billerType: req.category,
        provider: req.provider,
        packageOrPlan: req.packageOrPlan,
        customerPhoneOrId: req.recipient,
        token
      },
      status: 'successful',
      offlineQueued: false,
      latencyMs: 280,
      processorReference: `AGG-${req.provider.toUpperCase().slice(0, 3)}-${Date.now().toString(36).toUpperCase()}`,
      disputeStatus: 'none'
    };

    this.transactions.unshift(tx);
    this.saveState();

    return {
      success: true,
      transaction: tx,
      message: `₦${req.amount.toLocaleString()} ${req.category} recharge successful for ${req.recipient}.`,
      meterToken: token
    };
  }

  // 4. SCAN / QR CODE PAYMENT
  public async payWithQrCode(merchantId: string, amount: number, note?: string): Promise<{ success: boolean; transaction: Transaction; message: string }> {
    const consumer = this.getActiveConsumer();
    if (consumer.balance < amount) {
      throw new Error(`Insufficient funds. Current balance: ₦${consumer.balance.toLocaleString()}`);
    }

    await new Promise(res => setTimeout(res, 200));
    consumer.balance -= amount;

    const tx: Transaction = {
      id: `tx-${Date.now().toString().slice(-6)}`,
      reference: `TPL-QR-${Math.floor(Math.random() * 899999 + 100000)}`,
      timestamp: new Date().toISOString(),
      amount,
      currency: 'NGN',
      type: 'debit',
      paymentMethod: 'qr_code',
      category: 'retail',
      customerId: consumer.id,
      customerName: consumer.fullName,
      customerTag: consumer.userTag,
      merchantId: this.merchant.id,
      merchantName: this.merchant.tradingName,
      description: note || `Instant QR Checkout at ${this.merchant.tradingName}`,
      status: 'successful',
      offlineQueued: false,
      latencyMs: 210,
      processorReference: `QR-${Math.floor(Math.random() * 8999999 + 1000000)}`,
      disputeStatus: 'none'
    };

    this.transactions.unshift(tx);
    this.saveState();

    return {
      success: true,
      transaction: tx,
      message: `₦${amount.toLocaleString()} paid via QR Code to ${this.merchant.tradingName}.`
    };
  }

  // 5. TOP-UP WALLET
  public topUpWallet(consumerId: string, req: TopUpRequest): Promise<{ success: boolean; newBalance: number; reference: string }> {
    const consumer = this.consumers.find(c => c.id === consumerId) || this.getActiveConsumer();
    consumer.balance += req.amount;

    const ref = `TOP-${req.method.toUpperCase().slice(0, 4)}-${Date.now().toString(36).toUpperCase()}`;

    const tx: Transaction = {
      id: `tx-${Date.now().toString().slice(-6)}`,
      reference: ref,
      timestamp: new Date().toISOString(),
      amount: req.amount,
      currency: 'NGN',
      type: 'credit',
      paymentMethod: 'top_up',
      category: 'deposit',
      customerId: consumer.id,
      customerName: consumer.fullName,
      customerTag: consumer.userTag,
      description: `Wallet Funding via ${req.method.replace('_', ' ').toUpperCase()}`,
      status: 'successful',
      offlineQueued: false,
      latencyMs: 140,
      processorReference: `NIP-FUND-${Math.floor(Math.random() * 899999 + 100000)}`,
      disputeStatus: 'none'
    };

    this.transactions.unshift(tx);
    this.saveState();

    return Promise.resolve({
      success: true,
      newBalance: consumer.balance,
      reference: ref
    });
  }

  // Alias for backward compatibility
  public topUpBalance(consumerId: string, req: TopUpRequest) {
    return this.topUpWallet(consumerId, req);
  }

  // 6. DISPUTE / CHARGEBACK LIFECYCLE (FIRST-CLASS CITIZEN)
  public submitDispute(
    transactionId: string,
    reason: DisputeReason,
    description: string
  ): Transaction {
    const tx = this.transactions.find(t => t.id === transactionId);
    if (!tx) throw new Error('Transaction not found.');

    const now = new Date().toISOString();
    tx.status = 'disputed';
    tx.disputeReason = reason;
    tx.disputeDescription = description;
    tx.disputeStatus = 'under_review';
    tx.disputeCreatedAt = now;
    tx.disputeTimeline = [
      ...(tx.disputeTimeline || []),
      {
        timestamp: now,
        status: 'under_review',
        note: `Dispute filed by customer (${reason.replace(/_/g, ' ')}): "${description}"`,
        actor: 'customer'
      }
    ];

    // Automated duplicate tap analysis & fast resolution
    if (reason === 'double_charge' || reason === 'failed_tap_debited') {
      tx.disputeTimeline.push({
        timestamp: new Date(Date.now() + 1200).toISOString(),
        status: 'under_review',
        note: 'AI Taplink Audit Bot: Confirmed same-card authorization signature and terminal log parity. Priority reversal queue active.',
        actor: 'system'
      });
    }

    this.saveState();
    return tx;
  }

  public fileDispute(
    transactionId: string,
    reason: DisputeReason,
    description: string
  ): Transaction {
    return this.submitDispute(transactionId, reason, description);
  }

  public resolveDispute(
    transactionId: string,
    decision: 'approved_refunded' | 'rejected',
    note: string,
    refundAmount?: number
  ): { transaction: Transaction; refunded: boolean; customerBalance: number } {
    const tx = this.transactions.find(t => t.id === transactionId);
    if (!tx) throw new Error('Transaction not found.');

    const now = new Date().toISOString();
    const amountToRefund = refundAmount !== undefined ? refundAmount : tx.amount;
    let refunded = false;
    let customerBal = 0;

    const consumer = this.consumers.find(c => c.id === tx.customerId);

    if (decision === 'approved_refunded') {
      tx.status = 'reversed';
      tx.disputeStatus = 'approved_refunded';
      tx.disputeResolvedAt = now;
      tx.disputeRefundAmount = amountToRefund;
      refunded = true;

      // Credit back to customer wallet
      if (consumer) {
        consumer.balance += amountToRefund;
        customerBal = consumer.balance;
      }
    } else {
      tx.status = 'failed';
      tx.disputeStatus = 'rejected';
      tx.disputeResolvedAt = now;
      if (consumer) customerBal = consumer.balance;
    }

    tx.disputeTimeline = [
      ...(tx.disputeTimeline || []),
      {
        timestamp: now,
        status: decision,
        note: `Merchant / Support Decision: ${note}. ${refunded ? `₦${amountToRefund.toLocaleString()} credited back to customer wallet.` : 'Dispute claim rejected.'}`,
        actor: 'merchant'
      }
    ];

    this.saveState();
    return {
      transaction: tx,
      refunded,
      customerBalance: customerBal
    };
  }

  // 7. SYNC OFFLINE TRANSACTIONS
  public syncOfflineQueue(): { syncedCount: number; transactions: Transaction[] } {
    const offlineTxs = this.transactions.filter(t => t.offlineQueued && t.status === 'pending');
    const now = new Date().toISOString();

    this.transactions = this.transactions.map(t => {
      if (t.offlineQueued && t.status === 'pending') {
        return {
          ...t,
          status: 'successful',
          offlineQueued: false,
          syncedAt: now,
          processorReference: `SYNC-NIP-${Math.floor(Math.random() * 8999999 + 1000000)}`
        };
      }
      return t;
    });

    this.terminals = this.terminals.map(t => ({
      ...t,
      telemetry: {
        ...t.telemetry,
        queuedOfflineCount: 0
      }
    }));

    this.saveState();
    return {
      syncedCount: offlineTxs.length,
      transactions: this.transactions
    };
  }

  // 8. SETTLEMENT & PAYOUT BATCHING
  public async executeSettlementBatch(processorOverride?: SettlementProcessor): Promise<SettlementBatch> {
    const processor = processorOverride || this.merchant.activeProcessor;
    const destBank = {
      bankName: this.merchant.settlementAccount.bankName,
      accountNumber: this.merchant.settlementAccount.accountNumber,
      accountName: this.merchant.settlementAccount.accountName,
      nubanCode: '057'
    };

    const batch = settlementRegistry.calculateBatchFromTransactions(
      this.transactions,
      processor,
      destBank
    );

    const adapter = settlementRegistry.getAdapter(processor);
    const result = await adapter.executePayout(batch, destBank);

    const finalizedBatch: SettlementBatch = {
      ...batch,
      id: result.batchId,
      status: 'completed',
      payoutReference: result.payoutReference,
      processingFee: result.processingFee,
      netPayout: result.netAmount
    };

    this.settlements.unshift(finalizedBatch);
    this.saveState();
    return finalizedBatch;
  }

  // 9. TERMINAL REBOOT & SETTINGS
  public rebootTerminal(terminalId: string): void {
    const terminal = this.terminals.find(t => t.id === terminalId);
    if (terminal) {
      terminal.telemetry.lastHeartbeat = new Date().toISOString();
      terminal.telemetry.cpuTempC = 34;
      terminal.status = 'online';
      this.saveState();
    }
  }

  public updateMerchantSettings(settings: Partial<MerchantProfile>): MerchantProfile {
    this.merchant = {
      ...this.merchant,
      ...settings
    };
    this.saveState();
    return this.merchant;
  }

  public updateOperatorSettings(settings: Partial<MerchantProfile>): MerchantProfile {
    return this.updateMerchantSettings(settings);
  }

  public createTerminal(data: {
    code: string;
    name: string;
    type: Terminal['type'];
    location: string;
    assignedStaffOrStore?: string;
  }): Terminal {
    const newTerm: Terminal = {
      id: `term-${Date.now().toString().slice(-4)}`,
      code: data.code,
      name: data.name,
      type: data.type,
      location: data.location,
      assignedStaffOrStore: data.assignedStaffOrStore || 'Till 1',
      status: 'online',
      telemetry: {
        batteryPct: 100,
        isCharging: true,
        signalStrength: '4G',
        firmwareVersion: 'v3.2.0-pos',
        lastHeartbeat: new Date().toISOString(),
        queuedOfflineCount: 0,
        cpuTempC: 35,
        storageUsagePct: 12,
        readerHealth: 'healthy'
      },
      totalTapsToday: 0,
      totalRevenueToday: 0,
      merchantId: this.merchant.id
    };

    this.terminals.push(newTerm);
    this.saveState();
    return newTerm;
  }

  public assignTerminal(terminalId: string, location: string, assignedStaffOrStore?: string): void {
    const terminal = this.terminals.find(t => t.id === terminalId);
    if (terminal) {
      terminal.location = location;
      if (assignedStaffOrStore) {
        terminal.assignedStaffOrStore = assignedStaffOrStore;
      }
      this.saveState();
    }
  }

  // 10. TEAM & RBAC
  public addTeamMember(name: string, email: string, phone: string, role: UserRole): TeamMember {
    const permissionsByRole: Record<UserRole, string[]> = {
      owner: ['all'],
      manager: ['manage_terminals', 'view_reports', 'reboot_devices', 'issue_refunds'],
      finance: ['execute_settlement', 'approve_refunds', 'export_ledger', 'view_reconciliation'],
      cashier: ['accept_payments', 'view_terminal_status'],
      technician: ['view_telemetry', 'reboot_devices', 'provision_terminals']
    };

    const newMember: TeamMember = {
      id: `team-${Date.now().toString().slice(-4)}`,
      name,
      email,
      phone,
      role,
      status: 'invited',
      lastActive: 'Never',
      permissions: permissionsByRole[role]
    };

    this.team.push(newMember);
    this.saveState();
    return newMember;
  }

  public removeTeamMember(id: string): void {
    this.team = this.team.filter(t => t.id !== id);
    this.saveState();
  }

  public updateTeamRole(id: string, newRole: UserRole): void {
    const member = this.team.find(t => t.id === id);
    if (member) {
      member.role = newRole;
      this.saveState();
    }
  }

  // Reset to initial demo data
  public resetToDefaults(): void {
    if (typeof window !== 'undefined') {
      Object.values(STORAGE_KEYS).forEach(k => localStorage.getItem(k) && localStorage.removeItem(k));
    }
    this.transactions = INITIAL_TRANSACTIONS;
    this.terminals = INITIAL_TERMINALS;
    this.consumers = INITIAL_CONSUMERS;
    this.merchant = INITIAL_MERCHANT;
    this.settlements = INITIAL_SETTLEMENTS;
    this.team = INITIAL_TEAM;
    this.isNetworkOffline = false;
    this.activeConsumerId = 'user-bolaji';
    this.saveState();
  }
}

export const taplinkApi = new TaplinkStateService();
