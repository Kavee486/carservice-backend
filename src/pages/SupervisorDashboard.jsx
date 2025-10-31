import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Shield, Users, Calendar, ClipboardList } from 'lucide-react';

const SupervisorDashboardContent = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="col-span-1 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-sm opacity-90">Team Overview</div>
              <div className="text-2xl font-bold mt-1">12 Members</div>
            </div>
          </div>
        </div>

        <div className="col-span-1 bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Active Supervisors</div>
              <div className="text-xl font-semibold">3</div>
            </div>
          </div>
        </div>

        <div className="col-span-1 bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Open Tasks</div>
              <div className="text-xl font-semibold">8</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Inspections</h3>
          <ul className="space-y-3">
            <li className="flex items-start justify-between">
              <div>
                <div className="font-medium">Inspection #C-2025-001</div>
                <div className="text-sm text-gray-500">Completed by Tech A</div>
              </div>
              <div className="text-sm text-green-600 font-semibold">OK</div>
            </li>
            <li className="flex items-start justify-between">
              <div>
                <div className="font-medium">Inspection #C-2025-002</div>
                <div className="text-sm text-gray-500">Pending review</div>
              </div>
              <div className="text-sm text-amber-600 font-semibold">Review</div>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-3">
            <button className="w-full text-left p-3 rounded-lg border border-gray-100 hover:shadow-sm flex items-center space-x-3">
              <ClipboardList className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Review Job Cards</span>
            </button>
            <button className="w-full text-left p-3 rounded-lg border border-gray-100 hover:shadow-sm flex items-center space-x-3">
              <Users className="w-5 h-5 text-purple-600" />
              <span className="font-medium">Manage Team</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SupervisorDashboard = () => {
  return (
    <DashboardLayout title="Supervisor Dashboard">
      <SupervisorDashboardContent />
    </DashboardLayout>
  );
};

export default SupervisorDashboard;
