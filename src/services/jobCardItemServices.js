// services/jobCardItemServices.js
import axios from 'axios';

// Function to fetch all job card items
export const fetchAllJobCardItems = async () => {
  try {
    const { data } = await axios.get(`JobCardItems/GetAllJobCardItems`);
    return data;
  } catch (error) {
    throw error;
  }
};

// Function to add a new job card item
export const addJobCardItem = async (jobCardItemData) => {
  try {
    console.log("Adding job card item with data:", jobCardItemData);
    const { data } = await axios.post(`JobCardItems/AddJobCardItemsDetails`, jobCardItemData);
    console.log("Job card item added successfully, response:", data);
    return data;
  } catch (error) {
    console.error("Error adding job card item:", error);
    throw error;
  }
};

// Function to update an existing job card item
export const updateJobCardItem = async (jobCardItemData) => {
  try {
    console.log("Updating job card item with data:", jobCardItemData);
    const { data } = await axios.post(`JobCardItems/PutJobCardItemsDetails`, jobCardItemData);
    console.log("Job card item updated successfully, response:", data);
    return data;
  } catch (error) {
    console.error("Error updating job card item:", error);
    throw error;
  }
};

// Function to delete a job card item
export const deleteJobCardItem = async (jobCardItemData) => {
  try {
    console.log("Deleting job card item with data:", jobCardItemData);
    const { data } = await axios.post(`JobCardItems/DeletJobCardItemsDetails`, jobCardItemData);
    console.log("Job card item deleted successfully, response:", data);
    return data;
  } catch (error) {
    console.error("Error deleting job card item:", error);
    throw error;
  }
};

// Function to fetch all services
export const fetchAllServices = async () => {
  try {
    const { data } = await axios.get(`Service/GetAllServices`);
    return data;
  } catch (error) {
    throw error;
  }
};

// Function to fetch all parts
export const fetchAllParts = async () => {
  try {
    const { data } = await axios.get(`PartsInventory/GetAllPartsInventory`);
    return data;
  } catch (error) {
    throw error;
  }
};