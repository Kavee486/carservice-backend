/*import { AUTH_ACTIONS } from '../actions/authActions';

const initialState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.SIGNUP_START:
      return {
        ...state,
        loading: true,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.SIGNUP_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.payload,
        isAuthenticated: true,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.SIGNUP_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        user: null,
        isAuthenticated: false
      };

    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };

    default:
      return state;
  }
};

export default authReducer;*/



// reducers/authReducer.js
import * as types from '../constants/authConstants';

const initialState = {
  user: null,
  loading: false,
  error: null,
  otpSent: false,
  mobileNumber: null,
  pendingVerification: null
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.LOGIN_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    case types.LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        otpSent: true,
        mobileNumber: action.payload.mobileNumber,
        pendingVerification: action.payload,
        error: null
      };
    case types.LOGIN_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        otpSent: false
      };
    case types.VERIFY_OTP_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    case types.VERIFY_OTP_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.payload,
        error: null,
        otpSent: false,
        pendingVerification: null
      };
    case types.VERIFY_OTP_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case types.LOGOUT:
      return {
        ...initialState
      };
    default:
      return state;
  }
};

export default authReducer;