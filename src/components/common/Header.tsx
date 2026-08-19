import React, { useState } from 'react';
import { 
  Radio, 
  Smartphone, 
  Building2, 
  TerminalSquare, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  User, 
  ShieldCheck, 
  ChevronDown,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useAuth, AppView } from '../../context/AuthContext';
import { taplinkApi } from '../../lib/api/taplinkApi';

export const Header: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    consumer, 
    loginAsConsumer, 
    currentStaff, 
    loginAsStaff,
    isNetworkOffline, 
    toggleNetworkOffline,
    syncOfflineQueue 
  } = useAuth();

  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const consumers = taplinkApi.getConsumers();
  const team = taplinkApi.getTeam();
  const terminals = taplinkApi.getTerminals();
  const queuedCount = taplinkApi.getTransactions().filter(t => t.offlineQueued && t.status === 'pending').length;
  const onlineCount = terminals.filter(t => t.status === 'online' && !isNetworkOffline).length;

  const handleSyncNow = () => {
    const { syncedCount } = syncOfflineQueue();
    setSyncNotice(`Successfully synchronized ${syncedCount} queued transactions to the core ledger.`);
    setTimeout(() => setSyncNotice(null), 4000);
  };

  const navItems: { id: AppView; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    { id: 'landing', label: 'Platform & Rails', icon: Layers },
    { id: 'consumer', label: 'Consumer Tap App', icon: Smartphone, badge: `₦${consumer.balance.toLocaleString()}` },
    { id: 'operator', label: 'Operator Console', icon: Building2, badge: currentStaff?.role ? currentStaff.role.toUpperCase() : 'ADMIN' },
    { id: 'terminal_pos', label: 'POS Terminal Simulator', icon: TerminalSquare },
  ];

  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-6 pt-4 pb-2">
      {/* Top alert bar if offline or queued */}
      {(isNetworkOffline || queuedCount > 0) && (
        <div className="max-w-7xl mx-auto mb-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-xs text-amber-900 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-medium">
              {isNetworkOffline 
                ? 'Network Simulation Active: Offline mode engaged. Contactless taps are cryptographically queued in local terminal buffer.'
                : `${queuedCount} offline tap(s) buffered in validator memory awaiting synchronization.`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {queuedCount > 0 && (
              <button
                id="header-sync-queue-btn"
                onClick={handleSyncNow}
                className="px-3 py-1 rounded-lg bg-[#FACC15] hover:bg-yellow-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
              >
                <RefreshCw className="w-3 h-3" />
                Sync {queuedCount} Queued Taps
              </button>
            )}
          </div>
        </div>
      )}

      {syncNotice && (
        <div className="max-w-7xl mx-auto mb-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-xs text-emerald-900 flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{syncNotice}</span>
        </div>
      )}

      {/* Main Bento Header Card */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        
        {/* Brand with vibrant yellow tile */}
        <div 
          onClick={() => setCurrentView('landing')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 bg-[#FACC15] rounded-xl flex items-center justify-center font-black text-xl text-slate-900 shadow-sm group-hover:scale-105 transition-transform">
            T
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg leading-none text-slate-900 tracking-tight">Taplink</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 uppercase tracking-wide">
                Bento v3.4
              </span>
            </div>
            <span className="text-xs text-slate-500 font-medium tracking-tight mt-0.5 hidden sm:block">
              Modern Digital Banking & NFC Tap-to-Pay
            </span>
          </div>
        </div>

        {/* View Navigation Tabs (Bento Pill Switcher) */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-xl border border-slate-200/80">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setCurrentView(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-900' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-[#FACC15] text-slate-950 font-black' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Utilities: System Telemetry, Network Toggle & Persona Switcher */}
        <div className="flex items-center gap-3">
          
          {/* Status Indicator from Bento Design */}
          <div className="hidden lg:flex flex-col items-end border-r border-slate-200 pr-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">System Status</span>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${isNetworkOffline ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span className="text-xs font-bold text-slate-700">
                {isNetworkOffline ? 'Offline Buffer Active' : `Operational: ${onlineCount} Terminals`}
              </span>
            </div>
          </div>

          {/* Network Simulation Toggle */}
          <button
            id="network-simulation-toggle"
            onClick={toggleNetworkOffline}
            title={isNetworkOffline ? 'Click to restore online network connectivity' : 'Click to simulate offline network environment'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${
              isNetworkOffline
                ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100 animate-pulse'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {isNetworkOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span>Offline</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">4G Online</span>
              </>
            )}
          </button>

          {/* Persona / Role Switcher Menu */}
          <div className="relative">
            <button
              id="persona-switcher-btn"
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs text-slate-800 transition-colors shadow-sm"
            >
              <div className="w-7 h-7 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-xs text-slate-800">
                {currentView === 'consumer' ? consumer.fullName.slice(0, 2).toUpperCase() : (currentStaff?.name.slice(0, 2).toUpperCase() || 'SA')}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold leading-tight">
                  {currentView === 'consumer' ? consumer.fullName : (currentStaff?.name || 'Segun A.')}
                </p>
                <p className="text-[10px] text-slate-500">
                  {currentView === 'consumer' ? consumer.userTag : (currentStaff?.role.toUpperCase() || 'ADMIN')}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {showPersonaMenu && (
              <div 
                className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setShowPersonaMenu(false)}
              >
                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Switch Consumer Persona
                </div>
                <div className="py-1 space-y-1">
                  {consumers.map(c => (
                    <button
                      key={c.id}
                      onClick={() => {
                        loginAsConsumer(c.id);
                        setCurrentView('consumer');
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        consumer.id === c.id ? 'bg-amber-50 text-slate-900 font-bold border border-amber-200' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px]">
                          {c.fullName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{c.fullName}</p>
                          <p className="text-[10px] text-slate-500">
                            {c.userTag} • ₦{c.balance.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {consumer.id === c.id && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </button>
                  ))}
                </div>

                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 border-t border-b border-slate-100 mt-1">
                  Switch Operator Staff Role (RBAC)
                </div>
                <div className="py-1 space-y-1">
                  {team.map(m => (
                    <button
                      key={m.id}
                      onClick={() => {
                        loginAsStaff(m.id);
                        setCurrentView('operator');
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        currentStaff?.id === m.id ? 'bg-amber-50 text-slate-900 font-bold border border-amber-200' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px]">
                          {m.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{m.name}</p>
                          <p className="text-[10px] uppercase font-bold text-indigo-600">{m.role}</p>
                        </div>
                      </div>
                      {currentStaff?.id === m.id && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile navigation bar */}
      <div className="md:hidden flex items-center justify-around bg-white border border-slate-200 rounded-2xl mt-2 px-2 py-1.5 shadow-sm">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-bold transition-colors ${
                isActive ? 'text-slate-950 bg-[#FACC15]' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
