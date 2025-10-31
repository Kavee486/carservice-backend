// actions/jobCardItemActions.js
import {
  GetAllJobCardItems_REQUEST,
  GetAllJobCardItems_SUCCESS,
  GetAllJobCardItems_FAIL,
  AddJobCardItem_REQUEST,
  AddJobCardItem_SUCCESS,
  AddJobCardItem_FAIL,
  UpdateJobCardItem_REQUEST,
  UpdateJobCardItem_SUCCESS,
  UpdateJobCardItem_FAIL,
  DeleteJobCardItem_REQUEST,
  DeleteJobCardItem_SUCCESS,
  DeleteJobCardItem_FAIL
} from "../constants/JobCardItemConstants";
import {
  fetchAllJobCardItems,
  addJobCardItem,
  updateJobCardItem,
  deleteJobCardItem
} from '../services/jobCardItemServices';

// Action to get all job card items
export const GetAllJobCardItems = () => async (dispatch) => {
  try {
    dispatch({ type: GetAllJobCardItems_REQUEST });

    const data = await fetchAllJobCardItems();

    if (data.StatusCode === 200) {
      dispatch({
        type: GetAllJobCardItems_SUCCESS,
        payload: data.ResultSet
      });
    } else {
      const msg = data.Message || "Failed to fetch job card items";
      dispatch({
        type: GetAllJobCardItems_FAIL,
        payload: msg
      });
    }
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    dispatch({
      type: GetAllJobCardItems_FAIL,
      payload: message
    });
  }
};

// Action to add a new job card item
export const AddJobCardItem = (jobCardItemData) => async (dispatch) => {
  try {
    dispatch({ type: AddJobCardItem_REQUEST });

    const data = await addJobCardItem(jobCardItemData);

    if (data.StatusCode === 200) {
      // Generate a temporary ID for the new item (since backend might not return the created object)
      const newItem = {
        ...jobCardItemData,
        J_ItemID: `temp-${Date.now()}`
      };
      
      dispatch({
        type: AddJobCardItem_SUCCESS,
        payload: newItem
      });
    } else {
      const msg = data.Message || "Failed to add job card item";
      dispatch({
        type: AddJobCardItem_FAIL,
        payload: msg,
      });
    }
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    dispatch({
      type: AddJobCardItem_FAIL,
      payload: message,
    });
  }
};

// Action to update an existing job card item
export const UpdateJobCardItem = (jobCardItemData) => async (dispatch) => {
  try {
    dispatch({ type: UpdateJobCardItem_REQUEST });

    const data = await updateJobCardItem(jobCardItemData);

    if (data.StatusCode === 200) {
      dispatch({
        type: UpdateJobCardItem_SUCCESS,
        payload: jobCardItemData // This should contain J_ItemID
      });
    } else {
      const msg = data.Message || "Failed to update job card item";
      dispatch({
        type: UpdateJobCardItem_FAIL,
        payload: msg
      });
    }
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    dispatch({
      type: UpdateJobCardItem_FAIL,
      payload: message
    });
  }
};

// Action to delete a job card item
export const DeleteJobCardItem = (jobCardItemData) => async (dispatch) => {
  try {
    dispatch({ type: DeleteJobCardItem_REQUEST });

    const data = await deleteJobCardItem(jobCardItemData);

    if (data.StatusCode === 200) {
      dispatch({
        type: DeleteJobCardItem_SUCCESS,
        payload: jobCardItemData.J_ItemID
      });
    } else {
      const msg = data.Message || "Failed to delete job card item";
      dispatch({
        type: DeleteJobCardItem_FAIL,
        payload: msg
      });
    }
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    dispatch({
      type: DeleteJobCardItem_FAIL,
      payload: message
    });
  }
};