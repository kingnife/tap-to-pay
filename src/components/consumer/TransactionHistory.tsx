import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  RotateCcw, 
  AlertTriangle, 
  Radio, 
  Send,
  Zap,
  QrCode,
  CreditCard,
  ChevronDown, 
  ChevronUp, 
  ShieldAlert, 
  Search,
  Receipt,
  Download,
  Copy,
  Check
} from 'lucide-react';
import { Transaction, TransactionStatus, PaymentMethod } from '../../types';

interface TransactionHistoryProps {
  transactions: Transaction[];
  onOpenDispute: (tx: Transaction) => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  onOpenDispute
}) => {
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  const filtered = transactions.filter(t => {
    if (filterMethod !== 'all' && t.paymentMethod !== filterMethod) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.description.toLowerCase().includes(q) ||
        t.reference.toLowerCase().includes(q) ||
        (t.merchantName && t.merchantName.toLowerCase().includes(q)) ||
        (t.customerName && t.customerName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCopyRef = (ref: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ref);
    setCopiedRef(ref);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  const getMethodIcon = (method?: PaymentMethod) => {
    switch (method) {
      case 'nfc_tap':
        return <Radio className="w-5 h-5 text-amber-600" />;
      case 'transfer':
        return <Send className="w-5 h-5 text-indigo-600" />;
      case 'bill_payment':
        return <Zap className="w-5 h-5 text-emerald-600" />;
      case 'qr_code':
        return <QrCode className="w-5 h-5 text-purple-600" />;
      case 'card':
        return <CreditCard className="w-5 h-5 text-sky-600" />;
      default:
        return <Receipt className="w-5 h-5 text-slate-600" />;
    }
  };

  const getMethodBg = (method?: PaymentMethod) => {
    switch (method) {
      case 'nfc_tap': return 'bg-amber-100/80';
      case 'transfer': return 'bg-indigo-100/80';
      case 'bill_payment': return 'bg-emerald-100/80';
      case 'qr_code': return 'bg-purple-100/80';
      case 'card': return 'bg-sky-100/80';
      default: return 'bg-slate-100';
    }
  };

  const getStatusBadge = (status: TransactionStatus, offlineQueued: boolean) => {
    if (offlineQueued && status === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
          <Clock className="w-3 h-3 text-amber-600" />
          Queued Offline
        </span>
      );
    }

    switch (status) {
      case 'successful':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Successful
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 text-red-600" />
            Failed
          </span>
        );
      case 'reversed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800">
            <RotateCcw className="w-3 h-3 text-indigo-600" />
            Refunded
          </span>
        );
      case 'disputed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Disputed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
            <Clock className="w-3 h-3 text-slate-500" />
            Processing
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
      
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-lg">Transaction Activity</h3>
          <p className="text-xs text-slate-500 font-medium">Real-time ledger of transfers, bills, QR & NFC taps</p>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reference, recipient, note..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900"
          />
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: 'All Transactions' },
          { id: 'nfc_tap', label: 'NFC Contactless' },
          { id: 'transfer', label: 'Bank Transfers' },
          { id: 'bill_payment', label: 'Bills & Airtime' },
          { id: 'qr_code', label: 'QR Payments' }
        ].map(pill => (
          <button
            key={pill.id}
            onClick={() => setFilterMethod(pill.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              filterMethod === pill.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3 pt-1">
        {filtered.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-2">
            <Receipt className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-800">No transactions found</p>
            <p className="text-xs text-slate-500 font-medium">Use any quick action above to initiate a payment or transfer.</p>
          </div>
        ) : (
          filtered.map(tx => {
            const isExpanded = expandedTxId === tx.id;
            const isNegative = tx.type === 'debit';

            return (
              <div
                key={tx.id}
                className="rounded-2xl border border-slate-200 hover:border-slate-300 transition-all overflow-hidden bg-white shadow-xs"
              >
                {/* Summary Row */}
                <div 
                  onClick={() => setExpandedTxId(isExpanded ? null : tx.id)}
                  className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${getMethodBg(tx.paymentMethod)}`}>
                      {getMethodIcon(tx.paymentMethod)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{tx.description}</span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {new Date(tx.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • <span className="font-mono text-slate-400 uppercase text-[11px]">{(tx.paymentMethod || 'nfc_tap').replace('_', ' ')}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className={`font-mono font-bold text-sm sm:text-base ${
                        tx.status === 'reversed' 
                          ? 'text-indigo-600 line-through' 
                          : tx.status === 'failed' 
                          ? 'text-slate-400 line-through' 
                          : isNegative 
                          ? 'text-slate-900' 
                          : 'text-emerald-600'
                      }`}>
                        {isNegative ? '-' : '+'}₦{tx.amount.toLocaleString()}
                      </span>
                      <div className="mt-1">
                        {getStatusBadge(tx.status, tx.offlineQueued)}
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-3 border-t border-slate-100 bg-slate-50/70 space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                        <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">Processor Ref</span>
                        <p className="font-bold text-slate-800 text-xs mt-0.5 truncate">{tx.processorReference}</p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                        <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">Execution Latency</span>
                        <p className="font-bold text-indigo-600 text-xs mt-0.5">{tx.latencyMs} ms</p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                        <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">Payment Method</span>
                        <p className="font-bold text-slate-800 text-xs mt-0.5 uppercase">{(tx.paymentMethod || 'nfc_tap').replace('_', ' ')}</p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                        <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">Fee</span>
                        <p className="font-bold text-emerald-600 text-xs mt-0.5">₦0.00</p>
                      </div>
                    </div>

                    {tx.destinationBank && (
                      <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Beneficiary Account:</span>
                        <span className="font-bold text-slate-900">
                          {tx.destinationBank.accountName} • {tx.destinationBank.bankName} ({tx.destinationBank.accountNumber})
                        </span>
                      </div>
                    )}

                    {tx.billDetails && (
                      <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Biller Provider:</span>
                          <span className="font-bold text-slate-900">{tx.billDetails.provider}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Beneficiary No:</span>
                          <span className="font-mono font-bold text-slate-900">{tx.billDetails.customerPhoneOrId}</span>
                        </div>
                        {tx.billDetails.token && (
                          <div className="flex justify-between font-mono bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                            <span className="text-amber-800 font-bold">Meter Token:</span>
                            <span className="font-black text-slate-900">{tx.billDetails.token}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Dispute Action */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold text-slate-400">Ref: {tx.reference}</span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyRef(tx.reference, e)}
                          className="text-slate-400 hover:text-slate-700 transition-colors"
                          title="Copy reference"
                        >
                          {copiedRef === tx.reference ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      
                      {tx.status === 'disputed' || tx.disputeStatus === 'under_review' ? (
                        <button
                          onClick={() => onOpenDispute(tx)}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                          <span>Track Dispute Progress</span>
                        </button>
                      ) : tx.status === 'reversed' ? (
                        <span className="text-xs text-indigo-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Refund Complete (₦{tx.disputeRefundAmount || tx.amount})
                        </span>
                      ) : (
                        <button
                          id={`dispute-tx-btn-${tx.id}`}
                          onClick={() => onOpenDispute(tx)}
                          className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Report Issue</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
