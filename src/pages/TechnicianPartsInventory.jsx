import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Package, Search, Filter, Box, AlertTriangle, RefreshCw } from 'lucide-react';
import { GetAllPartsInventory } from '../actions/partsInventoryActions';
import { GetAllCategories } from '../actions/categoryActions';

const TechnicianPartsInventory = () => {
  const dispatch = useDispatch();
  const partsInventoryState = useSelector(state => state.partsInventory);
  const categoryState = useSelector(state => state.categoryList);
  const { loading, parts, error } = partsInventoryState;
  const { categories } = categoryState;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    dispatch(GetAllPartsInventory());
    dispatch(GetAllCategories());
  }, [dispatch]);

  // Format currency as Rs
  const formatCurrency = (value) => {
    return `Rs ${parseFloat(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  // Filter parts based on search term and category
  const filteredParts = parts && Array.isArray(parts) && parts.length > 0
    ? parts.filter(part => {
        const matchesSearch = 
          part?.P_PartName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          part?.P_CategoryName?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = !selectedCategory || part?.P_CategoryID === selectedCategory;

        return matchesSearch && matchesCategory;
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

  const handleRefresh = () => {
    dispatch(GetAllPartsInventory());
    dispatch(GetAllCategories());
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
              <h1 className="text-2xl font-bold text-white mb-2">Parts Inventory</h1>
              <p className="text-blue-100 text-base">View available parts and stock levels</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-0 rounded-lg h-10 px-4 text-sm font-medium backdrop-blur-sm flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
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
            
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              >
                <option value="">All Categories</option>
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
              <h2 className="text-xl font-bold text-gray-900">Available Parts</h2>
              <span className="text-gray-500 text-sm">{inventoryStats.totalParts} parts in inventory</span>
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
                      <th className="text-right py-3 px-4 text-gray-700 font-medium text-sm">Unit Price</th>
                      <th className="text-left py-3 px-4 text-gray-700 font-medium text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParts.filter(Boolean).map((part, idx) => {
                      const stockQty = parseInt(part?.P_StockQty || 0);
                      let stockColor = 'bg-green-100 text-green-800';
                      let statusText = 'In Stock';
                      
                      if (stockQty === 0) {
                        stockColor = 'bg-red-100 text-red-800';
                        statusText = 'Out of Stock';
                      } else if (stockQty < 10) {
                        stockColor = 'bg-amber-100 text-amber-800';
                        statusText = 'Low Stock';
                      }

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
                          <td className="py-3 px-4 text-right">
                            <span className="text-sm font-medium text-gray-900">
                              {parseFloat(part?.P_UnitPrice || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stockColor}`}>
                              {statusText}
                            </span>
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianPartsInventory;