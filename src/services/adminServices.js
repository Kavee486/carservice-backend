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

// Function to fetch latest 5 bookings sorted by date
export const fetchLatestBookings = async () => {
  try {
    const { data } = await axios.get(`Bookings/GetAllBookings`);
    
    if (data.StatusCode === 200) {
      const bookings = data.ResultSet || data.Result || [];
      
      // Sort by date (most recent first) and take latest 5
      const sortedBookings = bookings
        .sort((a, b) => new Date(b.BookingDate || b.B_BookingDate) - new Date(a.BookingDate || a.B_BookingDate))
        .slice(0, 5);
      
      return sortedBookings;
    }
    return [];
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
    const [bookings, parts, services, vehicles, users, latestBookings] = await Promise.all([
      fetchAllBookings(),
      fetchAllParts(),
      fetchAllServices(),
      fetchAllVehicles(),
      fetchAllUsers(),
      fetchLatestBookings()
    ]);
    
    return {
      bookings,
      parts,
      services,
      vehicles,
      users,
      latestBookings
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