import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Smartphone, 
  Wifi, 
  Zap, 
  Tv, 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Receipt,
  Copy,
  Check
} from 'lucide-react';
import { taplinkApi } from '../../lib/api/taplinkApi';
import { billerService, NIGERIAN_BILLERS, BillerProvider } from '../../lib/billers/billerService';
import { useAuth } from '../../context/AuthContext';
import { tapAudio } from '../../lib/audio/tapAudio';
import { Transaction } from '../../types';

interface BillPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (tx: Transaction) => void;
}

export const BillPaymentModal: React.FC<BillPaymentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { consumer } = useAuth();
  const [activeCategory, setActiveCategory] = useState<'airtime' | 'data' | 'electricity' | 'cable_tv' | 'internet'>('airtime');
  
  const providers = billerService.getBillersByCategory(activeCategory);
  const [selectedProvider, setSelectedProvider] = useState<BillerProvider>(providers[0] || NIGERIAN_BILLERS[0]);
  
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [recipient, setRecipient] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [verifiedAccount, setVerifiedAccount] = useState<{ valid: boolean; customerName: string; address?: string } | null>(null);
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);
  const [tokenCopied, setTokenCopied] = useState(false);

  if (!isOpen) return null;

  const handleCategoryChange = (cat: typeof activeCategory) => {
    setActiveCategory(cat);
    const newProviders = billerService.getBillersByCategory(cat);
    const firstProv = newProviders[0] || NIGERIAN_BILLERS[0];
    setSelectedProvider(firstProv);
    setSelectedPackage(firstProv.packages ? firstProv.packages[0] : null);
    setVerifiedAccount(null);
    setError(null);
  };

  const handleProviderSelect = (prov: BillerProvider) => {
    setSelectedProvider(prov);
    setSelectedPackage(prov.packages ? prov.packages[0] : null);
    setVerifiedAccount(null);
  };

  const handleRecipientBlur = () => {
    if ((activeCategory === 'electricity' || activeCategory === 'cable_tv') && recipient.length >= 6) {
      setIsVerifying(true);
      setTimeout(() => {
        const res = billerService.validateCustomerAccount(selectedProvider.id, recipient);
        setVerifiedAccount(res);
        setIsVerifying(false);
      }, 300);
    }
  };

  const calculateAmount = (): number => {
    if (activeCategory === 'data' && selectedPackage) {
      return selectedPackage.price;
    }
    if (activeCategory === 'cable_tv' && selectedPackage) {
      return selectedPackage.price;
    }
    return parseFloat(customAmount) || 0;
  };

  const handlePayBill = async () => {
    setError(null);
    const amountToPay = calculateAmount();

    if (amountToPay < 50) {
      setError('Please select a valid package or enter an amount (min ₦50)');
      return;
    }
    if (amountToPay > consumer.balance) {
      setError(`Insufficient balance. Current balance is ₦${consumer.balance.toLocaleString()}`);
      return;
    }
    if (!recipient.trim()) {
      setError(`Please enter the beneficiary ${activeCategory === 'airtime' || activeCategory === 'data' ? 'Phone Number' : activeCategory === 'electricity' ? 'Meter Number' : 'Smartcard Number'}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await taplinkApi.payBill({
        category: activeCategory,
        provider: selectedProvider.name,
        packageOrPlan: selectedPackage?.name,
        recipient: recipient.trim(),
        amount: amountToPay
      });

      tapAudio.playSuccess();
      setCompletedTx(res.transaction);
      onSuccess(res.transaction);
    } catch (err: any) {
      tapAudio.playError();
      setError(err?.message || 'Bill payment failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyToken = (tok: string) => {
    navigator.clipboard.writeText(tok);
    setTokenCopied(true);
    setTimeout(() => setTokenCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-900 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Pay Bills & Utilities</h2>
              <p className="text-xs text-slate-500 font-medium">Instant Airtime, Data, Power DISCOs & Cable TV</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {!completedTx ? (
            <div className="space-y-5">
              {/* Category Pills */}
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-2xl">
                {[
                  { id: 'airtime', label: 'Airtime', icon: Smartphone },
                  { id: 'data', label: 'Data', icon: Wifi },
                  { id: 'electricity', label: 'Power', icon: Zap },
                  { id: 'cable_tv', label: 'TV', icon: Tv }
                ].map(cat => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryChange(cat.id as any)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                        activeCategory === cat.id
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Provider Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Provider / Network
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {providers.map(prov => (
                    <button
                      key={prov.id}
                      type="button"
                      onClick={() => handleProviderSelect(prov)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                        selectedProvider.id === prov.id
                          ? 'border-amber-400 bg-amber-50/50 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div 
                        className="w-4 h-4 rounded-full shrink-0"
                        style={{ backgroundColor: prov.logoColor }}
                      />
                      <span className="text-xs font-bold text-slate-900 truncate">{prov.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Packages (for Data or TV) */}
              {selectedProvider.packages && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Select Bundle / Bouquet
                  </label>
                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                    {selectedProvider.packages.map(pkg => (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedPackage(pkg)}
                        className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                          selectedPackage?.id === pkg.id
                            ? 'border-amber-400 bg-amber-50 text-slate-900 font-bold shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <span className="truncate">{pkg.name}</span>
                        <span className="font-mono font-bold text-amber-800 shrink-0 ml-2">₦{pkg.price.toLocaleString()}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recipient Input (Phone / Meter / SmartCard) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {activeCategory === 'airtime' || activeCategory === 'data' 
                    ? 'Phone Number' 
                    : activeCategory === 'electricity' 
                    ? 'Meter Number (Prepaid/Postpaid)' 
                    : 'Smartcard / IUC Number'}
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  onBlur={handleRecipientBlur}
                  placeholder={
                    activeCategory === 'airtime' || activeCategory === 'data' 
                      ? '08034918820' 
                      : activeCategory === 'electricity' 
                      ? '44019284019' 
                      : '1092837461'
                  }
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                />

                {isVerifying && (
                  <p className="text-xs text-amber-600 font-medium animate-pulse">Validating customer details with DISCO switch...</p>
                )}

                {verifiedAccount && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                    <p className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {verifiedAccount.customerName}
                    </p>
                    {verifiedAccount.address && <p className="text-[11px] text-emerald-700 mt-0.5">{verifiedAccount.address}</p>}
                  </div>
                )}
              </div>

              {/* Custom Amount (for Airtime / Electricity) */}
              {(!selectedProvider.packages || activeCategory === 'electricity' || activeCategory === 'airtime') && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Amount (₦)
                    </label>
                    <span className="text-xs text-slate-500 font-medium">
                      Balance: <strong className="text-slate-900">₦{consumer.balance.toLocaleString()}</strong>
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-lg font-bold text-slate-400">₦</span>
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="e.g. 2000"
                      className="w-full pl-9 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  {/* Quick Airtime Chips */}
                  <div className="flex gap-2 pt-1">
                    {[500, 1000, 2000, 5000].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setCustomAmount(val.toString())}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                      >
                        +₦{val.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handlePayBill}
                className="w-full py-3.5 px-4 bg-slate-900 hover:bg-black disabled:bg-slate-300 text-white rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing Payment...
                  </span>
                ) : (
                  <span>Pay ₦{calculateAmount().toLocaleString()} Now</span>
                )}
              </button>
            </div>
          ) : (
            /* Success Receipt */
            <div className="text-center py-3 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Recharge Successful</h3>
                <p className="text-2xl font-black text-slate-900 font-mono mt-1">₦{completedTx.amount.toLocaleString()}</p>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Dispatched via {completedTx.billDetails?.provider} Instant Aggregator Rail
                </p>
              </div>

              {/* Electricity Token Callout */}
              {completedTx.billDetails?.token && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-center space-y-1.5">
                  <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">Your Prepaid Meter Token</p>
                  <p className="text-xl font-mono font-black text-slate-900 tracking-wider">
                    {completedTx.billDetails.token}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCopyToken(completedTx.billDetails?.token || '')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-200/70 hover:bg-amber-300 px-3 py-1 rounded-xl transition-colors mt-1"
                  >
                    {tokenCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{tokenCopied ? 'Token Copied!' : 'Copy 20-Digit Token'}</span>
                  </button>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Beneficiary:</span>
                  <span className="font-bold text-slate-900">{completedTx.billDetails?.customerPhoneOrId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Service:</span>
                  <span className="font-medium text-slate-700">{completedTx.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Reference:</span>
                  <span className="font-mono text-slate-700">{completedTx.reference}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => { setCompletedTx(null); onClose(); }}
                className="w-full py-3.5 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold text-xs shadow-md transition-all"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
