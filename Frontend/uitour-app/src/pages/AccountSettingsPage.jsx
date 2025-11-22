import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './AccountSettingsPage.css';
import authAPI from '../services/authAPI';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../utils/translations';

const maskEmail = (email = '', language) => {
  if (!email) return t(language, 'accountSettings.notProvided');
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
  const { language } = useLanguage();
  const [activeItem, setActiveItem] = useState('personal');
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState(null);
  const [modal, setModal] = useState(initialModalState);

  const isAuthenticated = !!user?.UserID;

  const sidebarItems = [
    { id: 'personal', label: t(language, 'accountSettings.personalInformation') },
    { id: 'security', label: t(language, 'accountSettings.loginSecurity') },
    { id: 'privacy', label: t(language, 'accountSettings.privacy'), disabled: true },
    { id: 'notifications', label: t(language, 'accountSettings.notifications'), disabled: true },
    { id: 'tax', label: t(language, 'accountSettings.tax'), disabled: true },
    { id: 'payment', label: t(language, 'accountSettings.payments'), disabled: true },
    { id: 'locale', label: t(language, 'accountSettings.languageCurrency'), disabled: true },
    { id: 'business', label: t(language, 'accountSettings.businessTravel'), disabled: true },
  ];

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
      setBanner({ type: 'error', message: error.message || t(language, 'accountSettings.unableToLoadUserInfo') });
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
        title: t(language, 'accountSettings.editPersonalInformation'),
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
        title: t(language, 'accountSettings.updateEmailAddress'),
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
        title: t(language, 'accountSettings.changePassword'),
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
      setModal((prev) => ({ ...prev, sendingOtp: false, error: error.message || t(language, 'accountSettings.unableToSendOtp') }));
    }
  };

  const handleProfileSubmit = async () => {
    if (!modal || !userDetails) return;
    const { form, step } = modal;

    if (step === 'form') {
      if (!form.fullName?.trim()) {
        setModal((prev) => ({ ...prev, error: t(language, 'accountSettings.nameCannotBeEmpty') }));
        return;
      }
      if (form.phone && !/^[0-9+ ]{6,15}$/.test(form.phone)) {
        setModal((prev) => ({ ...prev, error: t(language, 'accountSettings.invalidPhoneNumber') }));
        return;
      }
      await handleSendOtp();
      return;
    }

    if (step === 'otp') {
      if (!modal.otp?.trim()) {
        setModal((prev) => ({ ...prev, error: t(language, 'accountSettings.pleaseEnterOtpCode') }));
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
          setModal((prev) => ({ ...prev, submitting: false, error: t(language, 'accountSettings.noInformationChanged') }));
          return;
        }

        await Promise.all(promises);
        await refreshUser();
        setBanner({ type: 'success', message: t(language, 'accountSettings.personalInformationUpdated') });
        setModal((prev) => ({ ...prev, step: 'success', submitting: false }));
      } catch (error) {
        setModal((prev) => ({ ...prev, submitting: false, error: error.message || t(language, 'accountSettings.unableToUpdateInformation') }));
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
        setModal((prev) => ({ ...prev, error: t(language, 'accountSettings.invalidEmailAddress') }));
        return;
      }
      if (email === userDetails.Email) {
        setModal((prev) => ({ ...prev, error: t(language, 'accountSettings.newEmailMustBeDifferent') }));
        return;
      }
      await handleSendOtp();
      return;
    }

    if (step === 'otp') {
      if (!modal.otp?.trim()) {
        setModal((prev) => ({ ...prev, error: t(language, 'accountSettings.pleaseEnterOtpCode') }));
        return;
      }
      setModal((prev) => ({ ...prev, submitting: true, error: '' }));
      try {
        await authAPI.verifyProfileOtp(userDetails.UserID, modal.otp);
        await authAPI.updateUserEmail(userDetails.UserID, modal.form.email.trim());
        await refreshUser();
        setBanner({ type: 'success', message: t(language, 'accountSettings.emailHasBeenUpdated') });
        setModal((prev) => ({ ...prev, step: 'success', submitting: false }));
      } catch (error) {
        setModal((prev) => ({ ...prev, submitting: false, error: error.message || t(language, 'accountSettings.unableToUpdateEmail') }));
      }
    }
  };

  const handlePasswordSubmit = async () => {
    if (!modal || !userDetails) return;
    const { form, step } = modal;

    if (step === 'form') {
      if (!form.currentPassword || !form.newPassword) {
        setModal((prev) => ({ ...prev, error: t(language, 'accountSettings.pleaseFillAllFields') }));
        return;
      }
      if (form.newPassword.length < 6) {
        setModal((prev) => ({ ...prev, error: t(language, 'accountSettings.newPasswordMinLength') }));
        return;
      }
      if (form.newPassword !== form.confirmPassword) {
        setModal((prev) => ({ ...prev, error: t(language, 'accountSettings.passwordConfirmationMismatch') }));
        return;
      }
      await handleSendOtp();
      return;
    }

    if (step === 'otp') {
      if (!modal.otp?.trim()) {
        setModal((prev) => ({ ...prev, error: t(language, 'accountSettings.pleaseEnterOtpCode') }));
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
        setBanner({ type: 'success', message: t(language, 'accountSettings.passwordChangedSuccessfully') });
        setModal((prev) => ({ ...prev, step: 'success', submitting: false }));
      } catch (error) {
        setModal((prev) => ({ ...prev, submitting: false, error: error.message || t(language, 'accountSettings.unableToChangePassword') }));
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
                {t(language, 'accountSettings.legalName')}
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
                {t(language, 'accountSettings.phoneNumber')}
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
                {t(language, 'accountSettings.countryResidence')}
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
              <p>{t(language, 'accountSettings.verificationCodeSent')} <strong>{modal.otpEmail}</strong>.</p>
              <input
                type="text"
                value={modal.otp}
                onChange={(e) => setModal((prev) => ({ ...prev, otp: e.target.value, error: '' }))}
                className="acct-input"
                placeholder={t(language, 'accountSettings.enterOtpCode')}
              />
              <button
                type="button"
                className="acct-link resend"
                onClick={() => handleSendOtp()}
                disabled={modal.sendingOtp}
              >
                {modal.sendingOtp ? t(language, 'accountSettings.sending') : t(language, 'accountSettings.resendCode')}
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
                {t(language, 'accountSettings.newEmail')}
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
              <p>{t(language, 'accountSettings.verificationCodeSent')} <strong>{modal.otpEmail}</strong>.</p>
              <input
                type="text"
                value={modal.otp}
                onChange={(e) => setModal((prev) => ({ ...prev, otp: e.target.value, error: '' }))}
                className="acct-input"
                placeholder={t(language, 'accountSettings.enterOtpCode')}
              />
              <button
                type="button"
                className="acct-link resend"
                onClick={() => handleSendOtp()}
                disabled={modal.sendingOtp}
              >
                {modal.sendingOtp ? t(language, 'accountSettings.sending') : t(language, 'accountSettings.resendCode')}
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
                {t(language, 'accountSettings.currentPassword')}
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
                {t(language, 'accountSettings.newPassword')}
                <input
                  type="password"
                  value={modal.form.newPassword}
                  onChange={(e) => setModal((prev) => ({
                    ...prev,
                    form: { ...prev.form, newPassword: e.target.value },
                    error: '',
                  }))}
                  className="acct-input"
                  placeholder={t(language, 'accountSettings.minimum6Characters')}
                />
              </label>
              <label>
                {t(language, 'accountSettings.confirmNewPassword')}
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
              <p>{t(language, 'accountSettings.verificationCodeSent')} <strong>{modal.otpEmail}</strong>.</p>
              <input
                type="text"
                value={modal.otp}
                onChange={(e) => setModal((prev) => ({ ...prev, otp: e.target.value, error: '' }))}
                className="acct-input"
                placeholder={t(language, 'accountSettings.enterOtpCode')}
              />
              <button
                type="button"
                className="acct-link resend"
                onClick={() => handleSendOtp()}
                disabled={modal.sendingOtp}
              >
                {modal.sendingOtp ? t(language, 'accountSettings.sending') : t(language, 'accountSettings.resendCode')}
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
          {t(language, 'accountSettings.done')}
        </button>
      );
    }
    return (
      <>
        <button type="button" className="acct-secondary" onClick={closeModal} disabled={modal.submitting || modal.sendingOtp}>
          {t(language, 'common.cancel')}
        </button>
        <button
          type="button"
          className="acct-primary"
          onClick={handleModalPrimary}
          disabled={modal.submitting || modal.sendingOtp}
        >
          {modal.step === 'form' && t(language, 'accountSettings.continue')}
          {modal.step === 'otp' && (modal.submitting ? t(language, 'accountSettings.verifying') : t(language, 'common.confirm'))}
        </button>
      </>
    );
  };

  const accountFields = useMemo(() => (userDetails ? [
    {
      label: t(language, 'accountSettings.legalName'),
      value: userDetails.FullName || t(language, 'accountSettings.notProvided'),
      action: () => openModal('profile'),
      actionLabel: t(language, 'accountSettings.edit'),
    },
    {
      label: t(language, 'accountSettings.emailAddress'),
      value: userDetails.Email ? maskEmail(userDetails.Email, language) : t(language, 'accountSettings.notProvided'),
      action: () => openModal('email'),
      actionLabel: t(language, 'accountSettings.change'),
    },
    {
      label: t(language, 'accountSettings.phoneNumber'),
      value: userDetails.Phone || t(language, 'accountSettings.notProvided'),
      action: () => openModal('profile'),
      actionLabel: userDetails.Phone ? t(language, 'accountSettings.update') : t(language, 'accountSettings.add'),
    },
    {
      label: t(language, 'accountSettings.identityVerification'),
      value: t(language, 'accountSettings.verifiedViaEmail'),
      action: () => openModal('profile'),
      actionLabel: t(language, 'accountSettings.verifyAgain'),
    },
    {
      label: t(language, 'accountSettings.residenceAddress'),
      value: userDetails.Nationality || t(language, 'accountSettings.notProvided'),
      action: () => openModal('profile'),
      actionLabel: userDetails.Nationality ? t(language, 'accountSettings.update') : t(language, 'accountSettings.add'),
    },
  ] : []), [userDetails, language]);

  if (!isAuthenticated) {
    return (
      <div className="acct acct-empty">
        <h1 className="acct-title">{t(language, 'accountSettings.title')}</h1>
        <p>{t(language, 'accountSettings.loginRequired')}</p>
        <Link to="/login" className="acct-primary-link">
          {t(language, 'profile.login')}
        </Link>
      </div>
    );
  }

  return (
    <div className="acct">
      <h1 className="acct-title">{t(language, 'accountSettings.title')}</h1>
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
              {item.disabled && <span className="acct-badge">{t(language, 'accountSettings.soon')}</span>}
            </button>
          ))}
        </aside>

        <main className="acct-main">
          {loading && <div className="acct-loader">{t(language, 'accountSettings.loadingInformation')}</div>}

          {!loading && activeItem === 'personal' && (
            <>
              <h2 className="acct-section-title">{t(language, 'accountSettings.personalInformation')}</h2>
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
              <h2 className="acct-section-title">{t(language, 'accountSettings.loginSecurity')}</h2>
              <div className="acct-card">
                <div className="acct-field">
                  <div>
                    <div className="acct-field-label">{t(language, 'accountSettings.password')}</div>
                    <div className="acct-field-value">{t(language, 'accountSettings.lastUpdatedRecently')}</div>
                  </div>
                  <button type="button" className="acct-link" onClick={() => openModal('password')}>
                    {t(language, 'accountSettings.changePassword')}
                  </button>
                </div>
                <div className="acct-field">
                  <div>
                    <div className="acct-field-label">{t(language, 'accountSettings.emailVerification')}</div>
                    <div className="acct-field-value">{t(language, 'accountSettings.useOtpWhenUpdating')}</div>
                  </div>
                  <button type="button" className="acct-link" onClick={() => openModal('profile')}>
                    {t(language, 'accountSettings.tryNow')}
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
              {modal.step === 'success' && <div className="acct-success">{t(language, 'accountSettings.done')}!</div>}
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