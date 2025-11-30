import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import HeaderInfo from "../components/headers/HeaderInfo";
import Footer from "../components/footers/Footer";
import "./InfoLayout.css";

import UniversalSearchBar from "../components/search/UniversalSearchBar";
import ExperienceSearchBar from "../components/search/ExperienceSearchBar";

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const isExpPage =
    location.pathname.startsWith("/tours") ||
    location.pathname.startsWith("/experience");

  const isStayPage = !isExpPage;

  const [showStaySearch, setShowStaySearch] = useState(false);
  const [showExpSearch, setShowExpSearch] = useState(false);

  /** -------------------------
   * LISTEN EVENT FOR STAY
   -------------------------- */
  useEffect(() => {
    const openStay = () => {
      if (isStayPage) {
        setShowStaySearch(true);
        setShowExpSearch(false);
        document.body.style.overflow = "hidden";
      }
    };
    window.addEventListener("open-universal-search", openStay);
    return () => window.removeEventListener("open-universal-search", openStay);
  }, [isStayPage]);

  /** -------------------------
   * LISTEN EVENT FOR EXP
   -------------------------- */
  useEffect(() => {
    const openExp = () => {
      if (isExpPage) {
        setShowExpSearch(true);
        setShowStaySearch(false);
        document.body.style.overflow = "hidden";
      }
    };
    window.addEventListener("open-experience-search", openExp);
    return () =>
      window.removeEventListener("open-experience-search", openExp);
  }, [isExpPage]);

  /** CLOSE */
  const closeAll = () => {
    setShowStaySearch(false);
    setShowExpSearch(false);
    document.body.style.overflow = "";
  };

  /** STAY SEARCH */
  const handleStaySearch = (query) => {
    closeAll();
    navigate(`/search?${query}`);
  };

  /** EXP SEARCH */
  const handleExpSearch = ({ params }) => {
    closeAll();
    navigate(`/tours?${params.toString()}`);
  };

  return (
    <>
      <HeaderInfo
        searchActive={showStaySearch || showExpSearch}
        searchType={isStayPage ? "stay" : "exp"}
      />

      {(showStaySearch || showExpSearch) && (
        <div className="stay-search-overlay" onClick={closeAll} />
      )}

      {showStaySearch && (
        <div className="stay-search-container">
          <UniversalSearchBar onSearch={handleStaySearch} onClose={closeAll} />
        </div>
      )}

      {showExpSearch && (
        <div className="stay-search-container">
          <ExperienceSearchBar onSearch={handleExpSearch} />
        </div>
      )}

      <main className="app-layout">
        <div className="main-content">
          <Outlet />
        </div>
      </main>

      <Footer />
    </>
  );
}
