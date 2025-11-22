import React from "react";
import { useHost } from "../../contexts/HostContext";
import { useNavigate } from "react-router-dom";
import "./HostExperience.css";

export default function HostExperiencePreview() {
  const { experienceData, experiencePhotosRAM, experienceItineraryRAM } = useHost();
  const d = experienceData;
  const navigate = useNavigate();

  const photos = experiencePhotosRAM || [];

  // ===== PICK COVER ==================================================
  const cover =
    photos.find((p) => p.isCover) ||
    photos[0] ||
    null;

  // ===== CATEGORY LABELS (optional) ==================================
  const CATEGORY_LABELS = {
    fitness: "Fitness / Gym",
    cooking: "Cooking",
    crafting: "Crafting",
    adventure: "Adventure",
    art: "Art & Creativity",
  };

  return (
    <div className="he-preview-page">
      <div className="he-preview-container">

        {/* ======================================================= */}
        {/*  HERO / COVER                                           */}
        {/* ======================================================= */}
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

        <section className="he-preview-section">
          <h2 className="he-preview-section-title">Basic information</h2>

          <div className="he-preview-card">
            <div className="he-row-safe">
              <b>Category:</b>
              <span className="he-text-safe">
                {CATEGORY_LABELS[d.mainCategory] || d.mainCategory}
              </span>
            </div>

            <div className="he-row-safe">
              <b>Years of experience:</b>
              <span className="he-text-safe">{d.yearsOfExperience} years</span>
            </div>

            <div className="he-preview-divider"></div>

            <div className="he-row-safe">
              <b>Description:</b>
              <span className="he-text-safe">{d.description}</span>
            </div>
          </div>
        </section>

        {/* ======================================================= */}
        {/*  QUALIFICATIONS                                         */}
        {/* ======================================================= */}
        <section className="he-preview-section">
          <h2 className="he-preview-section-title">Qualifications</h2>

          <div className="he-preview-card">
            <div className="he-row-safe">
              <b>Introduction:</b>
              <span className="he-text-safe">{d.qualifications.intro}</span>
            </div>

            <div className="he-row-safe">
              <b>Expertise:</b>
              <span className="he-text-safe">{d.qualifications.expertise}</span>
            </div>

            <div className="he-row-safe">
              <b>Recognition:</b>
              <span className="he-text-safe">{d.qualifications.recognition}</span>
            </div>
          </div>

        </section>

        {/* ======================================================= */}
        {/*  LOCATION                                               */}
        {/* ======================================================= */}
        <section className="he-preview-section">
          <h2 className="he-preview-section-title">Location</h2>

          <div className="he-preview-card">
            <div className="he-row-safe">
              <b>Address:</b>
              <span className="he-text-safe">{d.location.addressLine}</span>
            </div>

            <div className="he-row-safe">
              <b>City:</b>
              <span className="he-text-safe">{d.location.city}</span>
            </div>

            <div className="he-row-safe">
              <b>Country:</b>
              <span className="he-text-safe">{d.location.country}</span>
            </div>
          </div>

        </section>

        {/* ======================================================= */}
        {/*  PRICING                                                */}
        {/* ======================================================= */}
        <section className="he-preview-section">
          <h2 className="he-preview-section-title">Pricing</h2>

          <div className="he-preview-card">
            <div className="he-row-safe">
              <b>Base price:</b>
              <span className="he-text-safe">${d.pricing.basePrice}</span>
            </div>

            <div className="he-row-safe">
              <b>Currency:</b>
              <span className="he-text-safe">{d.pricing.currency}</span>
            </div>

            <div className="he-row-safe">
              <b>Price per:</b>
              <span className="he-text-safe">{d.pricing.priceUnit}</span>
            </div>
          </div>

        </section>

        {/* ======================================================= */}
        {/*  CAPACITY                                               */}
        {/* ======================================================= */}
        <section className="he-preview-section">
          <h2 className="he-preview-section-title">Guest Capacity</h2>

          <div className="he-preview-card">
            <div><b>Maximum guests:</b> {d.capacity.maxGuests}</div>
          </div>
        </section>

        {/* ======================================================= */}
        {/*  TIME SLOTS                                             */}
        {/* ======================================================= */}
        <section className="he-preview-section">
          <h2 className="he-preview-section-title">Available time slots</h2>

          <div className="he-preview-card">
            {d.booking.timeSlots.length === 0 ? (
              <div>No time slots added</div>
            ) : (
              d.booking.timeSlots.map((t, i) => (
                <div key={i} className="he-text-safe">• {t.startTime}</div>
              ))
            )}
          </div>

        </section>

        {/* ======================================================= */}
        {/*  ITINERARY / EXPERIENCE DETAILS                         */}
        {/* ======================================================= */}
        <section className="he-preview-section">
          <h2 className="he-preview-section-title">Experience Itinerary</h2>

          <div className="he-preview-card">
            {d.experienceDetails.length === 0 ? (
              <div>No activities added</div>
            ) : (
              d.experienceDetails.map((item, i) => {
                const preview = experienceItineraryRAM.find(x => x.id === item.id);

                return (
                  <div key={i} className="he-preview-itinerary-item">
                    {preview?.preview && (
                      <img
                        src={preview.preview}
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

        {/* ======================================================= */}
        {/*  PHOTOS                                                 */}
        {/* ======================================================= */}
        <section className="he-preview-section">
          <h2 className="he-preview-section-title">Photos</h2>

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
