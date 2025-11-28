// HostHHeader.jsx
import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
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
    const { isOpen: languageCurrencyOpen, openModal: openLanguageCurrency, closeModal: closeLanguageCurrency } =
        useLanguageCurrencyModal();

    const globeButtonRef = useRef(null);
    const navRef = useRef(null);
    const highlightRef = useRef(null);
    const isInitialMount = useRef(true);

    const [menuOpen, setMenuOpen] = useState(false);

    // Giữ cố định navItems (không re-render)
    const navItems = [
        { id: "today", key: "host.today", path: "/host/today" },
        { id: "listings", key: "host.listings", path: "/host/listings" },
        { id: "dashboard", key: "host.dashboard", path: "/host/dashboard" },
        { id: "messages", key: "host.messages", path: "/host/messages" },
    ];

    const isActiveNav = (path) => {
        if (path === "/host/listings" && location.pathname.startsWith("/host/stay")) return true;
        if (path === "/host/listings" && location.pathname.startsWith("/host/experience")) return true;
        return location.pathname.startsWith(path);
    };

    const updateHighlight = () => {
        const nav = navRef.current;
        const hl = highlightRef.current;
        if (!nav || !hl) return;

        const activeLink = nav.querySelector("a.active");
        if (!activeLink) return;

        const offsetLeft = activeLink.offsetLeft;
        const width = activeLink.offsetWidth;

        hl.style.width = `${width}px`;
        hl.style.transform = `translateX(${offsetLeft}px)`;
    };

    useEffect(() => {
        updateHighlight();
    }, []);


    /* ------------------------------------------------------
       2) ANIMATE KHI ĐỔI ROUTE
       ------------------------------------------------------ */
    // Gọi lại mỗi khi pathname hoặc language thay đổi
    useEffect(() => {
        const id = requestAnimationFrame(() => {
            updateHighlight();
        });

        window.addEventListener("resize", updateHighlight);
        return () => {
            cancelAnimationFrame(id);
            window.removeEventListener("resize", updateHighlight);
        };
    }, [location.pathname, language]);



    /* ------------------------------------------------------
       Các phần khác giữ nguyên 100%
       ------------------------------------------------------ */

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") setMenuOpen(false);
        };
        if (menuOpen) window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [menuOpen]);

    const handleLogout = () => {
        dispatch({ type: "LOGOUT" });
        setMenuOpen(false);
        navigate("/");
    };

    return (
        <header className="host-header">
            <div className="header-logo" onClick={() => navigate('/')} style={{ cursor: "pointer" }}>
                <img src={logo} alt="UiTour logo" />
            </div>

            <nav className="nav-tabs" ref={navRef}>
                {navItems.map((item) => (
                    <Link
                        key={item.id}
                        to={item.path}
                        className={isActiveNav(item.path) ? "active" : ""}
                    >
                        {t(language, item.key)}
                    </Link>
                ))}
                <span className="nav-highlight" ref={highlightRef}></span>
            </nav>

            <div className="header-right">
                <button className="switch-title" onClick={() => navigate("/")}>
                    {t(language, "common.switchToTraveling")}
                </button>

                <button
                    ref={globeButtonRef}
                    className="globe-btn"
                    onClick={openLanguageCurrency}
                    aria-label={t(language, "search.languageAndCurrency")}
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
                    <button className="header_menu"
                        onClick={() => setMenuOpen((p) => !p)}
                        aria-label={t(language, "host.openHostNavigationMenu")}
                        aria-expanded={menuOpen}
                    >
                        <Icon icon="mdi:menu" width="22" height="22" />
                    </button>

                    <button className="header_avatarButton"
                        onClick={() => setMenuOpen((p) => !p)}
                        aria-label={t(language, "host.openHostNavigationMenu")}
                        aria-expanded={menuOpen}
                    >
                        <Icon icon="mdi:account-circle" width="28" height="28" />
                    </button>
                </div>
            </div>

            {menuOpen && (
                <>
                    <div className="host-menu-backdrop" onClick={() => setMenuOpen(false)} />

                    <aside className="host-menu-panel">
                        <div className="host-menu-header">
                            <h2>{t(language, "host.menu")}</h2>
                            <button className="host-menu-close" onClick={() => setMenuOpen(false)}>
                                <Icon icon="mdi:close" width="24" />
                            </button>
                        </div>

                        <div className="host-menu-card">
                            <img src={sampleImg} className="host-menu-card-img" />
                            <div className="host-menu-card-content">
                                <h3>{t(language, "host.newToHosting")}</h3>
                                <p>{t(language, "host.discoverBestPractices")}</p>
                                <button className="host-menu-card-action">
                                    {t(language, "host.getStarted")}
                                </button>
                            </div>
                        </div>

                        <nav className="host-menu-links">
                            <button className="host-menu-link" onClick={() => { setMenuOpen(false); navigate("/account"); }}>
                                <Icon icon="mdi:cog-outline" width="20" />
                                <span>{t(language, "host.accountSettings")}</span>
                            </button>

                            <button className="host-menu-link" onClick={() => { setMenuOpen(false); openLanguageCurrency(); }}>
                                <Icon icon="mdi:earth" width="20" />
                                <span>{t(language, "host.languageCurrency")}</span>
                            </button>

                            <button className="host-menu-link" onClick={() => { setMenuOpen(false); navigate("/support"); }}>
                                <Icon icon="mdi:lifebuoy" width="20" />
                                <span>{t(language, "host.getSupport")}</span>
                            </button>

                            <button className="host-menu-link" onClick={() => { setMenuOpen(false); navigate("/host/becomehost"); }}>
                                <Icon icon="mdi:plus-circle-outline" width="20" />
                                <span>{t(language, "host.createNewListing")}</span>
                            </button>

                            <div className="host-menu-divider" />

                            <button className="host-menu-link host-menu-link-secondary" onClick={handleLogout}>
                                <Icon icon="mdi:logout" width="20" />
                                <span>{t(language, "host.logOut")}</span>
                            </button>
                        </nav>
                    </aside>
                </>
            )}
        </header>
    );
}
