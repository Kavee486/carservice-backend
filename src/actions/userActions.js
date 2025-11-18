// userActions.js
import { 
  SIGNUP_REQUEST, 
  SIGNUP_SUCCESS, 
  SIGNUP_FAIL, 
  SIGNUP_RESET, 
  GET_ADMINS_REQUEST, 
  GET_ADMINS_SUCCESS, 
  GET_ADMINS_FAIL, 
  GET_TECHNICIANS_REQUEST, 
  GET_TECHNICIANS_SUCCESS, 
  GET_TECHNICIANS_FAIL,
  GET_ALL_TECHNICIANS_REQUEST,
  GET_ALL_TECHNICIANS_SUCCESS,
  GET_ALL_TECHNICIANS_FAIL,
  UPDATE_USER_REQUEST,
  UPDATE_USER_SUCCESS,
  UPDATE_USER_FAIL,
  UPDATE_TECHNICIAN_REQUEST,
  UPDATE_TECHNICIAN_SUCCESS,
  UPDATE_TECHNICIAN_FAIL,
  DEACTIVATE_USER_REQUEST,
  DEACTIVATE_USER_SUCCESS,
  DEACTIVATE_USER_FAIL,
  DEACTIVATE_TECHNICIAN_REQUEST,
  DEACTIVATE_TECHNICIAN_SUCCESS,
  DEACTIVATE_TECHNICIAN_FAIL
} from '../constants/userConstants';
import { 
  signupUser, 
  getAdmins, 
  getTechnicians, 
  getAllTechnicians,
  updateUser, 
  updateTechnician,
  deactivateUser, 
  deactivateTechnician 
} from '../services/userServices';

// Signup user action
export const signupUserAction = (userData) => async (dispatch) => {
  try {
    dispatch({ type: SIGNUP_REQUEST });

    const data = await signupUser(userData);

    if (data.StatusCode === 200) {
      dispatch({
        type: SIGNUP_SUCCESS,
        payload: data.Result
      });
      return { success: true, data: data.Result };
    } else {
      const errorMessage = data.Message || 'Signup failed';
      dispatch({
        type: SIGNUP_FAIL,
        payload: errorMessage
      });
      return { success: false, message: errorMessage };
    }
  } catch (error) {
    const message = error.message || error.toString();
    dispatch({
      type: SIGNUP_FAIL,
      payload: message
    });
    return { success: false, message };
  }
};

// Reset signup state action
export const resetSignupAction = () => (dispatch) => {
  dispatch({ type: SIGNUP_RESET });
};

// Get Admins Action
export const getAdminsAction = () => async (dispatch) => {
  try {
    dispatch({ type: GET_ADMINS_REQUEST });
    console.log('Fetching admins...');
    const data = await getAdmins();
    console.log('Admins response:', data);
    
    if (data.StatusCode === 200) {
      dispatch({ 
        type: GET_ADMINS_SUCCESS, 
        payload: data 
      });
    } else {
      const errorMessage = data.Message || 'Failed to fetch admins';
      dispatch({
        type: GET_ADMINS_FAIL,
        payload: errorMessage
      });
    }
  } catch (error) {
    console.error('Error fetching admins:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch admins';
    dispatch({
      type: GET_ADMINS_FAIL,
      payload: errorMessage
    });
  }
};

// Get Technicians Action (from Users table)
export const getTechniciansAction = () => async (dispatch) => {
  try {
    dispatch({ type: GET_TECHNICIANS_REQUEST });
    console.log('Fetching technicians from Users table...');
    const data = await getTechnicians();
    console.log('Technicians (Users) response:', data);
    
    if (data.StatusCode === 200) {
      dispatch({ 
        type: GET_TECHNICIANS_SUCCESS, 
        payload: data 
      });
    } else {
      const errorMessage = data.Message || 'Failed to fetch technicians';
      dispatch({
        type: GET_TECHNICIANS_FAIL,
        payload: errorMessage
      });
    }
  } catch (error) {
    console.error('Error fetching technicians:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch technicians';
    dispatch({
      type: GET_TECHNICIANS_FAIL,
      payload: errorMessage
    });
  }
};

// Get All Technicians Action (from Technicians table)
export const getAllTechniciansAction = () => async (dispatch) => {
  try {
    dispatch({ type: GET_ALL_TECHNICIANS_REQUEST });
    console.log('Fetching technicians from Technicians table...');
    const data = await getAllTechnicians();
    console.log('Technicians (Technicians table) response:', data);
    
    if (data.StatusCode === 200) {
      dispatch({ 
        type: GET_ALL_TECHNICIANS_SUCCESS, 
        payload: data 
      });
    } else {
      const errorMessage = data.Message || 'Failed to fetch technicians';
      dispatch({
        type: GET_ALL_TECHNICIANS_FAIL,
        payload: errorMessage
      });
    }
  } catch (error) {
    console.error('Error fetching technicians:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch technicians';
    dispatch({
      type: GET_ALL_TECHNICIANS_FAIL,
      payload: errorMessage
    });
  }
};

// Update User Action
export const updateUserAction = (userData) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_USER_REQUEST });

    const data = await updateUser(userData);

    if (data.StatusCode === 200) {
      dispatch({
        type: UPDATE_USER_SUCCESS,
        payload: data.Result
      });
      return { success: true, data: data.Result };
    } else {
      const errorMessage = data.Message || 'Update failed';
      dispatch({
        type: UPDATE_USER_FAIL,
        payload: errorMessage
      });
      return { success: false, message: errorMessage };
    }
  } catch (error) {
    const message = error.message || error.toString();
    dispatch({
      type: UPDATE_USER_FAIL,
      payload: message
    });
    return { success: false, message };
  }
};

