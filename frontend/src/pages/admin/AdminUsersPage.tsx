import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { User } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Users, Mail, Phone, Calendar } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const data = await userService.getAll();
        setUsers(data);
      } catch (err) {
        console.error('Failed to load users', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <h1 style={{ fontSize: '1.6rem', marginBottom: '4px' }}>Quản lý Người dùng & Khách hàng</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
          Danh sách tài khoản độc giả và quản trị viên ({users.length} tài khoản)
        </p>
      </div>

      {isLoading ? (
        <div className="card">
          <TableSkeleton rows={4} />
        </div>
      ) : users.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>Tài khoản (Username)</th>
                <th>Họ và tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Vai trò (Role)</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{u.id}</span>
                  </td>
                  <td>
                    <strong>{u.username}</strong>
                  </td>
                  <td>{u.fullName}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={14} color="var(--text-muted)" />
                      {u.email}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={14} color="var(--text-muted)" />
                      {u.phone || '—'}
                    </div>
                  </td>
                  <td>
                    <Badge variant={u.role === 'ADMIN' ? 'delivered' : 'primary'}>
                      {u.role}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={<Users size={32} />}
          title="Chưa có người dùng nào"
          description="Người dùng đăng ký qua trang web sẽ xuất hiện tại danh sách này."
        />
      )}
    </div>
  );
};
