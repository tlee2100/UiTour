import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './admin.css';
import adminAPI from '../../services/adminAPI';
import { Icon } from '@iconify/react';
import { useApp } from '../../contexts/AppContext';

export default function AdminPosts() {
  const navigate = useNavigate();
  const { user, token } = useApp();
  const [properties, setProperties] = useState([]);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'approved'
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    // Check if user is admin before loading
    console.log('AdminPosts - User from context:', user);
    console.log('AdminPosts - Token from context:', token ? 'Exists' : 'Missing');
    console.log('AdminPosts - User Role:', user?.Role || user?.role || 'No role');
    
    if (!token) {
      setError('Please log in to continue');
      setLoading(false);
      return;
    }
    
    if (!user) {
      setError('User information not found');
      setLoading(false);
      return;
    }
    
    const userRole = user?.Role || user?.role || '';
    if (userRole?.toUpperCase() !== 'ADMIN') {
      setError(`You do not have Admin privileges. Current role: "${userRole || 'None'}". Please log in again after setting Admin role in the database.`);
      setLoading(false);
      return;
    }
    
    loadData();
  }, [filter, user, token]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      if (filter === 'pending') {
        const [pendingProps, pendingTours] = await Promise.all([
          adminAPI.getPendingProperties().catch((err) => {
            console.error('Error loading pending properties:', err);
            return [];
          }),
          adminAPI.getPendingTours().catch((err) => {
            console.error('Error loading pending tours:', err);
            return [];
          })
        ]);
        console.log('Pending properties:', pendingProps);
        console.log('Pending tours:', pendingTours);
        setProperties(pendingProps || []);
        setTours(pendingTours || []);
      } else {
        const [allProps, allTours] = await Promise.all([
          adminAPI.getAllProperties().catch(() => []),
          adminAPI.getAllTours().catch(() => [])
        ]);
        let props = allProps || [];
        let toursData = allTours || [];
        
        if (filter === 'approved') {
          props = props.filter(p => p.Active || p.active);
          toursData = toursData.filter(t => t.Active || t.active);
        }
        
        setProperties(props);
        setTours(toursData);
      }
    } catch (err) {
      setError(err.message || 'Unable to load posts list');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (item, type) => {
    try {
      const itemId = getItemId(item);
      console.log(`Attempting to approve ${type} with ID:`, itemId);
      
      if (type === 'property') {
        await adminAPI.approveProperty(itemId);
      } else {
        await adminAPI.approveTour(itemId);
      }
      alert('Approved successfully!');
      loadData();
      setShowModal(false);
      setSelectedItem(null);
    } catch (err) {
      console.error('Approve error:', err);
      const errorMsg = err.message || 'Unable to approve';
      
      if (errorMsg.includes('Unauthorized') || errorMsg.includes('Forbidden')) {
        alert(`Error: ${errorMsg}\n\nPlease:\n1. Check if user has Admin role in database\n2. Log out and log in again to get a new token`);
      } else {
        alert('Error: ' + errorMsg);
      }
    }
  };

  const handleReject = async () => {
    if (!selectedItem || rejecting) return;
    
    // Validation: Cảnh báo nếu không có lý do (nhưng vẫn cho phép reject)
    if (!rejectReason || rejectReason.trim().length === 0) {
      const confirmReject = window.confirm(
        'You have not entered a rejection reason. Do you want to continue rejecting this post?'
      );
      if (!confirmReject) {
        return; // User cancelled
      }
    }
    
    // Final confirmation
    const finalConfirm = window.confirm(
      `Are you sure you want to reject the post "${getItemTitle(selectedItem)}"?\n\n` +
      `After rejection, the post will not be displayed on the website.`
    );
    if (!finalConfirm) {
      return;
    }
    
    try {
      setRejecting(true);
      const itemId = getItemId(selectedItem);
      const type = getItemType(selectedItem);
      
      console.log(`Attempting to reject ${type} with ID:`, itemId);
      console.log('Selected item:', selectedItem);
      console.log('Item type:', type);
      console.log('Item ID:', itemId);
      console.log('Reject reason:', rejectReason || '(No reason provided)');
      
      // Validate itemId exists
      if (!itemId) {
        throw new Error(`Invalid ${type} ID. Cannot reject ${type}. Item ID is missing.`);
      }
      
      // Double-check the type before making API call
      if (type === 'property') {
        // For property, we can use itemId directly even if PropertyID field doesn't exist
        // because getItemId() should have extracted it correctly
        await adminAPI.rejectProperty(itemId, rejectReason || null);
      } else if (type === 'tour') {
        // For tour, we can use itemId directly even if TourID field doesn't exist
        // because getItemId() should have extracted it correctly
        await adminAPI.rejectTour(itemId, rejectReason || null);
      } else {
        throw new Error(`Unknown item type: ${type}. Cannot reject.`);
      }
      
      alert('Post rejected successfully!');
      loadData(); // Reload to update the list
      setShowModal(false);
      setSelectedItem(null);
      setRejectReason('');
    } catch (err) {
      console.error('Reject error:', err);
      let errorMsg = err.message || 'Unable to reject';
      
      // Parse JSON error message if it's a stringified JSON
      try {
        if (errorMsg.startsWith('{') || errorMsg.startsWith('[')) {
          const parsed = JSON.parse(errorMsg);
          errorMsg = parsed.error || parsed.message || errorMsg;
        }
      } catch (parseErr) {
        // Not JSON, use as is
      }
      
      if (errorMsg.includes('Unauthorized') || errorMsg.includes('Forbidden')) {
        alert(`Error: ${errorMsg}\n\nPlease:\n1. Check if user has Admin role in database\n2. Log out and log in again to get a new token`);
      } else if (errorMsg.includes('not found') || errorMsg.includes('Tour not found') || errorMsg.includes('Property not found')) {
        alert(`Error: ${errorMsg}\n\nThis post may have been deleted or does not exist in the database.\nPlease refresh the page to update the list.`);
        // Auto reload data to refresh the list
        loadData();
      } else {
        alert('Error: ' + errorMsg);
      }
    } finally {
      setRejecting(false);
    }
  };

  const openRejectModal = (item) => {
    console.log('Opening reject modal for item:', item);
    console.log('Item type:', getItemType(item));
    console.log('Item ID:', getItemId(item));
    console.log('PropertyID:', item.PropertyID || item.propertyID);
    console.log('TourID:', item.TourID || item.tourID);
    setSelectedItem(item);
    setShowModal(true);
    setRejectReason('');
  };

  const handleDelete = async (item) => {
    const itemId = getItemId(item);
    const type = getItemType(item);
    const itemTitle = getItemTitle(item);
    
    const confirmDelete = window.confirm(
      `Are you sure you want to PERMANENTLY DELETE this ${type === 'property' ? 'property' : 'tour'}?\n\n` +
      `Title: ${itemTitle}\n` +
      `ID: ${itemId}\n\n` +
      `⚠️ WARNING: This action cannot be undone! The post will be completely removed from the database.`
    );
    
    if (!confirmDelete) {
      return;
    }
    
    try {
      setDeleting(true);
      setDeletingId(itemId);
      
      console.log(`Attempting to delete ${type} with ID:`, itemId);
      
      if (type === 'property') {
        await adminAPI.deleteProperty(itemId);
      } else if (type === 'tour') {
        await adminAPI.deleteTour(itemId);
      } else {
        throw new Error(`Unknown item type: ${type}`);
      }
      
      alert(`${type === 'property' ? 'Property' : 'Tour'} deleted successfully!`);
      loadData(); // Reload to update the list
    } catch (err) {
      console.error('Delete error:', err);
      let errorMsg = err.message || 'Unable to delete';
      
      // Parse JSON error message if it's a stringified JSON
      try {
        if (errorMsg.startsWith('{') || errorMsg.startsWith('[')) {
          const parsed = JSON.parse(errorMsg);
          errorMsg = parsed.error || parsed.message || errorMsg;
        }
      } catch (parseErr) {
        // Not JSON, use as is
      }
      
      if (errorMsg.includes('Unauthorized') || errorMsg.includes('Forbidden')) {
        alert(`Error: ${errorMsg}\n\nPlease:\n1. Check if user has Admin role in database\n2. Log out and log in again to get a new token`);
      } else {
        alert('Error: ' + errorMsg);
      }
    } finally {
      setDeleting(false);
      setDeletingId(null);
    }
  };

  const formatPrice = (price, currency = 'USD') => {
    if (!price) return 'N/A';
    const formatted = new Intl.NumberFormat('vi-VN').format(price);
    return currency === 'USD' ? `$${formatted}` : `₫${formatted}`;
  };

  const getStatus = (item) => {
    // Check both Active and active (case variations)
    const activeValue = item.Active !== undefined ? item.Active : item.active;
    const isActive = activeValue === true;
    return isActive ? 'APPROVED' : 'PENDING';
  };

  const getItemType = (item) => {
    // Check explicit type field first (from mapping in allItems)
    if (item.type) {
      return item.type;
    }
    // Fallback: check for PropertyID or TourID
    if (item.PropertyID !== undefined || item.propertyID !== undefined) {
      return 'property';
    }
    if (item.TourID !== undefined || item.tourID !== undefined) {
      return 'tour';
    }
    // Default to property if cannot determine
    return 'property';
  };

  const getItemTitle = (item) => {
    return item.ListingTitle || item.TourName || item.listingTitle || item.tourName || 'N/A';
  };

  const getItemId = (item) => {
    // Try to get ID based on type first
    const type = getItemType(item);
    if (type === 'property') {
      return item.PropertyID || item.propertyID || item.id;
    } else {
      return item.TourID || item.tourID || item.id;
    }
  };

  const allItems = [
    ...properties.map(p => ({ ...p, type: 'property' })),
    ...tours.map(t => ({ ...t, type: 'tour' }))
  ];

  if (loading) {
    return (
      <div className="admin-page">
        <div className="table-card">
          <div className="table-title">Posts list</div>
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="table-card">
          <div className="table-title">Posts list</div>
          <div style={{ padding: '20px', color: '#b91c1c' }}>
            <div style={{ marginBottom: '12px', fontWeight: 600 }}>Error: {error}</div>
            {error.includes('Unauthorized') || error.includes('Forbidden') ? (
              <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                <p>Please check:</p>
                <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
                  <li>Have you logged in?</li>
                  <li>Does your user have "Admin" role in the database?</li>
                  <li>Is the token still valid? (Try logging out and logging in again)</li>
                </ul>
                <p style={{ marginTop: '12px', fontSize: '12px', color: '#999' }}>
                  Để set role Admin: UPDATE [User] SET Role = 'Admin' WHERE UserID = [YourUserID]
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          className={filter === 'all' ? 'primary' : 'ghost'}
          onClick={() => setFilter('all')}
          style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
        >
          All ({allItems.length})
        </button>
        <button
          className={filter === 'pending' ? 'primary' : 'ghost'}
          onClick={() => setFilter('pending')}
          style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
        >
          Pending ({properties.filter(p => {
            const active = p.Active !== undefined ? p.Active : p.active;
            return active !== true;
          }).length + tours.filter(t => {
            const active = t.Active !== undefined ? t.Active : t.active;
            return active !== true;
          }).length})
        </button>
        <button
          className={filter === 'approved' ? 'primary' : 'ghost'}
          onClick={() => setFilter('approved')}
          style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
        >
          Approved ({properties.filter(p => {
            const active = p.Active !== undefined ? p.Active : p.active;
            return active === true;
          }).length + tours.filter(t => {
            const active = t.Active !== undefined ? t.Active : t.active;
            return active === true;
          }).length})
        </button>
      </div>

      <div className="table-card">
        <div className="table-title">
          Posts list ({allItems.length})
          <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#666', marginLeft: '8px' }}>
            ({properties.length} Properties, {tours.length} Tours)
          </span>
        </div>
        <div className="table">
          <div className="row head" data-columns="7">
            <div>Type</div>
            <div>ID</div>
            <div>Title</div>
            <div>Price</div>
            <div>Host</div>
            <div>Status</div>
            <div>Actions</div>
          </div>
          {allItems.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No data</div>
          ) : (
            allItems.map(item => {
              // Check if item is pending: Active must be explicitly false or null/undefined
              const activeValue = item.Active !== undefined ? item.Active : item.active;
              const isPending = activeValue !== true; // Pending if not explicitly true
              const itemId = getItemId(item);
              return (
                <div key={`${item.type}-${itemId}`} className="row" data-columns="7">
                  <div>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px',
                      background: item.type === 'property' ? '#e3f2fd' : '#f3e5f5',
                      color: item.type === 'property' ? '#1976d2' : '#7b1fa2'
                    }}>
                      {item.type === 'property' ? '🏠' : '🎭'}
                    </span>
                  </div>
                  <div>{itemId}</div>
                  <div>{getItemTitle(item)}</div>
                  <div>
                    {formatPrice(item.Price || item.price, item.Currency || item.currency)}
                    {item.type === 'property' ? '/đêm' : '/người'}
                  </div>
                  <div>Host #{item.HostID || item.hostID || 'N/A'}</div>
                  <div>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      background: isPending ? '#fff3cd' : '#d4edda',
                      color: isPending ? '#856404' : '#155724'
                    }}>
                      {getStatus(item)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    {isPending && (
                      <>
                        <button
                          onClick={() => handleApprove(item, item.type)}
                          style={{
                            padding: '4px 8px',
                            background: '#28a745',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                          title="Duyệt"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => openRejectModal(item)}
                          style={{
                            padding: '4px 8px',
                            background: '#dc3545',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                          title="Từ chối"
                        >
                          ✕
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(item)}
                      disabled={deleting && deletingId === itemId}
                      style={{
                        padding: '4px 8px',
                        background: deleting && deletingId === itemId ? '#9ca3af' : '#6b7280',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: deleting && deletingId === itemId ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                        marginLeft: isPending ? '0' : '4px'
                      }}
                      title="Delete permanently"
                    >
                      {deleting && deletingId === itemId ? '...' : '🗑️'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showModal && selectedItem && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(2px)'
          }}
          onClick={(e) => {
            // Close modal when clicking outside
            if (e.target === e.currentTarget) {
              setShowModal(false);
              setSelectedItem(null);
              setRejectReason('');
            }
          }}
        >
          <div 
            style={{
              background: '#fff',
              padding: '24px',
              borderRadius: '12px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              animation: 'modalSlideIn 0.2s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              marginBottom: '16px',
              paddingBottom: '16px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>
                ⚠️
              </div>
              <h3 style={{ margin: 0, color: '#dc3545' }}>Từ chối bài đăng</h3>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ 
                background: '#f9fafb', 
                padding: '12px', 
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}>
                  <strong>Loại:</strong> {getItemType(selectedItem) === 'property' ? '🏠 Property' : '🎭 Tour'}
                </p>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}>
                  <strong>ID:</strong> {getItemId(selectedItem)}
                </p>
                <p style={{ margin: 0, fontSize: '14px', color: '#111827', fontWeight: 600 }}>
                  <strong>Tiêu đề:</strong> {getItemTitle(selectedItem)}
                </p>
              </div>
              
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: 600,
                color: '#374151'
              }}>
                Lý do từ chối <span style={{ color: '#9ca3af', fontWeight: 'normal' }}>(tùy chọn)</span>:
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  resize: 'vertical',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  lineHeight: '1.5'
                }}
                placeholder="Enter rejection reason for this post... (e.g., Inappropriate content, missing information, policy violation...)"
                autoFocus
              />
              {!rejectReason || rejectReason.trim().length === 0 ? (
                <p style={{ 
                  margin: '8px 0 0 0', 
                  fontSize: '12px', 
                  color: '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span>ℹ️</span> Optional, but recommended to enter a reason so the host knows what to fix
                </p>
              ) : null}
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'flex-end',
              paddingTop: '16px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedItem(null);
                  setRejectReason('');
                }}
                style={{
                  padding: '10px 20px',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#e5e7eb'}
                onMouseOut={(e) => e.target.style.background = '#f3f4f6'}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={rejecting}
                style={{
                  padding: '10px 20px',
                  background: rejecting ? '#9ca3af' : '#dc3545',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: rejecting ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => {
                  if (!rejecting) {
                    e.target.style.background = '#b91c1c';
                  }
                }}
                onMouseOut={(e) => {
                  if (!rejecting) {
                    e.target.style.background = '#dc3545';
                  }
                }}
              >
                {rejecting ? (
                  <>
                    <span style={{ 
                      display: 'inline-block',
                      width: '14px',
                      height: '14px',
                      border: '2px solid #fff',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }}></span>
                    Processing...
                  </> 
                ) : (
                  'Confirm rejection'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


