import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";


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

  // BASIC INFO (FE + BE)
  tourName: "",
  summary: "",
  description: "",
  mainCategory: "",   // chọn từ trang Choose
  yearsOfExperience: 10,
  qualifications: {
    intro: "",
    expertise: "",
    recognition: ""
  },

  // LOCATION
  location: {
    addressLine: "",
    city: "",
    country: "",
    lat: null,
    lng: null,
  },
  cityID: null,
  countryID: null,

  // PRICING
  pricing: {
    basePrice: "",
    currency: "USD",
    priceUnit: "perPerson",
  },

  // GUEST CAPACITY
  capacity: {
    maxGuests: 1,
  },

  // BOOKING TIME SLOTS
  booking: {
    timeSlots: [],     // FE tự quản lý
  },

  // MEDIA
  media: {
    cover: null,
    photos: [],
  },

  // DURATION
  durationHours: 1,
  durationDays: 1,

  // DETAILS / WHAT INCLUDED
  experienceDetails: [],

  // STATUS
  isActive: true,

  startDate: "",
  endDate: "",
  createdAt: null,

  // BACKEND-ONLY FIELDS (OPTIONAL)
  cancellationID: null,
  cancellationPolicy: null,
  participants: [],
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
  const [loaded, setLoaded] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(true);

  const [photosReady, setPhotosReady] = useState(false);


  const location = useLocation();

  useEffect(() => {
    // Tự động đặt flow type theo URL
    if (location.pathname.startsWith("/host/experience")) {
      setType("experience");
    } else if (location.pathname.startsWith("/host/stay")) {
      setType("stay");
    }
  }, [location.pathname]);


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
      // EXPERIENCE FLOW
      if (step === "location") {
        setExperienceData(prev => ({
          ...prev,
          location: { ...prev.location, ...values }
        }));
      }
      else if (step === "qualification") {
        setExperienceData(prev => ({
          ...prev,
          qualifications: { ...prev.qualifications, ...values }   // values = { intro: "...", expertise: "..."}
        }));
      }
      else if (step === "pricing") {
        setExperienceData(prev => ({
          ...prev,
          pricing: { ...prev.pricing, ...values }
        }));
      }
      else if (step === "capacity") {
        setExperienceData(prev => ({
          ...prev,
          capacity: { ...prev.capacity, ...values }
        }));
      }
      else if (step === "booking") {
        setExperienceData(prev => ({
          ...prev,
          booking: { ...prev.booking, ...values }
        }));
      }
      else if (step === "photos") {
        setExperienceData(prev => ({
          ...prev,
          media: {
            ...prev.media,
            photos: values.photos,
            cover: values.cover
          }
        }));

        setCompletedStep(prev => ({ ...prev, photos: true, media: true }));
        return;
      }
      else {
        setExperienceData(prev => ({ ...prev, ...values }));
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
    }
    else {
      // EXPERIENCE VALIDATION

      if (step === "choose")
        return !!experienceData.mainCategory;

      if (step === "years")
        return Number(experienceData.yearsOfExperience) >= 0;

      if (step === "qualification")
        return true;

      if (step === "title")
        return experienceData.tourName.trim().length > 0;

      if (step === "description")
        return experienceData.description.trim().length > 0;

      if (step === "locate")
        return !!experienceData.location.lat && !!experienceData.location.lng;

      if (step === "pricing")
        return Number(experienceData.pricing.basePrice) > 0;

      if (step === "capacity")
        return Number(experienceData.capacity.maxGuests) >= 1;

      if (step === "photos")
        return experienceData.media.photos.length > 0;

      if (step === "title") return experienceData.tourName.trim().length > 0;
      if (step === "description") return experienceData.description.trim().length > 0;

      if (step === "itinerary")
        return experienceData.experienceDetails.length > 0;

      if (step === "capacity")
        return Number(experienceData.capacity.maxGuests) >= 1;

      if (step === "timeslots")
        return experienceData.booking.timeSlots.length > 0;

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

  async function sendHostData() {
    const data = getFinalData();
    try {
      let payload;
      if (type === "stay") {
        payload = formatStayDataForAPI(data);
      } else {
        payload = formatExperienceDataForAPI(data);
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

  useEffect(() => {

    const savedStay = localStorage.getItem("host_stay_draft");

    if (savedStay) {
      setStayData(JSON.parse(savedStay));
    }

    const savedExp = localStorage.getItem("host_exp_draft");

    if (savedExp) {
      const exp = JSON.parse(savedExp);

      // normalize photos: đảm bảo không crash khi thiếu file
      // --- Strong normalize ---
      exp.media.photos = (exp.media?.photos || []).map(p => {
        const preview = p.preview || p.serverUrl || "";

        return {
          file: null,                 // tránh UI crash
          preview,
          name: p.name || "",
          caption: p.caption || "",
          serverUrl: p.serverUrl || "",
          isCover: preview === exp.media.cover
        };
      });

      // Nếu cover rỗng thì đặt auto ảnh đầu
      if (!exp.media.cover && exp.media.photos.length > 0) {
        exp.media.cover = exp.media.photos[0].preview;
      }


      setExperienceData(exp);                 // ❗ chỉ set 1 lần duy nhất
      setCompletedStep(prev => ({
        ...prev,
        photos: exp.media.photos.length > 0,
        media: exp.media.photos.length > 0
      }));
    }

    setPhotosReady(true);
    setLoaded(true);
    setLoadingDraft(false);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem("host_stay_draft", JSON.stringify(stayData));
    }
  }, [stayData, loaded]);

  useEffect(() => {
    if (!loaded) return; // <— ngăn chạy save lúc mới load draft

    const expForStorage = {
      ...experienceData,
      booking: {
        ...experienceData.booking
      },
      media: {
        ...experienceData.media,
        photos: experienceData.media.photos.map(p => ({
          preview: p.preview,
          name: p.name,
          caption: p.caption,
          serverUrl: p.serverUrl
        }))
      }
    };

    localStorage.setItem("host_exp_draft", JSON.stringify(expForStorage));
  }, [experienceData, loaded]);

  function reset() {
    localStorage.removeItem("host_stay_draft");
    localStorage.removeItem("host_exp_draft");

    setStayData({ ...initialStayData });
    setExperienceData({ ...initialExperienceData });
    setCompletedStep({});
  }


  function getDebugData() {
    return {
      raw: type === "stay" ? stayData : experienceData,
      formatted:
        type === "stay"
          ? formatStayDataForAPI(stayData)
          : formatExperienceDataForAPI(experienceData),
    };
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
        getDebugData,
        loadingDraft,
        photosReady,
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

function formatExperienceDataForAPI(d) {
  return {
    tourID: d.tourID || null,
    hostID: d.hostID,

    tourName: d.tourName,
    description: d.description,
    summary: d.summary,
    mainCategory: d.mainCategory,
    qualifications: d.qualifications,

    // Location
    location: d.location.addressLine,
    cityID: d.cityID,
    countryID: d.countryID,
    lat: d.location.lat,
    lng: d.location.lng,

    // Pricing
    price: Number(d.pricing.basePrice),
    currency: d.pricing.currency,

    // Capacity
    maxGuests: d.capacity.maxGuests,

    // Duration
    durationDays: d.durationDays,
    durationHours: d.durationHours,

    // Time slots (optional—tùy BE có hỗ trợ hay không)
    timeSlots: d.booking.timeSlots,

    // Photos
    photos: d.media.photos.map((p, i) => ({
      url: p.serverUrl || "",
      caption: p.caption || "",
      sortIndex: i + 1
    })),
    coverPhoto: d.media.cover,

    startDate: d.startDate,
    endDate: d.endDate,
    active: d.isActive
  };
}


// ============================================================
// 8️⃣ HOOK TIỆN DỤNG
// ============================================================
export function useHost() {
  return useContext(HostContext);
}
