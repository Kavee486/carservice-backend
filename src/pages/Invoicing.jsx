import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FileText, Plus, Search, Filter, Edit3, RefreshCw, DollarSign, Calendar, CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';
import { GetAllInvoices, UpdateInvoice } from '../actions/invoiceActions';

const Invoices = () => {
  const dispatch = useDispatch();
  const invoiceList = useSelector(state => state.invoiceList);
  const { loading, invoices, error } = invoiceList;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    dispatch(GetAllInvoices());
  }, [dispatch]);

  const handleEditInvoice = (invoice) => {
    setCurrentInvoice(invoice);
    setIsModalVisible(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const values = Object.fromEntries(formData.entries());

    try {
      setSubmitLoading(true);

      const invoiceData = {
        I_InvoiceID: currentInvoice.I_InvoiceID,
        I_PaymentStatus: values.paymentStatus,
        I_InvoiceDate: values.invoiceDate,
        I_TotalAmount: values.totalAmount.toString(),
      };

      await dispatch(UpdateInvoice(invoiceData));
      alert('Invoice updated successfully');
      setIsModalVisible(false);
      dispatch(GetAllInvoices());
    } catch (err) {
      console.error('Error:', err);
      alert(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleRefresh = () => {
    dispatch(GetAllInvoices());
  };

  // Format currency as Rs
  const formatCurrency = (value) => {
    return `Rs ${parseFloat(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Get status badge style
  const getPaymentStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get job card status badge style
  const getJobCardStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter invoices based on search term and status
  const filteredInvoices = invoices && invoices.length > 0
    ? invoices.filter(invoice => {
      const matchesSearch =
        invoice.I_InvoiceID?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.J_BookingID?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatCurrency(invoice.I_TotalAmount).toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || 
        invoice.I_PaymentStatus?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    })
    : [];

  // Calculate statistics
  const totalInvoices = invoices?.length || 0;
  const totalAmount = invoices?.reduce((total, invoice) => total + parseFloat(invoice.I_TotalAmount || 0), 0) || 0;
  const paidInvoices = invoices?.filter(inv => inv.I_PaymentStatus?.toLowerCase() === 'paid').length || 0;
  const pendingInvoices = invoices?.filter(inv => inv.I_PaymentStatus?.toLowerCase() === 'pending').length || 0;

  const invoiceStats = {
    total: totalInvoices,
    totalAmount: totalAmount,
    paid: paidInvoices,
    pending: pendingInvoices
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-600 text-base font-medium">Loading invoices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="bg-white rounded-lg p-8 max-w-md mx-auto text-center shadow-lg">
          <div className="h-12 w-12 text-red-500 mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-gray-600 text-base font-medium mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-base font-medium flex items-center mx-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-6">
      <div className="w-full space-y-6">
        {/* Header Section */}
        <div className="bg-blue-600 rounded-xl shadow-lg text-white p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Invoice Management</h1>
              <p className="text-purple-100">Manage and track all invoices and payments efficiently</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg h-10 px-4 font-medium flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Total Invoices Card */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Total Invoices</div>
                <div className="text-xl font-bold text-gray-900">{invoiceStats.total}</div>
              </div>
              <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                <FileText className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Total Amount Card */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Total Amount</div>
                <div className="text-xl font-bold text-gray-900">{formatCurrency(invoiceStats.totalAmount)}</div>
              </div>
              <div className="p-2 rounded-full bg-green-100 text-green-600">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Paid Invoices Card */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Paid Invoices</div>
                <div className="text-xl font-bold text-gray-900">{invoiceStats.paid}</div>
              </div>
              <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Pending Invoices Card */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Pending Invoices</div>
                <div className="text-xl font-bold text-gray-900">{invoiceStats.pending}</div>
              </div>
              <div className="p-2 rounded-full bg-orange-100 text-orange-600">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
            <div className="flex items-center">
              <Filter className="text-purple-600 text-base mr-2" />
              <span className="text-base font-semibold text-gray-900">Filters & Search</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by invoice ID, booking ID, or amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
              />
            </div>
            
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div className="mt-2">
            <span className="text-sm text-gray-600">
              Showing {filteredInvoices.length} of {invoiceStats.total} invoices
            </span>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Invoice List</h3>
              <span className="text-gray-500">{invoiceStats.total} invoices found</span>
            </div>
          </div>

          <div className="p-6">
            {filteredInvoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Invoice ID</th>
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Booking ID</th>
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Job Card Status</th>
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Total Amount</th>
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Invoice Date</th>
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Payment Status</th>
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((invoice) => (
                      <tr key={invoice.I_InvoiceID} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-4 px-4 text-base font-medium text-gray-900">{invoice.I_InvoiceID}</td>
                        <td className="py-4 px-4 text-base text-gray-700">{invoice.J_BookingID}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getJobCardStatusBadge(invoice.J_JobCardStatus)}`}>
                            {invoice.J_JobCardStatus || '—'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {formatCurrency(invoice.I_TotalAmount)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-base text-gray-700">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(invoice.I_InvoiceDate)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusBadge(invoice.I_PaymentStatus)}`}>
                            <CreditCard className="h-3 w-3 mr-1" />
                            {invoice.I_PaymentStatus || '—'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditInvoice(invoice)}
                              className="text-purple-600 hover:text-purple-800 p-2 rounded-lg hover:bg-purple-100"
                              title="Edit invoice"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-base font-medium">
                  {invoices && invoices.length > 0
                    ? 'No invoices match your search criteria'
                    : 'No invoices found'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Edit Invoice Modal */}
        {isModalVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Edit Invoice - {currentInvoice?.I_InvoiceID}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Invoice ID</label>
                    <input
                      type="text"
                      value={currentInvoice?.I_InvoiceID}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Booking ID</label>
                    <input
                      type="text"
                      value={currentInvoice?.J_BookingID}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Job Card Status</label>
                    <input
                      type="text"
                      value={currentInvoice?.J_JobCardStatus}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Payment Status</label>
                    <select
                      name="paymentStatus"
                      defaultValue={currentInvoice?.I_PaymentStatus}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Invoice Date</label>
                    <input
                      name="invoiceDate"
                      type="date"
                      defaultValue={currentInvoice?.I_InvoiceDate?.split('T')[0]}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Total Amount (Rs)</label>
                    <input
                      name="totalAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter total amount"
                      defaultValue={currentInvoice?.I_TotalAmount}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalVisible(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 text-base font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center text-base font-medium"
                  >
                    {submitLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </>
                    ) : (
                      'Update Invoice'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Invoices;