import { useEffect, useState } from 'react';
import './admin.css';
import adminAPI from '../../services/adminAPI';
import { useLanguage } from '../../contexts/LanguageContext';
import { t } from '../../utils/translations';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import ToastContainer from '../../components/ToastContainer';
import { useToast } from '../../hooks/useToast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { language } = useLanguage();
  const [roleConfirm, setRoleConfirm] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { toasts, success, error: showError, removeToast } = useToast();

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

  const handleUpdateRole = (userId, newRole) => {
    const user = users.find(u => (u.UserID || u.userID || u.id) === userId);
    setRoleConfirm({
      userId,
      newRole,
      userName: user?.FullName || user?.fullName || `User #${userId}`
    });
  };

  const confirmUpdateRole = async () => {
    if (!roleConfirm) return;
    
    try {
      await adminAPI.updateUserRole(roleConfirm.userId, roleConfirm.newRole);
      success('Role updated successfully!');
      loadUsers();
      setRoleConfirm(null);
    } catch (err) {
      showError('Error: ' + (err.message || 'Unable to update role'));
      setRoleConfirm(null);
    }
  };

  const handleDeleteUser = (user) => {
    const userId = user?.UserID || user?.userID || user?.id;
    setDeleteConfirm({
      userId,
      userName: user?.FullName || user?.fullName || `User #${userId}`
    });
  };

  const confirmDeleteUser = async () => {
    if (!deleteConfirm || deleting) return;
    try {
      setDeleting(true);
      await adminAPI.deleteUser(deleteConfirm.userId);
      success(t(language, 'adminUsers.deleteSuccess'));
      setDeleteConfirm(null);
      loadUsers();
    } catch (err) {
      showError(err.message || t(language, 'adminUsers.deleteError'));
      setDeleteConfirm(null);
    } finally {
      setDeleting(false);
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
                  <div>
                    <button
                      className="ghost small"
                      onClick={() => handleDeleteUser(u)}
                      disabled={deleting}
                      style={{ color: '#b91c1c', borderColor: '#fecaca' }}
                    >
                      {t(language, 'common.delete')}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Role Update Confirmation Modal */}
      {roleConfirm && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setRoleConfirm(null)}
          onConfirm={confirmUpdateRole}
          title="Change User Role"
          message={`Are you sure you want to change this user's role to "${roleConfirm.newRole}"?`}
          details={{
            'User': roleConfirm.userName,
            'New Role': roleConfirm.newRole
          }}
          confirmText="Confirm"
          cancelText="Cancel"
          type="warning"
        />
      )}

      {deleteConfirm && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => !deleting && setDeleteConfirm(null)}
          onConfirm={confirmDeleteUser}
          title={t(language, 'adminUsers.deleteTitle')}
          message={t(language, 'adminUsers.deleteMessage').replace('{name}', deleteConfirm.userName)}
          warning={t(language, 'adminUsers.deleteWarning')}
          details={{
            'User': deleteConfirm.userName,
            'User ID': deleteConfirm.userId
          }}
          confirmText={t(language, 'common.delete')}
          cancelText={t(language, 'common.cancel')}
          type="danger"
          loading={deleting}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}


