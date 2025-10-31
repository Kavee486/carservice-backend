import {
  GetAllVehicles_REQUEST,
  GetAllVehicles_SUCCESS,
  GetAllVehicles_FAIL,
  AddVehicle_REQUEST,
  AddVehicle_SUCCESS,
  AddVehicle_FAIL,
  UpdateVehicle_REQUEST,
  UpdateVehicle_SUCCESS,
  UpdateVehicle_FAIL,
  DeleteVehicle_REQUEST,
  DeleteVehicle_SUCCESS,
  DeleteVehicle_FAIL
} from "../constants/VehicleConstants";
import {
  fetchAllVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle
} from '../services/vehicleServices';

// Action to get all vehicles

export const GetAllVehicles  = () => async (dispatch) => {
  try {
    dispatch({ type: GetAllVehicles_REQUEST  });

    const data = await fetchAllVehicles();

    if (data.StatusCode === 200) {
      dispatch({
        type: GetAllVehicles_SUCCESS,
        payload: data.ResultSet
      });
    } else {
      const msg = data.Message || "Failed to fetch vehicles";
      dispatch({
        type: GetAllVehicles_FAIL,
        payload: msg
      });
    }
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    dispatch({
      type: GetAllVehicles_FAIL,
      payload: message
    });
  }
};


// Action to add a new vehicle
export const AddVehicle = (vehicleData) => async (dispatch) => {
  try {
    dispatch({ type: AddVehicle_REQUEST });

    const data = await addVehicle(vehicleData);

    if (data.StatusCode === 200) {
      dispatch({
        type: AddVehicle_SUCCESS,
        payload: data.Result,
      });
    } else {
      const msg = data.Message || "Failed to add vehicle";
      dispatch({
        type: AddVehicle_FAIL,
        payload: msg,
      });
    }
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    dispatch({
      type: AddVehicle_FAIL,
      payload: message,
    });
  }
};

// Action to update an existing vehicle
export const UpdateVehicle = (vehicleData) => async (dispatch) => {
  try {
    dispatch({ type: UpdateVehicle_REQUEST });

    const data = await updateVehicle(vehicleData);

    if (data.StatusCode === 200) {
      dispatch({
        type: UpdateVehicle_SUCCESS,
        payload: data.ResultSet
      });
    } else {
      const msg = data.Message || "Failed to update vehicle";
      dispatch({
        type: UpdateVehicle_FAIL,
        payload: msg
      });
    }
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    dispatch({
      type: UpdateVehicle_FAIL,
      payload: message
    });
  }
};

// Action to delete a vehicle
export const DeleteVehicle = (vehicleData) => async (dispatch) => {
  try {
    dispatch({ type: DeleteVehicle_REQUEST });

    const data = await deleteVehicle(vehicleData);

    if (data.StatusCode === 200) {
      dispatch({
        type: DeleteVehicle_SUCCESS,
        payload: vehicleData.V_VehicleID.toString() // Ensure it's always a string
      });
    } else {
      const msg = data.Message || "Failed to delete vehicle";
      dispatch({
        type: DeleteVehicle_FAIL,
        payload: msg
      });
    }
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    dispatch({
      type: DeleteVehicle_FAIL,
      payload: message
    });
  }
};