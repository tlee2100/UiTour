import React from "react";
import { useHost } from "../../contexts/HostContext";
import { useNavigate } from "react-router-dom";
import "./HostExperience.css";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";
import { useCurrency } from "../../contexts/CurrencyContext";   // ⭐ ADD

export default function HostExperiencePreview() {
  const { experienceData, experiencePhotosRAM, experienceItineraryRAM } = useHost();
  const { language } = useLanguage();
  const { format, convertToCurrent, currency } = useCurrency(); // ⭐ ADD

  const d = experienceData;
  const navigate = useNavigate();

  const photos = experiencePhotosRAM || [];

  const cover =
    photos.find((p) => p.isCover) ||
    photos[0] ||
    null;

  // i18n Category labels
  const categoryLabel = t(language, `hostExperience.choose.categories.${d.mainCategory}`);

  // ⭐ Base price stored as USD → convert to current currency
  const baseUSD = Number(d.pricing.basePrice || 0);
  const displayBase = convertToCurrent(baseUSD);

  return (
    <div className="he-preview-page">
      <div className="he-preview-container">

        {/* HERO */}
        <div className="he-preview-hero">

          {cover && (
            <img
              src={cover.preview}
              alt="cover"
              className="he-preview-cover"
            />
          )}

          <h1 className="he-preview-title he-text-safe">{d.tourName}</h1>

          {d.summary && (
            <p className="he-preview-description he-text-safe">{d.summary}</p>
          )}

          {d.location.addressLine && (
            <div className="he-preview-location he-text-safe">
              📍 {d.location.addressLine}
            </div>
          )}
        </div>

        {/* BASIC INFORMATION */}
        <section className="he-preview-section">
          <h2 className="he-preview-section-title">
            {t(language, "hostExperience.preview.basicInfo")}
          </h2>

          <div className="he-preview-card">
            <div className="he-row-safe">
              <b>{t(language, "hostExperience.preview.category")}:</b>
              <span className="he-text-safe">{categoryLabel}</span>
            </div>

            <div className="he-row-safe">
              <b>{t(language, "hostExperience.preview.yearsOfExperience")}:</b>
              <span className="he-text-safe">
                {d.yearsOfExperience} {t(language, "hostExperience.preview.years")}
              </span>
            </div>

            <div className="he-preview-divider"></div>

            <div className="he-row-safe">
              <b>{t(language, "hostExperience.preview.description")}:</b>
              <span className="he-text-safe">{d.description}</span>
            </div>
          </div>
        </section>

        {/* QUALIFICATIONS */}
        <section className="he-preview-section">
          <h2 className="he-preview-section-title">
            {t(language, "hostExperience.preview.qualifications")}
          </h2>

          <div className="he-preview-card">
            <div className="he-row-safe">
              <b>{t(language, "hostExperience.qualification.intro")}:</b>
              <span className="he-text-safe">{d.qualifications.intro}</span>
            </div>

            <div className="he-row-safe">
              <b>{t(language, "hostExperience.qualification.expertise")}:</b>
              <span className="he-text-safe">{d.qualifications.expertise}</span>
            </div>

            <div className="he-row-safe">
              <b>{t(language, "hostExperience.qualification.recognition")}:</b>
              <span className="he-text-safe">{d.qualifications.recognition}</span>
            </div>
          </div>
        </section>

        {/* LOCATION */}
        <section className="he-preview-section">
          <h2 className="he-preview-section-title">
            {t(language, "hostExperience.preview.location")}
          </h2>

          <div className="he-preview-card">
            <div className="he-row-safe">
              <b>{t(language, "hostExperience.preview.address")}:</b>
              <span className="he-text-safe">{d.location.addressLine}</span>
            </div>

            <div className="he-row-safe">
              <b>{t(language, "hostExperience.preview.city")}:</b>
              <span className="he-text-safe">{d.location.city}</span>
            </div>

            <div className="he-row-safe">
              <b>{t(language, "hostExperience.preview.country")}:</b>
              <span className="he-text-safe">{d.location.country}</span>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="he-preview-section">
          <h2 className="he-preview-section-title">
            {t(language, "hostExperience.preview.pricing")}
          </h2>

          <div className="he-preview-card">

            {/* BASE PRICE */}
            <div className="he-row-safe">
              <b>{t(language, "hostExperience.preview.basePrice")}:</b>
              <span className="he-text-safe">
                {format(displayBase)}
              </span>
            </div>

            {/* CURRENCY (user-facing currency) */}
            <div className="he-row-safe">
              <b>{t(language, "hostExperience.preview.currency")}:</b>
              <span className="he-text-safe">{currency}</span>
            </div>

            {/* PRICE UNIT (not related to currency) */}
            <div className="he-row-safe">
              <b>{t(language, "hostExperience.preview.pricePer")}:</b>
              <span className="he-text-safe">
                {d.pricing.priceUnit}
              </span>
            </div>

          </div>
        </section>

        {/* CAPACITY */}
        <section className="he-preview-section">
          <h2 className="he-preview-section-title">
            {t(language, "hostExperience.preview.capacity")}
          </h2>

          <div className="he-preview-card">
            <div>
              <b>{t(language, "hostExperience.preview.maxGuests")}:</b>{" "}
              {d.capacity.maxGuests}
            </div>
          </div>
        </section>

        {/* TIME SLOTS */}
        <section className="he-preview-section">
          <h2 className="he-preview-section-title">
            {t(language, "hostExperience.preview.timeSlots")}
          </h2>

          <div className="he-preview-card">
            {d.booking.timeSlots.length === 0 ? (
              <div>{t(language, "hostExperience.preview.noTimeSlots")}</div>
            ) : (
              d.booking.timeSlots.map((tSlot, i) => (
                <div key={i} className="he-text-safe">
                  • {tSlot.startTime}
                </div>
              ))
            )}
          </div>
        </section>

        {/* ITINERARY */}
        <section className="he-preview-section">
          <h2 className="he-preview-section-title">
            {t(language, "hostExperience.preview.itinerary")}
          </h2>

          <div className="he-preview-card">
            {d.experienceDetails.length === 0 ? (
              <div>{t(language, "hostExperience.preview.noActivities")}</div>
            ) : (
              d.experienceDetails.map((item, i) => {
                const ram = experienceItineraryRAM.find(x => x.id === item.id);
                return (
                  <div key={i} className="he-preview-itinerary-item">
                    {ram?.preview && (
                      <img
                        src={ram.preview}
                        alt=""
                        className="he-preview-itinerary-photo"
                      />
                    )}
                    <div className="he-preview-itinerary-text">
                      <h3 className="he-text-safe">{item.title}</h3>
                      <p className="he-text-safe">{item.content}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* PHOTOS */}
        <section className="he-preview-section">
          <h2 className="he-preview-section-title">
            {t(language, "hostExperience.preview.photos")}
          </h2>

          <div className="he-preview-photo-grid">
            {photos.map((p, i) => (
              <img
                key={i}
                src={p.preview}
                alt=""
                className="he-preview-photo-item"
              />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
