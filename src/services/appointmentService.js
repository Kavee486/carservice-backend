import {
  GET_APPOINTMENTS_REQUEST,
  GET_APPOINTMENTS_SUCCESS,
  GET_APPOINTMENTS_FAIL,
  UPDATE_APPOINTMENT_REQUEST,
  UPDATE_APPOINTMENT_SUCCESS,
  UPDATE_APPOINTMENT_FAIL,
  ASSIGN_TECHNICIAN_REQUEST,
  ASSIGN_TECHNICIAN_SUCCESS,
  ASSIGN_TECHNICIAN_FAIL,
  GET_TECHNICIAN_SERVICES_REQUEST,
  GET_TECHNICIAN_SERVICES_SUCCESS,
  GET_TECHNICIAN_SERVICES_FAIL
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
    const { data } = await axios.post(`/Bookings/PutBookingsDetails/${bookingId}`, statusData);

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

// Action to assign technician to booking
export const assignTechnicianToBooking = (bookingId, technicianId, technicianName = '') => async (dispatch) => {
  try {
    console.log('Assigning technician to booking:', { bookingId, technicianId, technicianName });

    dispatch({ type: ASSIGN_TECHNICIAN_REQUEST });

    const requestData = {
      BookingID: String(bookingId),
      TechnicianID: String(technicianId)
    };

    const { data } = await axios.post('/Bookings/AssignTechnicianToBooking', requestData);

    console.log('Assign technician response:', data);

    if (data.StatusCode === 200) {
      console.log('Technician assigned successfully');

      dispatch({
        type: ASSIGN_TECHNICIAN_SUCCESS,
        payload: { 
          bookingId, 
          technicianId, 
          technicianName 
        }
      });

      return { success: true, message: 'Technician assigned successfully' };
    } else {
      const msg = data.Message || "Failed to assign technician";
      console.error('Error assigning technician:', msg);

      dispatch({
        type: ASSIGN_TECHNICIAN_FAIL,
        payload: msg
      });

      return { success: false, message: msg };
    }
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || 
                   error.message || 
                   error.toString();
    
    console.error('Error while assigning technician:', message);
    
    dispatch({
      type: ASSIGN_TECHNICIAN_FAIL,
      payload: message
    });

    return { success: false, message };
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
      // Backend endpoint `PutBookingsDetails` accepts POST in practice (Postman uses POST).
      // Build payload matching the backend expected shape (Postman uses B_BookingID & B_BookingStatus)
      const payload = (typeof statusData === 'string' || typeof statusData === 'number')
        ? { B_BookingID: String(bookingId), B_BookingStatus: String(statusData) }
        : ({ B_BookingID: String(bookingId), ...statusData });

      const { data } = await axios.post(`/Bookings/PutBookingsDetails/${bookingId}`, payload);
    throw err;
  }
};

// NEW ACTION: Get services by technician ID
export const getServicesByTechnicianID = (technicianId) => async (dispatch) => {
  try {
    console.log('Fetching services for technician:', technicianId);

    dispatch({ type: GET_TECHNICIAN_SERVICES_REQUEST });

    const { data } = await axios.get(`/Bookings/GetServicesByTechnicianID?TechnicianID=${technicianId}`);

    console.log('Technician services fetch response:', data);

    if (data.StatusCode === 200) {
      console.log('Saving technician services data to the store:', data.ResultSet);

      dispatch({
        type: GET_TECHNICIAN_SERVICES_SUCCESS,
        payload: data.ResultSet
      });

      return { success: true, data: data.ResultSet };
    } else {
      const msg = data.Message || data.Result || "Failed to fetch technician services";
      console.error('Error fetching technician services:', msg);

      dispatch({
        type: GET_TECHNICIAN_SERVICES_FAIL,
        payload: msg
      });

      return { success: false, message: msg };
    }
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) ||
                   error.message ||
                   error.toString();

    console.error('Error while fetching technician services:', message);

    dispatch({
      type: GET_TECHNICIAN_SERVICES_FAIL,
      payload: message
    });

    return { success: false, message };
  }
};