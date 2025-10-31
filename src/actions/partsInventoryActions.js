import {
  GET_ALL_PARTS_INVENTORY_REQUEST,
  GET_ALL_PARTS_INVENTORY_SUCCESS,
  GET_ALL_PARTS_INVENTORY_FAIL,
  ADD_PART_INVENTORY_REQUEST,
  ADD_PART_INVENTORY_SUCCESS,
  ADD_PART_INVENTORY_FAIL,
  UPDATE_PART_INVENTORY_REQUEST,
  UPDATE_PART_INVENTORY_SUCCESS,
  UPDATE_PART_INVENTORY_FAIL,
  DELETE_PART_INVENTORY_REQUEST,
  DELETE_PART_INVENTORY_SUCCESS,
  DELETE_PART_INVENTORY_FAIL
} from '../constants/PartsInventoryConstants';
import {
  fetchAllPartsInventory,
  addPartInventory,
  updatePartInventory,
  deletePartInventory
} from '../services/partsInventoryServices';

// Action to get all parts inventory
export const GetAllPartsInventory = () => async (dispatch) => {
  try {
    dispatch({ type: GET_ALL_PARTS_INVENTORY_REQUEST });

    const data = await fetchAllPartsInventory();

    if (data.StatusCode === 200) {
      dispatch({
        type: GET_ALL_PARTS_INVENTORY_SUCCESS,
        payload: data.ResultSet
      });
    } else {
      const msg = data.Message || "Failed to fetch parts inventory";
      dispatch({
        type: GET_ALL_PARTS_INVENTORY_FAIL,
        payload: msg
      });
    }
  } catch (error) {
    const message = error.response?.data?.Message || error.response?.data?.message || error.message || error.toString();
    dispatch({
      type: GET_ALL_PARTS_INVENTORY_FAIL,
      payload: message
    });
  }
};

// Action to add a new part
export const AddPartInventory = (partData) => async (dispatch) => {
  try {
    dispatch({ type: ADD_PART_INVENTORY_REQUEST });

    const data = await addPartInventory(partData);

    if (data.StatusCode === 200) {
      // Refetch all parts to ensure we have the latest data
      dispatch(GetAllPartsInventory());
      dispatch({ type: ADD_PART_INVENTORY_SUCCESS });
    } else {
      const msg = data.Message || "Failed to add part";
      dispatch({
        type: ADD_PART_INVENTORY_FAIL,
        payload: msg
      });
    }
  } catch (error) {
    const message = error.response?.data?.Message || error.response?.data?.message || error.message || error.toString();
    dispatch({
        type: ADD_PART_INVENTORY_FAIL,
        payload: message
      });
    }
  };

  // Action to update a part
  export const UpdatePartInventory = (partData) => async (dispatch) => {
    try {
      dispatch({ type: UPDATE_PART_INVENTORY_REQUEST });

      const data = await updatePartInventory(partData);

      if (data.StatusCode === 200) {
        // Refetch all parts to ensure we have the latest data
        dispatch(GetAllPartsInventory());
        dispatch({ type: UPDATE_PART_INVENTORY_SUCCESS });
      } else {
        const msg = data.Message || "Failed to update part";
        dispatch({
          type: UPDATE_PART_INVENTORY_FAIL,
          payload: msg
        });
      }
    } catch (error) {
      const message = error.response?.data?.Message || error.response?.data?.message || error.message || error.toString();
      dispatch({
        type: UPDATE_PART_INVENTORY_FAIL,
        payload: message
      });
    }
  };

  // Action to delete a part
  export const DeletePartInventory = (partId) => async (dispatch) => {
    try {
      dispatch({ type: DELETE_PART_INVENTORY_REQUEST });

      const data = await deletePartInventory(partId);

      if (data.StatusCode === 200) {
        // Refetch all parts to ensure we have the latest data
        dispatch(GetAllPartsInventory());
        dispatch({
          type: DELETE_PART_INVENTORY_SUCCESS,
          payload: partId
        });
      } else {
        const msg = data.Message || "Failed to delete part";
        dispatch({
          type: DELETE_PART_INVENTORY_FAIL,
          payload: msg
        });
      }
    } catch (error) {
      const message = error.response?.data?.Message || error.response?.data?.message || error.message || error.toString();
      dispatch({
        type: DELETE_PART_INVENTORY_FAIL,
        payload: message
      });
    }
  };