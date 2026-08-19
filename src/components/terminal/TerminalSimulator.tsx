import React, { useState } from 'react';
import { 
  TerminalSquare, 
  Radio, 
  Wifi, 
  WifiOff, 
  Battery, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  CreditCard,
  Volume2,
  VolumeX,
  Store,
  DollarSign
} from 'lucide-react';
import { taplinkApi } from '../../lib/api/taplinkApi';
import { tapAudio } from '../../lib/audio/tapAudio';
import { useAuth } from '../../context/AuthContext';
import { Terminal, Transaction } from '../../types';

export const TerminalSimulator: React.FC = () => {
  const { isNetworkOffline, toggleNetworkOffline } = useAuth();
  const terminals = taplinkApi.getTerminals();
  const consumers = taplinkApi.getConsumers();

  const [selectedTerminalId, setSelectedTerminalId] = useState<string>(terminals[0]?.id || 'term-pos-01');
  const [selectedConsumerId, setSelectedConsumerId] = useState<string>(consumers[0]?.id || 'user-bolaji');
  const [isTapping, setIsTapping] = useState(false);
  const [lastResult, setLastResult] = useState<Transaction | null>(null);
  const [audioMuted, setAudioMuted] = useState(false);
  const [customAmountInput, setCustomAmountInput] = useState<string>('3500');

  const currentTerminal = terminals.find(t => t.id === selectedTerminalId) || terminals[0];
  const currentConsumer = consumers.find(c => c.id === selectedConsumerId) || consumers[0];

  const handleSimulateTap = async () => {
    if (!currentTerminal || !currentConsumer || isTapping) return;
    setIsTapping(true);
    setLastResult(null);

    try {
      const amountToCharge = customAmountInput !== '' ? parseInt(customAmountInput, 10) : 2500;
      const result = await taplinkApi.executeTapPayment(
        currentConsumer.id,
        currentTerminal.id,
        amountToCharge
      );

      const tx = result.transaction;

      // Trigger audio and haptic feedback
      if (!audioMuted) {
        if (tx.status === 'successful') {
          tapAudio.playTapSuccess();
        } else if (tx.status === 'pending') {
          tapAudio.playOfflineChime();
        } else {
          tapAudio.playTapFailure();
        }
      }

      setLastResult(tx);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Tap processing error');
    } finally {
      setIsTapping(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Header Bar Bento Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-xs">
            <TerminalSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">NFC Merchant POS Terminal Lab</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Simulates Android Smart POS, Countertop NFC Pads, and SoftPOS EMV Contactless Readers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAudioMuted(!audioMuted)}
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
              audioMuted ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-amber-50 border-amber-300 text-slate-900'
            }`}
          >
            {audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-600" />}
            <span>{audioMuted ? 'Hardware Audio Muted' : 'Beep / Buzzer Enabled'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Physical Terminal Hardware Chassis (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          
          {/* Rugged Industrial POS Enclosure */}
          <div className="w-full max-w-sm rounded-3xl bg-slate-950 p-5 border-4 border-slate-800 shadow-xl relative space-y-4">
            
            {/* Top Status LED Bar */}
            <div className="flex items-center justify-between px-2 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-xs" />
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                  {currentTerminal.code}
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-mono">
                <span className="flex items-center gap-1">
                  <Battery className="w-3 h-3 text-emerald-400" />
                  {currentTerminal.telemetry.batteryPct}%
                </span>
                {isNetworkOffline ? (
                  <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                    <WifiOff className="w-3 h-3" /> OFFLINE
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5 text-emerald-400 font-bold">
                    <Wifi className="w-3 h-3" /> 4G LTE
                  </span>
                )}
              </div>
            </div>

            {/* LCD Screen Display (OLED Style) */}
            <div className="rounded-2xl bg-slate-900 border-2 border-slate-800 p-5 space-y-4 shadow-inner text-center min-h-[260px] flex flex-col justify-between">
              
              <div>
                <p className="text-[10px] uppercase tracking-widest text-amber-400 font-bold font-mono">
                  {currentTerminal.type.replace(/_/g, ' ')}
                </p>
                <h3 className="text-white font-bold text-base mt-1">
                  {currentTerminal.name}
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {currentTerminal.assignedStaffOrStore || currentTerminal.location}
                </p>
              </div>

              {/* Dynamic State on LCD */}
              {isTapping ? (
                <div className="py-4 space-y-2 animate-pulse">
                  <div className="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mx-auto" />
                  <p className="font-mono text-amber-400 font-bold text-xs">COMMUNICATING WITH NFC TOKEN...</p>
                </div>
              ) : lastResult ? (
                <div className="py-2 space-y-2 animate-in zoom-in-95 duration-150">
                  {lastResult.status === 'successful' && (
                    <div className="space-y-1">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <p className="text-emerald-400 font-bold font-mono text-sm">PAYMENT APPROVED • ₦{lastResult.amount.toLocaleString()}</p>
                      <p className="text-xs text-white font-mono">
                        AUTH TIME: {lastResult.latencyMs}ms
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        CUSTOMER: {lastResult.customerName}
                      </p>
                    </div>
                  )}

                  {lastResult.status === 'pending' && lastResult.offlineQueued && (
                    <div className="space-y-1">
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/40">
                        <Clock className="w-6 h-6" />
                      </div>
                      <p className="text-amber-400 font-bold font-mono text-sm">OFFLINE AUTH ACCEPTED</p>
                      <p className="text-xs text-slate-300 font-mono">
                        QUEUED FOR CLOUD LEDGER SYNC
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">
                        HASH: {lastResult.cryptographicTapHash?.slice(0, 14)}...
                      </p>
                    </div>
                  )}

                  {lastResult.status === 'failed' && (
                    <div className="space-y-1">
                      <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/40">
                        <XCircle className="w-6 h-6" />
                      </div>
                      <p className="text-rose-400 font-bold font-mono text-sm">PAYMENT DECLINED</p>
                      <p className="text-[11px] text-rose-300 font-mono">
                        {lastResult.failureReason || 'INSUFFICIENT BALANCE'}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-3 space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-amber-400">
                    <Radio className="w-8 h-8 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-xs font-mono font-bold text-slate-300">PRESENT NFC CARD OR PHONE</p>
                    <p className="text-sm font-mono text-amber-400 font-bold mt-1">
                      AMOUNT: ₦{Number(customAmountInput || 2500).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Terminal Footer Info */}
              <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-500 flex justify-between">
                <span>EMV L2: OK</span>
                <span>QUEUED: {currentTerminal.telemetry.queuedOfflineCount}</span>
                <span>FIRMWARE: {currentTerminal.telemetry.firmwareVersion}</span>
              </div>
            </div>

            {/* Contactless Target / NFC Antenna Coil Area */}
            <div 
              onClick={handleSimulateTap}
              className="p-5 rounded-2xl bg-slate-900 border-2 border-dashed border-amber-400/40 hover:border-amber-400 hover:bg-amber-400/10 text-center cursor-pointer transition-all active:scale-95 space-y-2"
            >
              <div className="w-10 h-10 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center mx-auto">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <p className="text-xs font-bold text-white tracking-wide">
                [ TAP NFC PHONE / CARD HERE ]
              </p>
              <p className="text-[11px] text-slate-400 font-medium">
                Click to simulate presenting <span className="text-amber-400 font-bold">{currentConsumer.fullName}</span>'s wallet
              </p>
            </div>
          </div>
        </div>

        {/* Right: Simulation Controls & Parameter Config Bento Tiles (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Select Terminal Hardware Tile */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              1. Choose Merchant POS Terminal / Station
            </span>
            <select
              value={selectedTerminalId}
              onChange={(e) => setSelectedTerminalId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-900"
            >
              {terminals.map(t => (
                <option key={t.id} value={t.id}>
                  {t.code} — {t.name} ({t.location})
                </option>
              ))}
            </select>
          </div>

          {/* Select Consumer Card Tile */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              2. Select Customer Profile & Wallet
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {consumers.map(c => {
                const isSelected = selectedConsumerId === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedConsumerId(c.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-50 border-amber-400 text-slate-950 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <p className="font-bold text-xs">{c.fullName}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{c.cardUid} • {c.userTag}</p>
                    <p className="text-xs font-bold text-emerald-700 mt-1 font-mono">₦{c.balance.toLocaleString()}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Amount Config & Network Condition Tile */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              3. Transaction Parameters & Network Simulation
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="block text-[11px] font-bold text-slate-700 mb-1">Transaction Charge (₦)</span>
                <input
                  type="number"
                  placeholder="Enter amount (e.g. 3500)"
                  value={customAmountInput}
                  onChange={(e) => setCustomAmountInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <span className="block text-[11px] font-bold text-slate-700 mb-1">Network Connectivity</span>
                <button
                  type="button"
                  onClick={toggleNetworkOffline}
                  className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                    isNetworkOffline
                      ? 'bg-amber-100 border-amber-300 text-amber-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {isNetworkOffline ? <WifiOff className="w-3.5 h-3.5 text-amber-700" /> : <Wifi className="w-3.5 h-3.5 text-emerald-600" />}
                  <span>{isNetworkOffline ? 'Network: Offline (Simulated)' : 'Network: Online (4G)'}</span>
                </button>
              </div>
            </div>

            {/* Rapid Tap Button */}
            <button
              id="simulate-tap-btn"
              onClick={handleSimulateTap}
              disabled={isTapping || !customAmountInput || Number(customAmountInput) <= 0}
              className="w-full py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Radio className="w-4 h-4 text-slate-950" />
              <span>{isTapping ? 'Processing Tap...' : `Execute Sub-300ms Tap (₦${Number(customAmountInput || 0).toLocaleString()})`}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
