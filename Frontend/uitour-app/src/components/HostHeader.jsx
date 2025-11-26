import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useLocation, useNavigate } from "react-router-dom";
import "./HostHeader.css";
import logo from "../assets/UiTour.png";
import ProfileMenu from "./ProfileMenu";
import LanguageCurrencySelector from "./LanguageCurrencySelector";
import { useLanguage } from "../contexts/LanguageContext";
import { useLanguageCurrencyModal } from "../contexts/LanguageCurrencyModalContext";
import { t } from "../utils/translations";

export default function HostHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const {
    isOpen: languageCurrencyOpen,
    openModal: openLanguageCurrency,
    closeModal: closeLanguageCurrency
  } = useLanguageCurrencyModal();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const controlsRef = useRef(null);
  const globeButtonRef = useRef(null);
  const navRef = useRef(null);
  const highlightRef = useRef(null);

  const navItems = useMemo(() => [
    { id: "today", label: t(language, "host.today"), path: "/host/today" },
    { id: "listings", label: t(language, "host.listings"), path: "/host/listings" },
    { id: "messages", label: t(language, "host.messages"), path: "/host/messages" }
  ], [language]);

  const isActiveNav = (path) => {
    if (path === "/host/listings" && location.pathname.startsWith("/host/stay")) return true;
    if (path === "/host/listings" && location.pathname.startsWith("/host/experience")) return true;
    return location.pathname.startsWith(path);
  };

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        controlsRef.current &&
        !controlsRef.current.contains(event.target)
      ) {
        closeMenu();
      }
    };

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [menuOpen]);

  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  const updateHighlight = () => {
    const navEl = navRef.current;
    const highlightEl = highlightRef.current;
    if (!navEl || !highlightEl) return;

    const activeLink = navEl.querySelector(".hheader-navlink.active");
    if (!activeLink) {
      highlightEl.style.width = "0px";
      highlightEl.style.transform = "translateX(0)";
      return;
    }

    const navRect = navEl.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    const offset = linkRect.left - navRect.left;
    highlightEl.style.width = `${linkRect.width}px`;
    highlightEl.style.transform = `translateX(${offset}px)`;
  };

  useEffect(() => {
    updateHighlight();
  }, [location.pathname, navItems]);

  useEffect(() => {
    const handleResize = () => updateHighlight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className="hheader">
      <div className="hheader-logo">
        <button
          className="hheader-logoButton"
          onClick={() => navigate("/")}
          aria-label="UiTour"
        >
          <img src={logo} alt="UiTour Logo" className="hheader-logo-image" />
        </button>
      </div>

      <nav className="hheader-navbar" aria-label="Host navigation" ref={navRef}>
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`hheader-navlink ${isActiveNav(item.path) ? "active" : ""}`}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </button>
        ))}
        <span className="hheader-nav-highlight" ref={highlightRef} />
      </nav>

      <div className="hheader-actions">
        <button
          className="hheader-switch"
          onClick={() => navigate("/")}
        >
          {t(language, "common.switchToTraveling")}
        </button>

        <button
          ref={globeButtonRef}
          className="hheader-globe"
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

        <div className="hheader-profile" ref={controlsRef}>
          <button
            type="button"
            className="hheader-menu-btn"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={t(language, "host.openHostNavigationMenu")}
          >
            <Icon icon="mdi:menu" width="22" height="22" />
          </button>
          <button
            type="button"
            className="hheader-avatar-btn"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <Icon icon="mdi:account-circle" width="28" height="28" />
          </button>

          {menuOpen && (
            <ProfileMenu
              ref={menuRef}
              onClose={closeMenu}
            />
          )}
        </div>
      </div>
    </header>
  );
}
