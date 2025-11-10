import { useEffect, useMemo, useState } from 'react';
import './ProfilePage.css';
import mockAPI from '../services/mockAPI';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

export default function ProfileEditPage() {
  const { profile, dispatch } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState(profile || null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = profile || await mockAPI.getUserProfile(1);
        if (mounted) {
          setForm(data);
          if (!profile) dispatch({ type: 'SET_PROFILE', payload: data });
        }
      } catch (err) {
        if (mounted) setError(err.message || 'Không thể tải hồ sơ');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const initial = useMemo(() => (form?.displayName?.charAt(0) || 'U').toUpperCase(), [form]);

  const update = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const toggleVisitedEnabled = () => {
    setForm(prev => ({ ...prev, visitedTagsEnabled: !prev?.visitedTagsEnabled }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const saved = await mockAPI.saveUserProfile(form);
      dispatch({ type: 'SET_PROFILE', payload: saved });
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
        <section className="profile-section">
          <div className="profile-card">
            <div className="profile-avatar-large">{initial}</div>
            <div className="profile-name-role">
              <input
                value={form.displayName || ''}
                onChange={e => update('displayName', e.target.value)}
                placeholder="Tên hiển thị"
                style={{ fontSize: 22, fontWeight: 600, border: '1px solid #eee', borderRadius: 8, padding: '8px 10px' }}
              />
              <div style={{ color: '#666', marginTop: 6 }}>
                {form.email || 'email@example.com'}
              </div>
            </div>
          </div>
        </section>

        <section className="profile-section">
          <div className="profile-completion-title">Giới thiệu bản thân</div>
          <textarea
            value={form.about || ''}
            onChange={e => update('about', e.target.value)}
            placeholder="Viết nội dung thú vị và ấn tượng"
            style={{ width: '100%', minHeight: 120, border: '1px dashed #ccc', borderRadius: 12, padding: 12 }}
          />
        </section>

        <section className="profile-section">
          <div className="profile-completion-title">Nơi tôi từng đến</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <label style={{ fontWeight: 600 }}>Hiển thị:</label>
            <input type="checkbox" checked={!!form.visitedTagsEnabled} onChange={toggleVisitedEnabled} />
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {(form.visitedTags || []).map((t, idx) => (
              <input
                key={idx}
                value={t}
                onChange={e => {
                  const v = e.target.value;
                  setForm(prev => {
                    const arr = [...(prev.visitedTags || [])];
                    arr[idx] = v;
                    return { ...prev, visitedTags: arr };
                  });
                }}
                style={{ border: '1px solid #eee', borderRadius: 20, padding: '8px 12px', minWidth: 160 }}
              />
            ))}
          </div>
        </section>

        <section className="profile-section">
          <div className="profile-completion-title">Sở thích của tôi</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {(form.interests || []).map((it, idx) => (
              <input
                key={idx}
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
            ))}
            <button
              className="profile-primary-btn"
              style={{ background: '#f1f1f1', color: '#333' }}
              onClick={() => setForm(prev => ({ ...prev, interests: [...(prev.interests || []), ''] }))}
            >
              + Thêm sở thích
            </button>
          </div>
        </section>

        {!!error && (
          <div className="profile-section" style={{ color: '#c00' }}>{error}</div>
        )}

        <div className="profile-section" style={{ display: 'flex', gap: 12 }}>
          <button className="profile-primary-btn" onClick={() => navigate(-1)} style={{ background: '#eee', color: '#333' }}>
            Hủy
          </button>
          <button className="profile-primary-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Hoàn tất'}
          </button>
        </div>
      </main>
    </div>
  );
}


