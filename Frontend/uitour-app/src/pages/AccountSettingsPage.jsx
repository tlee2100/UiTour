import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './AccountSettingsPage.css';
import authAPI from '../services/authAPI';
import { useApp } from '../contexts/AppContext';

const sidebarItems = [
  { id: 'personal', label: 'Thông tin cá nhân' },
  { id: 'security', label: 'Đăng nhập và bảo mật' },
  { id: 'privacy', label: 'Quyền riêng tư', disabled: true },
  { id: 'notifications', label: 'Thông báo', disabled: true },
  { id: 'tax', label: 'Thuế', disabled: true },
  { id: 'payment', label: 'Thanh toán', disabled: true },
  { id: 'locale', label: 'Ngôn ngữ & loại tiền tệ', disabled: true },
  { id: 'business', label: 'Đi công tác', disabled: true },
];

const maskEmail = (email = '') => {
  if (!email) return 'Chưa cung cấp';
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const visible = local.slice(0, 1);
  return `${visible}${'*'.repeat(Math.max(local.length - 2, 2))}${local.slice(-1)}@${domain}`;
};

const initialModalState = null;

const normalizeUser = (payload = {}) => ({
  ...payload,
  UserID: payload.UserID ?? payload.userID ?? payload.id ?? null,
  FullName: payload.FullName ?? payload.fullName ?? '',
  Email: payload.Email ?? payload.email ?? '',
  Phone: payload.Phone ?? payload.phone ?? '',
  Nationality: payload.Nationality ?? payload.nationality ?? '',
  UserAbout: payload.UserAbout ?? payload.userAbout ?? '',
});

