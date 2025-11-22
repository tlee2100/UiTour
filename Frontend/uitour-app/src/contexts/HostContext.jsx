import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

// ============================================================
// 1️⃣ DỮ LIỆU MẪU CHUẨN HÓA THEO BACKEND
// ============================================================

// 🏠 Stay / Property
const initialStayData = {
  // ======================================================================================
  // SYSTEM – ID, Host, trạng thái phê duyệt bởi admin
  // ======================================================================================
  propertyID: null,      // ID do BE sinh ra sau khi tạo listing
  hostID: null,          // Người tạo listing (chủ nhà)

  approval: {
    status: "pending",   // Trạng thái admin duyệt: pending | approved | rejected
    approvedAt: null,    // Thời gian admin duyệt (nếu approved)
    approvedBy: null,    // Admin ID đã duyệt
  },

  // ======================================================================================
  // BASIC INFO – thông tin mô tả phòng
  // ======================================================================================
  listingTitle: "",      // Tiêu đề phòng
  description: "",       // Mô tả chi tiết (đầy đủ)
  summary: "",           // Mô tả tóm tắt ngắn
  propertyTypeID: null,      // Loại phòng: Apartment, Villa, Studio…
  propertyTypeLabel: "",
  roomTypeID: null,         // 1, 2, 3...
  roomTypeLabel: "",        // "Entire place", "Private room"

  // ======================================================================================
  // LOCATION – vị trí chi tiết
  // => FE dùng dạng object để dễ validate, BE có thể convert thành string
  // ======================================================================================
  location: {
    addressLine: "",     // Số nhà + tên đường
    district: "",        // Quận
    city: "",            // Thành phố
    country: "",         // Quốc gia
    lat: null,           // Vĩ độ (map)
    lng: null,           // Kinh độ (map)
  },

  neighbourhoodID: null, // ID khu vực (nếu BE có bảng riêng)
  cityID: null,          // ID city trong DB
  countryID: null,       // ID country trong DB

  // ======================================================================================
  // CAPACITY – sức chứa
  // ======================================================================================
  bedrooms: 1,           // Số phòng ngủ
  beds: 1,               // Số giường
  bathrooms: 1,          // Số phòng tắm
  accommodates: 1,       // Số khách tối đa
  squareFeet: null,      // Diện tích phòng (tùy chọn)

  // ======================================================================================
  // PRICING + FEES + DISCOUNTS – logic giá đầy đủ
  // ======================================================================================
  pricing: {
    basePrice: 0,        // Giá cơ bản mỗi đêm
    currency: "USD",     // Loại tiền tệ

    // WEEKEND PRICING
    weekendMultiplier: 1.0,
    // Hệ số tăng giá cuối tuần, ví dụ 1.2 = tăng 20%

    // FEES
    cleaningFee: 2,      // Phí dọn dẹp cố định ($)
    serviceFee: {
      type: "percentage",
      percent: 4        // Phí dịch vụ theo %
    },
    taxFee: {
      type: "percentage",
      percent: 6         // Thuế theo %
    },

    extraPeopleFee: 0,       // Phí phụ thu mỗi khách vượt quá
    extraPeopleThreshold: 2, // Số khách vượt quá mới tính phụ thu

    // DISCOUNTS – nhiều loại giảm giá (Airbnb chuẩn)
    discounts: {
      // -----------------------------------------------------------------------------------
      // WEEKLY DISCOUNT: GIẢM THEO SỐ ĐÊM
      // Điều kiện: tổng số đêm >= 7
      // Mức giảm theo % và được áp dụng TRƯỚC seasonal, global, fixedAmount
      // Chỉ thay thế monthlyDiscount (nghĩa là có monthly thì bỏ weekly)
      // -----------------------------------------------------------------------------------
      weekly: { percent: 7 },    // luôn tồn tại – ưu tiên #2     // Giảm khi ở >= 7 đêm (%)

      // -----------------------------------------------------------------------------------
      // MONTHLY DISCOUNT: GIẢM THEO SỐ ĐÊM
      // Điều kiện: tổng số đêm >= 28
      // Ưu tiên cao hơn weekly (tức là nếu đủ 28 đêm → chỉ áp monthly)
      // Dùng để giảm giá cho khách ở dài hạn (Airbnb thực tế)
      // -----------------------------------------------------------------------------------
      monthly: { percent: 30 },   // luôn tồn tại – ưu tiên #1    // Giảm khi ở >= 28 đêm (%)

      // -----------------------------------------------------------------------------------
      // SEASONAL DISCOUNTS: GIẢM GIÁ THEO MÙA (THEO KHOẢNG NGÀY)
      // Host tự đặt, ví dụ: mùa hè, lễ tết, cuối tuần dài, Giáng Sinh...
      // BE kiểm tra nếu startDate rơi trong khoảng from/to → áp discount.
      // Chỉ áp 1 lần *không cộng dồn*.
      // -----------------------------------------------------------------------------------
      seasonalDiscounts: [
        // {
        //   from: "YYYY-MM-DD",
        //   to:   "YYYY-MM-DD",
        //   percentage: 0     // Giảm % trong thời gian này
        // }
      ],

      // -----------------------------------------------------------------------------------
      // EARLY BIRD DISCOUNT: GIẢM CHO KHÁCH ĐẶT SỚM
      // Điều kiện: nếu khách đặt ít nhất X ngày trước check-in
      // Ví dụ: daysBefore = 30 → đặt trước 30 ngày được giảm percentage%
      // Lưu ý: mutually exclusive với last-minute discount
      // -----------------------------------------------------------------------------------
      earlyBird: [

      ],

      // -----------------------------------------------------------------------------------
      // LAST MINUTE DISCOUNT (nếu bạn muốn thêm sau)
      // Điều kiện: chỉ áp dụng nếu đặt cận ngày check-in (<= X ngày)
      // Không bao giờ đi chung với earlyBird (BE tự chọn một loại).
      // -----------------------------------------------------------------------------------
      // lastMinuteDiscount: {
      //   daysBefore: 0,
      //   percentage: 0
      // }
    },
    // BOOKING RULES – quy tắc đặt phòng
    minNights: 1,            // Số đêm tối thiểu
    maxNights: 30,           // Số đêm tối đa
    preparationTime: 0,      // Số ngày trống giữa 2 lịch đặt (để dọn phòng)
    advanceNotice: 0,        // Khách phải đặt trước X ngày tối thiểu
  },

  // ======================================================================================
  // RULES & SAFETY – quy tắc nhà và an toàn
  // ======================================================================================


  // HOUSE RULES
  houseRules: [],            // Danh sách luật nhà [{ id, label }]
  /*
    houseRules = [
    { id: "quiet_hours", label: "Quiet hours (22:00 – 07:00)" },
    { id: "no_parties", label: "No parties or events" },
    { id: "no_visitors", label: "No unregistered guests" },
    { id: "no_children", label: "Not suitable for children" },
    { id: "no_shoes_inside", label: "Remove shoes inside" },
    { id: "no_food_in_bedrooms", label: "No food in bedrooms" }
];
    Optional: BE có thể thêm nếu cần sử dụng hoặc để trống(bỏ luôn thuộc tính này) nếu khôgn muốn dùng
   */

  // ======================================================================================
  // RULES & SAFETY – quy tắc nhà và an toàn
  // ======================================================================================
  rules: {
    // ------------------------------
    checkin_after: "14:00",    // Nhận phòng sau 14:00
    checkout_before: "11:00",  // Trả phòng trước 11:00

    // BOOLEAN PROPERTY FLAGS – quy tắc nhanh (Quick Rules)
    // ------------------------------
    no_smoking: false,           // Cấm hút thuốc trong nhà?
    no_open_flames: false,       // Cấm lửa trần (nến, bếp ga di động...)?
    pets_allowed: false,         // Có cho phép thú cưng không?

    // ------------------------------
    // HEALTH & SAFETY – tiêu chuẩn an toàn theo Airbnb
    // ------------------------------
    covidSafety: false,          // Enhanced Cleaning? (chuẩn vệ sinh nâng cao)
    surfacesSanitized: false,    // Có khử khuẩn bề mặt thường xuyên?
    carbonMonoxideAlarm: false,  // Có máy cảnh báo khí CO?
    smokeAlarm: false,           // Có máy cảnh báo khói?     

    selfCheckIn: false,        // Có tự checkin hay không
    self_checkin_method: "Lockbox", // Kiểu check-in: Lockbox, Smart lock…
  },


  // ======================================================================================
  // LISTING STATUS – hiển thị hay không
  // ======================================================================================
  active: false,              // = false => không hiện trên HomePage
  isBusinessReady: false,    // Gói tiện nghi phù hợp khách công tác

  // ======================================================================================
  // MEDIA – ảnh phòng
  // ======================================================================================
  coverPhoto: null,          // Ảnh đại diện
  photos: [],                // Danh sách ảnh: { base64|url, caption, sortIndex }
  photosPreview: [],   // <== chỉ dùng RAM, không lưu localStorage

  // ======================================================================================
  // AMENITIES – tiện nghi
  // ======================================================================================
  amenities: [],             // Mảng các id tiện nghi đã chọn

  // ======================================================================================
  // CALENDAR – chống double booking + block ngày
  // Dữ liệu này BE sinh ra và FE chỉ đọc để vẽ calendar.
  //
  // QUY TẮC CHÍNH:
  // - Calendar chỉ lưu NHỮNG NGÀY KHÔNG PHẢI “available mặc định”.
  // - Nếu một ngày không xuất hiện trong calendar → FE hiểu là AVAILABLE.
  //
  // Status giải thích:
  //   • booked  = ngày đã được khách thanh toán thành công → KHÓA CỨNG.
  //   • pending = ngày đang được giữ tạm do khách đang thanh toán (10 phút). 
  //               Ai khác không thể đặt trùng trong thời gian pending.
  //   • blocked = host tự chặn ngày, không cho khách đặt.
  //   • available = (ít dùng) chỉ khi bạn muốn BE gửi đủ 30–90 ngày sẵn.
  //
  // BE sử dụng calendar khi:
  //   - Kiểm tra một ngày có thể đặt không.
  //   - Chặn ngày khi booking pending.
  //   - Chuyển ngày pending → booked khi thanh toán thành công.
  //   - Chuyển ngày pending → available khi hết hạn/ hủy.
  //
  // FE sử dụng calendar để:
  //   - Disable những ngày đã booked, pending, blocked.
  //   - Hiển thị màu sắc khác nhau trong UI.

  // Calendar không phải là nơi lưu booking.
  // Nó chỉ là “mốc thời gian” để hệ thống biết ngày nào bận / rảnh.
  // ======================================================================================
  calendar: [
    /*
      Mỗi entry = 1 ngày “không còn available”.
  
      {
        date: "2025-06-25",   // YYYY-MM-DD
  
        status: "booked" | "pending" | "blocked",
        // booked  = khách đã thanh toán xong → ngày bị khóa cứng
        // pending = khách đang thanh toán → giữ chỗ tạm 10 phút
        // blocked = host tự đóng ngày (ví dụ muốn sửa phòng hoặc đi du lịch)
  
        bookingID: null       // ID booking liên quan nếu booked hoặc pending
      }
  
      Quy tắc:
      - Nếu status == booked → bookingID luôn = id của booking đó
      - Nếu status == pending → bookingID là booking đang pending
      - Nếu status == blocked → bookingID phải = null
    */
  ],


  // ======================================================================================
  // BOOKING HISTORY – FE có thể lưu để hiển thị nhưng BE là nguồn gốc duy nhất.
  //
  // Mỗi booking là 1 ĐƠN ĐẶT PHÒNG (giao dịch).
  // Đây là nơi lưu toàn bộ thông tin: ai đặt, đặt bao nhiêu đêm, giá bao nhiêu,
  // trạng thái pending/confirmed/cancelled/expired.
  //
  // FE không bao giờ tự tạo booking hoặc sửa booking.
  // FE chỉ gọi API create booking và pay booking.
  //
  // Các trạng thái booking:
  //   • pending   = giữ chỗ tạm, user đang thanh toán (QR, card…)
  //   • confirmed = đã thanh toán thành công → phòng CHÍNH THỨC BOOKED
  //   • cancelled = thanh toán fail hoặc user hủy giữa chừng
  //   • expired   = pending quá thời gian (ví dụ 10 phút) → tự động hủy
  //
  // BE logic quan trọng:
  //
  //   Khi FE nhấn “ĐẶT PHÒNG”:
  //     → BE tạo booking: status = "pending"
  //     → BE đánh dấu calendar tương ứng = pending
  //
  //   Khi thanh toán thành công:
  //     → BE: booking.status = "confirmed"
  //     → BE: calendar.pending → booked
  //
  //   Khi thanh toán thất bại/hết hạn:
  //     → BE: booking.status = "expired" hoặc "cancelled"
  //     → BE: calendar.pending → available
  //
  // ======================================================================================
  bookings: [
    /*
      {
        bookingID: 123,           // ID booking
        propertyID: 1,            // Phòng này
        userID: 7,                // Ai đặt
        guests: 2,                // Số khách
        startDate: "2025-06-16",
        endDate: "2025-06-20",
  
        nights: 4,                // Số đêm BE tính sẵn
  
        totalPrice: 177,          // Tổng giá cuối cùng (BE tính)
        originalPrice: 200,       // Có thể lưu giá gốc trước khi discount
        discountApplied: {        // (Optional) giúp debug
          type: "weekly",         // monthly | seasonal | earlyBird | global...
          amount: 23,
        },
  
        status: "pending",        // pending | confirmed | cancelled | expired
  
        createdAt: "2025-06-01T12:55:23",
        paidAt: null,             // Set khi confirmed
        cancelledAt: null,        // Set khi user hủy hoặc hết hạn
        expiredAt: null           // Set khi BE auto expire
      }
  
      FE dùng bookings để:
      - render lịch sử booking của host/user
      - hiển thị chi tiết đơn đặt phòng
  
      BE dùng bookings để:
      - đối chiếu lịch
      - kiểm tra trùng lịch
      - xử lý thanh toán
    */
  ],
  // Danh sách booking đã fetch từ BE

  // ======================================================================================
  // SYSTEM GENERATED – BE trả về
  // ======================================================================================
  createdAt: null,           // Thời gian tạo
  updatedAt: null,           // Thời gian cập nhật gần nhất
};

