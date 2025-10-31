import axios from 'axios';

// Function to fetch all vehicles
export const fetchAllVehicles = async () => {
  try {
    const { data } = await axios.get(`Vehicle/getAllVehicles`);
    return data;
  } catch (error) {
    throw error;
  }
};

// Fetch vehicles for a specific customer by ID
export const getVehiclesByCustomerID = async (customerId) => {
  try {
    if (!customerId) throw new Error('customerId is required');
    const { data } = await axios.get(`Vehicle/GetVehicleByCustomerID`, {
      params: { CustomerID: customerId }
    });
    return data;
  } catch (error) {
    console.error('Error fetching vehicles by customer ID:', error);
    throw error;
  }
};

// Function to add a new vehicle
export const addVehicle = async (vehicleData) => {
  try {
    console.log("Adding vehicle with data:", vehicleData);
    const { data } = await axios.post(`Vehicle/AddVehicalDetails`, vehicleData);
    console.log("Vehicle added successfully, response:", data);
    return data;
  } catch (error) {
    console.error("Error adding vehicle:", error);
    throw error;
  }
};

// Function to update an existing vehicle
export const updateVehicle = async (vehicleData) => {
  try {
    const { data } = await axios.post(`Vehicle/PutVehicalDetails`, vehicleData);
    return data;
  } catch (error) {
    throw error;
  }
};

// Function to delete a vehicle
export const deleteVehicle = async (vehicleData) => {
  try {
    console.log("Deleting vehicle with data:", vehicleData);
    const { data } = await axios.post(`Vehicle/DeleteVehicalDetails`, vehicleData);
    console.log("Vehicle deleted successfully, response:", data);
    return data;
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    throw error;
  }
};