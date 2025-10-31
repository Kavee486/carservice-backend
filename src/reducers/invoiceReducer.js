import {
  GetAllInvoices_REQUEST,
  GetAllInvoices_SUCCESS,
  GetAllInvoices_FAIL,
  UpdateInvoice_REQUEST,
  UpdateInvoice_SUCCESS,
  UpdateInvoice_FAIL
} from '../constants/invoiceConstants';

export const invoiceListReducer = (state = { invoices: [] }, action) => {
  switch (action.type) {
    case GetAllInvoices_REQUEST:
      return { loading: true, invoices: [] };
    case GetAllInvoices_SUCCESS:
      return { loading: false, invoices: action.payload };
    case GetAllInvoices_FAIL:
      return { loading: false, error: action.payload };
    
    case UpdateInvoice_REQUEST:
      return { ...state, loading: true };
    case UpdateInvoice_SUCCESS:
      return {
        ...state,
        loading: false,
        invoices: state.invoices.map(invoice =>
          invoice.I_InvoiceID === action.payload.I_InvoiceID ? action.payload : invoice
        ),
      };
    case UpdateInvoice_FAIL:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};