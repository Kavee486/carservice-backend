import {
  GetAllServices_REQUEST,
  GetAllServices_SUCCESS,
  GetAllServices_FAIL,
  AddService_REQUEST,
  AddService_SUCCESS,
  AddService_FAIL,
  UpdateService_REQUEST,
  UpdateService_SUCCESS,
  UpdateService_FAIL,
  DeleteService_REQUEST,
  DeleteService_SUCCESS,
  DeleteService_FAIL
} from '../constants/ServiceConstants';

export const serviceListReducer = (state = { services: [] }, action) => {
  switch (action.type) {
    case GetAllServices_REQUEST:
      return { loading: true, services: [] };
    case GetAllServices_SUCCESS:
      return { loading: false, services: action.payload };
    case GetAllServices_FAIL:
      return { loading: false, error: action.payload };
    
    case AddService_REQUEST:
      return { ...state, loading: true };
    case AddService_SUCCESS:
      return {
        ...state,
        loading: false,
        services: [...state.services, action.payload],
      };
    case AddService_FAIL:
      return { ...state, loading: false, error: action.payload };

    case UpdateService_REQUEST:
      return { ...state, loading: true };
    case UpdateService_SUCCESS:
      return {
        ...state,
        loading: false,
        services: state.services.map(service =>
          service.ServiceID === action.payload.ServiceID ? action.payload : service
        ),
      };
    case UpdateService_FAIL:
      return { ...state, loading: false, error: action.payload };

    case DeleteService_REQUEST:
      return { ...state, loading: true };
    case DeleteService_SUCCESS:
      return {
        ...state,
        loading: false,
        services: state.services.filter(service => service.ServiceID !== action.payload),
      };
    case DeleteService_FAIL:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};