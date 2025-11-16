import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  useCallback
} from "react";
import authAPI from "../services/authAPI";

// -----------------------------
// Initial State
// -----------------------------
const initialState = {
  currentExperience: null,
  experiences: [],
  searchResults: [],
  loading: false,
  error: null,
  searchQuery: "",
  filters: {
    location: "",
    minPrice: null,
    maxPrice: null,
  },
};

// -----------------------------
// Action Types
// -----------------------------
const ActionTypes = {
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
  SET_CURRENT_EXPERIENCE: "SET_CURRENT_EXPERIENCE",
  SET_EXPERIENCES: "SET_EXPERIENCES",
  SET_SEARCH_RESULTS: "SET_SEARCH_RESULTS",
  SET_SEARCH_QUERY: "SET_SEARCH_QUERY",
  SET_FILTERS: "SET_FILTERS",
};

// -----------------------------
// Reducer
// -----------------------------
const experienceReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    case ActionTypes.SET_CURRENT_EXPERIENCE:
      return { ...state, currentExperience: action.payload };
    case ActionTypes.SET_EXPERIENCES:
      return { ...state, experiences: action.payload };
    case ActionTypes.SET_SEARCH_RESULTS:
      return { ...state, searchResults: action.payload };
    case ActionTypes.SET_SEARCH_QUERY:
      return { ...state, searchQuery: action.payload };
    case ActionTypes.SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } };
    default:
      return state;
  }
};

// -----------------------------
// Context
// -----------------------------
const ExperienceContext = createContext();

// Normalizer for tours list (lightweight)
const normalizeExperienceListItem = (e) => ({
  id: e.id,
  title: e.title,
  description: e.description,
  image: e.image || null,
  price: e.price ?? 0,
  rating: e.rating ?? 0,
  reviews: e.reviews ?? 0,
  duration: e.duration || null,
  location: e.location || "",
  isGuestFavourite: e.isGuestFavourite || false,
});


// -----------------------------
// Normalizer for unified UI
// -----------------------------
const normalizeExperience = (e) => {
  const locString = e.location || "";

  return {
    id: e.id,
    category: "experience",

    title: e.title,
    summary: e.summary,
    description: e.description,

    rating: e.rating ?? 0,
    reviewsCount: e.reviewsCount ?? 0,

    location: locString,
    locationObj: {
      address: locString,
      city: e.city || "",
      country: e.country || "Vietnam",
      lat: e.latitude ?? null,
      lng: e.longitude ?? null,
    },

    pricing: {
      basePrice: e.price ?? 0,
      currency: e.currency || "USD",
    },
    basePrice: e.price ?? 0,
    currency: e.currency || "USD",

    media: e.media || {},
    photos: e.media?.photos ?? e.photos ?? [],
    mainImage: e.media?.cover?.url ?? null,

    capacity: { maxGuests: e.maxGuests ?? 1 },
    bookingInfo: e.booking ?? {},
    maxGuests: e.maxGuests ?? 1,

    durationHours: e.durationHours,
    experienceDetails: e.experienceDetails || e.details || [],

    host: e.host ?? null,
    hostId: e.hostId ?? null,

    isActive: e.isActive,
    createdAt: e.createdAt,
    reviews: e.reviews ?? []
  };
};


