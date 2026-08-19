import React, { useState } from 'react';
import { 
  Radio, 
  Zap, 
  ShieldCheck, 
  Clock, 
  WifiOff, 
  ArrowRight, 
  Building, 
  GraduationCap, 
  Bus, 
  CheckCircle2, 
  ChevronRight,
  Sparkles,
  Server,
  Layers,
  PhoneCall,
  Mail,
  Send,
  Activity,
  TerminalSquare,
  ShieldAlert,
  CreditCard,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { tapAudio } from '../../lib/audio/tapAudio';

interface LandingPageProps {
  onExploreConsumer?: () => void;
  onExploreOperator?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = () => {
  const { setCurrentView } = useAuth();
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [partnerFormSubmitted, setPartnerFormSubmitted] = useState(false);
  const [partnerOrgType, setPartnerOrgType] = useState('transit_operator');

  const [interactiveTapStatus, setInteractiveTapStatus] = useState<'idle' | 'success'>('idle');

  const handleHeroTapDemo = () => {
    tapAudio.playTapSuccess();
    setInteractiveTapStatus('success');
    setTimeout(() => setInteractiveTapStatus('idle'), 2400);
  };

  const handlePartnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPartnerFormSubmitted(true);
    setTimeout(() => {
      setPartnerFormSubmitted(false);
      setPartnerModalOpen(false);
    }, 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Top Bento Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sub-3-Second NFC Infrastructure</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
            Contactless tap-to-pay for <span className="underline decoration-[#FACC15] decoration-4 underline-offset-4">Nigerian Transit & Campuses</span>.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            Engineered specifically for high-throughput Nigerian environments — Lagos BRT gates, bus fleets, campus cafeterias, turnstiles, and university shuttles.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="hero-launch-consumer-btn"
              onClick={() => setCurrentView('consumer')}
              className="px-6 py-3 rounded-2xl bg-[#FACC15] hover:bg-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <span>Launch Consumer Tap App</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="hero-launch-operator-btn"
              onClick={() => setCurrentView('operator')}
              className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors"
            >
              <Building className="w-4 h-4 text-slate-400" />
              <span>Operator Dashboard</span>
            </button>

            <button
              id="hero-partner-modal-btn"
              onClick={() => setPartnerModalOpen(true)}
              className="px-4 py-3 rounded-2xl text-slate-700 hover:text-slate-950 text-xs font-bold underline underline-offset-4 transition-colors"
            >
              Partner With Us
            </button>
          </div>
        </div>

        {/* Quick Bento Stats Pill */}
        <div className="w-full lg:w-80 bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Network Speed</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">&lt; 200ms Auth</span>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Daily Taps Handled</p>
              <p className="text-2xl font-black text-slate-900">42,800+</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Offline Uptime</p>
              <p className="text-2xl font-black text-indigo-600">99.98% Local Buffer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Bento Feature Matrix (12-Column Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Bento Tile 1 (8 Cols): Interactive NFC Reader Simulator */}
        <div className="md:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Interactive Reader Playground</span>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                  Test Sub-3-Second Transit Tap
                </h3>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-lg uppercase">
                ISO/IEC 14443-A Active
              </span>
            </div>

            {/* Interactive Reader Simulator Block */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div
                onClick={handleHeroTapDemo}
                className={`cursor-pointer group relative w-32 h-32 rounded-3xl flex flex-col items-center justify-center border-2 transition-all duration-200 shrink-0 ${
                  interactiveTapStatus === 'success'
                    ? 'bg-[#FACC15]/20 border-yellow-500 scale-105 shadow-lg'
                    : 'bg-white border-slate-300 hover:border-slate-900 hover:shadow-md'
                }`}
              >
                <Radio className={`w-12 h-12 transition-colors ${
                  interactiveTapStatus === 'success' ? 'text-amber-600 animate-bounce' : 'text-slate-400 group-hover:text-slate-900'
                }`} />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 mt-1">
                  TAP CARD HERE
                </span>
                <div className="absolute -bottom-2 px-2 py-0.5 rounded-full bg-slate-900 text-[9px] font-bold text-white">
                  NFC COIL
                </div>
              </div>

              <div className="space-y-3 flex-1">
                <div className="p-3 bg-white rounded-xl border border-slate-200 font-mono text-xs text-slate-700 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">Route:</span>
                    <span className="font-bold text-slate-900">Ikorodu ➔ TBS BRT (PRIMERO #104)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">Fare Deduction:</span>
                    <span className="font-black text-emerald-600">₦500 Flat Transit Rate</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">Latency:</span>
                    <span className="font-bold text-indigo-600">142ms (Sub-3s Compliant)</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 font-medium">
                  {interactiveTapStatus === 'success' 
                    ? '⚡ Tap Confirmed! Turnstile unlatched. Double-beep feedback played.'
                    : 'Click the NFC target above to experience instant acoustic/tactile tap feedback.'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Supports Cowry cards, Host Card Emulation (HCE), & smart keyfobs</span>
            <button 
              onClick={() => setCurrentView('terminal_pos')}
              className="font-bold text-slate-900 hover:text-indigo-600 flex items-center gap-1 transition-colors"
            >
              Open Dedicated POS Hardware View →
            </button>
          </div>
        </div>

        {/* Bento Tile 2 (4 Cols): Yellow Settlement Engine */}
        <div 
          onClick={() => setCurrentView('operator')}
          className="md:col-span-4 bg-[#FACC15] rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col justify-between cursor-pointer hover:bg-yellow-400 transition-colors"
        >
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-950/70">
                Payment Clearing
              </span>
              <span className="text-xs font-black uppercase bg-white/50 text-slate-950 px-2 py-0.5 rounded-md">
                NIBSS Rails
              </span>
            </div>
            <h3 className="text-2xl font-black text-slate-950 mt-2 tracking-tight">
              Automated Operator Payouts
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-slate-900/80 mt-1">
              Zero manual invoicing. Daily direct bank credit to transport operators & campus accounts.
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-900/10 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-900/60">Swappable Processors</span>
            <p className="text-xs font-bold text-slate-950">NIBSS NIP • Interswitch • Paystack • Monnify</p>
          </div>
        </div>

        {/* Bento Tile 3 (4 Cols): Indigo Dispute Desk */}
        <div className="md:col-span-4 bg-indigo-600 rounded-3xl p-6 sm:p-7 shadow-sm text-white flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">
              Trust & Resolution
            </span>
            <h3 className="text-xl font-black mt-1">Instant Reversal Console</h3>
            <p className="text-xs text-white/80 mt-1.5 leading-relaxed">
              Solves Nigeria's #1 digital payment trust issue: 1-click duplicate tap reversal with immediate commuter card balance restoration.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-white/90">
            <span className="font-bold">Automated Audit Logs</span>
            <button 
              onClick={() => setCurrentView('operator')}
              className="text-xs font-bold underline hover:text-white"
            >
              View Queue →
            </button>
          </div>
        </div>

        {/* Bento Tile 4 (4 Cols): Visible Offline Resilience */}
        <div className="md:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center mb-4 text-amber-700">
              <WifiOff className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Offline First Architecture
            </span>
            <h3 className="text-xl font-black text-slate-900 mt-1">Visible Offline Resilience</h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              When cell towers fluctuate or power drops, transactions queue in encrypted local terminal memory with explicit status badges.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold text-slate-800">Zero Lost Revenue</span>
            <span className="text-emerald-600 font-bold">Auto-Sync on 4G</span>
          </div>
        </div>

        {/* Bento Tile 5 (4 Cols): Campus & Transit Ecosystems */}
        <div className="md:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4 text-emerald-700">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Multi-Service Pass
            </span>
            <h3 className="text-xl font-black text-slate-900 mt-1">BRT & Campus Pass</h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Unified contactless balance across BRT corridors, Unilag cafeterias, hostel turnstiles, and university library scanners.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold text-slate-800">Virtual & Physical Cards</span>
            <button 
              onClick={() => setCurrentView('consumer')}
              className="font-bold text-slate-900 underline"
            >
              Try Pass →
            </button>
          </div>
        </div>

        {/* Bento Tile 6 (12 Cols): Infrastructure Specification Grid */}
        <div className="md:col-span-12 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Technical Specifications
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">
                Enterprise Nigerian Transit Infrastructure Stack
              </h3>
            </div>
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-xl border border-slate-200">
              ISO/IEC 14443-A • NIBSS Direct • ISO 8583
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Card & Token Support</p>
              <p className="text-sm font-bold text-slate-900">Mifare Classic, DesFire EV2/EV3, Phone HCE (Apple/Google Wallet)</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hardware Telemetry</p>
              <p className="text-sm font-bold text-slate-900">Live battery %, signal strength (4G/3G/Offline), CPU temp & queue depth</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nigerian Rails</p>
              <p className="text-sm font-bold text-slate-900">NIBSS NIP instant payout, Virtual Account NUBANs, USSD shortcodes</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Security & RBAC</p>
              <p className="text-sm font-bold text-slate-900">SHA-256 cryptographic tap hashing, Role-Based Access Control for transit staff</p>
            </div>
          </div>
        </div>

      </div>

      {/* Partner With Us Bento Modal */}
      {partnerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 relative">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enterprise Onboarding</span>
                <h3 className="text-2xl font-black text-slate-900">Partner With Taplink</h3>
              </div>
              <button
                onClick={() => setPartnerModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {partnerFormSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Partnership Request Submitted!</h4>
                <p className="text-xs text-slate-600">
                  Our Nigerian transit integration team will reach out to schedule a corridor pilot and hardware deployment.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePartnerSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Organization Type</label>
                  <select
                    value={partnerOrgType}
                    onChange={(e) => setPartnerOrgType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800"
                  >
                    <option value="transit_operator">Public Transit / BRT Operator (e.g. LAMATA, Primero)</option>
                    <option value="campus_admin">University or Polytechnic Administration (e.g. Unilag)</option>
                    <option value="bus_cooperative">Private Bus Cooperative / Interstate Fleet</option>
                    <option value="payment_switch">Licensed Payment Switch / Bank</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Contact Name</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Segun Adeyemi"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800" 
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Official Email</label>
                    <input 
                      type="email" 
                      required 
                      placeholder="e.g. ops@lamata.ng"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fleet / Campus Scale (Est. Terminals)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 150 BRT buses or 40 turnstiles"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800" 
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-[#FACC15] hover:bg-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-colors mt-2"
                >
                  Request Terminal Deployment Demo
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
