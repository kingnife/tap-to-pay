import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Bot,
  X
} from 'lucide-react';
import { DisputeReason, Transaction } from '../../types';
import { taplinkApi } from '../../lib/api/taplinkApi';

interface DisputeModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DisputeModal: React.FC<DisputeModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [reason, setReason] = useState<DisputeReason>('double_charge');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedTx, setSubmittedTx] = useState<Transaction | null>(null);

  if (!isOpen || !transaction) return null;

  const disputeReasons: { id: DisputeReason; label: string; desc: string; autoRefundEligible: boolean }[] = [
    { 
      id: 'double_charge', 
      label: 'Duplicate Charge / Debited Twice', 
      desc: 'NFC reader or checkout charged the same amount twice within 60 seconds.',
      autoRefundEligible: true
    },
    { 
      id: 'failed_tap_debited', 
      label: 'Failed Tap / Service Not Delivered', 
      desc: 'Debited from wallet balance but POS showed error or merchant did not receive value.',
      autoRefundEligible: true
    },
    { 
      id: 'wrong_amount', 
      label: 'Incorrect Charge Amount', 
      desc: 'Charged more than the agreed total for this transaction.',
      autoRefundEligible: false
    },
    { 
      id: 'terminal_hardware_error', 
      label: 'POS Terminal Hardware Error', 
      desc: 'POS validator crashed or restarted mid-authorization.',
      autoRefundEligible: true
    },
    { 
      id: 'unauthorized_charge', 
      label: 'Unrecognized / Unauthorized Transaction', 
      desc: 'I did not initiate or authorize this payment.',
      autoRefundEligible: false
    }
  ];

  const handleSubmitDispute = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updated = taplinkApi.fileDispute(transaction.id, reason, description);
      setSubmittedTx(updated);
      onSuccess();
    } catch {
      alert('Failed to submit dispute');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasExistingDispute = transaction.disputeStatus !== 'none' || !!submittedTx;
  const currentTx = submittedTx || transaction;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg tracking-tight">Report Transaction Issue</h3>
              <p className="text-xs text-slate-500 font-medium">1-Click Instant Dispute & Reversal System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-4 space-y-4">
          
          {/* Target Transaction Summary */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Transaction</span>
              <p className="font-bold text-slate-900 text-sm">{currentTx.description}</p>
              <p className="text-xs text-slate-500 font-medium">Ref: {currentTx.reference}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400">Amount</span>
              <p className="font-mono font-black text-slate-900 text-base">₦{currentTx.amount.toLocaleString()}</p>
            </div>
          </div>

          {!hasExistingDispute ? (
            <form onSubmit={handleSubmitDispute} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Select What Happened
                </label>
                <div className="space-y-2">
                  {disputeReasons.map(r => (
                    <label
                      key={r.id}
                      onClick={() => setReason(r.id)}
                      className={`block p-3 rounded-2xl border cursor-pointer transition-all ${
                        reason === r.id
                          ? 'bg-amber-50 border-amber-400 shadow-xs'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{r.label}</span>
                        {r.autoRefundEligible && (
                          <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                            Fast Auto-Reversal
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">{r.desc}</p>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Additional Details (Optional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Card was debited twice at checkout, cashier receipt showed only 1 item."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-[#FACC15] hover:bg-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-slate-950" />
                <span>{isSubmitting ? 'Correlating Transaction Telemetry...' : 'Submit Dispute Request'}</span>
              </button>

            </form>
          ) : (
            /* Dispute Status & Timeline View */
            <div className="space-y-4 pt-1">
              
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                  <Bot className="w-4 h-4 text-indigo-600" />
                  <span>Taplink Automated Dispute Engine</span>
                </div>
                <p className="text-xs text-indigo-800 font-medium mt-1">
                  Correlating transaction timestamp ({new Date(currentTx.timestamp).toLocaleTimeString()}) with NIBSS & switch log #{currentTx.processorReference}.
                </p>
              </div>

              {/* Timeline list */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Resolution Progress
                </span>
                <div className="mt-2 space-y-2 border-l-2 border-slate-200 pl-4 ml-2">
                  {currentTx.disputeTimeline?.map((ev, idx) => (
                    <div key={idx} className="relative pb-2">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#FACC15] border-2 border-white" />
                      <div className="text-xs">
                        <span className="font-bold text-slate-900">{ev.note}</span>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {new Date(ev.timestamp).toLocaleTimeString()} • {ev.actor.replace('_', ' ').toUpperCase()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {currentTx.status === 'reversed' && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>₦{currentTx.disputeRefundAmount || currentTx.amount} was credited back to your wallet balance!</span>
                </div>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Close
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
