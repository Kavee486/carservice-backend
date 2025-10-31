import {
  GetAllCustomers_REQUEST,
  GetAllCustomers_SUCCESS,
  GetAllCustomers_FAIL

} from "../constants/CustomerConstants";

import axios from 'axios';

// Action to get all customers
export const GetAllCustomers = () => async (dispatch) => {
  try {
    console.log('Fetching all customers...');

    dispatch({ type: GetAllCustomers_REQUEST });

    const { data } = await axios.get('/Customer/GetAllCustomers');

    console.log('Customer fetch response:', data);

    if (data.StatusCode === 200) {
      console.log('Saving fetched customers data to the store:', data.ResultSet);

      dispatch({
        type: GetAllCustomers_SUCCESS,
        payload: data.ResultSet
      });
    } else {
      const msg = data.Message || "Failed to fetch customers";
      console.error('Error fetching customers:', msg);

      dispatch({
        type: GetAllCustomers_FAIL,
        payload: msg
      });
    }
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();

    console.error('Error while fetching customers:', message);

    dispatch({
      type: GetAllCustomers_FAIL,
      payload: message
    });
  }
};




// Action to delete a customer
export const DeleteCustomer = (customerId) => async (dispatch) => {
  try {
    dispatch({ type: DeleteCustomer_REQUEST });
    const { data } = await axios.delete(`/Customer/DeleteCustomer/${customerId}`);

    if (data.StatusCode === 200) {
      dispatch({
        type: DeleteCustomer_SUCCESS,
        payload: customerId
      });
    } else {
      const msg = data.Message || "Failed to delete customer";
      dispatch({
        type: DeleteCustomer_FAIL,
        payload: msg
      });
    }
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    dispatch({
      type: DeleteCustomer_FAIL,
      payload: message
    });
  }
};