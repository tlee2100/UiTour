import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import HostHeader from "../components/HostHeader";
import HostFooter from "../components/HostFooter";
import { HostProvider, useHost } from "../contexts/HostContext";
import "./HostLayout.css";

// Tạo bảng flow định nghĩa "trang trước" và "trang sau"
const ROUTE_FLOW = {
  // Stay Creation Flow
  "/host/stay/create/choose": { next: "/host/stay/create/typeofplace" },
  "/host/stay/create/typeofplace": {
    prev: "/host/stay/create/choose",
    next: "/host/stay/create/location",
  },
  "/host/stay/create/location": {
    prev: "/host/stay/create/typeofplace",
    next: "/host/stay/create/details",
  },
  "/host/stay/create/details": {
    prev: "/host/stay/create/location",
    next: "/host/stay/create/amenities",
  },
  "/host/stay/create/amenities": {
    prev: "/host/stay/create/details",
    next: "/host/stay/create/photos",
  },
  "/host/stay/create/photos": {
    prev: "/host/stay/create/amenities",
    next: "/host/stay/create/title",
  },
  "/host/stay/create/title": {
    prev: "/host/stay/create/photos",
    next: "/host/stay/create/description",
  },
  "/host/stay/create/description": {
    prev: "/host/stay/create/title",
    next: "/host/stay/create/weekday-price",
  },
  "/host/stay/create/weekday-price": {
    prev: "/host/stay/create/description",
    next: "/host/stay/create/weekend-price",
  },
  "/host/stay/create/weekend-price": {
    prev: "/host/stay/create/weekday-price",
    next: "/host/stay/create/discount",
  },
  "/host/stay/create/discount": {
    prev: "/host/stay/create/weekend-price",
    isLast: true,
  },

  // Experience Creation Flow
  "/host/experience/create/choose": { next: "/host/experience/create/years" },
  "/host/experience/create/years": {
    prev: "/host/experience/create/choose",
    next: "/host/experience/create/qualification",
  },
  "/host/experience/create/qualification": {
    prev: "/host/experience/create/years",
    next: "/host/experience/create/locate",
  },
  "/host/experience/create/locate": {
    prev: "/host/experience/create/qualification",
    next: "/host/experience/create/photos",
  },
  "/host/experience/create/photos": {
    prev: "/host/experience/create/locate",
    next: "/host/experience/create/describe-title",
  },
  "/host/experience/create/describe-title": {
    prev: "/host/experience/create/photos",
    next: "/host/experience/create/itinerary",
  },
  "/host/experience/create/itinerary": {
    prev: "/host/experience/create/describe-title",
    next: "/host/experience/create/max-guests",
  },
  "/host/experience/create/max-guests": {
    prev: "/host/experience/create/itinerary",
    next: "/host/experience/create/discount",
  },
  "/host/experience/create/discount": {
    prev: "/host/experience/create/max-guests",
    isLast: true,
  },
};

function HostLayoutContent() {
  const { pathname } = useLocation();
  const { prev, next, isLast } = ROUTE_FLOW[pathname] || {};
  const host = useHost();
  const navigate = useNavigate();
  const stepKey = pathname.split("/").pop();
  const disabledNext = next && !host.canMoveToStep(stepKey);
  async function handlePublish() {
    const ok = await host.sendHostData();
    if (ok) navigate("/host/demo-preview");
  }
  return (
    <div className="host-layout">
      <HostHeader />
      <main className="host-main">
        <Outlet />
      </main>
      <HostFooter 
        prevPath={prev} 
        nextPath={next} 
        isLast={isLast}
        disabledNext={disabledNext}
        onPublish={isLast ? handlePublish : undefined}
      />
    </div>
  );
}

export default function HostLayout() {
  return (
      <HostLayoutContent />
  );
}

