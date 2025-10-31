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
} from "../constants/CustomerConstants";

const initialState = {
  customers: [],
  loading: false,
  error: null,
};

export const customerListReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_CUSTOMERS_REQUEST:
      return { ...state, loading: true, error: null };
      
    case DELETE_CUSTOMER_REQUEST:
    case ACTIVATE_CUSTOMER_REQUEST:
    case ADD_CUSTOMER_REQUEST:
      return { ...state, error: null }; // Don't set loading to true for delete/activate to avoid UI flicker

    case GET_CUSTOMERS_SUCCESS:
      return { ...state, loading: false, customers: action.payload, error: null };

    case DELETE_CUSTOMER_SUCCESS:
      return {
        ...state,
        customers: state.customers.map(customer => 
          customer.C_CustomerID === action.payload 
            ? { ...customer, C_Status: 'I' } // Update status to 'I' for Inactive
            : customer
        ),
        error: null
      };

    case ACTIVATE_CUSTOMER_SUCCESS:
      return {
        ...state,
        customers: state.customers.map(customer => 
          customer.C_CustomerID === action.payload 
            ? { ...customer, C_Status: 'A' } // Update status to 'A' for Active
            : customer
        ),
        error: null
      };

    case ADD_CUSTOMER_SUCCESS:
      return {
        ...state,
        customers: [...state.customers, action.payload], // Add new customer to the list
        error: null
      };

    case GET_CUSTOMERS_FAIL:
      return { ...state, loading: false, error: action.payload };
      
    case DELETE_CUSTOMER_FAIL:
    case ACTIVATE_CUSTOMER_FAIL:
    case ADD_CUSTOMER_FAIL:
      return { ...state, error: action.payload };

    default:
      return state;
  }
};