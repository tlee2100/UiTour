import React from "react";
import "./Footer.css";
import { Icon } from "@iconify/react";

export default function Footer() {
  return (
    <footer className="footer">
      {/* 4 columns */}
      <div className="footer-columns">
        <div className="footer-col">
          <h4 className="footer-title">Support</h4>
          <a href="#">Help Center</a>
          <a href="#">Safety information</a>
          <a href="#">Cancellation options</a>
          <a href="#">Our COVID-19 Response</a>
          <a href="#">Supporting people with disabilities</a>
          <a href="#">Report a neighborhood concern</a>
        </div>

        <div className="footer-col">
          <h4 className="footer-title">Community</h4>
          <a href="#">Accessibility</a>
          <a href="#">Combating discrimination</a>
          <a href="#">Invite friends</a>
          <a href="#">Gift cards</a>
          <a href="#">UiTour.org</a>
        </div>

        <div className="footer-col">
          <h4 className="footer-title">Hosting</h4>
          <a href="#">Try hosting</a>
          <a href="#">AirCover for Hosts</a>
          <a href="#">Explore hosting resources</a>
          <a href="#">Visit community forum</a>
          <a href="#">How to host responsibly</a>
        </div>

        <div className="footer-col">
          <h4 className="footer-title">About</h4>
          <a href="#">Newsroom</a>
          <a href="#">Learn about new features</a>
          <a href="#">Letter from founders</a>
          <a href="#">Careers</a>
          <a href="#">Investors</a>
        </div>
      </div>

      {/* Kicker */}
      <div className="footer-kicker">
        <hr className="footer-line" />
        <div className="sub-footer">
          <div className="sub-left">
            <span>© 2025 UiTour, Inc.</span>
            <span className="dot" />
            <a href="#">Privacy</a>
            <span className="dot" />
            <a href="#">Terms</a>
            <span className="dot" />
            <a href="#">Sitemap</a>
          </div>
          <div className="sub-right">
            <div className="lang-currency">
              <span className="lang">
                <Icon icon="mdi:earth" className="earth-icon" width="16" height="16" />
                English (US)
              </span>
              <span className="currency">
                <span className="currency-symbol">$</span>USD
              </span>
            </div>
            <div className="social">
              <a href="#">
                <Icon icon="mdi:facebook" width="20" height="20" />
              </a>
              <a href="#">
                <Icon icon="mdi:twitter" width="20" height="20" />
              </a>
              <a href="#">
                <Icon icon="mdi:instagram" width="20" height="20" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}