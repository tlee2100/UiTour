// src/pages/ProfileEditPage.jsx
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

  const normalizeImageUrl = (rawUrl) => {
    if (!rawUrl || typeof rawUrl !== 'string') return '';
    const trimmed = rawUrl.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    if (trimmed.startsWith('data:image')) return trimmed;
    if (trimmed.startsWith('/')) return `http://localhost:5069${trimmed}`;
    return `http://localhost:5069/${trimmed}`;
  };

  const normalizeToForm = (u = {}, p = null) => {
    const fullName = u.fullName ?? u.FullName ?? p?.displayName ?? '';
    const email = u.email ?? u.Email ?? p?.email ?? '';
    const about = u.userAbout ?? u.UserAbout ?? u.about ?? p?.about ?? '';

    // ✅ AVATAR đúng field DB/BE
    const avatar = u.avatar ?? u.Avatar ?? '';

    const interestsRaw = u.interests ?? u.Interests;
    const interestsArr = Array.isArray(interestsRaw)
      ? interestsRaw
      : (typeof interestsRaw === 'string'
          ? interestsRaw.split(',').map(s => s.trim()).filter(Boolean)
          : (Array.isArray(p?.interests) ? p.interests : []));

    const ageRaw = u.age ?? u.Age;
    const ageValue = (typeof ageRaw === 'number' && ageRaw > 0) ? ageRaw : (p?.age ?? '');

    const gender = u.gender ?? u.Gender ?? p?.gender ?? '';
    const nationality = u.nationality ?? u.Nationality ?? p?.nationality ?? '';

    return {
      displayName: fullName,
      email,
      about,
      interests: interestsArr,
      visitedTagsEnabled: !!p?.visitedTagsEnabled,
      visitedTags: Array.isArray(p?.visitedTags) ? p.visitedTags : [],
      age: ageValue,
      gender,
      nationality,
      avatar, // ✅
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

        // Backend bạn chắc chắn có GET /api/user/{id}
        const core = await authAPI.getUserById(userId);

        if (!mounted) return;
        const draft = normalizeToForm(core, profile);
        setForm(draft);

        dispatch({
          type: 'SET_PROFILE',
          payload: {
            displayName: draft.displayName,
            about: draft.about,
            interests: draft.interests,
            email: draft.email,
            age: draft.age,
            gender: draft.gender,
            nationality: draft.nationality,
            avatar: draft.avatar,
          },
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
    () => (form?.displayName?.trim()?.charAt(0) || 'U').toUpperCase(),
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

  const handleSave = async () => {
    if (!user || !(user.UserID ?? user.userID)) {
      setError(t(language, 'profile.missingLoginInfoEdit'));
      return;
    }

    setSaving(true);
    setError('');

    try {
      const userId = user.UserID ?? user.userID;

      // 1) update
      await authAPI.updateUserProfile(userId, form);

      // 2) fetch lại user vì backend đang trả {message}
      const fresh = await authAPI.getUserById(userId);

      const nextForm = normalizeToForm(fresh, form);
      setForm(nextForm);

      dispatch({
        type: 'SET_PROFILE',
        payload: {
          displayName: nextForm.displayName,
          about: nextForm.about,
          interests: nextForm.interests,
          email: nextForm.email,
          age: nextForm.age,
          gender: nextForm.gender,
          nationality: nextForm.nationality,
          avatar: nextForm.avatar,
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
    return (
      <div className="profile-section" style={{ padding: 16 }}>
        {t(language, 'profile.loadingProfile')}
      </div>
    );
  }

  return (
    <div className="profile-page">
      <aside className="profile-sidebar">
        <h1 className="profile-title">{t(language, 'profile.myProfile')}</h1>
      </aside>

      <div className="profile-divider" />

      <main className="profile-main">
        {/* Avatar + upload */}
        <section className="profile-section">
          <div className="profile-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {form.avatar ? (
                <img
                  src={normalizeImageUrl(form.avatar)}
                  alt="avatar"
                  className="profile-avatar-large"
                  style={{ objectFit: 'cover' }}
                  onError={(e) => { e.currentTarget.src = ''; }}
                />
              ) : (
                <div className="profile-avatar-large">{initial}</div>
              )}

              <div>
                <div className="profile-display-name" style={{ fontSize: 20, fontWeight: 700 }}>
                  {form.displayName || t(language, 'profile.user')}
                </div>
                {form.email && <div style={{ color: '#666', marginTop: 4 }}>{form.email}</div>}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <label className="profile-primary-btn" style={{ background: '#f1f1f1', color: '#333' }}>
                + {t(language, 'profile.uploadAvatar') || 'Upload Avatar'}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    try {
                      setSaving(true);
                      const url = await authAPI.uploadImage(file); // "/uploads/images/xxx.png"
                      update('avatar', url); // ✅ QUAN TRỌNG
                    } catch (err) {
                      setError(err.message || 'Upload avatar failed');
                    } finally {
                      setSaving(false);
                      e.target.value = '';
                    }
                  }}
                />
              </label>

              {form.avatar && (
                <button
                  className="profile-primary-btn"
                  style={{ background: '#ffecec', color: '#b40000' }}
                  type="button"
                  onClick={() => update('avatar', '')}
                >
                  {t(language, 'profile.removeAvatar') || 'Remove'}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* About */}
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

        {/* Personal info */}
        <section className="profile-section">
          <div className="profile-completion-title">{t(language, 'profile.personalInformation')}</div>
          <div className="info-grid info-grid-edit">
            <label>
              <strong>{t(language, 'profile.age')}</strong>
              <input
                type="number"
                min="0"
                value={form.age ?? ''}
                onChange={e => update('age', e.target.value === '' ? '' : Number(e.target.value))}
                placeholder={t(language, 'profile.agePlaceholder')}
              />
            </label>

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

        {/* Interests */}
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
                  type="button"
                >
                  {t(language, 'profile.delete')}
                </button>
              </div>
            ))}
            <button
              className="profile-primary-btn"
              style={{ background: '#f1f1f1', color: '#333' }}
              onClick={addInterest}
              type="button"
            >
              + {t(language, 'profile.addInterest')}
            </button>
          </div>
        </section>

        {!!error && (
          <div className="profile-section" style={{ color: '#c00' }}>
            {error}
          </div>
        )}

        <div className="profile-section" style={{ display: 'flex', gap: 12 }}>
          <button
            className="profile-primary-btn"
            onClick={() => navigate(-1)}
            style={{ background: '#eee', color: '#333' }}
            type="button"
          >
            {t(language, 'profile.cancel')}
          </button>

          <button
            className="profile-primary-btn"
            onClick={handleSave}
            disabled={saving}
            type="button"
          >
            {saving ? t(language, 'profile.saving') : t(language, 'profile.done')}
          </button>
        </div>
      </main>
    </div>
  );
}
