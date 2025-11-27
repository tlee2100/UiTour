// HostHHeader.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import "./HostHHeader.css";
import logo from "../../assets/UiTour.png";
import sampleImg from "../../assets/sample-room.jpg";
import { useApp } from "../../contexts/AppContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";
import { useLanguageCurrencyModal } from "../../contexts/LanguageCurrencyModalContext";
import LanguageCurrencySelector from "../../components/LanguageCurrencySelector";

export default function HostHHeader() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, dispatch } = useApp();
    const { language } = useLanguage();
    const { isOpen: languageCurrencyOpen, openModal: openLanguageCurrency, closeModal: closeLanguageCurrency } = useLanguageCurrencyModal();

    const globeButtonRef = useRef(null);
    const navRef = useRef(null);
    const highlightRef = useRef(null);

    const [menuOpen, setMenuOpen] = useState(false);

    const navItems = useMemo(() => [
        { id: "today", label: t(language, 'host.today'), path: "/host/today" },
        { id: "listings", label: t(language, 'host.listings'), path: "/host/listings" },
        { id: "dashboard", label: "Dashboard", path: "/host/dashboard" },
        { id: "messages", label: t(language, 'host.messages'), path: "/host/messages" },

    ], [language]);

    const isActiveNav = (path) => {
        if (path === "/host/listings" && location.pathname.startsWith("/host/stay")) return true;
        if (path === "/host/listings" && location.pathname.startsWith("/host/experience")) return true;
        return location.pathname.startsWith(path);
    };

    const updateHighlight = () => {
        const navEl = navRef.current;
        const highlightEl = highlightRef.current;
        if (!navEl || !highlightEl) return;
        const active = navEl.querySelector(".active");
        if (!active) {
            highlightEl.style.width = "0px";
            return;
        }
        const parentRect = navEl.getBoundingClientRect();
        const linkRect = active.getBoundingClientRect();
        highlightEl.style.width = `${linkRect.width}px`;
        highlightEl.style.transform = `translateX(${linkRect.left - parentRect.left}px)`;
    };

    useEffect(() => {
        updateHighlight();
    }, [location.pathname]);

    useEffect(() => {
        window.addEventListener('resize', updateHighlight);
        return () => window.removeEventListener('resize', updateHighlight);
    }, []);

    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') setMenuOpen(false);
        };
        if (menuOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [menuOpen]);

    const handleLogout = () => {
        dispatch({ type: 'LOGOUT' });
        setMenuOpen(false);
        navigate('/');
    };

    return (
        <header className="host-header">
            <div className="header-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                <img src={logo} alt="UiTour logo" />
            </div>

            <nav className="nav-tabs" ref={navRef}>
                {navItems.map(item => (
                    <Link
                        key={item.id}
                        to={item.path}
                        className={isActiveNav(item.path) ? "active" : ""}
                    >
                        {item.label}
                    </Link>
                ))}
                <span className="nav-highlight" ref={highlightRef}></span>
            </nav>

            <div className="header-right">
                <button className="switch-title" onClick={() => navigate('/')}>
                    {t(language, 'common.switchToTraveling')}
                </button>

                <button
                    ref={globeButtonRef}
                    className="globe-btn"
                    onClick={openLanguageCurrency}
                    aria-label={t(language, 'search.languageAndCurrency')}
                >
                    <Icon icon="mdi:earth" width="24" height="24" />
                </button>

                {languageCurrencyOpen && (
                    <LanguageCurrencySelector
                        isOpen={languageCurrencyOpen}
                        onClose={closeLanguageCurrency}
                        triggerRef={globeButtonRef}
                    />
                )}

                <div className="header_profile">
                    <button
                        className="header_menu"
                        onClick={() => setMenuOpen((prev) => !prev)}
                        aria-label={t(language, 'host.openHostNavigationMenu')}
                        aria-expanded={menuOpen}
                    >
                        <Icon icon="mdi:menu" width="22" height="22" />
                    </button>

                    <button
                        className="header_avatarButton"
                        onClick={() => setMenuOpen((prev) => !prev)}
                        aria-label={t(language, 'host.openHostNavigationMenu')}
                        aria-expanded={menuOpen}
                    >
                        <Icon icon="mdi:account-circle" width="28" height="28" />
                    </button>
                </div>
            </div>

            {menuOpen && (
                <>
                    <div className="host-menu-backdrop" onClick={() => setMenuOpen(false)} aria-hidden="true" />

                    <aside className="host-menu-panel" role="dialog" aria-modal="true">
                        <div className="host-menu-header">
                            <h2>{t(language, 'host.menu')}</h2>
                            <button className="host-menu-close" onClick={() => setMenuOpen(false)}>
                                <Icon icon="mdi:close" width="24" />
                            </button>
                        </div>

                        <div className="host-menu-card">
                            <img src={sampleImg} className="host-menu-card-img" />
                            <div className="host-menu-card-content">
                                <h3>{t(language, 'host.newToHosting')}</h3>
                                <p>{t(language, 'host.discoverBestPractices')}</p>
                                <button className="host-menu-card-action">{t(language, 'host.getStarted')}</button>
                            </div>
                        </div>

                        <nav className="host-menu-links">
                            <button className="host-menu-link" onClick={() => { setMenuOpen(false); navigate('/account'); }}>
                                <Icon icon="mdi:cog-outline" width="20" />
                                <span>{t(language, 'host.accountSettings')}</span>
                            </button>

                            <button className="host-menu-link" onClick={() => { setMenuOpen(false); openLanguageCurrency(); }}>
                                <Icon icon="mdi:earth" width="20" />
                                <span>{t(language, 'host.languageCurrency')}</span>
                            </button>

                            <button className="host-menu-link" onClick={() => { setMenuOpen(false); navigate('/support'); }}>
                                <Icon icon="mdi:lifebuoy" width="20" />
                                <span>{t(language, 'host.getSupport')}</span>
                            </button>

                            <button className="host-menu-link" onClick={() => { setMenuOpen(false); navigate('/host/becomehost'); }}>
                                <Icon icon="mdi:plus-circle-outline" width="20" />
                                <span>{t(language, 'host.createNewListing')}</span>
                            </button>

                            <div className="host-menu-divider" />

                            <button className="host-menu-link host-menu-link-secondary" onClick={handleLogout}>
                                <Icon icon="mdi:logout" width="20" />
                                <span>{t(language, 'host.logOut')}</span>
                            </button>
                        </nav>
                    </aside>
                </>
            )}
        </header>
    );
}