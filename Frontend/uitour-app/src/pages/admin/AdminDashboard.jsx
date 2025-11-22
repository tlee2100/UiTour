import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './admin.css';
import adminAPI from '../../services/adminAPI';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingPosts: 0,
    revenue: 0,
    pendingReports: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [users, properties, tours] = await Promise.all([
        adminAPI.getAllUsers().catch(() => []),
        adminAPI.getAllProperties().catch(() => []),
        adminAPI.getAllTours().catch(() => [])
      ]);

      const pendingProperties = (properties || []).filter(p => !p.Active && !p.active).length;
      const pendingTours = (tours || []).filter(t => !t.Active && !t.active).length;
      const pendingPosts = pendingProperties + pendingTours;

      setStats({
        totalUsers: (users || []).length,
        pendingPosts,
        revenue: 0, // Will need transaction data
        pendingReports: 0 // Will need reports data
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  return (
    <div className="admin-page">
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-title">Tổng người dùng</div>
          <div className="kpi-value">{loading ? '...' : formatNumber(stats.totalUsers)}</div>
        </div>
        <div 
          className="kpi-card" 
          onClick={() => navigate('/admin/posts')}
          style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <div className="kpi-title">Bài đăng chờ duyệt</div>
          <div className="kpi-value">{loading ? '...' : formatNumber(stats.pendingPosts)}</div>
          {stats.pendingPosts > 0 && (
            <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '4px' }}>
              Click để xem chi tiết →
            </div>
          )}
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Doanh thu tháng này</div>
          <div className="kpi-value">{loading ? '...' : `₫${formatNumber(stats.revenue)}`}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Báo cáo chưa xử lý</div>
          <div className="kpi-value">{loading ? '...' : formatNumber(stats.pendingReports)}</div>
        </div>
      </div>
      <div className="chart-grid">
        <div className="chart-card">Doanh thu theo tháng (mock)</div>
        <div className="chart-card">Tăng trưởng người dùng (mock)</div>
      </div>
      <div className="table-card">
        <div className="table-title">Báo cáo mới nhất</div>
        <div className="table">
          <div className="row head"><div>ID</div><div>Người báo cáo</div><div>Lý do</div><div>Ngày</div><div>Trạng thái</div></div>
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Chưa có báo cáo</div>
        </div>
      </div>
    </div>
  );
}


