import React, { useState } from 'react';
import { 
  CreditCard, 
  Building2, 
  PhoneCall, 
  CheckCircle2, 
  Copy, 
  Zap, 
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ConsumerProfile, TopUpRequest } from '../../types';
import { taplinkApi } from '../../lib/api/taplinkApi';
import { tapAudio } from '../../lib/audio/tapAudio';

interface TopUpModalProps {
  consumer: ConsumerProfile;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TopUpModal: React.FC<TopUpModalProps> = ({
  consumer,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [method, setMethod] = useState<'bank_transfer' | 'card' | 'ussd'>('bank_transfer');
  const [amount, setAmount] = useState<number>(2000);
  const [customAmountStr, setCustomAmountStr] = useState<string>('2000');
  const [copied, setCopied] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [completed, setCompleted] = useState<{ reference: string; amount: number } | null>(null);

  // Card form state
  const [cardNumber, setCardNumber] = useState('5399 4120 •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('911');

  if (!isOpen) return null;

  const quickAmounts = [1000, 2000, 5000, 10000];

  const handleSelectAmount = (amt: number) => {
    setAmount(amt);
    setCustomAmountStr(amt.toString());
  };

  const handleCustomAmountChange = (val: string) => {
    setCustomAmountStr(val);
    const num = parseInt(val, 10);
    if (!isNaN(num)) setAmount(num);
  };

  const handleCopyNuban = () => {
    navigator.clipboard.writeText(consumer.virtualAccount.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulatePayment = async () => {
    if (amount <= 0) {
      alert('Please specify a valid funding amount');
      return;
    }

    setIsProcessing(true);
    try {
      const topUpPayload: TopUpRequest = {
        amount,
        method,
        cardNumber: method === 'card' ? cardNumber : undefined,
        ussdBank: method === 'ussd' ? 'GTBank (*737#)' : undefined
      };

      const result = await taplinkApi.topUpWallet(consumer.id, topUpPayload);
      tapAudio.playTopUpChime();

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {
        // confetti fallback
      }

      setCompleted({
        reference: result.reference,
        amount
      });
      onSuccess();
    } catch {
      alert('Failed to process top-up');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FACC15] text-slate-950 flex items-center justify-center font-black">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg tracking-tight">Fund Taplink Balance</h3>
              <p className="text-xs text-slate-500 font-medium">Add funds via Nigerian Banking Rails</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="py-4">
          {!completed ? (
            <div className="space-y-4">
              
              {/* Method Switcher */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setMethod('bank_transfer')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    method === 'bank_transfer'
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Transfer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('card')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    method === 'card'
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('ussd')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    method === 'ussd'
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>USSD</span>
                </button>
              </div>

              {/* Amount Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select or Enter Amount (₦)
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {quickAmounts.map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleSelectAmount(amt)}
                      className={`py-2 rounded-xl text-xs font-black font-mono transition-all border ${
                        amount === amt
                          ? 'bg-[#FACC15] border-yellow-400 text-slate-950 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      ₦{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-xs">₦</span>
                  <input
                    type="number"
                    value={customAmountStr}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    placeholder="Enter custom amount"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-sm font-black focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              {/* Dynamic Method Panels */}
              {method === 'bank_transfer' && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dedicated Bank NUBAN</span>
                      <p className="font-bold text-slate-900 text-sm">{consumer.virtualAccount.bank}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyNuban}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied!' : 'Copy NUBAN'}</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200 font-mono text-center">
                    <p className="text-xl font-black text-slate-900 tracking-wider">
                      {consumer.virtualAccount.accountNumber}
                    </p>
                    <p className="text-[10px] font-sans text-slate-500 font-medium mt-0.5">
                      Account Name: {consumer.virtualAccount.accountName}
                    </p>
                  </div>

                  <p className="text-[11px] text-slate-500 font-medium">
                    ⚡ Transfer to this dedicated account from any Nigerian bank app (GTB, Kuda, Zenith, Access). Wallet balance credits in &lt; 3 seconds.
                  </p>
                </div>
              )}

              {method === 'card' && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Debit Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-slate-800"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Expiry</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">CVV</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-slate-800"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500">Secured via Interswitch 3D Secure / NIBSS Payment Gateway</p>
                </div>
              )}

              {method === 'ussd' && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dial USSD Code on Your Phone</span>
                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-center font-mono">
                    <p className="text-lg font-black text-slate-900 tracking-wider">
                      *737*2*{amount}*{consumer.virtualAccount.accountNumber}#
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-500">Works on all GSM networks without mobile internet data.</p>
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-2xl bg-[#FACC15] hover:bg-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Clearing via NIBSS Switch...</span>
                ) : (
                  <>
                    <span>Confirm & Fund ₦{amount.toLocaleString()}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </div>
          ) : (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-900">Wallet Funded Successfully!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  ₦{completed.amount.toLocaleString()} has been added to your Taplink NFC pass.
                </p>
                <p className="font-mono text-[11px] text-slate-400 mt-1">Ref: {completed.reference}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700">
                New Balance: <strong className="text-slate-900 font-mono text-sm">₦{consumer.balance.toLocaleString()}</strong>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
