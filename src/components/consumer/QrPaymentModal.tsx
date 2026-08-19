import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  QrCode, 
  Scan, 
  CheckCircle2, 
  AlertCircle, 
  Store, 
  ArrowRight,
  ShieldCheck,
  Copy,
  Check
} from 'lucide-react';
import { taplinkApi } from '../../lib/api/taplinkApi';
import { useAuth } from '../../context/AuthContext';
import { tapAudio } from '../../lib/audio/tapAudio';
import { Transaction } from '../../types';

interface QrPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (tx: Transaction) => void;
}

export const QrPaymentModal: React.FC<QrPaymentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { consumer } = useAuth();
  const merchant = taplinkApi.getMerchant();
  
  const [activeTab, setActiveTab] = useState<'scan' | 'my_qr'>('scan');
  const [amount, setAmount] = useState('2500');
  const [merchantNote, setMerchantNote] = useState('Storefront Checkout');
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleSimulateScan = () => {
    setIsScanning(true);
    setError(null);
    setTimeout(() => {
      setIsScanning(false);
    }, 800);
  };

  const handleConfirmPay = async () => {
    setError(null);
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }
    if (numAmount > consumer.balance) {
      setError(`Insufficient balance. Available: ₦${consumer.balance.toLocaleString()}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await taplinkApi.payWithQrCode(merchant.id, numAmount, merchantNote);
      tapAudio.playSuccess();
      setCompletedTx(res.transaction);
      onSuccess(res.transaction);
    } catch (err: any) {
      tapAudio.playError();
      setError(err?.message || 'QR Payment failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const myQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=taplink://pay/${consumer.userTag}`;

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
              <QrCode className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">QR Code Payments</h2>
              <p className="text-xs text-slate-500 font-medium">Scan Merchant QR or Show Personal Receive Code</p>
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

          {/* Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => { setActiveTab('scan'); setError(null); }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'scan'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Scan className="w-4 h-4 text-amber-600" />
              Scan Merchant QR
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('my_qr'); setError(null); }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'my_qr'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <QrCode className="w-4 h-4 text-indigo-600" />
              My Receive QR
            </button>
          </div>

          {activeTab === 'scan' ? (
            !completedTx ? (
              <div className="space-y-4">
                {/* Camera / Scanner Frame Simulation */}
                <div className="relative rounded-3xl bg-slate-900 p-6 flex flex-col items-center justify-center overflow-hidden min-h-[220px]">
                  <div className="absolute inset-4 border-2 border-dashed border-amber-400/60 rounded-2xl pointer-events-none" />
                  
                  {isScanning ? (
                    <div className="space-y-3 text-center z-10">
                      <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-xs text-amber-300 font-bold animate-pulse">Scanning QR Target...</p>
                    </div>
                  ) : (
                    <div className="text-center z-10 space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center mx-auto">
                        <Store className="w-6 h-6 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{merchant.tradingName}</p>
                        <p className="text-xs text-slate-400">{merchant.category} • Lekki Phase 1</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleSimulateScan}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-400 text-slate-900 text-xs font-bold hover:bg-amber-300 transition-colors shadow-xs"
                      >
                        Re-Scan QR Target
                      </button>
                    </div>
                  )}
                </div>

                {/* Amount to Pay */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Amount to Pay (₦)
                    </label>
                    <span className="text-xs text-slate-500 font-medium">
                      Balance: <strong className="text-slate-900">₦{consumer.balance.toLocaleString()}</strong>
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
                </div>

                {/* Note */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Note / Cart Summary
                  </label>
                  <input
                    type="text"
                    value={merchantNote}
                    onChange={(e) => setMerchantNote(e.target.value)}
                    placeholder="e.g. Counter Espresso, Groceries"
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmPay}
                  className="w-full py-3.5 px-4 bg-slate-900 hover:bg-black disabled:bg-slate-300 text-white rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Authorizing Payment...
                    </span>
                  ) : (
                    <span>Pay ₦{parseFloat(amount || '0').toLocaleString()} via QR</span>
                  )}
                </button>
              </div>
            ) : (
              /* Success view */
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">QR Payment Confirmed</h3>
                  <p className="text-2xl font-black text-slate-900 font-mono mt-1">₦{completedTx.amount.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Paid to {completedTx.merchantName || 'Merchant Store'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Reference:</span>
                    <span className="font-mono font-bold text-slate-900">{completedTx.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Auth Code:</span>
                    <span className="font-mono text-slate-700">{completedTx.processorReference}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => { setCompletedTx(null); onClose(); }}
                  className="w-full py-3.5 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold text-xs shadow-md transition-all"
                >
                  Done
                </button>
              </div>
            )
          ) : (
            /* My Receive QR Tab */
            <div className="text-center space-y-4 py-2">
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-3xl inline-block shadow-xs">
                <img 
                  src={myQrUrl} 
                  alt="Personal Receive QR Code"
                  className="w-48 h-48 rounded-xl mx-auto"
                />
              </div>

              <div>
                <p className="text-base font-bold text-slate-900">{consumer.fullName}</p>
                <p className="text-sm font-mono font-bold text-amber-600">{consumer.userTag}</p>
                <p className="text-xs text-slate-500 mt-1">Anyone with Taplink or a camera app can scan to pay your wallet directly.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-left text-xs space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">Virtual Bank Account:</span>
                  <span className="font-bold text-slate-900">{consumer.virtualAccount.bank}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">NUBAN Number:</span>
                  <span className="font-mono font-bold text-slate-900">{consumer.virtualAccount.accountNumber}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
