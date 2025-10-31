import axios from 'axios';
import {
  GET_CUSTOMERS_REQUEST,
  GET_CUSTOMERS_SUCCESS,
  GET_CUSTOMERS_FAIL,
  DELETE_CUSTOMER_REQUEST,
  DELETE_CUSTOMER_SUCCESS,
  DELETE_CUSTOMER_FAIL,
  ACTIVATE_CUSTOMER_REQUEST,
  ACTIVATE_CUSTOMER_SUCCESS,
  ACTIVATE_CUSTOMER_FAIL,
  ADD_CUSTOMER_REQUEST,
  ADD_CUSTOMER_SUCCESS,
  ADD_CUSTOMER_FAIL
} from '../constants/CustomerConstants';

// Action to get all customers
export const getAllCustomers = () => async (dispatch) => {
  try {
    console.log('Fetching all customers...');
    dispatch({ type: GET_CUSTOMERS_REQUEST });

    const { data } = await axios.get('/Customer/GetAllCustomers');
    console.log('Customer fetch response:', data);

    if (data.StatusCode === 200) {
      console.log('Saving fetched customers data to the store:', data.ResultSet);
      dispatch({
        type: GET_CUSTOMERS_SUCCESS,
        payload: data.ResultSet
      });
    } else {
      const msg = data.Message || "Failed to fetch customers";
      console.error('Error fetching customers:', msg);
      dispatch({
        type: GET_CUSTOMERS_FAIL,
        payload: msg
      });
    }} catch (error) {
    const message = error.response?.data?.Message || error.response?.data?.message || error.message || error.toString();
    console.error('Error while fetching customers:', message);
    dispatch({
      type: GET_CUSTOMERS_FAIL,
      payload: message
    });
  }
};

// Action to delete/deactivate a customer using POST method
export const deleteCustomer = (customerData) => async (dispatch) => {
  try {
    dispatch({ type: DELETE_CUSTOMER_REQUEST });
    
    // Using HTTP POST method to update customer status
    const { data } = await axios.post('/Customer/DeleteCustomerDetails', customerData);

    if (data.StatusCode === 200) {
      dispatch({
        type: DELETE_CUSTOMER_SUCCESS,
        payload: customerData.C_CustomerID
      });
    } else {
      const msg = data.Message || "Failed to deactivate customer";
      dispatch({
        type: DELETE_CUSTOMER_FAIL,
        payload: msg
      });
    }
  } catch (error) {
    const message = error.response?.data?.Message || error.response?.data?.message || error.message || error.toString();
    dispatch({
      type: DELETE_CUSTOMER_FAIL,
      payload: message
    });
  }
};

// Action to activate a customer using POST method
export const activateCustomer = (customerData) => async (dispatch) => {
  try {
    dispatch({ type: ACTIVATE_CUSTOMER_REQUEST });
    
    // Set customer status to active before sending
    const activateData = {
      ...customerData,
      C_Status: 'A' // Set status to Active
    };
    
    // Using the same endpoint as delete but with active status
    const { data } = await axios.post('/Customer/DeleteCustomerDetails', activateData);

    if (data.StatusCode === 200) {
      dispatch({
        type: ACTIVATE_CUSTOMER_SUCCESS,
        payload: customerData.C_CustomerID
      });
    } else {
      const msg = data.Message || "Failed to activate customer";
      dispatch({
        type: ACTIVATE_CUSTOMER_FAIL,
        payload: msg
      });
    }
  } catch (error) {
    const message = error.response?.data?.Message || error.response?.data?.message || error.message || error.toString();
    dispatch({
      type: ACTIVATE_CUSTOMER_FAIL,
      payload: message
    });
  }
};

// Action to add a new customer using POST method
export const addCustomer = (customerData) => async (dispatch) => {
  try {
    console.log('Adding new customer...', customerData);
    dispatch({ type: ADD_CUSTOMER_REQUEST });

    const { data } = await axios.post('/Customer/AddCustomerDetails', customerData);
    console.log('Add customer response:', data);

    if (data.StatusCode === 200 || data.StatusCode === 201) {
      console.log('Customer added successfully:', data.ResultSet);
      dispatch({
        type: ADD_CUSTOMER_SUCCESS,
        payload: data.ResultSet
      });
      return { success: true, data: data.ResultSet };
    } else {
      const msg = data.Message || "Failed to add customer";
      console.error('Error adding customer:', msg);
      dispatch({
        type: ADD_CUSTOMER_FAIL,
        payload: msg
      });
      return { success: false, error: msg };
    }
  } catch (error) {
    const message = error.response?.data?.Message || error.response?.data?.message || error.message || error.toString();
    console.error('Error while adding customer:', message);
    dispatch({
      type: ADD_CUSTOMER_FAIL,
      payload: message
    });
    return { success: false, error: message };
  }
};