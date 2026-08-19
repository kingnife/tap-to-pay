import React, { useState } from 'react';
import { 
  Radio, 
  Send,
  Zap,
  QrCode,
  CreditCard,
  PlusCircle,
  Eye,
  EyeOff,
  Copy,
  Check,
  ShieldCheck,
  SmartphoneNfc
} from 'lucide-react';
import { ConsumerProfile } from '../../types';

interface VirtualTapCardProps {
  consumer: ConsumerProfile;
  onSendClick: () => void;
  onTapClick: () => void;
  onBillClick: () => void;
  onQrClick: () => void;
  onTopUpClick: () => void;
}

export const VirtualTapCard: React.FC<VirtualTapCardProps> = ({
  consumer,
  onSendClick,
  onTapClick,
  onBillClick,
  onQrClick,
  onTopUpClick
}) => {
  const [hideBalance, setHideBalance] = useState(false);
  const [copiedNuban, setCopiedNuban] = useState(false);

  const handleCopyNuban = () => {
    navigator.clipboard.writeText(consumer.virtualAccount.accountNumber);
    setCopiedNuban(true);
    setTimeout(() => setCopiedNuban(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Bento Row: Main Wallet Hub (8 Cols) + Top-Up Tile (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Wallet Canvas (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-900 rounded-3xl p-7 text-white shadow-xl flex flex-col justify-between relative overflow-hidden min-h-[250px] border border-slate-800">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-br from-amber-400/20 via-emerald-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />

          {/* Card Top: Branding & KYC */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                <SmartphoneNfc className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Taplink Wallet</h3>
                <p className="text-xs text-slate-400 font-medium">Digital Bank & NFC Contactless Rails</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] text-emerald-400 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                KYC {consumer.kycTier.toUpperCase()}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/10 text-[10px] text-amber-300 font-mono font-bold">
                {consumer.userTag}
              </span>
            </div>
          </div>

          {/* Card Middle: Available Balance */}
          <div className="my-5 relative z-10">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs text-slate-400 font-medium">Total Available Balance</span>
              <button 
                onClick={() => setHideBalance(!hideBalance)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                {hideBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
                {hideBalance ? '₦••••••' : `₦${consumer.balance.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </span>
              <span className="text-xs text-slate-400 font-bold">NGN</span>
            </div>
          </div>

          {/* Card Bottom: Holder & Virtual NUBAN */}
          <div className="pt-4 border-t border-white/10 flex items-end justify-between text-xs relative z-10">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Account Holder</p>
              <p className="font-bold text-white text-sm mt-0.5">{consumer.fullName}</p>
            </div>

            <div className="text-right">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Dedicated NUBAN</p>
              <p className="text-xs text-slate-200 mt-0.5 font-mono font-bold">
                {consumer.virtualAccount.bank} • {consumer.virtualAccount.accountNumber}
              </p>
            </div>
          </div>

        </div>

        {/* Quick Fund Tile (4 Cols) */}
        <div className="lg:col-span-4 bg-amber-400 rounded-3xl p-6 text-slate-950 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900/80">Add Money</span>
            <div className="w-8 h-8 rounded-full bg-slate-950/10 flex items-center justify-center">
              <PlusCircle className="w-4 h-4 text-slate-950" />
            </div>
          </div>

          <div className="my-4">
            <h4 className="text-lg font-bold text-slate-950">Top-up Wallet</h4>
            <p className="text-xs font-medium text-slate-900/80 mt-1">
              Direct Interbank transfer to your dedicated NUBAN, debit card, or USSD.
            </p>
          </div>

          <button
            onClick={onTopUpClick}
            className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Fund Balance</span>
          </button>
        </div>

      </div>

      {/* 4 Core Fintech Bento Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* 1. Send Money */}
        <button
          onClick={onSendClick}
          className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Send className="w-5 h-5" />
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-bold text-slate-900">Send Money</h4>
            <p className="text-xs text-slate-500 font-medium mt-0.5">To Any Bank or @Tag</p>
          </div>
        </button>

        {/* 2. NFC Tap to Pay */}
        <button
          onClick={onTapClick}
          className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Radio className="w-5 h-5" />
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-bold text-slate-900">NFC Tap to Pay</h4>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Sub-3s Contactless POS</p>
          </div>
        </button>

        {/* 3. Pay Bills & Utilities */}
        <button
          onClick={onBillClick}
          className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5" />
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-bold text-slate-900">Pay Bills</h4>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Airtime, Power, Cable TV</p>
          </div>
        </button>

        {/* 4. QR Code Payments */}
        <button
          onClick={onQrClick}
          className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <QrCode className="w-5 h-5" />
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-bold text-slate-900">QR Payments</h4>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Scan or Show Code</p>
          </div>
        </button>

      </div>

      {/* Dedicated Bank NUBAN Strip */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Instant Inbound Transfer Account</span>
          <p className="font-bold text-slate-900 text-sm mt-0.5">
            {consumer.virtualAccount.bank} • <span className="font-mono text-indigo-600">{consumer.virtualAccount.accountNumber}</span>
          </p>
          <p className="text-xs text-slate-500 font-medium">
            Beneficiary Name: <strong className="text-slate-800">{consumer.virtualAccount.accountName}</strong>
          </p>
        </div>

        <button
          onClick={handleCopyNuban}
          className="px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-900 font-bold text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-xs"
        >
          {copiedNuban ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>Copy Account</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
