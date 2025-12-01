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
  mainCategory: e.mainCategory || "",
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
    
    console.log(`🔍 Tour ${id} from API:`, {
      tourID: tour?.tourID || tour?.TourID,
      hasPhotosInTour: !!(tour?.photos || tour?.Photos),
      photosCount: (tour?.photos || tour?.Photos || []).length,
      photos: tour?.photos || tour?.Photos || [],
      hasExperienceDetailsInTour: !!(tour?.experienceDetails || tour?.ExperienceDetails),
      experienceDetailsCount: (tour?.experienceDetails || tour?.ExperienceDetails || []).length,
      experienceDetails: tour?.experienceDetails || tour?.ExperienceDetails || []
    });

    // Related resources
    // Get ExperienceDetails from tour object first (backend may include them), then fallback to separate API call
    const tourExperienceDetails = tour?.experienceDetails || tour?.ExperienceDetails || [];
    
    const [photos, reviews, host, details] = await Promise.all([
      authAPI.getTourPhotos(id).catch((err) => {
        console.warn(`⚠️ Failed to fetch photos separately for tour ${id}:`, err);
        return [];
      }),
      authAPI.getTourReviews(id).catch(() => []),
      tour?.hostID || tour?.HostID ? authAPI.getHostById(tour.hostID || tour.HostID).catch(() => null) : Promise.resolve(null),
      // Only fetch separately if not already in tour object
      tourExperienceDetails.length > 0 
        ? Promise.resolve([]) 
        : authAPI.getTourExperienceDetails(id).catch((err) => {
            console.warn(`⚠️ Failed to fetch experienceDetails separately for tour ${id}:`, err);
            return [];
          }),
    ]);
    
    // Use ExperienceDetails from tour object if available, otherwise use from separate API call
    const allExperienceDetails = tourExperienceDetails.length > 0 ? tourExperienceDetails : (details || []);
    
    console.log(`🔍 Photos from separate API call:`, photos);
    console.log(`🔍 ExperienceDetails sources:`, {
      fromTourObject: tourExperienceDetails.length,
      fromSeparateAPI: (details || []).length,
      final: allExperienceDetails.length,
      allExperienceDetails: allExperienceDetails
    });
    
    // ⚠️ CRITICAL DEBUG: Log full tour object to see if ExperienceDetails exists
    console.log(`🔍 FULL TOUR OBJECT (checking for ExperienceDetails):`, {
      tourKeys: Object.keys(tour || {}),
      hasExperienceDetails: !!(tour?.experienceDetails || tour?.ExperienceDetails),
      experienceDetails: tour?.experienceDetails || tour?.ExperienceDetails,
      tourObject: tour
    });

    // Helper function to normalize image URL
    const normalizeImageUrl = (url) => {
      if (!url || url.trim().length === 0) return null;
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

    // Get photos from tour object first (backend may include Photos), then fallback to separate API call
    const tourPhotos = tour?.photos || tour?.Photos || [];
    const allPhotos = tourPhotos.length > 0 ? tourPhotos : (photos || []);
    
    console.log(`🔍 All photos sources:`, {
      tourPhotosCount: tourPhotos.length,
      separatePhotosCount: (photos || []).length,
      allPhotosCount: allPhotos.length,
      allPhotos: allPhotos
    });
    
    // Build media with normalized URLs
    const normalizedPhotos = allPhotos
      .map((p, index) => {
        const url = p.url || p.Url || p.serverUrl || p.ServerUrl || "";
        console.log(`🔍 Photo ${index} raw URL:`, url);
        const normalizedUrl = normalizeImageUrl(url);
        if (!normalizedUrl) {
          console.warn(`⚠️ Photo ${index} has invalid URL:`, url);
          return null;
        }
        
        return {
          id: p.photoID || p.PhotoID || p.id,
          url: normalizedUrl,
          alt: p.caption || p.Caption || "photo"
        };
      })
      .filter(p => p !== null);

    const media = {
      cover: normalizedPhotos.length > 0 ? { url: normalizedPhotos[0].url } : undefined,
      photos: normalizedPhotos,
    };
    
    console.log(`📸 Tour ${id} photos: ${normalizedPhotos.length} photos loaded`);

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

    // ✅ Map experienceDetails with normalized image URLs
    console.log(`🔍 Raw experienceDetails before mapping:`, allExperienceDetails);
    const mappedDetails = allExperienceDetails.map((d, index) => {
      const imageUrl = d.imageUrl || d.ImageUrl || "";
      const normalizedImageUrl = imageUrl ? normalizeImageUrl(imageUrl) : null;
      
      console.log(`🔍 Mapping detail ${index}:`, {
        raw: d,
        imageUrl: imageUrl,
        normalizedImageUrl: normalizedImageUrl,
        title: d.title || d.Title
      });
      
      return {
        id: d.detailID || d.DetailID,
        image: normalizedImageUrl,
        title: d.title || d.Title,
        description: d.description || d.Description,
        content: d.description || d.Description, // For compatibility
        sortIndex: d.sortIndex || d.SortIndex || 0
      };
    });
    
    console.log(`🔍 Mapped experienceDetails (before filter):`, mappedDetails);
    const filteredDetails = mappedDetails.filter(d => d.image); // Only include details with valid images
    console.log(`🔍 Filtered experienceDetails (after filter):`, filteredDetails);
    console.log(`🔍 ExperienceDetails count: ${mappedDetails.length} total, ${filteredDetails.length} with valid images`);
    
    if (mappedDetails.length > 0 && filteredDetails.length === 0) {
      console.warn(`⚠️ WARNING: All ${mappedDetails.length} experienceDetails were filtered out because they have no valid images!`);
      mappedDetails.forEach((d, i) => {
        console.warn(`  Detail ${i}:`, { id: d.id, title: d.title, image: d.image });
      });
    }

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
      experienceDetails: filteredDetails,   // ✅ Use filtered details (only those with valid images)
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

    // Helper function to normalize image URL
    const normalizeImageUrl = (url) => {
      if (!url || url.trim().length === 0) return null;
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

    const normalized = (tours || []).map(t => {
      // Get first photo from Photos array (backend includes Photos in GetAllAsync)
      const photos = t.photos || t.Photos || [];
      const firstPhoto = Array.isArray(photos) && photos.length > 0 ? photos[0] : null;
      
      // Try multiple possible URL field names
      const imageUrl = firstPhoto 
        ? (firstPhoto.url || firstPhoto.Url || firstPhoto.serverUrl || firstPhoto.ServerUrl || null)
        : null;
      
      const normalizedImageUrl = imageUrl ? normalizeImageUrl(imageUrl) : null;

      // Debug logging for missing photos
      if (!firstPhoto) {
        console.warn(`Tour ${t.tourID || t.TourID} has no photos`);
      }

      // ✅ Tính toán rating và reviewsCount
      const reviews = t.reviews || t.Reviews || [];
      const reviewsCount = Array.isArray(reviews) ? reviews.length : 0;
      const averageRating = reviewsCount > 0
        ? reviews.reduce((sum, r) => sum + (r.rating || r.Rating || 0), 0) / reviewsCount
        : 0;
      

      return normalizeExperienceListItem({
        id: t.tourID || t.TourID,
        title: t.tourName || t.TourName,
        description: t.description || t.Description,
        image: normalizedImageUrl ? { url: normalizedImageUrl } : null,
        price: t.price || t.Price || 0,
        rating: averageRating,
        reviews: reviewsCount,
        duration: typeof (t.durationDays || t.DurationDays) === "number" 
          ? `${t.durationDays || t.DurationDays} days` 
          : null,
        location: t.location || t.Location || "",
        isGuestFavourite: false,
        mainCategory: t.mainCategory || t.MainCategory || "",
      });
    });

    console.log(`📸 Loaded ${normalized.length} tours, ${normalized.filter(t => t.image).length} with images`);

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
