import { useEffect, useState } from 'react';
import './admin.css';
import adminAPI from '../../services/adminAPI';
import { useLanguage } from '../../contexts/LanguageContext';
import { t } from '../../utils/translations';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { language } = useLanguage();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllUsers();
      setUsers(data || []);
    } catch (err) {
      setError(err.message || t(language, 'adminUsers.loadError'));
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
    return 'ACTIVE';
  };

  const handleUpdateRole = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to "${newRole}"?`)) {
      return;
    }
    try {
      await adminAPI.updateUserRole(userId, newRole);
      alert('Role updated successfully!');
      loadUsers();
    } catch (err) {
      alert('Error: ' + (err.message || 'Unable to update role'));
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="table-card">
          <div className="table-title">{t(language, 'adminUsers.title')}</div>
          <div style={{ padding: '20px', textAlign: 'center' }}>{t(language, 'common.loading')}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="table-card">
          <div className="table-title">{t(language, 'adminUsers.title')}</div>
          <div style={{ padding: '20px', color: '#b91c1c' }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
        <div className="table-card">
          <div className="table-title">
            {t(language, 'adminUsers.title')} ({users.length})
          </div>
        <div className="table">
          <div className="row head" data-columns="6">
            <div>ID</div>
            <div>{t(language, 'adminUsers.fullName')}</div>
            <div>Email</div>
            <div>{t(language, 'adminUsers.role')}</div>
            <div>{t(language, 'adminUsers.status')}</div>
            <div>{t(language, 'adminUsers.actions')}</div>
          </div>
          {users.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>{t(language, 'common.noData')}</div>
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
                      <option value="User">{t(language, 'adminUsers.roleUser')}</option>
                      <option value="Host">{t(language, 'adminUsers.roleHost')}</option>
                      <option value="Admin">{t(language, 'adminUsers.roleAdmin')}</option>
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


