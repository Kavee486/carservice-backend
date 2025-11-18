// reducers/jobCardReducer.js
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
} from '../constants/JobCardConstants';

export const jobCardListReducer = (state = { jobCards: [] }, action) => {
  switch (action.type) {
    case GetAllJobCards_REQUEST:
      return { loading: true, jobCards: [] };
    case GetAllJobCards_SUCCESS:
      return { loading: false, jobCards: action.payload };
    case GetAllJobCards_FAIL:
      return { loading: false, error: action.payload };
    
    case AddJobCard_REQUEST:
      return { ...state, loading: true };
    case AddJobCard_SUCCESS:
      return {
        ...state,
        loading: false,
        jobCards: [...state.jobCards, action.payload],
      };
    case AddJobCard_FAIL:
      return { ...state, loading: false, error: action.payload };

    case UpdateJobCard_REQUEST:
      return { ...state, loading: true };
    case UpdateJobCard_SUCCESS:
      return {
        ...state,
        loading: false,
        jobCards: state.jobCards.map(jobCard =>
          jobCard.J_JobCardID === action.payload.J_JobCardID ? action.payload : jobCard
        ),
      };
    case UpdateJobCard_FAIL:
      return { ...state, loading: false, error: action.payload };

    case DeleteJobCard_REQUEST:
      return { ...state, loading: true };
    case DeleteJobCard_SUCCESS:
      return {
        ...state,
        loading: false,
        jobCards: state.jobCards.filter(jobCard => jobCard.J_JobCardID !== action.payload),
      };
    case DeleteJobCard_FAIL:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};


export const technicianListReducer = (state = { technicians: [] }, action) => {
  switch (action.type) {
    case GetAllTechnicians_REQUEST:
      return { loading: true, technicians: [] };
    case GetAllTechnicians_SUCCESS:
      return { loading: false, technicians: action.payload };
    case GetAllTechnicians_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};