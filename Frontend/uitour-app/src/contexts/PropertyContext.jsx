import React, { createContext, useContext, useReducer, useEffect } from 'react';
import mockAPI from '../services/mockAPI';

// Initial State
const initialState = {
  // Property data
  currentProperty: null,
  properties: [],
  searchResults: [],
  
  // UI states
  loading: false,
  error: null,
  
  // Search filters
  searchQuery: '',
  filters: {
    location: '',
    minPrice: null,
    maxPrice: null,
    guests: null,
    amenities: []
  },
  
  // Pagination
  currentPage: 1,
  totalPages: 1,
  totalResults: 0
};

// Action Types
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_CURRENT_PROPERTY: 'SET_CURRENT_PROPERTY',
  SET_PROPERTIES: 'SET_PROPERTIES',
  SET_SEARCH_RESULTS: 'SET_SEARCH_RESULTS',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_FILTERS: 'SET_FILTERS',
  SET_PAGINATION: 'SET_PAGINATION',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
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

// Context
const PropertyContext = createContext();

// Provider Component
export const PropertyProvider = ({ children }) => {
  const [state, dispatch] = useReducer(propertyReducer, initialState);

  // Actions
  const actions = {
    setLoading: (loading) => dispatch({ type: ActionTypes.SET_LOADING, payload: loading }),
    
    setError: (error) => dispatch({ type: ActionTypes.SET_ERROR, payload: error }),
    
    clearError: () => dispatch({ type: ActionTypes.CLEAR_ERROR }),
    
    setCurrentProperty: (property) => dispatch({ type: ActionTypes.SET_CURRENT_PROPERTY, payload: property }),
    
    setProperties: (properties) => dispatch({ type: ActionTypes.SET_PROPERTIES, payload: properties }),
    
    setSearchResults: (results) => dispatch({ type: ActionTypes.SET_SEARCH_RESULTS, payload: results }),
    
    setSearchQuery: (query) => dispatch({ type: ActionTypes.SET_SEARCH_QUERY, payload: query }),
    
    setFilters: (filters) => dispatch({ type: ActionTypes.SET_FILTERS, payload: filters }),
    
    setPagination: (pagination) => dispatch({ type: ActionTypes.SET_PAGINATION, payload: pagination })
  };

  // API Methods
  const fetchPropertyById = async (id) => {
    try {
      actions.setLoading(true);
      actions.clearError();
      
      const property = await mockAPI.getPropertyById(id);
      actions.setCurrentProperty(property);
      
      return property;
    } catch (error) {
      actions.setError(error.message);
      throw error;
    } finally {
      actions.setLoading(false);
    }
  };

  const fetchProperties = async (filters = {}) => {
    try {
      actions.setLoading(true);
      actions.clearError();
      
      const properties = await mockAPI.getProperties(filters);
      actions.setProperties(properties);
      
      return properties;
    } catch (error) {
      actions.setError(error.message);
      throw error;
    } finally {
      actions.setLoading(false);
    }
  };

  const searchProperties = async (query, filters = {}) => {
    try {
      actions.setLoading(true);
      actions.clearError();
      
      const results = await mockAPI.searchProperties(query, filters);
      actions.setSearchResults(results);
      actions.setSearchQuery(query);
      
      return results;
    } catch (error) {
      actions.setError(error.message);
      throw error;
    } finally {
      actions.setLoading(false);
    }
  };

  const fetchReviews = async (propertyId) => {
    try {
      actions.setLoading(true);
      actions.clearError();
      
      const reviews = await mockAPI.getReviewsByPropertyId(propertyId);
      return reviews;
    } catch (error) {
      actions.setError(error.message);
      throw error;
    } finally {
      actions.setLoading(false);
    }
  };

  const fetchHost = async (hostId) => {
    try {
      actions.setLoading(true);
      actions.clearError();
      
      const host = await mockAPI.getHostById(hostId);
      return host;
    } catch (error) {
      actions.setError(error.message);
      throw error;
    } finally {
      actions.setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchProperties();
  }, []);

  const value = {
    ...state,
    ...actions,
    fetchPropertyById,
    fetchProperties,
    searchProperties,
    fetchReviews,
    fetchHost
  };

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
};

// Custom Hook
export const useProperty = () => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('useProperty must be used within a PropertyProvider');
  }
  return context;
};

export default PropertyContext;
