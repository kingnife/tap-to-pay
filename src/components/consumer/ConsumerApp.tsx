import React, { useState } from 'react';
import { 
  ShieldCheck, 
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  SmartphoneNfc
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { taplinkApi } from '../../lib/api/taplinkApi';
import { Transaction } from '../../types';
import { VirtualTapCard } from './VirtualTapCard';
import { SendMoneyModal } from './SendMoneyModal';
import { BillPaymentModal } from './BillPaymentModal';
import { QrPaymentModal } from './QrPaymentModal';
import { TapModal } from './TapModal';
import { TopUpModal } from './TopUpModal';
import { DisputeModal } from './DisputeModal';
import { TransactionHistory } from './TransactionHistory';

export const ConsumerApp: React.FC = () => {
  const { consumer: initialConsumer } = useAuth();
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [tapModalOpen, setTapModalOpen] = useState(false);
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [selectedDisputeTx, setSelectedDisputeTx] = useState<Transaction | null>(null);
  const [updateTick, setUpdateTick] = useState(0);

  // Subscribe to central taplink state changes
  React.useEffect(() => {
    const unsub = taplinkApi.subscribe(() => {
      setUpdateTick(v => v + 1);
    });
    return unsub;
  }, []);

  const consumer = taplinkApi.getConsumerById(initialConsumer.id) || initialConsumer;

  // Get user-specific transactions
  const allTx = taplinkApi.getTransactions();
  const userTx = allTx.filter(t => t.customerId === consumer.id);

  // Stats calculation
  const totalSpentToday = userTx
    .filter(t => t.status === 'successful' && t.type === 'debit' && new Date(t.timestamp).toDateString() === new Date().toDateString())
    .reduce((sum, t) => sum + t.amount, 0);

  const totalInflowToday = userTx
    .filter(t => t.status === 'successful' && t.type === 'credit' && new Date(t.timestamp).toDateString() === new Date().toDateString())
    .reduce((sum, t) => sum + t.amount, 0);

  const handleOpenDispute = (tx: Transaction) => {
    setSelectedDisputeTx(tx);
    setDisputeModalOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Consumer Profile Header Bento Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-lg shadow-sm shrink-0">
            {consumer.fullName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-bold text-slate-900 text-lg sm:text-xl">{consumer.fullName}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Tier {consumer.kycTier.toUpperCase()} Verified
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {consumer.userTag} • {consumer.phone} • Daily Limit: ₦{consumer.dailyTransferLimit.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Rapid Stat Cards */}
        <div className="flex items-center gap-3 text-xs">
          <div className="px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <ArrowDownLeft className="w-3 h-3 text-emerald-500" />
              Inflow Today
            </span>
            <p className="font-bold text-emerald-700 font-mono text-sm mt-0.5">₦{totalInflowToday.toLocaleString()}</p>
          </div>
          <div className="px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-amber-500" />
              Outflow Today
            </span>
            <p className="font-bold text-slate-900 font-mono text-sm mt-0.5">₦{totalSpentToday.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Main Virtual Card & Bento Action Hub */}
      <VirtualTapCard
        consumer={consumer}
        onSendClick={() => setSendModalOpen(true)}
        onTapClick={() => setTapModalOpen(true)}
        onBillClick={() => setBillModalOpen(true)}
        onQrClick={() => setQrModalOpen(true)}
        onTopUpClick={() => setTopUpModalOpen(true)}
      />

      {/* Transaction & Spend History */}
      <div className="pt-2">
        <TransactionHistory
          transactions={userTx}
          onOpenDispute={handleOpenDispute}
        />
      </div>

      {/* Modals */}
      <SendMoneyModal
        isOpen={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
        onSuccess={() => {}}
      />

      <BillPaymentModal
        isOpen={billModalOpen}
        onClose={() => setBillModalOpen(false)}
        onSuccess={() => {}}
      />

      <QrPaymentModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        onSuccess={() => {}}
      />

      <TapModal
        consumer={consumer}
        isOpen={tapModalOpen}
        onClose={() => setTapModalOpen(false)}
        onSuccess={() => {}}
        onOpenTopUp={() => {
          setTapModalOpen(false);
          setTopUpModalOpen(true);
        }}
      />

      <TopUpModal
        consumer={consumer}
        isOpen={topUpModalOpen}
        onClose={() => setTopUpModalOpen(false)}
        onSuccess={() => {}}
      />

      <DisputeModal
        transaction={selectedDisputeTx}
        isOpen={disputeModalOpen}
        onClose={() => {
          setDisputeModalOpen(false);
          setSelectedDisputeTx(null);
        }}
        onSuccess={() => {}}
      />
    </div>
  );
};
