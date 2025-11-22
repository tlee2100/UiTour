import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './AccountSettingsPage.css';
import authAPI from '../services/authAPI';
import { useApp } from '../contexts/AppContext';

const sidebarItems = [
  { id: 'personal', label: 'Personal information' },
  { id: 'security', label: 'Login & security' },
  { id: 'privacy', label: 'Privacy', disabled: true },
  { id: 'notifications', label: 'Notifications', disabled: true },
  { id: 'tax', label: 'Tax', disabled: true },
  { id: 'payment', label: 'Payments', disabled: true },
  { id: 'locale', label: 'Language & currency', disabled: true },
  { id: 'business', label: 'Business travel', disabled: true },
];

const maskEmail = (email = '') => {
  if (!email) return 'Not provided';
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
      setBanner({ type: 'error', message: error.message || 'Unable to load user information.' });
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
        title: 'Edit personal information',
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
        title: 'Update email address',
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
        title: 'Change password',
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
      setModal((prev) => ({ ...prev, sendingOtp: false, error: error.message || 'Unable to send OTP code.' }));
    }
  };

  const handleProfileSubmit = async () => {
    if (!modal || !userDetails) return;
    const { form, step } = modal;

    if (step === 'form') {
      if (!form.fullName?.trim()) {
        setModal((prev) => ({ ...prev, error: 'Name cannot be empty.' }));
        return;
      }
      if (form.phone && !/^[0-9+ ]{6,15}$/.test(form.phone)) {
        setModal((prev) => ({ ...prev, error: 'Invalid phone number.' }));
        return;
      }
      await handleSendOtp();
      return;
    }

    if (step === 'otp') {
      if (!modal.otp?.trim()) {
        setModal((prev) => ({ ...prev, error: 'Please enter OTP code.' }));
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
          setModal((prev) => ({ ...prev, submitting: false, error: 'No information has changed.' }));
          return;
        }

        await Promise.all(promises);
        await refreshUser();
        setBanner({ type: 'success', message: 'Personal information updated successfully.' });
        setModal((prev) => ({ ...prev, step: 'success', submitting: false }));
      } catch (error) {
        setModal((prev) => ({ ...prev, submitting: false, error: error.message || 'Unable to update information.' }));
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
        setModal((prev) => ({ ...prev, error: 'Invalid email address.' }));
        return;
      }
      if (email === userDetails.Email) {
        setModal((prev) => ({ ...prev, error: 'New email must be different from current email.' }));
        return;
      }
      await handleSendOtp();
      return;
    }

    if (step === 'otp') {
      if (!modal.otp?.trim()) {
        setModal((prev) => ({ ...prev, error: 'Please enter OTP code.' }));
        return;
      }
      setModal((prev) => ({ ...prev, submitting: true, error: '' }));
      try {
        await authAPI.verifyProfileOtp(userDetails.UserID, modal.otp);
        await authAPI.updateUserEmail(userDetails.UserID, modal.form.email.trim());
        await refreshUser();
        setBanner({ type: 'success', message: 'Email has been updated.' });
        setModal((prev) => ({ ...prev, step: 'success', submitting: false }));
      } catch (error) {
        setModal((prev) => ({ ...prev, submitting: false, error: error.message || 'Unable to update email.' }));
      }
    }
  };

  const handlePasswordSubmit = async () => {
    if (!modal || !userDetails) return;
    const { form, step } = modal;

    if (step === 'form') {
      if (!form.currentPassword || !form.newPassword) {
        setModal((prev) => ({ ...prev, error: 'Please fill in all required fields.' }));
        return;
      }
      if (form.newPassword.length < 6) {
        setModal((prev) => ({ ...prev, error: 'New password must be at least 6 characters.' }));
        return;
      }
      if (form.newPassword !== form.confirmPassword) {
        setModal((prev) => ({ ...prev, error: 'Password confirmation does not match.' }));
        return;
      }
      await handleSendOtp();
      return;
    }

    if (step === 'otp') {
      if (!modal.otp?.trim()) {
        setModal((prev) => ({ ...prev, error: 'Please enter OTP code.' }));
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
        setBanner({ type: 'success', message: 'Password changed successfully.' });
        setModal((prev) => ({ ...prev, step: 'success', submitting: false }));
      } catch (error) {
        setModal((prev) => ({ ...prev, submitting: false, error: error.message || 'Unable to change password.' }));
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
                Legal name
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
                Phone number
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
                Country/Residence
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
              <p>Verification code sent to <strong>{modal.otpEmail}</strong>.</p>
              <input
                type="text"
                value={modal.otp}
                onChange={(e) => setModal((prev) => ({ ...prev, otp: e.target.value, error: '' }))}
                className="acct-input"
                placeholder="Enter OTP code"
              />
              <button
                type="button"
                className="acct-link resend"
                onClick={() => handleSendOtp()}
                disabled={modal.sendingOtp}
              >
                {modal.sendingOtp ? 'Sending...' : 'Resend code'}
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
                New email
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
              <p>Verification code sent to <strong>{modal.otpEmail}</strong>.</p>
              <input
                type="text"
                value={modal.otp}
                onChange={(e) => setModal((prev) => ({ ...prev, otp: e.target.value, error: '' }))}
                className="acct-input"
                placeholder="Enter OTP code"
              />
              <button
                type="button"
                className="acct-link resend"
                onClick={() => handleSendOtp()}
                disabled={modal.sendingOtp}
              >
                {modal.sendingOtp ? 'Sending...' : 'Resend code'}
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
                Current password
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
                New password
                <input
                  type="password"
                  value={modal.form.newPassword}
                  onChange={(e) => setModal((prev) => ({
                    ...prev,
                    form: { ...prev.form, newPassword: e.target.value },
                    error: '',
                  }))}
                  className="acct-input"
                  placeholder="Minimum 6 characters"
                />
              </label>
              <label>
                Confirm new password
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
              <p>Verification code sent to <strong>{modal.otpEmail}</strong>.</p>
              <input
                type="text"
                value={modal.otp}
                onChange={(e) => setModal((prev) => ({ ...prev, otp: e.target.value, error: '' }))}
                className="acct-input"
                placeholder="Enter OTP code"
              />
              <button
                type="button"
                className="acct-link resend"
                onClick={() => handleSendOtp()}
                disabled={modal.sendingOtp}
              >
                {modal.sendingOtp ? 'Sending...' : 'Resend code'}
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
          Done
        </button>
      );
    }
    return (
      <>
        <button type="button" className="acct-secondary" onClick={closeModal} disabled={modal.submitting || modal.sendingOtp}>
          Cancel
        </button>
        <button
          type="button"
          className="acct-primary"
          onClick={handleModalPrimary}
          disabled={modal.submitting || modal.sendingOtp}
        >
          {modal.step === 'form' && 'Continue'}
          {modal.step === 'otp' && (modal.submitting ? 'Verifying...' : 'Confirm')}
        </button>
      </>
    );
  };

  const accountFields = useMemo(() => (userDetails ? [
    {
      label: 'Legal name',
      value: userDetails.FullName || 'Not provided',
      action: () => openModal('profile'),
      actionLabel: 'Edit',
    },
    {
      label: 'Email address',
      value: userDetails.Email ? maskEmail(userDetails.Email) : 'Not provided',
      action: () => openModal('email'),
      actionLabel: 'Change',
    },
    {
      label: 'Phone number',
      value: userDetails.Phone || 'Not provided',
      action: () => openModal('profile'),
      actionLabel: userDetails.Phone ? 'Update' : 'Add',
    },
    {
      label: 'Identity verification',
      value: 'Verified via email',
      action: () => openModal('profile'),
      actionLabel: 'Verify again',
    },
    {
      label: 'Residence address',
      value: userDetails.Nationality || 'Not provided',
      action: () => openModal('profile'),
      actionLabel: userDetails.Nationality ? 'Update' : 'Add',
    },
  ] : []), [userDetails]);

  if (!isAuthenticated) {
    return (
      <div className="acct acct-empty">
        <h1 className="acct-title">Account settings</h1>
        <p>You need to log in to manage your personal information.</p>
        <Link to="/login" className="acct-primary-link">
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="acct">
      <h1 className="acct-title">Account settings</h1>
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
          {loading && <div className="acct-loader">Loading information...</div>}

          {!loading && activeItem === 'personal' && (
            <>
              <h2 className="acct-section-title">Personal information</h2>
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
              <h2 className="acct-section-title">Login & security</h2>
              <div className="acct-card">
                <div className="acct-field">
                  <div>
                    <div className="acct-field-label">Password</div>
                    <div className="acct-field-value">Last updated recently</div>
                  </div>
                  <button type="button" className="acct-link" onClick={() => openModal('password')}>
                    Change password
                  </button>
                </div>
                <div className="acct-field">
                  <div>
                    <div className="acct-field-label">Email verification</div>
                    <div className="acct-field-value">Use OTP when updating sensitive information.</div>
                  </div>
                  <button type="button" className="acct-link" onClick={() => openModal('profile')}>
                    Try now
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
              {modal.step === 'success' && <div className="acct-success">Done!</div>}
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