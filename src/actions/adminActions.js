// adminActions.js
import {
  GET_ALL_BOOKINGS_REQUEST,
  GET_ALL_BOOKINGS_SUCCESS,
  GET_ALL_BOOKINGS_FAIL,
  GET_ALL_PARTS_REQUEST,
  GET_ALL_PARTS_SUCCESS,
  GET_ALL_PARTS_FAIL,
  GET_ALL_SERVICES_REQUEST,
  GET_ALL_SERVICES_SUCCESS,
  GET_ALL_SERVICES_FAIL,
  GET_ALL_VEHICLES_REQUEST,
  GET_ALL_VEHICLES_SUCCESS,
  GET_ALL_VEHICLES_FAIL,
  GET_ALL_USERS_REQUEST,
  GET_ALL_USERS_SUCCESS,
  GET_ALL_USERS_FAIL,
  GET_DASHBOARD_STATS_REQUEST,
  GET_DASHBOARD_STATS_SUCCESS,
  GET_DASHBOARD_STATS_FAIL,
  GET_LATEST_BOOKINGS_REQUEST,
  GET_LATEST_BOOKINGS_SUCCESS,
  GET_LATEST_BOOKINGS_FAIL
} from '../constants/AdminConstants';
import {
  fetchAllBookings,
  fetchAllParts,
  fetchAllServices,
  fetchAllVehicles,
  fetchAllUsers,
  fetchDashboardStats,
  fetchLatestBookings
} from '../services/adminServices';

// Action to get all bookings
export const getAllBookings = () => async (dispatch) => {
  try {
    dispatch({ type: GET_ALL_BOOKINGS_REQUEST });

    const data = await fetchAllBookings();

    if (data.StatusCode === 200) {
      dispatch({
        type: GET_ALL_BOOKINGS_SUCCESS,
        payload: data.ResultSet || data.Result
      });
    } else {
      const msg = data.Message || "Failed to fetch bookings";
      dispatch({
        type: GET_ALL_BOOKINGS_FAIL,
        payload: msg
      });
    }
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    dispatch({
      type: GET_ALL_BOOKINGS_FAIL,
      payload: message
    });
  }
};

// Action to get latest 5 bookings
export const getLatestBookings = () => async (dispatch) => {
  try {
    dispatch({ type: GET_LATEST_BOOKINGS_REQUEST });

    const latestBookings = await fetchLatestBookings();

    dispatch({
      type: GET_LATEST_BOOKINGS_SUCCESS,
      payload: latestBookings
    });
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    dispatch({
      type: GET_LATEST_BOOKINGS_FAIL,
      payload: message
    });
  }
};

// Action to get all parts
export const getAllParts = () => async (dispatch) => {
  try {
    dispatch({ type: GET_ALL_PARTS_REQUEST });

    const data = await fetchAllParts();

    if (data.StatusCode === 200) {
      dispatch({
        type: GET_ALL_PARTS_SUCCESS,
        payload: data.ResultSet || data.Result
      });
    } else {
      const msg = data.Message || "Failed to fetch parts";
      dispatch({
        type: GET_ALL_PARTS_FAIL,
        payload: msg
      });
    }
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    dispatch({
      type: GET_ALL_PARTS_FAIL,
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
        payload: data.ResultSet || data.Result
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

// Action to get all vehicles
export const getAllVehicles = () => async (dispatch) => {
  try {
    dispatch({ type: GET_ALL_VEHICLES_REQUEST });

    const data = await fetchAllVehicles();

    if (data.StatusCode === 200) {
      dispatch({
        type: GET_ALL_VEHICLES_SUCCESS,
        payload: data.ResultSet || data.Result
      });
    } else {
      const msg = data.Message || "Failed to fetch vehicles";
      dispatch({
        type: GET_ALL_VEHICLES_FAIL,
        payload: msg
      });
    }
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    dispatch({
      type: GET_ALL_VEHICLES_FAIL,
      payload: message
    });
  }
};

// Action to get all users
export const getAllUsers = () => async (dispatch) => {
  try {
    dispatch({ type: GET_ALL_USERS_REQUEST });

    const data = await fetchAllUsers();

    if (data.StatusCode === 200) {
      dispatch({
        type: GET_ALL_USERS_SUCCESS,
        payload: data.ResultSet || data.Result
      });
    } else {
      const msg = data.Message || "Failed to fetch users";
      dispatch({
        type: GET_ALL_USERS_FAIL,
        payload: msg
      });
    }
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    dispatch({
      type: GET_ALL_USERS_FAIL,
      payload: message
    });
  }
};

// Action to get dashboard stats
export const getDashboardStats = () => async (dispatch) => {
  try {
    dispatch({ type: GET_DASHBOARD_STATS_REQUEST });

    const data = await fetchDashboardStats();

    // Normalize the data structure
    const normalizedData = {
      bookings: data.bookings?.ResultSet || data.bookings?.Result || data.bookings || [],
      parts: data.parts?.ResultSet || data.parts?.Result || data.parts || [],
      services: data.services?.ResultSet || data.services?.Result || data.services || [],
      vehicles: data.vehicles?.ResultSet || data.vehicles?.Result || data.vehicles || [],
      users: data.users?.ResultSet || data.users?.Result || data.users || [],
      latestBookings: data.latestBookings || []
    };

    dispatch({
      type: GET_DASHBOARD_STATS_SUCCESS,
      payload: normalizedData
    });
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    dispatch({
      type: GET_DASHBOARD_STATS_FAIL,
      payload: message
    });
  }
};