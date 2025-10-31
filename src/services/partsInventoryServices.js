import axios from 'axios';

// Base URL for the parts inventory API
const API_URL = '/PartsInventory';

// Function to fetch all parts inventory
export const fetchAllPartsInventory = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/GetAllPartsInventory`);
    return data;
  } catch (error) {
    throw error;
  }
};

// Function to add a new part
export const addPartInventory = async (partData) => {
  try {
    const { data } = await axios.post(`${API_URL}/AddPartInventoryDetails`, partData);
    return data;
  } catch (error) {
    throw error;
  }
};

// Function to update an existing part - using the correct endpoint name
export const updatePartInventory = async (partData) => {
  try {
    // Use the correct endpoint name that matches your backend
    const { data } = await axios.post(`${API_URL}/PutPartInventoryDetails`, partData);
    return data;
  } catch (error) {
    throw error;
  }
};

// Function to delete a part - using DELETE method with request body
export const deletePartInventory = async (partId) => {
  try {
    // Use DELETE method with request body as your backend expects
    const { data } = await axios.delete(`${API_URL}/DeletePartInventoryDetails`, {
      data: { P_PartID: partId }
    });
    return data;
  } catch (error) {
    throw error;
  }
};