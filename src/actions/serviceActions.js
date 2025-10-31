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
} from "../constants/ServiceConstants";
import {
  fetchAllServices,
  addService,
  updateService,
  deleteService
} from '../services/serviceServices';

// Action to get all services
export const GetAllServices = () => async (dispatch) => {
  try {
    dispatch({ type: GetAllServices_REQUEST });

    const data = await fetchAllServices();

    if (data.StatusCode === 200) {
      dispatch({
        type: GetAllServices_SUCCESS,
        payload: data.ResultSet
      });
    } else {
      const msg = data.Message || "Failed to fetch services";
      dispatch({
        type: GetAllServices_FAIL,
        payload: msg
      });
    }
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    dispatch({
      type: GetAllServices_FAIL,
      payload: message
    });
  }
};

// Action to add a new service
export const AddService = (serviceData) => async (dispatch) => {
  try {
    dispatch({ type: AddService_REQUEST });

    const data = await addService(serviceData);

    if (data.StatusCode === 200) {
      dispatch({
        type: AddService_SUCCESS,
        payload: data.Result,
      });
    } else {
      const msg = data.Message || "Failed to add service";
      dispatch({
        type: AddService_FAIL,
        payload: msg,
      });
    }
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    dispatch({
      type: AddService_FAIL,
      payload: message,
    });
  }
};

// Action to update an existing service
export const UpdateService = (serviceId, serviceData) => async (dispatch) => {
  try {
    dispatch({ type: UpdateService_REQUEST });

    const data = await updateService(serviceId, serviceData);

    if (data.StatusCode === 200) {
      dispatch({
        type: UpdateService_SUCCESS,
        payload: data.ResultSet
      });
    } else {
      const msg = data.Message || "Failed to update service";
      dispatch({
        type: UpdateService_FAIL,
        payload: msg
      });
    }
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    dispatch({
      type: UpdateService_FAIL,
      payload: message
    });
  }
};

// Action to delete a service - Updated to match backend API
export const DeleteService = (serviceData) => async (dispatch) => {
  try {
    dispatch({ type: DeleteService_REQUEST });

    const data = await deleteService(serviceData);

    if (data.StatusCode === 200) {
      dispatch({
        type: DeleteService_SUCCESS,
        payload: serviceData.S_ServiceID // Pass the ID for reducer to filter
      });
    } else {
      const msg = data.Message || "Failed to delete service";
      dispatch({
        type: DeleteService_FAIL,
        payload: msg
      });
    }
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    dispatch({
      type: DeleteService_FAIL,
      payload: message
    });
  }
};