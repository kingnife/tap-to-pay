import React, { useState } from 'react';
import { 
  Radio, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Zap,
  Store,
  CreditCard
} from 'lucide-react';
import { ConsumerProfile, Terminal, Transaction } from '../../types';
import { taplinkApi } from '../../lib/api/taplinkApi';
import { tapAudio } from '../../lib/audio/tapAudio';

interface TapModalProps {
  consumer: ConsumerProfile;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onOpenTopUp: () => void;
}

export const TapModal: React.FC<TapModalProps> = ({
  consumer,
  isOpen,
  onClose,
  onSuccess,
  onOpenTopUp
}) => {
  const terminals = taplinkApi.getTerminals();
  const [selectedTerminalId, setSelectedTerminalId] = useState<string>(terminals[0]?.id || '');
  const [customAmount, setCustomAmount] = useState<number>(2500);
  const [isTapping, setIsTapping] = useState<boolean>(false);
  const [result, setResult] = useState<{
    status: 'success' | 'queued' | 'failed';
    transaction?: Transaction;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const selectedTerminal = terminals.find(t => t.id === selectedTerminalId) || terminals[0];

  const handleExecuteTap = async () => {
    if (!selectedTerminal) return;
    setIsTapping(true);
    setResult(null);

    // Near-instant execution (sub-300ms perceived feedback)
    try {
      const response = await taplinkApi.executeTapPayment(consumer.id, selectedTerminal.id, customAmount);

      if (response.success) {
        tapAudio.playTapSuccess();
        setResult({
          status: response.transaction.offlineQueued ? 'queued' : 'success',
          transaction: response.transaction,
          message: response.message
        });
        onSuccess();
      } else {
        tapAudio.playTapFailure();
        setResult({
          status: 'failed',
          transaction: response.transaction,
          message: response.message
        });
      }
    } catch (err: unknown) {
      tapAudio.playTapFailure();
      setResult({
        status: 'failed',
        message: err instanceof Error ? err.message : 'Tap communication error'
      });
    } finally {
      setIsTapping(false);
    }
  };

  const handleReset = () => {
    setResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">NFC Tap-to-Pay</h3>
              <p className="text-xs text-slate-500 font-medium">Sub-300ms Contactless POS Payment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-4">
          {!result ? (
            <div className="space-y-4">
              {/* Terminal Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Merchant Terminal / Countertop Reader
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {terminals.map((term) => {
                    const isSelected = term.id === selectedTerminalId;
                    return (
                      <div
                        key={term.id}
                        onClick={() => setSelectedTerminalId(term.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-50 border-amber-400 text-slate-950 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Store className="w-4 h-4 text-slate-800" />
                            <span className="font-bold text-xs">{term.name}</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-slate-500">
                            {term.code}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                          <span>{term.location}</span>
                          <span className={term.status === 'offline' ? 'text-amber-700 font-bold' : 'text-emerald-600 font-bold'}>
                            {term.status === 'offline' ? 'Offline Queuing' : '4G Ready'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Amount to Pay (₦)
                </label>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-mono font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Target Reader Info Card */}
              {selectedTerminal && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1 font-mono text-slate-600">
                  <div className="flex justify-between">
                    <span>Payment Total:</span>
                    <span className="text-slate-900 font-bold font-sans">
                      ₦{customAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wallet Balance:</span>
                    <span className={consumer.balance < customAmount ? 'text-red-600 font-bold' : 'text-emerald-700 font-bold'}>
                      ₦{consumer.balance.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Interactive Tap Zone */}
              <div className="pt-2 flex flex-col items-center">
                <button
                  id="modal-confirm-tap-btn"
                  onClick={handleExecuteTap}
                  disabled={isTapping || customAmount <= 0}
                  className={`w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
                    isTapping
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-amber-400 hover:bg-amber-300 text-slate-950 active:scale-[0.98]'
                  }`}
                >
                  <Radio className={`w-4 h-4 ${isTapping ? 'animate-spin' : 'animate-pulse'}`} />
                  <span>{isTapping ? 'Authenticating NFC Token...' : `Hold to Reader (Pay ₦${customAmount.toLocaleString()})`}</span>
                </button>
                <p className="text-[11px] text-slate-400 font-medium mt-2">Simulates hardware NFC ISO/IEC 14443-A contactless exchange</p>
              </div>
            </div>
          ) : (
            /* Result State */
            <div className="py-2 space-y-4 text-center">
              {result.status === 'success' && (
                <div className="space-y-3 animate-in zoom-in-95 duration-200">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">Tap Approved</h4>
                    <p className="text-xs text-emerald-700 font-bold mt-0.5">Contactless Payment Completed</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Amount Paid:</span>
                      <span className="text-slate-900 font-bold font-sans">₦{result.transaction?.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">New Balance:</span>
                      <span className="text-emerald-700 font-bold font-sans">₦{consumer.balance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Terminal:</span>
                      <span className="text-slate-800 font-bold">{result.transaction?.terminalName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Auth Latency:</span>
                      <span className="text-emerald-700 font-bold">{result.transaction?.latencyMs}ms</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">Ref:</span>
                      <span className="text-slate-500 font-bold truncate max-w-[180px]">{result.transaction?.reference}</span>
                    </div>
                  </div>
                </div>
              )}

              {result.status === 'queued' && (
                <div className="space-y-3 animate-in zoom-in-95 duration-200">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                    <Clock className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">Queued Offline (Approved)</h4>
                    <p className="text-xs text-amber-700 font-bold mt-0.5">Local Cryptographic Authorization Granted</p>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    Terminal is offline. Transaction logged in secure local POS memory and will sync when network returns.
                  </p>
                </div>
              )}

              {result.status === 'failed' && (
                <div className="space-y-3 animate-in zoom-in-95 duration-200">
                  <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                    <XCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">Tap Declined</h4>
                    <p className="text-xs text-red-700 font-bold mt-0.5">{result.message}</p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenTopUp();
                    }}
                    className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Top-up Wallet Now
                  </button>
                </div>
              )}

              {/* Reset or Close */}
              <div className="pt-2 flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex-1 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition-colors"
                >
                  Tap Again
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
