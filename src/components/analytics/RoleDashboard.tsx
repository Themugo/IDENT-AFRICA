/**
 * Role-Based Dashboard Component
 * 
 * Role-specific views for analytics.
 */

import React, { useState } from 'react';
import {
  BarChart3,
  DollarSign,
  Users,
  Building2,
  Lock,
  Eye,
  Download,
  Settings,
} from 'lucide-react';

// Role types
type Role = 'owner' | 'manager' | 'finance' | 'supplier' | 'viewer';

interface Permission {
  id: string;
  label: string;
  description: string;
  roles: Role[];
}

// Permission definitions
const PERMISSIONS: Permission[] = [
  { id: 'view_revenue', label: 'View Revenue', description: 'See revenue metrics and trends', roles: ['owner', 'manager', 'finance'] },
  { id: 'view_bookings', label: 'View Bookings', description: 'See booking statistics', roles: ['owner', 'manager', 'finance', 'supplier', 'viewer'] },
  { id: 'view_customers', label: 'View Customers', description: 'See customer data', roles: ['owner', 'manager', 'finance'] },
  { id: 'view_suppliers', label: 'View Suppliers', description: 'See supplier performance', roles: ['owner', 'manager'] },
  { id: 'view_costs', label: 'View Costs & Margins', description: 'See cost analysis', roles: ['owner', 'finance'] },
  { id: 'export_data', label: 'Export Data', description: 'Download reports', roles: ['owner', 'manager', 'finance'] },
  { id: 'edit_settings', label: 'Edit Settings', description: 'Modify dashboard settings', roles: ['owner'] },
];

// Dashboard components by role
const DASHBOARD_CONFIG: Record<Role, { title: string; icon: React.ReactNode; widgets: string[] }> = {
  owner: {
    title: 'Owner Dashboard',
    icon: <BarChart3 size={20} />,
    widgets: ['revenue', 'bookings', 'customers', 'suppliers', 'costs', 'ai_insights', 'export'],
  },
  manager: {
    title: 'Manager Dashboard',
    icon: <Users size={20} />,
    widgets: ['revenue', 'bookings', 'customers', 'suppliers', 'export'],
  },
  finance: {
    title: 'Finance Dashboard',
    icon: <DollarSign size={20} />,
    widgets: ['revenue', 'bookings', 'costs', 'export'],
  },
  supplier: {
    title: 'Supplier Dashboard',
    icon: <Building2 size={20} />,
    widgets: ['bookings', 'my_performance'],
  },
  viewer: {
    title: 'Viewer Dashboard',
    icon: <Eye size={20} />,
    widgets: ['bookings'],
  },
};

interface RoleDashboardProps {
  currentRole?: Role;
  onRoleChange?: (role: Role) => void;
}

export const RoleDashboard: React.FC<RoleDashboardProps> = ({ 
  currentRole = 'owner',
  onRoleChange 
}) => {
  const [selectedRole, setSelectedRole] = useState<Role>(currentRole);

  const handleRoleChange = (role: Role) => {
    setSelectedRole(role);
    onRoleChange?.(role);
  };

  const config = DASHBOARD_CONFIG[selectedRole];
  const userPermissions = PERMISSIONS.filter(p => p.roles.includes(selectedRole));

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur border-b border-stone-800">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {config.icon}
              <h1 className="text-xl font-bold text-stone-100">{config.title}</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={selectedRole}
              onChange={(e) => handleRoleChange(e.target.value as Role)}
              className="px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
            >
              <option value="owner">Owner</option>
              <option value="manager">Manager</option>
              <option value="finance">Finance</option>
              <option value="supplier">Supplier</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* Role Badge */}
        <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock size={16} className="text-stone-500" />
              <span className="text-sm text-stone-400">
                Viewing as: <span className="font-medium text-stone-200 capitalize">{selectedRole}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500">{userPermissions.length} permissions</span>
            </div>
          </div>
        </div>

        {/* Available Widgets */}
        <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-stone-100 mb-4">Available Dashboard Widgets</h3>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {config.widgets.map(widget => (
              <div key={widget} className="p-4 bg-stone-900/50 border border-stone-700 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  {widget === 'revenue' && <DollarSign size={18} className="text-emerald-400" />}
                  {widget === 'bookings' && <BarChart3 size={18} className="text-blue-400" />}
                  {widget === 'customers' && <Users size={18} className="text-purple-400" />}
                  {widget === 'suppliers' && <Building2 size={18} className="text-amber-400" />}
                  {widget === 'costs' && <DollarSign size={18} className="text-rose-400" />}
                  {widget === 'ai_insights' && <BarChart3 size={18} className="text-purple-400" />}
                  {widget === 'export' && <Download size={18} className="text-stone-400" />}
                  {widget === 'my_performance' && <BarChart3 size={18} className="text-emerald-400" />}
                  <span className="font-medium text-stone-200 capitalize">{widget.replace('_', ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Permissions List */}
        <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-stone-100 mb-4">Role Permissions</h3>
          <div className="space-y-3">
            {PERMISSIONS.map(perm => {
              const hasAccess = perm.roles.includes(selectedRole);
              return (
                <div
                  key={perm.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    hasAccess ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-stone-900/50 border border-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {hasAccess ? (
                      <div className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded bg-stone-700 flex items-center justify-center">
                        <span className="text-stone-500 text-xs">✗</span>
                      </div>
                    )}
                    <div>
                      <p className={`font-medium ${hasAccess ? 'text-stone-100' : 'text-stone-500'}`}>
                        {perm.label}
                      </p>
                      <p className="text-xs text-stone-500">{perm.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {perm.roles.map(role => (
                      <span
                        key={role}
                        className={`px-2 py-0.5 rounded text-xs capitalize ${
                          role === selectedRole
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-stone-700 text-stone-400'
                        }`}
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Role Access Matrix */}
        <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-stone-100 mb-4">Access Matrix</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-700">
                  <th className="text-left text-xs font-medium text-stone-500 uppercase px-4 py-2">Permission</th>
                  {(['owner', 'manager', 'finance', 'supplier', 'viewer'] as Role[]).map(role => (
                    <th key={role} className="text-center text-xs font-medium text-stone-500 uppercase px-4 py-2 capitalize">
                      {role}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERMISSIONS.map(perm => (
                  <tr key={perm.id} className="border-b border-stone-700/50">
                    <td className="px-4 py-3 text-stone-300">{perm.label}</td>
                    {(['owner', 'manager', 'finance', 'supplier', 'viewer'] as Role[]).map(role => (
                      <td key={role} className="px-4 py-3 text-center">
                        {perm.roles.includes(role) ? (
                          <span className="text-emerald-400">✓</span>
                        ) : (
                          <span className="text-stone-600">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RoleDashboard;