export default function AccountSettingsPage() {
  const { user, dispatch } = useApp();
  const [activeItem, setActiveItem] = useState('personal');
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState(null);
  const [modal, setModal] = useState(initialModalState);

  const isAuthenticated = !!user?.UserID;

  const refreshUser = async () => {
    if (!user?.UserID) return;
    setLoading(true);
    try {
      const data = await authAPI.getUserById(user.UserID);
      const normalized = normalizeUser(data);
      setUserDetails(normalized);
      dispatch({
        type: 'SET_USER',
        payload: { ...user, ...normalized },
      });
    } catch (error) {
      setBanner({ type: 'error', message: error.message || 'Không thể tải thông tin người dùng.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshUser();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.UserID]);

  const openModal = (type) => {
    if (!userDetails) return;
    if (type === 'profile') {
      setModal({
        type,
        title: 'Chỉnh sửa thông tin cá nhân',
        step: 'form',
        submitting: false,
        sendingOtp: false,
        otp: '',
        otpEmail: userDetails.Email,
        error: '',
        form: {
          fullName: userDetails.FullName,
          phone: userDetails.Phone ?? '',
          nationality: userDetails.Nationality ?? '',
        },
      });
    }
    if (type === 'email') {
      setModal({
        type,
        title: 'Cập nhật địa chỉ email',
        step: 'form',
        submitting: false,
        sendingOtp: false,
        otp: '',
        otpEmail: userDetails.Email,
        error: '',
        form: {
          email: '',
        },
      });
    }
    if (type === 'password') {
      setModal({
        type,
        title: 'Đổi mật khẩu',
        step: 'form',
        submitting: false,
        sendingOtp: false,
        otp: '',
        otpEmail: userDetails.Email,
        error: '',
        form: {
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        },
      });
    }
  };

  const closeModal = () => setModal(initialModalState);

  const handleSendOtp = async () => {
    if (!userDetails) return;
    setModal((prev) => ({ ...prev, sendingOtp: true, error: '' }));
    try {
      await authAPI.sendProfileOtp(userDetails.UserID);
      setModal((prev) => ({
        ...prev,
        sendingOtp: false,
        step: 'otp',
        otpEmail: userDetails.Email,
      }));
    } catch (error) {
      setModal((prev) => ({ ...prev, sendingOtp: false, error: error.message || 'Không thể gửi mã OTP.' }));
    }
  };

  const handleProfileSubmit = async () => {
    if (!modal || !userDetails) return;
    const { form, step } = modal;

    if (step === 'form') {
      if (!form.fullName?.trim()) {
        setModal((prev) => ({ ...prev, error: 'Tên không được để trống.' }));
        return;
      }
      if (form.phone && !/^[0-9+ ]{6,15}$/.test(form.phone)) {
        setModal((prev) => ({ ...prev, error: 'Số điện thoại không hợp lệ.' }));
        return;
      }
      await handleSendOtp();
      return;
    }

    if (step === 'otp') {
      if (!modal.otp?.trim()) {
        setModal((prev) => ({ ...prev, error: 'Vui lòng nhập mã OTP.' }));
        return;
      }
      setModal((prev) => ({ ...prev, submitting: true, error: '' }));
      try {
        await authAPI.verifyProfileOtp(userDetails.UserID, modal.otp);

        const promises = [];
        const profilePayload = {
          fullName: form.fullName,
          about: form.nationality,
          nationality: form.nationality,
        };

        if (
          form.fullName !== userDetails.FullName ||
          (form.nationality || '') !== (userDetails.Nationality || '')
        ) {
          promises.push(authAPI.updateUserProfile(userDetails.UserID, profilePayload));
        }

        if ((form.phone || '') !== (userDetails.Phone || '')) {
          promises.push(authAPI.updateUserPhone(userDetails.UserID, form.phone || ''));
        }

        if (promises.length === 0) {
          setModal((prev) => ({ ...prev, submitting: false, error: 'Không có thông tin nào thay đổi.' }));
          return;
        }

        await Promise.all(promises);
        await refreshUser();
        setBanner({ type: 'success', message: 'Đã cập nhật thông tin cá nhân.' });
        setModal((prev) => ({ ...prev, step: 'success', submitting: false }));
      } catch (error) {
        setModal((prev) => ({ ...prev, submitting: false, error: error.message || 'Không thể cập nhật thông tin.' }));
      }
    }
  };

  const handleEmailSubmit = async () => {
    if (!modal || !userDetails) return;
    const { form, step } = modal;

    if (step === 'form') {
      const email = form.email?.trim();
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regex.test(email || '')) {
        setModal((prev) => ({ ...prev, error: 'Email không hợp lệ.' }));
        return;
      }
      if (email === userDetails.Email) {
        setModal((prev) => ({ ...prev, error: 'Email mới phải khác email hiện tại.' }));
        return;
      }
      await handleSendOtp();
      return;
    }

    if (step === 'otp') {
      if (!modal.otp?.trim()) {
        setModal((prev) => ({ ...prev, error: 'Vui lòng nhập mã OTP.' }));
        return;
      }
      setModal((prev) => ({ ...prev, submitting: true, error: '' }));
      try {
        await authAPI.verifyProfileOtp(userDetails.UserID, modal.otp);
        await authAPI.updateUserEmail(userDetails.UserID, modal.form.email.trim());
        await refreshUser();
        setBanner({ type: 'success', message: 'Email đã được cập nhật.' });
        setModal((prev) => ({ ...prev, step: 'success', submitting: false }));
      } catch (error) {
        setModal((prev) => ({ ...prev, submitting: false, error: error.message || 'Không thể cập nhật email.' }));
      }
    }
  };

  const handlePasswordSubmit = async () => {
    if (!modal || !userDetails) return;
    const { form, step } = modal;

    if (step === 'form') {
      if (!form.currentPassword || !form.newPassword) {
        setModal((prev) => ({ ...prev, error: 'Vui lòng nhập đầy đủ thông tin.' }));
        return;
      }
      if (form.newPassword.length < 6) {
        setModal((prev) => ({ ...prev, error: 'Mật khẩu mới phải từ 6 ký tự.' }));
        return;
      }
      if (form.newPassword !== form.confirmPassword) {
        setModal((prev) => ({ ...prev, error: 'Xác nhận mật khẩu không khớp.' }));
        return;
      }
      await handleSendOtp();
      return;
    }

    if (step === 'otp') {
      if (!modal.otp?.trim()) {
        setModal((prev) => ({ ...prev, error: 'Vui lòng nhập mã OTP.' }));
        return;
      }
      setModal((prev) => ({ ...prev, submitting: true, error: '' }));
      try {
        await authAPI.verifyProfileOtp(userDetails.UserID, modal.otp);
        await authAPI.changePassword(
          userDetails.UserID,
          form.currentPassword,
          form.newPassword,
        );
        setBanner({ type: 'success', message: 'Đổi mật khẩu thành công.' });
        setModal((prev) => ({ ...prev, step: 'success', submitting: false }));
      } catch (error) {
        setModal((prev) => ({ ...prev, submitting: false, error: error.message || 'Không thể đổi mật khẩu.' }));
      }
    }
  };

  const renderModalBody = () => {
    if (!modal) return null;
    if (modal.type === 'profile') {
      return (
        <>
          {modal.step === 'form' && (
            <div className="acct-form-grid">
              <label>
                Tên pháp lý
                <input
                  type="text"
                  value={modal.form.fullName}
                  onChange={(e) => setModal((prev) => ({
                    ...prev,
                    form: { ...prev.form, fullName: e.target.value },
                    error: '',
                  }))}
                  className="acct-input"
                />
              </label>
              <label>
                Số điện thoại
                <input
                  type="text"
                  value={modal.form.phone}
                  onChange={(e) => setModal((prev) => ({
                    ...prev,
                    form: { ...prev.form, phone: e.target.value },
                    error: '',
                  }))}
                  className="acct-input"
                  placeholder="(+84) 900 000 000"
                />
              </label>
              <label>
                Quốc gia/Cư trú
                <input
                  type="text"
                  value={modal.form.nationality}
                  onChange={(e) => setModal((prev) => ({
                    ...prev,
                    form: { ...prev.form, nationality: e.target.value },
                    error: '',
                  }))}
                  className="acct-input"
                  placeholder="Vietnam"
                />
              </label>
            </div>
          )}
          {modal.step === 'otp' && (
            <div className="acct-otp-step">
              <p>Mã xác thực đã gửi tới <strong>{modal.otpEmail}</strong>.</p>
              <input
                type="text"
                value={modal.otp}
                onChange={(e) => setModal((prev) => ({ ...prev, otp: e.target.value, error: '' }))}
                className="acct-input"
                placeholder="Nhập mã OTP"
              />
              <button
                type="button"
                className="acct-link resend"
                onClick={() => handleSendOtp()}
                disabled={modal.sendingOtp}
              >
                {modal.sendingOtp ? 'Đang gửi...' : 'Gửi lại mã'}
              </button>
            </div>
          )}
        </>
      );
    }

    if (modal.type === 'email') {
      return (
        <>
          {modal.step === 'form' && (
            <div className="acct-form-grid">
              <label>
                Email mới
                <input
                  type="email"
                  value={modal.form.email}
                  onChange={(e) => setModal((prev) => ({
                    ...prev,
                    form: { ...prev.form, email: e.target.value },
                    error: '',
                  }))}
                  className="acct-input"
                  placeholder="example@email.com"
                />
              </label>
            </div>
          )}
          {modal.step === 'otp' && (
            <div className="acct-otp-step">
              <p>Mã xác thực đã gửi tới <strong>{modal.otpEmail}</strong>.</p>
              <input
                type="text"
                value={modal.otp}
                onChange={(e) => setModal((prev) => ({ ...prev, otp: e.target.value, error: '' }))}
                className="acct-input"
                placeholder="Nhập mã OTP"
              />
              <button
                type="button"
                className="acct-link resend"
                onClick={() => handleSendOtp()}
                disabled={modal.sendingOtp}
              >
                {modal.sendingOtp ? 'Đang gửi...' : 'Gửi lại mã'}
              </button>
            </div>
          )}
        </>
      );
    }

    if (modal.type === 'password') {
      return (
        <>
          {modal.step === 'form' && (
            <div className="acct-form-grid">
              <label>
                Mật khẩu hiện tại
                <input
                  type="password"
                  value={modal.form.currentPassword}
                  onChange={(e) => setModal((prev) => ({
                    ...prev,
                    form: { ...prev.form, currentPassword: e.target.value },
                    error: '',
                  }))}
                  className="acct-input"
                />
              </label>
              <label>
                Mật khẩu mới
                <input
                  type="password"
                  value={modal.form.newPassword}
                  onChange={(e) => setModal((prev) => ({
                    ...prev,
                    form: { ...prev.form, newPassword: e.target.value },
                    error: '',
                  }))}
                  className="acct-input"
                  placeholder="Tối thiểu 6 ký tự"
                />
              </label>
              <label>
                Xác nhận mật khẩu mới
                <input
                  type="password"
                  value={modal.form.confirmPassword}
                  onChange={(e) => setModal((prev) => ({
                    ...prev,
                    form: { ...prev.form, confirmPassword: e.target.value },
                    error: '',
                  }))}
                  className="acct-input"
                />
              </label>
            </div>
          )}
          {modal.step === 'otp' && (
            <div className="acct-otp-step">
              <p>Mã xác thực đã gửi tới <strong>{modal.otpEmail}</strong>.</p>
              <input
                type="text"
                value={modal.otp}
                onChange={(e) => setModal((prev) => ({ ...prev, otp: e.target.value, error: '' }))}
                className="acct-input"
                placeholder="Nhập mã OTP"
              />
              <button
                type="button"
                className="acct-link resend"
                onClick={() => handleSendOtp()}
                disabled={modal.sendingOtp}
              >
                {modal.sendingOtp ? 'Đang gửi...' : 'Gửi lại mã'}
              </button>
            </div>
          )}
        </>
      );
    }
    return null;
  };

  const handleModalPrimary = () => {
    if (!modal) return;
    if (modal.type === 'profile') {
      handleProfileSubmit();
    }
    if (modal.type === 'email') {
      handleEmailSubmit();
    }
    if (modal.type === 'password') {
      handlePasswordSubmit();
    }
  };

  const renderModalActions = () => {
    if (!modal) return null;
    if (modal.step === 'success') {
      return (
        <button type="button" className="acct-primary" onClick={closeModal}>
          Hoàn tất
        </button>
      );
    }
    return (
      <>
        <button type="button" className="acct-secondary" onClick={closeModal} disabled={modal.submitting || modal.sendingOtp}>
          Hủy
        </button>
        <button
          type="button"
          className="acct-primary"
          onClick={handleModalPrimary}
          disabled={modal.submitting || modal.sendingOtp}
        >
          {modal.step === 'form' && 'Tiếp tục'}
          {modal.step === 'otp' && (modal.submitting ? 'Đang xác minh...' : 'Xác nhận')}
        </button>
      </>
    );
  };

  const accountFields = useMemo(() => (userDetails ? [
    {
      label: 'Tên pháp lý',
      value: userDetails.FullName || 'Chưa cung cấp',
      action: () => openModal('profile'),
      actionLabel: 'Chỉnh sửa',
    },
    {
      label: 'Địa chỉ email',
      value: userDetails.Email ? maskEmail(userDetails.Email) : 'Chưa cung cấp',
      action: () => openModal('email'),
      actionLabel: 'Thay đổi',
    },
    {
      label: 'Số điện thoại',
      value: userDetails.Phone || 'Chưa cung cấp',
      action: () => openModal('profile'),
      actionLabel: userDetails.Phone ? 'Cập nhật' : 'Thêm',
    },
    {
      label: 'Xác minh danh tính',
      value: 'Đã xác thực qua email',
      action: () => openModal('profile'),
      actionLabel: 'Xác minh lại',
    },
    {
      label: 'Địa chỉ cư trú',
      value: userDetails.Nationality || 'Chưa cung cấp',
      action: () => openModal('profile'),
      actionLabel: userDetails.Nationality ? 'Cập nhật' : 'Thêm',
    },
  ] : []), [userDetails]);

  if (!isAuthenticated) {
    return (
      <div className="acct acct-empty">
        <h1 className="acct-title">Cài đặt tài khoản</h1>
        <p>Bạn cần đăng nhập để quản lý thông tin cá nhân.</p>
        <Link to="/login" className="acct-primary-link">
          Đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <div className="acct">
      <h1 className="acct-title">Cài đặt tài khoản</h1>
      {banner && (
        <div className={`acct-banner ${banner.type}`}>
          {banner.message}
          <button type="button" onClick={() => setBanner(null)}>×</button>
        </div>
      )}
      <div className="acct-layout">
        <aside className="acct-sidebar">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              className={`acct-item ${activeItem === item.id ? 'active' : ''}`}
              disabled={item.disabled}
              onClick={() => setActiveItem(item.id)}
            >
              {item.label}
              {item.disabled && <span className="acct-badge">Soon</span>}
            </button>
          ))}
        </aside>

        <main className="acct-main">
          {loading && <div className="acct-loader">Đang tải thông tin...</div>}

          {!loading && activeItem === 'personal' && (
            <>
              <h2 className="acct-section-title">Thông tin cá nhân</h2>
              <div className="acct-card">
                {accountFields.map((field) => (
                  <div className="acct-field" key={field.label}>
                    <div>
                      <div className="acct-field-label">{field.label}</div>
                      <div className="acct-field-value">{field.value}</div>
                    </div>
                    <button type="button" className="acct-link" onClick={field.action}>
                      {field.actionLabel}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {!loading && activeItem === 'security' && (
            <>
              <h2 className="acct-section-title">Đăng nhập & bảo mật</h2>
              <div className="acct-card">
                <div className="acct-field">
                  <div>
                    <div className="acct-field-label">Mật khẩu</div>
                    <div className="acct-field-value">Cập nhật lần cuối gần đây</div>
                  </div>
                  <button type="button" className="acct-link" onClick={() => openModal('password')}>
                    Đổi mật khẩu
                  </button>
                </div>
                <div className="acct-field">
                  <div>
                    <div className="acct-field-label">Xác thực qua email</div>
                    <div className="acct-field-value">Sử dụng OTP khi cập nhật thông tin nhạy cảm.</div>
                  </div>
                  <button type="button" className="acct-link" onClick={() => openModal('profile')}>
                    Thử ngay
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {modal && (
        <div className="acct-modal-backdrop" onClick={closeModal}>
          <div className="acct-modal" onClick={(e) => e.stopPropagation()}>
            <div className="acct-modal-header">
              <h3>{modal.title}</h3>
              <button type="button" onClick={closeModal}>×</button>
            </div>
            <div className="acct-modal-body">
              {renderModalBody()}
              {modal.error && <div className="acct-error">{modal.error}</div>}
              {modal.step === 'success' && <div className="acct-success">Hoàn tất!</div>}
            </div>
            <div className="acct-modal-actions">
              {renderModalActions()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}