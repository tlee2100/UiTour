import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import mockAPI from '../services/mockAPI';

// -----------------------------
// Initial State
// -----------------------------
const initialState = {
  currentProperty: null,
  properties: [],
  searchResults: [],
  loading: false,
  error: null,
  searchQuery: '',
  filters: {
    location: '',
    minPrice: null,
    maxPrice: null,
    guests: null,
    amenities: []
  },
  currentPage: 1,
  totalPages: 1,
  totalResults: 0
};

// -----------------------------
// Action Types
// -----------------------------
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_CURRENT_PROPERTY: 'SET_CURRENT_PROPERTY',
  SET_PROPERTIES: 'SET_PROPERTIES',
  SET_SEARCH_RESULTS: 'SET_SEARCH_RESULTS',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_FILTERS: 'SET_FILTERS',
  SET_PAGINATION: 'SET_PAGINATION'
};

// -----------------------------
// Reducer
// -----------------------------
const propertyReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    case ActionTypes.SET_CURRENT_PROPERTY:
      return { ...state, currentProperty: action.payload };
    case ActionTypes.SET_PROPERTIES:
      return { ...state, properties: action.payload };
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
const PropertyContext = createContext();

// -----------------------------
// Provider Component
// -----------------------------
export const PropertyProvider = ({ children }) => {
  const [state, dispatch] = useReducer(propertyReducer, initialState);

  // -----------------------------
  // Actions (memoized with useCallback)
  // -----------------------------
  const setLoading = useCallback(
    (loading) => dispatch({ type: ActionTypes.SET_LOADING, payload: loading }),
    []
  );

  const setError = useCallback(
    (error) => dispatch({ type: ActionTypes.SET_ERROR, payload: error }),
    []
  );

  const clearError = useCallback(() => dispatch({ type: ActionTypes.CLEAR_ERROR }), []);

  const setCurrentProperty = useCallback(
    (property) => dispatch({ type: ActionTypes.SET_CURRENT_PROPERTY, payload: property }),
    []
  );

  const setProperties = useCallback(
    (properties) => dispatch({ type: ActionTypes.SET_PROPERTIES, payload: properties }),
    []
  );

  const setSearchResults = useCallback(
    (results) => dispatch({ type: ActionTypes.SET_SEARCH_RESULTS, payload: results }),
    []
  );

  const setSearchQuery = useCallback(
    (query) => dispatch({ type: ActionTypes.SET_SEARCH_QUERY, payload: query }),
    []
  );

  const setFilters = useCallback(
    (filters) => dispatch({ type: ActionTypes.SET_FILTERS, payload: filters }),
    []
  );

  const setPagination = useCallback(
    (pagination) => dispatch({ type: ActionTypes.SET_PAGINATION, payload: pagination }),
    []
  );

  // Gom tất cả actions lại sau khi đã memo hóa
  const actions = useMemo(
    () => ({
      setLoading,
      setError,
      clearError,
      setCurrentProperty,
      setProperties,
      setSearchResults,
      setSearchQuery,
      setFilters,
      setPagination
    }),
    [
      setLoading,
      setError,
      clearError,
      setCurrentProperty,
      setProperties,
      setSearchResults,
      setSearchQuery,
      setFilters,
      setPagination
    ]
  );

  const normalizeProperty = (p) => ({
    id: p.id,
    category: "property",

    listingTitle: p.listingTitle,
    summary: p.summary,
    description: p.description,
    rating: p.rating,
    reviewsCount: p.reviewsCount,

    // ✅ Location chuẩn
    locationObj: {
      address: p.location?.address || p.location?.split(",")[0] || "",
      city: p.location?.city || p.location?.split(",")[1] || "",
      lat: p.latitude || p.location?.lat || 0,
      lng: p.longitude || p.location?.lng || 0,
    },

    // ✅ Tối ưu Map + Text UI
    location:
      typeof p.location === "string"
        ? p.location
        : `${p.location?.address || ""}, ${p.location?.city || ""}`,

    // ✅ Giá thống nhất format
    pricing: {
      basePrice: p.price || p.pricing?.basePrice || 0,
      currency: p.currency || p.pricing?.currency || "USD"
    },
    price: p.pricing?.basePrice ?? p.price ?? 0,
    currency: p.pricing?.currency ?? p.currency ?? "USD",

    // ✅ Tối ưu Gallery
    photos:
      Array.isArray(p.photos)
        ? p.photos
        : p.media?.photos?.map((x) => x.url) || [],

    mainImage: p.mainImage || p.media?.cover,

    // ✅ Booking
    booking: {
      maxGuests: p.maxGuests || p.accommodates || 2,
    },

    amenities: p.amenities || [],
    bedrooms: p.bedrooms,
    beds: p.beds,
    bathrooms: p.bathrooms,

    reviews: p.reviews || [],
    host: p.host,
    createdAt: p.createdAt,
  });

  // -----------------------------
  // API Methods (memoized with useCallback)
  // -----------------------------
  const fetchPropertyById = useCallback(
    async (propertyId) => {
      try {
        actions.setLoading(true);
        actions.clearError();

        const raw = await mockAPI.getPropertyById(propertyId);
        const normalized = normalizeProperty(raw);
        actions.setCurrentProperty(normalized);
        return normalized;

      } catch (err) {
        actions.setError(err.message);
        throw err;
      } finally {
        actions.setLoading(false);
      }
    },
    [actions]
  );


  const fetchProperties = useCallback(
    async (filters = {}) => {
      try {
        actions.setLoading(true);
        actions.clearError();
        const list = await mockAPI.getProperties(filters);
        const normalizedList = list.map(normalizeProperty);
        actions.setProperties(normalizedList);
        return normalizedList;
      } catch (err) {
        actions.setError(err.message);
        throw err;
      } finally {
        actions.setLoading(false);
      }
    },
    [actions]
  );

  const searchProperties = useCallback(
    async (query, filters = {}) => {
      try {
        actions.setLoading(true);
        actions.clearError();
        const results = await mockAPI.searchProperties(query, filters);
        const normalizedResults = results.map(normalizeProperty);
        actions.setSearchResults(normalizedResults);
        actions.setSearchQuery(query);
        return normalizedResults;
        actions.setSearchQuery(query);
        return results;
      } catch (err) {
        actions.setError(err.message);
        throw err;
      } finally {
        actions.setLoading(false);
      }
    },
    [actions]
  );

  const fetchReviews = useCallback(
    async (propertyId) => {
      try {
        actions.setLoading(true);
        actions.clearError();
        const reviews = await mockAPI.getReviewsByPropertyId(propertyId);
        return reviews;
      } catch (err) {
        actions.setError(err.message);
        throw err;
      } finally {
        actions.setLoading(false);
      }
    },
    [actions]
  );

  const fetchHost = useCallback(
    async (hostId) => {
      try {
        actions.setLoading(true);
        actions.clearError();
        const host = await mockAPI.getHostById(hostId);
        return host;
      } catch (err) {
        actions.setError(err.message);
        throw err;
      } finally {
        actions.setLoading(false);
      }
    },
    [actions]
  );

  // -----------------------------
  // Auto-fetch properties once
  // -----------------------------
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // -----------------------------
  // Context Value (memoized)
  // -----------------------------
  const value = useMemo(
    () => ({
      ...state,
      ...actions,
      fetchPropertyById,
      fetchProperties,
      searchProperties,
      fetchReviews,
      fetchHost
    }),
    [state, actions, fetchPropertyById, fetchProperties, searchProperties, fetchReviews, fetchHost]
  );

  return <PropertyContext.Provider value={value}>{children}</PropertyContext.Provider>;
};

// -----------------------------
// Custom Hook
// -----------------------------
export const useProperty = () => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('useProperty must be used within a PropertyProvider');
  }
  return context;
};

export default PropertyContext;
