// AdminDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./admin.css";
import adminAPI from "../../services/adminAPI";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";
import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingPosts: 0,
    revenue: 0,
    pendingReports: 0
  });

  const [charts, setCharts] = useState({
    revenue: [],
    userGrowth: []
  });

  const months = useMemo(
    () => ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    []
  );

  const buildMonthData = (monthlyArr, valueKey) => {
    return months.map((m, idx) => ({
      month: m,
      [valueKey]: Number(monthlyArr?.[idx] ?? 0),
    }));
  };

  const formatNumber = (num) => new Intl.NumberFormat("vi-VN").format(num);

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);

      const year = new Date().getFullYear();

      // ✅ Đồng bộ pending với AdminPosts: dùng luôn endpoint pending
      const [
        users,
        pendingProps,
        pendingTours,
        revenueRes,
        growthRes,
      ] = await Promise.all([
        adminAPI.getAllUsers().catch(() => []),
        adminAPI.getPendingProperties().catch(() => []),
        adminAPI.getPendingTours().catch(() => []),
        adminAPI.getRevenueByMonth(year).catch(() => ({ monthly: [] })),
        adminAPI.getUserGrowth(year).catch(() => ({ monthly: [] })),
      ]);

      const pendingPosts = (pendingProps?.length || 0) + (pendingTours?.length || 0);

      setStats({
        totalUsers: (users || []).length,
        pendingPosts,
        revenue: 0,        // TODO: nếu bạn muốn tính revenue KPI từ transaction, mình hướng dẫn tiếp
        pendingReports: 0  // TODO
      });

      setCharts({
        revenue: buildMonthData(revenueRes.monthly, "revenue"),
        userGrowth: buildMonthData(growthRes.monthly, "users"),
      });
    } catch (err) {
      console.error("Failed to load stats:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      {/* KPI */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-title">{t(language, "adminDashboard.totalUsers")}</div>
          <div className="kpi-value">{loading ? "..." : formatNumber(stats.totalUsers)}</div>
        </div>

        <div className="kpi-card clickable" onClick={() => navigate("/admin/posts")}>
          <div className="kpi-title">{t(language, "adminDashboard.pendingPosts")}</div>
          <div className="kpi-value">{loading ? "..." : formatNumber(stats.pendingPosts)}</div>
          {!loading && stats.pendingPosts > 0 && (
            <div style={{ fontSize: 12, color: "#f59e0b", marginTop: 4 }}>
              {t(language, "adminDashboard.clickToView")}
            </div>
          )}
        </div>

        <div className="kpi-card">
          <div className="kpi-title">{t(language, "adminDashboard.monthRevenue")}</div>
          <div className="kpi-value">{loading ? "..." : `₫${formatNumber(stats.revenue)}`}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">{t(language, "adminDashboard.unresolvedReports")}</div>
          <div className="kpi-value">{loading ? "..." : formatNumber(stats.pendingReports)}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="chart-grid">
        {/* Revenue */}
        <div className="chart-card" style={{ padding: 16 }}>
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div style={{ fontWeight: 600, color: "#111827" }}>
              {t(language, "adminDashboard.revenueByMonth")}
            </div>

            {loading ? (
              <div style={{ color: "#9ca3af" }}>{t(language, "common.loading")}</div>
            ) : (
              <div style={{ width: "100%" }}>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={charts.revenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* User growth */}
        <div className="chart-card" style={{ padding: 16 }}>
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div style={{ fontWeight: 600, color: "#111827" }}>
              {t(language, "adminDashboard.userGrowth")}
            </div>

            {loading ? (
              <div style={{ color: "#9ca3af" }}>{t(language, "common.loading")}</div>
            ) : (
              <div style={{ width: "100%" }}>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={charts.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="users" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-card">
        <div className="table-title">{t(language, "adminDashboard.latestReports")}</div>
        <div className="table">
          <div className="row head">
            <div>ID</div>
            <div>{t(language, "adminDashboard.reporter")}</div>
            <div>{t(language, "adminDashboard.reason")}</div>
            <div>{t(language, "adminDashboard.date")}</div>
            <div>{t(language, "adminDashboard.status")}</div>
          </div>

          <div style={{ padding: 20, textAlign: "center", color: "#666" }}>
            {t(language, "adminDashboard.noReports")}
          </div>
        </div>
      </div>
    </div>
  );
}
