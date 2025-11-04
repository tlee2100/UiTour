import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  useCallback
} from 'react';
import mockAPI from '../services/mockAPI';

// -----------------------------
// Initial State
// -----------------------------
const initialState = {
  currentExperience: null,
  experiences: [],
  searchResults: [],
  loading: false,
  error: null,
  searchQuery: '',
  filters: {
    location: '',
    minPrice: null,
    maxPrice: null,
  },
  currentPage: 1,
  totalPages: 1,
  totalResults: 0,
};

// -----------------------------
// Action Types
// -----------------------------
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_CURRENT_EXPERIENCE: 'SET_CURRENT_EXPERIENCE',
  SET_EXPERIENCES: 'SET_EXPERIENCES',
  SET_SEARCH_RESULTS: 'SET_SEARCH_RESULTS',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_FILTERS: 'SET_FILTERS',
  SET_PAGINATION: 'SET_PAGINATION'
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

    case ActionTypes.SET_PAGINATION:
      return {
        ...state,
        currentPage: action.payload.currentPage,
        totalPages: action.payload.totalPages,
        totalResults: action.payload.totalResults
      };

    default:
      return state;
  }
};

// -----------------------------
// Context
// -----------------------------
const ExperienceContext = createContext();

// -----------------------------
// Provider Component
// -----------------------------
export const ExperienceProvider = ({ children }) => {
  const [state, dispatch] = useReducer(experienceReducer, initialState);

  // -----------------------------
  // Dispatch Actions
  // -----------------------------
  const setLoading = (val) =>
    dispatch({ type: ActionTypes.SET_LOADING, payload: val });
  const setError = (val) =>
    dispatch({ type: ActionTypes.SET_ERROR, payload: val });
  const clearError = () => dispatch({ type: ActionTypes.CLEAR_ERROR });
  const setCurrentExperience = (val) =>
    dispatch({ type: ActionTypes.SET_CURRENT_EXPERIENCE, payload: val });
  const setExperiences = (val) =>
    dispatch({ type: ActionTypes.SET_EXPERIENCES, payload: val });
  const setSearchResults = (val) =>
    dispatch({ type: ActionTypes.SET_SEARCH_RESULTS, payload: val });
  const setSearchQuery = (val) =>
    dispatch({ type: ActionTypes.SET_SEARCH_QUERY, payload: val });

  // -----------------------------
  // Helpers - Normalize API Data
  // -----------------------------
  // -----------------------------
  // Helpers - Normalize API Data
  // -----------------------------
  const normalizeExperience = (exp) => {
    if (!exp) return null;

    return {
      id: exp.id,
      category: exp.category,

      // ✅ Đổi key theo UI đang dùng
      listingTitle: exp.title,

      summary: exp.summary,
      description: exp.description,
      rating: exp.rating,
      reviewsCount: exp.reviewsCount,
      isActive: exp.isActive,
      durationHours: exp.durationHours,

      // ✅ UI Map cần latitude / longitude
      latitude: exp.location?.lat || 0,
      longitude: exp.location?.lng || 0,
      location: `${exp.location?.address || ""}, ${exp.location?.city || ""}`,

      // ✅ Price shortcut cho Booking UI
      price: exp.pricing?.basePrice || 0,
      pricePerNight: exp.pricing?.basePrice || exp.price || 0,
      currency: exp.pricing?.currency || "VND",

      // ✅ Gallery cần array URL
      photos: exp.media?.photos?.map(img => img.url) || [],
      mainImage: exp.media?.cover || "",

      // ✅ Booking UI dùng bookingInfo
      bookingInfo: exp.booking || {},

      details: exp.details || [],
      host: exp.host || null,
      reviews: exp.reviews || [],
      createdAt: exp.createdAt,
    };
  };


  const normalizeExperienceList = (exps = []) =>
  exps.map((e) => ({
    id: e.id,

    // Tiêu đề: giữ cả 2 khóa để không vỡ component khác
    title: e.title,
    listingTitle: e.listingTitle || e.title,

    description: e.summary || e.description || "",
    rating: e.rating ?? 0,

    // Reviews: hỗ trợ cả reviews và reviewsCount
    reviews: e.reviews ?? e.reviewsCount ?? 0,
    reviewsCount: e.reviewsCount ?? e.reviews ?? 0,

    // Ảnh: ưu tiên trường 'image' từ danh sách compact
    image:
      e.image ||
      e.media?.cover ||
      e.media?.photos?.[0]?.url ||
      "",

    category: e.category,

    // Location: danh sách compact trả string sẵn
    // fallback về object cũ nếu có
    location:
      typeof e.location === "string"
        ? e.location
        : `${e.location?.address || ""}, ${e.location?.city || ""}`.replace(/^, |, $/g, ""),

    // Giá + tiền tệ: compact có 'price', schema cũ có pricing
    price: e.price ?? e.pricing?.basePrice ?? 0,
    pricePerNight: e.price ?? e.pricing?.basePrice ?? 0,
    currency: e.currency ?? e.pricing?.currency ?? "VND",

    // Thời lượng: compact có 'duration' (đã format), schema cũ có durationHours
    duration: e.duration || (e.durationHours ? `~${e.durationHours} hours` : "Flexible"),

    // Trạng thái
    isActive: e.isActive ?? true,
  }));



  // -----------------------------
  // API Calls
  // -----------------------------
  const fetchExperienceById = useCallback(async (id) => {
    try {
      setLoading(true);
      clearError();
      const data = await mockAPI.getExperienceById(id);
      const normalized = normalizeExperience(data);
      setCurrentExperience(normalized);
      return normalized;
    } catch (err) {
      setError(err.message || "Failed to fetch experience");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchExperiences = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      clearError();
      const list = await mockAPI.getExperiences(filters);
      const normalizedList = normalizeExperienceList(list);
      setExperiences(normalizedList);
      return normalizedList;
    } catch (err) {
      setError(err.message || "Failed to load experiences");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchExperiences = useCallback(async (query, filters = {}) => {
    try {
      setLoading(true);
      clearError();
      const results = await mockAPI.searchExperiences(query, filters);
      const normalized = normalizeExperienceList(results);
      setSearchResults(normalized);
      setSearchQuery(query);
      return normalized;
    } catch (err) {
      setError(err.message || "Search failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Fetch on first load
  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  const value = useMemo(
    () => ({
      ...state,
      fetchExperienceById,
      fetchExperiences,
      searchExperiences,
    }),
    [state, fetchExperienceById, fetchExperiences, searchExperiences]
  );

  return (
    <ExperienceContext.Provider value={value}>
      {children}
    </ExperienceContext.Provider>
  );
};

// -----------------------------
// Hook
// -----------------------------
export const useExperience = () => {
  const context = useContext(ExperienceContext);
  if (!context)
    throw new Error("useExperience must be used within ExperienceProvider");
  return context;
};

export default ExperienceContext;
