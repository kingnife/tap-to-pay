import React, { useState } from 'react';
import { 
  Radio, 
  Battery, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Plus, 
  Sliders, 
  Store, 
  CheckCircle2, 
  AlertTriangle, 
  Power, 
  Edit3,
  Search,
  Activity,
  Smartphone
} from 'lucide-react';
import { Terminal, TerminalType } from '../../types';
import { taplinkApi } from '../../lib/api/taplinkApi';
import { useAuth } from '../../context/AuthContext';

export const TerminalFleet: React.FC = () => {
  const { hasOperatorPermission } = useAuth();
  const terminals = taplinkApi.getTerminals();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTerminal, setSelectedTerminal] = useState<Terminal | null>(null);

  // Form states for assignment
  const [assignedStaff, setAssignedStaff] = useState('');
  const [location, setLocation] = useState('');

  // Add terminal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<TerminalType>('android_smart_pos');
  const [newLocation, setNewLocation] = useState('');
  const [newAssignedStaff, setNewAssignedStaff] = useState('');

  const filtered = terminals.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q) ||
        (t.assignedStaffOrStore && t.assignedStaffOrStore.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleOpenAssign = (term: Terminal) => {
    setSelectedTerminal(term);
    setAssignedStaff(term.assignedStaffOrStore || '');
    setLocation(term.location);
    setAssignModalOpen(true);
  };

  const handleSaveAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTerminal) return;

    taplinkApi.assignTerminal(
      selectedTerminal.id,
      location,
      assignedStaff
    );

    setAssignModalOpen(false);
    setSelectedTerminal(null);
  };

  const handleReboot = (termId: string) => {
    taplinkApi.rebootTerminal(termId);
    alert('Signal dispatched: Terminal heartbeat refreshed.');
  };

  const handleCreateTerminal = (e: React.FormEvent) => {
    e.preventDefault();
    taplinkApi.createTerminal({
      code: newCode.toUpperCase(),
      name: newName,
      type: newType,
      location: newLocation,
      assignedStaffOrStore: newAssignedStaff || 'Main Till'
    });
    setAddModalOpen(false);
    setNewCode('');
    setNewName('');
    setNewLocation('');
    setNewAssignedStaff('');
  };

  const canManage = hasOperatorPermission('manage_terminals');

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">POS Terminals & Hardware Telemetry</h3>
          <p className="text-xs text-slate-500">Live battery level, connectivity, offline cache buffer, and store station assignments</p>
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <button
              onClick={() => setAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Provision Terminal</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All Terminals' },
            { id: 'android_smart_pos', label: 'Smart Android POS' },
            { id: 'contactless_countertop', label: 'Countertop NFC Pads' },
            { id: 'mobile_nfc_softpos', label: 'SoftPOS (Phones)' },
            { id: 'unattended_kiosk', label: 'Self-Service Kiosks' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilterType(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                filterType === cat.id
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search terminal code, till, or store..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Terminals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(term => {
          const isOffline = term.status === 'offline' || term.telemetry.signalStrength === 'OFFLINE';
          const isWarning = term.telemetry.readerHealth === 'warning' || term.telemetry.batteryPct < 30;

          return (
            <div
              key={term.id}
              className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-slate-300 transition-all space-y-4 shadow-sm flex flex-col justify-between"
            >
              <div>
                {/* Card Top: Code & Status */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                      {term.code}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-500">
                      {term.type.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isOffline ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                        <WifiOff className="w-3 h-3" />
                        OFFLINE
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                        <Wifi className="w-3 h-3" />
                        {term.telemetry.signalStrength}
                      </span>
                    )}
                  </div>
                </div>

                {/* Name & Route */}
                <div className="mt-3 space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">{term.name}</h4>
                  <p className="text-xs text-slate-500">{term.location}</p>
                  <div className="pt-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Assigned Till / Station</p>
                    <p className="text-xs font-bold text-slate-800">{term.assignedStaffOrStore || 'Till 1'}</p>
                  </div>
                </div>

                {/* Revenue Today & Activity */}
                <div className="mt-4 grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-sans">Taps Today</span>
                    <p className="font-bold text-slate-900 font-sans text-sm">{term.totalTapsToday} TXs</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-sans">Volume Today</span>
                    <p className="font-bold text-emerald-700 font-sans text-sm">₦{term.totalRevenueToday.toLocaleString()}</p>
                  </div>
                </div>

                {/* Telemetry Gauge Bar */}
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1.5">
                      <Battery className={`w-3.5 h-3.5 ${term.telemetry.batteryPct < 30 ? 'text-rose-500' : 'text-emerald-600'}`} />
                      {term.telemetry.batteryPct}% {term.telemetry.isCharging && '(Charging)'}
                    </span>
                    <span>Firmware: {term.telemetry.firmwareVersion}</span>
                  </div>

                  {term.telemetry.queuedOfflineCount > 0 && (
                    <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                        {term.telemetry.queuedOfflineCount} Payments in Offline Buffer
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleReboot(term.id)}
                  title="Ping / Refresh Terminal"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  <Power className="w-3.5 h-3.5" />
                </button>

                {canManage && (
                  <button
                    onClick={() => handleOpenAssign(term)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-700" />
                    <span>Configure Station</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Assign Route / Station */}
      {assignModalOpen && selectedTerminal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Configure Terminal {selectedTerminal.code}</h3>
                  <p className="text-xs text-slate-500">Update store station assignment and location details</p>
                </div>
              </div>
              <button 
                onClick={() => setAssignModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAssign} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Physical Store Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Till / Staff Station</label>
                <input
                  type="text"
                  value={assignedStaff}
                  onChange={(e) => setAssignedStaff(e.target.value)}
                  placeholder="e.g. Till 1 — Front Counter or Table 4 Waiter"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Deploy New Terminal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-base">Provision New POS Device</h3>
              </div>
              <button 
                onClick={() => setAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTerminal} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Terminal Serial / Code</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. POS-LEK-04"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hardware Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as TerminalType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-amber-400"
                  >
                    <option value="android_smart_pos">Smart Android POS Terminal</option>
                    <option value="contactless_countertop">Countertop NFC Tap Pad</option>
                    <option value="mobile_nfc_softpos">SoftPOS Mobile App</option>
                    <option value="unattended_kiosk">Self-Service Checkout Kiosk</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Device Name / Label</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Lekki Store Till 4"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Physical Store Location</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Admiralty Way, Lekki Phase 1, Lagos"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Staff / Till</label>
                <input
                  type="text"
                  placeholder="e.g. Till 4 — Cashier Desk"
                  value={newAssignedStaff}
                  onChange={(e) => setNewAssignedStaff(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Provision Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
