import React from 'react';
import { 
  Radio, 
  Wifi, 
  WifiOff, 
  Clock, 
  TrendingUp, 
  Store, 
  CheckCircle2, 
  ArrowRight, 
  ShieldAlert, 
  Layers, 
  Activity,
  Zap,
  DollarSign
} from 'lucide-react';
import { taplinkApi } from '../../lib/api/taplinkApi';
import { useAuth } from '../../context/AuthContext';

interface OperatorOverviewProps {
  onNavigateTab: (tab: 'terminals' | 'transactions' | 'disputes' | 'settlements' | 'team') => void;
}

export const OperatorOverview: React.FC<OperatorOverviewProps> = ({ onNavigateTab }) => {
  const transactions = taplinkApi.getTransactions();
  const terminals = taplinkApi.getTerminals();
  const merchant = taplinkApi.getMerchant();
  const { isNetworkOffline } = useAuth();

  const successfulTx = transactions.filter(t => t.status === 'successful');
  const todayRevenue = successfulTx.reduce((sum, t) => sum + t.amount, 0);
  const totalTapsToday = successfulTx.length;

  const onlineTerminals = terminals.filter(t => t.status === 'online' && !isNetworkOffline).length;
  const queuedOfflineCount = transactions.filter(t => t.offlineQueued && t.status === 'pending').length;
  const pendingDisputesCount = transactions.filter(t => t.disputeStatus === 'under_review' || t.status === 'disputed').length;

  const avgLatency = (
    successfulTx.reduce((sum, t) => sum + t.latencyMs, 0) / (successfulTx.length || 1)
  ).toFixed(0);

  // Settlement estimate
  const nextSettlementGross = todayRevenue > 0 ? todayRevenue + 940000 : 940394;

  return (
    <div className="space-y-6">
      
      {/* 12-Column Bento Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Bento Tile 1: Terminal Fleet Overview (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Merchant Terminals & Stations</h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  Live telemetry monitoring for Smart POS, Countertop NFC, and SoftPOS endpoints
                </p>
              </div>
              <button 
                onClick={() => onNavigateTab('terminals')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl uppercase tracking-wider transition-colors shadow-sm self-start cursor-pointer"
              >
                Provision Terminal
              </button>
            </div>

            {/* Sub-grid of 3 terminal cards with gauges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Card 1: Lekki Checkout 1 */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Till 1 — Smart POS</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">
                    184 <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full ml-1">Online</span>
                  </h3>
                </div>
                <div className="space-y-1">
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[98%]" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium text-right">Battery: 92% • 4G</p>
                </div>
              </div>

              {/* Card 2: Bakery Counter */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bakery NFC Pad</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">
                    98 <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full ml-1">Online</span>
                  </h3>
                </div>
                <div className="space-y-1">
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[100%]" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium text-right">WiFi • 100% Power</p>
                </div>
              </div>

              {/* Card 3: Mobile SoftPOS */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Floor SoftPOS</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">
                    45 <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full ml-1">Roaming</span>
                  </h3>
                </div>
                <div className="space-y-1">
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full w-[64%]" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium text-right">Battery: 64% • 4G</p>
                </div>
              </div>

            </div>
          </div>

          {/* Bottom stats row of Tile 1 */}
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-8">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Avg. Tap Latency</p>
                <p className="text-lg font-bold text-slate-900">{avgLatency}ms</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Volume Today</p>
                <p className="text-lg font-bold text-emerald-600">₦{todayRevenue.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg uppercase tracking-wider border border-slate-200/60">
                Terminals Active: {onlineTerminals} / {terminals.length}
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg uppercase tracking-wider border border-slate-200/60">
                Sync Frequency: Real-Time
              </span>
            </div>
          </div>
        </div>

        {/* Right Bento Column: 4 Cols Stack */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Bento Tile 2: Next Settlement (Vibrant Yellow Card) */}
          <div 
            onClick={() => onNavigateTab('settlements')}
            className="bg-amber-400 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col justify-between cursor-pointer hover:bg-amber-300 transition-colors flex-1 min-h-[220px]"
          >
            <div>
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-950">Next Settlement Payout</h2>
                <span className="text-xs font-bold uppercase bg-white/50 text-slate-950 px-2.5 py-1 rounded-lg border border-slate-900/10">
                  {merchant.settlementAccount.settlementFrequency.toUpperCase()}
                </span>
              </div>
              <p className="text-slate-900/70 text-xs sm:text-sm font-semibold mt-1">
                Routing via {merchant.activeProcessor} Rail
              </p>
            </div>

            <div className="mt-6">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-900/60">Estimated Net Payout</span>
              <h3 className="text-3xl sm:text-4xl font-bold text-slate-950 tracking-tight font-mono">
                ₦{nextSettlementGross.toLocaleString()}
              </h3>
              <p className="text-xs font-bold text-slate-900/80 mt-1">
                To {merchant.settlementAccount.bankName}: ****{merchant.settlementAccount.accountNumber.slice(-4)}
              </p>
            </div>
          </div>

          {/* Bento Tile 3: Support Desk & Open Disputes (Indigo Card) */}
          <div 
            onClick={() => onNavigateTab('disputes')}
            className="bg-indigo-600 rounded-3xl p-5 sm:p-6 shadow-sm text-white flex items-center justify-between cursor-pointer hover:bg-indigo-700 transition-colors"
          >
            <div>
              <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Dispute & Reversal Desk</p>
              <p className="text-lg sm:text-xl font-bold mt-0.5">
                {pendingDisputesCount} Open Case{pendingDisputesCount !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-white/80 mt-0.5">Click to open instant 1-click audit console</p>
            </div>
            <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
          </div>

        </div>

        {/* Bento Tile 4: Real-Time Transaction Stream (12 Cols Full Width Table) */}
        <div className="lg:col-span-12 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Real-Time Platform Ledger Feed</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Live transaction stream from Smart POS terminals, transfers, QR checkouts, and bill payments
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => onNavigateTab('transactions')}
                className="px-3.5 py-2 text-xs font-bold border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-700 transition-colors cursor-pointer"
              >
                Filters & Audit
              </button>
              <button 
                onClick={() => onNavigateTab('transactions')}
                className="px-3.5 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors cursor-pointer"
              >
                Full Ledger →
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-2xl mt-2">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3.5">Ref ID</th>
                  <th className="px-4 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Payment Method / Channel</th>
                  <th className="px-4 py-3.5 text-right">Amount</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {transactions.slice(0, 6).map((tx) => {
                  const isDisputed = tx.status === 'disputed' || tx.disputeStatus === 'under_review';
                  const isFailed = tx.status === 'failed';
                  const isReversed = tx.status === 'reversed';
                  const isPending = tx.status === 'pending';

                  return (
                    <tr 
                      key={tx.id} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isDisputed ? 'bg-red-50/40' : (isPending ? 'bg-amber-50/30' : '')
                      }`}
                    >
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-500 font-bold">
                        #{tx.reference}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        {tx.customerName || 'Customer'}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-medium">
                        {tx.description}
                      </td>
                      <td className="px-4 py-3.5 font-bold font-mono text-right text-slate-900">
                        ₦{tx.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5">
                        {tx.status === 'successful' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase">
                            Successful
                          </span>
                        )}
                        {tx.status === 'pending' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase">
                            Queued Offline
                          </span>
                        )}
                        {isDisputed && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase">
                            Disputed
                          </span>
                        )}
                        {isReversed && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase">
                            Refunded
                          </span>
                        )}
                        {isFailed && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold uppercase">
                            Declined
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 font-mono text-xs">
                        {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
