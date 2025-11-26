import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './admin.css';
import adminAPI from '../../services/adminAPI';
import { useLanguage } from '../../contexts/LanguageContext';
import { t } from '../../utils/translations';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingPosts: 0,
    revenue: 0,
    pendingReports: 0
  });
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

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
          <div className="kpi-title">{t(language, 'adminDashboard.totalUsers')}</div>
          <div className="kpi-value">{loading ? '...' : formatNumber(stats.totalUsers)}</div>
        </div>
        <div
          className="kpi-card clickable"
          onClick={() => navigate('/admin/posts')}
        >
          <div className="kpi-title">{t(language, 'adminDashboard.pendingPosts')}</div>
          <div className="kpi-value">{loading ? '...' : formatNumber(stats.pendingPosts)}</div>
          {stats.pendingPosts > 0 && (
            <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '4px' }}>
              {t(language, 'adminDashboard.clickToView')}
            </div>
          )}
        </div>
        <div className="kpi-card">
          <div className="kpi-title">{t(language, 'adminDashboard.monthRevenue')}</div>
          <div className="kpi-value">{loading ? '...' : `₫${formatNumber(stats.revenue)}`}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">{t(language, 'adminDashboard.unresolvedReports')}</div>
          <div className="kpi-value">{loading ? '...' : formatNumber(stats.pendingReports)}</div>
        </div>
      </div>
      <div className="chart-grid">
        <div className="chart-card">{t(language, 'adminDashboard.revenueByMonth')}</div>
        <div className="chart-card">{t(language, 'adminDashboard.userGrowth')}</div>
      </div>
      <div className="table-card">
        <div className="table-title">{t(language, 'adminDashboard.latestReports')}</div>
        <div className="table">
          <div className="row head">
            <div>ID</div>
            <div>{t(language, 'adminDashboard.reporter')}</div>
            <div>{t(language, 'adminDashboard.reason')}</div>
            <div>{t(language, 'adminDashboard.date')}</div>
            <div>{t(language, 'adminDashboard.status')}</div>
          </div>
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            {t(language, 'adminDashboard.noReports')}
          </div>
        </div>
      </div>
    </div>
  );
}


