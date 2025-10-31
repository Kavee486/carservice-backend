// userReducer.js
import {
  SIGNUP_REQUEST,
  SIGNUP_SUCCESS,
  SIGNUP_FAIL,
  SIGNUP_RESET,
  GET_ADMINS_REQUEST,
  GET_ADMINS_SUCCESS,
  GET_ADMINS_FAIL,
  GET_TECHNICIANS_REQUEST,
  GET_TECHNICIANS_SUCCESS,
  GET_TECHNICIANS_FAIL,
  UPDATE_USER_REQUEST,
  UPDATE_USER_SUCCESS,
  UPDATE_USER_FAIL,
  DEACTIVATE_USER_REQUEST,
  DEACTIVATE_USER_SUCCESS,
  DEACTIVATE_USER_FAIL
} from '../constants/userConstants';

const initialState = {
  userSignup: {
    loading: false,
    success: false,
    error: null,
    admins: {
      loading: false,
      data: null,
      error: null
    },
    technicians: {
      loading: false,
      data: null,
      error: null
    }
  }
};

export const userSignupReducer = (state = initialState.userSignup, action) => {
  switch (action.type) {
    case SIGNUP_REQUEST:
      return {
        ...state,
        loading: true,
        success: false,
        error: null
      };

    case SIGNUP_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        error: null
      };

    case SIGNUP_FAIL:
      return {
        ...state,
        loading: false,
        success: false,
        error: action.payload
      };

    case SIGNUP_RESET:
      return {
        ...state,
        loading: false,
        success: false,
        error: null
      };

    case GET_ADMINS_REQUEST:
      return {
        ...state,
        admins: {
          ...state.admins,
          loading: true,
          error: null
        }
      };

    case GET_ADMINS_SUCCESS:
      return {
        ...state,
        admins: {
          ...state.admins,
          loading: false,
          data: action.payload,
          error: null
        }
      };

    case GET_ADMINS_FAIL:
      return {
        ...state,
        admins: {
          ...state.admins,
          loading: false,
          error: action.payload
        }
      };

    case GET_TECHNICIANS_REQUEST:
      return {
        ...state,
        technicians: {
          ...state.technicians,
          loading: true,
          error: null
        }
      };

    case GET_TECHNICIANS_SUCCESS:
      return {
        ...state,
        technicians: {
          ...state.technicians,
          loading: false,
          data: action.payload,
          error: null
        }
      };

    case GET_TECHNICIANS_FAIL:
      return {
        ...state,
        technicians: {
          ...state.technicians,
          loading: false,
          error: action.payload
        }
      };

    case UPDATE_USER_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case UPDATE_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        error: null
      };

    case UPDATE_USER_FAIL:
      return {
        ...state,
        loading: false,
        success: false,
        error: action.payload
      };

    case DEACTIVATE_USER_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case DEACTIVATE_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        error: null
      };

    case DEACTIVATE_USER_FAIL:
      return {
        ...state,
        loading: false,
        success: false,
        error: action.payload
      };

    default:
      return state;
  }
};