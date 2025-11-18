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

  // AMENITIES
  amenities: [],
};

// 🧭 Experience / Tour
const initialExperienceData = {
  tourID: null,
  hostID: null,

  // BASIC INFO (FE + BE)
  tourName: "",
  summary: "",
  description: "",
  mainCategory: "", // chọn từ trang Choose
  yearsOfExperience: 10,
  qualifications: {
    intro: "",
    expertise: "",
    recognition: "",
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
    timeSlots: [], // FE tự quản lý
  },

  // MEDIA
  media: {
    cover: null,
    photos: [],
  },

  discounts: {
    earlyBird: false,
    custom: [],
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
    } else {
      // EXPERIENCE FLOW
      if (step === "location") {
        setExperienceData((prev) => ({
          ...prev,
          location: { ...prev.location, ...values },
        }));
      } else if (step === "qualification") {
        setExperienceData((prev) => ({
          ...prev,
          qualifications: { ...prev.qualifications, ...values },
        }));
      } else if (step === "pricing") {
        setExperienceData((prev) => ({
          ...prev,
          pricing: { ...prev.pricing, ...values },
        }));
      } else if (step === "capacity") {
        setExperienceData((prev) => ({
          ...prev,
          capacity: { ...prev.capacity, ...values },
        }));
      } else if (step === "booking") {
        setExperienceData((prev) => ({
          ...prev,
          booking: { ...prev.booking, ...values },
        }));
      } else if (step === "discounts") {
        setExperienceData((prev) => ({
          ...prev,
          discounts: {
            ...prev.discounts,
            ...values, // <-- CHỈ MERGE những gì được update
          },
        }));
        return;
      } else if (step === "photos") {
        setExperienceData((prev) => ({
          ...prev,
          media: {
            ...prev.media,
            photos: values.photos,
            cover: values.cover,
          },
        }));

        setCompletedStep((prev) => ({ ...prev, photos: true, media: true }));
        return;
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
      if (step === "title") return stayData.listingTitle.trim().length > 0;
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
      // EXPERIENCE VALIDATION
      if (step === "choose") return !!experienceData.mainCategory;

      if (step === "years")
        return Number(experienceData.yearsOfExperience) >= 0;

      if (step === "qualification") return true;

      if (step === "title") return experienceData.tourName.trim().length > 0;

      if (step === "description")
        return experienceData.description.trim().length > 0;

      if (step === "locate")
        return !!experienceData.location.lat && !!experienceData.location.lng;

      if (step === "pricing")
        return Number(experienceData.pricing.basePrice) > 0;

      if (step === "capacity")
        return Number(experienceData.capacity.maxGuests) >= 1;

      if (step === "photos") return experienceData.media.photos.length > 0;

      if (step === "itinerary")
        return experienceData.experienceDetails.length > 0;

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
  /*
    async function sendHostData() {
      const data = getFinalData();
      try {
        let payload;
        if (type === "stay") {
          // Get user from localStorage to get UserID
          const userStr = localStorage.getItem("user");
          const user = userStr ? JSON.parse(userStr) : null;
          const userID = user?.UserID || user?.userID || user?.id || null;
  
          if (!userID) {
            alert("Vui lòng đăng nhập để tạo property!");
            return false;
          }
  
          // Set userID in data (backend sẽ tự động tạo Host nếu chưa có)
          data.userID = userID;
  
          // Format data for API (sync function)
          payload = formatStayDataForAPI(data);
  
          console.log(
            "[SEND TO BACKEND]",
            JSON.stringify(payload, null, 2)
          );
  
          // Import authAPI dynamically to avoid circular dependency
          const authAPI = (await import("../services/authAPI")).default;
  
          // Call API to create property
          const result = await authAPI.createProperty(payload);
  
          console.log("[PROPERTY CREATED]", result);
          alert("Tạo property thành công!");
  
          return true;
        } else {
          payload = formatExperienceDataForAPI(data);
          // TODO: Implement experience creation API call
          console.log("[SEND EXPERIENCE TO BACKEND]", payload);
          return true;
        }
      } catch (err) {
        console.error("[SEND HOST DATA ERROR]", err);
        alert("Gửi dữ liệu thất bại: " + (err.message || "Có lỗi xảy ra"));
        return false;
      }
    }
  
    */

  //DEV MODE: -------------------------File tạm để test---------------------------------------
  async function sendHostData() {
    const data = getFinalData();

    // DEV MODE — không gửi API, không cần login
    console.warn("⚠️ DEV MODE: sendHostData() tạm thời disabled");
    console.log("📦 Payload sẽ gửi khi bật API:", {
      type,
      formatted:
        type === "stay"
          ? formatStayDataForAPI(data)
          : formatExperienceDataForAPI(data),
    });

    // báo thành công giả để UI flow không bị chặn
    alert("DEV MODE: Dữ liệu CHƯA được gửi đến backend.");
    return true;
  }


  // ============================================================
  // 7️⃣ LOAD DRAFT TỪ LOCALSTORAGE
  // ============================================================
  useEffect(() => {
    const savedStay = localStorage.getItem("host_stay_draft");

    if (savedStay) {
      try {
        const stay = JSON.parse(savedStay);
        setStayData({ ...initialStayData, ...stay });
      } catch {
        // nếu lỗi parse thì bỏ qua draft
      }
    }

    const savedExp = localStorage.getItem("host_exp_draft");

    if (savedExp) {
      try {
        const exp = JSON.parse(savedExp);

        exp.capacity = exp.capacity || { maxGuests: 1 };
        exp.pricing = exp.pricing || { basePrice: "", currency: "USD" };
        exp.booking = exp.booking || { timeSlots: [] };
        exp.discounts = exp.discounts || {
          earlyBird: false,
          custom: [],
        };

        // đảm bảo media tồn tại trước khi truy cập photos
        exp.media = exp.media || { cover: null, photos: [] };

        // normalize photos: đảm bảo không crash khi thiếu file
        exp.media.photos = (exp.media.photos || []).map((p) => {
          const preview = p.preview || p.serverUrl || "";

          return {
            file: null, // tránh UI crash
            preview,
            name: p.name || "",
            caption: p.caption || "",
            serverUrl: p.serverUrl || "",
            isCover: preview === exp.media.cover,
          };
        });

        // Nếu cover rỗng thì đặt auto ảnh đầu
        if (!exp.media.cover && exp.media.photos.length > 0) {
          exp.media.cover = exp.media.photos[0].preview;
        }

        setExperienceData({ ...initialExperienceData, ...exp });
        setCompletedStep((prev) => ({
          ...prev,
          photos: exp.media.photos.length > 0,
          media: exp.media.photos.length > 0,
        }));
      } catch {
        // lỗi parse thì bỏ qua draft
      }
    }

    setPhotosReady(true);
    setLoaded(true);
    setLoadingDraft(false);
  }, []);

  // SAVE STAY DRAFT
  useEffect(() => {
    if (loaded) {
      localStorage.setItem("host_stay_draft", JSON.stringify(stayData));
    }
  }, [stayData, loaded]);

  // SAVE EXPERIENCE DRAFT
  useEffect(() => {
    if (!loaded) return; // <— ngăn chạy save lúc mới load draft

    const expForStorage = {
      ...experienceData,

      capacity: {
        ...experienceData.capacity,
      },

      pricing: {
        ...experienceData.pricing,
      },

      booking: {
        ...experienceData.booking,
      },
      discounts: {
        earlyBird: experienceData.discounts?.earlyBird ?? false,
        byDaysBefore: experienceData.discounts?.byDaysBefore ?? [],
        byGroupSize: experienceData.discounts?.byGroupSize ?? [],
      },

      media: {
        ...experienceData.media,
        photos: experienceData.media.photos.map((p) => ({
          preview: p.preview,
          caption: p.caption,
          serverUrl: p.serverUrl,
          name: p.name,
        })),
      },
    };

    localStorage.setItem("host_exp_draft", JSON.stringify(expForStorage));
  }, [experienceData, loaded]);

  // RESET
  function resetAll() {
    localStorage.removeItem("host_stay_draft");
    localStorage.removeItem("host_exp_draft");
    setStayData(initialStayData);
    setExperienceData(initialExperienceData);
    setCompletedStep({});
  }

  function reset() {
    resetAll();
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
  // 8️⃣ EXPORT PROVIDER
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

// ============================================================
// 9️⃣ FORMATTER STAY / EXPERIENCE
// ============================================================
function formatStayDataForAPI(stayData) {
  // ========== Helper Functions ==========
  const truncate = (str, maxLength) => {
    if (!str) return "";
    return str.length > maxLength ? str.substring(0, maxLength) : str;
  };

  const toDecimal = (value) => {
    const num = Number(value);
    return isNaN(num) ? null : num;
  };

  // Convert photos safely (sync – không cần async)
  const photos = (stayData.photos || [])
    .map((p, index) => {
      const url = truncate(
        p.preview || p.serverUrl || `placeholder_photo_${index + 1}.jpg`,
        500
      );

      return {
        url,
        caption: truncate(p.caption || "", 300),
        sortIndex: p.sortIndex || index + 1,
      };
    })
    .filter((p) => p.url && p.url.trim().length > 0);

  // ========== EXTRACT + VALIDATE MAIN FIELDS ==========
  const listingTitle = truncate(stayData.listingTitle || "", 200);
  const propertyType = truncate(stayData.propertyType || "", 100);
  const price = toDecimal(stayData.pricing?.basePrice);
  const bathrooms = toDecimal(stayData.bathrooms);

  // DEV MODE: Temporarily disable UserID validation
  // if (!stayData.userID && !stayData.hostID)
  //   throw new Error("UserID is required");

  if (!listingTitle.trim()) throw new Error("ListingTitle is required");

  if (!price || price <= 0)
    throw new Error("Price must be a positive number");

  // ========== AMENITIES – FIXED 100% ==========
  // Ensure valid, unique numeric IDs
  const amenityIds = Array.from(
    new Set(
      (stayData.amenities || [])
        .map((id) => Number(id))
        .filter((id) => !isNaN(id))
    )
  );

  // Convert to backend format
  const formattedAmenities = amenityIds.map((id) => ({
    amenityID: id,
  }));

  // ========== LAT / LNG ==========
  const lat = stayData.location?.lat
    ? stayData.location.lat.toString()
    : null;
  const lng = stayData.location?.lng
    ? stayData.location.lng.toString()
    : null;

  // ========== FINAL PAYLOAD ==========
  return {
    userID: stayData.userID || stayData.hostID || null,
    listingTitle,
    description: stayData.description || "",
    location: stayData.location?.addressLine || "",
    cityID: stayData.cityID || null,
    countryID: stayData.countryID || null,
    roomTypeID: stayData.roomTypeID || null,
    bedrooms: stayData.bedrooms || null,
    beds: stayData.beds || null,
    bathrooms,
    accommodates: stayData.accommodates || null,
    price,
    currency: stayData.pricing?.currency || "USD",
    active: stayData.active ?? true,
    propertyType: propertyType || null,
    lat,
    lng,
    houseRules: stayData.houseRules
      ? JSON.stringify(stayData.houseRules)
      : null,
    photos,
    amenities: formattedAmenities,
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
      sortIndex: i + 1,
    })),
    coverPhoto: d.media.cover,

    startDate: d.startDate,
    endDate: d.endDate,
    active: d.isActive,
  };
}

// ============================================================
// 🔟 HOOK TIỆN DỤNG
// ============================================================
export function useHost() {
  return useContext(HostContext);
}