// Update Technician Action
export const updateTechnicianAction = (technicianData) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_TECHNICIAN_REQUEST });

    const data = await updateTechnician(technicianData);

    if (data.StatusCode === 200) {
      dispatch({
        type: UPDATE_TECHNICIAN_SUCCESS,
        payload: data.Result
      });
      return { success: true, data: data.Result };
    } else {
      const errorMessage = data.Message || 'Technician update failed';
      dispatch({
        type: UPDATE_TECHNICIAN_FAIL,
        payload: errorMessage
      });
      return { success: false, message: errorMessage };
    }
  } catch (error) {
    const message = error.message || error.toString();
    dispatch({
      type: UPDATE_TECHNICIAN_FAIL,
      payload: message
    });
    return { success: false, message };
  }
};

// Deactivate User Action
export const deactivateUserAction = (userId) => async (dispatch) => {
  try {
    dispatch({ type: DEACTIVATE_USER_REQUEST });

    const data = await deactivateUser(userId);

    if (data.StatusCode === 200) {
      dispatch({
        type: DEACTIVATE_USER_SUCCESS,
        payload: data.Result
      });
      return { success: true, data: data.Result };
    } else {
      const errorMessage = data.Message || 'Deactivation failed';
      dispatch({
        type: DEACTIVATE_USER_FAIL,
        payload: errorMessage
      });
      return { success: false, message: errorMessage };
    }
  } catch (error) {
    const message = error.message || error.toString();
    dispatch({
      type: DEACTIVATE_USER_FAIL,
      payload: message
    });
    return { success: false, message };
  }
};

// Deactivate Technician Action
export const deactivateTechnicianAction = (technicianId) => async (dispatch) => {
  try {
    dispatch({ type: DEACTIVATE_TECHNICIAN_REQUEST });

    const data = await deactivateTechnician(technicianId);

    if (data.StatusCode === 200) {
      dispatch({
        type: DEACTIVATE_TECHNICIAN_SUCCESS,
        payload: data.Result
      });
      return { success: true, data: data.Result };
    } else {
      const errorMessage = data.Message || 'Technician deactivation failed';
      dispatch({
        type: DEACTIVATE_TECHNICIAN_FAIL,
        payload: errorMessage
      });
      return { success: false, message: errorMessage };
    }
  } catch (error) {
    const message = error.message || error.toString();
    dispatch({
      type: DEACTIVATE_TECHNICIAN_FAIL,
      payload: message
    });
    return { success: false, message };
  }
};

// Combined action to fetch all users (admins + technicians from both tables)
export const fetchAllUsersAction = () => async (dispatch) => {
  await Promise.all([
    dispatch(getAdminsAction()),
    dispatch(getTechniciansAction()),
    dispatch(getAllTechniciansAction())
  ]);
};

// Combined update action for technicians (updates both User and Technician tables)
export const updateTechnicianCompleteAction = (userData, technicianData) => async (dispatch) => {
  try {
    const [userResult, technicianResult] = await Promise.all([
      dispatch(updateUserAction(userData)),
      dispatch(updateTechnicianAction(technicianData))
    ]);

    return {
      userSuccess: userResult.success,
      technicianSuccess: technicianResult.success,
      userMessage: userResult.message,
      technicianMessage: technicianResult.message
    };
  } catch (error) {
    console.error('Error in combined technician update:', error);
    return {
      userSuccess: false,
      technicianSuccess: false,
      message: 'Failed to update technician in both tables'
    };
  }
};

// Combined deactivate action for technicians (deactivates in both User and Technician tables)
export const deactivateTechnicianCompleteAction = (userId, technicianId) => async (dispatch) => {
  try {
    const [userResult, technicianResult] = await Promise.all([
      dispatch(deactivateUserAction(userId)),
      dispatch(deactivateTechnicianAction(technicianId))
    ]);

    return {
      userSuccess: userResult.success,
      technicianSuccess: technicianResult.success,
      userMessage: userResult.message,
      technicianMessage: technicianResult.message
    };
  } catch (error) {
    console.error('Error in combined technician deactivation:', error);
    return {
      userSuccess: false,
      technicianSuccess: false,
      message: 'Failed to deactivate technician in both tables'
    };
  }
};