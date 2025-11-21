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

          <h1 className="he-preview-title">{d.tourName}</h1>

          {d.summary && (
            <p className="he-preview-description">{d.summary}</p>
          )}

          {d.location.addressLine && (
            <div className="he-preview-location">
              📍 {d.location.addressLine}
            </div>
          )}
        </div>

        {/* ======================================================= */}
        {/*  BASIC INFO                                             */}
        {/* ======================================================= */}
        <section className="he-preview-section">
          <h2 className="he-preview-section-title">Basic information</h2>

          <div className="he-preview-card">
            <div>
              <b>Category:</b> {CATEGORY_LABELS[d.mainCategory] || d.mainCategory}
            </div>

            <div>
              <b>Years of experience:</b> {d.yearsOfExperience} years
            </div>

            <div className="he-preview-divider"></div>

            <div>
              <b>Description:</b>
              <div>{d.description}</div>
            </div>
          </div>
        </section>

        {/* ======================================================= */}
        {/*  QUALIFICATIONS                                         */}
        {/* ======================================================= */}
        <section className="he-preview-section">
          <h2 className="he-preview-section-title">Qualifications</h2>

          <div className="he-preview-card">
            <div><b>Introduction:</b> {d.qualifications.intro}</div>
            <div><b>Expertise:</b> {d.qualifications.expertise}</div>
            <div><b>Recognition:</b> {d.qualifications.recognition}</div>
          </div>
        </section>

        {/* ======================================================= */}
        {/*  LOCATION                                               */}
        {/* ======================================================= */}
        <section className="he-preview-section">
          <h2 className="he-preview-section-title">Location</h2>

          <div className="he-preview-card">
            <div><b>Address:</b> {d.location.addressLine}</div>
            <div><b>City:</b> {d.location.city}</div>
            <div><b>Country:</b> {d.location.country}</div>
          </div>
        </section>

        {/* ======================================================= */}
        {/*  PRICING                                                */}
        {/* ======================================================= */}
        <section className="he-preview-section">
          <h2 className="he-preview-section-title">Pricing</h2>

          <div className="he-preview-card">
            <div><b>Base price:</b> ${d.pricing.basePrice}</div>
            <div><b>Currency:</b> {d.pricing.currency}</div>
            <div><b>Price per:</b> {d.pricing.priceUnit}</div>
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
                <div key={i}>• {t.startTime}</div>
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
                      <h3>{item.title}</h3>
                      <p>{item.content}</p>
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
