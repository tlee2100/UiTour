import { createContext, useContext, useReducer, useEffect } from 'react';
import authAPI from '../services/authAPI';

const AppContext = createContext();

// Get initial state from localStorage if available
const getInitialState = () => {
  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('token');
  const storedProfile = localStorage.getItem('uitour_profile');
  
  return {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken || null,
    profile: storedProfile ? JSON.parse(storedProfile) : null,
    favorites: [],
    searchHistory: [],
    isLoading: false,
    error: null,
    tripCount: 0
  };
};

const initialState = getInitialState();

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      const user = action.payload;
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
      }
      return { ...state, user: action.payload };
    
    case 'SET_TOKEN':
      const token = action.payload;
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
      return { ...state, token: action.payload };

    case 'SET_PROFILE':
      const profile = action.payload;
      if (profile) {
        localStorage.setItem('uitour_profile', JSON.stringify(profile));
      } else {
        localStorage.removeItem('uitour_profile');
      }
      return { ...state, profile: action.payload };
    
    case 'LOGOUT':
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('uitour_profile');
      return { ...state, user: null, token: null, profile: null, tripCount: 0 };
    
    case 'SET_TRIP_COUNT':
      return { ...state, tripCount: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'ADD_FAVORITE':
      return { 
        ...state, 
        favorites: [...state.favorites, action.payload] 
      };
    
    case 'REMOVE_FAVORITE':
      return { 
        ...state, 
        favorites: state.favorites.filter(id => id !== action.payload) 
      };
    
    case 'ADD_SEARCH':
      return { 
        ...state, 
        searchHistory: [action.payload, ...state.searchHistory.slice(0, 9)] 
      };
    
    case 'CLEAR_SEARCH_HISTORY':
      return { ...state, searchHistory: [] };
    
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load user bookings on mount and when user/token changes to set tripCount
  useEffect(() => {
    const loadTripCount = async () => {
      // Only load if user is authenticated
      if (!state.user || !state.token) {
        dispatch({ type: 'SET_TRIP_COUNT', payload: 0 });
        return;
      }

      try {
        // Get user ID from user object (handle both camelCase and PascalCase)
        const userId = state.user.UserID || state.user.userID || state.user.id || state.user.Id;
        
        if (!userId) {
          console.warn('AppContext: User ID not found, cannot load trip count');
          dispatch({ type: 'SET_TRIP_COUNT', payload: 0 });
          return;
        }

        // Fetch user bookings
        const bookings = await authAPI.getUserBookings(userId);
        
        // Set trip count based on bookings array length
        const count = Array.isArray(bookings) ? bookings.length : 0;
        dispatch({ type: 'SET_TRIP_COUNT', payload: count });
      } catch (err) {
        console.error('AppContext: Failed to load trip count:', err);
        // On error, set to 0 (don't show badge if we can't verify)
        dispatch({ type: 'SET_TRIP_COUNT', payload: 0 });
      }
    };

    loadTripCount();
  }, [state.user, state.token]);

  const value = {
    ...state,
    dispatch
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
