import { useEffect, useMemo, useState } from 'react';
import './ProfilePage.css';
import { Icon } from '@iconify/react';
import { useApp } from '../contexts/AppContext';
import authAPI from '../services/authAPI';
import { useNavigate } from 'react-router-dom';
import mockAPI from '../services/mockAPI';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('about'); // about | trips | connections
  const { user, profile, dispatch } = useApp();
  const [userData, setUserData] = useState(user || null);
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
        const detail = await authAPI.getUserById(user.UserID);
        if (isMounted) setUserData(detail);
        if (!profile) {
          const mock = await mockAPI.getUserProfile(user.UserID);
          dispatch({ type: 'SET_PROFILE', payload: mock });
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Không thể tải thông tin người dùng');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchUser();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const displayName = userData?.FullName || userData?.fullName || 'Người dùng';
  const email = userData?.Email || userData?.email || '';
  const initial = useMemo(() => (displayName?.trim()?.charAt(0) || 'U').toUpperCase(), [displayName]);
  const profileInterests = profile?.interests || [];
  const hasProfileInfo = !!(
    profile &&
    (
      (profile.about && profile.about.trim().length > 0) ||
      (Array.isArray(profile.interests) && profile.interests.length > 0) ||
      (profile.displayName && profile.displayName.trim().length > 0)
    )
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
        {loading && (
          <div className="profile-section" style={{ padding: '16px' }}>
            Đang tải thông tin...
          </div>
        )}
        {!!error && (
          <div className="profile-section" style={{ padding: '16px', color: '#c00' }}>
            {error}
          </div>
        )}
        {activeTab === 'about' && (
          <section className="profile-section">
            <div className="profile-card">
              <div className="profile-avatar-large">{initial}</div>
              <div className="profile-name-role">
                <div className="profile-display-name">{displayName}</div>
                {email && <div style={{ color: '#666', fontSize: 14 }}>{email}</div>}
                <div className="profile-role">Khách</div>
              </div>
            </div>

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

            <div className="profile-subsection">
              <div className="profile-subtitle">
                <Icon icon="mdi:chat-outline" width="18" height="18" />
                <span>Đánh giá tôi đã viết</span>
              </div>
              <div className="profile-empty">Bạn chưa có đánh giá nào.</div>
            </div>

            {profileInterests.length > 0 && (
              <div className="profile-subsection" style={{ marginTop: 16 }}>
                <div className="profile-subtitle">Sở thích của tôi</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {profileInterests.map((it, idx) => (
                    <span key={idx} style={{ border: '1px solid #eee', borderRadius: 24, padding: '6px 12px', background: '#fafafa' }}>
                      {it}
                    </span>
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
              Sau khi thực hiện chuyến đi đầu tiên trên Airbnb, bạn sẽ tìm thấy các đặt chỗ trước đây của mình tại đây.
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


