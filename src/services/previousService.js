import axios from 'axios';

// Service helper for Previous Services endpoints
const API_BASE = ''; // axios default baseURL is used in the project

export const previousService = {
  addPreviousService: async (payload) => {
    try {
      const { data } = await axios.post('/PreviousServices/AddPreviousService', payload);
      return data;
    } catch (err) {
      console.error('previousService.addPreviousService error', err);
      throw err;
    }
  },
  // Get previous services for a specific customer by id
  getPreviousServicesByCustomerID: async (customerId) => {
    try {
      if (!customerId) {
        throw new Error('customerId is required');
      }
      // Prefer using a query param as per backend API
      const { data } = await axios.get(`/PreviousServices/GetPreviousServicesByCustomerID`, { params: { CustomerID: customerId } });
      return data;
    } catch (err) {
      console.error('previousService.getPreviousServicesByCustomerID error', err);
      throw err;
    }
  }
};

export default previousService;
