import { useState } from "react";
import { Icon } from "@iconify/react";
import SearchWhere from "./SearchWhere";
import SearchDates from "./SearchDates";
import SearchGuests from "./SearchGuests";
import "./UniversalSearchBar.css";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";

export default function UniversalSearchBar({
  initial = { location: "", checkIn: "", checkOut: "", guests: "" },
  onSearch,
  onClose = () => {},
}) {
  const { language } = useLanguage();

  const [searchLocation, setSearchLocation] = useState(initial.location);
  const [checkIn, setCheckIn] = useState(initial.checkIn);
  const [checkOut, setCheckOut] = useState(initial.checkOut);
  const [guests, setGuests] = useState(initial.guests);

  const [openWhere, setOpenWhere] = useState(false);
  const [openDates, setOpenDates] = useState(false);
  const [openGuests, setOpenGuests] = useState(false);
  const [activeField, setActiveField] = useState(null);

  const closeAllPopups = () => {
    setOpenWhere(false);
    setOpenDates(false);
    setOpenGuests(false);
    setActiveField(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const months = t(language, "months.short");
    return `${months[d.getMonth()]} ${d.getDate()}`;
  };

  const handleSearchClick = () => {
    closeAllPopups();
    const params = new URLSearchParams();
    if (searchLocation) params.set("location", searchLocation);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests) params.set("guests", guests);
    onSearch(params.toString());
    onClose();
  };

  return (
    <div className="uni-searchbar-wrapper">
      <div className="uni-searchbar">

        {/* WHERE */}
        <button
          className={`uni-sf uni-sf-btn ${activeField === "where" ? "active" : ""} ${
            searchLocation ? "has-value" : ""
          }`}
          onClick={() => {
            const next = !openWhere;
            closeAllPopups();
            setOpenWhere(next);
            setActiveField(next ? "where" : null);
          }}
        >
          <label>{t(language, "uniSearch.where.label")}</label>
          <div className="uni-sf-value-row">
            <div className="uni-sf-value">
              {searchLocation || t(language, "uniSearch.where.placeholder")}
            </div>

            {searchLocation && (
              <button
                className="uni-sf-clear"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchLocation("");
                }}
              >
                <Icon icon="mdi:close-circle" width="16" height="16" />
              </button>
            )}
          </div>
        </button>

        {/* CHECK-IN */}
        <button
          className={`uni-sf uni-sf-btn ${activeField === "checkin" ? "active" : ""} ${
            checkIn ? "has-value" : ""
          }`}
          onClick={() => {
            const next = !openDates;
            closeAllPopups();
            setOpenDates(next);
            setActiveField(next ? "checkin" : null);
          }}
        >
          <label>{t(language, "uniSearch.checkin.label")}</label>
          <div className="uni-sf-value-row">
            <div className="uni-sf-value">
              {checkIn ? formatDate(checkIn) : t(language, "uniSearch.checkin.placeholder")}
            </div>

            {checkIn && (
              <button
                className="uni-sf-clear"
                onClick={(e) => {
                  e.stopPropagation();
                  setCheckIn("");
                  setCheckOut("");
                }}
              >
                <Icon icon="mdi:close-circle" width="16" height="16" />
              </button>
            )}
          </div>
        </button>

        {/* CHECK-OUT */}
        <button
          className={`uni-sf uni-sf-btn ${activeField === "checkout" ? "active" : ""} ${
            checkOut ? "has-value" : ""
          }`}
          onClick={() => {
            const next = !openDates;
            closeAllPopups();
            setOpenDates(next);
            setActiveField(next ? "checkout" : null);
          }}
        >
          <label>{t(language, "uniSearch.checkout.label")}</label>
          <div className="uni-sf-value-row">
            <div className="uni-sf-value">
              {checkOut ? formatDate(checkOut) : t(language, "uniSearch.checkout.placeholder")}
            </div>

            {checkOut && (
              <button
                className="uni-sf-clear"
                onClick={(e) => {
                  e.stopPropagation();
                  setCheckIn("");
                  setCheckOut("");
                }}
              >
                <Icon icon="mdi:close-circle" width="16" height="16" />
              </button>
            )}
          </div>
        </button>

        {/* GUESTS */}
        <button
          className={`uni-sf uni-sf-btn ${activeField === "guests" ? "active" : ""} ${
            guests ? "has-value" : ""
          }`}
          onClick={() => {
            const next = !openGuests;
            closeAllPopups();
            setOpenGuests(next);
            setActiveField(next ? "guests" : null);
          }}
        >
          <label>{t(language, "uniSearch.guests.label")}</label>

          <div className="uni-sf-value-row">
            <div className="uni-sf-value">
              {guests
                ? `${guests} ${t(language, "uniSearch.guests.unit")}`
                : t(language, "uniSearch.guests.placeholder")}
            </div>

            {guests && (
              <button
                className="uni-sf-clear"
                onClick={(e) => {
                  e.stopPropagation();
                  setGuests("");
                }}
              >
                <Icon icon="mdi:close-circle" width="16" height="16" />
              </button>
            )}
          </div>
        </button>

        {/* SEARCH BUTTON */}
        <button className="uni-search-button" onClick={handleSearchClick}>
          <Icon icon="mdi:magnify" width="20" height="20" />
        </button>
      </div>

      {/* Popovers */}
      <SearchWhere
        open={openWhere}
        onClose={() => {
          setOpenWhere(false);
          setActiveField(null);
        }}
        onSelectRegion={(r) => {
          setSearchLocation(r.title);
          setOpenWhere(false);
          setActiveField(null);
        }}
      />

      <SearchDates
        open={openDates}
        onClose={() => {
          setOpenDates(false);
          setActiveField(null);
        }}
        value={{ checkIn, checkOut }}
        onChange={(v) => {
          setCheckIn(v.checkIn || "");
          setCheckOut(v.checkOut || "");
          if (v.checkIn && v.checkOut) {
            setOpenDates(false);
            setActiveField(null);
          }
        }}
      />

      <SearchGuests
        open={openGuests}
        onClose={() => {
          setOpenGuests(false);
          setActiveField(null);
        }}
        guests={{
          adults: Number(guests) || 1,
          children: 0,
          infants: 0,
          pets: 0,
        }}
        onChange={(g) => {
          setGuests(String(g.adults + g.children));
        }}
      />
    </div>
  );
}
