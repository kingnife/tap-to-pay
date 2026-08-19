/**
 * Taplink Bill Payments & Utility Aggregator Integration Service
 * Provides catalogs and validation for Nigerian Telcos, Power DISCOs, Cable TV, and Internet.
 */

export interface BillerProvider {
  id: string;
  name: string;
  category: 'airtime' | 'data' | 'electricity' | 'cable_tv' | 'internet';
  logoColor: string;
  packages?: { id: string; name: string; price: number; validity?: string }[];
}

export const NIGERIAN_BILLERS: BillerProvider[] = [
  // Telcos Airtime & Data
  {
    id: 'mtn',
    name: 'MTN Nigeria',
    category: 'airtime',
    logoColor: '#FACC15',
    packages: [
      { id: 'mtn_1gb_daily', name: '1GB Daily + 2min Call', price: 350, validity: '1 Day' },
      { id: 'mtn_2_5gb_2day', name: '2.5GB 2-Day Plan', price: 600, validity: '2 Days' },
      { id: 'mtn_10gb_monthly', name: '10GB Monthly Super Plan', price: 3000, validity: '30 Days' },
      { id: 'mtn_25gb_monthly', name: '25GB Mega Plan', price: 6500, validity: '30 Days' }
    ]
  },
  {
    id: 'airtel',
    name: 'Airtel Nigeria',
    category: 'airtime',
    logoColor: '#EF4444',
    packages: [
      { id: 'airtel_1_5gb_weekly', name: '1.5GB Weekly Plan', price: 500, validity: '7 Days' },
      { id: 'airtel_7gb_monthly', name: '7GB Monthly Binge', price: 2000, validity: '30 Days' },
      { id: 'airtel_15gb_monthly', name: '15GB Monthly Executive', price: 4500, validity: '30 Days' }
    ]
  },
  {
    id: 'glo',
    name: 'Glo (Globacom)',
    category: 'airtime',
    logoColor: '#22C55E',
    packages: [
      { id: 'glo_2gb_special', name: '2GB Weekend Special', price: 500, validity: '3 Days' },
      { id: 'glo_12gb_monthly', name: '12GB Mega Data', price: 2500, validity: '30 Days' }
    ]
  },
  {
    id: '9mobile',
    name: '9mobile Nigeria',
    category: 'airtime',
    logoColor: '#10B981',
    packages: [
      { id: '9mob_1gb', name: '1GB Data Plan', price: 500, validity: '30 Days' },
      { id: '9mob_4_5gb', name: '4.5GB Data Plan', price: 1500, validity: '30 Days' }
    ]
  },

  // Power DISCOs
  {
    id: 'ikedc',
    name: 'Ikeja Electric (IKEDC)',
    category: 'electricity',
    logoColor: '#F97316'
  },
  {
    id: 'ekedc',
    name: 'Eko Electricity (EKEDC)',
    category: 'electricity',
    logoColor: '#3B82F6'
  },
  {
    id: 'aedc',
    name: 'Abuja Electricity (AEDC)',
    category: 'electricity',
    logoColor: '#8B5CF6'
  },
  {
    id: 'ibedc',
    name: 'Ibadan Electricity (IBEDC)',
    category: 'electricity',
    logoColor: '#EC4899'
  },

  // Cable TV
  {
    id: 'dstv',
    name: 'DStv MultiChoice',
    category: 'cable_tv',
    logoColor: '#0EA5E9',
    packages: [
      { id: 'dstv_yanga', name: 'DStv Yanga', price: 4200, validity: '1 Month' },
      { id: 'dstv_confam', name: 'DStv Confam', price: 7400, validity: '1 Month' },
      { id: 'dstv_compact', name: 'DStv Compact', price: 15700, validity: '1 Month' },
      { id: 'dstv_premium', name: 'DStv Premium', price: 37000, validity: '1 Month' }
    ]
  },
  {
    id: 'gotv',
    name: 'GOtv Nigeria',
    category: 'cable_tv',
    logoColor: '#E11D48',
    packages: [
      { id: 'gotv_jinja', name: 'GOtv Jinja', price: 3300, validity: '1 Month' },
      { id: 'gotv_jolli', name: 'GOtv Jolli', price: 4850, validity: '1 Month' },
      { id: 'gotv_max', name: 'GOtv Max', price: 7200, validity: '1 Month' },
      { id: 'gotv_supa', name: 'GOtv Supa Plus', price: 15700, validity: '1 Month' }
    ]
  },
  {
    id: 'startimes',
    name: 'StarTimes TV',
    category: 'cable_tv',
    logoColor: '#6366F1',
    packages: [
      { id: 'startimes_nova', name: 'Nova Bouquet', price: 1500, validity: '1 Month' },
      { id: 'startimes_basic', name: 'Basic Bouquet', price: 3000, validity: '1 Month' },
      { id: 'startimes_classic', name: 'Classic Bouquet', price: 4500, validity: '1 Month' }
    ]
  },

  // Internet Service Providers
  {
    id: 'spectranet',
    name: 'Spectranet 4G LTE',
    category: 'internet',
    logoColor: '#D97706',
    packages: [
      { id: 'spec_25gb', name: '25GB Unified Stay Smart', price: 8000, validity: '30 Days' },
      { id: 'spec_unlimited', name: 'Unlimited Gold', price: 22000, validity: '30 Days' }
    ]
  },
  {
    id: 'smile',
    name: 'Smile Communications',
    category: 'internet',
    logoColor: '#E11D48',
    packages: [
      { id: 'smile_30gb', name: '30GB Bigga Plan', price: 8500, validity: '30 Days' }
    ]
  }
];

export class BillerService {
  public getBillersByCategory(category?: string): BillerProvider[] {
    if (!category || category === 'all') return NIGERIAN_BILLERS;
    return NIGERIAN_BILLERS.filter(b => b.category === category);
  }

  public getBiller(id: string): BillerProvider | undefined {
    return NIGERIAN_BILLERS.find(b => b.id === id);
  }

  public validateCustomerAccount(billerId: string, accountOrPhone: string): { valid: boolean; customerName: string; address?: string } {
    if (!accountOrPhone || accountOrPhone.length < 5) {
      return { valid: false, customerName: '' };
    }

    const biller = this.getBiller(billerId);
    if (biller?.category === 'electricity') {
      return {
        valid: true,
        customerName: 'CHUKWUMA OKAFOR & CO.',
        address: 'Plot 14, Commercial Ave, Yaba, Lagos'
      };
    }
    if (biller?.category === 'cable_tv') {
      return {
        valid: true,
        customerName: 'ADEWALE BABATUNDE',
        address: 'Smartcard Active • Next Due: 30 Days'
      };
    }
    return {
      valid: true,
      customerName: 'Verified Subscriber'
    };
  }

  public generateMeterToken(): string {
    const p1 = Math.floor(Math.random() * 8999 + 1000);
    const p2 = Math.floor(Math.random() * 8999 + 1000);
    const p3 = Math.floor(Math.random() * 8999 + 1000);
    const p4 = Math.floor(Math.random() * 8999 + 1000);
    const p5 = Math.floor(Math.random() * 8999 + 1000);
    return `${p1}-${p2}-${p3}-${p4}-${p5}`;
  }
}

export const billerService = new BillerService();
