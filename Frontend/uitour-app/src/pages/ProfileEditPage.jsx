import { useEffect, useMemo, useState } from 'react';
import './ProfilePage.css';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import authAPI from '../services/authAPI';

export default function ProfileEditPage() {
  const { user, profile, dispatch } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Chuẩn hoá dữ liệu từ backend -> form
  const normalizeToForm = (u = {}, p = null) => {
    // Ưu tiên dùng dữ liệu thật từ backend; nếu context profile có sẵn thì merge
    const fullName = u.fullName ?? u.FullName ?? p?.displayName ?? '';
    const email = u.email ?? u.Email ?? p?.email ?? '';
    const about = u.userAbout ?? u.about ?? p?.about ?? '';

    // interests từ backend có thể là string "A, B, C"
    const interestsArr = Array.isArray(u.interests)
      ? u.interests
      : (typeof u.interests === 'string'
          ? u.interests.split(',').map(s => s.trim()).filter(Boolean)
          : (Array.isArray(p?.interests) ? p.interests : []));

    // age: backend trả 0 khi chưa có -> convert thành ''
    const ageValue =
      typeof u.age === 'number' && u.age > 0
        ? u.age
        : (typeof p?.age === 'number' && p.age > 0 ? p.age : '');

    return {
      displayName: fullName,
      email,
      about,
      interests: interestsArr,
      visitedTagsEnabled: !!p?.visitedTagsEnabled, // nếu BE chưa có, vẫn giữ UI state
      visitedTags: Array.isArray(p?.visitedTags) ? p.visitedTags : [],
      age: ageValue,
      gender: u.gender ?? p?.gender ?? '',
      nationality: u.nationality ?? p?.nationality ?? '',
    };
  };

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        if (!user || !(user.UserID ?? user.userID)) {
          setError('Thiếu thông tin đăng nhập. Vui lòng đăng nhập lại.');
          return;
        }
        setLoading(true);
        setError('');

        const userId = user.UserID ?? user.userID;

        // 1) cố lấy profile thật (nếu BE có route /{id}/profile)
        // 2) nếu 404 hoặc rỗng, fallback lấy user base /{id}
        let core = null;
        try {
          core = await authAPI.getUserProfile(userId);
        } catch (_) {
          // im lặng fallback
        }
        if (!core || typeof core !== 'object') {
          core = await authAPI.getUserById(userId);
        }

        if (!mounted) return;
        const draft = normalizeToForm(core, profile);
        setForm(draft);

        // đồng bộ context profile cho các màn khác (View)
        dispatch({
          type: 'SET_PROFILE',
          payload: {
            displayName: draft.displayName,
            about: draft.about,
            interests: draft.interests,
            visitedTagsEnabled: draft.visitedTagsEnabled,
            visitedTags: draft.visitedTags,
            email: draft.email,
            age: draft.age,
            gender: draft.gender,
            nationality: draft.nationality,
          }
        });
      } catch (err) {
        if (mounted) setError(err.message || 'Không thể tải hồ sơ');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initial = useMemo(
    () => (form?.displayName?.charAt(0) || 'U').toUpperCase(),
    [form]
  );

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const addInterest = () =>
    setForm(prev => ({ ...prev, interests: [...(prev?.interests || []), ''] }));

  const removeInterest = (idx) =>
    setForm(prev => {
      const arr = [...(prev?.interests || [])];
      arr.splice(idx, 1);
      return { ...prev, interests: arr };
    });

  const toggleVisitedEnabled = () => {
    setForm(prev => ({ ...prev, visitedTagsEnabled: !prev?.visitedTagsEnabled }));
  };

  const addVisitedTag = () =>
    setForm(prev => ({ ...prev, visitedTags: [...(prev?.visitedTags || []), ''] }));

  const removeVisitedTag = (idx) =>
    setForm(prev => {
      const arr = [...(prev?.visitedTags || [])];
      arr.splice(idx, 1);
      return { ...prev, visitedTags: arr };
    });

  const handleSave = async () => {
    if (!user || !(user.UserID ?? user.userID)) {
      setError('Thiếu thông tin đăng nhập. Vui lòng đăng nhập lại.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const userId = user.UserID ?? user.userID;

      // Gọi backend để cập nhật
      const saved = await authAPI.updateUserProfile(userId, form);

      // Chuẩn hoá dữ liệu BE trả về để đồng bộ lại form + context
      const nextForm = normalizeToForm(saved, form);
      setForm(nextForm);

      dispatch({
        type: 'SET_PROFILE',
        payload: {
          displayName: nextForm.displayName,
          about: nextForm.about,
          interests: nextForm.interests,
          visitedTagsEnabled: nextForm.visitedTagsEnabled,
          visitedTags: nextForm.visitedTags,
          email: nextForm.email,
          age: nextForm.age,
          gender: nextForm.gender,
          nationality: nextForm.nationality,
        },
      });

      navigate('/profile');
    } catch (err) {
      setError(err.message || 'Lưu hồ sơ thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return <div className="profile-section" style={{ padding: 16 }}>Đang tải hồ sơ...</div>;
  }

  return (
    <div className="profile-page">
      <aside className="profile-sidebar">
        <h1 className="profile-title">Hồ sơ của tôi</h1>
      </aside>

      <div className="profile-divider" />

      <main className="profile-main">
        {/* Card avatar + tên hiển thị */}
        <section className="profile-section">
          <div className="profile-card">
            <div className="profile-avatar-large">{initial}</div>
            <div className="profile-name-role">
              <input
                value={form.displayName || ''}
                onChange={e => update('displayName', e.target.value)}
                placeholder="Tên hiển thị"
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  border: '1px solid #eee',
                  borderRadius: 8,
                  padding: '8px 10px'
                }}
              />
              <div style={{ color: '#666', marginTop: 6 }}>
                {form.email || 'email@example.com'}
              </div>
            </div>
          </div>
        </section>

        {/* Giới thiệu bản thân */}
        <section className="profile-section">
          <div className="profile-completion-title">Giới thiệu bản thân</div>
          <textarea
            value={form.about || ''}
            onChange={e => update('about', e.target.value)}
            placeholder="Viết nội dung thú vị và ấn tượng"
            style={{
              width: '100%',
              minHeight: 120,
              border: '1px dashed #ccc',
              borderRadius: 12,
              padding: 12
            }}
          />
        </section>

        {/* Nơi tôi từng đến */}
        <section className="profile-section">
          <div className="profile-completion-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span>Nơi tôi từng đến</span>
            <label style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={!!form.visitedTagsEnabled}
                onChange={toggleVisitedEnabled}
              />
              <span>Hiển thị</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
            {(form.visitedTags || []).map((t, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  value={t}
                  onChange={e => {
                    const v = e.target.value;
                    setForm(prev => {
                      const arr = [...(prev.visitedTags || [])];
                      arr[idx] = v;
                      return { ...prev, visitedTags: arr };
                    });
                  }}
                  style={{
                    border: '1px solid #eee',
                    borderRadius: 20,
                    padding: '8px 12px',
                    minWidth: 160
                  }}
                />
                <button
                  className="profile-primary-btn"
                  style={{ background: '#ffecec', color: '#b40000' }}
                  onClick={() => removeVisitedTag(idx)}
                >
                  Xoá
                </button>
              </div>
            ))}
            <button
              className="profile-primary-btn"
              style={{ background: '#f1f1f1', color: '#333' }}
              onClick={addVisitedTag}
            >
              + Thêm nơi đã đến
            </button>
          </div>
        </section>

        {/* Thông tin cá nhân: Tuổi / Giới tính / Quốc tịch */}
        <section className="profile-section">
          <div className="profile-completion-title">Thông tin cá nhân</div>
          <div className="info-grid info-grid-edit">
            {/* Tuổi */}
            <label>
              <strong>Tuổi</strong>
              <input
                type="number"
                min="0"
                value={form.age ?? ''}
                onChange={e => {
                  const v = e.target.value;
                  update('age', v === '' ? '' : Number(v));
                }}
                placeholder="VD: 21"
              />
            </label>

            {/* Giới tính */}
            <label>
              <strong>Giới tính</strong>
              <select
                value={form.gender ?? ''}
                onChange={e => update('gender', e.target.value)}
              >
                <option value="">-- Chọn giới tính --</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </label>

            {/* Quốc tịch */}
            <label>
              <strong>Quốc tịch</strong>
              <input
                type="text"
                value={form.nationality ?? ''}
                onChange={e => update('nationality', e.target.value)}
                placeholder="VD: Việt Nam"
              />
            </label>
          </div>
        </section>

        {/* Sở thích của tôi */}
        <section className="profile-section">
          <div className="profile-completion-title">Sở thích của tôi</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
            {(form.interests || []).map((it, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  value={it}
                  onChange={e => {
                    const v = e.target.value;
                    setForm(prev => {
                      const arr = [...(prev.interests || [])];
                      arr[idx] = v;
                      return { ...prev, interests: arr };
                    });
                  }}
                  style={{ border: '1px dashed #bbb', borderRadius: 24, padding: '8px 14px' }}
                />
                <button
                  className="profile-primary-btn"
                  style={{ background: '#ffecec', color: '#b40000' }}
                  onClick={() => removeInterest(idx)}
                >
                  Xoá
                </button>
              </div>
            ))}
            <button
              className="profile-primary-btn"
              style={{ background: '#f1f1f1', color: '#333' }}
              onClick={addInterest}
            >
              + Thêm sở thích
            </button>
          </div>
        </section>

        {/* Lỗi nếu có */}
        {!!error && (
          <div className="profile-section" style={{ color: '#c00' }}>{error}</div>
        )}

        {/* Nút hành động */}
        <div className="profile-section" style={{ display: 'flex', gap: 12 }}>
          <button
            className="profile-primary-btn"
            onClick={() => navigate(-1)}
            style={{ background: '#eee', color: '#333' }}
          >
            Hủy
          </button>
          <button
            className="profile-primary-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Đang lưu...' : 'Hoàn tất'}
          </button>
        </div>
      </main>
    </div>
  );
}
