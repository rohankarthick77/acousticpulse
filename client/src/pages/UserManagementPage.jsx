import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import {
  Users,
  Shield,
  UserCheck,
  Search,
  CheckCircle2,
  Mail,
  Phone,
  Briefcase
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton.jsx';

export const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { isAdmin } = useAuth();
  const toast = useToast();

  const loadUsers = async () => {
    try {
      const res = await api.users.getAll(roleFilter);
      setUsers(res.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.users.updateRole(userId, { role: newRole });
      toast.success(`User role updated to ${newRole}`);
      await loadUsers();
    } catch (err) {
      toast.error('Failed to update user role: ' + err.message);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.department && u.department.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>User & Officer Directory</h1>
            <span className="badge badge-safe">Role Authorization</span>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Manage administrative personnel, field enforcement officers, and registered urban citizens.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card" style={{ padding: '14px 18px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input"
            placeholder="Search users by name, email, department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '38px' }}
          />
        </div>

        <select
          className="select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{ flex: '0 1 180px' }}
        >
          <option value="">All Roles</option>
          <option value="ADMIN">Administrator</option>
          <option value="AUTHORITY">Authority / Officer</option>
          <option value="CITIZEN">Citizen</option>
        </select>
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingSkeleton height="300px" count={1} />
      ) : (
        <div className="glass-card" style={{ padding: '20px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '10px 12px' }}>User / Officer</th>
                <th style={{ padding: '10px 12px' }}>Email</th>
                <th style={{ padding: '10px 12px' }}>Department / Badge</th>
                <th style={{ padding: '10px 12px' }}>Assigned Jobs</th>
                <th style={{ padding: '10px 12px' }}>Current Role</th>
                <th style={{ padding: '10px 12px' }}>Role Management</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-medium)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          color: 'var(--accent-cyan)'
                        }}
                      >
                        {u.name[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{u.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ID: {u.id.substring(0, 8)}...</div>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                    {u.email}
                  </td>

                  <td style={{ padding: '12px', fontSize: '0.8rem' }}>
                    <div>{u.department || 'Urban Resident'}</div>
                    {u.badgeNumber && (
                      <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                        Badge: {u.badgeNumber}
                      </span>
                    )}
                  </td>

                  <td style={{ padding: '12px', fontFamily: 'var(--font-mono)' }}>
                    {u._count?.assignedJobs || 0} active cases
                  </td>

                  <td style={{ padding: '12px' }}>
                    <span className={`badge ${u.role === 'ADMIN' ? 'badge-critical' : u.role === 'AUTHORITY' ? 'badge-high' : 'badge-neutral'}`}>
                      {u.role}
                    </span>
                  </td>

                  <td style={{ padding: '12px' }}>
                    <select
                      className="select"
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      style={{ padding: '4px 8px', fontSize: '0.8rem', width: '130px' }}
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="AUTHORITY">AUTHORITY</option>
                      <option value="CITIZEN">CITIZEN</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
