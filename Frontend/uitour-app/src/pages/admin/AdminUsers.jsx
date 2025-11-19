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
          <div className="row head"><div>ID</div><div>Họ tên</div><div>Email</div><div>Vai trò</div><div>Trạng thái</div></div>
          {users.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Không có dữ liệu</div>
          ) : (
            users.map(u => (
              <div key={u.UserID || u.userID || u.id} className="row">
                <div>{u.UserID || u.userID || u.id}</div>
                <div>{u.FullName || u.fullName || 'N/A'}</div>
                <div>{u.Email || u.email || 'N/A'}</div>
                <div>{formatRole(u.Role || u.role)}</div>
                <div>{getStatus(u)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}


