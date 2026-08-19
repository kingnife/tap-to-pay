import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Send, 
  Building2, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Search,
  Lock
} from 'lucide-react';
import { taplinkApi, NIGERIAN_BANKS, NigerianBank } from '../../lib/api/taplinkApi';
import { useAuth } from '../../context/AuthContext';
import { tapAudio } from '../../lib/audio/tapAudio';
import { Transaction } from '../../types';

interface SendMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (tx: Transaction) => void;
}

export const SendMoneyModal: React.FC<SendMoneyModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { consumer } = useAuth();
  const [recipientType, setRecipientType] = useState<'taplink_user' | 'bank_account'>('taplink_user');
  
  // Taplink User state
  const [taplinkTag, setTaplinkTag] = useState('');
  
  // Bank Account state
  const [selectedBank, setSelectedBank] = useState<NigerianBank>(NIGERIAN_BANKS[0]);
  const [accountNumber, setAccountNumber] = useState('');
  const [resolvedAccountName, setResolvedAccountName] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  
  // Amount & Narration
  const [amount, setAmount] = useState<string>('');
  const [narration, setNarration] = useState('');
  
  // PIN & Flow State
  const [step, setStep] = useState<'details' | 'confirm' | 'pin' | 'success'>('details');
  const [pin, setPin] = useState(['', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);

  if (!isOpen) return null;

  const handleAccountNumberChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 10);
    setAccountNumber(clean);
    setResolvedAccountName(null);
    setError(null);

    if (clean.length === 10) {
      setIsResolving(true);
      setTimeout(() => {
        const result = taplinkApi.resolveBankAccount(selectedBank.code, clean);
        if (result.valid) {
          setResolvedAccountName(result.accountName);
        } else {
          setError('Could not resolve account name. Please verify bank and 10-digit NUBAN.');
        }
        setIsResolving(false);
      }, 350);
    }
  };

  const handleQuickAmount = (val: number) => {
    setAmount(val.toString());
  };

  const handleProceedToConfirm = () => {
    setError(null);
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 100) {
      setError('Minimum transfer amount is ₦100');
      return;
    }
    if (numAmount > consumer.balance) {
      setError(`Insufficient balance. Current balance is ₦${consumer.balance.toLocaleString()}`);
      return;
    }
    if (numAmount > consumer.dailyTransferLimit) {
      setError(`Amount exceeds your KYC ${consumer.kycTier.toUpperCase()} daily limit of ₦${consumer.dailyTransferLimit.toLocaleString()}`);
      return;
    }

    if (recipientType === 'taplink_user') {
      if (!taplinkTag.trim()) {
        setError('Please enter a Taplink user tag or phone number');
        return;
      }
    } else {
      if (accountNumber.length !== 10) {
        setError('Please enter a valid 10-digit NUBAN account number');
        return;
      }
      if (!resolvedAccountName) {
        setError('Please wait for account name verification');
        return;
      }
    }

    setStep('confirm');
  };

  const handlePinChange = (idx: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const nextPin = [...pin];
    nextPin[idx] = val;
    setPin(nextPin);

    if (val && idx < 3) {
      const nextInput = document.getElementById(`pin-${idx + 1}`);
      nextInput?.focus();
    }
  };

  const handleExecuteTransfer = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const numAmount = parseFloat(amount);
      const res = await taplinkApi.sendMoney({
        amount: numAmount,
        recipientType,
        taplinkTagOrPhone: recipientType === 'taplink_user' ? (taplinkTag.startsWith('@') ? taplinkTag : `@${taplinkTag}`) : undefined,
        bankName: selectedBank.name,
        bankCode: selectedBank.code,
        accountNumber,
        accountName: resolvedAccountName || 'Beneficiary',
        narration: narration.trim() || undefined,
        pin: pin.join('')
      });

      tapAudio.playSuccess();
      setCompletedTx(res.transaction);
      setStep('success');
      onSuccess(res.transaction);
    } catch (err: any) {
      tapAudio.playError();
      setError(err?.message || 'Transfer failed. Please try again.');
      setStep('confirm');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBanks = NIGERIAN_BANKS.filter(b => 
    b.name.toLowerCase().includes(bankSearch.toLowerCase())
  );

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
              <Send className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Send Money</h2>
              <p className="text-xs text-slate-500 font-medium">Instant Interbank NIP & Taplink P2P Transfers</p>
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

          {step === 'details' && (
            <div className="space-y-4">
              {/* Recipient Type Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => { setRecipientType('taplink_user'); setError(null); }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    recipientType === 'taplink_user'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <User className="w-4 h-4 text-amber-600" />
                  To Taplink User (Free)
                </button>
                <button
                  type="button"
                  onClick={() => { setRecipientType('bank_account'); setError(null); }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    recipientType === 'bank_account'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  To Other Bank (NIP)
                </button>
              </div>

              {/* Taplink User Input */}
              {recipientType === 'taplink_user' ? (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Recipient @Tag or Phone
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={taplinkTag}
                      onChange={(e) => setTaplinkTag(e.target.value)}
                      placeholder="@chioma_o or 08034918820"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">Instant zero-fee transfer between Taplink wallets</p>
                </div>
              ) : (
                /* Bank Account Inputs */
                <div className="space-y-3">
                  {/* Select Bank */}
                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Select Destination Bank
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowBankDropdown(!showBankDropdown)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-left text-sm font-semibold text-slate-900 flex items-center justify-between hover:border-slate-300"
                    >
                      <span className="truncate">{selectedBank.name}</span>
                      <Building2 className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                    </button>

                    {showBankDropdown && (
                      <div className="absolute left-0 right-0 top-full mt-2 z-20 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 max-h-56 overflow-y-auto">
                        <div className="relative mb-2">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                          <input
                            type="text"
                            value={bankSearch}
                            onChange={(e) => setBankSearch(e.target.value)}
                            placeholder="Search 15+ Nigerian banks..."
                            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-400"
                          />
                        </div>
                        {filteredBanks.map(b => (
                          <button
                            key={b.code}
                            type="button"
                            onClick={() => {
                              setSelectedBank(b);
                              setShowBankDropdown(false);
                              if (accountNumber.length === 10) handleAccountNumberChange(accountNumber);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium hover:bg-slate-100 flex items-center justify-between ${
                              selectedBank.code === b.code ? 'bg-amber-50 text-amber-900 font-bold' : 'text-slate-700'
                            }`}
                          >
                            <span>{b.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{b.code}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Account Number */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      10-Digit NUBAN Account Number
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => handleAccountNumberChange(e.target.value)}
                      placeholder="0123456789"
                      maxLength={10}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold tracking-wider font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />

                    {isResolving && (
                      <p className="text-xs text-amber-600 font-medium animate-pulse">Resolving beneficiary NIBSS name...</p>
                    )}

                    {resolvedAccountName && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-xs font-bold text-emerald-900 truncate uppercase">{resolvedAccountName}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Amount */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Amount (₦)
                  </label>
                  <span className="text-xs font-medium text-slate-500">
                    Wallet: <strong className="text-slate-900 font-bold">₦{consumer.balance.toLocaleString()}</strong>
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-lg font-bold text-slate-400">₦</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-9 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                {/* Quick amount chips */}
                <div className="flex gap-2 pt-1">
                  {[1000, 2500, 5000, 10000, 20000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleQuickAmount(val)}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                    >
                      +₦{val.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Narration */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Narration / Note (Optional)
                </label>
                <input
                  type="text"
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                  placeholder="e.g. Dinner, Project settlement"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <button
                type="button"
                onClick={handleProceedToConfirm}
                className="w-full mt-3 py-3.5 px-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                <p className="text-xs text-amber-800 font-semibold mb-1">Transfer Summary</p>
                <p className="text-2xl font-black text-slate-900 font-mono">₦{parseFloat(amount).toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">Transaction Fee: ₦0.00 (Zero Fee Promotion)</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Recipient</span>
                  <span className="font-bold text-slate-900">
                    {recipientType === 'taplink_user' ? taplinkTag : resolvedAccountName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Destination</span>
                  <span className="font-bold text-slate-900">
                    {recipientType === 'taplink_user' ? 'Taplink Wallet' : `${selectedBank.name} (${accountNumber})`}
                  </span>
                </div>
                {narration && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Note</span>
                    <span className="font-bold text-slate-900">{narration}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-200 pt-2">
                  <span className="text-slate-500 font-medium">Source Account</span>
                  <span className="font-bold text-slate-900">Taplink Wallet (₦{consumer.balance.toLocaleString()})</span>
                </div>
              </div>

              {/* 4-digit PIN */}
              <div className="space-y-2 text-center">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  Enter 4-Digit Security PIN
                </label>
                <div className="flex justify-center gap-3">
                  {[0, 1, 2, 3].map(idx => (
                    <input
                      key={idx}
                      id={`pin-${idx}`}
                      type="password"
                      maxLength={1}
                      value={pin[idx]}
                      onChange={(e) => handlePinChange(idx, e.target.value)}
                      className="w-12 h-12 text-center text-xl font-bold rounded-2xl border-2 border-slate-200 focus:border-amber-500 focus:outline-none bg-white font-mono"
                    />
                  ))}
                </div>
                <p className="text-[11px] text-slate-400">Default test PIN: Any 4 digits (e.g. 1234)</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="w-1/3 py-3 px-4 rounded-2xl border border-slate-200 font-bold text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={isSubmitting || pin.some(p => !p)}
                  onClick={handleExecuteTransfer}
                  className="w-2/3 py-3 px-4 bg-slate-900 hover:bg-black disabled:bg-slate-300 text-white rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Routing Transfer...
                    </span>
                  ) : (
                    <span>Confirm & Send ₦{parseFloat(amount || '0').toLocaleString()}</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'success' && completedTx && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Transfer Successful</h3>
                <p className="text-2xl font-black text-slate-900 font-mono mt-1">₦{completedTx.amount.toLocaleString()}</p>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Dispatched to {completedTx.destinationBank?.accountName || completedTx.customerName} via NIP Switch
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Reference:</span>
                  <span className="font-mono font-bold text-slate-900">{completedTx.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Session ID:</span>
                  <span className="font-mono text-slate-700">{completedTx.processorReference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Timestamp:</span>
                  <span className="text-slate-700">{new Date(completedTx.timestamp).toLocaleString()}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold text-xs shadow-md transition-all"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
