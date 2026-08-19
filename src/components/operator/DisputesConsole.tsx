import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Bot, 
  RotateCcw,
  MessageSquare
} from 'lucide-react';
import { Transaction } from '../../types';
import { taplinkApi } from '../../lib/api/taplinkApi';
import { useAuth } from '../../context/AuthContext';

export const DisputesConsole: React.FC = () => {
  const { hasOperatorPermission } = useAuth();
  const transactions = taplinkApi.getTransactions();

  const [activeTab, setActiveTab] = useState<'pending' | 'resolved' | 'all'>('pending');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [resolutionNote, setResolutionNote] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const disputeTransactions = transactions.filter(t => t.disputeStatus !== 'none' || t.status === 'disputed' || t.status === 'reversed');

  const filtered = disputeTransactions.filter(t => {
    if (activeTab === 'pending') return t.disputeStatus === 'under_review' || t.status === 'disputed';
    if (activeTab === 'resolved') return t.disputeStatus === 'approved_refunded' || t.status === 'reversed' || t.disputeStatus === 'rejected';
    return true;
  });

  const canApprove = hasOperatorPermission('approve_refunds');

  const handleResolve = async (decision: 'approved_refunded' | 'rejected') => {
    if (!selectedTx) return;
    setIsProcessing(true);

    try {
      taplinkApi.resolveDispute(
        selectedTx.id,
        decision,
        resolutionNote || (decision === 'approved_refunded' ? 'Approved after POS transaction audit.' : 'Declined: Valid single payment authorization.'),
        selectedTx.amount
      );
      setSelectedTx(null);
      setResolutionNote('');
    } catch {
      alert('Failed to resolve dispute.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-slate-900">Dispute & Reversal Resolution Console</h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              Trust & Transparency
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Audit duplicate NFC charges, failed tap debits, and customer transfer claims with 1-click reversals.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'pending'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending ({disputeTransactions.filter(t => t.disputeStatus === 'under_review' || t.status === 'disputed').length})
          </button>
          <button
            onClick={() => setActiveTab('resolved')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'resolved'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Resolved & Refunded
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Cases
          </button>
        </div>
      </div>

      {/* Disputes Grid / List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Disputes List */}
        <div className="lg:col-span-7 space-y-3">
          {filtered.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-slate-900">Dispute Queue Clean</p>
              <p className="text-xs text-slate-500">No open dispute cases waiting for review.</p>
            </div>
          ) : (
            filtered.map(tx => {
              const isSelected = selectedTx?.id === tx.id;
              const isApproved = tx.disputeStatus === 'approved_refunded' || tx.status === 'reversed';
              const isRejected = tx.disputeStatus === 'rejected';

              return (
                <div
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className={`p-4 rounded-3xl border cursor-pointer transition-all space-y-3 ${
                    isSelected
                      ? 'bg-amber-50/60 border-amber-400 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-700">{tx.reference}</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {tx.disputeReason ? tx.disputeReason.replace(/_/g, ' ') : 'FAILED CHARGE'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900">₦{tx.amount.toLocaleString()}</span>
                      {isApproved ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                          Refunded
                        </span>
                      ) : isRejected ? (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200">
                          Rejected
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 animate-pulse">
                          Pending Action
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-800 font-medium">"{tx.disputeDescription || 'Customer reported transaction error'}"</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {tx.customerName || 'Customer'} • {tx.customerTag} • <span className="font-mono">{tx.terminalCode || tx.paymentMethod.toUpperCase()}</span>
                    </p>
                  </div>

                  {/* AI Bot Audit correlation highlight */}
                  {tx.disputeReason === 'double_charge' && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                      <Bot className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-[11px] font-medium">
                        AI Terminal Audit: Twin authorization detected on {tx.terminalCode || 'POS'} within seconds. 1-click reversal recommended.
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Active Resolution Panel */}
        <div className="lg:col-span-5">
          {selectedTx ? (
            <div className="p-5 rounded-3xl bg-white border border-slate-200 space-y-4 sticky top-24 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-500" />
                  <h4 className="font-bold text-slate-900 text-sm">Dispute Case #{selectedTx.reference}</h4>
                </div>
                <button 
                  onClick={() => setSelectedTx(null)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Case Details */}
              <div className="space-y-2 text-xs font-mono">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Customer:</span>
                    <span className="text-slate-900 font-sans font-bold">{selectedTx.customerName || 'Customer'} ({selectedTx.customerTag})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Method:</span>
                    <span className="text-slate-700 uppercase font-bold">{selectedTx.paymentMethod.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Terminal / Node:</span>
                    <span className="text-slate-700">{selectedTx.terminalCode || 'Core Network API'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Disputed Amount:</span>
                    <span className="text-emerald-700 font-bold font-sans text-sm">₦{selectedTx.amount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Dispute Timeline */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <p className="text-[10px] uppercase font-bold text-slate-400 font-sans">Audit Timeline</p>
                  {selectedTx.disputeTimeline?.map((ev, idx) => (
                    <div key={idx} className="text-[11px] pb-1 border-b border-slate-200 last:border-0 font-sans">
                      <p className="text-slate-800 font-medium">{ev.note}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {new Date(ev.timestamp).toLocaleTimeString()} • {ev.actor}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Operator Decision Actions (If still under review) */}
              {(selectedTx.disputeStatus === 'under_review' || selectedTx.status === 'disputed') && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Staff Resolution Note
                    </label>
                    <textarea
                      rows={2}
                      value={resolutionNote}
                      onChange={(e) => setResolutionNote(e.target.value)}
                      placeholder="e.g. Verified duplicate tap. Reversal processed back to wallet."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {canApprove ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResolve('rejected')}
                        disabled={isProcessing}
                        className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Decline
                      </button>
                      <button
                        id="approve-refund-btn"
                        onClick={() => handleResolve('approved_refunded')}
                        disabled={isProcessing}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Refund ₦{selectedTx.amount.toLocaleString()}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
                      Your current role does not have permission to approve refunds. Switch to Finance Officer or Owner in header.
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-2 text-slate-400">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-medium">Select any dispute case to inspect telemetry and issue instant reversal.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
