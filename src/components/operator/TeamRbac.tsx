import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  UserCheck, 
  Mail,
  Lock,
  Layers
} from 'lucide-react';
import { TeamMember, UserRole } from '../../types';
import { taplinkApi } from '../../lib/api/taplinkApi';
import { useAuth } from '../../context/AuthContext';

export const TeamRbac: React.FC = () => {
  const { currentStaff, loginAsStaff, hasOperatorPermission } = useAuth();
  const team = taplinkApi.getTeam();

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('manager');

  const canManageTeam = hasOperatorPermission('manage_team');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    taplinkApi.addTeamMember(inviteName, inviteEmail, invitePhone || '+234 800 000 0000', inviteRole);
    setInviteModalOpen(false);
    setInviteName('');
    setInviteEmail('');
    setInvitePhone('');
  };

  const handleRemove = (id: string) => {
    if (confirm('Remove this team member from merchant staff access?')) {
      taplinkApi.removeTeamMember(id);
    }
  };

  const permissionsList = [
    { key: 'manage_terminals', label: 'Manage & Provision POS Terminals' },
    { key: 'approve_refunds', label: 'Approve Instant Customer Reversals' },
    { key: 'execute_settlement', label: 'Trigger Payout & Settlement Batches' },
    { key: 'manage_team', label: 'Invite & Manage Team Staff' },
    { key: 'accept_payments', label: 'Accept In-Store & Mobile Payments' },
    { key: 'view_telemetry', label: 'Inspect Device Telemetry & POS Health' }
  ];

  const roleDefinitions: Record<UserRole, { title: string; desc: string; perms: string[] }> = {
    owner: {
      title: 'Business Owner / Admin',
      desc: 'Complete organizational, banking, and financial authority across all stores and terminals.',
      perms: ['manage_terminals', 'approve_refunds', 'execute_settlement', 'manage_team', 'accept_payments', 'view_telemetry']
    },
    manager: {
      title: 'Store & Operations Manager',
      desc: 'Oversees checkout terminals, cashier staff assignments, and store floor devices.',
      perms: ['manage_terminals', 'accept_payments', 'view_telemetry']
    },
    finance: {
      title: 'Finance & Settlement Officer',
      desc: 'Controls NUBAN settlement disbursements, audits ledgers, and resolves customer chargebacks.',
      perms: ['approve_refunds', 'execute_settlement', 'view_telemetry']
    },
    cashier: {
      title: 'Cashier / Till Operator',
      desc: 'Operates POS terminals, accepts card/NFC/transfer payments, and views instant receipts.',
      perms: ['accept_payments']
    },
    technician: {
      title: 'Field & Hardware Technician',
      desc: 'Monitors NFC reader health, battery telemetry, and provisions terminals on site.',
      perms: ['view_telemetry']
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Team & Role-Based Access Control (RBAC)</h3>
          <p className="text-xs text-slate-500">Fine-grained permissions for store managers, cashiers, finance officers, and technicians</p>
        </div>

        {canManageTeam && (
          <button
            onClick={() => setInviteModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Invite Team Member</span>
          </button>
        )}
      </div>

      {/* Current Active Session Indicator */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold border border-amber-200">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Currently Logged In Staff</p>
            <p className="font-bold text-slate-900 text-sm">{currentStaff?.name} ({currentStaff?.email})</p>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 mt-0.5 inline-block">
              Role: {currentStaff?.role}
            </span>
          </div>
        </div>

        <span className="text-xs text-slate-500 font-medium">Use "Switch Staff" below to test permission gates</span>
      </div>

      {/* Team Members List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {team.map(member => {
          const isMe = currentStaff?.id === member.id;
          const roleDef = roleDefinitions[member.role] || roleDefinitions.cashier;

          return (
            <div
              key={member.id}
              className={`p-5 rounded-3xl border transition-all space-y-3 ${
                isMe ? 'bg-amber-50/50 border-amber-400 shadow-xs' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                    {member.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{member.name}</h4>
                    <p className="text-[11px] text-slate-500">{member.email}</p>
                  </div>
                </div>

                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                  {member.role}
                </span>
              </div>

              <p className="text-xs text-slate-600">{roleDef.desc}</p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">Active: {member.lastActive}</span>

                <div className="flex items-center gap-2">
                  {!isMe && (
                    <button
                      onClick={() => loginAsStaff(member.id)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      Act as {member.name.split(' ')[0]}
                    </button>
                  )}

                  {canManageTeam && member.role !== 'owner' && (
                    <button
                      onClick={() => handleRemove(member.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remove Member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Granular Permission Matrix Table */}
      <div className="space-y-3 pt-4">
        <h4 className="font-bold text-slate-900 text-sm">Role Permissions Matrix</h4>
        <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Functional Capability</th>
                  <th className="py-3 px-4 text-center">Owner / Admin</th>
                  <th className="py-3 px-4 text-center">Ops Manager</th>
                  <th className="py-3 px-4 text-center">Finance Officer</th>
                  <th className="py-3 px-4 text-center">Cashier</th>
                  <th className="py-3 px-4 text-center">Technician</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {permissionsList.map((perm) => (
                  <tr key={perm.key} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{perm.label}</td>
                    <td className="py-3.5 px-4 text-center">
                      <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {roleDefinitions.manager.perms.includes(perm.key) ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {roleDefinitions.finance.perms.includes(perm.key) ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {roleDefinitions.cashier.perms.includes(perm.key) ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {roleDefinitions.technician.perms.includes(perm.key) ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Invite Team Member */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-base">Invite Staff Member</h3>
              </div>
              <button 
                onClick={() => setInviteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Tayo Ogunleye"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  required
                  type="email"
                  placeholder="e.g. tayo@taplink.ng"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. +234 803 123 4567"
                  value={invitePhone}
                  onChange={(e) => setInvitePhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role Assignment</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-amber-400"
                >
                  <option value="cashier">Cashier / Till Operator (Payments & Receipts)</option>
                  <option value="manager">Store Manager (POS & Staff Oversight)</option>
                  <option value="finance">Finance Officer (Settlements & Disputes)</option>
                  <option value="technician">Field Hardware Technician (Device Telemetry)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
