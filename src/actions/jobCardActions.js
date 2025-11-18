// actions/jobCardActions.js
import {
  GetAllJobCards_REQUEST,
  GetAllJobCards_SUCCESS,
  GetAllJobCards_FAIL,
  AddJobCard_REQUEST,
  AddJobCard_SUCCESS,
  AddJobCard_FAIL,
  UpdateJobCard_REQUEST,
  UpdateJobCard_SUCCESS,
  UpdateJobCard_FAIL,
  DeleteJobCard_REQUEST,
  DeleteJobCard_SUCCESS,
  DeleteJobCard_FAIL,
  GetAllTechnicians_REQUEST,
  GetAllTechnicians_SUCCESS,
  GetAllTechnicians_FAIL
} from "../constants/JobCardConstants";
import {
  fetchAllJobCards,
  addJobCard,
  updateJobCard,
  deleteJobCard,
  fetchAllTechnicians
} from '../services/jobCardServices';






// Action to get all technicians
export const GetAllTechnicians = () => async (dispatch) => {
  try {
    dispatch({ type: GetAllTechnicians_REQUEST });

    const data = await fetchAllTechnicians();

    if (data.StatusCode === 200) {
      dispatch({
        type: GetAllTechnicians_SUCCESS,
        payload: data.ResultSet
      });
    } else {
      const msg = data.Message || "Failed to fetch technicians";
      dispatch({
        type: GetAllTechnicians_FAIL,
        payload: msg
      });
    }
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    dispatch({
      type: GetAllTechnicians_FAIL,
      payload: message
    });
  }
};
// Action to get all job cards
export const GetAllJobCards = () => async (dispatch) => {
  try {
    dispatch({ type: GetAllJobCards_REQUEST });

    const data = await fetchAllJobCards();

    if (data.StatusCode === 200) {
      dispatch({
        type: GetAllJobCards_SUCCESS,
        payload: data.ResultSet
      });
    } else {
      const msg = data.Message || "Failed to fetch job cards";
      dispatch({
        type: GetAllJobCards_FAIL,
        payload: msg
      });
    }
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    dispatch({
      type: GetAllJobCards_FAIL,
      payload: message
    });
  }
};

// Action to add a new job card
export const AddJobCard = (jobCardData) => async (dispatch) => {
  try {
    dispatch({ type: AddJobCard_REQUEST });

    const data = await addJobCard(jobCardData);

    if (data.StatusCode === 200) {
      dispatch({
        type: AddJobCard_SUCCESS,
        payload: data.Result,
      });
    } else {
      const msg = data.Message || "Failed to add job card";
      dispatch({
        type: AddJobCard_FAIL,
        payload: msg,
      });
    }
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    dispatch({
      type: AddJobCard_FAIL,
      payload: message,
    });
  }
};

// Action to update an existing job card
export const UpdateJobCard = (jobCardData) => async (dispatch) => {
  try {
    dispatch({ type: UpdateJobCard_REQUEST });

    const data = await updateJobCard(jobCardData);

    if (data.StatusCode === 200) {
      dispatch({
        type: UpdateJobCard_SUCCESS,
        payload: jobCardData // Using the submitted data as the response doesn't return the updated object
      });
    } else {
      const msg = data.Message || "Failed to update job card";
      dispatch({
        type: UpdateJobCard_FAIL,
        payload: msg
      });
    }
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    dispatch({
      type: UpdateJobCard_FAIL,
      payload: message
    });
  }
};

// Action to delete a job card
export const DeleteJobCard = (jobCardData) => async (dispatch) => {
  try {
    dispatch({ type: DeleteJobCard_REQUEST });

    const data = await deleteJobCard(jobCardData);

    if (data.StatusCode === 200) {
      dispatch({
        type: DeleteJobCard_SUCCESS,
        payload: jobCardData.J_JobCardID // Pass the ID for reducer to filter
      });
    } else {
      const msg = data.Message || "Failed to delete job card";
      dispatch({
        type: DeleteJobCard_FAIL,
        payload: msg
      });
    }
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    dispatch({
      type: DeleteJobCard_FAIL,
      payload: message
    });
  }
};