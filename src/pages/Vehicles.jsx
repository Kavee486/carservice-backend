import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Car, Plus, Search, Filter, Edit3, Trash2, RefreshCw, User, Lock, Users, Calendar, Car as CarIcon } from 'lucide-react';
import { GetAllVehicles, AddVehicle, UpdateVehicle, DeleteVehicle } from '../actions/vehicleActions';

const Vehicles = () => {
  const dispatch = useDispatch();
  const vehicleList = useSelector(state => state.vehicleList);
  const { loading, vehicles, error } = vehicleList;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(GetAllVehicles());
  }, [dispatch]);

  const handleAddVehicle = () => {
    setCurrentVehicle(null);
    setIsModalVisible(true);
  };

  const handleEditVehicle = (vehicle) => {
    setCurrentVehicle(vehicle);
    setIsModalVisible(true);
  };

  const handleDeleteVehicle = async (vehicle) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) {
      return;
    }

    try {
      setDeleteLoading(prev => ({ ...prev, [vehicle.V_VehicleID]: true }));

      const vehicleData = {
        V_VehicleID: vehicle.V_VehicleID.toString(),
        V_CustomerID: vehicle.V_CustomerID,
        V_PlateNumber: vehicle.V_PlateNumber,
        V_Make: vehicle.V_Make,
        V_Model: vehicle.V_Model,
        V_Year: vehicle.V_Year,
        V_VIN: vehicle.V_VIN
      };

      await dispatch(DeleteVehicle(vehicleData));
      alert('Vehicle deleted successfully');

    } catch (error) {
      alert('Failed to delete vehicle');
    } finally {
      setDeleteLoading(prev => ({ ...prev, [vehicle.V_VehicleID]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const values = Object.fromEntries(formData.entries());

    try {
      setSubmitLoading(true);

      const vehicleData = {
        V_CustomerID: values.customerId,
        V_PlateNumber: values.plateNumber,
        V_Make: values.make,
        V_Model: values.model,
        V_Year: values.year.toString(),
      };

      if (currentVehicle) {
        vehicleData.V_VehicleID = currentVehicle.V_VehicleID;
        vehicleData.V_PlateNumber = currentVehicle.V_PlateNumber;
        // For updates, use the existing VIN from current vehicle
        vehicleData.V_VIN = currentVehicle.V_VIN;
        await dispatch(UpdateVehicle(vehicleData));
        alert('Vehicle updated successfully');
      } else {
        // For new vehicles, VIN is not required from frontend
        vehicleData.V_VIN = ''; // Or generate on backend if needed
        await dispatch(AddVehicle(vehicleData));
        alert('Vehicle added successfully');
      }

      setIsModalVisible(false);
    } catch (err) {
      console.error('Error:', err);
      alert(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleRefresh = () => {
    dispatch(GetAllVehicles());
  };

  // Filter vehicles based on search term (remove VIN from search)
  const filteredVehicles = vehicles && vehicles.length > 0
    ? vehicles.filter(vehicle => {
      const matchesSearch =
        vehicle.V_PlateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.V_Make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.V_Model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.V_Year?.toString().includes(searchTerm) ||
        vehicle.V_CustomerID?.toString().includes(searchTerm) ||
        vehicle.V_CustomerName?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    })
    : [];

  // Calculate statistics
  const vehicleStats = {
    total: vehicles?.length || 0,
    recent: vehicles?.filter(v => v.V_Year >= 2020).length || 0,
    uniqueCustomers: new Set(vehicles?.map(v => v.V_CustomerID)).size || 0
  };

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
                style={{ width: `${Math.round((value / Math.max(vehicleStats.total, 1)) * 100)}%` }}
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-600 text-base font-medium">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-md mx-auto text-center shadow-lg">
          <div className="h-12 w-12 text-red-500 mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
            </svg>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 md:px-6 py-4 md:py-6">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg text-white p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Vehicle Management</h1>
              <p className="text-blue-100">Manage and track all customer vehicles efficiently</p>
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
                onClick={handleAddVehicle}
                className="bg-white text-blue-600 rounded-lg hover:bg-blue-50 h-10 px-4 font-medium flex items-center border-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Vehicles"
            value={vehicleStats.total}
            icon={<CarIcon className="text-blue-600" />}
            color="text-blue-600"
            progress
          />
          <StatCard
            title="Recent Models (2020+)"
            value={vehicleStats.recent}
            icon={<Calendar className="text-green-600" />}
            color="text-green-600"
            progress
          />
          <StatCard
            title="Unique Customers"
            value={vehicleStats.uniqueCustomers}
            icon={<Users className="text-purple-600" />}
            color="text-purple-600"
            progress
          />
        </div>

        {/* Filters and Search - Updated placeholder */}
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
                placeholder="Search by plate, year, make, model, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              />
            </div>
          </div>

          <div className="mt-2">
            <span className="text-sm text-gray-600">
              Showing {filteredVehicles.length} of {vehicleStats.total} vehicles
            </span>
          </div>
        </div>

        {/* Vehicles Table */}
        <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Vehicle List</h3>
              <span className="text-gray-500">{vehicleStats.total} vehicles found</span>
            </div>
          </div>

          <div className="p-6">
            {filteredVehicles.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Plate Number</th>
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Make</th>
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Model</th>
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Year</th>
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Customer</th>
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVehicles.map((vehicle) => (
                      <tr key={vehicle.V_VehicleID} className="border-b border-gray-200 hover:bg-blue-50 transition-colors duration-200">
                        <td className="py-4 px-4 text-base font-medium text-gray-900">{vehicle.V_PlateNumber}</td>
                        <td className="py-4 px-4 text-base text-gray-700">{vehicle.V_Make}</td>
                        <td className="py-4 px-4 text-base text-gray-700">{vehicle.V_Model}</td>
                        <td className="py-4 px-4 text-base text-gray-700">{vehicle.V_Year}</td>
                        <td className="py-4 px-4 text-base text-gray-700">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-gray-400" />
                            {vehicle.V_CustomerName || `Customer #${vehicle.V_CustomerID}`}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditVehicle(vehicle)}
                              className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-100 transition-colors"
                              title="Edit vehicle"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteVehicle(vehicle)}
                              className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-100 transition-colors"
                              title="Delete vehicle"
                              disabled={deleteLoading[vehicle.V_VehicleID]}
                            >
                              {deleteLoading[vehicle.V_VehicleID] ? (
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
                <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-base font-medium">
                  {vehicles && vehicles.length > 0
                    ? 'No vehicles match your search criteria'
                    : 'No vehicles found'}
                </p>
                {(!vehicles || vehicles.length === 0) && (
                  <button
                    onClick={handleAddVehicle}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 text-base font-medium flex items-center mx-auto mt-4 border-0"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Vehicle
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Vehicle Modal */}
        {isModalVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {currentVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Plate Number Field */}
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">
                      Plate Number
                      {currentVehicle && (
                        <span className="ml-2 text-sm text-orange-600 flex items-center">
                          <Lock className="h-3 w-3 mr-1" />
                          Cannot be changed
                        </span>
                      )}
                    </label>
                    {currentVehicle ? (
                      <div className="relative">
                        <input
                          name="plateNumber"
                          type="text"
                          value={currentVehicle.V_PlateNumber}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed text-base"
                        />
                        <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    ) : (
                      <input
                        name="plateNumber"
                        type="text"
                        placeholder="Enter plate number"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Customer ID</label>
                    <input
                      name="customerId"
                      type="text"
                      placeholder="Enter customer ID"
                      defaultValue={currentVehicle?.V_CustomerID}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Make</label>
                    <input
                      name="make"
                      type="text"
                      placeholder="Enter vehicle make"
                      defaultValue={currentVehicle?.V_Make}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Model</label>
                    <input
                      name="model"
                      type="text"
                      placeholder="Enter vehicle model"
                      defaultValue={currentVehicle?.V_Model}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Year</label>
                    <input
                      name="year"
                      type="number"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      placeholder="Enter year"
                      defaultValue={currentVehicle?.V_Year}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    />
                  </div>
                </div>

                {currentVehicle && currentVehicle.V_CustomerName && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-base text-blue-700">
                      <strong>Customer:</strong> {currentVehicle.V_CustomerName}
                    </p>
                  </div>
                )}

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
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 flex items-center text-base font-medium border-0"
                  >
                    {submitLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {currentVehicle ? 'Updating...' : 'Adding...'}
                      </>
                    ) : (
                      currentVehicle ? 'Update Vehicle' : 'Add Vehicle'
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

export default Vehicles;