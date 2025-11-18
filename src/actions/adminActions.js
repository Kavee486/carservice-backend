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
import {
  fetchAllBookingsWithVehicleDetails,
  fetchLatestBookingsWithVehicleDetails,
  fetchDashboardStatsWithVehicleDetails,
  fetchAllServices
} from '../services/adminServices';

// Action to get all bookings with vehicle details
export const getAllBookingsWithVehicleDetails = () => async (dispatch) => {
  try {
    dispatch({ type: GET_ALL_BOOKINGS_WITH_VEHICLE_DETAILS_REQUEST });

    const data = await fetchAllBookingsWithVehicleDetails();

    if (data.StatusCode === 200) {
      dispatch({
        type: GET_ALL_BOOKINGS_WITH_VEHICLE_DETAILS_SUCCESS,
        payload: data.ResultSet || data.Result || []
      });
    } else {
      const msg = data.Message || "Failed to fetch bookings with vehicle details";
      dispatch({
        type: GET_ALL_BOOKINGS_WITH_VEHICLE_DETAILS_FAIL,
        payload: msg
      });
    }
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    dispatch({
      type: GET_ALL_BOOKINGS_WITH_VEHICLE_DETAILS_FAIL,
      payload: message
    });
  }
};

// Action to get latest 5 bookings with vehicle details
export const getLatestBookingsWithVehicleDetails = () => async (dispatch) => {
  try {
    dispatch({ type: GET_LATEST_BOOKINGS_WITH_VEHICLE_DETAILS_REQUEST });

    const latestBookings = await fetchLatestBookingsWithVehicleDetails();

    dispatch({
      type: GET_LATEST_BOOKINGS_WITH_VEHICLE_DETAILS_SUCCESS,
      payload: latestBookings
    });
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    dispatch({
      type: GET_LATEST_BOOKINGS_WITH_VEHICLE_DETAILS_FAIL,
      payload: message
    });
  }
};

// Action to get dashboard stats with vehicle details
export const getDashboardStatsWithVehicleDetails = () => async (dispatch) => {
  try {
    dispatch({ type: GET_DASHBOARD_STATS_WITH_VEHICLE_DETAILS_REQUEST });

    const data = await fetchDashboardStatsWithVehicleDetails();

    const normalizedData = {
      bookingsWithVehicles: data.bookingsWithVehicles?.ResultSet || data.bookingsWithVehicles?.Result || data.bookingsWithVehicles || [],
      services: data.services?.ResultSet || data.services?.Result || data.services || [],
      latestBookings: data.latestBookings || []
    };

    dispatch({
      type: GET_DASHBOARD_STATS_WITH_VEHICLE_DETAILS_SUCCESS,
      payload: normalizedData
    });
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    dispatch({
      type: GET_DASHBOARD_STATS_WITH_VEHICLE_DETAILS_FAIL,
      payload: message
    });
  }
};

// Action to get all services
export const getAllServices = () => async (dispatch) => {
  try {
    dispatch({ type: GET_ALL_SERVICES_REQUEST });

    const data = await fetchAllServices();

    if (data.StatusCode === 200) {
      dispatch({
        type: GET_ALL_SERVICES_SUCCESS,
        payload: data.ResultSet || data.Result || []
      });
    } else {
      const msg = data.Message || "Failed to fetch services";
      dispatch({
        type: GET_ALL_SERVICES_FAIL,
        payload: msg
      });
    }
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    dispatch({
      type: GET_ALL_SERVICES_FAIL,
      payload: message
    });
  }
};