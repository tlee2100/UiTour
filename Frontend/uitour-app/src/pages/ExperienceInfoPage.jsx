import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useExperience } from "../contexts/ExperienceContext";
import { useApp } from "../contexts/AppContext";
import authAPI from "../services/authAPI";
import "./ExperienceInfoPage.css";
import InfoReview from "./Info_components/InfoReview";
import InfoHost from "./Info_components/InfoHost";
import ExpGallery from "./ExperienceInfo_component/ExpGallery";
import ExpAboutSection from "./ExperienceInfo_component/ExpAboutSection";
import ExpDetails from "./ExperienceInfo_component/ExpDetails";
import PropertyMap from "../components/PropertyMap";
import ExpInfoBookingBox from "./ExperienceInfo_component/ExpInfoBookingBox";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

export default function ExperienceInfoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useApp();
  const {
    currentExperience,
    loading,
    error,
    fetchExperienceById
  } = useExperience();

  const [localLoading, setLocalLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [saveState, setSaveState] = useState({ isSaved: false, loading: false });
  const [bookingState, setBookingState] = useState({
    guests: 1,
    selectedDate: null,
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingFeedback, setBookingFeedback] = useState(null);

  const loadExperience = useCallback(async (experienceId) => {
    if (!experienceId || hasLoaded) return;

    setLocalLoading(true);
    setHasLoaded(true);

    try {
      await fetchExperienceById(experienceId);
    } catch (e) {
      console.error("Failed to load experience", e);
    } finally {
      setLocalLoading(false);
    }
  }, [fetchExperienceById, hasLoaded]);

  useEffect(() => {
    if (id && !hasLoaded) {
      loadExperience(id);
    }
  }, [id, loadExperience, hasLoaded]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setHasLoaded(false);
  }, [id]);

  // -----------------------
  // Load saved state
  // -----------------------
  const isTourSaved = useCallback((wishlistPayload, tourIdentifier) => {
    if (!wishlistPayload || !tourIdentifier) return false;
    const items = wishlistPayload.items || wishlistPayload.Items || [];
    return items.some(
      (item) =>
        (item.type === 'tour' || item.Type === 'tour') &&
        Number(item.id ?? item.Id ?? item.tourId ?? item.TourID) ===
        Number(tourIdentifier)
    );
  }, []);

  const refreshSaveState = useCallback(
    async (tourIdValue) => {
      if (!user?.UserID || !tourIdValue) {
        setSaveState((prev) => ({ ...prev, isSaved: false }));
        return;
      }
      try {
        const wishlist = await authAPI.getUserWishlist(user.UserID);
        const saved = isTourSaved(wishlist, tourIdValue);
        setSaveState({ isSaved: saved, loading: false });
      } catch (err) {
        console.error("Failed to load wishlist:", err);
        setSaveState((prev) => ({ ...prev, isSaved: false }));
      }
    },
    [user, isTourSaved]
  );

  useEffect(() => {
    if (currentExperience?.id && user?.UserID) {
      refreshSaveState(currentExperience.id);
    }
  }, [currentExperience?.id, user?.UserID, refreshSaveState]);

  // -----------------------
  // Handle Save Toggle
  // -----------------------
  const handleToggleSave = useCallback(async () => {
    if (!currentExperience?.id) return;

    if (!user?.UserID) {
      navigate("/login", { state: { from: `/experience/${id}` } });
      return;
    }

    setSaveState((prev) => ({ ...prev, loading: true }));
    try {
      const response = saveState.isSaved
        ? await authAPI.removeFromWishlist(user.UserID, currentExperience.id, 'tour')
        : await authAPI.addToWishlist(user.UserID, currentExperience.id, 'tour');
      const saved = isTourSaved(response, currentExperience.id);
      setSaveState({ isSaved: saved, loading: false });
    } catch (err) {
      console.error("Failed to toggle wishlist:", err);
      setSaveState((prev) => ({ ...prev, loading: false }));
      alert(err.message || "Không thể cập nhật danh sách yêu thích.");
    }
  }, [currentExperience, id, isTourSaved, navigate, saveState.isSaved, user]);

  // -----------------------
  // Handle Share
  // -----------------------
  const handleShare = useCallback(() => {
    if (!currentExperience) return;
    const shareData = {
      title: currentExperience.title || "UiTour Experience",
      text: currentExperience.summary || currentExperience.description || "",
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
  }, [currentExperience]);

  // -----------------------
  // Handle Booking
  // -----------------------
  const handleBookTour = useCallback(async (guests, selectedDate) => {
    if (!currentExperience?.id) return;
    if (!user?.UserID) {
      navigate("/login", { state: { from: `/experience/${id}` } });
      return;
    }

    if (!selectedDate) {
      setBookingFeedback({
        type: "error",
        message: "Vui lòng chọn ngày tham gia tour.",
      });
      return;
    }

    if (!guests || guests < 1) {
      setBookingFeedback({
        type: "error",
        message: "Số lượng khách không thể là 0.",
      });
      return;
    }

    const tourDate = new Date(selectedDate);
    const pricePerPerson = currentExperience.pricing?.basePrice ?? currentExperience.price ?? 0;
    const totalPrice = pricePerPerson * guests;
    const hostId = currentExperience.hostId || currentExperience.host?.id;

    if (!hostId) {
      setBookingFeedback({
        type: "error",
        message: "Không tìm thấy thông tin host cho tour này.",
      });
      return;
    }

    // Tour booking payload
    const payload = {
      TourID: currentExperience.id, // Tour ID
      PropertyID: null, // Not used for tour bookings
      UserID: user.UserID,
      HostID: hostId,
      CheckIn: tourDate.toISOString(),
      CheckOut: tourDate.toISOString(), // Same day for tour
      Nights: 1,
      GuestsCount: Math.min(guests, currentExperience.maxGuests || guests),
      BasePrice: pricePerPerson,
      CleaningFee: 0,
      ServiceFee: 0,
      TotalPrice: totalPrice,
      Currency: currentExperience.currency || currentExperience.pricing?.currency || "USD",
    };

    setBookingFeedback(null);
    setBookingLoading(true);
    try {
      await authAPI.createBooking(payload);
      setBookingFeedback({
        type: "success",
        message: "Đặt tour thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.",
      });
      // Reset booking state
      setBookingState({ guests: 1, selectedDate: null });
    } catch (err) {
      setBookingFeedback({
        type: "error",
        message: err.message || "Không thể đặt tour. Vui lòng thử lại.",
      });
    } finally {
      setBookingLoading(false);
    }
  }, [currentExperience, id, navigate, user]);

  if (loading || localLoading) {
    return <LoadingSpinner message="Loading experience..." />;
  }

  if (error || !currentExperience) {
    return <ErrorMessage message={error || "Experience not found"} />;
  }

  const exp = currentExperience;

  // Debug: Log experienceDetails
  console.log("🔍 ExperienceInfoPage - exp.experienceDetails:", exp?.experienceDetails);
  console.log("🔍 ExperienceInfoPage - exp.experienceDetails length:", exp?.experienceDetails?.length || 0);

  return (
    <div className="experience-info-page">

      {/* Gallery + Overview */}
      <div className="expif-two-columns">
        <div className="expif-left-column">
          <ExpGallery
            images={
              exp.media?.photos?.map(p => p.url || p) || 
              exp.photos?.map(p => p.url || p) || 
              []
            }
          />

        </div>

        <div className="expif-right-column">
          <ExpAboutSection
            title={exp.listingTitle || exp.title}
            summary={exp.summary}
            rating={exp.rating}
            reviewsCount={exp.reviewsCount}
            location={exp.location}
            duration={`${exp.durationHours} hours`}
            price={exp.pricing?.basePrice || exp.price}
            currency={exp.pricing?.currency || exp.currency}
            host={exp.host}
            onSaveToggle={handleToggleSave}
            isSaved={saveState.isSaved}
            saveLoading={saveState.loading}
            onShare={handleShare}
          />
        </div>
      </div>

      {/* Details + Booking */}
      <div className="expif-details-layout">
        <div className="expif-details-left">
          <ExpDetails
            title="What you’ll do"
            details={exp.experienceDetails}
          />
        </div>

        <div className="expif-details-right">
          <ExpInfoBookingBox
            booking={exp.bookingInfo}
            price={exp.pricing?.basePrice || exp.price}
            currency={exp.pricing?.currency || exp.currency}
            maxGuests={exp.maxGuests}
            onBook={handleBookTour}
            bookingLoading={bookingLoading}
            bookingFeedback={bookingFeedback}
          />
        </div>
      </div>

      <div className="expif-divider" />

      {/* Reviews */}
      <InfoReview
        rating={exp.rating}
        reviewsCount={exp.reviewsCount}
        reviews={exp.reviews}
      />

      <div className="expif-divider" />

      {/* Host */}
      <InfoHost host={exp.host} />

      <div className="expif-divider" />

      {/* Map */}
      <PropertyMap
        property={exp}    // ✅ TRUY NGUYÊN OBJECT TRONG CONTEXT
        height="500px"
        zoom={16}
        showPopup={true}
      />


      <div className="expif-end-divider" />
    </div>
  );
}