import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FileText, Plus, Search, Filter, Edit3, RefreshCw, Calendar, CreditCard, CheckCircle, XCircle, Clock, Printer, Download } from 'lucide-react';
import { GetAllInvoices, UpdateInvoice } from '../actions/invoiceActions';

const Invoices = () => {
  const dispatch = useDispatch();
  const invoiceList = useSelector(state => state.invoiceList);
  const { loading, invoices, error } = invoiceList;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const previewRef = useRef(null);
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

  const handlePreviewInvoice = (invoice) => {
    // Try to enrich invoice preview with locally stored itemized invoice (set when job card completed)
    try {
      const key = `invoice_for_booking_${invoice?.J_BookingID}`;
      const stored = localStorage.getItem(key) || localStorage.getItem('latest_invoice');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && String(parsed.J_BookingID) === String(invoice?.J_BookingID)) {
          setPreviewInvoice({ ...invoice, _localInvoiceDetails: parsed });
          setIsPreviewVisible(true);
          return;
        }
      }
    } catch (e) {
      // ignore parse/storage errors
      console.warn('Failed reading local invoice for preview', e);
    }
    // fallback to plain invoice object
    setPreviewInvoice(invoice);
    setIsPreviewVisible(true);
    // small delay to let modal render if needed
    setTimeout(() => {}, 50);
  };

  const printPreview = () => {
    if (!previewInvoice) return;
    // build simple printable HTML and open in new window
    const html = buildInvoiceHtml(previewInvoice);
    const w = window.open('', '_blank');
    if (!w) return alert('Popup blocked. Allow popups for this site to print the invoice.');
    w.document.write(html);
    w.document.close();
    w.focus();
    // give browser a moment to render
    setTimeout(() => { w.print(); }, 300);
  };

  const buildInvoiceHtml = (inv) => {
    const companyName = 'Premium Auto Care';
    const logoPath = (typeof window !== 'undefined' && document.querySelector('link[rel="shortcut icon"]')) ? '/AutoDeck Logo Design.png' : '/AutoDeck Logo Design.png';
    const carImg = '/AutoDeck Logo Design.png';
    const total = parseFloat(inv.I_TotalAmount || 0).toFixed(2);
    const date = inv.I_InvoiceDate ? new Date(inv.I_InvoiceDate).toLocaleDateString() : '';
    // If preview has local itemized details, render them
    let itemsHtml = '';
    if (inv._localInvoiceDetails) {
      const d = inv._localInvoiceDetails;
      if (Array.isArray(d.Services) && d.Services.length > 0) {
        itemsHtml += `<tr><td style="font-weight:600">Services</td><td style="text-align:right">Rs ${d.Totals?.servicesTotal?.toFixed(2) || '0.00'}</td></tr>`;
        d.Services.forEach(s => {
          itemsHtml += `<tr><td style="padding-left:12px">${s.name}</td><td style="text-align:right">Rs ${parseFloat(s.price||0).toFixed(2)}</td></tr>`;
        });
      }
      if (Array.isArray(d.Parts) && d.Parts.length > 0) {
        itemsHtml += `<tr><td style="font-weight:600">Parts</td><td style="text-align:right">Rs ${d.Totals?.partsTotal?.toFixed(2) || '0.00'}</td></tr>`;
        d.Parts.forEach(p => {
          itemsHtml += `<tr><td style="padding-left:12px">${p.name} x ${p.qty}</td><td style="text-align:right">Rs ${parseFloat(p.lineTotal||0).toFixed(2)}</td></tr>`;
        });
      }
      if (typeof d.LabourCost !== 'undefined') {
        itemsHtml += `<tr><td style="font-weight:600">Labour</td><td style="text-align:right">Rs ${parseFloat(d.LabourCost||0).toFixed(2)}</td></tr>`;
      }
      itemsHtml += `<tr><td style="font-weight:700">Grand Total</td><td style="text-align:right;font-weight:700">Rs ${parseFloat(d.Totals?.grandTotal||0).toFixed(2)}</td></tr>`;
    }

    return `<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${inv.I_InvoiceID}</title>
      <style>
        body{font-family:Arial,Helvetica,sans-serif;padding:20px;color:#222}
        .invoice-header{display:flex;justify-content:space-between;align-items:center}
        .company{font-size:24px;font-weight:700;color:#0b63d0}
        .meta{text-align:right}
        .line{margin-top:20px;border-top:2px solid #0b63d0}
        .total{background:#0b63d0;color:#fff;padding:12px;border-radius:6px;margin-top:16px;text-align:right}
        .logo{max-width:140px}
        .car-img{max-width:120px;border-radius:8px}
      </style></head><body>
      <div class="invoice-header">
        <div>
          <img src="${logoPath}" class="logo" alt="logo" />
          <div class="company">${companyName}</div>
          <div style="color:#666">Premium services & repairs</div>
        </div>
        <div class="meta">
          <div><strong>Invoice</strong> #${inv.I_InvoiceID}</div>
          <div>Booking: ${inv.J_BookingID}</div>
          <div>Date: ${date}</div>
        </div>
      </div>
      <div class="line"></div>
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-top:20px">
        <div style="width:65%">
          <h4>Items</h4>
          <table width="100%" cellpadding="6" cellspacing="0" style="border-collapse:collapse">
            <thead><tr><th style="text-align:left;border-bottom:1px solid #eee">Description</th><th style="text-align:right;border-bottom:1px solid #eee">Amount (Rs)</th></tr></thead>
            <tbody>
              ${itemsHtml || `<tr><td>Services & Parts</td><td style="text-align:right">Rs ${total}</td></tr>`}
            </tbody>
          </table>
        </div>
        <div style="width:30%;text-align:center">
          <img src="${carImg}" class="car-img" alt="car" />
        </div>
      </div>
      <div class="total"><strong>Final Amount: Rs ${inv._localInvoiceDetails ? (inv._localInvoiceDetails.Totals?.grandTotal || total) : total}</strong></div>
    </body></html>`;
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
        invoice.J_BookingID?.toLowerCase().includes(searchTerm.toLowerCase());

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
                {/* Currency label shown in text; Dollar icon removed to use Rs prefix consistently */}
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
                            <button
                              onClick={() => handlePreviewInvoice(invoice)}
                              className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-100"
                              title="Preview / Print"
                            >
                              <Printer className="h-4 w-4" />
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

                  {/* Invoice Date and Total Amount removed: only Payment Status is editable in this modal */}
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

        {/* Invoice Preview / Printable Modal */}
        {isPreviewVisible && previewInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center p-6 z-50 overflow-auto">
            <div ref={previewRef} className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-2xl font-bold text-blue-600">Premium Auto Care</div>
                  <div className="text-sm text-gray-600">Quality servicing & repairs</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Invoice</div>
                  <div className="text-lg font-semibold">#{previewInvoice.I_InvoiceID}</div>
                  <div className="text-xs text-gray-500">Booking: {previewInvoice.J_BookingID}</div>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden mb-4">
                <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src="/AutoDeck Logo Design.png" alt="company" className="h-12 w-12 object-contain rounded" />
                    <div>
                      <div className="text-sm font-semibold">Premium Auto Care</div>
                      <div className="text-xs">No: 123, Vehicle Lane, City</div>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-medium">Payment Receipt</div>
                    <div className="text-xs">{formatDate(previewInvoice.I_InvoiceDate)}</div>
                  </div>
                </div>

                <div className="p-4 bg-white">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <h4 className="text-sm font-semibold text-gray-700">Bill To</h4>
                      <div className="text-sm text-gray-600">Customer</div>
                    </div>
                    <div className="text-right">
                      <img src="/AutoDeck Logo Design.png" alt="car" className="h-20 w-28 object-cover rounded" />
                    </div>
                  </div>

                  <div className="mt-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-gray-500 border-b">
                          <th className="py-2">Description</th>
                          <th className="py-2 text-right">Amount (Rs)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewInvoice._localInvoiceDetails ? (
                          <>
                            {/* Services section */}
                            {previewInvoice._localInvoiceDetails.Services && previewInvoice._localInvoiceDetails.Services.length > 0 && (
                              <>
                                <tr>
                                  <td className="py-2 font-semibold">Services</td>
                                  <td className="py-2 text-right">{formatCurrency(previewInvoice._localInvoiceDetails.Totals?.servicesTotal || 0)}</td>
                                </tr>
                                {previewInvoice._localInvoiceDetails.Services.map((s, idx) => (
                                  <tr key={`svc-${idx}`}>
                                    <td className="py-1 pl-4 text-sm">{s.name}</td>
                                    <td className="py-1 text-right">{formatCurrency(s.price)}</td>
                                  </tr>
                                ))}
                              </>
                            )}

                            {/* Parts section */}
                            {previewInvoice._localInvoiceDetails.Parts && previewInvoice._localInvoiceDetails.Parts.length > 0 && (
                              <>
                                <tr>
                                  <td className="py-2 font-semibold">Parts</td>
                                  <td className="py-2 text-right">{formatCurrency(previewInvoice._localInvoiceDetails.Totals?.partsTotal || 0)}</td>
                                </tr>
                                {previewInvoice._localInvoiceDetails.Parts.map((p, idx) => (
                                  <tr key={`part-${idx}`}>
                                    <td className="py-1 pl-4 text-sm">{p.name} <span className="text-xs text-gray-500">x {p.qty}</span></td>
                                    <td className="py-1 text-right">{formatCurrency(p.lineTotal)}</td>
                                  </tr>
                                ))}
                              </>
                            )}

                            {/* Labour section */}
                            {typeof previewInvoice._localInvoiceDetails.LabourCost !== 'undefined' && (
                              <tr>
                                <td className="py-2 font-semibold">Labour</td>
                                <td className="py-2 text-right">{formatCurrency(previewInvoice._localInvoiceDetails.LabourCost)}</td>
                              </tr>
                            )}
                          </>
                        ) : (
                          <tr>
                            <td className="py-2">Services & Parts</td>
                            <td className="py-2 text-right">{formatCurrency(previewInvoice.I_TotalAmount)}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <div className="w-1/3 text-right">
                      <div className="text-sm text-gray-500">Subtotal</div>
                      <div className="text-lg font-semibold">
                        {previewInvoice._localInvoiceDetails ? formatCurrency(previewInvoice._localInvoiceDetails.Totals?.grandTotal || 0) : formatCurrency(previewInvoice.I_TotalAmount)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-center gap-3">
                <button onClick={() => { setIsPreviewVisible(false); setPreviewInvoice(null); }} className="px-4 py-2 border rounded text-gray-700">Close</button>
                <button onClick={printPreview} className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2"><Printer className="h-4 w-4"/> Print</button>
                <button onClick={printPreview} className="px-4 py-2 bg-green-600 text-white rounded flex items-center gap-2"><Download className="h-4 w-4"/> Download PDF</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Invoices;