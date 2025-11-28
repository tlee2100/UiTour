import React from "react";
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import HostHeader from "../components/headers/HostHeader";
import HostFooter from "../components/footers/HostFooter";
import { useHost } from "../contexts/HostContext";
import ErrorModal from "../components/modals/ErrorModal";
import SuccessModal from "../components/modals/SuccessModal";
import { useLanguage } from "../contexts/LanguageContext";
import { t } from "../utils/translations";
import "./HostLayout.css";

function HostLayoutContent() {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { pathname } = useLocation();
  const { language } = useLanguage();            // <── THÊM
  const host = useHost();
  const navigate = useNavigate();

  // đọc flow route
  const ROUTE_FLOW = {
    "/host/stay/create/choose": {
      prev: "/host/today",
      next: "/host/stay/create/typeofplace"
    },
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
      next: "/host/stay/create/fees",
    },
    "/host/stay/create/fees": {
      prev: "/host/stay/create/description",
      next: "/host/stay/create/weekday-price",
    },
    "/host/stay/create/weekday-price": {
      prev: "/host/stay/create/fees",
      next: "/host/stay/create/weekend-price",
    },
    "/host/stay/create/weekend-price": {
      prev: "/host/stay/create/weekday-price",
      next: "/host/stay/create/discount",
    },
    "/host/stay/create/discount": {
      prev: "/host/stay/create/weekend-price",
      next: "/host/stay/create/rules-safety",
    },
    "/host/stay/create/rules-safety": {
      prev: "/host/stay/create/discount",
      next: "/host/stay/create/preview",
    },
    "/host/stay/create/preview": {
      prev: "/host/stay/create/rules-safety",
      isLast: true,
    },

    // ============= EXPERIENCE FLOW =============
    "/host/experience/create/choose": {
      prev: "/host/today",
      next: "/host/experience/create/years"
    },
    "/host/experience/create/years": {
      prev: "/host/experience/create/choose",
      next: "/host/experience/create/qualification"
    },
    "/host/experience/create/qualification": {
      prev: "/host/experience/create/years",
      next: "/host/experience/create/describe-title"
    },
    "/host/experience/create/describe-title": {
      prev: "/host/experience/create/qualification",
      next: "/host/experience/create/locate"
    },
    "/host/experience/create/locate": {
      prev: "/host/experience/create/describe-title",
      next: "/host/experience/create/photos"
    },
    "/host/experience/create/photos": {
      prev: "/host/experience/create/locate",
      next: "/host/experience/create/itinerary"
    },
    "/host/experience/create/itinerary": {
      prev: "/host/experience/create/photos",
      next: "/host/experience/create/max-guests"
    },
    "/host/experience/create/max-guests": {
      prev: "/host/experience/create/itinerary",
      next: "/host/experience/create/discount"
    },
    "/host/experience/create/discount": {
      prev: "/host/experience/create/max-guests",
      next: "/host/experience/create/preview"
    },
    "/host/experience/create/preview": {
      prev: "/host/experience/create/discount",
      isLast: true
    },

  };



  const { prev, next, isLast } = ROUTE_FLOW[pathname] || {};

  const stepKey = pathname.split("/").pop();
  const disabledNext = next && !host.canMoveToStep(stepKey);

  async function handlePublish() {
    const result = host.validateAll();
    if (!result.ok) {
      setErrorMessage(result.message);
      return;
    }

    const response = await host.sendHostData();

    if (!response.ok) {
      setErrorMessage(response.message);
      return;
    }

    setSuccessMessage(response.message);
    host.reset();
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

        /* THÊM NHÃN NGÔN NGỮ */
        nextLabel={t(language, "common.next")}
        backLabel={t(language, "common.back")}
        publishLabel={t(language, "common.publish")}
      />

      {/* ERROR MODAL */}
      <ErrorModal
        title={t(language, "common.error")}        // <── đa ngôn ngữ
        message={errorMessage}
        onClose={() => setErrorMessage("")}
      />

      {/* SUCCESS MODAL */}
      <SuccessModal
        title={t(language, "common.success")}      // <── đa ngôn ngữ
        message={successMessage}
        onClose={() => {
          setSuccessMessage("");
          navigate("/host/listings");
        }}
      />
    </div>
  );
}

export default function HostLayout() {
  return <HostLayoutContent />;
}
