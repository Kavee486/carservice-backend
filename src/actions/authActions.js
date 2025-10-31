// src/actions/authActions.js
import * as types from './actionTypes';
import { authService } from '../services/authServices';

// Login by mobile
export const login = (mobileNumber) => async (dispatch) => {
  dispatch({ type: types.LOGIN_REQUEST });

  try {
    const response = await authService.login(mobileNumber);

    if (response.StatusCode === 200) {
      dispatch({
        type: types.LOGIN_SUCCESS,
        payload: {
          mobileNumber: mobileNumber,
          otpSent: true,
          userName: response.UserName,
          email: response.Email,
          roleID: response.RoleID,
        },
      });
      return response;
    } else {
      throw new Error(response.Result || 'Login failed');
    }
  } catch (error) {
    dispatch({
      type: types.LOGIN_FAILURE,
      payload: error.message || 'Login failed',
    });
    throw error;
  }
};

// Verify OTP
export const verifyOtp = (mobileNumber, otpCode) => async (dispatch) => {
  dispatch({ type: types.VERIFY_OTP_REQUEST });

  try {
    const userData = await authService.verifyOtp(mobileNumber, otpCode);

    dispatch({
      type: types.VERIFY_OTP_SUCCESS,
      payload: userData,
    });

    return userData;
  } catch (error) {
    dispatch({
      type: types.VERIFY_OTP_FAILURE,
      payload: error.message || 'OTP verification failed',
    });
    throw error;
  }
};

// Logout
export const logout = () => (dispatch) => {
  authService.logout();
  dispatch({ type: types.LOGOUT });
};

// Check existing authentication
export const checkAuthStatus = () => (dispatch) => {
  const user = authService.getCurrentUser();
  if (user) {
    dispatch({
      type: types.VERIFY_OTP_SUCCESS,
      payload: user,
    });
  }
};


/*import authService from '../services/authService';

export const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  SIGNUP_START: 'SIGNUP_START',
  SIGNUP_SUCCESS: 'SIGNUP_SUCCESS',
  SIGNUP_FAILURE: 'SIGNUP_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER'
};

export const loginStart = () => ({
  type: AUTH_ACTIONS.LOGIN_START
});

export const loginSuccess = (user) => ({
  type: AUTH_ACTIONS.LOGIN_SUCCESS,
  payload: user
});

export const loginFailure = (error) => ({
  type: AUTH_ACTIONS.LOGIN_FAILURE,
  payload: error
});

export const signupStart = () => ({
  type: AUTH_ACTIONS.SIGNUP_START
});

export const signupSuccess = (user) => ({
  type: AUTH_ACTIONS.SIGNUP_SUCCESS,
  payload: user
});

export const signupFailure = (error) => ({
  type: AUTH_ACTIONS.SIGNUP_FAILURE,
  payload: error
});

export const logout = () => ({
  type: AUTH_ACTIONS.LOGOUT
});

export const setUser = (user) => ({
  type: AUTH_ACTIONS.SET_USER,
  payload: user
});

// Async action creators
export const loginUser = (credentials) => async (dispatch) => {
  dispatch(loginStart());
  try {
    const user = authService.login(credentials);
    dispatch(loginSuccess(user));
    return user;
  } catch (error) {
    dispatch(loginFailure(error.message));
    throw error;
  }
};

export const signupUser = (userData) => async (dispatch) => {
  dispatch(signupStart());
  try {
    const user = authService.signup(userData);
    dispatch(signupSuccess(user));
    return user;
  } catch (error) {
    dispatch(signupFailure(error.message));
    throw error;
  }
};

export const logoutUser = () => (dispatch) => {
  authService.logout();
  dispatch(logout());
};*/






















/*
// actions/authActions.js
import * as types from '../constants/authConstants';
import { authService } from '../services/authServices';

export const login = (mobileNumber) => async (dispatch) => {
  dispatch({ type: types.LOGIN_REQUEST });

  try {
    const response = await authService.login(mobileNumber);
    
    if (response.StatusCode === 200) {
      dispatch({
        type: types.LOGIN_SUCCESS,
        payload: {
          mobileNumber: mobileNumber,
          otpSent: true,
          userName: response.UserName,
          email: response.Email,
          roleID: response.RoleID
        }
      });
      return response;
    } else {
      throw new Error(response.Result || 'Login failed');
    }
  } catch (error) {
    dispatch({
      type: types.LOGIN_FAILURE,
      payload: error.message || 'Login failed'
    });
    throw error;
  }
};

export const verifyOtp = (mobileNumber, otpCode) => async (dispatch) => {
  dispatch({ type: types.VERIFY_OTP_REQUEST });

  try {
    const userData = await authService.verifyOtp(mobileNumber, otpCode);
    
    dispatch({
      type: types.VERIFY_OTP_SUCCESS,
      payload: userData
    });
    
    return userData;
  } catch (error) {
    dispatch({
      type: types.VERIFY_OTP_FAILURE,
      payload: error.message || 'OTP verification failed'
    });
    throw error;
  }
};

export const logout = () => (dispatch) => {
  authService.logout();
  dispatch({ type: types.LOGOUT });
};

// Check if user is already logged in on app start
export const checkAuthStatus = () => (dispatch) => {
  const user = authService.getCurrentUser();
  if (user) {
    dispatch({
      type: types.VERIFY_OTP_SUCCESS,
      payload: user
    });
  }
};*/

// authActions.js
import { LOGIN, LOGOUT, SET_USER } from './actionTypes'; import { authService } from '../services/authServices'; // Login action export const login = (userData) => { return (dispatch) => { const authenticatedUser = authService.login(userData); dispatch({ type: LOGIN, payload: authenticatedUser, }); }; }; // Logout action export const logout = () => { return (dispatch) => { authService.logout(); dispatch({ type: LOGOUT, }); }; }; // Check if user is authenticated export const checkAuthentication = () => { return (dispatch) => { const currentUser = authService.getCurrentUser(); if (currentUser) { dispatch({ type: SET_USER, payload: currentUser, }); } }; };