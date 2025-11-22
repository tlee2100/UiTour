import { useEffect, useState } from 'react';
import './admin.css';
import adminAPI from '../../services/adminAPI';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllUsers();
      setUsers(data || []);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const formatRole = (role) => {
    if (!role) return 'GUEST';
    return role.toUpperCase();
  };

  const getStatus = (user) => {
    // You can add logic here to determine status based on user data
    return 'HOẠT ĐỘNG';
  };

  const handleUpdateRole = async (userId, newRole) => {
    if (!window.confirm(`Bạn có chắc muốn đổi role của user này thành "${newRole}"?`)) {
      return;
    }
    try {
      await adminAPI.updateUserRole(userId, newRole);
      alert('Đã cập nhật role thành công!');
      loadUsers();
    } catch (err) {
      alert('Lỗi: ' + (err.message || 'Không thể cập nhật role'));
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="table-card">
          <div className="table-title">Danh sách người dùng</div>
          <div style={{ padding: '20px', textAlign: 'center' }}>Đang tải...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="table-card">
          <div className="table-title">Danh sách người dùng</div>
          <div style={{ padding: '20px', color: '#b91c1c' }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="table-card">
        <div className="table-title">Danh sách người dùng ({users.length})</div>
        <div className="table">
          <div className="row head" data-columns="6"><div>ID</div><div>Họ tên</div><div>Email</div><div>Vai trò</div><div>Trạng thái</div><div>Thao tác</div></div>
          {users.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Không có dữ liệu</div>
          ) : (
            users.map(u => {
              const userId = u.UserID || u.userID || u.id;
              const currentRole = formatRole(u.Role || u.role);
              return (
                <div key={userId} className="row" data-columns="6">
                  <div>{userId}</div>
                  <div>{u.FullName || u.fullName || 'N/A'}</div>
                  <div>{u.Email || u.email || 'N/A'}</div>
                  <div>
                    <select
                      value={u.Role || u.role || 'User'}
                      onChange={(e) => handleUpdateRole(userId, e.target.value)}
                      style={{
                        padding: '4px 8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="User">User</option>
                      <option value="Host">Host</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  <div>{getStatus(u)}</div>
                  <div>-</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}


