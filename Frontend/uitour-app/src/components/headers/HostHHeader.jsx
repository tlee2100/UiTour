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

        const active = nav.querySelector(".active");
        if (!active) {
            // hide underline
            hl.style.width = `0px`;
            hl.style.left = `0px`;
            return;
        }

        const offsetLeft = active.offsetLeft;
        const width = active.offsetWidth;

        // The exact transition we want (match your CSS)
        const TRANS = "left 0.28s cubic-bezier(0.25, 0.1, 0.25, 1), width 0.28s cubic-bezier(0.25, 0.1, 0.25, 1)";

        if (isInitialMount.current) {
            // 1) tắt transition để đặt vị trí ban đầu (không animate)
            hl.style.transition = "none";
            hl.style.width = `${width}px`;
            hl.style.left = `${offsetLeft}px`;

            // 2) ép browser reflow để chắc chắn giá trị trên DOM đã apply
            //    (đọc thuộc tính layout sẽ force reflow)
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            hl.offsetWidth; // forced reflow

            // 3) bật lại transition một cách rõ ràng (inline), nhưng chỉ sau reflow
            //    Sau này khi updateHighlight được gọi tiếp, setting left/width sẽ animate
            hl.style.transition = TRANS;

            // 4) đánh dấu đã mount ban đầu xong
            isInitialMount.current = false;
        } else {
            // Normal updates — CSS/inline transition sẽ animate thay đổi này
            hl.style.width = `${width}px`;
            hl.style.left = `${offsetLeft}px`;
        }
    };
    /* ------------------------------------------------------
       1) ĐẶT VỊ TRÍ BAN ĐẦU — KHÔNG ANIMATION (Airbnb style)
       ------------------------------------------------------ */
    useLayoutEffect(() => {
        updateHighlight();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // chạy 1 lần khi mount

    /* ------------------------------------------------------
       2) ANIMATE KHI ĐỔI ROUTE
       ------------------------------------------------------ */
    useEffect(() => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                updateHighlight();
            });
        });

        window.addEventListener("resize", updateHighlight);
        return () => window.removeEventListener("resize", updateHighlight);
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
