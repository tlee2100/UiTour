import { useEffect, useMemo, useState } from 'react';
import './ProfilePage.css';
import { Icon } from '@iconify/react';
import { useApp } from '../contexts/AppContext';
import authAPI from '../services/authAPI';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('about'); // about | trips | connections
  const { user, profile, dispatch } = useApp();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const goToHomeForBooking = () => navigate('/');

  useEffect(() => {
    let isMounted = true;
    async function fetchUser() {
      if (!user || !user.UserID) return;
      setLoading(true);
      setError('');
      try {
        const detail = await authAPI.getUserById(user.UserID);   // 🟢 lấy trực tiếp
        if (!isMounted) return;
        setUserData(detail);                                      // 🟢 set trực tiếp
        // đẩy vào context để các màn khác dùng (edit, v.v.)
        const displayNameCtx = detail?.fullName ?? detail?.FullName ?? '';
        const aboutCtx = detail?.userAbout ?? detail?.about ?? '';
        const interestsRaw = detail?.interests;
        const interestsCtx = Array.isArray(interestsRaw)
          ? interestsRaw
          : (typeof interestsRaw === 'string'
              ? interestsRaw.split(',').map(s => s.trim()).filter(Boolean)
              : []);
        dispatch({
          type: 'SET_PROFILE',
          payload: {
            displayName: displayNameCtx,
            about: aboutCtx,
            interests: interestsCtx,
          },
        });
      } catch (err) {
        if (isMounted) setError(err.message || 'Không thể tải thông tin người dùng');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchUser();
    return () => { isMounted = false; };
  }, [user, dispatch]);

  // ==== Lấy dữ liệu linh hoạt theo key hoa/thường (không normalize state) ====
  const displayName = userData?.fullName ?? userData?.FullName ?? 'Người dùng';
  const email = userData?.email ?? userData?.Email ?? '';
  const about = userData?.userAbout ?? userData?.about ?? '';
  const roleRaw = userData?.role ?? userData?.Role ?? 'Guest';
  const roleLabel = roleRaw === 'Host' ? 'Chủ nhà' : roleRaw === 'Admin' ? 'Quản trị' : 'Khách';
  const age = userData?.age ?? '';
  const gender = userData?.gender ?? '';
  const nationality = userData?.nationality ?? '';
  const avatarUrl = userData?.avatarUrl ?? userData?.avatar ?? userData?.profilePicture ?? '';

  const interestsRaw = userData?.interests;
  const interests = Array.isArray(interestsRaw)
    ? interestsRaw
    : (typeof interestsRaw === 'string'
        ? interestsRaw.split(',').map(s => s.trim()).filter(Boolean)
        : []);

  const initial = useMemo(
    () => (displayName?.trim()?.charAt(0) || 'U').toUpperCase(),
    [displayName]
  );

  const hasProfileInfo = !!(
    (about && about.trim()) ||
    interests.length > 0 ||
    (displayName && displayName.trim())
  );

  return (
    <div className="profile-page">
      {/* Sidebar */}
      <aside className="profile-sidebar">
        <h1 className="profile-title">Hồ sơ</h1>

        <nav className="profile-nav">
          <button
            className={`profile-nav-item ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            <span className="nav-icon nav-initial">{initial}</span>
            <span>Giới thiệu bản thân</span>
          </button>

          <button
            className={`profile-nav-item ${activeTab === 'trips' ? 'active' : ''}`}
            onClick={() => setActiveTab('trips')}
          >
            <Icon icon="mdi:suitcase" width="20" height="20" />
            <span>Chuyến đi trước đây</span>
          </button>

          <button
            className={`profile-nav-item ${activeTab === 'connections' ? 'active' : ''}`}
            onClick={() => setActiveTab('connections')}
          >
            <span className="nav-avatar-group">
              <span className="nav-avatar" />
              <span className="nav-avatar" />
            </span>
            <span>Kết nối</span>
          </button>
        </nav>
      </aside>

      {/* Divider */}
      <div className="profile-divider" />

      {/* Main */}
      <main className="profile-main">
        {loading && <div className="profile-section" style={{ padding: 16 }}>Đang tải thông tin...</div>}
        {!!error && <div className="profile-section" style={{ padding: 16, color: '#c00' }}>{error}</div>}

        {activeTab === 'about' && (
          <section className="profile-section">
            {/* Card thông tin cơ bản */}
            <div className="profile-card">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="avatar"
                  className="profile-avatar-large"
                  style={{ objectFit: 'cover' }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div className="profile-avatar-large">{initial}</div>
              )}
              <div className="profile-name-role">
                <div className="profile-display-name">{displayName}</div>
                {email && <div style={{ color: '#666', fontSize: 14 }}>{email}</div>}
                <div className="profile-role">{roleLabel}</div>
              </div>
            </div>

            {/* Hộp gợi ý hoàn tất hồ sơ */}
            <div className="profile-completion">
              <div className="profile-completion-title">Hoàn tất hồ sơ của bạn</div>
              <p className="profile-completion-text">
                Hồ sơ UiTour là một phần quan trọng của mọi lượt đặt. Hãy hoàn tất hồ sơ để giúp khách
                và các host khác hiểu hơn về bạn.
              </p>
              <button className="profile-primary-btn" onClick={() => navigate('/profile/edit')}>
                {hasProfileInfo ? 'Chỉnh sửa' : 'Bắt đầu'}
              </button>
            </div>

            {/* Giới thiệu */}
            <div className="profile-subsection">
              <div className="profile-subtitle">
                <Icon icon="mdi:chat-outline" width="18" height="18" />
                <span>Giới thiệu</span>
              </div>
              <div className="profile-empty">
                {about || 'Bạn chưa viết phần giới thiệu.'}
              </div>
            </div>

            {/* Thông tin cá nhân */}
            <div className="profile-subsection profile-subsection-info">
              <div className="profile-subtitle">
                <Icon icon="mdi:account-outline" width="18" height="18" />
                <span>Thông tin cá nhân</span>
              </div>
              <div className="info-grid">
                <div><strong>Tuổi:</strong> {age || 'Chưa cập nhật'}</div>
                <div><strong>Giới tính:</strong> {gender || 'Chưa cập nhật'}</div>
                <div><strong>Quốc tịch:</strong> {nationality || 'Chưa cập nhật'}</div>
              </div>
            </div>

            {/* Sở thích */}
            {interests.length > 0 && (
              <div className="profile-subsection" style={{ marginTop: 16 }}>
                <div className="profile-subtitle">Sở thích của tôi</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {interests.map((it, idx) => (
                    <span key={idx} className="interest-chip">{it}</span>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === 'trips' && (
          <section className="profile-empty-state">
            <div className="empty-emoji suitcase" />
            <p className="empty-text">
              Sau khi thực hiện chuyến đi đầu tiên, bạn sẽ tìm thấy các đặt chỗ trước đây của mình tại đây.
            </p>
            <button className="profile-primary-btn" onClick={goToHomeForBooking}>Đặt chuyến đi</button>
          </section>
        )}

        {activeTab === 'connections' && (
          <section className="profile-empty-state">
            <div className="empty-emoji people" />
            <p className="empty-text">
              Khi bạn tham gia trải nghiệm hoặc mời ai đó tham gia chuyến đi, bạn sẽ tìm thấy hồ sơ của những khách khác ở đây.
            </p>
            <button className="profile-primary-btn" onClick={goToHomeForBooking}>Đặt chuyến đi</button>
          </section>
        )}
      </main>
    </div>
  );
}