// -----------------------------
// Provider Component
// -----------------------------
export const ExperienceProvider = ({ children }) => {
  const [state, dispatch] = useReducer(experienceReducer, initialState);

  const setLoading = useCallback(
    (v) => dispatch({ type: ActionTypes.SET_LOADING, payload: v }),
    []
  );
  const setError = useCallback(
    (v) => dispatch({ type: ActionTypes.SET_ERROR, payload: v }),
    []
  );
  const clearError = useCallback(
    () => dispatch({ type: ActionTypes.CLEAR_ERROR }),
    []
  );

  const setCurrentExperience = (exp) =>
    dispatch({ type: ActionTypes.SET_CURRENT_EXPERIENCE, payload: exp });
  const setExperiences = (arr) =>
    dispatch({ type: ActionTypes.SET_EXPERIENCES, payload: arr });
  const setSearchResults = (arr) =>
    dispatch({ type: ActionTypes.SET_SEARCH_RESULTS, payload: arr });
  const setSearchQuery = (q) =>
    dispatch({ type: ActionTypes.SET_SEARCH_QUERY, payload: q });

  // -----------------------------
  // API Calls
  // -----------------------------
  const fetchExperienceById = useCallback(async (id) => {
  try {
    setLoading(true);
    clearError();

    // Base tour
    const tour = await authAPI.getTourById(id);

    // Related resources
    const [photos, reviews, host, details] = await Promise.all([
      authAPI.getTourPhotos(id).catch(() => []),
      authAPI.getTourReviews(id).catch(() => []),
      tour?.hostID ? authAPI.getHostById(tour.hostID).catch(() => null) : Promise.resolve(null),
      authAPI.getTourExperienceDetails(id).catch(() => []),   // ✅ thêm dòng này
    ]);

    // Build media
    const media = {
      cover: photos?.[0]?.url ? { url: photos[0].url } : undefined,
      photos: (photos || []).map(p => ({
        id: p.photoID,
        url: p.url,
        alt: p.caption || "photo"
      })),
    };

    // Map reviews
    const mappedReviews = (reviews || []).map(r => ({
      id: r.reviewID,
      userId: r.userID,
      userName: r.user?.fullName || "Guest",
      userAvatar: r.user?.avatar,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
    }));

    const reviewsCount = mappedReviews.length;
    const rating =
      reviewsCount > 0
        ? mappedReviews.reduce((acc, x) => acc + (Number(x.rating) || 0), 0) / reviewsCount
        : 0;

    // Host
    let hostUi = null;
    if (host) {
      hostUi = {
        id: host.hostID,
        name: host.user?.fullName || "Host",
        avatar: host.user?.avatar,
        joinedDate: host.hostSince,
        responseRate: host.hostResponseRate ?? 0,
        responseTime: "within a few hours",
        isSuperhost: !!host.isSuperHost,
        totalReviews: reviewsCount,
        averageRating: rating,
        languages: [],
        description: host.hostAbout,
      };
    }

    // ✅ Map experienceDetails
    const mappedDetails = (details || []).map(d => ({
      id: d.detailID,
      image: d.imageUrl,
      title: d.title,
      description: d.description,
      sortIndex: d.sortIndex
    }));

    const merged = {
      id: tour?.tourID ?? Number(id),
      title: tour?.tourName,
      summary: tour?.description,
      description: tour?.description,
      rating,
      reviewsCount,
      location: tour?.location,
      city: tour?.city?.cityName,
      country: tour?.country?.countryName,
      latitude: tour?.latitude,
      longitude: tour?.longitude,
      price: tour?.price,
      currency: tour?.currency,
      maxGuests: tour?.maxGuests,
      durationHours: typeof tour?.durationDays === "number" ? tour.durationDays * 24 : undefined,
      media,
      reviews: mappedReviews,
      host: hostUi,
      hostId: tour?.hostID,
      isActive: !!tour?.active,
      createdAt: tour?.createdAt,
      experienceDetails: mappedDetails,   // ✅ thêm vào object
    };

    const normalized = normalizeExperience(merged);
    setCurrentExperience(normalized);
    return normalized;
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
  }, []);


  const fetchExperiences = useCallback(async (filters = {}) => {
  try {
    setLoading(true);
    clearError();
    const tours = await authAPI.getTours();

    // Load cover image per tour (first photo) in parallel
    const coverPromises = (tours || []).map(async (t) => {
      try {
        const photos = await authAPI.getTourPhotos(t.tourID);
        const first = Array.isArray(photos) && photos.length > 0 ? photos[0] : null;
        return first ? { id: t.tourID, url: first.url } : { id: t.tourID, url: null };
      } catch {
        return { id: t.tourID, url: null };
      }
    });

    const covers = await Promise.all(coverPromises);
    const tourIdToCoverUrl = new Map(covers.map(c => [c.id, c.url]));

    const normalized = (tours || []).map(t => {
      const imageUrl = tourIdToCoverUrl.get(t.tourID) || null;

      // ✅ Tính toán rating và reviewsCount
      const reviewsCount = Array.isArray(t.reviews) ? t.reviews.length : 0;
      const averageRating = reviewsCount > 0
        ? t.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsCount
        : 0;

      return normalizeExperienceListItem({
        id: t.tourID,
        title: t.tourName,
        description: t.description,
        image: imageUrl ? { url: imageUrl } : null,
        price: t.price,
        rating: averageRating,
        reviews: reviewsCount,
        duration: typeof t.durationDays === "number" ? `${t.durationDays} days` : null,
        location: t.location || "",
        isGuestFavourite: false,
      });
    });

    setExperiences(normalized);
    return normalized;
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
  }, []);

  const searchExperiences = useCallback(async (query, filters = {}) => {
    try {
      setLoading(true);
      clearError();
      const result = await mockAPI.searchExperiences(query, filters);
      const normalized = result.map(normalizeExperienceListItem); // ✅
      setSearchResults(normalized);
      setSearchQuery(query);
      return normalized;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);


  // Auto Load
  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  const value = useMemo(
    () => ({
      ...state,
      fetchExperienceById,
      fetchExperiences,
      searchExperiences,
      setFilters: (filters) =>
        dispatch({ type: ActionTypes.SET_FILTERS, payload: filters }),
    }),
    [state, fetchExperienceById, fetchExperiences, searchExperiences]
  );

  return (
    <ExperienceContext.Provider value={value}>
      {children}
    </ExperienceContext.Provider>
  );
};

// Hook
export const useExperience = () => {
  const ctx = useContext(ExperienceContext);
  if (!ctx)
    throw new Error("useExperience must be used within ExperienceProvider");
  return ctx;
};

export default ExperienceContext;
