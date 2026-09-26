import React, { useEffect, useState } from 'react';
import { userService } from '../../services/userService';
import { User } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';
import { Mail, Phone, Users } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const { success, error } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const data = await userService.getAll();
        setUsers(data);
      } catch (err) {
        console.error('Failed to load users', err);
        error('Không thể tải danh sách người dùng.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [error]);

  const handleRoleChange = async (userId: number, role: 'ADMIN' | 'CUSTOMER') => {
    try {
      setUpdatingUserId(userId);
      const updatedUser = await userService.updateRole(userId, role);
      setUsers((current) =>
        current.map((user) => (user.id === updatedUser.id ? updatedUser : user)),
      );
      success('Đã cập nhật vai trò người dùng.');
    } catch (err) {
      console.error('Failed to update user role', err);
      error('Không thể cập nhật vai trò người dùng.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <h1 style={{ fontSize: '1.6rem', marginBottom: '4px' }}>Quản lý người dùng</h1>
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
                <th>Tài khoản</th>
                <th>Họ và tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Vai trò</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{user.id}</span>
                  </td>
                  <td>
                    <strong>{user.username}</strong>
                  </td>
                  <td>{user.fullName}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={14} color="var(--text-muted)" />
                      {user.email}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={14} color="var(--text-muted)" />
                      {user.phone || '—'}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Badge variant={user.role === 'ADMIN' ? 'delivered' : 'primary'}>
                        {user.role}
                      </Badge>
                      <select
                        className="form-select"
                        value={user.role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER'}
                        disabled={updatingUserId === user.id}
                        onChange={(event) =>
                          handleRoleChange(user.id, event.target.value as 'ADMIN' | 'CUSTOMER')
                        }
                        aria-label={`Vai trò của ${user.username}`}
                        style={{ width: '130px' }}
                      >
                        <option value="CUSTOMER">CUSTOMER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </div>
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