function sanitizeStayData(raw) {
  if (!raw) return initialStayData;

  const clean = JSON.parse(JSON.stringify(initialStayData));

  // Copy từng nhóm field hợp lệ
  clean.propertyID = raw.propertyID ?? null;
  clean.hostID = raw.hostID ?? null;
  clean.approval = raw.approval ?? initialStayData.approval;

  clean.listingTitle = raw.listingTitle || "";
  clean.description = raw.description || "";
  clean.summary = raw.summary || "";

  clean.propertyTypeID = raw.propertyTypeID ?? null;
  clean.propertyTypeLabel = raw.propertyTypeLabel || "";
  clean.roomTypeID = raw.roomTypeID || null;
  clean.roomTypeLabel = raw.roomTypeLabel || "";

  // LOCATION
  clean.location = {
    addressLine: raw.location?.addressLine || "",
    district: raw.location?.district || "",
    city: raw.location?.city || "",
    country: raw.location?.country || "",
    lat: raw.location?.lat ?? null,
    lng: raw.location?.lng ?? null,
  };

  clean.neighbourhoodID = raw.neighbourhoodID || null;
  clean.cityID = raw.cityID || null;
  clean.countryID = raw.countryID || null;

  clean.bedrooms = raw.bedrooms ?? 1;
  clean.beds = raw.beds ?? 1;
  clean.bathrooms = raw.bathrooms ?? 1;
  clean.accommodates = raw.accommodates ?? 1;
  clean.squareFeet = raw.squareFeet ?? null;

  // PRICING
  clean.pricing = {
    basePrice: Number(raw.pricing?.basePrice) || 0,
    currency: raw.pricing?.currency || "USD",
    weekendMultiplier: Number(raw.pricing?.weekendMultiplier) || 1,
    cleaningFee: Number(raw.pricing?.cleaningFee) || 0,
    extraPeopleFee: Number(raw.pricing?.extraPeopleFee) || 0,
    extraPeopleThreshold: Number(raw.pricing?.extraPeopleThreshold) || 1,
    serviceFee: raw.pricing?.serviceFee || { type: "percentage", percent: 4 },
    taxFee: raw.pricing?.taxFee || { type: "percentage", percent: 6 },
    discounts: raw.pricing?.discounts || initialStayData.pricing.discounts,
    minNights: raw.pricing?.minNights ?? 1,
    maxNights: raw.pricing?.maxNights ?? 30,
    preparationTime: raw.pricing?.preparationTime ?? 0,
    advanceNotice: raw.pricing?.advanceNotice ?? 0
  };

  clean.houseRules = raw.houseRules || [];
  clean.rules = raw.rules || initialStayData.rules;

  clean.active = !!raw.active;
  clean.isBusinessReady = !!raw.isBusinessReady;

  clean.coverPhoto = raw.coverPhoto || null;

  clean.photos = Array.isArray(raw.photos) ? raw.photos : [];
  clean.photosPreview = []; // không bao giờ lấy từ draft

  clean.amenities = Array.isArray(raw.amenities) ? raw.amenities : [];

  clean.calendar = Array.isArray(raw.calendar) ? raw.calendar : [];
  clean.bookings = Array.isArray(raw.bookings) ? raw.bookings : [];

  clean.createdAt = raw.createdAt || null;
  clean.updatedAt = raw.updatedAt || null;

  return clean;
}



