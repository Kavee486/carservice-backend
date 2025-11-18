import {
  GET_ALL_BOOKINGS_WITH_VEHICLE_DETAILS_REQUEST,
  GET_ALL_BOOKINGS_WITH_VEHICLE_DETAILS_SUCCESS,
  GET_ALL_BOOKINGS_WITH_VEHICLE_DETAILS_FAIL,
  GET_LATEST_BOOKINGS_WITH_VEHICLE_DETAILS_REQUEST,
  GET_LATEST_BOOKINGS_WITH_VEHICLE_DETAILS_SUCCESS,
  GET_LATEST_BOOKINGS_WITH_VEHICLE_DETAILS_FAIL,
  GET_DASHBOARD_STATS_WITH_VEHICLE_DETAILS_REQUEST,
  GET_DASHBOARD_STATS_WITH_VEHICLE_DETAILS_SUCCESS,
  GET_DASHBOARD_STATS_WITH_VEHICLE_DETAILS_FAIL,
  GET_ALL_SERVICES_REQUEST,
  GET_ALL_SERVICES_SUCCESS,
  GET_ALL_SERVICES_FAIL
} from '../constants/AdminConstants';

const initialState = {
  bookingsWithVehicleDetails: {
    loading: false,
    data: [],
    error: null
  },
  latestBookingsWithVehicleDetails: {
    loading: false,
    data: [],
    error: null
  },
  dashboardStatsWithVehicleDetails: {
    loading: false,
    data: null,
    error: null
  },
  services: {
    loading: false,
    data: [],
    error: null
  }
};

export const adminReducer = (state = initialState, action) => {
  switch (action.type) {
    // Bookings with Vehicle Details
    case GET_ALL_BOOKINGS_WITH_VEHICLE_DETAILS_REQUEST:
      return {
        ...state,
        bookingsWithVehicleDetails: {
          loading: true,
          data: [],
          error: null
        }
      };
    case GET_ALL_BOOKINGS_WITH_VEHICLE_DETAILS_SUCCESS:
      return {
        ...state,
        bookingsWithVehicleDetails: {
          loading: false,
          data: action.payload,
          error: null
        }
      };
    case GET_ALL_BOOKINGS_WITH_VEHICLE_DETAILS_FAIL:
      return {
        ...state,
        bookingsWithVehicleDetails: {
          loading: false,
          data: [],
          error: action.payload
        }
      };

    // Latest Bookings with Vehicle Details
    case GET_LATEST_BOOKINGS_WITH_VEHICLE_DETAILS_REQUEST:
      return {
        ...state,
        latestBookingsWithVehicleDetails: {
          loading: true,
          data: [],
          error: null
        }
      };
    case GET_LATEST_BOOKINGS_WITH_VEHICLE_DETAILS_SUCCESS:
      return {
        ...state,
        latestBookingsWithVehicleDetails: {
          loading: false,
          data: action.payload,
          error: null
        }
      };
    case GET_LATEST_BOOKINGS_WITH_VEHICLE_DETAILS_FAIL:
      return {
        ...state,
        latestBookingsWithVehicleDetails: {
          loading: false,
          data: [],
          error: action.payload
        }
      };

    // Dashboard Stats with Vehicle Details
    case GET_DASHBOARD_STATS_WITH_VEHICLE_DETAILS_REQUEST:
      return {
        ...state,
        dashboardStatsWithVehicleDetails: {
          loading: true,
          data: null,
          error: null
        }
      };
    case GET_DASHBOARD_STATS_WITH_VEHICLE_DETAILS_SUCCESS:
      return {
        ...state,
        dashboardStatsWithVehicleDetails: {
          loading: false,
          data: action.payload,
          error: null
        }
      };
    case GET_DASHBOARD_STATS_WITH_VEHICLE_DETAILS_FAIL:
      return {
        ...state,
        dashboardStatsWithVehicleDetails: {
          loading: false,
          data: null,
          error: action.payload
        }
      };

    // Services
    case GET_ALL_SERVICES_REQUEST:
      return {
        ...state,
        services: {
          loading: true,
          data: [],
          error: null
        }
      };
    case GET_ALL_SERVICES_SUCCESS:
      return {
        ...state,
        services: {
          loading: false,
          data: action.payload,
          error: null
        }
      };
    case GET_ALL_SERVICES_FAIL:
      return {
        ...state,
        services: {
          loading: false,
          data: [],
          error: action.payload
        }
      };

    default:
      return state;
  }
};