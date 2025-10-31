// components/JobCardItems.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ClipboardList, Plus, Search, Filter, Edit3, Trash2, RefreshCw, Package, Wrench, DollarSign, AlertCircle } from 'lucide-react';
import { 
  GetAllJobCardItems, 
  AddJobCardItem, 
  UpdateJobCardItem, 
  DeleteJobCardItem 
} from '../actions/jobCardItemActions';
import { fetchAllServices, fetchAllParts } from '../services/jobCardItemServices';

const JobCardItems = () => {
  const dispatch = useDispatch();
  const jobCardItemList = useSelector(state => state.jobCardItemList);
  const { loading, jobCardItems, error } = jobCardItemList;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentJobCardItem, setCurrentJobCardItem] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // State for services and parts with API calls
  const [services, setServices] = useState([]);
  const [parts, setParts] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [partsLoading, setPartsLoading] = useState(false);
  const [servicesError, setServicesError] = useState(null);
  const [partsError, setPartsError] = useState(null);

  useEffect(() => {
    dispatch(GetAllJobCardItems());
    fetchServicesAndParts();
  }, [dispatch]);

  const fetchServicesAndParts = async () => {
    try {
      setServicesLoading(true);
      setPartsLoading(true);
      
      // Fetch services and parts concurrently
      const [servicesResponse, partsResponse] = await Promise.all([
        fetchAllServices().catch(error => {
          console.error('Services fetch error:', error);
          setServicesError('Failed to load services. Please try again.');
          return { StatusCode: 500, ResultSet: [] };
        }),
        fetchAllParts().catch(error => {
          console.error('Parts fetch error:', error);
          setPartsError('Failed to load parts. Please try again.');
          return { StatusCode: 500, ResultSet: [] };
        })
      ]);
      
      if (servicesResponse.StatusCode === 200) {
        setServices(servicesResponse.ResultSet || []);
        setServicesError(null);
      } else {
        setServicesError('Failed to load services');
        setServices([]);
      }
      
      if (partsResponse.StatusCode === 200) {
        setParts(partsResponse.ResultSet || []);
        setPartsError(null);
      } else {
        setPartsError('Failed to load parts');
        setParts([]);
      }
      
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred while loading data');
    } finally {
      setServicesLoading(false);
      setPartsLoading(false);
    }
  };

  const handleAddJobCardItem = () => {
    setCurrentJobCardItem(null);
    setIsModalVisible(true);
  };

  const handleEditJobCardItem = (item) => {
    setCurrentJobCardItem(item);
    setIsModalVisible(true);
  };

  const handleDeleteJobCardItem = async (item) => {
    if (!window.confirm('Are you sure you want to delete this job card item?')) {
      return;
    }

    try {
      setDeleteLoading(prev => ({...prev, [item.J_ItemID]: true}));
      
      const jobCardItemData = {
        J_ItemID: item.J_ItemID,
        J_JobCardID: item.J_JobCardID,
        J_ServiceID: item.J_ServiceID,
        J_PartID: item.J_PartID,
        J_Qty: item.J_Qty,
        J_Charge: item.J_Charge,
        Status: 'I'
      };
      
      await dispatch(DeleteJobCardItem(jobCardItemData));
      alert('Job card item deleted successfully');
      dispatch(GetAllJobCardItems());
    } catch (error) {
      alert('Failed to delete job card item');
    } finally {
      setDeleteLoading(prev => ({...prev, [item.J_ItemID]: false}));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const values = Object.fromEntries(formData.entries());
    
    try {
      setSubmitLoading(true);
      
      const jobCardItemData = {
        J_JobCardID: currentJobCardItem ? currentJobCardItem.J_JobCardID : values.jobCardId,
        J_ServiceID: values.serviceId,
        J_PartID: values.partId,
        J_Qty: values.quantity.toString(),
        J_Charge: currentJobCardItem ? currentJobCardItem.J_Charge : values.charge.toString(),
      };
      
      // For updates, include the J_ItemID
      if (currentJobCardItem) {
        jobCardItemData.J_ItemID = currentJobCardItem.J_ItemID;
        await dispatch(UpdateJobCardItem(jobCardItemData));
        alert('Job card item updated successfully');
      } else {
        await dispatch(AddJobCardItem(jobCardItemData));
        alert('Job card item added successfully');
      }
      
      setIsModalVisible(false);
      dispatch(GetAllJobCardItems());
    } catch (err) {
      console.error('Error:', err);
      alert(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleRefresh = () => {
    dispatch(GetAllJobCardItems());
    fetchServicesAndParts();
  };

  const formatCurrency = (value) => {
    return `Rs ${parseFloat(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  // Get service name by ID
  const getServiceName = (serviceId) => {
    const service = services.find(s => String(s?.S_ServiceID) === String(serviceId));
    return service?.S_ServiceName || 'Unknown Service';
  };

  // Get part name by ID
  const getPartName = (partId) => {
    const part = parts.find(p => String(p?.P_PartID) === String(partId));
    return part?.P_PartName || 'Unknown Part';
  };

  // Filter job card items based on search term
  const filteredJobCardItems = jobCardItems && jobCardItems.length > 0 
    ? jobCardItems.filter(item => {
        const matchesSearch = 
          item.J_JobCardID?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          getServiceName(item.J_ServiceID)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          getPartName(item.J_PartID)?.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesSearch;
      })
    : [];

  // Calculate statistics
  const totalItems = jobCardItems?.length || 0;
  const totalQuantity = jobCardItems?.reduce((total, item) => total + parseInt(item.J_Qty || 0), 0) || 0;
  const totalValue = jobCardItems?.reduce((total, item) => total + parseFloat(item.J_Charge || 0), 0) || 0;

  const StatCard = ({ title, value, icon, color, progress }) => (
    <div className="stat-card bg-white rounded-2xl shadow-lg border-0 p-4 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-medium text-gray-500 mb-1">{title}</div>
          <div className="text-xl font-bold text-gray-900">{value}</div>
          {progress !== undefined && (
            <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
              <div
                className={`h-1 rounded-full ${color}`}
                style={{ width: `${Math.round((value / Math.max(totalItems, 1)) * 100)}%` }}
              ></div>
            </div>
          )}
        </div>
        <div className={`p-2 rounded-full ${color} bg-opacity-10`}>
          {React.cloneElement(icon, {
            className: `text-lg ${color}`
          })}
        </div>
      </div>
    </div>
  );

  if (loading || servicesLoading || partsLoading) {
    return (
      <div className="h-full p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-600 text-base font-medium">
            {loading ? 'Loading job card items...' : 'Loading dropdown data...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full p-4 md:p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-md mx-auto text-center shadow-lg">
          <div className="h-12 w-12 text-red-500 mx-auto mb-4">
            <AlertCircle className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-600 text-base font-medium mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 text-base font-medium flex items-center mx-auto border-0"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-4 md:p-6">
      <div className="w-full space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg text-white p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Job Card Items Management</h1>
              <p className="text-blue-100">Manage and track all job card items efficiently</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-0 rounded-lg h-10 px-4 font-medium backdrop-blur-sm flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={handleAddJobCardItem}
                className="bg-white text-blue-600 rounded-lg hover:bg-blue-50 h-10 px-4 font-medium flex items-center border-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Items"
            value={totalItems}
            icon={<ClipboardList className="text-blue-600" />}
            color="text-blue-600"
            progress
          />
          <StatCard
            title="Filtered Items"
            value={filteredJobCardItems.length}
            icon={<Filter className="text-green-600" />}
            color="text-green-600"
            progress
          />
          <StatCard
            title="Total Quantity"
            value={totalQuantity}
            icon={<Package className="text-purple-600" />}
            color="text-purple-600"
            progress
          />
          <StatCard
            title="Total Value"
            value={formatCurrency(totalValue)}
            icon={<DollarSign className="text-orange-600" />}
            color="text-orange-600"
            progress
          />
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
            <div className="flex items-center">
              <Filter className="text-blue-600 text-base mr-2" />
              <span className="text-base font-semibold text-gray-900">Filters & Search</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by job card ID, service, or part..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              />
            </div>
          </div>

          <div className="mt-2">
            <span className="text-sm text-gray-600">
              Showing {filteredJobCardItems.length} of {totalItems} items
            </span>
          </div>
        </div>

        {/* Job Card Items Table */}
        <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Job Card Items List</h3>
              <span className="text-gray-500">{totalItems} items found</span>
            </div>
          </div>

          <div className="p-6">
            {filteredJobCardItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Item ID</th>
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Job Card ID</th>
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Service</th>
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Part</th>
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Quantity</th>
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Charge</th>
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobCardItems.map((item) => (
                      <tr key={item.J_ItemID} className="border-b border-gray-200 hover:bg-blue-50 transition-colors duration-200">
                        <td className="py-4 px-4 text-base font-medium text-gray-900">#{item.J_ItemID}</td>
                        <td className="py-4 px-4 text-base text-gray-700">#{item.J_JobCardID}</td>
                        <td className="py-4 px-4 text-base text-gray-700">
                          <div className="flex items-center">
                            <Wrench className="h-4 w-4 text-blue-500 mr-2" />
                            {getServiceName(item.J_ServiceID)}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-base text-gray-700">
                          <div className="flex items-center">
                            <Package className="h-4 w-4 text-green-500 mr-2" />
                            {getPartName(item.J_PartID)}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {item.J_Qty}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            {formatCurrency(item.J_Charge)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditJobCardItem(item)}
                              className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-100 transition-colors"
                              title="Edit item"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteJobCardItem(item)}
                              className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-100 transition-colors"
                              title="Delete item"
                              disabled={deleteLoading[item.J_ItemID]}
                            >
                              {deleteLoading[item.J_ItemID] ? (
                                <svg className="animate-spin h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
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
                <ClipboardList className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-base font-medium">
                  {jobCardItems && jobCardItems.length > 0
                    ? 'No items match your search criteria'
                    : 'No job card items found'}
                </p>
                {(!jobCardItems || jobCardItems.length === 0) && (
                  <button
                    onClick={handleAddJobCardItem}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 text-base font-medium flex items-center mx-auto mt-4 border-0"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Item
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Job Card Item Modal */}
        {isModalVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {currentJobCardItem ? 'Edit Job Card Item' : 'Add New Job Card Item'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {!currentJobCardItem && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-1">Job Card ID</label>
                      <input
                        name="jobCardId"
                        type="text"
                        placeholder="Enter job card ID"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-1">Charge (Rs)</label>
                      <input
                        name="charge"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Enter charge"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Service</label>
                    <select
                      name="serviceId"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    >
                      <option value="">Select service</option>
                      {Array.isArray(services) && services.filter(Boolean).map(service => (
                        <option key={service?.S_ServiceID} value={service?.S_ServiceID}>
                          {service?.S_ServiceName || ''}
                        </option>
                      ))}
                    </select>
                    {servicesError && (
                      <p className="text-red-500 text-sm mt-1">{servicesError}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Part</label>
                    <select
                      name="partId"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    >
                      <option value="">Select part</option>
                      {Array.isArray(parts) && parts.filter(Boolean).map(part => (
                        <option key={part?.P_PartID} value={part?.P_PartID}>
                          {part?.P_PartName || ''}
                        </option>
                      ))}
                    </select>
                    {partsError && (
                      <p className="text-red-500 text-sm mt-1">{partsError}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    name="quantity"
                    type="number"
                    min="1"
                    placeholder="Enter quantity"
                    defaultValue={currentJobCardItem?.J_Qty || 1}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  />
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
                    disabled={submitLoading || servicesLoading || partsLoading || !!servicesError || !!partsError}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 flex items-center text-base font-medium border-0"
                  >
                    {submitLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {currentJobCardItem ? 'Updating...' : 'Adding...'}
                      </>
                    ) : (
                      currentJobCardItem ? 'Update Item' : 'Add Item'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .stat-card {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        }
      `}</style>
    </div>
  );
};

export default JobCardItems;