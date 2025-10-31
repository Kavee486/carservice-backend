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
} from "../constants/AppointmentConstants";

const initialState = {
  appointments: [],
  loading: false,
  error: null,
  timeUpdating: false,
  timeError: null
};

export const appointmentListReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_APPOINTMENTS_REQUEST:
      return { ...state, loading: true, error: null };

    case GET_APPOINTMENTS_SUCCESS:
      return { ...state, loading: false, appointments: action.payload, error: null };

    case GET_APPOINTMENTS_FAIL:
      return { ...state, loading: false, error: action.payload };

    case UPDATE_APPOINTMENT_REQUEST:
      return { ...state, loading: true, error: null };

    case UPDATE_APPOINTMENT_SUCCESS:
      return {
        ...state,
        loading: false,
        appointments: state.appointments.map(appointment =>
          appointment.B_BookingID === action.payload.bookingId
            ? { ...appointment, B_BookingStatus: action.payload.status }
            : appointment
        ),
        error: null
      };

    case UPDATE_APPOINTMENT_FAIL:
      return { ...state, loading: false, error: action.payload };

    case UPDATE_APPOINTMENT_TIME_REQUEST:
      return { ...state, timeUpdating: true, timeError: null };

    case UPDATE_APPOINTMENT_TIME_SUCCESS:
      return {
        ...state,
        timeUpdating: false,
        appointments: state.appointments.map(appointment =>
          appointment.B_BookingID === action.payload.bookingId
            ? { 
                ...appointment, 
                B_StartingTime: action.payload.startingTime,
                B_EndingTime: action.payload.endingTime
              }
            : appointment
        ),
        timeError: null
      };

    case UPDATE_APPOINTMENT_TIME_FAIL:
      return { ...state, timeUpdating: false, timeError: action.payload };

    default:
      return state;
  }
};