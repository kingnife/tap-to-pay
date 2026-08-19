import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Radio, 
  Receipt, 
  ShieldAlert, 
  Layers, 
  Users,
  Building2,
  Store,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { taplinkApi } from '../../lib/api/taplinkApi';
import { OperatorOverview } from './OperatorOverview';
import { TerminalFleet } from './TerminalFleet';
import { TransactionLedger } from './TransactionLedger';
import { DisputesConsole } from './DisputesConsole';
import { SettlementHub } from './SettlementHub';
import { TeamRbac } from './TeamRbac';

export const OperatorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'terminals' | 'transactions' | 'disputes' | 'settlements' | 'team'>('overview');
  const { currentStaff } = useAuth();
  const merchant = taplinkApi.getMerchant();
  const transactions = taplinkApi.getTransactions();

  const pendingDisputes = transactions.filter(t => t.disputeStatus === 'under_review' || t.status === 'disputed').length;

  const tabs = [
    { id: 'overview', label: 'Bento Overview', icon: LayoutDashboard },
    { id: 'terminals', label: 'POS Fleet & Devices', icon: Radio },
    { id: 'transactions', label: 'Audit Ledger', icon: Receipt },
    { id: 'disputes', label: 'Disputes & Reversals', icon: ShieldAlert, badge: pendingDisputes > 0 ? pendingDisputes : undefined },
    { id: 'settlements', label: 'Settlement Hub', icon: Layers },
    { id: 'team', label: 'Team & RBAC', icon: Users }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Merchant Header Bento Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-sm">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{merchant.businessName}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {merchant.category.toUpperCase()} • TILL ID: #44
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Logged in as: <strong className="text-slate-800">{currentStaff?.name || 'Segun A.'}</strong> ({currentStaff?.role.toUpperCase() || 'OWNER'}) • RC Number: {merchant.cacRcNumber}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            Active Processor: {merchant.activeProcessor}
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs (Bento Pill Bar) */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 bg-slate-200/60 rounded-2xl border border-slate-200/80">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-white text-slate-950 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Icon className="w-4 h-4 text-slate-700" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Tab View */}
      <div>
        {activeTab === 'overview' && (
          <OperatorOverview onNavigateTab={(t) => setActiveTab(t)} />
        )}
        {activeTab === 'terminals' && <TerminalFleet />}
        {activeTab === 'transactions' && <TransactionLedger onNavigateToDispute={() => setActiveTab('disputes')} />}
        {activeTab === 'disputes' && <DisputesConsole />}
        {activeTab === 'settlements' && <SettlementHub />}
        {activeTab === 'team' && <TeamRbac />}
      </div>
    </div>
  );
};
