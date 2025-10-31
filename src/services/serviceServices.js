import axios from 'axios';

// Base URL for the service API
const API_URL = '/Service';

// Function to fetch all services
export const fetchAllServices = async () => {
  try {
    const { data } = await axios.get(`Service/GetAllServices`);
    return data;
  } catch (error) {
    throw error;
  }
};

// Function to add a new service
export const addService = async (serviceData) => {
  try {
    console.log("Adding service with data:", serviceData);
    const { data } = await axios.post(`Service/AddServiceDetails`, serviceData);
    console.log("Service added successfully, response:", data);
    return data;
  } catch (error) {
    console.error("Error adding service:", error);
    throw error;
  }
};

// Function to update an existing service
export const updateService = async (serviceId, serviceData) => {
  try {
    // Send ServiceID in the request body instead of URL
    const payload = {
      ...serviceData,
      S_ServiceID: serviceId // Add ServiceID to the request body
    };
    
    const { data } = await axios.post(`Service/PutServiceDetails`, payload);
    return data;
  } catch (error) {
    throw error;
  }
};

// Function to delete a service - Updated to match backend API
export const deleteService = async (serviceData) => {
  try {
    console.log("Deleting service with data:", serviceData);
    const { data } = await axios.post(`Service/DeleteServiceDetails`, serviceData);
    console.log("Service deleted successfully, response:", data);
    return data;
  } catch (error) {
    console.error("Error deleting service:", error);
    throw error;
  }
};