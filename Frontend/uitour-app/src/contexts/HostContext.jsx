import React, { createContext, useContext, useState } from "react";

// ============================================================
// 1️⃣ DỮ LIỆU MẪU CHUẨN HÓA THEO BACKEND
// ============================================================

// 🏠 Stay / Property
const initialStayData = {
  propertyID: null,
  hostID: null,
  listingTitle: "",
  description: "",
  summary: "",
  propertyType: "",
  roomTypeID: null,
  bedTypeID: null,

  // LOCATION
  location: {
    addressLine: "",
    district: "",
    city: "",
    country: "",
    lat: null,
    lng: null,
  },
  neighbourhoodID: null,
  cityID: null,
  countryID: null,

  // CAPACITY
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  accommodates: 1,
  squareFeet: null,

  // PRICING
  pricing: {
    basePrice: "",
    weekendPremium: 0, // %
    currency: "USD",
    cleaningFee: 0,
    serviceFee: 0,
    taxFee: 0,
    extraPeopleFee: 0,
    discount: 0,
    discountPercentage: 0,
    minNights: 1,
    maxNights: 30,
  },

  // RULES
  checkin_after: "14:00",
  checkout_before: "11:00",
  selfCheckIn: false,
  self_checkin_method: "Lockbox",
  no_smoking: false,
  no_open_flames: false,
  pets_allowed: false,
  houseRules: [],

  // HEALTH & SAFETY
  covidSafety: false,
  surfacesSanitized: false,
  carbonMonoxideAlarm: false,
  smokeAlarm: false,
  securityDepositRequired: false,
  securityDepositAmount: 0,

  // STATUS
  active: true,
  isBusinessReady: false,

  // MEDIA
  photos: [],
  coverPhoto: null,
};

// 🧭 Experience / Tour
const initialExperienceData = {
  tourID: null,
  hostID: null,
  tourName: "",
  description: "",
  location: "",
  cityID: null,
  city: null,
  countryID: null,
  country: null,
  durationDays: 1,
  maxGuests: 1,
  price: "",
  currency: "USD",
  startDate: "",
  endDate: "",
  createdAt: null,
  active: true,
  cancellationID: null,
  cancellationPolicy: null,
  participants: [],
  photos: [],
  reviews: [],
};

// ============================================================
// 2️⃣ TẠO CONTEXT
// ============================================================
const HostContext = createContext();

export function HostProvider({ children }) {
  const [type, setType] = useState("stay"); // stay | experience
  const [stayData, setStayData] = useState(initialStayData);
  const [experienceData, setExperienceData] = useState(initialExperienceData);
  const [completedStep, setCompletedStep] = useState({});

  // ============================================================
  // 3️⃣ CẬP NHẬT DỮ LIỆU THEO BƯỚC
  // ============================================================
  function updateField(step, values) {
    if (type === "stay") {
      // SPECIAL HANDLING: PHOTOS + COVER PHOTO
      if (step === "photos") {
        setStayData((prev) => {
          const newPhotos = values.photos || prev.photos || [];

          // 1. Nếu host chọn cover → dùng ảnh isCover = true
          const selectedCover = newPhotos.find((p) => p.isCover);

          let coverPhoto = selectedCover
            ? selectedCover.preview || selectedCover.serverUrl || null
            : prev.coverPhoto;

          // 2. Nếu chưa có cover → chọn auto
          if (!selectedCover && !prev.coverPhoto && newPhotos.length > 0) {
            // Living Room → Bedroom → First
            const living = newPhotos.find((p) => p.category === "livingroom");
            const bed = newPhotos.find((p) => p.category === "bedroom");

            const auto = living || bed || newPhotos[0];

            coverPhoto = auto.preview || auto.serverUrl || null;

            // gắn isCover vào ảnh auto
            newPhotos.forEach((p) => (p.isCover = p === auto));
          }

          return {
            ...prev,
            photos: newPhotos,
            coverPhoto,
          };
        });

        setCompletedStep((prev) => ({ ...prev, [step]: true }));
        return;
      }

      // LOCATION
      if (step === "location") {
        setStayData((prev) => ({
          ...prev,
          location: { ...prev.location, ...values },
        }));
      }
      // PRICE
      else if (step === "pricing") {
        setStayData((prev) => ({
          ...prev,
          pricing: { ...prev.pricing, ...values },
        }));
      }
      // OTHER
      else {
        setStayData((prev) => ({ ...prev, ...values }));
      }
    }
    else {
      // experience flow (giữ nguyên)
      if (step === "pricing") {
        setExperienceData((prev) => ({
          ...prev,
          price: values.price ?? prev.price,
          currency: values.currency ?? prev.currency,
        }));
      } else if (step === "photos") {
        setExperienceData((prev) => ({
          ...prev,
          photos: values.photos ?? prev.photos,
        }));
      } else {
        setExperienceData((prev) => ({ ...prev, ...values }));
      }
    }

    setCompletedStep((prev) => ({ ...prev, [step]: true }));
  }

  // ============================================================
  // 4️⃣ LẤY DATA TỔNG HỢP
  // ============================================================
  function getFinalData() {
    return type === "stay" ? stayData : experienceData;
  }

  // ============================================================
  // 5️⃣ VALIDATE TỪNG BƯỚC
  // ============================================================
  function validateStep(step) {
    if (type === "stay") {
      if (step === "choose") return !!stayData.propertyType;
      if (step === "typeofplace") return !!stayData.roomTypeID;
      if (step === "location")
        return !!stayData.location.lat && !!stayData.location.lng;
      if (step === "details")
        return (
          stayData.bedrooms > 0 &&
          stayData.beds > 0 &&
          stayData.bathrooms > 0 &&
          stayData.accommodates > 0 &&
          stayData.pricing.minNights >= 1 &&
          stayData.pricing.maxNights >= stayData.pricing.minNights
        );
      if (step === "title")
        return stayData.listingTitle.trim().length > 0;
      if (step === "description")
        return stayData.description.trim().length > 0;
      if (step === "weekday-price") {
        const price = Number(stayData.pricing.basePrice);
        return !isNaN(price) && price > 0;
      }
      if (step === "weekend-price") {
        const price = Number(stayData.pricing.basePrice);
        return !isNaN(price) && price > 0;
      }
      if (step === "photos") {
        const photos = stayData.photos || [];

        const hasBedroom = photos.some((p) => p.category === "bedroom");
        const hasBathroom = photos.some((p) => p.category === "bathroom");

        // Bắt buộc ít nhất 1 ảnh bedroom + 1 ảnh bathroom
        return hasBedroom && hasBathroom;
      }

      return true;
    } else {
      // ✅ Experience validation
      if (step === "choose") return !!experienceData.tourName;
      if (step === "locate") return !!experienceData.location;
      if (step === "pricing")
        return (
          Number(experienceData.price) > 0 &&
          experienceData.currency.trim() !== ""
        );
      if (step === "photos")
        return Array.isArray(experienceData.photos) && experienceData.photos.length > 0;
      if (step === "description")
        return experienceData.description.trim().length > 0;
      return true;
    }
  }

  function canMoveToStep(step) {
    return validateStep(step);
  }

  // ============================================================
  // 6️⃣ TIỆN ÍCH KHÁC
  // ============================================================
  function setFlowType(_type) {
    setType(_type);
  }

  function reset() {
    setStayData({ ...initialStayData });
    setExperienceData({ ...initialExperienceData });
    setCompletedStep({});
  }

  async function sendHostData() {
    const data = getFinalData();
    try {
      let payload;
      if (type === "stay") {
        payload = formatStayDataForAPI(data);
      } else {
        payload = data; // Experience có thể xử lý riêng sau
      }

      console.log("[SEND TO BACKEND]", payload);

      // TODO: gọi API thực tế
      // await api.post("/properties", payload);

      return true;
    } catch (err) {
      alert("Gửi dữ liệu thất bại: " + err.message);
      return false;
    }
  }


  // ============================================================
  // 7️⃣ EXPORT PROVIDER
  // ============================================================
  return (
    <HostContext.Provider
      value={{
        type,
        setFlowType,
        stayData,
        setStayData,
        experienceData,
        setExperienceData,
        updateField,
        completedStep,
        validateStep,
        canMoveToStep,
        getFinalData,
        reset,
        sendHostData,
      }}
    >
      {children}
    </HostContext.Provider>
  );
}

