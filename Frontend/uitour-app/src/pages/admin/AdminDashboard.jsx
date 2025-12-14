import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './admin.css';
import adminAPI from '../../services/adminAPI';
import { useLanguage } from '../../contexts/LanguageContext';
import { t } from '../../utils/translations';
import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";


export default function AdminDashboard() {
  const navigate = useNavigate();
  const [charts, setCharts] = useState({ revenue: [], userGrowth: [] });
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingPosts: 0,
    revenue: 0,
    pendingReports: 0
  });

  const buildMonthData = (monthlyArr, valueKey) => {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return months.map((m, idx) => ({
      month: m,
      [valueKey]: Number(monthlyArr?.[idx] ?? 0),
    }));
  };


  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const year = new Date().getFullYear();

    const [users, properties, tours, revenueRes, growthRes] = await Promise.all([
      adminAPI.getAllUsers().catch(() => []),
      adminAPI.getAllProperties().catch(() => []),
      adminAPI.getAllTours().catch(() => []),
      adminAPI.getRevenueByMonth(year).catch(() => ({ monthly: [] })),
      adminAPI.getUserGrowth(year).catch(() => ({ monthly: [] })),
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

      setCharts({
        revenue: buildMonthData(revenueRes.monthly, "revenue"),
        userGrowth: buildMonthData(growthRes.monthly, "users"),
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
        <div className="chart-card" style={{ padding: 16 }}>
          {loading ? (
            t(language, "adminDashboard.revenueByMonth")
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={charts.revenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-card" style={{ padding: 16 }}>
          {loading ? (
            t(language, "adminDashboard.userGrowth")
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={charts.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="users" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
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


