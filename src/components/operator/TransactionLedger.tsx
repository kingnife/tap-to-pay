import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  RotateCcw, 
  AlertTriangle, 
  Eye, 
  ChevronRight, 
  ShieldAlert,
  Hash,
  Activity,
  Layers
} from 'lucide-react';
import { Transaction, TransactionStatus } from '../../types';
import { taplinkApi } from '../../lib/api/taplinkApi';

interface TransactionLedgerProps {
  onNavigateToDispute?: (txId: string) => void;
}

export const TransactionLedger: React.FC<TransactionLedgerProps> = ({ onNavigateToDispute }) => {
  const transactions = taplinkApi.getTransactions();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [inspectTx, setInspectTx] = useState<Transaction | null>(null);

  const filtered = transactions.filter(t => {
    if (statusFilter !== 'all') {
      if (statusFilter === 'queued_offline') {
        if (!t.offlineQueued || t.status !== 'pending') return false;
      } else if (t.status !== statusFilter) {
        return false;
      }
    }

    if (methodFilter !== 'all' && t.paymentMethod !== methodFilter) {
      return false;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.reference.toLowerCase().includes(q) ||
        (t.customerName && t.customerName.toLowerCase().includes(q)) ||
        (t.customerTag && t.customerTag.toLowerCase().includes(q)) ||
        (t.terminalCode && t.terminalCode.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.cryptographicTapHash && t.cryptographicTapHash.toLowerCase().includes(q))
      );
    }

    return true;
  });

  const exportCsv = () => {
    const headers = 'Reference,Timestamp,Customer,Tag,Method,Description,Amount (NGN),Status,Latency (ms),Processor Ref,Offline Queued\n';
    const rows = filtered.map(t => 
      `"${t.reference}","${t.timestamp}","${t.customerName || 'Customer'}","${t.customerTag || ''}","${t.paymentMethod}","${t.description}",${t.amount},"${t.status}",${t.latencyMs},"${t.processorReference}",${t.offlineQueued}`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taplink-ledger-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusPill = (status: TransactionStatus, queued: boolean) => {
    if (queued && status === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600" />
          Queued Offline
        </span>
      );
    }

    switch (status) {
      case 'successful':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Successful
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            Failed
          </span>
        );
      case 'reversed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <RotateCcw className="w-3 h-3 text-indigo-600" />
            Refunded
          </span>
        );
      case 'disputed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Disputed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3 h-3 text-slate-500" />
            Processing
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Unified Transaction Ledger</h3>
          <p className="text-xs text-slate-500">Real-time cryptographic audit trail of all NFC tap payments, transfers, bills, and QR checkouts</p>
        </div>

        <button
          onClick={exportCsv}
          className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors border border-slate-200 shadow-xs cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV Ledger</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All Transactions' },
            { id: 'successful', label: 'Successful' },
            { id: 'queued_offline', label: 'Queued Offline' },
            { id: 'disputed', label: 'Disputed' },
            { id: 'reversed', label: 'Reversed / Refunded' },
            { id: 'failed', label: 'Declined' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === f.id
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ref, customer, till, hash..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Reference & Time</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Channel / Station</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Latency</th>
                <th className="py-3 px-4 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                    No transactions match current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr 
                    key={tx.id} 
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono">
                      <p className="font-bold text-slate-900 text-xs">#{tx.reference}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(tx.timestamp).toLocaleTimeString()} ({new Date(tx.timestamp).toLocaleDateString()})
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800">{tx.customerName || 'Customer'}</p>
                      <p className="font-mono text-[10px] text-slate-500">{tx.customerTag || 'NFC Card'}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-700">{tx.description}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{tx.terminalCode || tx.paymentMethod.toUpperCase()}</p>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <span className={`font-bold text-sm ${
                        tx.status === 'reversed' ? 'text-indigo-600 line-through' : (tx.status === 'failed' ? 'text-slate-400' : 'text-slate-900')
                      }`}>
                        ₦{tx.amount.toLocaleString()}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusPill(tx.status, tx.offlineQueued)}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-emerald-700 font-bold">
                      {tx.latencyMs} ms
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setInspectTx(tx)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        title="Inspect Cryptographic Signature & Audit Trail"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Cryptographic Inspect Modal */}
      {inspectTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-base">Cryptographic Transaction Audit</h3>
              </div>
              <button 
                onClick={() => setInspectTx(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Transaction ID:</span>
                  <span className="text-slate-800">{inspectTx.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Reference:</span>
                  <span className="text-slate-900 font-bold">{inspectTx.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Timestamp:</span>
                  <span className="text-slate-700">{inspectTx.timestamp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Amount:</span>
                  <span className="text-slate-900 font-bold font-sans">₦{inspectTx.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Processor Reference:</span>
                  <span className="text-emerald-700 font-bold">{inspectTx.processorReference}</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 font-sans">Raw Cryptographic Proof / Signature</p>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-800 break-all select-all font-mono">
                  {inspectTx.cryptographicTapHash}
                </div>
              </div>

              {inspectTx.disputeTimeline && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <p className="text-[10px] uppercase font-bold text-slate-400 font-sans">Dispute Status</p>
                  <p className="text-xs text-amber-800 font-sans font-medium">{inspectTx.disputeDescription}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setInspectTx(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white cursor-pointer"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
