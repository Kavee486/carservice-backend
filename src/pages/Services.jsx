import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Wrench, Plus, Search, Filter, Edit3, Trash2, RefreshCw, DollarSign, Clock, Zap } from 'lucide-react';
import { GetAllServices, AddService, UpdateService, DeleteService } from '../actions/serviceActions';

const Services = () => {
  const dispatch = useDispatch();
  const serviceList = useSelector(state => state.serviceList);
  const { loading, services, error } = serviceList;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(GetAllServices());
  }, [dispatch]);

  const handleAddService = () => {
    setCurrentService(null);
    setIsModalVisible(true);
  };

  const handleEditService = (service) => {
    setCurrentService(service);
    setIsModalVisible(true);
  };

  const handleDeleteService = async (service) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      setDeleteLoading(prev => ({ ...prev, [service.S_ServiceID]: true }));

      const serviceData = {
        S_ServiceID: service.S_ServiceID,
        S_ServiceName: service.S_ServiceName,
        S_Description: service.S_Description,
        S_BaseCharge: service.S_BaseCharge,
        S_Time: service.S_Time,
        S_Status: 'I'
      };

      await dispatch(DeleteService(serviceData));
      alert('Service deleted successfully');
      dispatch(GetAllServices());
    } catch (error) {
      alert('Failed to delete service');
    } finally {
      setDeleteLoading(prev => ({ ...prev, [service.S_ServiceID]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const values = Object.fromEntries(formData.entries());

    try {
      setSubmitLoading(true);

      const serviceData = {
        S_ServiceName: values.name,
        S_Description: values.description,
        S_Time: values.time,
        S_BaseCharge: values.baseCharge.toString(),
      };

      if (currentService) {
        serviceData.S_ServiceID = currentService.S_ServiceID;
        await dispatch(UpdateService(currentService.S_ServiceID, serviceData));
        alert('Service updated successfully');
      } else {
        await dispatch(AddService(serviceData));
        alert('Service added successfully');
      }

      setIsModalVisible(false);
      dispatch(GetAllServices());
    } catch (err) {
      console.error('Error:', err);
      alert(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleRefresh = () => {
    dispatch(GetAllServices());
  };

  // Format currency as number only
  const formatCurrency = (value) => {
    return parseFloat(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Format time display
  const formatTime = (time) => {
    if (!time) return '—';

    if (/^\d{1,2}:\d{2}$/.test(time)) {
      return time;
    }

    const minutes = parseInt(time);
    if (!isNaN(minutes)) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;

      if (hours > 0) {
        return `${hours}h ${remainingMinutes}m`;
      }
      return `${minutes}m`;
    }

    return time;
  };

  // Filter services based on search term
  const filteredServices = services && services.length > 0
    ? services.filter(service => {
      const matchesSearch =
        service.S_ServiceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.S_Description?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    })
    : [];

  // Calculate statistics - FIXED: No circular dependency
  const totalServices = services?.length || 0;
  const totalValue = services?.reduce((total, service) => total + parseFloat(service.S_BaseCharge || 0), 0) || 0;
  const totalTime = services?.reduce((total, service) => total + (parseInt(service.S_Time) || 0), 0) || 0;
  const averageTime = totalServices > 0 ? Math.round(totalTime / totalServices) : 0;

  const serviceStats = {
    total: totalServices,
    totalValue: totalValue,
    totalTime: totalTime,
    averageTime: averageTime
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-600 text-base font-medium">Loading services...</p>
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
              <h1 className="text-2xl font-bold text-white mb-2">Service Management</h1>
              <p className="text-blue-100">Manage and track all auto repair services efficiently</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg h-10 px-4 font-medium flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={handleAddService}
                className="bg-white text-blue-600 rounded-lg hover:bg-blue-50 h-10 px-4 font-medium flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </button>
            </div>
          </div>
        </div>

        

        {/* Filters and Search - Reduced height */}
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
                placeholder="Search by service name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              />
            </div>
          </div>

          <div className="mt-2">
            <span className="text-sm text-gray-600">
              Showing {filteredServices.length} of {serviceStats.total} services
            </span>
          </div>
        </div>

        {/* Services Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Service List</h3>
              <span className="text-gray-500">{serviceStats.total} services found</span>
            </div>
          </div>

          <div className="p-6">
            {filteredServices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Service Name</th>
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Description</th>
                      <th className="text-right py-4 px-4 text-gray-700 font-medium text-sm">Base Charge (Rs)</th>
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Time</th>
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredServices.map((service) => (
                      <tr key={service.S_ServiceID} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-4 px-4 text-base font-medium text-gray-900">{service.S_ServiceName}</td>
                        <td className="py-4 px-4 text-base text-gray-700">
                          <div className="bg-gray-50 rounded-lg p-3 max-w-md">
                            <p className="text-sm leading-relaxed text-gray-600">{service.S_Description || '—'}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 justify-end">
                            {formatCurrency(service.S_BaseCharge)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTime(service.S_Time)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditService(service)}
                              className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-100"
                              title="Edit service"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteService(service)}
                              className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-100"
                              title="Delete service"
                              disabled={deleteLoading[service.S_ServiceID]}
                            >
                              {deleteLoading[service.S_ServiceID] ? (
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
                <Wrench className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-base font-medium">
                  {services && services.length > 0
                    ? 'No services match your search criteria'
                    : 'No services found'}
                </p>
                {(!services || services.length === 0) && (
                  <button
                    onClick={handleAddService}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-base font-medium flex items-center mx-auto mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Service
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Service Modal */}
        {isModalVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {currentService ? 'Edit Service' : 'Add New Service'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-base font-medium text-gray-700 mb-1">Service Name</label>
                    <input
                      name="name"
                      type="text"
                      placeholder="Enter service name"
                      defaultValue={currentService?.S_ServiceName}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-base font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      placeholder="Enter service description"
                      rows={3}
                      defaultValue={currentService?.S_Description}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Base Charge</label>
                    <input
                      name="baseCharge"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter base charge"
                      defaultValue={currentService?.S_BaseCharge}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Time (minutes)</label>
                    <input
                      name="time"
                      type="number"
                      min="0"
                      placeholder="Enter time in minutes"
                      defaultValue={currentService?.S_Time}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    />
                    <p className="text-xs text-gray-500 mt-1">Estimated time required in minutes</p>
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
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center text-base font-medium"
                  >
                    {submitLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {currentService ? 'Updating...' : 'Adding...'}
                      </>
                    ) : (
                      currentService ? 'Update Service' : 'Add Service'
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

export default Services;