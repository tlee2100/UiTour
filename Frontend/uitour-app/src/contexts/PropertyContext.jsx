import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import mockAPI from '../services/mockAPI';
import authAPI from '../services/authAPI';

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

  const normalizeLocationString = (p) => {
    if (typeof p.location === "string") return p.location;

    const address = p.location?.address || p.location?.addressLine || "";
    const city = p.location?.city || "";
    const country = p.location?.country || "";

    const parts = [address, city, country].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Unknown location";
  };

  const normalizeProperty = (p) => {
    // 1) Location string an toàn cho cả dạng string và object
    const displayLocation =
      typeof p.location === "string"
        ? p.location
        : `${p.location?.addressLine || p.location?.address || ""}, ${p.location?.city || ""}`.replace(/^, |, $/g, "");

    // 2) Chuẩn hóa cover: chấp nhận cả string hoặc object
    const rawCover = p.media?.cover;
    const coverUrl =
      (typeof rawCover === "string" && rawCover) ||
      rawCover?.url ||
      p.mainImage || // ⚠️ FALLBACK từ list API rút gọn
      (Array.isArray(p.media?.photos) && p.media.photos[0]?.url) ||
      (Array.isArray(p.photos) && p.photos[0]) ||
      null;

    // 3) Giá, rating, reviews với fallback từ list rút gọn
    const basePrice = p.pricing?.basePrice ?? p.price ?? 0;
    const rating = p.reviewSummary?.rating ?? p.rating ?? 0;
    const reviewsCount = p.reviewSummary?.count ?? p.reviewsCount ?? 0;

    return {
      id: p.id,
      category: p.category || "property",

      title: p.title || p.listingTitle,
      summary: p.summary,
      description: p.description,

      location: displayLocation,
      locationObj: {
        address: p.location?.addressLine || p.location?.address || "",
        city: p.location?.city || "",
        country: p.location?.country || "Vietnam",
        lat: p.location?.lat ?? p.latitude ?? null,
        lng: p.location?.lng ?? p.longitude ?? null,
      },

      pricing: p.pricing,
      basePrice,
      currency: p.pricing?.currency ?? p.currency ?? "USD",

      // Fees (nếu có)
      cleaningFee: p.pricing?.fees?.cleaning ?? p.cleaningFee ?? 0,
      serviceFee: p.pricing?.fees?.service ?? p.serviceFee ?? 0,
      taxFee: p.pricing?.fees?.tax ?? p.taxFee ?? 0,
      extraGuestFee: p.pricing?.fees?.extraGuest ?? p.extraPeopleFee ?? 0,

      // Media
      media: {
        cover: coverUrl ? { url: coverUrl, alt: "Cover" } : null,
        photos: Array.isArray(p.media?.photos) ? p.media.photos : [],
      },
      photos: Array.isArray(p.photos)
        ? p.photos.map((url) => ({ url, alt: "Photo" }))
        : [],
      mainImage: coverUrl, // ⚠️ luôn set để HomePage dùng được

      // Thông tin khác
      highlights: p.highlights || [],
      houseRules: p.houseRules || [],
      healthAndSafety: p.healthAndSafety || {},
      cancellationPolicy: p.cancellationPolicy || {},

      propertyType: p.propertyType,
      roomType: p.roomType,

      capacity: p.capacity,
      maxGuests: p.capacity?.maxGuests ?? p.maxGuests ?? 1,

      checkIn: p.booking?.checkInFrom || null,
      checkOut: p.booking?.checkOutBefore || null,

      amenities: p.amenities || [],

      host: p.host,
      rating,
      reviewsCount,
      reviews: p.reviews || [],

      dates: p.dates, // để HomePage hiển thị fallback nếu có
      isGuestFavourite: p.isGuestFavourite ?? false,

      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  };

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

  // ✅ Lightweight normalizer for HomePage list
  // ✅ Normalize cho HomePage Grid
  const normalizeHomeCard = (p) => {
    const cover =
      p.media?.cover?.url ||
      (typeof p.media?.cover === "string" && p.media.cover) ||
      p.mainImage ||
      p.photos?.[0]?.url ||
      "/fallback.svg";

    return {
      id: p.id,
      title: p.title || p.listingTitle || "Untitled",
      location: typeof p.location === "string"
        ? p.location
        : `${p.location?.addressLine || ""}, ${p.location?.city || ""}`.replace(/^, |, $/g, ""),

      price: p.pricing?.basePrice ?? p.price ?? 0, // ✅ luôn có giá fallback
      currency: p.pricing?.currency ?? p.currency ?? "USD",

      rating: p.reviewSummary?.rating ?? p.rating ?? 0,
      reviewsCount: p.reviewSummary?.count ?? p.reviewsCount ?? 0,

      mainImage: cover,
      isGuestFavourite: p.isGuestFavourite ?? false,
      dates: p.dates ?? null,
    };
  };

  const fetchProperties = useCallback(async (filters = {}) => {
    try {
      actions.setLoading(true);
      actions.clearError();

      // ✅ Gọi API thật từ backend thay vì mock data
      let list = [];
      
      // Nếu có filters, gọi search API
      if (filters.location || filters.checkIn || filters.checkOut || filters.guests) {
        list = await authAPI.searchProperties(filters);
      } else {
        // Nếu không có filters, lấy tất cả properties
        list = await authAPI.getProperties();
      }

      // Normalize dữ liệu từ backend giống như HomePage
      const normalizedList = list.map(p => {
        const reviews = Array.isArray(p.reviews) ? p.reviews : [];
        const avgRating = reviews.length > 0 
          ? reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviews.length 
          : 0;

        // Helper function to normalize image URL
        const normalizeImageUrl = (url) => {
          if (!url || url.trim().length === 0) return "/fallback.svg";
          // Skip base64 images (they might be truncated)
          if (url.startsWith('data:image')) return "/fallback.svg";
          // If already a full URL (http/https), use as is
          if (url.startsWith('http://') || url.startsWith('https://')) {
            return url.trim();
          }
          // If relative path starting with /, prepend backend base URL
          if (url.startsWith('/')) {
            return `http://localhost:5069${url}`;
          }
          // Otherwise, assume it's a relative path and prepend backend base URL
          return `http://localhost:5069/${url}`;
        };

        // Get first photo - check multiple possible field names and structures
        const photos = p.photos || p.Photos || [];
        let firstPhoto = null;
        let imageUrl = "/fallback.svg";

        if (Array.isArray(photos) && photos.length > 0) {
          // Sort by SortIndex if available, otherwise use first photo
          const sortedPhotos = [...photos].sort((a, b) => {
            const aIndex = a.sortIndex ?? a.SortIndex ?? 0;
            const bIndex = b.sortIndex ?? b.SortIndex ?? 0;
            return aIndex - bIndex;
          });
          firstPhoto = sortedPhotos[0];
        }

        if (firstPhoto) {
          // Try multiple possible URL field names (camelCase, PascalCase, etc.)
          imageUrl = firstPhoto.url || 
                     firstPhoto.Url || 
                     firstPhoto.serverUrl || 
                     firstPhoto.ServerUrl || 
                     firstPhoto.imageUrl ||
                     firstPhoto.ImageUrl ||
                     "/fallback.svg";
        }

        // Debug logging for missing photos
        if (!firstPhoto || imageUrl === "/fallback.svg") {
          console.warn(`⚠️ Property ${p.propertyID || p.PropertyID} has no valid photos:`, {
            propertyID: p.propertyID || p.PropertyID,
            photosCount: photos.length,
            photos: photos,
            firstPhoto: firstPhoto
          });
        }

        // Extract location coordinates
        const lat = parseFloat(p.lat) || null;
        const lng = parseFloat(p.lng) || null;

        return {
          id: p.propertyID || p.PropertyID,
          title: p.listingTitle || p.ListingTitle || 'Untitled',
          listingTitle: p.listingTitle || p.ListingTitle || 'Untitled', // ✅ Thêm listingTitle để PropertyCard có thể dùng
          location: p.location || p.Location || '',
          locationObj: {
            address: p.location || p.Location || '',
            city: p.city?.name || p.City?.name || '',
            country: p.country?.name || p.Country?.name || 'Vietnam',
            lat: lat,
            lng: lng
          },
          price: p.price || p.Price || 0,
          currency: p.currency || p.Currency || "USD",
          rating: avgRating,
          reviewsCount: reviews.length,
          mainImage: normalizeImageUrl(imageUrl),
          // Property details for PropertyCard
          propertyType: p.propertyType || p.PropertyType || 'Entire home',
          maxGuests: p.accommodates || p.Accommodates || 1,
          accommodates: p.accommodates || p.Accommodates || 1,
          bedrooms: p.bedrooms || p.Bedrooms || 0,
          beds: p.beds || p.Beds || 0,
          bathrooms: parseFloat(p.bathrooms || p.Bathrooms || 0),
          isGuestFavourite: false,
          dates: null
        };
      });

      actions.setProperties(normalizedList);
      return normalizedList;

    } catch (err) {
      actions.setError(err.message);
      throw err;
    } finally {
      actions.setLoading(false);
    }
  }, [actions]);


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
