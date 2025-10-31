import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  User,
  ChevronRight,
  Plus,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';

const TechnicianDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    scheduledJobs: 0,
    inProgress: 0,
    completedToday: 0,
    hoursWorked: 0
  });

  const [workOrders, setWorkOrders] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      // Simulate API calls
      setTimeout(() => {
        setStats({
          scheduledJobs: 6,
          inProgress: 2,
          completedToday: 4,
          hoursWorked: 6.5
        });

        setWorkOrders([
          { 
            id: 'WO-1001', 
            service: 'Brake Pad Replacement', 
            customer: 'John Smith', 
            vehicle: 'Toyota Camry 2018', 
            priority: 'high', 
            estimatedTime: '2.5 hours',
            status: 'in-progress'
          },
          { 
            id: 'WO-1002', 
            service: 'Oil Change', 
            customer: 'Sarah Johnson', 
            vehicle: 'Honda Accord 2020', 
            priority: 'medium', 
            estimatedTime: '1 hour',
            status: 'scheduled'
          },
          { 
            id: 'WO-1003', 
            service: 'Tire Rotation', 
            customer: 'Mike Brown', 
            vehicle: 'Ford F-150 2019', 
            priority: 'low', 
            estimatedTime: '45 mins',
            status: 'scheduled'
          }
        ]);

        setTodaySchedule([
          { time: '8:00 AM', task: 'Oil Change - Honda Accord', customer: 'John Doe', status: 'completed' },
          { time: '9:30 AM', task: 'Brake Service - Toyota Camry', customer: 'Sarah Smith', status: 'in-progress' },
          { time: '11:00 AM', task: 'Engine Diagnostic - Ford F-150', customer: 'Mike Johnson', status: 'scheduled' },
          { time: '2:00 PM', task: 'Tire Rotation - Nissan Altima', customer: 'Lisa Brown', status: 'scheduled' }
        ]);

        setLoading(false);
      }, 1000);
    };

    fetchData();
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  // Filter work orders based on search term
  const filteredWorkOrders = workOrders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.vehicle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="overview-header mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Technician Dashboard</h1>
        <p className="text-gray-600 mt-2">Today's tasks and schedule overview</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <div className="stat-card bg-white rounded-lg shadow p-5 border border-gray-200">
          <div className="flex justify-between items-start">
            <div className="stat-info">
              <h3 className="text-xl font-bold text-gray-900">{stats.scheduledJobs}</h3>
              <p className="text-sm font-medium text-gray-600">Scheduled Jobs</p>
            </div>
            <div className="stat-icon p-3 rounded-md bg-blue-500 text-white">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="stat-card bg-white rounded-lg shadow p-5 border border-gray-200">
          <div className="flex justify-between items-start">
            <div className="stat-info">
              <h3 className="text-xl font-bold text-gray-900">{stats.inProgress}</h3>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
            </div>
            <div className="stat-icon p-3 rounded-md bg-green-500 text-white">
              <Wrench className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="stat-card bg-white rounded-lg shadow p-5 border border-gray-200">
          <div className="flex justify-between items-start">
            <div className="stat-info">
              <h3 className="text-xl font-bold text-gray-900">{stats.completedToday}</h3>
              <p className="text-sm font-medium text-gray-600">Completed Today</p>
            </div>
            <div className="stat-icon p-3 rounded-md bg-purple-500 text-white">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="stat-card bg-white rounded-lg shadow p-5 border border-gray-200">
          <div className="flex justify-between items-start">
            <div className="stat-info">
              <h3 className="text-xl font-bold text-gray-900">{stats.hoursWorked}</h3>
              <p className="text-sm font-medium text-gray-600">Hours Worked</p>
            </div>
            <div className="stat-icon p-3 rounded-md bg-orange-500 text-white">
              <Clock className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="analytics-card bg-white rounded-lg shadow p-5 border border-gray-200 mb-8">
        <div className="card-header flex justify-between items-center mb-5">
          <h3 className="text-lg font-semibold text-gray-900">Filters & Search</h3>
          <Filter className="h-5 w-5 text-blue-600" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Work Orders</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by order ID, service, customer, or vehicle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-end space-x-2">
            <button
              onClick={handleRefresh}
              className="w-auto bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={() => {}}
              className="w-auto bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </button>
          </div>
        </div>
        <div className="mt-4 text-sm font-medium text-gray-600">
          Showing {filteredWorkOrders.length} of {workOrders.length} work orders
        </div>
      </div>

      {/* Work Orders and Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Work Orders */}
        <div className="analytics-card bg-white rounded-lg shadow p-5 border border-gray-200">
          <div className="card-header flex justify-between items-center mb-5">
            <h3 className="text-lg font-semibold text-gray-900">Current Work Orders</h3>
            <Wrench className="h-5 w-5 text-blue-600" />
          </div>
          
          {filteredWorkOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredWorkOrders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-blue-800 text-lg">{order.id}</p>
                      <p className="text-gray-900 text-lg">{order.service}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      order.priority === 'high' 
                        ? 'bg-red-100 text-red-800' 
                        : order.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {order.priority}
                    </span>
                  </div>
                  <div className="text-gray-700 space-y-1">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1 text-gray-500" />
                      <span>{order.customer}</span>
                    </div>
                    <p>{order.vehicle}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm">Est. Time: {order.estimatedTime}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        order.status === 'in-progress' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {workOrders.length > 0 
                  ? 'No work orders match your search criteria' 
                  : 'No work orders found'}
              </p>
            </div>
          )}
        </div>

        {/* Today's Schedule */}
        <div className="analytics-card bg-white rounded-lg shadow p-5 border border-gray-200">
          <div className="card-header flex justify-between items-center mb-5">
            <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div className="space-y-4">
            {todaySchedule.map((item, index) => (
              <div key={index} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  item.status === 'completed' ? 'bg-green-500' :
                  item.status === 'in-progress' ? 'bg-yellow-500' : 'bg-gray-300'
                }`}></div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">{item.time}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      item.status === 'completed' ? 'bg-green-100 text-green-800' :
                      item.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {item.status.replace('-', ' ')}
                    </span>
                  </div>
                  <p className="text-gray-900 font-medium">{item.task}</p>
                  <p className="text-sm text-gray-700">{item.customer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="analytics-card bg-white rounded-lg shadow p-5 border border-gray-200 mt-8">
        <div className="card-header flex justify-between items-center mb-5">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center text-sm font-medium">
            <Wrench className="h-4 w-4 mr-2" />
            Start Work Order
          </button>
          <button className="bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center text-sm font-medium">
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark Complete
          </button>
          <button className="bg-orange-500 text-white px-4 py-3 rounded-md hover:bg-orange-600 transition-colors flex items-center justify-center text-sm font-medium">
            <AlertCircle className="h-4 w-4 mr-2" />
            Report Issue
          </button>
          <button className="bg-gray-600 text-white px-4 py-3 rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center text-sm font-medium">
            <Clock className="h-4 w-4 mr-2" />
            Log Time
          </button>
        </div>
      </div>
    </div>
  );
};

export default TechnicianDashboard;