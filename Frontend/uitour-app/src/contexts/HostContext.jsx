import React, { createContext, useContext, useState } from "react";
import mockAPI from "../services/mockAPI";

// -----------------------------
// 1️⃣ Định nghĩa dữ liệu mẫu
// -----------------------------
const initialStayData = {
  category: "property",
  propertyType: "",
  roomType: "",
  location: { addressLine: "", district: "", city: "", country: "", lat: null, lng: null },
  capacity: { bedrooms: 1, beds: 1, bathrooms: 1, maxGuests: 1, squareFeet: null },
  amenities: [],
  media: { cover: null, photos: [] },
  title: "",
  summary: "",
  description: "",
  pricing: { basePrice: "", currency: "USD", priceUnit: "", fees: {}, minNights: 1, maxNights: 30 },
};

const initialExperienceData = {
  category: "experience",
  hostId: null,
  mainCategory: "", // ✅ Thêm dòng này
  title: "",
  summary: "",
  description: "",
  isActive: true,
  location: { addressLine: "", city: "", country: "", lat: null, lng: null },
  pricing: { basePrice: "", currency: "VND", priceUnit: "perPerson" },
  capacity: { maxGuests: 1 },
  booking: { timeSlots: [] },
  media: { cover: null, photos: [] },
  experienceDetails: [],
};

// -----------------------------
// 2️⃣ Tạo Context & Provider
// -----------------------------
const HostContext = createContext();

export function HostProvider({ children }) {
  const [type, setType] = useState("stay");
  const [stayData, setStayData] = useState(initialStayData);
  const [experienceData, setExperienceData] = useState(initialExperienceData);
  const [completedStep, setCompletedStep] = useState({});

  // -----------------------------
  // 3️⃣ Cập nhật dữ liệu từng bước
  // -----------------------------
  function updateField(step, values) {
    if (type === "stay") {
      if (step === "location") {
        setStayData((prev) => ({
          ...prev,
          location: { ...prev.location, ...values },
        }));
      } else if (step === "media") {
        setStayData((prev) => ({
          ...prev,
          media: { ...prev.media, ...values },
        }));
      } else {
        setStayData((prev) => ({ ...prev, ...values }));
      }
    } else {
      if (step === "location") {
        setExperienceData((prev) => ({
          ...prev,
          location: { ...prev.location, ...values },
        }));
      } else if (step === "media") {
        setExperienceData((prev) => ({
          ...prev,
          media: { ...prev.media, ...values },
        }));
      } else {
        setExperienceData((prev) => ({ ...prev, ...values }));
      }
    }

    setCompletedStep((prev) => ({ ...prev, [step]: true }));
  }

  // -----------------------------
  // 4️⃣ Lấy data tổng hợp
  // -----------------------------
  function getFinalData() {
    return type === "stay" ? stayData : experienceData;
  }

  // -----------------------------
  // 5️⃣ Validate từng bước
  // -----------------------------
  function validateStep(step) {
    if (type === "stay") {
      if (step === "choose") return !!stayData.propertyType;
      if (step === "typeofplace") return !!stayData.roomType;
      if (step === "location") return !!stayData.location.lat && !!stayData.location.lng;
      if (step === "details") {
        const { bedrooms, beds, bathrooms, maxGuests } = stayData.capacity;
        return bedrooms > 0 && beds > 0 && bathrooms > 0 && maxGuests > 0;
      }
      return true;
    } else {
      // ✅ Bổ sung validate cho experience
      if (step === "choose") return !!experienceData.mainCategory;
      if (step === "locate") return !!experienceData.location.lat && !!experienceData.location.lng;
      if (step === "years") return true; // ví dụ: tạm luôn true
      return true;
    }
  }

  function canMoveToStep(step) {
    return validateStep(step);
  }

  // -----------------------------
  // 6️⃣ Các tiện ích khác
  // -----------------------------
  function setFlowType(_type) {
    setType(_type);
  }

  function reset() {
    // ✅ clone object mới để React nhận thay đổi
    setStayData({ ...initialStayData });
    setExperienceData({ ...initialExperienceData });
    setCompletedStep({});
  }

  async function sendHostData() {
    const data = getFinalData();
    try {
      console.log("[HOST SEND]", data);
      return true;
    } catch (err) {
      alert("Gửi dữ liệu thất bại: " + err.message);
      return false;
    }
  }

  // -----------------------------
  // 7️⃣ Xuất Provider
  // -----------------------------
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

export function useHost() {
  return useContext(HostContext);
}
