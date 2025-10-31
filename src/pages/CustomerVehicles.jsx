import React from 'react';
import { Car } from 'lucide-react';

const CustomerVehicles = () => {
  return (
    <div className="h-full p-4 md:p-6">
      <div className="w-full space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg text-white p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">My Vehicles</h1>
              <p className="text-blue-100">Manage and track your vehicles</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">My Vehicles</h3>
            <p className="text-gray-500 mb-4">
              Vehicle management functionality will be implemented here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerVehicles;