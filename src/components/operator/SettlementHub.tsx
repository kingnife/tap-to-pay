import React, { useState } from 'react';
import { 
  Building2, 
  DollarSign, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Layers, 
  ShieldCheck, 
  Sliders, 
  Download, 
  Zap,
  RefreshCw,
  Landmark,
  CreditCard,
  Sparkles
} from 'lucide-react';
import { SettlementBatch, SettlementProcessor } from '../../types';
import { taplinkApi } from '../../lib/api/taplinkApi';
import { settlementRegistry } from '../../lib/settlement/settlementProcessor';
import { useAuth } from '../../context/AuthContext';

export const SettlementHub: React.FC = () => {
  const { hasOperatorPermission } = useAuth();
  const merchant = taplinkApi.getMerchant();
  const transactions = taplinkApi.getTransactions();
  const settlements = taplinkApi.getSettlements();

  const [selectedProcessor, setSelectedProcessor] = useState<SettlementProcessor>(merchant.activeProcessor);
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastExecutedBatch, setLastExecutedBatch] = useState<SettlementBatch | null>(null);

  // Settlement Bank Config state
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [bankName, setBankName] = useState(merchant.settlementAccount.bankName);
  const [accountNumber, setAccountNumber] = useState(merchant.settlementAccount.accountNumber);
  const [accountName, setAccountName] = useState(merchant.settlementAccount.accountName);

  const processorsList = settlementRegistry.getAllProcessors();
  const currentAdapter = settlementRegistry.getAdapter(selectedProcessor);

  // Unsettled revenue calculation
  const successfulTx = transactions.filter(t => t.status === 'successful');
  const grossUnsettled = successfulTx.reduce((sum, t) => sum + t.amount, 0);
  const calculatedFee = currentAdapter.calculateFee(grossUnsettled, successfulTx.length);
  const netUnsettled = Math.max(0, grossUnsettled - calculatedFee);

  const canExecute = hasOperatorPermission('execute_settlement');

  const handleExecutePayout = async () => {
    setIsExecuting(true);
    try {
      const batch = await taplinkApi.executeSettlementBatch(selectedProcessor);
      setLastExecutedBatch(batch);
    } catch {
      alert('Settlement execution error');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    taplinkApi.updateMerchantSettings({
      settlementAccount: {
        ...merchant.settlementAccount,
        bankName,
        accountNumber,
        accountName
      }
    });
    setIsEditingBank(false);
  };

  const handleSelectProcessor = (proc: SettlementProcessor) => {
    setSelectedProcessor(proc);
    taplinkApi.updateMerchantSettings({ activeProcessor: proc });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Settlement & Automated Payouts</h3>
          <p className="text-xs text-slate-500">Multi-rail switching (NIBSS, Paystack, Flutterwave, Interswitch) and automated NUBAN disbursements</p>
        </div>

        {canExecute && (
          <button
            id="trigger-settlement-btn"
            onClick={handleExecutePayout}
            disabled={isExecuting || grossUnsettled <= 0}
            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-sm flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Zap className="w-4 h-4 text-slate-950" />
            <span>{isExecuting ? 'Initiating Clearing Rail...' : `Disburse Payout (₦${netUnsettled.toLocaleString()})`}</span>
          </button>
        )}
      </div>

      {/* Overview Cards: Pending Settlement Volume */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Gross Unsettled Volume</span>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono">₦{grossUnsettled.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500">{successfulTx.length} validated transactions</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Estimated Rail Processing Fees</span>
          <p className="text-2xl sm:text-3xl font-bold text-amber-600 font-mono">₦{calculatedFee.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500">{currentAdapter.feeStructure.payoutSla}</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Net Payout to Bank</span>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-600 font-mono">₦{netUnsettled.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500">Direct to {merchant.settlementAccount.bankName}</p>
        </div>
      </div>

      {/* Swappable Settlement Adapters Section */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div>
          <h4 className="font-bold text-slate-900 text-sm">Select Licensed Clearing Processor</h4>
          <p className="text-xs text-slate-500">Taplink integrates swappably with licensed switching infrastructure without vendor lock-in.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {processorsList.map(({ id, adapter }) => {
            const isSelected = selectedProcessor === id;
            return (
              <div
                key={id}
                onClick={() => handleSelectProcessor(id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                  isSelected
                    ? 'bg-amber-50 border-amber-400 shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">{adapter.name}</span>
                  {isSelected && (
                    <span className="text-[10px] uppercase font-bold text-slate-950 bg-amber-400 px-2 py-0.5 rounded">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">{adapter.feeStructure.description}</p>
                <div className="pt-2 border-t border-slate-200 text-[10px] font-mono text-emerald-700 font-bold">
                  <span>SLA: {adapter.feeStructure.payoutSla}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Destination Bank Account Setting */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold border border-amber-200">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Destination NUBAN Settlement Account</p>
            <p className="font-bold text-slate-900 text-sm mt-0.5">
              {merchant.settlementAccount.bankName} • <span className="font-mono text-emerald-700 font-bold">{merchant.settlementAccount.accountNumber}</span>
            </p>
            <p className="text-xs text-slate-500">{merchant.settlementAccount.accountName}</p>
          </div>
        </div>

        <button
          onClick={() => setIsEditingBank(!isEditingBank)}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
        >
          {isEditingBank ? 'Close' : 'Update Bank Account'}
        </button>
      </div>

      {/* Edit Bank Account Form */}
      {isEditingBank && (
        <form onSubmit={handleSaveBank} className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3 animate-in fade-in duration-100">
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Configure Bank Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Bank Name</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">NUBAN Account Number</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Account Holder Name</label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs cursor-pointer"
            >
              Save Bank Configuration
            </button>
          </div>
        </form>
      )}

      {/* Historical Settlement Batches */}
      <div className="space-y-3">
        <h4 className="font-bold text-slate-900 text-sm">Past Settlement Batches & Clearing Receipts</h4>
        <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Batch Number</th>
                  <th className="py-3 px-4">Settled Date</th>
                  <th className="py-3 px-4">Processor</th>
                  <th className="py-3 px-4">Transactions</th>
                  <th className="py-3 px-4">Gross Revenue</th>
                  <th className="py-3 px-4">Fee Deducted</th>
                  <th className="py-3 px-4">Net Payout</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {settlements.map((batch) => (
                  <tr key={batch.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-xs">{batch.batchNumber}</td>
                    <td className="py-3.5 px-4 text-slate-500">{new Date(batch.date).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-slate-800 font-semibold">{batch.processor}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{batch.transactionCount.toLocaleString()}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-900">₦{batch.grossAmount.toLocaleString()}</td>
                    <td className="py-3.5 px-4 font-mono text-amber-600">₦{batch.processingFee.toLocaleString()}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 text-sm">₦{batch.netPayout.toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Disbursed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
