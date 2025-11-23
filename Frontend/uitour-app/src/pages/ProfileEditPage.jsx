import { useEffect, useMemo, useState } from 'react';
import './ProfilePage.css';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import authAPI from '../services/authAPI';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../utils/translations';

export default function ProfileEditPage() {
  const { language } = useLanguage();
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
          setError(t(language, 'profile.missingLoginInfo'));
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
        if (mounted) setError(err.message || t(language, 'profile.unableToLoadProfile'));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

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
      setError(t(language, 'profile.missingLoginInfoEdit'));
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
      setError(err.message || t(language, 'profile.failedToSaveProfile'));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return <div className="profile-section" style={{ padding: 16 }}>{t(language, 'profile.loadingProfile')}</div>;
  }

  return (
    <div className="profile-page">
      <aside className="profile-sidebar">
        <h1 className="profile-title">{t(language, 'profile.myProfile')}</h1>
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
                placeholder={t(language, 'profile.displayName')}
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  border: '1px solid #eee',
                  borderRadius: 8,
                  padding: '8px 10px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--uitour-color)'}
                onBlur={(e) => e.target.style.borderColor = '#eee'}
              />
              {form.email && (
                <div style={{ color: '#666', marginTop: 6 }}>
                  {form.email}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Giới thiệu bản thân */}
        <section className="profile-section">
          <div className="profile-completion-title">{t(language, 'profile.introduceYourself')}</div>
          <textarea
            value={form.about || ''}
            onChange={e => update('about', e.target.value)}
            placeholder={t(language, 'profile.writeInterestingContent')}
            style={{
              width: '100%',
              minHeight: 120,
              border: '1px dashed #ccc',
              borderRadius: 12,
              padding: 12,
              resize: 'vertical',
              fontFamily: 'inherit',
              fontSize: 'inherit',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--uitour-color)'}
            onBlur={(e) => e.target.style.borderColor = '#ccc'}
          />
        </section>

        {/* Nơi tôi từng đến */}
        <section className="profile-section">
          <div className="profile-completion-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span>{t(language, 'profile.placesIVisited')}</span>
            <label style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={!!form.visitedTagsEnabled}
                onChange={toggleVisitedEnabled}
              />
              <span>{t(language, 'profile.show')}</span>
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
                    minWidth: 160,
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--uitour-color)'}
                  onBlur={(e) => e.target.style.borderColor = '#eee'}
                />
                <button
                  className="profile-primary-btn"
                  style={{ background: '#ffecec', color: '#b40000' }}
                  onClick={() => removeVisitedTag(idx)}
                >
                  {t(language, 'profile.delete')}
                </button>
              </div>
            ))}
            <button
              className="profile-primary-btn"
              style={{ background: '#f1f1f1', color: '#333' }}
              onClick={addVisitedTag}
            >
              + {t(language, 'profile.addPlaceVisited')}
            </button>
          </div>
        </section>

        {/* Thông tin cá nhân: Tuổi / Giới tính / Quốc tịch */}
        <section className="profile-section">
          <div className="profile-completion-title">{t(language, 'profile.personalInformation')}</div>
          <div className="info-grid info-grid-edit">
            {/* Age */}
            <label>
              <strong>{t(language, 'profile.age')}</strong>
              <input
                type="number"
                min="0"
                value={form.age ?? ''}
                onChange={e => {
                  const v = e.target.value;
                  update('age', v === '' ? '' : Number(v));
                }}
                placeholder={t(language, 'profile.agePlaceholder')}
              />
            </label>

            {/* Gender */}
            <label>
              <strong>{t(language, 'profile.gender')}</strong>
              <select
                value={form.gender ?? ''}
                onChange={e => update('gender', e.target.value)}
              >
                <option value="">{t(language, 'profile.selectGender')}</option>
                <option value="Male">{t(language, 'profile.male')}</option>
                <option value="Female">{t(language, 'profile.female')}</option>
                <option value="Other">{t(language, 'profile.other')}</option>
              </select>
            </label>

            {/* Nationality */}
            <label>
              <strong>{t(language, 'profile.nationality')}</strong>
              <input
                type="text"
                value={form.nationality ?? ''}
                onChange={e => update('nationality', e.target.value)}
                placeholder={t(language, 'profile.nationalityPlaceholder')}
              />
            </label>
          </div>
        </section>

        {/* Sở thích của tôi */}
        <section className="profile-section">
          <div className="profile-completion-title">{t(language, 'profile.myInterests')}</div>
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
                  style={{ 
                    border: '1px dashed #bbb', 
                    borderRadius: 24, 
                    padding: '8px 14px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--uitour-color)'}
                  onBlur={(e) => e.target.style.borderColor = '#bbb'}
                />
                <button
                  className="profile-primary-btn"
                  style={{ background: '#ffecec', color: '#b40000' }}
                  onClick={() => removeInterest(idx)}
                >
                  {t(language, 'profile.delete')}
                </button>
              </div>
            ))}
            <button
              className="profile-primary-btn"
              style={{ background: '#f1f1f1', color: '#333' }}
              onClick={addInterest}
            >
              + {t(language, 'profile.addInterest')}
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
            {t(language, 'profile.cancel')}
          </button>
          <button
            className="profile-primary-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? t(language, 'profile.saving') : t(language, 'profile.done')}
          </button>
        </div>
      </main>
    </div>
  );
}
