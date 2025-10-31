import axios from 'axios';

// Base URL for the invoice API
const API_URL = '/Invoice';

// Function to fetch all invoices with job cards
export const fetchAllInvoices = async () => {
  try {
    const { data } = await axios.get(`Invoices/GetAllInvoicesWithJobCards`);
    return data;
  } catch (error) {
    throw error;
  }
};

// Function to update an existing invoice
export const updateInvoice = async (invoiceData) => {
  try {
    console.log("Updating invoice with data:", invoiceData);
    const { data } = await axios.post(`Invoices/UpdateInvoiceDetails`, invoiceData);
    console.log("Invoice updated successfully, response:", data);
    return data;
  } catch (error) {
    console.error("Error updating invoice:", error);
    throw error;
  }
};