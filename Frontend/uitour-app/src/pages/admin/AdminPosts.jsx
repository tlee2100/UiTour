import { useEffect, useState } from 'react';
import './admin.css';
import adminAPI from '../../services/adminAPI';

export default function AdminPosts() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllProperties();
      setProperties(data || []);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách bài đăng');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price, currency = 'USD') => {
    if (!price) return 'N/A';
    const formatted = new Intl.NumberFormat('vi-VN').format(price);
    return currency === 'USD' ? `$${formatted}` : `₫${formatted}`;
  };

  const getStatus = (property) => {
    if (property.Active === false || property.active === false) return 'CHƯA DUYỆT';
    return 'ĐÃ DUYỆT';
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="table-card">
          <div className="table-title">Danh sách bài đăng</div>
          <div style={{ padding: '20px', textAlign: 'center' }}>Đang tải...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="table-card">
          <div className="table-title">Danh sách bài đăng</div>
          <div style={{ padding: '20px', color: '#b91c1c' }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="table-card">
        <div className="table-title">Danh sách bài đăng ({properties.length})</div>
        <div className="table">
          <div className="row head"><div>ID</div><div>Tiêu đề</div><div>Giá</div><div>Chủ host</div><div>Trạng thái</div></div>
          {properties.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Không có dữ liệu</div>
          ) : (
            properties.map(p => (
              <div key={p.PropertyID || p.propertyID || p.id} className="row">
                <div>{p.PropertyID || p.propertyID || p.id}</div>
                <div>{p.ListingTitle || p.listingTitle || 'N/A'}</div>
                <div>{formatPrice(p.Price || p.price, p.Currency || p.currency)}/đêm</div>
                <div>Host #{p.HostID || p.hostID || 'N/A'}</div>
                <div>{getStatus(p)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}


