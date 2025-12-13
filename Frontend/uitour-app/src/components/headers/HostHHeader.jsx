// HostHHeader.jsx
import React, { useEffect, useRef, useState } from "react";
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
    console.log("HostHHeader mounted");

    const navigate = useNavigate();
    const location = useLocation();
    const { user, dispatch } = useApp();
    const { language } = useLanguage();
    const { isOpen: languageCurrencyOpen, openModal: openLanguageCurrency, closeModal: closeLanguageCurrency } =
        useLanguageCurrencyModal();

    const globeButtonRef = useRef(null);
    const navRef = useRef(null);
    const menuRef = useRef(null);

    const [menuOpen, setMenuOpen] = useState(false);

    const navItems = [
        { id: "today", key: "hostNav.today", path: "/host/today" },
        { id: "listings", key: "hostNav.listings", path: "/host/listings" },
        { id: "dashboard", key: "hostNav.dashboard", path: "/host/dashboard" },
        { id: "messages", key: "hostNav.messages", path: "/host/messages" },
    ];

    const isActiveNav = (path) => {
        if (path === "/host/listings" && location.pathname.startsWith("/host/stay")) return true;
        if (path === "/host/listings" && location.pathname.startsWith("/host/experience")) return true;
        return location.pathname.startsWith(path);
    };

    // compute active id string similar to Header's "active"
    const activeItem = navItems.find((it) => isActiveNav(it.path));
    const activeId = activeItem ? activeItem.id : "";

    // update highlight function (searches inside navRef)
    const updateHighlight = () => {
        const nav = navRef.current;
        if (!nav) return;
        const activeLink = nav.querySelector(`.nav_link.active`);
        const highlight = nav.querySelector(".nav_highlight");
        if (!highlight) return;
        if (!activeLink) {
            // If no active (shouldn't happen), hide highlight:
            highlight.style.width = `0px`;
            highlight.style.transform = `translateX(0px)`;
            return;
        }
        // compute offset relative to nav container
        const navRect = nav.getBoundingClientRect();
        const linkRect = activeLink.getBoundingClientRect();
        const offsetLeft = linkRect.left - navRect.left + nav.scrollLeft;
        const width = linkRect.width;

        highlight.style.width = `${width}px`;
        highlight.style.transform = `translateX(${offsetLeft}px)`;
    };

    // run update when activeId changes (mimic Header)
    useEffect(() => {
        updateHighlight();
    }, [activeId, language]); // language included in case label widths change

    // resize listener to update highlight
    useEffect(() => {
        const onResize = () => updateHighlight();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    // keyboard escape to close menu
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
            <div className="header-logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
                <img src={logo} alt="UiTour logo" />
            </div>

            <nav className="nav-tabs" ref={navRef}>
                {navItems.map((item) => (
                    <Link
                        key={item.id}
                        to={item.path}
                        data-id={item.id}
                        className={`nav_link ${isActiveNav(item.path) ? "active" : ""}`}
                    >
                        {t(language, item.key)}
                    </Link>
                ))}
                <span className="nav_highlight" aria-hidden="true" />
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
                    <LanguageCurrencySelector isOpen={languageCurrencyOpen} onClose={closeLanguageCurrency} triggerRef={globeButtonRef} />
                )}

                <div className="header_profile">
                    <button
                        className="header_menu"
                        onClick={() => setMenuOpen((p) => !p)}
                        aria-label={t(language, "host.openHostNavigationMenu")}
                        aria-expanded={menuOpen}
                        ref={menuRef}
                    >
                        <Icon icon="mdi:menu" width="22" height="22" />
                    </button>

                    <button
                        className="header_avatarButton"
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
                            <h2>{t(language, "menu")}</h2>
                            <button className="host-menu-close" onClick={() => setMenuOpen(false)}>
                                <Icon icon="mdi:close" width="24" />
                            </button>
                        </div>

                        <div className="host-menu-card">
                            <img src={sampleImg} className="host-menu-card-img" alt="" />
                            <div className="host-menu-card-content">
                                <h3>{t(language, "newToHosting")}</h3>
                                <p>{t(language, "discoverBestPractices")}</p>
                                <button 
                                    className="host-menu-card-action"
                                    onClick={() => {
                                        setMenuOpen(false);
                                        navigate("/host/becomehost");
                                    }}
                                >
                                    {t(language, "getStarted")}
                                </button>
                            </div>
                        </div>

                        <nav className="host-menu-links">
                            <button
                                className="host-menu-link"
                                onClick={() => {
                                    setMenuOpen(false);
                                    navigate("/account");
                                }}
                            >
                                <Icon icon="mdi:cog-outline" width="20" />
                                <span>{t(language, "accountSettingsLabel")}</span>
                            </button>

                            <button
                                className="host-menu-link"
                                onClick={() => {
                                    setMenuOpen(false);
                                    openLanguageCurrency();
                                }}
                            >
                                <Icon icon="mdi:earth" width="20" />
                                <span>{t(language, "languageCurrency")}</span>
                            </button>

                            <button
                                className="host-menu-link"
                                onClick={() => {
                                    setMenuOpen(false);
                                    navigate("/support");
                                }}
                            >
                                <Icon icon="mdi:lifebuoy" width="20" />
                                <span>{t(language, "getSupport")}</span>
                            </button>

                            <button
                                className="host-menu-link"
                                onClick={() => {
                                    setMenuOpen(false);
                                    navigate("/host/becomehost");
                                }}
                            >
                                <Icon icon="mdi:plus-circle-outline" width="20" />
                                <span>{t(language, "createNewListing")}</span>
                            </button>

                            <div className="host-menu-divider" />

                            <button className="host-menu-link host-menu-link-secondary" onClick={handleLogout}>
                                <Icon icon="mdi:logout" width="20" />
                                <span>{t(language, "logOut")}</span>
                            </button>
                        </nav>
                    </aside>
                </>
            )}
        </header>
    );
}
