import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Search, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Users, 
  Filter
} from 'lucide-react';
import { timeslotService } from '../services/timeslotService';

const TimeslotManagement = () => {
  const [timeslots, setTimeslots] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTime, setSearchTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const [newTimeslot, setNewTimeslot] = useState({
    date: '',
    startTime: '',
    endTime: '',
    maxCustomers: ''
  });

  // Clear messages after 3 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTimeslot(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const fetchTimeslots = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await timeslotService.getAllTimeslots();
      const rs = res?.ResultSet || [];
      const mapped = rs.map(r => ({
        id: r.T_TimeslotID,
        date: r.T_Date,
        startTime: r.T_StartTime,
        endTime: r.T_EndTime,
        maxCustomers: parseInt(r.T_MaxCustomers, 10) || 0,
        status: r.T_Status
      }));
      setTimeslots(mapped);
      setSuccess('');
    } catch (err) {
      console.error('Failed to fetch timeslots', err);
      setError('Failed to load timeslots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeslots();
  }, []);

  const validateTimeslot = (timeslot) => {
    if (!timeslot.date || !timeslot.startTime || !timeslot.endTime || !timeslot.maxCustomers) {
      return 'Please fill in all required fields';
    }

    const start = timeToMinutes(timeslot.startTime);
    const end = timeToMinutes(timeslot.endTime);
    
    if (start >= end) {
      return 'End time must be after start time';
    }

    if (timeslot.maxCustomers < 1) {
      return 'Maximum customers must be at least 1';
    }

    return null;
  };

  const handleAddTimeslot = async () => {
    const validationError = validateTimeslot(newTimeslot);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const payload = {
        T_Date: newTimeslot.date,
        T_StartTime: formatTimeForBackend(newTimeslot.startTime),
        T_EndTime: formatTimeForBackend(newTimeslot.endTime),
        T_MaxCustomers: String(newTimeslot.maxCustomers)
      };

      await timeslotService.addTimeslot(payload);
      await fetchTimeslots();
      
      setNewTimeslot({ date: '', startTime: '', endTime: '', maxCustomers: '' });
      setSuccess('Timeslot added successfully');
    } catch (err) {
      console.error('Failed to add timeslot', err);
      setError('Failed to add timeslot');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeForBackend = (time) => {
    if (!time) return '';
    const trimmed = String(time).trim();
    const ampmMatch = trimmed.match(/(AM|PM|am|pm)$/);
    if (ampmMatch) {
      const parts = trimmed.split(' ');
      const hhmm = parts[0];
      const [hh, mm] = hhmm.split(':');
      const hhNum = parseInt(hh, 10) % 12 || 12;
      const paddedHour = hhNum < 10 ? `0${hhNum}` : `${hhNum}`;
      const upper = ampmMatch[0].toUpperCase();
      return `${paddedHour}:${mm} ${upper}`;
    }

    const [hh, mm] = trimmed.split(':');
    let hour = parseInt(hh, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    const paddedHour = hour < 10 ? `0${hour}` : `${hour}`;
    return `${paddedHour}:${mm} ${ampm}`;
  };

  const handleDeleteTimeslot = async (id) => {
    if (!id) return;
    if (window.confirm('Are you sure you want to delete this timeslot?')) {
      try {
        setLoading(true);
        await timeslotService.deleteTimeslot(id);
        await fetchTimeslots();
        setSuccess('Timeslot deleted successfully');
      } catch (err) {
        setError('Failed to delete timeslot');
        console.error('Delete timeslot error:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRefresh = () => {
    fetchTimeslots();
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const timeToMinutes = (t) => {
    if (!t) return null;
    const s = String(t).trim();
    const ampm = s.match(/(AM|PM|am|pm)$/);
    if (ampm) {
      const parts = s.replace(/\s+(AM|PM|am|pm)$/i, '').split(':');
      let hh = parseInt(parts[0], 10);
      const mm = parseInt(parts[1] || '0', 10);
      const isPM = /PM$/i.test(ampm[0]);
      if (isPM && hh < 12) hh += 12;
      if (!isPM && hh === 12) hh = 0;
      return hh * 60 + mm;
    }

    const parts = s.split(':');
    const hh = parseInt(parts[0] || '0', 10);
    const mm = parseInt(parts[1] || '0', 10);
    return hh * 60 + mm;
  };

  const getTwoWeeksDateRange = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const twoWeeksLater = new Date();
    twoWeeksLater.setDate(today.getDate() + 14);
    twoWeeksLater.setHours(23, 59, 59, 999);
    
    return { start: today, end: twoWeeksLater };
  };

  const isDateWithinTwoWeeks = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const { start, end } = getTwoWeeksDateRange();
    return date >= start && date <= end;
  };

  const activeTimeslots = timeslots.filter(t => String(t.status).toUpperCase() === 'A');
  const twoWeeksActiveTimeslots = activeTimeslots.filter(t => 
    isDateWithinTwoWeeks(t.date)
  );

  const filteredTimeslots = twoWeeksActiveTimeslots.filter((timeslot) => {
    const matchesSearch = searchTerm === '' || 
      timeslot.date.includes(searchTerm);

    const matchesTime = searchTime === '' || 
      (timeToMinutes(timeslot.startTime) <= timeToMinutes(searchTime) && 
       timeToMinutes(timeslot.endTime) > timeToMinutes(searchTime));

    const matchesStatus = statusFilter === 'all' || 
      timeslot.status === statusFilter;

    return matchesSearch && matchesTime && matchesStatus;
  });

  // Statistics
  const totalTimeslots = twoWeeksActiveTimeslots.length;
  const totalCapacity = twoWeeksActiveTimeslots.reduce((total, timeslot) => total + (timeslot.maxCustomers || 0), 0);
  const upcomingTimeslots = twoWeeksActiveTimeslots.filter(timeslot => 
    timeslot.date && new Date(timeslot.date) >= new Date()
  ).length;

  const todaysTimeslots = twoWeeksActiveTimeslots.filter(timeslot => {
    if (!timeslot.date) return false;
    const today = new Date();
    const slotDate = new Date(timeslot.date);
    return (
      slotDate.getFullYear() === today.getFullYear() &&
      slotDate.getMonth() === today.getMonth() &&
      slotDate.getDate() === today.getDate()
    );
  }).length;

  const getStatusBadge = (status) => {
    const statusMap = {
      'A': { label: 'Active', color: 'bg-green-100 text-green-800' },
      'I': { label: 'Inactive', color: 'bg-gray-100 text-gray-800' },
      'F': { label: 'Full', color: 'bg-red-100 text-red-800' }
    };
    
    const statusInfo = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-600 text-base font-medium">Loading timeslots...</p>
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
              <h1 className="text-2xl font-bold text-white mb-2">Timeslot Management</h1>
              <p className="text-blue-100">Manage and schedule appointment timeslots efficiently</p>
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
                onClick={handleAddTimeslot}
                className="bg-white text-blue-600 rounded-lg hover:bg-blue-50 h-10 px-4 font-medium flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Timeslot
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {(error || success) && (
          <div className={`rounded-lg p-4 flex items-center space-x-3 ${
            error ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
          }`}>
            {error ? (
              <div className="h-5 w-5 text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                </svg>
              </div>
            ) : (
              <div className="h-5 w-5 text-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            <span className={error ? 'text-red-800' : 'text-green-800'}>
              {error || success}
            </span>
          </div>
        )}

        {/* Add New Timeslot Form */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Timeslot</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={newTimeslot.date}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                max={getTwoWeeksDateRange().end.toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="startTime"
                value={newTimeslot.startTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="endTime"
                value={newTimeslot.endTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-colors"
                required
              />
            </div>

            <div className="flex items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Customers <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="maxCustomers"
                  value={newTimeslot.maxCustomers}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="Enter max customers"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-colors"
                  required
                />
              </div>
              <button
                onClick={handleAddTimeslot}
                disabled={loading}
                className={`ml-2 bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-base font-medium h-[42px] ${
                  loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-700'
                }`}
              >
                <Plus className="w-4 h-4" />
                {loading ? 'Adding...' : 'ADD'}
              </button>
            </div>
          </div>
        </div>



        {/* Timeslots Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Available Timeslots (for two weeks)</h3>
              <span className="text-gray-500">{totalTimeslots} timeslots found</span>
            </div>
          </div>

          <div className="p-6">
            {filteredTimeslots.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Date</th>
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Time</th>
                      <th className="text-right py-4 px-4 text-gray-700 font-medium text-sm">Max Customers</th>
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Status</th>
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTimeslots.map((timeslot) => (
                      <tr key={timeslot.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-4 px-4 text-base font-medium text-gray-900">
                          {formatDate(timeslot.date)}
                        </td>
                        <td className="py-4 px-4 text-base text-gray-700">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-blue-600" />
                            {formatTime(timeslot.startTime)} - {formatTime(timeslot.endTime)}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            <Users className="h-3 w-3 mr-1" />
                            {timeslot.maxCustomers}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(timeslot.status)}
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => handleDeleteTimeslot(timeslot.id)}
                            className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-100"
                            title="Delete timeslot"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-base font-medium">
                  {timeslots && timeslots.length > 0
                    ? 'No timeslots match your search criteria'
                    : 'No timeslots available'}
                </p>
                <p className="text-gray-500 mb-6">
                  {timeslots && timeslots.length > 0
                    ? 'Try adjusting your search criteria or clear filters'
                    : 'Get started by adding your first timeslot'}
                </p>
                {(searchTerm || searchTime || statusFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSearchTime('');
                      setStatusFilter('all');
                    }}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeslotManagement;