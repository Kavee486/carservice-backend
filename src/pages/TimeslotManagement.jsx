import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Search, Plus, Trash2, RefreshCw, Users } from 'lucide-react';
import { timeslotService } from '../services/timeslotService';
import axios from 'axios';

const TimeslotManagement = () => {
  const [timeslots, setTimeslots] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTime, setSearchTime] = useState('');
  const [newTimeslot, setNewTimeslot] = useState({
    date: '',
    startTime: '',
    endTime: '',
    maxCustomers: '',
    doctor: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTimeslot(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fetch timeslots from backend and map ResultSet
  const fetchTimeslots = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await timeslotService.getAllTimeslots();
      // expected response contains ResultSet array as shown in your example
      const rs = res?.ResultSet || [];
      const mapped = rs.map(r => ({
        id: r.T_TimeslotID,
        date: r.T_Date, // backend returns date as string like "10/17/2025 12:00:00 AM"
        startTime: r.T_StartTime,
        endTime: r.T_EndTime,
        maxCustomers: parseInt(r.T_MaxCustomers, 10) || 0,
        status: r.T_Status
      }));
      setTimeslots(mapped);
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

  const handleAddTimeslot = async () => {
    // Validation
    if (!newTimeslot.date || !newTimeslot.startTime || !newTimeslot.endTime || !newTimeslot.maxCustomers) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Build POST payload exactly as your backend expects
      // T_Date: use YYYY-MM-DD (backend seemed to accept that in your example)
      // T_StartTime / T_EndTime: pass in a time string like "09:00 AM"
      const payload = {
        T_Date: newTimeslot.date,
        T_StartTime: formatTimeForBackend(newTimeslot.startTime),
        T_EndTime: formatTimeForBackend(newTimeslot.endTime),
        T_MaxCustomers: String(newTimeslot.maxCustomers)
      };

      console.log('Posting payload to AddTimeslot:', payload);
      const res = await timeslotService.addTimeslot(payload);
      console.log('AddTimeslot response', res);

      // After successful add, refresh list
      await fetchTimeslots();

      // Clear form
      setNewTimeslot({ date: '', startTime: '', endTime: '', maxCustomers: '', doctor: '' });
    } catch (err) {
      console.error('Failed to add timeslot', err);
      setError('Failed to add timeslot');
      alert('Failed to add timeslot — check console for details');
    } finally {
      setLoading(false);
    }
  };

  // Utility: convert input type=time ("HH:MM") to backend format e.g. "09:00 AM"
  const formatTimeForBackend = (time) => {
    if (!time) return '';
    // Accept formats: "HH:MM" (24h), "HH:MM AM/PM"
    const trimmed = String(time).trim();
    // If already contains AM/PM, normalize spacing and return
    const ampmMatch = trimmed.match(/(AM|PM|am|pm)$/);
    if (ampmMatch) {
      // Ensure format like "09:00 AM"
      const parts = trimmed.split(' ');
      const hhmm = parts[0];
      const [hh, mm] = hhmm.split(':');
      const hhNum = parseInt(hh, 10) % 12 || 12;
      const paddedHour = hhNum < 10 ? `0${hhNum}` : `${hhNum}`;
      const upper = ampmMatch[0].toUpperCase();
      return `${paddedHour}:${mm} ${upper}`;
    }

    // Otherwise assume 24h "HH:MM"
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
      } catch (err) {
        alert('Failed to delete timeslot.');
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

  // Helper to parse times like "09:00:00", "09:00", or "09:00 AM" into minutes since midnight
  const timeToMinutes = (t) => {
    if (!t) return null;
    const s = String(t).trim();
    // If format contains AM/PM
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

    // If format contains seconds
    const parts = s.split(':');
    const hh = parseInt(parts[0] || '0', 10);
    const mm = parseInt(parts[1] || '0', 10);
    return hh * 60 + mm;
  };

  // Get date range for today to 2 weeks ahead (includes today)
  const getTwoWeeksDateRange = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    const twoWeeksLater = new Date();
    twoWeeksLater.setDate(today.getDate() + 14);
    twoWeeksLater.setHours(23, 59, 59, 999); // End of the day 2 weeks later
    
    return { start: today, end: twoWeeksLater };
  };

  // Check if a date is within today to 2 weeks ahead
  const isDateWithinTwoWeeks = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const { start, end } = getTwoWeeksDateRange();
    return date >= start && date <= end;
  };

  // Only consider active timeslots for display and stats
  const activeTimeslots = timeslots.filter(t => String(t.status).toUpperCase() === 'A');

  // Filter to show only timeslots from today to 2 weeks ahead
  const twoWeeksActiveTimeslots = activeTimeslots.filter(t => 
    isDateWithinTwoWeeks(t.date)
  );

  const filteredTimeslots = twoWeeksActiveTimeslots.filter((timeslot) => {
    // If searchTime provided, show slots that include that minute
    if (searchTime) {
      const searchMin = timeToMinutes(searchTime);
      const slotStart = timeToMinutes(timeslot.startTime);
      const slotEnd = timeToMinutes(timeslot.endTime);
      if (searchMin !== null && slotStart !== null && slotEnd !== null) {
        return searchMin >= slotStart && searchMin < slotEnd;
      }
    }

    // Fallback: search by doctor or date text
    return (
      (timeslot.doctor || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (timeslot.date || '').includes(searchTerm)
    );
  });

  // Group timeslots by date for better organization
  const groupTimeslotsByDate = (slots) => {
    const grouped = {};
    slots.forEach(slot => {
      const dateKey = new Date(slot.date).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(slot);
    });
    return grouped;
  };

  const groupedTimeslots = groupTimeslotsByDate(filteredTimeslots);

  // Calculate statistics based on two weeks active timeslots
  const totalTimeslots = twoWeeksActiveTimeslots.length;
  const totalCapacity = twoWeeksActiveTimeslots.reduce((total, timeslot) => total + (timeslot.maxCustomers || 0), 0);
  const upcomingTimeslots = twoWeeksActiveTimeslots.filter(timeslot => 
    timeslot.date && new Date(timeslot.date) >= new Date()
  ).length;

  // Get today's timeslots count
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

  // Get formatted date range for display
  const getFormattedDateRange = () => {
    const { start, end } = getTwoWeeksDateRange();
    return {
      start: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      end: end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
  };

  const dateRange = getFormattedDateRange();

  // Check if a date is today
  const isToday = (dateString) => {
    const today = new Date();
    const date = new Date(dateString);
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  return (
    <div className="h-full p-6">
      <div className="w-full space-y-6">
        {/* Header Section */}
        <div className="bg-blue-600 rounded-xl shadow-lg text-white p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Timeslot Management</h1>
              <p className="text-blue-100">
                Manage and schedule appointment timeslots for today and next 2 weeks ({dateRange.start} - {dateRange.end})
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg h-10 px-4 font-medium flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Today's Timeslots Card */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Today's Timeslots</div>
                <div className="text-xl font-bold text-gray-900">{todaysTimeslots}</div>
              </div>
              <div className="p-2 rounded-full bg-orange-100 text-orange-600">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Total Timeslots Card */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Total Timeslots (2 Weeks)</div>
                <div className="text-xl font-bold text-gray-900">{totalTimeslots}</div>
              </div>
              <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Total Capacity Card */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Total Capacity (2 Weeks)</div>
                <div className="text-xl font-bold text-gray-900">{totalCapacity} Customers</div>
              </div>
              <div className="p-2 rounded-full bg-green-100 text-green-600">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Upcoming Timeslots Card */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Upcoming Timeslots</div>
                <div className="text-xl font-bold text-gray-900">{upcomingTimeslots}</div>
              </div>
              <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Add New Timeslot Form */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Timeslot</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Customers <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="maxCustomers"
                value={newTimeslot.maxCustomers}
                onChange={handleInputChange}
                placeholder="Enter max Customers"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                required
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleAddTimeslot}
                disabled={loading}
                className={`w-full bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-base font-medium ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-700'}`}
              >
                <Plus className="w-4 h-4" />
                {loading ? 'Adding...' : 'ADD TIMESLOT'}
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
            <div className="flex items-center">
              <Search className="text-blue-600 text-base mr-2" />
              <span className="text-base font-semibold text-gray-900">Search Timeslots</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center space-x-3">
              <label className="text-sm text-gray-600">Search by time</label>
              <input
                type="time"
                value={searchTime}
                onChange={(e) => setSearchTime(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => setSearchTime('')}
                className="text-sm text-blue-600 underline"
                title="Clear time filter"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="mt-2">
            <span className="text-sm text-gray-600">
              Showing {filteredTimeslots.length} of {totalTimeslots} timeslots for today and next 2 weeks
            </span>
          </div>
        </div>

        {/* Available Timeslots Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                Available Timeslots (Today and Next 2 Weeks: {dateRange.start} - {dateRange.end})
              </h3>
              <span className="text-gray-500">{totalTimeslots} timeslots found</span>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12 text-gray-600">Loading timeslots...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">{error}</div>
            ) : Object.keys(groupedTimeslots).length > 0 ? (
              <div className="space-y-8">
                {Object.entries(groupedTimeslots)
                  .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
                  .map(([date, slots]) => (
                    <div key={date} className="border border-gray-200 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                        {formatDate(date)}
                        {isToday(date) && (
                          <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full font-medium">
                            Today
                          </span>
                        )}
                        <span className="ml-2 text-sm font-normal text-gray-500">
                          ({slots.length} timeslot{slots.length !== 1 ? 's' : ''})
                        </span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {slots.map((timeslot) => (
                          <div
                            key={timeslot.id}
                            className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center text-blue-600">
                                <Clock className="w-4 h-4 mr-1" />
                                <span className="font-semibold text-base">
                                  {formatTime(timeslot.startTime)} - {formatTime(timeslot.endTime)}
                                </span>
                              </div>
                              <button
                                onClick={() => handleDeleteTimeslot(timeslot.id)}
                                className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-lg hover:bg-red-100"
                                title="Delete timeslot"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center text-gray-700">
                                <Users className="w-4 h-4 mr-2 text-blue-600" />
                                <span className="text-base">Max Customers: {timeslot.maxCustomers}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-base font-medium">
                  {timeslots && timeslots.length > 0
                    ? 'No timeslots found for today and next 2 weeks'
                    : 'No timeslots found'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeslotManagement;