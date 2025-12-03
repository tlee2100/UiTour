import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import SearchWhere from "./SearchWhere";
import ExperienceSearchDates from "./ExperienceSearchDates";
import SearchGuests from "./SearchGuests";
import "./ExperienceSearchBar.css";

import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";

export default function ExperienceSearchBar({
  initialLocation = "",
  initialDates = "",
  initialGuests = "1",
  onSearch,
  searchPath = "/tours"
}) {
  const { language } = useLanguage();

  const [location, setLocation] = useState(initialLocation);
  const [dateRange, setDateRange] = useState(initialDates);
  const [guests, setGuests] = useState(initialGuests);

  const [openWhere, setOpenWhere] = useState(false);
  const [openDates, setOpenDates] = useState(false);
  const [openGuests, setOpenGuests] = useState(false);

  const [activeField, setActiveField] = useState(null);

  useEffect(() => setLocation(initialLocation), [initialLocation]);
  useEffect(() => setDateRange(initialDates), [initialDates]);
  useEffect(() => setGuests(initialGuests), [initialGuests]);
  useEffect(() => {
    const num = Number(initialGuests);
    if (!isNaN(num)) setGuests(String(num));
  }, [initialGuests]);

  const closeAll = () => {
    setOpenWhere(false);
    setOpenDates(false);
    setOpenGuests(false);
    setActiveField(null);
  };

  const formatRange = (rangeStr) => {
    if (!rangeStr) return t(language, "tourSearch.addDates");
    const [d1, d2] = rangeStr.split("_to_");
    return `${new Date(d1).toDateString().slice(4)} → ${new Date(d2).toDateString().slice(4)}`;
  };

  const handleSearchClick = () => {
    const params = new URLSearchParams();

    if (location) params.set("location", location);
    if (dateRange) params.set("dates", dateRange);
    if (guests) params.set("guests", guests);

    if (onSearch) {
      onSearch({ location, dates: dateRange, guests, params });
    }

    closeAll();
  };

  return (
    <div className="expsearch-wrapper">
      <div className="expsearch-bar">

        {/* WHERE */}
        <button
          className={`exp-sf exp-btn ${activeField === "where" ? "active" : ""} ${location ? "has-value" : ""}`}
          onClick={() => {
            const show = !openWhere;
            closeAll();
            setOpenWhere(show);
            setActiveField(show ? "where" : null);
          }}
        >
          <label>{t(language, "tourSearch.where")}</label>

          <div className="exp-value-row">
            <div className="exp-value">
              {location || t(language, "tourSearch.searchDestinations")}
            </div>

            {location && (
              <button
                className="exp-clear"
                onClick={(e) => {
                  e.stopPropagation();
                  setLocation("");
                }}
              >
                <Icon icon="mdi:close-circle" width="16" />
              </button>
            )}
          </div>
        </button>

        {/* DATES */}
        <button
          className={`exp-sf exp-btn ${activeField === "dates" ? "active" : ""} ${dateRange ? "has-value" : ""}`}
          onClick={() => {
            const show = !openDates;
            closeAll();
            setOpenDates(show);
            setActiveField(show ? "dates" : null);
          }}
        >
          <label>{t(language, "tourSearch.dates")}</label>

          <div className="exp-value-row">
            <div className="exp-value">{formatRange(dateRange)}</div>

            {dateRange && (
              <button
                className="exp-clear"
                onClick={(e) => {
                  e.stopPropagation();
                  setDateRange("");
                }}
              >
                <Icon icon="mdi:close-circle" width="16" />
              </button>
            )}
          </div>
        </button>

        {/* GUESTS */}
        <button
          className={`exp-sf exp-btn ${activeField === "guests" ? "active" : ""} ${guests !== "1" ? "has-value" : ""}`}
          onClick={() => {
            const show = !openGuests;
            closeAll();
            setOpenGuests(show);
            setActiveField(show ? "guests" : null);
          }}
        >
          <label>{t(language, "tourSearch.guests")}</label>

          <div className="exp-value-row">
            <div className="exp-value">
              {guests !== "1"
                ? t(language, "tourSearch.guestsCount", { count: guests })
                : t(language, "tourSearch.addGuests")}
            </div>

            {guests !== "1" && (
              <button
                className="exp-clear"
                onClick={(e) => {
                  e.stopPropagation();
                  setGuests("1");
                }}
              >
                <Icon icon="mdi:close-circle" width="16" />
              </button>
            )}
          </div>
        </button>

        {/* SEARCH BUTTON */}
        <button className="exp-search-btn" onClick={handleSearchClick}>
          <Icon icon="mdi:magnify" width="20" />
        </button>
      </div>

      {/* POPUPS */}
      <SearchWhere
        open={openWhere}
        onClose={() => {
          setOpenWhere(false);
          setActiveField(null);
        }}
        onSelectRegion={(r) => {
          setLocation(r.title);
          setOpenWhere(false);
          setActiveField(null);
        }}
      />

      <ExperienceSearchDates
        open={openDates}
        onClose={() => {
          setOpenDates(false);
          setActiveField(null);
        }}
        value={dateRange}
        onSelect={(range) => {
          setDateRange(range);
          setOpenDates(false);
          setActiveField(null);
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
