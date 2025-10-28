import React from "react";
import "./InfoThingsToKnow.css";

export default function InfoThingsToKnow() {
  return (
    <div className="itk-wrapper">
      <div className="itk-title">Things to know</div>

      <div className="itk-columns">
        {/* Column 1: House Rules */}
        <div className="itk-column">
          <div className="itk-heading">House rules</div>
          <div className="itk-list">
            <div className="itk-item">
              <div className="itk-text">Check-in after 2:00 PM</div>
            </div>
            <div className="itk-item">
              <div className="itk-text">Self check-in with lockbox</div>
            </div>
            <div className="itk-item">
              <div className="itk-text">No shopping inside property</div>
            </div>
            <div className="itk-item">
              <div className="itk-text">No open flames</div>
            </div>
            <div className="itk-item">
              <div className="itk-text">Pets allowed</div>
            </div>
            <div className="itk-item">
              <div className="itk-text">No parties or events</div>
            </div>
          </div>
        </div>

        {/* Column 2: Health & Safety */}
        <div className="itk-column">
          <div className="itk-heading">Health & safety</div>
          <div className="itk-list">
            <div className="itk-item">
              <div className="itk-text">
                UiTour’s COVID-19 safety practices apply
              </div>
            </div>
            <div className="itk-item">
              <div className="itk-text">
                Surfaces sanitized between stays
              </div>
            </div>
            <div className="itk-item">
              <div className="itk-text">No carbon monoxide alarm</div>
            </div>
            <div className="itk-item">
              <div className="itk-text">No smoke alarm</div>
            </div>
            <div className="itk-item">
              <div className="itk-text">Security deposit required</div>
            </div>
          </div>

          <div className="itk-link">
            <span className="itk-link-text">Show more</span>
          </div>
        </div>

        {/* Column 3: Cancellation Policy */}
        <div className="itk-column">
          <div className="itk-heading">Cancellation policy</div>
          <div className="itk-subtext">Free cancellation before Nov 14</div>

          <div className="itk-link">
            <span className="itk-link-text">Show details</span>
          </div>
        </div>
      </div>
    </div>
  );
}
