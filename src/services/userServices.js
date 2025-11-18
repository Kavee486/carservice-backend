// userServices.js
import axios from 'axios';

const API_BASE_URL = 'https://automechbackend.dockyardsoftware.com/';
//const API_BASE_URL = 'http://localhost:60748/';

// User Services
export const signupUser = async (userData) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const { data } = await axios.post(
      `${API_BASE_URL}/User/AddUserDetails`,
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
    const response = await axios.get(`${API_BASE_URL}/User/getUsersByRole2`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get technicians (Role 3) - From Users table
export const getTechnicians = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/User/getUsersByRole3`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get all technicians from Technicians table
export const getAllTechnicians = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/Technicians/getAllTechnicians`);
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
      `${API_BASE_URL}/User/UpdateUserDetails`,
      userData,
      config
    );

    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update technician service
export const updateTechnician = async (technicianData) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const { data } = await axios.post(
      `${API_BASE_URL}/Technicians/UpdateTechnicianDetails`,
      technicianData,
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
      `${API_BASE_URL}/User/DeactivateUser`,
      userData,
      config
    );

    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Deactivate technician service
export const deactivateTechnician = async (technicianId) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const technicianData = {
      TechnicianID: technicianId
    };

    const { data } = await axios.post(
      `${API_BASE_URL}/Technicians/DeleteTechnicianDetails`,
      technicianData,
      config
    );

    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};