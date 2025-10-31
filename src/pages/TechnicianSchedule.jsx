import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, Wrench, ChevronDown, ChevronUp, User, Car, MapPin, Phone, Mail, Filter, Search, Plus } from 'lucide-react';

const TechnicianSchedule = () => {
  const [schedule, setSchedule] = useState([
    {
      id: 1,
      customer: 'John Smith',
      vehicle: 'Toyota Camry 2020',
      service: 'Oil Change',
      date: '2023-06-15',
      time: '09:00 AM',
      status: 'pending',
      notes: 'Synthetic oil requested',
      contact: {
        phone: '(555) 123-4567',
        email: 'john.smith@example.com'
      },
      
    },
    {
      id: 2,
      customer: 'Sarah Johnson',
      vehicle: 'Honda Accord 2018',
      service: 'Brake Inspection',
      date: '2023-06-15',
      time: '11:30 AM',
      status: 'in-progress',
      notes: 'Squeaking noise reported',
      contact: {
        phone: '(555) 987-6543',
        email: 'sarahj@example.com'
      },
     
    },
    {
      id: 3,
      customer: 'Mike Brown',
      vehicle: 'Ford F-150 2021',
      service: 'Tire Rotation',
      date: '2023-06-15',
      time: '02:00 PM',
      status: 'completed',
      notes: 'Include wheel balancing',
      contact: {
        phone: '(555) 456-7890',
        email: 'mike.brown@example.com'
      },
      
    },
    {
      id: 4,
      customer: 'Lisa Williams',
      vehicle: 'Nissan Altima 2019',
      service: 'AC Repair',
      date: '2023-06-16',
      time: '10:00 AM',
      status: 'pending',
      notes: 'Not cooling properly',
      contact: {
        phone: '(555) 234-5678',
        email: 'lisa.w@example.com'
      },
      
    }
  ]);

  const [expandedId, setExpandedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const updateStatus = (id, newStatus) => {
    setSchedule(schedule.map(item => 
      item.id === id ? {...item, status: newStatus} : item
    ));
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <Clock className="h-4 w-4 mr-1" />;
      case 'in-progress': return <Wrench className="h-4 w-4 mr-1" />;
      case 'completed': return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'cancelled': return <XCircle className="h-4 w-4 mr-1" />;
      default: return <Clock className="h-4 w-4 mr-1" />;
    }
  };

  // Filter schedule based on search term and status
  const filteredSchedule = schedule
    .filter(item => {
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      const matchesSearch = 
        item.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.vehicle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.service?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      return new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time);
    });

  return (
    <div className="h-full p-6">
      <div className="w-full">
        {/* Header */}
        <div className="overview-header mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Technician Schedule</h1>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <div className="stat-card bg-white rounded-lg shadow p-5 border border-gray-200">
            <div className="flex justify-between items-start">
              <div className="stat-info">
                <h3 className="text-xl font-bold text-gray-900">{schedule.length}</h3>
                <p className="text-sm font-medium text-gray-600">Total Appointments</p>
              </div>
              <div className="stat-icon p-3 rounded-md bg-blue-500 text-white">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="stat-card bg-white rounded-lg shadow p-5 border border-gray-200">
            <div className="flex justify-between items-start">
              <div className="stat-info">
                <h3 className="text-xl font-bold text-yellow-600">
                  {schedule.filter(item => item.status === 'pending').length}
                </h3>
                <p className="text-sm font-medium text-gray-600">Pending</p>
              </div>
              <div className="stat-icon p-3 rounded-md bg-yellow-500 text-white">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="stat-card bg-white rounded-lg shadow p-5 border border-gray-200">
            <div className="flex justify-between items-start">
              <div className="stat-info">
                <h3 className="text-xl font-bold text-blue-600">
                  {schedule.filter(item => item.status === 'in-progress').length}
                </h3>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
              </div>
              <div className="stat-icon p-3 rounded-md bg-blue-500 text-white">
                <Wrench className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="stat-card bg-white rounded-lg shadow p-5 border border-gray-200">
            <div className="flex justify-between items-start">
              <div className="stat-info">
                <h3 className="text-xl font-bold text-green-600">
                  {schedule.filter(item => item.status === 'completed').length}
                </h3>
                <p className="text-sm font-medium text-gray-600">Completed</p>
              </div>
              <div className="stat-icon p-3 rounded-md bg-green-500 text-white">
                <CheckCircle className="h-5 w-5" />
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Appointments</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by customer, vehicle, or service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="mt-4 text-sm font-medium text-gray-600">
            Showing {filteredSchedule.length} of {schedule.length} appointments
          </div>
        </div>

        {/* Schedule Table */}
        <div className="analytics-card bg-white rounded-lg shadow p-5 border border-gray-200">
          <div className="card-header flex justify-between items-center mb-5">
            <h3 className="text-lg font-semibold text-gray-900">Appointment List</h3>
          </div>

          {filteredSchedule.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-3 px-4 text-gray-700 font-medium text-sm">Date & Time</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium text-sm">Customer</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium text-sm">Vehicle</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium text-sm">Service</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium text-sm">Location</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium text-sm">Status</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchedule.map((item) => (
                    <React.Fragment key={item.id}>
                      <tr className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer" onClick={() => toggleExpand(item.id)}>
                        <td className="py-4 px-4">
                          <div className="flex items-center text-gray-700">
                            <Clock className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                            <div>
                              <div className="text-sm font-medium">{item.date}</div>
                              <div className="text-blue-600 text-sm font-semibold">{item.time}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm font-medium text-gray-900">{item.customer}</td>
                        <td className="py-4 px-4 text-sm text-gray-700">{item.vehicle}</td>
                        <td className="py-4 px-4 text-sm text-gray-700">
                          <div className="flex items-center">
                            <Wrench className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
                            {item.service}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-700">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1 text-red-500 flex-shrink-0" />
                            {item.location}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)} flex items-center`}>
                            {getStatusIcon(item.status)}
                            {item.status.replace('-', ' ')}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex justify-center">
                            {expandedId === item.id ? (
                              <ChevronUp className="h-5 w-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-500" />
                            )}
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expanded Details */}
                      {expandedId === item.id && (
                        <tr>
                          <td colSpan="7" className="bg-blue-50 p-6 border-b border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                                  <Wrench className="h-5 w-5 mr-2 text-blue-600" />
                                  Service Details
                                </h3>
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                  <p className="text-gray-800 font-medium">{item.service}</p>
                                  <p className="text-gray-600 mt-2 text-sm">{item.notes || 'No additional notes provided'}</p>
                                </div>
                              </div>
                              
                              <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                                  <User className="h-5 w-5 mr-2 text-blue-600" />
                                  Customer Information
                                </h3>
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                  <p className="text-gray-800 font-medium">{item.customer}</p>
                                  <div className="flex items-center mt-2 text-gray-600 text-sm">
                                    <Phone className="h-4 w-4 mr-2" />
                                    {item.contact.phone}
                                  </div>
                                  <div className="flex items-center mt-1 text-gray-600 text-sm">
                                    <Mail className="h-4 w-4 mr-2" />
                                    {item.contact.email}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg shadow-sm">
                              <h3 className="text-lg font-semibold text-gray-700 mb-3">Update Status</h3>
                              <div className="flex flex-wrap gap-3">
                                <button
                                  onClick={() => updateStatus(item.id, 'pending')}
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                                    item.status === 'pending'
                                      ? 'bg-yellow-500 text-white shadow-inner'
                                      : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                  }`}
                                >
                                  <Clock className="h-4 w-4 mr-1" />
                                  Pending
                                </button>
                                <button
                                  onClick={() => updateStatus(item.id, 'in-progress')}
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                                    item.status === 'in-progress'
                                      ? 'bg-blue-500 text-white shadow-inner'
                                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                  }`}
                                >
                                  <Wrench className="h-4 w-4 mr-1" />
                                  In Progress
                                </button>
                                <button
                                  onClick={() => updateStatus(item.id, 'completed')}
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                                    item.status === 'completed'
                                      ? 'bg-green-500 text-white shadow-inner'
                                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                                  }`}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Complete
                                </button>
                                <button
                                  onClick={() => updateStatus(item.id, 'cancelled')}
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                                    item.status === 'cancelled'
                                      ? 'bg-red-500 text-white shadow-inner'
                                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                                  }`}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {schedule.length > 0 
                  ? 'No appointments match your search criteria' 
                  : 'No appointments scheduled'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TechnicianSchedule;