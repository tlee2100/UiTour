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
  // Actions
  // -----------------------------
  const setLoading = useCallback(
    (loading) => dispatch({ type: ActionTypes.SET_LOADING, payload: loading }),
    []
  );

  const setError = useCallback(
    (error) => dispatch({ type: ActionTypes.SET_ERROR, payload: error }),
    []
  );

  const clearError = useCallback(
    () => dispatch({ type: ActionTypes.CLEAR_ERROR }),
    []
  );

  const setCurrentExperience = useCallback(
    (exp) => dispatch({ type: ActionTypes.SET_CURRENT_EXPERIENCE, payload: exp }),
    []
  );

  const setExperiences = useCallback(
    (list) => dispatch({ type: ActionTypes.SET_EXPERIENCES, payload: list }),
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

  const actions = useMemo(() => ({
    setLoading,
    setError,
    clearError,
    setCurrentExperience,
    setExperiences,
    setSearchResults,
    setSearchQuery,
    setFilters,
    setPagination
  }), [
    setLoading, setError, clearError,
    setCurrentExperience, setExperiences,
    setSearchResults, setSearchQuery,
    setFilters, setPagination
  ]);

  // -----------------------------
  // API Calls
  // -----------------------------
  const fetchExperienceById = useCallback(async (id) => {
    try {
      actions.setLoading(true);
      actions.clearError();
      const exp = await mockAPI.getExperienceById(id);
      actions.setCurrentExperience(exp);
      return exp;
    } catch (err) {
      actions.setError(err.message);
      throw err;
    } finally {
      actions.setLoading(false);
    }
  }, [actions]);

  const fetchExperiences = useCallback(async (filters = {}) => {
    try {
      actions.setLoading(true);
      actions.clearError();
      const list = await mockAPI.getExperiences(filters);
      actions.setExperiences(list);
      return list;
    } catch (err) {
      actions.setError(err.message);
      throw err;
    } finally {
      actions.setLoading(false);
    }
  }, [actions]);

  const searchExperiences = useCallback(async (query, filters = {}) => {
    try {
      actions.setLoading(true);
      actions.clearError();
      const results = await mockAPI.searchExperiences(query, filters);
      actions.setSearchResults(results);
      actions.setSearchQuery(query);
      return results;
    } catch (err) {
      actions.setError(err.message);
      throw err;
    } finally {
      actions.setLoading(false);
    }
  }, [actions]);

  // ✅ Auto fetch on first load
  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  const value = useMemo(() => ({
    ...state,
    ...actions,
    fetchExperienceById,
    fetchExperiences,
    searchExperiences,
  }), [
    state, actions,
    fetchExperienceById,
    fetchExperiences,
    searchExperiences,
  ]);

  return (
    <ExperienceContext.Provider value={value}>
      {children}
    </ExperienceContext.Provider>
  );
};

// Hook sử dụng
export const useExperience = () => {
  const context = useContext(ExperienceContext);
  if (!context) {
    throw new Error("useExperience must be used within an ExperienceProvider");
  }
  return context;
};

export default ExperienceContext;
