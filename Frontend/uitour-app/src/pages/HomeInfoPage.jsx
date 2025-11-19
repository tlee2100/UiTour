import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./HomeInfoPage.css";
import authAPI from "../services/authAPI"; // ✅ import authAPI
import { useApp } from "../contexts/AppContext";

import InfoHeader from "./Info_components/InfoHeader";
import InfoReview from "./Info_components/InfoReview";
import InfoHost from "./Info_components/InfoHost";
import Gallery from "./HomeInfo_component/Gallery";
import Content from "./HomeInfo_component/Content";
import InfoThingsToKnow from "./HomeInfo_component/InfoThingsToKnow";
import PropertyMap from "../components/PropertyMap";
import HIBookingBox from "./HomeInfo_component/HIBookingBox";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

// ✅ Normalize function để chuyển đổi dữ liệu từ backend sang format mà component cần
const normalizeProperty = (p) => {
    // Tính rating từ reviews
  const reviews = Array.isArray(p.reviews) ? p.reviews : [];
  const rating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + (r.rating || r.Rating || 0), 0) / reviews.length 
    : 0;
  const reviewsCount = reviews.length;

  // Xử lý photos
  const photos = Array.isArray(p.photos) 
    ? p.photos.map(photo => ({
        url: photo.url || photo.Url || "",
        alt: photo.caption || photo.Caption || "Photo",
        caption: photo.caption || photo.Caption || ""
      }))
    : [];

  // Xử lý location
  const locationString = p.location || p.Location || "";
  const locationObj = {
    address: locationString,
    city: p.city?.name || p.City?.name || "",
    country: p.country?.name || p.Country?.name || "Vietnam",
    lat: parseFloat(p.lat) || null,
    lng: parseFloat(p.lng) || null
  };

  // Xử lý amenities - handle both propertyAmenities array and direct amenities
  const amenities = (() => {
    // Try propertyAmenities first (from Property.PropertyAmenities)
    if (Array.isArray(p.propertyAmenities)) {
      return p.propertyAmenities.map(pa => {
        const amenity = pa.amenity || pa.Amenity || pa;
        const amenityID = amenity?.amenityID || amenity?.AmenityID || pa.amenityID || pa.AmenityID;
        const amenityName = amenity?.amenityName || amenity?.AmenityName || amenity?.name || amenity?.Name || pa.name || pa.Name || "";
        
        // Map amenity name to icon (normalize name to lowercase and match with available icons)
        const iconMap = {
          "wifi": "wifi",
          "air conditioning": "ac",
          "ac": "ac",
          "kitchen": "kitchen",
          "tv": "tv",
          "television": "tv",
          "free parking": "free_parking",
          "parking": "free_parking",
          "pool": "pool",
          "swimming pool": "pool",
          "gym": "gym",
          "fitness": "gym",
          "washer": "washer",
          "washing machine": "washer",
          "dryer": "dryer",
          "hair dryer": "hair_dryer",
          "iron": "iron",
          "workspace": "workspace",
          "work space": "workspace",
          "breakfast": "breakfast",
          "hot tub": "hottub",
          "jacuzzi": "hottub",
          "bbq": "bbq",
          "barbecue": "bbq",
          "heating": "heating",
          "ev charger": "ev_charger",
          "electric vehicle charger": "ev_charger",
          "king bed": "king_bed",
          "smoke alarm": "smoke_alarm",
          "smoke detector": "smoke_alarm"
        };
        
        const nameLower = amenityName.toLowerCase().trim();
        const icon = iconMap[nameLower] || nameLower.replace(/\s+/g, "_");
        
        return {
          id: amenityID,
          name: amenityName,
          icon: icon
        };
      });
    }
    
    // Try direct amenities array (if backend returns it directly)
    if (Array.isArray(p.amenities)) {
      return p.amenities.map(a => {
        const amenityID = a.amenityID || a.AmenityID || a.id || a.ID;
        const amenityName = a.amenityName || a.AmenityName || a.name || a.Name || "";
        
        const iconMap = {
          "wifi": "wifi",
          "air conditioning": "ac",
          "ac": "ac",
          "kitchen": "kitchen",
          "tv": "tv",
          "television": "tv",
          "free parking": "free_parking",
          "parking": "free_parking",
          "pool": "pool",
          "swimming pool": "pool",
          "gym": "gym",
          "fitness": "gym",
          "washer": "washer",
          "washing machine": "washer",
          "dryer": "dryer",
          "hair dryer": "hair_dryer",
          "iron": "iron",
          "workspace": "workspace",
          "work space": "workspace",
          "breakfast": "breakfast",
          "hot tub": "hottub",
          "jacuzzi": "hottub",
          "bbq": "bbq",
          "barbecue": "bbq",
          "heating": "heating",
          "ev charger": "ev_charger",
          "electric vehicle charger": "ev_charger",
          "king bed": "king_bed",
          "smoke alarm": "smoke_alarm",
          "smoke detector": "smoke_alarm"
        };
        
        const nameLower = amenityName.toLowerCase().trim();
        const icon = iconMap[nameLower] || nameLower.replace(/\s+/g, "_");
        
        return {
          id: amenityID,
          name: amenityName,
          icon: icon
        };
      });
    }
    
    return [];
  })();

  // Debug: Log amenities to console (remove in production)
  if (amenities.length > 0) {
    console.log('Normalized amenities:', amenities);
  } else {
    console.log('No amenities found. Raw property data:', {
      propertyAmenities: p.propertyAmenities,
      amenities: p.amenities
    });
  }

  // ✅ Xử lý host với đầy đủ thông tin từ database
  const hostData = p.host || p.Host;
  const host = hostData ? {
    id: hostData.hostID || hostData.hostId || hostData.HostID || hostData.HostId,
    name: hostData.user?.fullName || hostData.user?.FullName || hostData.User?.fullName || hostData.User?.FullName || "Host",
    avatar: hostData.user?.avatar || hostData.user?.Avatar || hostData.User?.avatar || hostData.User?.Avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    isSuperhost: hostData.isSuperHost !== undefined ? hostData.isSuperHost : (hostData.IsSuperHost !== undefined ? hostData.IsSuperHost : false),
    joinedDate: hostData.hostSince || hostData.HostSince || hostData.hostSince || hostData.HostSince,
    about: hostData.hostAbout || hostData.HostAbout || "",
    description: hostData.hostAbout || hostData.HostAbout || "",
    responseRate: hostData.hostResponseRate || hostData.HostResponseRate || hostData.hostResponseRate || 0,
    responseTime: hostData.hostResponseTime || hostData.HostResponseTime || hostData.hostResponseTime || "within a few hours",
    languages: (() => {
      const langStr = hostData.languages || hostData.Languages || "";
      if (!langStr) return ["English"];
      try {
        // Thử parse JSON array
        if (langStr.startsWith('[')) {
          return JSON.parse(langStr);
        }
        // Nếu là comma-separated string
        if (langStr.includes(',')) {
          return langStr.split(',').map(l => l.trim().replace(/["\[\]]/g, ''));
        }
        return [langStr];
      } catch (e) {
        return ["English"];
      }
    })(),
    totalReviews: 0, // Có thể tính từ Reviews của host nếu cần
    averageRating: 0 // Có thể tính từ Reviews của host nếu cần
  } : {
    id: 0,
    name: "Host",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    isSuperhost: false,
    joinedDate: null,
    about: "",
    description: "",
    responseRate: 0,
    responseTime: "within a few hours",
    languages: ["English"],
    totalReviews: 0,
    averageRating: 0
  };

  const hostIdFromData =
    host?.id ||
    hostData?.hostID ||
    hostData?.HostID ||
    p.hostID ||
    p.HostID ||
    p.hostId ||
    p.HostId ||
    null;

  return {
    id: p.propertyID || p.id,
    listingTitle: p.listingTitle || p.ListingTitle || "Untitled",
    title: p.listingTitle || p.ListingTitle || "Untitled",
    description: p.description || p.Description || "",
    summary: p.summary || p.Summary || "",
    
    location: locationString,
    locationObj: locationObj,
    latitude: parseFloat(p.lat) || null,
    longitude: parseFloat(p.lng) || null,

    price: parseFloat(p.price || p.Price || 0),
    currency: p.currency || p.Currency || "USD",
    cleaningFee: parseFloat(p.cleaningFee || p.CleaningFee || 0),
    extraGuestFee: parseFloat(p.extraPeopleFee || p.ExtraPeopleFee || 0),

    // Media
    media: {
      cover: photos.length > 0 ? { url: photos[0].url, alt: photos[0].alt } : null,
      photos: photos
    },
    photos: photos,
    mainImage: photos.length > 0 ? photos[0].url : "/fallback.png",

    // Property details
    propertyType: p.propertyType || p.PropertyType || "",
    roomType: p.roomType?.name || p.RoomType?.name || "",
    bedType: p.bedType?.name || p.BedType?.name || "",
    bedrooms: p.bedrooms || p.Bedrooms || 0,
    beds: p.beds || p.Beds || 0,
    bathrooms: parseFloat(p.bathrooms || p.Bathrooms || 0),
    accommodates: p.accommodates || p.Accommodates || 1,
    maxGuests: p.accommodates || p.Accommodates || 1,
    capacity: {
      maxGuests: p.accommodates || p.Accommodates || 1
    },

    // Amenities
    amenities: amenities,

    // ✅ Highlights: Sử dụng summary từ database làm highlights
    highlights: (() => {
      const highlightsArray = [];
      const summary = p.summary || p.Summary || "";
      
      // Đọc các thuộc tính boolean từ database
      const enhancedClean = p.enhancedClean === true || p.enhancedClean === "true" || p.enhancedClean === 1;
      const selfCheckIn = p.selfCheckIn === true || p.selfCheckIn === "true" || p.selfCheckIn === 1;
      const freeCancellation = p.freeCancellation === true || p.freeCancellation === "true" || p.freeCancellation === 1;
      const roomType = p.roomType?.name || p.RoomType?.name || p.roomType || "";
      
      // ✅ Nếu có summary, thêm nó như highlight chính
      // Summary có thể là text mô tả ngắn về property
      if (summary && summary.trim()) {
        // Nếu summary chứa thông tin về các tính năng, có thể parse
        // Nhưng đơn giản nhất là hiển thị summary như một highlight
        highlightsArray.push({
          id: "summary_highlight",
          label: summary.trim()
        });
      }

      // Thêm các highlights dựa trên thuộc tính property
      if (enhancedClean) {
        highlightsArray.push({
          id: "enhanced_clean",
          label: "Enhanced Clean"
        });
      }

      if (selfCheckIn) {
        highlightsArray.push({
          id: "self_checkin",
          label: "Self check-in"
        });
      }

      if (freeCancellation) {
        highlightsArray.push({
          id: "free_cancellation",
          label: "Free cancellation"
        });
      }

      // Kiểm tra nếu là entire place dựa trên roomType
      if (roomType) {
        const roomTypeLower = roomType.toLowerCase();
        if (roomTypeLower.includes("entire") || roomTypeLower.includes("whole") || roomTypeLower.includes("private")) {
          highlightsArray.push({
            id: "entire_place",
            label: "Entire place"
          });
        }
      }

      return highlightsArray.length > 0 ? highlightsArray : [];
    })(),

    // Rules
    houseRules: [],
    healthAndSafety: {
      enhancedClean: p.enhancedClean !== undefined ? p.enhancedClean : (p.enhancedClean !== undefined ? p.enhancedClean : false),
      selfCheckIn: p.selfCheckIn !== undefined ? p.selfCheckIn : (p.selfCheckIn !== undefined ? p.selfCheckIn : false)
    },
    cancellationPolicy: p.cancellationPolicy || p.CancellationPolicy || {},
    freeCancellation: p.freeCancellation !== undefined ? p.freeCancellation : (p.freeCancellation !== undefined ? p.freeCancellation : false),
    noSmoking: p.no_smoking !== undefined ? p.no_smoking : (p.no_smoking !== undefined ? p.no_smoking : true),
    petsAllowed: p.pets_allowed !== undefined ? p.pets_allowed : (p.pets_allowed !== undefined ? p.pets_allowed : false),

    // Host
    host: host,
    hostId: hostIdFromData,
    hostStatus: host?.isSuperhost ? "Superhost" : "Host",

    // Reviews
    rating: rating,
    reviewsCount: reviewsCount,
    reviews: reviews.map(r => {
      // Bảo đảm userData là object chứ không phải ID
      const userData =
        (typeof r.user === "object" && r.user) ||
        (typeof r.User === "object" && r.User) ||
        null;

      const userName =
        userData?.fullName ||
        userData?.FullName ||
        userData?.name ||
        userData?.Name ||
        r.userName || // fallback nếu API đã phẳng
        "Guest";

      const userAvatar = userData?.avatar || userData?.Avatar || r.userAvatar || "";

      // Parse và normalize rating (đảm bảo là number và trong khoảng 0-5)
      const rawRating = r.rating ?? r.Rating ?? 0;
      const numRating = typeof rawRating === 'number' 
        ? rawRating 
        : parseFloat(rawRating) || 0;
      const normalizedRating = Math.min(5, Math.max(0, numRating));

      return {
        id: r.reviewID || r.reviewId || r.ReviewID || r.ReviewId || r.id,
        userName,
        userAvatar,
        rating: normalizedRating,
        comment: r.comments || r.Comments || r.comment || r.Comment || "",
        createdAt: r.createdAt || r.CreatedAt || r.date || "",
        location:
          userData?.location ||
          userData?.Location ||
          r.location ||
          "Unknown",
      };
    }),

    
    // Booking
    checkIn: p.checkin_after || p.checkin_after || null,
    checkOut: null,

    // Other
    isGuestFavourite: false,
    dates: null,
    createdAt: p.createdAt || p.CreatedAt,
    updatedAt: p.updatedAt || p.UpdatedAt
  };
  
};

export default function HomeInfoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useApp();
  const [currentProperty, setCurrentProperty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saveState, setSaveState] = useState({ isSaved: false, loading: false });
  const [bookingState, setBookingState] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1,
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingFeedback, setBookingFeedback] = useState(null);

  // -----------------------
  // Load property from API
  // -----------------------
  const loadProperty = useCallback(async (propertyId) => {
    if (!propertyId) return;

    setLoading(true);
    setError(null);
    try {
      const property = await authAPI.getPropertyById(propertyId); // ✅ gọi authAPI
      const normalized = normalizeProperty(property); // ✅ normalize dữ liệu
      setCurrentProperty(normalized);
    } catch (err) {
      console.error("Error loading property:", err);
      setError(err.message || "Không tìm thấy chỗ ở này");
    } finally {
      setLoading(false);
    }
  }, []);

  const isPropertySaved = useCallback((wishlistPayload, propertyIdentifier) => {
    if (!wishlistPayload || !propertyIdentifier) return false;
    const items = wishlistPayload.items || wishlistPayload.Items || [];
    return items.some(
      (item) =>
        Number(item.id ?? item.Id ?? item.propertyId ?? item.PropertyID) ===
        Number(propertyIdentifier)
    );
  }, []);

  const refreshSaveState = useCallback(
    async (propertyIdValue) => {
      if (!user?.UserID || !propertyIdValue) {
        setSaveState((prev) => ({ ...prev, isSaved: false }));
        return;
      }
      try {
        const wishlist = await authAPI.getUserWishlist(user.UserID);
        const saved = isPropertySaved(wishlist, propertyIdValue);
        setSaveState({ isSaved: saved, loading: false });
      } catch (err) {
        console.error("Failed to load wishlist:", err);
        setSaveState((prev) => ({ ...prev, isSaved: false }));
      }
    },
    [user, isPropertySaved]
  );

  const handleToggleSave = useCallback(async () => {
    if (!currentProperty?.id) return;

    if (!user?.UserID) {
      navigate("/login", { state: { from: `/property/${id}` } });
      return;
    }

    setSaveState((prev) => ({ ...prev, loading: true }));
    try {
      const response = saveState.isSaved
        ? await authAPI.removeFromWishlist(user.UserID, currentProperty.id)
        : await authAPI.addToWishlist(user.UserID, currentProperty.id);
      const saved = isPropertySaved(response, currentProperty.id);
      setSaveState({ isSaved: saved, loading: false });
    } catch (err) {
      console.error("Failed to toggle wishlist:", err);
      setSaveState((prev) => ({ ...prev, loading: false }));
      alert(err.message || "Không thể cập nhật danh sách yêu thích.");
    }
  }, [currentProperty, id, isPropertySaved, navigate, saveState.isSaved, user]);

  const handleShareProperty = () => {
    if (!currentProperty) return;
    const shareData = {
      title: currentProperty.listingTitle || "UiTour",
      text: currentProperty.summary || currentProperty.description || "",
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard
        .writeText(shareData.url)
        .then(() => alert("Đã sao chép liên kết!"))
        .catch(() => alert(shareData.url));
    } else {
      alert(shareData.url);
    }
  };

  const handleDatesChange = (field, value) => {
    setBookingState((prev) => {
      const next = { ...prev, [field]: value };
      if (
        field === "checkIn" &&
        next.checkOut &&
        new Date(next.checkOut) <= new Date(value)
      ) {
        next.checkOut = "";
      }
      return next;
    });
  };

  const handleGuestsChange = (value) => {
    setBookingState((prev) => ({
      ...prev,
      guests: Number(value) || 1,
    }));
  };

  const handleBookProperty = async () => {
    if (!currentProperty?.id) return;
    if (!user?.UserID) {
      navigate("/login", { state: { from: `/property/${id}` } });
      return;
    }

    if (!bookingState.checkIn || !bookingState.checkOut) {
      setBookingFeedback({
        type: "error",
        message: "Vui lòng chọn ngày nhận phòng và trả phòng.",
      });
      return;
    }

    const checkInDate = new Date(bookingState.checkIn);
    const checkOutDate = new Date(bookingState.checkOut);
    if (checkOutDate <= checkInDate) {
      setBookingFeedback({
        type: "error",
        message: "Ngày trả phòng phải sau ngày nhận phòng.",
      });
      return;
    }

    const nights = Math.max(
      1,
      Math.round(
        (checkOutDate.getTime() - checkInDate.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );

    const pricePerNight =
      currentProperty.pricing?.basePrice ?? currentProperty.price ?? 0;
    const cleaningFee = Number(currentProperty.cleaningFee ?? 0);
    const serviceFee = Number(
      currentProperty.serviceFee ?? Math.round(pricePerNight * nights * 0.1)
    );
    const discount = Number(currentProperty.discount ?? 0);
    const totalPrice =
      pricePerNight * nights - discount + cleaningFee + serviceFee;
    const hostId = currentProperty.hostId || currentProperty.host?.id;

    if (!hostId) {
      setBookingFeedback({
        type: "error",
        message: "Không tìm thấy thông tin host cho chỗ ở này.",
      });
      return;
    }

    const payload = {
      PropertyID: Number(currentProperty.id),
      UserID: user.UserID,
      HostID: hostId,
      CheckIn: checkInDate.toISOString(),
      CheckOut: checkOutDate.toISOString(),
      Nights: nights,
      GuestsCount:
        Math.min(
          Math.max(Number(bookingState.guests) || 1, 1),
          currentProperty.maxGuests || Number(bookingState.guests) || 1
        ),
      BasePrice: pricePerNight,
      CleaningFee: cleaningFee,
      ServiceFee: serviceFee,
      TotalPrice: totalPrice,
      Currency: currentProperty.currency || "USD",
    };

    setBookingFeedback(null);
    setBookingLoading(true);
    try {
      await authAPI.createBooking(payload);
      setBookingFeedback({
        type: "success",
        message: "Đặt phòng thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.",
      });
    } catch (err) {
      setBookingFeedback({
        type: "error",
        message: err.message || "Không thể đặt phòng. Vui lòng thử lại.",
      });
    } finally {
      setBookingLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadProperty(id);
    }
  }, [id, loadProperty]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (!currentProperty?.id) return;
    refreshSaveState(currentProperty.id);
    setBookingState((prev) => ({
      ...prev,
      guests: Math.min(
        prev.guests || 1,
        currentProperty.maxGuests || prev.guests || 1
      ),
    }));
  }, [currentProperty, refreshSaveState]);

  if (loading) {
    return <LoadingSpinner message="Đang tải thông tin chỗ ở..." />;
  }

  if (error || !currentProperty) {
    return <ErrorMessage message={error || "Không tìm thấy chỗ ở này"} />;
  }

  const p = currentProperty;

  return (
    <div className="home-info-page">
      <div className="homeinfo-container">

        {/* ✅ Info Header */}
        <InfoHeader
          title={p.listingTitle || p.title}
          info={{
            rating: p.rating?.toString() || "0",
            reviews: `${p.reviewsCount || 0} reviews`,
            hostStatus: p.hostStatus || "Host",
            location: p.location || `${p.locationObj?.address}, ${p.locationObj?.city}`
          }}
          actions={{
            onShareClick: handleShareProperty,
            onSaveClick: handleToggleSave,
            isSaved: saveState.isSaved,
            saveLoading: saveState.loading,
          }}
        />

        {/* ✅ Gallery with fallback mapping */}
        <Gallery images={p.media?.photos} />

        {/* ✅ Main layout */}
        <div className="homeinfo-main">
          <div className="homeinfo-left">
            <Content property={p} />
          </div>

          <div className="homeinfo-right">
            <HIBookingBox
              property={p}
              checkInDate={bookingState.checkIn}
              checkOutDate={bookingState.checkOut}
              guests={bookingState.guests}
              onDatesChange={handleDatesChange}
              onGuestsChange={handleGuestsChange}
              onBook={handleBookProperty}
              bookingLoading={bookingLoading}
              bookingFeedback={bookingFeedback}
            />
          </div>
        </div>

        <div className="homeif-divider" />
        
        {/* Reviews */}
        <InfoReview
        
          rating={p.rating}
          reviewsCount={p.reviewsCount}
          reviews={p.reviews}
        />

        <div className="homeif-divider" />

        {/* Host */}
        <InfoHost host={p.host} />

        <div className="homeif-divider" />

        {/* Rules */}
        <InfoThingsToKnow property={p} />

        <div className="homeif-divider" />

        {/* ✅ Map uses locationObj for accuracy */}
        <PropertyMap
          property={{
            ...p,
            location: p.locationObj || {
              address: p.location,
              city: "-"
            },
            latitude: p.locationObj?.lat || p.latitude,
            longitude: p.locationObj?.lng || p.longitude
          }}
          height="500px"
          zoom={16}
          showPopup={true}
        />

        <div className="homeif-end-divider" />

      </div>
    </div>
  );
}
