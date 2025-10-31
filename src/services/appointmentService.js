import {
  GET_APPOINTMENTS_REQUEST,
  GET_APPOINTMENTS_SUCCESS,
  GET_APPOINTMENTS_FAIL,
  UPDATE_APPOINTMENT_REQUEST,
  UPDATE_APPOINTMENT_SUCCESS,
  UPDATE_APPOINTMENT_FAIL
} from "../constants/AppointmentConstants";

import axios from 'axios';

// Action to get all appointments
export const getAppointments = () => async (dispatch) => {
  try {
    console.log('Fetching all appointments...');

    dispatch({ type: GET_APPOINTMENTS_REQUEST });

    const { data } = await axios.get('/Bookings/GetAllBookings');

    console.log('Appointment fetch response:', data);

    if (data.StatusCode === 200) {
      console.log('Saving fetched appointments data to the store:', data.ResultSet);

      dispatch({
        type: GET_APPOINTMENTS_SUCCESS,
        payload: data.ResultSet
      });
    } else {
      const msg = data.Message || "Failed to fetch appointments";
      console.error('Error fetching appointments:', msg);

      dispatch({
        type: GET_APPOINTMENTS_FAIL,
        payload: msg
      });
    }
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) ||
                   error.message ||
                   error.toString();

    console.error('Error while fetching appointments:', message);

    dispatch({
      type: GET_APPOINTMENTS_FAIL,
      payload: message
    });
  }
};

// Action to update appointment status
export const updateAppointmentStatus = (bookingId, statusData) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_APPOINTMENT_REQUEST });
    const { data } = await axios.put(`/Bookings/UpdateBookingStatus/${bookingId}`, statusData);

    if (data.StatusCode === 200) {
      console.log('Appointment status updated successfully:', data.ResultSet);

      dispatch({
        type: UPDATE_APPOINTMENT_SUCCESS,
        payload: { bookingId, updatedData: data.ResultSet }
      });
    } else {
      const msg = data.Message || "Failed to update appointment status";
      console.error('Error updating appointment:', msg);

      dispatch({
        type: UPDATE_APPOINTMENT_FAIL,
        payload: msg
      });
    }
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || 
                   error.message || 
                   error.toString();
    
    console.error('Error while updating appointment:', message);
    
    dispatch({
      type: UPDATE_APPOINTMENT_FAIL,
      payload: message
    });
  }
};

// Action to create a new appointment
export const createAppointment = (appointmentData) => async (dispatch) => {
  try {
    dispatch({ type: 'CREATE_APPOINTMENT_REQUEST' });
    const { data } = await axios.post('/Bookings/CreateBooking', appointmentData);

    if (data.StatusCode === 200) {
      console.log('Appointment created successfully:', data.ResultSet);

      dispatch({
        type: 'CREATE_APPOINTMENT_SUCCESS',
        payload: data.ResultSet
      });
      
      // Refresh the appointments list
      dispatch(getAppointments());
    } else {
      const msg = data.Message || "Failed to create appointment";
      console.error('Error creating appointment:', msg);

      dispatch({
        type: 'CREATE_APPOINTMENT_FAIL',
        payload: msg
      });
    }
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || 
                   error.message || 
                   error.toString();
    
    console.error('Error while creating appointment:', message);
    
    dispatch({
      type: 'CREATE_APPOINTMENT_FAIL',
      payload: message
    });
  }
};

// Action to delete an appointment
export const deleteAppointment = (bookingId) => async (dispatch) => {
  try {
    dispatch({ type: 'DELETE_APPOINTMENT_REQUEST' });
    const { data } = await axios.delete(`/Bookings/DeleteBooking/${bookingId}`);

    if (data.StatusCode === 200) {
      console.log('Appointment deleted successfully');

      dispatch({
        type: 'DELETE_APPOINTMENT_SUCCESS',
        payload: bookingId
      });
    } else {
      const msg = data.Message || "Failed to delete appointment";
      console.error('Error deleting appointment:', msg);

      dispatch({
        type: 'DELETE_APPOINTMENT_FAIL',
        payload: msg
      });
    }
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || 
                   error.message || 
                   error.toString();
    
    console.error('Error while deleting appointment:', message);
    
    dispatch({
      type: 'DELETE_APPOINTMENT_FAIL',
      payload: message
    });
  }
};

// New: create booking using AddBookingsDetails endpoint (supports backend payload shape)
export const createBookingDetails = async (bookingData) => {
  try {
    console.log('Creating booking (AddBookingsDetails) with payload:', bookingData);
    const { data } = await axios.post('/Bookings/AddBookingsDetails', bookingData);
    console.log('AddBookingsDetails response:', data);
    return data;
  } catch (err) {
    console.error('Error calling AddBookingsDetails:', err);
    throw err;
  }
};