// userServices.js
import axios from 'axios';

// Signup user service
export const signupUser = async (userData) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const { data } = await axios.post(
      `/User/AddUserDetails`,
      userData,
      config
    );

    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get admins (Role 2)
export const getAdmins = async () => {
  try {
    const response = await axios.get(`/User/getUsersByRole2`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get technicians (Role 3)
export const getTechnicians = async () => {
  try {
    const response = await axios.get(`/User/getUsersByRole3`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update user service
export const updateUser = async (userData) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const { data } = await axios.post(
      `/User/UpdateUserDetails`,
      userData,
      config
    );

    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Deactivate user service
export const deactivateUser = async (userId) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const userData = {
      UserID: userId
    };

    const { data } = await axios.post(
      `/User/DeactivateUser`,
      userData,
      config
    );

    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};