// services/jobCardServices.js
import axios from 'axios';

// Base URL for the job cards API
const API_URL = '/JobCards';

// Function to fetch all job cards
export const fetchAllJobCards = async () => {
  try {
    const { data } = await axios.get(`JobCards/GetAllJobCards`);
    return data;
  } catch (error) {
    throw error;
  }
};


// Function to fetch all technicians
export const fetchAllTechnicians = async () => {
  try {
    const { data } = await axios.get(`Technicians/getAllTechnicians`);
    return data;
  } catch (error) {
    throw error;
  }
};



// Function to add a new job card
export const addJobCard = async (jobCardData) => {
  try {
    console.log("Adding job card with data:", jobCardData);
    const { data } = await axios.post(`JobCards/AddJobCardsDetails`, jobCardData);
    console.log("Job card added successfully, response:", data);
    return data;
  } catch (error) {
    console.error("Error adding job card:", error);
    throw error;
  }
};

// Function to update an existing job card
export const updateJobCard = async (jobCardData) => {
  try {
    console.log("Updating job card with data:", jobCardData);
    const { data } = await axios.post(`JobCards/PutJobCardsDetails`, jobCardData);
    console.log("Job card updated successfully, response:", data);
    return data;
  } catch (error) {
    console.error("Error updating job card:", error);
    throw error;
  }
};

// Function to update booking services for a booking (assign multiple service IDs)
export const updateBookingServices = async (payload) => {
  try {
    console.log('Updating booking services with payload:', payload);
    const { data } = await axios.post(`JobCards/UpdateBookingServices`, payload);
    console.log('UpdateBookingServices response:', data);
    return data;
  } catch (error) {
    console.error('Error calling UpdateBookingServices:', error);
    throw error;
  }
};

// Function to add parts to a booking
export const addBookingParts = async (payload) => {
  try {
    console.log('Adding booking parts with payload:', payload);
    const { data } = await axios.post(`JobCards/AddBookingParts`, payload);
    console.log('AddBookingParts response:', data);
    return data;
  } catch (error) {
    console.error('Error calling AddBookingParts:', error);
    throw error;
  }
};

// Function to get booking parts by booking ID
export const getBookingPartsByBookingID = async (bookingId) => {
  try {
    const { data } = await axios.get(`JobCards/GetBookingPartsByBookingID?BookingID=${bookingId}`);
    return data;
  } catch (error) {
    console.error('Error fetching booking parts for', bookingId, error);
    throw error;
  }
};

// Fetch booking services with their associated parts (structured response)
export const getBookingServicesWithParts = async (bookingId) => {
  try {
    const { data } = await axios.get(`JobCards/GetBookingServicesWithParts?BookingID=${bookingId}`);
    return data;
  } catch (error) {
    console.error('Error fetching booking services with parts for', bookingId, error);
    throw error;
  }
};

// Function to delete a job card
export const deleteJobCard = async (jobCardData) => {
  try {
    console.log("Deleting job card with data:", jobCardData);
    const { data } = await axios.post(`JobCards/DeleteJobCardsDetails`, jobCardData);
    console.log("Job card deleted successfully, response:", data);
    return data;
  } catch (error) {
    console.error("Error deleting job card:", error);
    throw error;
  }
};

// Backwards-compatible: if backend exposes UpdateBookingService (singular) accept a structured ServiceParts payload
export const updateBookingService = async (payload) => {
  try {
    console.log('Calling UpdateBookingService with payload:', payload);
    // Use the backend action that successfully accepts ServiceParts (plural)
    const { data } = await axios.post(`JobCards/UpdateBookingServices`, payload);
    console.log('UpdateBookingService response:', data);
    return data;
  } catch (error) {
    console.error('Error calling UpdateBookingService:', error);
    throw error;
  }
};