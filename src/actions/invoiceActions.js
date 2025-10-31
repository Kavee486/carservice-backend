import {
  GetAllInvoices_REQUEST,
  GetAllInvoices_SUCCESS,
  GetAllInvoices_FAIL,
  UpdateInvoice_REQUEST,
  UpdateInvoice_SUCCESS,
  UpdateInvoice_FAIL
} from "../constants/invoiceConstants";
import {
  fetchAllInvoices,
  updateInvoice
} from '../services/invoiceServices';

// Action to get all invoices
export const GetAllInvoices = () => async (dispatch) => {
  try {
    dispatch({ type: GetAllInvoices_REQUEST });

    const data = await fetchAllInvoices();

    if (data.StatusCode === 200) {
      dispatch({
        type: GetAllInvoices_SUCCESS,
        payload: data.ResultSet
      });
    } else {
      const msg = data.Message || "Failed to fetch invoices";
      dispatch({
        type: GetAllInvoices_FAIL,
        payload: msg
      });
    }
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    dispatch({
      type: GetAllInvoices_FAIL,
      payload: message
    });
  }
};

// Action to update an existing invoice
export const UpdateInvoice = (invoiceData) => async (dispatch) => {
  try {
    dispatch({ type: UpdateInvoice_REQUEST });

    const data = await updateInvoice(invoiceData);

    if (data.StatusCode === 200) {
      dispatch({
        type: UpdateInvoice_SUCCESS,
        payload: invoiceData
      });
    } else {
      const msg = data.Message || "Failed to update invoice";
      dispatch({
        type: UpdateInvoice_FAIL,
        payload: msg
      });
    }
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    dispatch({
      type: UpdateInvoice_FAIL,
      payload: message
    });
  }
};