function formatStayDataForAPI(stayData) {
  return {
    propertyID: stayData.propertyID || null,
    hostID: stayData.hostID || null,
    listingTitle: stayData.listingTitle,
    description: stayData.description,
    summary: stayData.summary,
    propertyType: stayData.propertyType,
    roomTypeID: stayData.roomTypeID,
    bedTypeID: stayData.bedTypeID,

    // Gộp location
    location: stayData.location?.addressLine || "",
    lat: stayData.location?.lat || null,
    lng: stayData.location?.lng || null,

    neighbourhoodID: stayData.neighbourhoodID,
    cityID: stayData.cityID,
    countryID: stayData.countryID,

    bedrooms: stayData.bedrooms,
    beds: stayData.beds,
    bathrooms: stayData.bathrooms,
    accommodates: stayData.accommodates,
    squareFeet: stayData.squareFeet,
    minNights: stayData.pricing?.minNights || 1,
    maxNights: stayData.pricing?.maxNights || 30,

    // Pricing (flatten)
    price: Number(stayData.pricing?.basePrice) || 0,
    currency: stayData.pricing?.currency || "USD",
    cleaningFee: stayData.pricing?.cleaningFee || 0,
    serviceFee: stayData.pricing?.serviceFee || 0,
    taxFee: stayData.pricing?.taxFee || 0,
    extraPeopleFee: stayData.pricing?.extraPeopleFee || 0,
    discount: stayData.pricing?.discount || 0,
    discountPercentage: stayData.pricing?.discountPercentage || 0,

    // Rules
    checkin_after: stayData.checkin_after,
    checkout_before: stayData.checkout_before,
    selfCheckIn: stayData.selfCheckIn,
    self_checkin_method: stayData.self_checkin_method,
    no_smoking: stayData.no_smoking,
    no_open_flames: stayData.no_open_flames,
    pets_allowed: stayData.pets_allowed,
    houseRules: JSON.stringify(stayData.houseRules || []),

    // Safety
    covidSafety: stayData.covidSafety,
    surfacesSanitized: stayData.surfacesSanitized,
    carbonMonoxideAlarm: stayData.carbonMonoxideAlarm,
    smokeAlarm: stayData.smokeAlarm,
    securityDepositRequired: stayData.securityDepositRequired,
    securityDepositAmount: stayData.securityDepositAmount,

    // Meta
    isBusinessReady: stayData.isBusinessReady,
    active: stayData.active,

    // Media
    photos: stayData.photos.map((p, index) => ({
      url: p.serverUrl || "",        // sau upload
      caption: p.caption || "",
      sortIndex: index + 1
    })),
    coverPhoto: stayData.coverPhoto || (stayData.photos?.[0] || null),
  };
}


// ============================================================
// 8️⃣ HOOK TIỆN DỤNG
// ============================================================
export function useHost() {
  return useContext(HostContext);
}