// 🧭 Experience / Tour
const initialExperienceData = {
  // ======================================================================================
  // SYSTEM – ID, Host, Approval bởi Admin
  // ======================================================================================
  tourID: null,
  hostID: null,

  approval: {
    status: "pending",     // pending | approved | rejected
    approvedAt: null,
    approvedBy: null,
  },

  // ======================================================================================
  // BASIC INFO
  // ======================================================================================
  tourName: "",
  summary: "",
  description: "",
  mainCategory: "",
  yearsOfExperience: 10,
  qualifications: {
    intro: "",
    expertise: "",
    recognition: "",
  },

  // ======================================================================================
  // LOCATION
  // ======================================================================================
  location: {
    addressLine: "",
    city: "",
    country: "",
    lat: null,
    lng: null,
  },
  cityID: null,
  countryID: null,

  // ======================================================================================
  // PRICING
  // ======================================================================================
  pricing: {
    basePrice: 0,
    currency: "USD",
    priceUnit: "perPerson", // perPerson | perGroup
  },

  // ======================================================================================
  // GUEST CAPACITY
  // ======================================================================================
  capacity: {
    maxGuests: 1,
  },

  // ======================================================================================
  // DURATION
  // ======================================================================================
  durationHours: 1,       // Thời lượng theo giờ
  durationDays: 1,        // Tour có thể kéo dài vài ngày

  // ======================================================================================
  // TIME SLOTS / SCHEDULE
  // ======================================================================================
  booking: {
    timeSlots: [
      /*
        {
          id: "slot_1",
          startTime: "09:00",
          endTime: "12:00",
          days: ["Mon", "Wed", "Fri"], 
          capacity: 10, // số khách tối đa cho slot này
        }
      */
    ],
  },

  // ======================================================================================
  // MEDIA
  // ======================================================================================
  media: {
    cover: null,
    photos: [],
  },

  // ======================================================================================
  // DISCOUNTS
  // ======================================================================================
  discounts: {
    earlyBird: false,
    custom: [], // { type, amount, percent, from, to }
  },

  // ======================================================================================
  // DETAILS (What’s included / What you’ll do)
  // ======================================================================================
  experienceDetails: [],

  // ======================================================================================
  // AVAILABILITY WINDOW
  // ======================================================================================
  startDate: "",
  endDate: "",
  isActive: true,
  createdAt: null,

  // ======================================================================================
  // CALENDAR – trạng thái ngày cho Experience
  // ======================================================================================
  calendar: [
    /*
      Với Experience, block theo ngày (giống Stay) nhưng áp dụng cho các slot.

      {
        date: "2025-07-21",
        slotID: "slot_1",   // null nếu block cả ngày
        status: "booked" | "pending" | "blocked",
        bookingID: null
      }
    */
  ],

  // ======================================================================================
  // BOOKINGS (Experience-style)
  // ======================================================================================
  bookings: [
    /*
      Experience booking khác Stay:
      - Không có nights
      - Có slotID
      - Có số lượng participants

      {
        bookingID: 101,
        tourID: 7,
        userID: 4,
        slotID: "slot_1",
        
        date: "2025-07-21",

        guests: 3,   // số khách
        totalPrice: 150,
        originalPrice: 180,

        discountApplied: {
          type: "earlyBird", 
          amount: 30
        },

        status: "pending" | "confirmed" | "cancelled" | "expired",

        createdAt: "2025-06-01T12:00:00",
        paidAt: null,
        cancelledAt: null,
        expiredAt: null
      }
    */
  ],

  // ======================================================================================
  // BACKEND-ONLY FIELDS
  // ======================================================================================
  cancellationID: null,
  cancellationPolicy: null,

  participants: [],   // BE tính dựa trên bookings
  reviews: [],        // BE trả về

  // ======================================================================================
  // SYSTEM GENERATED – timestamps
  // ======================================================================================
  updatedAt: null,
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
  // 🖼 Ảnh chỉ lưu trong RAM (KHÔNG localStorage)
  const [stayPhotosRAM, setStayPhotosRAM] = useState([]);
  const [experiencePhotosRAM, setExperiencePhotosRAM] = useState([]);
  const [experienceItineraryRAM, setExperienceItineraryRAM] = useState([]);


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
        // values.photos có thể là:
        //  - "RAM objects" (có .preview hoặc .file)  -> muốn update stayPhotosRAM
        //  - "metadata only" (không có preview/file) -> chỉ update stayData.photos (metadata)
        const incoming = values.photos || [];
        const hasPreview = Array.isArray(incoming) && incoming.some(p => p.preview || p.file);

        // Nếu incoming chứa preview/file => đó là RAM-like array -> sync to RAM
        if (hasPreview) {
          setStayPhotosRAM(incoming);
        } else {
          // nếu incoming là metadata không có preview thì KHÔNG ghi đè stayPhotosRAM
          // (giữ ảnh RAM đang có trong UI)
        }

        // Lưu metadata cho backend (dù incoming có preview hay không)
        setStayData((prev) => ({
          ...prev,
          photos: (incoming || []).map((p, i) => ({
            category: p.category,
            caption: p.caption || "",
            sortIndex: p.sortIndex ?? i + 1,
            isCover: p.isCover || false,
            name: p.name || "",
            serverUrl: p.serverUrl || "",
          })),
          photosPreview: [], // Preview không lưu vào main object
          coverPhoto: prev.coverPhoto || null,
        }));

        setCompletedStep((prev) => ({ ...prev, photos: true }));
        return;
      }

      if (step === "choose") {
        setStayData(prev => ({
          ...prev,
          propertyTypeID: values.propertyTypeID,
          propertyTypeLabel: values.propertyTypeLabel
        }));
        setCompletedStep(prev => ({ ...prev, choose: true }));
        return;
      }

      // LOCATION
      if (step === "location") {
        setStayData((prev) => ({
          ...prev,
          location: { ...prev.location, ...values },
        }));
        return;
      }
      if (step === "details") {
        setStayData(prev => ({
          ...prev,
          ...values, // bedrooms, beds, bathrooms, accommodates, squareFeet
        }));
        setCompletedStep(prev => ({ ...prev, details: true }));
        return;
      }
      if (step === "title") {
        setStayData(prev => ({
          ...prev,
          listingTitle: values.listingTitle ?? prev.listingTitle
        }));
        setCompletedStep(prev => ({ ...prev, title: true }));
        return;
      }
      if (step === "description") {
        setStayData(prev => ({
          ...prev,
          description: values.description ?? prev.description,
          summary: values.summary ?? prev.summary
        }));
        setCompletedStep(prev => ({ ...prev, description: true }));
        return;
      }
      if (step === "amenities") {
        // values = array
        setStayData(prev => ({
          ...prev,
          amenities: values
        }));
        setCompletedStep(prev => ({ ...prev, amenities: true }));
        return;
      }

      // PRICE
      if (step === "pricing") {
        const patch = values.pricing || values; // chống lỗi UI gửi sai shape
        setStayData(prev => ({
          ...prev,
          pricing: { ...prev.pricing, ...patch }
        }));
        setCompletedStep(prev => ({ ...prev, pricing: true }));
        return;
      }

      // DISCOUNTS (stay)
      if (step === "discounts") {
        setStayData(prev => ({
          ...prev,
          pricing: {
            ...prev.pricing,
            discounts: {
              ...prev.pricing.discounts,
              ...values
            }
          }
        }));

        setCompletedStep(prev => ({ ...prev, discounts: true }));
        return;
      }

      //FEES
      if (step === "fees") {
        setStayData(prev => ({
          ...prev,
          pricing: { ...prev.pricing, ...values }
        }));
        setCompletedStep(prev => ({ ...prev, fees: true }));
        return;
      }
      //WEEKDAY PRICE, WEEKEND PRICE
      if (step === "weekday-price" || step === "weekend-price") {
        setStayData(prev => ({
          ...prev,
          pricing: { ...prev.pricing, ...values.pricing }
        }));
        setCompletedStep(prev => ({ ...prev, [step]: true }));
        return;
      }
      if (step === "rules") {
        setStayData(prev => ({
          ...prev,
          rules: { ...prev.rules, ...values }
        }));
        setCompletedStep(prev => ({ ...prev, rules: true }));
        return;
      }
      if (step === "houseRules") {
        setStayData(prev => ({
          ...prev,
          houseRules: values
        }));
        setCompletedStep(prev => ({ ...prev, houseRules: true }));
        return;
      }
      if (step === "typeofplace") {
        setStayData(prev => ({
          ...prev,
          roomTypeID: values.roomTypeID,
          roomTypeLabel: values.roomTypeLabel
        }));
        setCompletedStep(prev => ({ ...prev, typeofplace: true }));
        return;
      }

      // OTHER
      else {
        console.warn("❌ updateField bị gọi với step không xác định. Bỏ qua để tránh thêm field sai:", step, values);
      }

    } else {
      // EXPERIENCE FLOW
      if (step === "location") {
        setExperienceData((prev) => ({
          ...prev,
          location: { ...prev.location, ...values },
        }));

      } else if (step === "qualification") {
        setExperienceData(prev => ({
          ...prev,
          qualifications: { ...prev.qualifications, ...values }
        }));
        setCompletedStep(prev => ({ ...prev, qualification: true }));
        return;

      } else if (step === "itinerary") {
        // 1) Update RAM
        setExperienceItineraryRAM(values.map(item => ({
          id: item.id,
          preview: item.photo?.preview || null,
          file: item.photo?.file || null,
        })));

        // 2) Save only metadata to local data (no base64)
        setExperienceData(prev => ({
          ...prev,
          experienceDetails: values.map(item => ({
            id: item.id,
            title: item.title,
            content: item.content,
            photo: item.photo ? {
              name: item.photo.name || "",
              caption: item.photo.caption || "",
              serverUrl: item.photo.serverUrl || "",
            } : null
          }))
        }));

        setCompletedStep(prev => ({ ...prev, itinerary: true }));
        return;
      }

      else if (step === "pricing") {
        // ensure basePrice is numeric (avoid storing "" or "0" as string)
        const incoming = values || {};
        const coerced = {
          ...incoming,
          basePrice:
            incoming.basePrice === "" || incoming.basePrice === null || isNaN(Number(incoming.basePrice))
              ? 0
              : Number(incoming.basePrice),
        };

        setExperienceData((prev) => ({
          ...prev,
          pricing: { ...prev.pricing, ...coerced },
        }));
        return;
      }
      else if (step === "capacity") {
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
        const incoming = values.photos || [];
        const hasPreview = incoming.some(p => p.preview || p.file);

        if (hasPreview) {
          setExperiencePhotosRAM(incoming);
        }

        setExperienceData((prev) => ({
          ...prev,
          media: {
            ...prev.media,
            photos: incoming.map((p, i) => ({
              name: p.name || "",
              caption: p.caption || "",
              serverUrl: p.serverUrl || "",
              sortIndex: p.sortIndex ?? i + 1,
              isCover: p.isCover || false,
            })),
            cover: values.cover || prev.media.cover,
          },
        }));

        setCompletedStep(prev => ({ ...prev, photos: true, media: true }));
        return;
      }
      else {
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
      if (step === "choose") return !!stayData.propertyTypeID;
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
        // Prefer RAM (actual preview objects) because BE/LocalStorage metadata may lack previews
        const ramPhotos = stayPhotosRAM || [];
        const photosForValidation = (ramPhotos.length > 0) ? ramPhotos : (stayData.photosPreview || []);

        return (
          photosForValidation.some((p) => p.category === "bedroom") &&
          photosForValidation.some((p) => p.category === "bathroom")
        );
      }



      return true;
    } else {
      // EXPERIENCE VALIDATION
      if (step === "choose") return !!experienceData.mainCategory;

      if (step === "years")
        return Number(experienceData.yearsOfExperience) >= 0;

      if (step === "qualification") return true;

      // --- ⭐ DESCRIBE TITLE PAGE (Title + Description both required) ---
      if (step === "describe-title") {
        const title = String(experienceData.tourName || "").trim();
        const desc = String(experienceData.summary || experienceData.description || "").trim();

        // Must have BOTH
        return title.length > 0 && desc.length > 0;
      }

      if (step === "locate")
        return !!experienceData.location.lat && !!experienceData.location.lng;

      // ⭐ Only validate price (maxGuests & duration are always >= 1)
      if (step === "capacity") {
        const price = Number(experienceData.pricing?.basePrice);
        // price must be a valid positive number
        if (isNaN(price)) return false;
        return price > 0;
      }

      if (step === "photos") return experienceData.media.photos.length > 0;

      if (step === "itinerary")
        return experienceData.experienceDetails.length > 0;

      if (step === "timeslots")
        return experienceData.booking.timeSlots.length > 0;

      return true;
    }
  }

  // ============================================================
  // FINAL VALIDATION – RÀ SOÁT TẤT CẢ DỮ LIỆU TRƯỚC KHI PUBLISH
  // ============================================================

  // ⭐ VALIDATE STAY
  function validateAllStay() {
    const steps = [
      "choose",
      "typeofplace",
      "location",
      "details",
      "title",
      "description",
      "weekday-price",
      "weekend-price",
      "photos"
    ];

    for (const step of steps) {
      if (!validateStep(step)) {
        return {
          ok: false,
          step,
          message: `Missing or invalid data at step: ${step}`,
        };
      }
    }

    // ⭐ ẢNH: RAM PHẢI CÓ FILE
    if (!stayPhotosRAM || stayPhotosRAM.length === 0) {
      return {
        ok: false,
        step: "photos",
        message: "Your photos were lost after reload. Please upload them again.",
      };
    }

    // Nếu pass hết
    return { ok: true };
  }

  // ⭐ VALIDATE EXPERIENCE
  function validateAllExperience() {
    const steps = [
      "describe-title",
      "locate",
      "capacity",
      "photos",
      "itinerary",
      "timeslots"
    ];

    for (const step of steps) {
      if (!validateStep(step)) {
        return {
          ok: false,
          step,
          message: `Missing or invalid data at step: ${step}`,
        };
      }
    }

    // ⭐ Ảnh Experience cũng chỉ an toàn khi RAM còn file
    if (!experiencePhotosRAM || experiencePhotosRAM.length === 0) {
      return {
        ok: false,
        step: "photos",
        message: "Your photos were lost after reload. Please upload them again.",
      };
    }

    return { ok: true };
  }

  // ⭐ MASTER VALIDATE – dùng ở Preview
  function validateAll() {
    return type === "stay" ? validateAllStay() : validateAllExperience();
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
        const parsed = JSON.parse(savedStay);
        const cleaned = sanitizeStayData(parsed);
        setStayData(cleaned);
      } catch { }
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
        exp.media.photos = (exp.media.photos || []).map((p) => ({
          preview: "", // KHÔNG load preview từ localStorage
          file: null,
          name: p.name || "",
          caption: p.caption || "",
          serverUrl: p.serverUrl || "",
          isCover: p.isCover || false,
        }));


        // Nếu cover rỗng thì đặt auto ảnh đầu
        if (!exp.media.cover && exp.media.photos.length > 0) {
          exp.media.cover = exp.media.photos[0].preview;
        }

        setExperienceData({ ...initialExperienceData, ...exp });
        setExperienceItineraryRAM(
          exp.experienceDetails.map(item => ({
            id: item.id,
            preview: "", // RAM không load từ localStorage
            file: null
          }))
        );
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
    if (!loaded) return;

    const safeData = sanitizeStayData(stayData);

    const clone = { ...safeData };
    delete clone.photosPreview;

    clone.photos = clone.photos.map(p => ({
      name: p.name || "",
      caption: p.caption || "",
      category: p.category || "",
      sortIndex: p.sortIndex || 0,
      isCover: !!p.isCover,
      serverUrl: p.serverUrl || ""
    }));

    localStorage.setItem("host_stay_draft", JSON.stringify(clone));
  }, [stayData, loaded]);



  // SAVE EXPERIENCE DRAFT
  useEffect(() => {
    if (!loaded) return; // <— ngăn chạy save lúc mới load draft

    const expForStorage = {
      ...experienceData,

      // itinerary cleanup
      experienceDetails: experienceData.experienceDetails.map((item) => ({
        ...item,
        photo: item.photo ? {
          file: null,
          preview: "",
          name: item.photo.name || "",
          caption: item.photo.caption || "",
          serverUrl: item.photo.serverUrl || "",
        } : null,
      })),

      discounts: {
        earlyBird: experienceData.discounts?.earlyBird ?? false,
        byDaysBefore: experienceData.discounts?.byDaysBefore ?? [],
        byGroupSize: experienceData.discounts?.byGroupSize ?? [],
      },

      media: {
        ...experienceData.media,
        photos: experienceData.media.photos.map((p, i) => ({
          name: p.name || "",
          caption: p.caption || "",
          serverUrl: p.serverUrl || "",
          sortIndex: p.sortIndex ?? i + 1,
          isCover: !!p.isCover,
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
        stayPhotosRAM,
        setStayPhotosRAM,
        experiencePhotosRAM,
        setExperiencePhotosRAM,
        experienceItineraryRAM,
        setExperienceItineraryRAM,
        validateAll,
        validateAllStay,
        validateAllExperience,
      }}
    >
      {children}
    </HostContext.Provider>
  );
}

// ============================================================
// 9️⃣ FORMATTER STAY / EXPERIENCE
// ============================================================
function formatStayDataForAPI(d) {
  const num = (v) => {
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  };

  const safe = (v) => (v === undefined || v === null ? "" : v);

  // ---------------------------------------------------------
  // PHOTOS
  // ---------------------------------------------------------
  const photos = (d.photos || []).map((p, i) => ({
    url: safe(p.serverUrl || ""),
    caption: safe(p.caption),
    category: safe(p.category),
    sortIndex: p.sortIndex ?? i + 1,
    isCover: !!p.isCover,
  }));

  const coverPhoto =
    d.coverPhoto ||
    (photos.find((p) => p.isCover)?.url || photos[0]?.url || null);

  // ---------------------------------------------------------
  // AMENITIES
  // ---------------------------------------------------------
  const amenities = (d.amenities || [])
    .map((x) => Number(x))
    .filter((x) => !isNaN(x))
    .map((id) => ({ amenityID: id }));

  // ---------------------------------------------------------
  // DISCOUNTS
  // ---------------------------------------------------------
  const discounts = {
    weeklyPercent: num(d.pricing.discounts.weekly.percent),
    monthlyPercent: num(d.pricing.discounts.monthly.percent),

    seasonal: (d.pricing.discounts.seasonalDiscounts || []).map((s) => ({
      from: s.from,
      to: s.to,
      percentage: num(s.percentage),
    })),

    earlyBird: (d.pricing.discounts.earlyBird || []).map((e) => ({
      daysBefore: num(e.daysBefore),
      percent: num(e.percent),
    })),
  };

  // ---------------------------------------------------------
  // FINAL PAYLOAD
  // ---------------------------------------------------------
  return {
    // =========================
    // BASIC LISTING INFO
    // =========================
    propertyID: d.propertyID || null,
    hostID: d.hostID || d.userID || null,

    listingTitle: safe(d.listingTitle),
    description: safe(d.description),
    summary: safe(d.summary),

    propertyTypeID: d.propertyTypeID || null,
    propertyTypeLabel: safe(d.propertyTypeLabel),  // ⭐ THÊM VÀO

    roomTypeID: d.roomTypeID || null,
    roomTypeLabel: safe(d.roomTypeLabel),

    // =========================
    // LOCATION
    // =========================
    location: {
      addressLine: safe(d.location.addressLine),
      district: safe(d.location.district),
      city: safe(d.location.city),
      country: safe(d.location.country),
      lat: d.location.lat,
      lng: d.location.lng,
    },

    cityID: d.cityID || null,
    countryID: d.countryID || null,

    // =========================
    // CAPACITY
    // =========================
    bedrooms: num(d.bedrooms),
    beds: num(d.beds),
    bathrooms: num(d.bathrooms),
    accommodates: num(d.accommodates),
    squareFeet: d.squareFeet || null,

    // =========================
    // PRICING + FEES
    // =========================
    pricing: {
      basePrice: num(d.pricing.basePrice),
      currency: safe(d.pricing.currency),

      weekendMultiplier: num(d.pricing.weekendMultiplier),

      cleaningFee: num(d.pricing.cleaningFee),
      extraPeopleFee: num(d.pricing.extraPeopleFee),
      extraPeopleThreshold: num(d.pricing.extraPeopleThreshold),

      serviceFeePercent: num(d.pricing.serviceFee.percent),
      taxFeePercent: num(d.pricing.taxFee.percent),

      discounts,
    },

    // =========================
    // BOOKING RULES
    // =========================
    bookingRules: {
      minNights: num(d.pricing.minNights),
      maxNights: num(d.pricing.maxNights),
      preparationTime: num(d.pricing.preparationTime),
      advanceNotice: num(d.pricing.advanceNotice),
    },

    // =========================
    // HOUSE RULES & SAFETY
    // =========================
    houseRules: d.houseRules || [],

    rules: {
      checkin_after: safe(d.rules.checkin_after),
      checkout_before: safe(d.rules.checkout_before),

      no_smoking: !!d.rules.no_smoking,
      no_open_flames: !!d.rules.no_open_flames,
      pets_allowed: !!d.rules.pets_allowed,

      covidSafety: !!d.rules.covidSafety,
      surfacesSanitized: !!d.rules.surfacesSanitized,
      carbonMonoxideAlarm: !!d.rules.carbonMonoxideAlarm,
      smokeAlarm: !!d.rules.smokeAlarm,

      selfCheckIn: !!d.rules.selfCheckIn,
      self_checkin_method: safe(d.rules.self_checkin_method),
    },

    // =========================
    // PHOTOS
    // =========================
    coverPhoto,
    photos,

    // =========================
    // AMENITIES
    // =========================
    amenities,

    // =========================
    // STATUS
    // =========================
    active: !!d.active,
    isBusinessReady: !!d.isBusinessReady,

    approval: d.approval || {},

    createdAt: d.createdAt || null,
    updatedAt: d.updatedAt || null,
  };
}

function formatExperienceDataForAPI(raw) {
  const d = raw || initialExperienceData;

  const num = (v) => {
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  };

  const safe = (v) => (v === undefined || v === null ? "" : v);

  // =============================
  // 📸 MEDIA
  // =============================
  const photos = (d.media.photos || []).map((p, i) => ({
    url: safe(p.serverUrl || ""),
    caption: safe(p.caption),
    sortIndex: p.sortIndex ?? i + 1,
    isCover: !!p.isCover,
  }));

  const coverPhoto =
    d.media.cover ||
    photos.find((p) => p.isCover)?.url ||
    photos[0]?.url ||
    null;

  // =============================
  // 🧭 LOCATION
  // =============================
  const location = {
    addressLine: safe(d.location.addressLine),
    city: safe(d.location.city),
    country: safe(d.location.country),
    lat: d.location.lat,
    lng: d.location.lng,
    cityID: d.cityID || null,
    countryID: d.countryID || null,
  };

  // =============================
  // 📝 ITINERARY / DETAILS
  // =============================
  const details = (d.experienceDetails || []).map((item, i) => ({
    id: item.id,
    title: safe(item.title),
    content: safe(item.content),
    sortIndex: i + 1,
    photo: item.photo
      ? {
        url: safe(item.photo.serverUrl || ""),
        caption: safe(item.photo.caption || ""),
      }
      : null,
  }));

  // =============================
  // 🕒 TIME SLOTS
  // =============================
  const timeSlots = (d.booking.timeSlots || []).map((slot) => ({
    slotID: slot.id || null,
    startTime: slot.startTime,
    endTime: slot.endTime || null,
    days: Array.isArray(slot.days) ? slot.days : [],
    capacity: num(slot.capacity || d.capacity.maxGuests),
  }));

  // =============================
  // 💵 PRICING
  // =============================
  const pricing = {
    basePrice: num(d.pricing.basePrice),
    currency: safe(d.pricing.currency || "USD"),
    priceUnit: d.pricing.priceUnit === "perGroup" ? "perGroup" : "perPerson",

    discounts: {
      earlyBird: !!d.discounts.earlyBird,
      custom: (d.discounts.custom || []).map((x) => ({
        type: safe(x.type),
        amount: num(x.amount),
        percent: num(x.percent),
        from: x.from || null,
        to: x.to || null,
      })),
    },
  };

  // =============================
  // 🎯 FINAL PAYLOAD
  // =============================
  return {
    // SYSTEM
    tourID: d.tourID || null,
    hostID: d.hostID || d.userID || null,

    // BASIC
    tourName: safe(d.tourName),
    summary: safe(d.summary),
    description: safe(d.description),
    mainCategory: safe(d.mainCategory),
    qualifications: {
      intro: safe(d.qualifications.intro),
      expertise: safe(d.qualifications.expertise),
      recognition: safe(d.qualifications.recognition),
    },

    // LOCATION
    location,
    lat: location.lat,
    lng: location.lng,

    // CAPACITY + DURATION
    maxGuests: num(d.capacity.maxGuests),
    durationHours: num(d.durationHours),
    durationDays: num(d.durationDays),

    // TIME SLOTS
    timeSlots,

    // MEDIA
    photos,
    coverPhoto,

    // DETAILS / ITINERARY
    experienceDetails: details,

    // AVAILABILITY
    startDate: safe(d.startDate),
    endDate: safe(d.endDate),
    isActive: !!d.isActive,

    // CALENDAR
    calendar: (d.calendar || []).map((c) => ({
      date: c.date,
      slotID: c.slotID || null,
      status: c.status,
      bookingID: c.bookingID || null,
    })),

    // APPROVAL
    approval: d.approval || { status: "pending" },

    // TIMESTAMPS
    createdAt: d.createdAt || null,
    updatedAt: d.updatedAt || null,
  };
}


// ============================================================
// 🔟 HOOK TIỆN DỤNG
// ============================================================
export function useHost() {
  return useContext(HostContext);
}

//////////////////////////
/*

Thêm trường Duration, Booking, Admin duyệt(nếu thiếu) và so lại với Stay để chuẩn data cuối
Style lại 1 số chỗ của Experience, đặc biệt là phần Title & Description lỗi style khi nhập dài
Style lại phần nhập chữ khi mở editor vì trông ko thống nhất và cứng nhắc
Thêm cảnh báo reload sẽ mất ảnh ở tất cả trang upload ảnh
Thêm final validate để check lần cuối đảm bảo ko cho publish khi Host reload mất ảnh ở cả 2 Exp và Stay
Format lại Exp lần cuối để hoàn thành

*/