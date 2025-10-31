// adminServices.js
import axios from 'axios';

// Base URL for the API
//const API_URL = 'http://localhost:60748'; // Use your actual API base URL

// Function to fetch all bookings
export const fetchAllBookings = async () => {
  try {
    const { data } = await axios.get(`Bookings/GetAllBookings`);
    return data;
  } catch (error) {
    throw error;
  }
};

// Function to fetch all parts inventory
export const fetchAllParts = async () => {
  try {
    const { data } = await axios.get(`PartsInventory/getAllPartsInventory`);
    return data;
  } catch (error) {
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

// Function to fetch all vehicles
export const fetchAllVehicles = async () => {
  try {
    const { data } = await axios.get(`Vehicle/getAllVehicles`);
    return data;
  } catch (error) {
    throw error;
  }
};

// Function to fetch all users
export const fetchAllUsers = async () => {
  try {
    const { data } = await axios.get(`User/getAllUsers`);
    return data;
  } catch (error) {
    throw error;
  }
};

// Function to fetch dashboard statistics
export const fetchDashboardStats = async () => {
  try {
    // In a real app, you might have a dedicated endpoint for dashboard stats
    // For now, we'll fetch all data and calculate stats on the frontend
    const [bookings, parts, services, vehicles, users] = await Promise.all([
      fetchAllBookings(),
      fetchAllParts(),
      fetchAllServices(),
      fetchAllVehicles(),
      fetchAllUsers()
    ]);
    
    return {
      bookings,
      parts,
      services,
      vehicles,
      users
    };
  } catch (error) {
    throw error;
  }
};

// Fetch bookings for a given customer by CustomerID
export const fetchBookingsByCustomerID = async (customerId) => {
  try {
    if (!customerId) throw new Error('customerId is required');
    const { data } = await axios.get(`Bookings/GetBookingsByCustomerID`, { params: { CustomerID: customerId } });
    return data;
  } catch (error) {
    console.error('Error fetching bookings by customer ID:', error);
    throw error;
  }
};