/**
 * Authentication context for managing Hive authentication state
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import hiveAuthService from '../services/hiveAuth';

// Initial authentication state
const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
  error: null
};

// Authentication actions
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
  INITIALIZE_SUCCESS: 'INITIALIZE_SUCCESS',
  INITIALIZE_COMPLETE: 'INITIALIZE_COMPLETE'
};

// Authentication reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        loading: true,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: action.payload.error
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case AUTH_ACTIONS.INITIALIZE_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false
      };

    case AUTH_ACTIONS.INITIALIZE_COMPLETE:
      return {
        ...state,
        loading: false
      };

    default:
      return state;
  }
}

// Create authentication context
const AuthContext = createContext();

// Authentication provider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const result = await hiveAuthService.initializeAuth();
        
        if (result.success) {
          dispatch({
            type: AUTH_ACTIONS.INITIALIZE_SUCCESS,
            payload: {
              user: result.user,
              token: result.token
            }
          });
        } else {
          dispatch({ type: AUTH_ACTIONS.INITIALIZE_COMPLETE });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch({ type: AUTH_ACTIONS.INITIALIZE_COMPLETE });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (username) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const result = await hiveAuthService.authenticateWithKeychain(username);
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: result.user,
          token: result.token
        }
      });

      return { success: true };
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: error.message }
      });
      
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await hiveAuthService.logout();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout locally even if server call fails
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      return { success: true };
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Get auth headers for API requests
  const getAuthHeaders = () => {
    return hiveAuthService.getAuthHeaders();
  };

  // Context value
  const value = {
    // State
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    token: state.token,
    loading: state.loading,
    error: state.error,
    
    // Actions
    login,
    logout,
    clearError,
    getAuthHeaders
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use authentication context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

export default AuthContext;