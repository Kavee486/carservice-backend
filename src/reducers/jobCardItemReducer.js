// reducers/jobCardItemReducer.js
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
} from '../constants/JobCardItemConstants';

export const jobCardItemListReducer = (state = { jobCardItems: [] }, action) => {
  switch (action.type) {
    case GetAllJobCardItems_REQUEST:
      return { loading: true, jobCardItems: [] };
    case GetAllJobCardItems_SUCCESS:
      return { loading: false, jobCardItems: action.payload };
    case GetAllJobCardItems_FAIL:
      return { loading: false, error: action.payload };
    
    case AddJobCardItem_REQUEST:
      return { ...state, loading: true };
    case AddJobCardItem_SUCCESS:
      return {
        ...state,
        loading: false,
        jobCardItems: [...state.jobCardItems, action.payload],
      };
    case AddJobCardItem_FAIL:
      return { ...state, loading: false, error: action.payload };

    case UpdateJobCardItem_REQUEST:
      return { ...state, loading: true };
    case UpdateJobCardItem_SUCCESS:
      return {
        ...state,
        loading: false,
        jobCardItems: state.jobCardItems.map(item =>
          item.J_ItemID === action.payload.J_ItemID ? action.payload : item
        ),
      };
    case UpdateJobCardItem_FAIL:
      return { ...state, loading: false, error: action.payload };

    case DeleteJobCardItem_REQUEST:
      return { ...state, loading: true };
    case DeleteJobCardItem_SUCCESS:
      return {
        ...state,
        loading: false,
        jobCardItems: state.jobCardItems.filter(item => item.J_ItemID !== action.payload),
      };
    case DeleteJobCardItem_FAIL:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};