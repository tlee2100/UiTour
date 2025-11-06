import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  useCallback
} from "react";
import mockAPI from "../services/mockAPI";

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
  const loc = e.location || {};

  return {
    id: e.id,
    category: "experience",

    title: e.title,
    summary: e.summary,
    description: e.description,

    rating: e.rating ?? 0,
    reviewsCount: e.reviewsCount ?? 0,

    location: `${loc.addressLine || ""}, ${loc.city || ""}`.replace(/^, |, $/g, ""),
    locationObj: {
      address: loc.addressLine || "",
      city: loc.city || "",
      country: loc.country || "Vietnam",
      lat: loc.lat ?? null,
      lng: loc.lng ?? null,
    },

    pricing: e.pricing,
    basePrice: e.pricing?.basePrice ?? 0,
    currency: e.pricing?.currency ?? "VND",

    media: e.media,
    photos: e.media?.photos ?? [],
    mainImage: e.media?.cover?.url ?? null,

    capacity: e.capacity ?? { maxGuests: 1 },
    bookingInfo: e.booking ?? {},  // ✅ trả tên đúng cho Booking Box
    maxGuests: e.capacity?.maxGuests ?? 1,

    durationHours: e.durationHours,
    experienceDetails: e.experienceDetails || e.details || [],

    // ✅ phần bị thiếu!
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
      const raw = await mockAPI.getExperienceById(id);
      const normalized = normalizeExperience(raw);
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
      const list = await mockAPI.getExperiences(filters);
      const normalized = list.map(normalizeExperienceListItem); // ✅ dùng loại nhẹ
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
