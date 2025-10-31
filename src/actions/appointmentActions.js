import axios from 'axios';
import {
  GET_APPOINTMENTS_REQUEST,
  GET_APPOINTMENTS_SUCCESS,
  GET_APPOINTMENTS_FAIL,
  UPDATE_APPOINTMENT_REQUEST,
  UPDATE_APPOINTMENT_SUCCESS,
  UPDATE_APPOINTMENT_FAIL,
  UPDATE_APPOINTMENT_TIME_REQUEST,
  UPDATE_APPOINTMENT_TIME_SUCCESS,
  UPDATE_APPOINTMENT_TIME_FAIL
} from '../constants/AppointmentConstants';

export const getAppointments = () => async (dispatch) => {
  try {
    dispatch({ type: GET_APPOINTMENTS_REQUEST });
    const { data } = await axios.get('/Bookings/GetAllBookings');

    if (data.StatusCode === 200) {
      dispatch({
        type: GET_APPOINTMENTS_SUCCESS,
        payload: data.ResultSet,
      });
    } else {
      dispatch({
        type: GET_APPOINTMENTS_FAIL,
        payload: data.Message || "Failed to fetch appointments",
      });
    }
  } catch (error) {
    dispatch({
      type: GET_APPOINTMENTS_FAIL,
      payload: error.response?.data?.message || error.message || "Something went wrong",
    });
  }
};

export const updateAppointmentStatus = (bookingId, status) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_APPOINTMENT_REQUEST });
    
    const { data } = await axios.post(`/Bookings/PutBookingsDetails`, {
      B_BookingID: bookingId,
      B_BookingStatus: status
    });

    if (data.StatusCode === 200) {
      dispatch({
        type: UPDATE_APPOINTMENT_SUCCESS,
        payload: { bookingId, status },
      });
    } else {
      dispatch({
        type: UPDATE_APPOINTMENT_FAIL,
        payload: data.Message || "Failed to update appointment status",
      });
    }
  } catch (error) {
    dispatch({
      type: UPDATE_APPOINTMENT_FAIL,
      payload: error.response?.data?.message || error.message || "Something went wrong",
    });
  }
};

// New action to update appointment times - MAKE SURE THIS EXPORT IS PRESENT
export const updateAppointmentTimes = (bookingId, startingTime, endingTime) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_APPOINTMENT_TIME_REQUEST });
    
    const { data } = await axios.post(`/Bookings/PutBookingTimeDetails`, {
      B_BookingID: bookingId,
      B_StartingTime: startingTime,
      B_EndingTime: endingTime
    });

    if (data.StatusCode === 200) {
      dispatch({
        type: UPDATE_APPOINTMENT_TIME_SUCCESS,
        payload: { 
          bookingId, 
          startingTime, 
          endingTime 
        },
      });
      
      return { success: true, message: 'Appointment times updated successfully' };
    } else {
      dispatch({
        type: UPDATE_APPOINTMENT_TIME_FAIL,
        payload: data.Message || "Failed to update appointment times",
      });
      
      return { success: false, message: data.Message || "Failed to update appointment times" };
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "Something went wrong";
    
    dispatch({
      type: UPDATE_APPOINTMENT_TIME_FAIL,
      payload: errorMessage,
    });
    
    return { success: false, message: errorMessage };
  }
};