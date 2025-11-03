import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Package, Plus, Search, Filter, Edit3, Trash2, RefreshCw, AlertTriangle, Box, List } from 'lucide-react';
import {
  GetAllPartsInventory,
  AddPartInventory,
  UpdatePartInventory,
  DeletePartInventory,
} from '../actions/partsInventoryActions';
import { GetAllCategories } from '../actions/categoryActions';

const PartsInventory = () => {
  const dispatch = useDispatch();
  const partsInventoryState = useSelector(state => state.partsInventory);
  const categoryState = useSelector(state => state.categoryList);
  const { loading, parts, error } = partsInventoryState;
  const { categories, loading: categoriesLoading } = categoryState;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isBulkModalVisible, setIsBulkModalVisible] = useState(false);
  const [currentPart, setCurrentPart] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [bulkSubmitLoading, setBulkSubmitLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [bulkParts, setBulkParts] = useState([{
    name: '',
    categoryId: '',
    stockQty: '',
    unitPrice: ''
  }]);

  // Debug: Log parts data to see what's actually coming from API
  useEffect(() => {
    if (parts && Array.isArray(parts)) {
      console.log('Parts data:', parts);
      if (parts.length > 0) {
        console.log('First part object:', parts[0]);
        console.log('Available keys in first part:', Object.keys(parts[0]));
      }
    }
  }, [parts]);

  useEffect(() => {
    dispatch(GetAllPartsInventory());
    dispatch(GetAllCategories());
  }, [dispatch]);

  const handleAddPart = () => {
    setCurrentPart(null);
    setIsModalVisible(true);
  };

  const handleBulkAddPart = () => {
    setBulkParts([{
      name: '',
      categoryId: '',
      stockQty: '',
      unitPrice: ''
    }]);
    setIsBulkModalVisible(true);
  };

  const handleEditPart = (part) => {
    setCurrentPart(part);
    setIsModalVisible(true);
  };

  const handleDeletePart = async (part) => {
    if (!window.confirm('Are you sure you want to delete this part?')) {
      return;
    }

    try {
      setDeleteLoading(prev => ({ ...prev, [part.P_PartID]: true }));
      await dispatch(DeletePartInventory(part.P_PartID));
      alert('Part deleted successfully');
    } catch (error) {
      alert('Failed to delete part');
    } finally {
      setDeleteLoading(prev => ({ ...prev, [part.P_PartID]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const values = Object.fromEntries(formData.entries());

    try {
      setSubmitLoading(true);

      const partData = {
        P_PartName: values.name,
        P_StockQty: values.stockQty,
        P_UnitPrice: values.unitPrice,
        P_CategoryID: values.categoryId
      };

      if (currentPart) {
        partData.P_PartID = currentPart.P_PartID;
        await dispatch(UpdatePartInventory(partData));
        alert('Part updated successfully');
      } else {
        await dispatch(AddPartInventory(partData));
        alert('Part added successfully');
      }

      setIsModalVisible(false);
      dispatch(GetAllPartsInventory());
    } catch (err) {
      console.error('Error:', err);
      alert(err.response?.data?.Message || err.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();

    // Validate bulk parts
    const validParts = bulkParts.filter(part =>
      part.name.trim() &&
      part.categoryId &&
      part.stockQty &&
      part.unitPrice
    );

    if (validParts.length === 0) {
      alert('Please add at least one valid part with all fields filled out.');
      return;
    }

    try {
      setBulkSubmitLoading(true);
      let successCount = 0;
      let errorCount = 0;

      // Add each part individually
      for (const part of validParts) {
        try {
          const partData = {
            P_PartName: part.name,
            P_StockQty: part.stockQty,
            P_UnitPrice: part.unitPrice.toString(),
            P_CategoryID: part.categoryId
          };

          await dispatch(AddPartInventory(partData));
          successCount++;
        } catch (error) {
          console.error('Error adding part:', part.name, error);
          errorCount++;
        }
      }

      setIsBulkModalVisible(false);

      if (errorCount === 0) {
        alert(`Successfully added ${successCount} part(s)!`);
      } else {
        alert(`Added ${successCount} part(s) successfully. ${errorCount} part(s) failed to add.`);
      }

      dispatch(GetAllPartsInventory());
    } catch (err) {
      console.error('Error in bulk add:', err);
      alert('Something went wrong while adding parts');
    } finally {
      setBulkSubmitLoading(false);
    }
  };

  const addBulkPartField = () => {
    setBulkParts([...bulkParts, {
      name: '',
      categoryId: '',
      stockQty: '',
      unitPrice: ''
    }]);
  };

  const removeBulkPartField = (index) => {
    if (bulkParts.length > 1) {
      const updatedParts = bulkParts.filter((_, i) => i !== index);
      setBulkParts(updatedParts);
    }
  };

  const updateBulkPartField = (index, field, value) => {
    const updatedParts = [...bulkParts];
    updatedParts[index][field] = value;
    setBulkParts(updatedParts);
  };

  const handleRefresh = () => {
    dispatch(GetAllPartsInventory());
    dispatch(GetAllCategories());
  };

  // Format currency as Rs
  const formatCurrency = (value) => {
    return `Rs ${parseFloat(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  // Filter parts based on search term
  const filteredParts = parts && Array.isArray(parts) && parts.length > 0
    ? parts.filter(part => {
      const matchesSearch =
        part?.P_PartName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part?.P_CategoryName?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    })
    : [];

  // Calculate inventory stats
  const totalParts = parts?.length || 0;
  const lowStock = parts?.filter(part => parseInt(part?.P_StockQty || 0) < 10 && parseInt(part?.P_StockQty || 0) > 0).length || 0;
  const outOfStock = parts?.filter(part => parseInt(part?.P_StockQty || 0) === 0).length || 0;
  const totalValue = parts?.reduce((total, part) => total + (parseFloat(part?.P_UnitPrice || 0) * parseInt(part?.P_StockQty || 0)), 0) || 0;

  const inventoryStats = {
    totalParts: totalParts,
    lowStock: lowStock,
    outOfStock: outOfStock,
    totalValue: totalValue
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-600 text-base font-medium">Loading parts inventory...</p>
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
              <h1 className="text-2xl font-bold text-white mb-2">Parts Inventory Management</h1>
              <p className="text-blue-100 text-base">Manage and track all auto repair parts efficiently</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-0 rounded-lg h-10 px-4 text-sm font-medium backdrop-blur-sm flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={handleBulkAddPart}
                className="bg-white text-blue-600 rounded-lg hover:bg-blue-50 h-10 px-4 text-sm font-medium flex items-center border-0"
              >
                <List className="h-4 w-4 mr-2" />
                Add Parts
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Total Parts Card */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Total Parts</div>
                <div className="text-xl font-bold text-gray-900">{inventoryStats.totalParts}</div>
              </div>
              <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                <Package className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Low Stock Card */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Low Stock</div>
                <div className="text-xl font-bold text-gray-900">{inventoryStats.lowStock}</div>
              </div>
              <div className="p-2 rounded-full bg-amber-100 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Out of Stock Card */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Out of Stock</div>
                <div className="text-xl font-bold text-gray-900">{inventoryStats.outOfStock}</div>
              </div>
              <div className="p-2 rounded-full bg-red-100 text-red-600">
                <Box className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Total Value Card */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Total Value</div>
                <div className="text-xl font-bold text-gray-900">{formatCurrency(inventoryStats.totalValue)}</div>
              </div>
              <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                <span className="text-lg font-bold">Rs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg border-0 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex items-center">
              <Filter className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-base font-medium text-gray-900">Filters & Search</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search parts by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              />
            </div>
          </div>
          
          <div className="mt-3">
            <span className="text-xs font-medium text-gray-600">
              Showing {filteredParts.length} of {inventoryStats.totalParts} parts
            </span>
          </div>
        </div>

        {/* Parts Table */}
        <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Parts List</h2>
              <span className="text-gray-500 text-sm">{inventoryStats.totalParts} parts found</span>
            </div>
          </div>

          <div className="p-6">
            {filteredParts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-3 px-4 text-gray-700 font-medium text-sm">Part Name</th>
                      <th className="text-left py-3 px-4 text-gray-700 font-medium text-sm">Category</th>
                      <th className="text-left py-3 px-4 text-gray-700 font-medium text-sm">Stock Quantity</th>
                      <th className="text-left py-3 px-4 text-gray-700 font-medium text-sm">Unit Price (Rs)</th>
                      <th className="text-left py-3 px-4 text-gray-700 font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParts.filter(Boolean).map((part, idx) => {
                      const stockQty = parseInt(part?.P_StockQty || 0);
                      let stockColor = 'bg-green-100 text-green-800';
                      if (stockQty === 0) stockColor = 'bg-red-100 text-red-800';
                      else if (stockQty < 10) stockColor = 'bg-amber-100 text-amber-800';

                      return (
                        <tr key={part?.P_PartID || idx} className="border-b border-gray-200 hover:bg-blue-50 transition-colors duration-200">
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">{part?.P_PartName || '-'}</td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {part?.P_CategoryName || 'No Category'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stockColor}`}>
                              {stockQty}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {formatCurrency(part?.P_UnitPrice)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditPart(part)}
                                className="text-blue-600 hover:text-blue-800 p-1 rounded-lg hover:bg-blue-100 transition-colors"
                                title="Edit part"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePart(part)}
                                className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-100 transition-colors"
                                title="Delete part"
                                disabled={deleteLoading[part?.P_PartID]}
                              >
                                {deleteLoading[part?.P_PartID] ? (
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-base font-medium mb-4">
                  {parts && parts.length > 0
                    ? 'No parts match your search criteria'
                    : 'No parts found in inventory'}
                </p>
                {(!parts || parts.length === 0) && (
                  <div className="flex space-x-3 justify-center">
                    <button
                      onClick={handleAddPart}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 text-base font-medium flex items-center border-0"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Part
                    </button>
                    <button
                      onClick={handleBulkAddPart}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 text-base font-medium flex items-center border-0"
                    >
                      <List className="h-4 w-4 mr-2" />
                      Bulk Add Parts
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Part Modal */}
        {isModalVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {currentPart ? 'Edit Part' : 'Add New Part'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-base font-medium text-gray-700 mb-1">Part Name</label>
                    <input
                      name="name"
                      type="text"
                      placeholder="Enter part name"
                      defaultValue={currentPart?.P_PartName}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Category</label>
                    <select
                      name="categoryId"
                      required
                      defaultValue={currentPart?.P_CategoryID || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    >
                      <option value="">Select Category</option>
                      {categories && categories.map((category) => (
                        <option
                          key={category.C_CategoryID}
                          value={category.C_CategoryID}
                        >
                          {category.C_CategoryName}
                        </option>
                      ))}
                    </select>
                    {categoriesLoading && (
                      <p className="text-sm text-gray-500 mt-1">Loading categories...</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Stock Quantity</label>
                    <input
                      name="stockQty"
                      type="number"
                      min="0"
                      placeholder="Enter stock quantity"
                      defaultValue={currentPart?.P_StockQty}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Unit Price (Rs)</label>
                    <input
                      name="unitPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter unit price"
                      defaultValue={currentPart?.P_UnitPrice}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
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
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 flex items-center text-base font-medium border-0"
                  >
                    {submitLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {currentPart ? 'Updating...' : 'Adding...'}
                      </>
                    ) : (
                      currentPart ? 'Update Part' : 'Add Part'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bulk Add Parts Modal */}
        {isBulkModalVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Bulk Add Parts
              </h3>

              <form onSubmit={handleBulkSubmit} className="space-y-4">
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Add multiple parts at once. Fill out the details for each part below.
                  </p>
                </div>

                <div className="space-y-6 max-h-96 overflow-y-auto p-2">
                  {bulkParts.map((part, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-gray-700">Part #{index + 1}</h4>
                        {bulkParts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeBulkPartField(index)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Part Name</label>
                          <input
                            type="text"
                            placeholder="Enter part name"
                            value={part.name}
                            onChange={(e) => updateBulkPartField(index, 'name', e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                          <select
                            value={part.categoryId}
                            onChange={(e) => updateBulkPartField(index, 'categoryId', e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          >
                            <option value="">Select Category</option>
                            {categories && categories.map((category) => (
                              <option
                                key={category.C_CategoryID}
                                value={category.C_CategoryID}
                              >
                                {category.C_CategoryName}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="Enter stock quantity"
                            value={part.stockQty}
                            onChange={(e) => updateBulkPartField(index, 'stockQty', e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (Rs)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Enter unit price"
                            value={part.unitPrice}
                            onChange={(e) => updateBulkPartField(index, 'unitPrice', e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-4">
                  <button
                    type="button"
                    onClick={addBulkPartField}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 text-sm font-medium flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Another Part
                  </button>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsBulkModalVisible(false)}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 text-base font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={bulkSubmitLoading}
                      className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 flex items-center text-base font-medium border-0"
                    >
                      {bulkSubmitLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Adding {bulkParts.length} Parts...
                        </>
                      ) : (
                        `Add ${bulkParts.length} Part(s)`
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartsInventory;