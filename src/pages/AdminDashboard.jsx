import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid
} from "recharts";
import { 
  FiUsers, 
  FiCalendar, 
  FiDollarSign, 
  FiClock,
  FiPackage, 
  FiFileText, 
  FiTrendingUp, 
  FiRefreshCw,
  FiUser,
  FiTool,
  FiTruck,
  FiMapPin,
  FiPhone,
  FiMail,
  FiAlertCircle
} from "react-icons/fi";
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  getDashboardStatsWithVehicleDetails, 
  getLatestBookingsWithVehicleDetails,
  getAllBookingsWithVehicleDetails 
} from '../actions/adminActions';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { 
    dashboardStatsWithVehicleDetails, 
    latestBookingsWithVehicleDetails,
    bookingsWithVehicleDetails 
  } = useSelector(state => state.admin);

  const { data: statsData } = dashboardStatsWithVehicleDetails;
  const { data: latestBookingsData } = latestBookingsWithVehicleDetails;
  const { data: allBookingsData } = bookingsWithVehicleDetails;

  // Color palettes
  const PIE_COLORS = ['#1e40af', '#3b82f6', '#0f488dff', '#85baf6ff', '#051d3aff', '#dbeafe'];
  const BAR_COLORS = ['#1e3a8a', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'];
  const LINE_COLOR = '#1d4ed8';

  // Load all data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          dispatch(getDashboardStatsWithVehicleDetails()),
          dispatch(getLatestBookingsWithVehicleDetails()),
          dispatch(getAllBookingsWithVehicleDetails())
        ]);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [dispatch]);

  // Calculate stats from the data with vehicle details
  const calculateStats = () => {
    const allBookings = statsData?.bookingsWithVehicles || allBookingsData || [];
    const allServices = statsData?.services || [];
    
    const today = new Date().toISOString().split('T')[0];

    // Calculate unique customers and vehicles
    const uniqueCustomers = [...new Set(allBookings.map(booking => booking.B_CustomerID))].filter(id => id);
    const uniqueVehicles = [...new Set(allBookings.map(booking => booking.B_VehicleID))].filter(id => id);

    // Calculate today's appointments
    const todayAppointments = allBookings.filter(booking => {
      const bookingDate = booking.B_BookingDate;
      if (!bookingDate) return false;
      
      let formattedDate;
      if (bookingDate.includes('/')) {
        const [month, day, year] = bookingDate.split('/');
        formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      } else {
        formattedDate = bookingDate.split('T')[0];
      }
      
      return formattedDate === today;
    }).length;

    // Calculate completed bookings
    const completedBookings = allBookings.filter(booking => 
      (booking.B_BookingStatus || booking.B_Status || '').toLowerCase() === 'completed'
    ).length;

    // Calculate completion rate
    const completionRate = allBookings.length > 0 ? (completedBookings / allBookings.length * 100) : 0;

    return {
      totalUsers: uniqueCustomers.length,
      todayAppointments,
      vehiclesServiced: uniqueVehicles.length,
      totalBookings: allBookings.length,
      totalServices: allServices.length,
      completedBookings,
      completionRate
    };
  };

  const stats = calculateStats();

  // Prepare chart data
  const [chartData, setChartData] = useState({
    distribution: [],
    status: [],
    trends: []
  });

  useEffect(() => {
    if (statsData?.bookingsWithVehicles && statsData.bookingsWithVehicles.length > 0) {
      prepareChartData();
    }
  }, [statsData]);

  const prepareChartData = () => {
    const allBookings = statsData.bookingsWithVehicles;
    const allServices = statsData.services || [];
    
    const total = getTotal();

    // Distribution data
    const uniqueCustomers = [...new Set(allBookings.map(booking => booking.B_CustomerID))].filter(id => id);
    const uniqueVehicles = [...new Set(allBookings.map(booking => booking.B_VehicleID))].filter(id => id);

    const distributionData = [
      { 
        name: 'Customers', 
        value: uniqueCustomers.length, 
        percentage: total > 0 ? (uniqueCustomers.length / total * 100).toFixed(1) : 0 
      },
      { 
        name: 'Vehicles', 
        value: uniqueVehicles.length, 
        percentage: total > 0 ? (uniqueVehicles.length / total * 100).toFixed(1) : 0 
      },
      { 
        name: 'Bookings', 
        value: allBookings.length, 
        percentage: total > 0 ? (allBookings.length / total * 100).toFixed(1) : 0 
      },
      { 
        name: 'Services', 
        value: allServices.length, 
        percentage: total > 0 ? (allServices.length / total * 100).toFixed(1) : 0 
      }
    ];

    // Status data
    const statusCounts = {};
    allBookings.forEach(booking => {
      const status = (booking.B_BookingStatus || booking.B_Status || 'Unknown').toLowerCase();
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const statusData = Object.entries(statusCounts).map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      count,
      percentage: allBookings.length > 0 ? ((count / allBookings.length) * 100).toFixed(1) : 0
    }));

    // Monthly trends
    const monthlyData = {};
    allBookings.forEach(booking => {
      try {
        const bookingDate = new Date(booking.B_BookingDate);
        if (isNaN(bookingDate)) return;
        
        const monthKey = bookingDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { bookings: 0 };
        }
        monthlyData[monthKey].bookings += 1;
      } catch (err) {
        // Skip invalid dates
      }
    });

    const trendData = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        bookings: data.bookings
      }))
      .sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA - dateB;
      });

    setChartData({
      distribution: distributionData,
      status: statusData,
      trends: trendData
    });
  };

  const getTotal = () => {
    const allBookings = statsData?.bookingsWithVehicles || [];
    const allServices = statsData?.services || [];
    
    const uniqueCustomers = [...new Set(allBookings.map(booking => booking.B_CustomerID))].filter(id => id);
    const uniqueVehicles = [...new Set(allBookings.map(booking => booking.B_VehicleID))].filter(id => id);
    
    return uniqueCustomers.length + uniqueVehicles.length + allBookings.length + allServices.length;
  };

  // Get latest bookings for display
  const getLatestBookingsList = () => {
    return latestBookingsData || [];
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date)) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (err) {
      return 'Invalid Date';
    }
  };

  // Format time slot
  const formatTimeSlot = (startTime, endTime) => {
    if (!startTime || !endTime) return 'N/A';
    
    try {
      const formatTime = (timeString) => {
        if (!timeString) return '';
        if (timeString.includes(':')) {
          const time = new Date(`2000-01-01T${timeString}`);
          if (isNaN(time)) return timeString;
          return time.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          });
        }
        return timeString;
      };

      const formattedStart = formatTime(startTime);
      const formattedEnd = formatTime(endTime);
      
      return `${formattedStart} - ${formattedEnd}`;
    } catch (err) {
      return `${startTime} - ${endTime}`;
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusLower = (status || '').toLowerCase();
    switch (statusLower) {
      case 'completed': 
        return { color: 'text-green-800 bg-green-100 border-green-200', label: 'Completed' };
      case 'in progress': 
      case 'inprogress':
        return { color: 'text-blue-800 bg-blue-100 border-blue-200', label: 'In Progress' };
      case 'pending': 
        return { color: 'text-yellow-800 bg-yellow-100 border-yellow-200', label: 'Pending' };
      case 'cancelled': 
        return { color: 'text-red-800 bg-red-100 border-red-200', label: 'Cancelled' };
      case 'scheduled': 
        return { color: 'text-purple-800 bg-purple-100 border-purple-200', label: 'Scheduled' };
      default: 
        return { color: 'text-slate-800 bg-slate-100 border-slate-200', label: status || 'Unknown' };
    }
  };

  // Get service type color
  const getServiceTypeColor = (serviceType) => {
    if (!serviceType) return 'text-slate-600';
    const typeLower = serviceType.toLowerCase();
    if (typeLower.includes('oil') || typeLower.includes('maintenance')) return 'text-blue-600';
    if (typeLower.includes('repair') || typeLower.includes('fix')) return 'text-orange-600';
    if (typeLower.includes('inspection') || typeLower.includes('check')) return 'text-purple-600';
    if (typeLower.includes('tire') || typeLower.includes('wheel')) return 'text-green-600';
    if (typeLower.includes('brake')) return 'text-red-600';
    return 'text-slate-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/30 flex items-center justify-center p-6">
        <div className="inline-flex items-center space-x-3 bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-white/20">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-800"></div>
          <span className="text-slate-700 font-medium">Loading Dashboard Data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/30 flex items-center justify-center p-6">
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-white/20 text-center">
          <FiAlertCircle className="mx-auto text-4xl text-red-500 mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Error Loading Dashboard</h3>
          <p className="text-slate-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const latestBookingsList = getLatestBookingsList();

  // Stats cards configuration
  const statsCards = [
    { 
      key: 'users', 
      label: 'Total Customers', 
      count: stats.totalUsers, 
      percentage: ((stats.totalUsers / getTotal()) * 100).toFixed(1),
      icon: FiUsers,
      color: 'from-blue-600 to-blue-700',
      onClick: () => navigate('/admin/customers')
    },
    { 
      key: 'appointments', 
      label: "Today's Appointments", 
      count: stats.todayAppointments, 
      percentage: ((stats.todayAppointments / getTotal()) * 100).toFixed(1),
      icon: FiCalendar,
      color: 'from-green-600 to-green-700',
      onClick: () => navigate('/admin/appointments')
    },
    { 
      key: 'vehicles', 
      label: 'Vehicles Serviced', 
      count: stats.vehiclesServiced, 
      percentage: ((stats.vehiclesServiced / getTotal()) * 100).toFixed(1),
      icon: FiTruck,
      color: 'from-amber-600 to-amber-700',
      onClick: () => navigate('/admin/vehicles')
    },
    { 
      key: 'bookings', 
      label: 'Total Bookings', 
      count: stats.totalBookings, 
      percentage: ((stats.totalBookings / getTotal()) * 100).toFixed(1),
      icon: FiFileText,
      color: 'from-cyan-600 to-cyan-700',
      onClick: () => navigate('/admin/appointments')
    },
    { 
      key: 'services', 
      label: 'Services Available', 
      count: stats.totalServices, 
      percentage: ((stats.totalServices / getTotal()) * 100).toFixed(1),
      icon: FiPackage,
      color: 'from-orange-600 to-orange-700',
      onClick: () => navigate('/admin/services')
    },
    { 
      key: 'completion', 
      label: 'Completion Rate', 
      count: `${stats.completionRate.toFixed(1)}%`, 
      percentage: stats.completionRate.toFixed(1),
      icon: FiTrendingUp,
      color: 'from-purple-600 to-purple-700',
      onClick: () => navigate('/admin/reports')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/30 p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-40 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-cyan-500/20 rounded-full translate-x-1/3 translate-y-1/3 opacity-40 blur-3xl"></div>
      
      {/* Header Section */}
      <div className="relative z-10 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-br from-blue-800 to-blue-900 rounded-2xl shadow-2xl transform rotate-3">
              <FiTrendingUp className="text-white text-xl" />
            </div>
            <div className="transform -rotate-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-slate-600 mt-1">Comprehensive overview with vehicle details</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setLoading(true);
              window.location.reload();
            }}
            className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <FiRefreshCw className={`text-blue-600 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-slate-700 font-medium">Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8 relative z-10">
        {statsCards.map((item) => (
          <div key={item.key} className="group relative cursor-pointer h-full" onClick={item.onClick}>
            <div className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-300 transform group-hover:scale-105`}></div>
            <div className="relative bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-2xl border border-white/20 transform transition duration-300 group-hover:-translate-y-2 group-hover:shadow-3xl h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-3 bg-gradient-to-br ${item.color} rounded-2xl shadow-lg flex-shrink-0`}>
                  <item.icon className="text-white text-lg" />
                </div>
              </div>
              <div className="flex-grow">
                <p className="text-slate-600 text-sm font-medium mb-2">{item.label}</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                  {item.count}
                </p>
                <p className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                  {item.percentage}% of total
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10 mb-8">
        {/* Distribution Chart */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-800 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-6">
            <h3 className="text-xl font-semibold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-6">
              Data Distribution
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.distribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    labelLine={false}
                  >
                    {chartData.distribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={PIE_COLORS[index % PIE_COLORS.length]} 
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => {
                      const item = chartData.distribution.find(item => item.name === name);
                      return [`${value} (${item?.percentage}%)`, name];
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Booking Status Chart */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-800 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-6">
            <h3 className="text-xl font-semibold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-6">
              Booking Status Distribution
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.status}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    formatter={(value, name, props) => {
                      if (name === 'count') {
                        return [`${value} (${props.payload.percentage}%)`, 'Bookings'];
                      }
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="count" 
                    fill={LINE_COLOR}
                    radius={[4, 4, 0, 0]}
                  >
                    {chartData.status.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Bookings with Vehicle Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 relative z-10">
        {/* Latest Bookings */}
        <div className="lg:col-span-2 group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-blue-800 to-blue-700 rounded-2xl shadow-lg">
                  <FiClock className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Latest Bookings with Vehicle Details
                  </h3>
                  <p className="text-slate-600 text-sm mt-1">
                    Most recent bookings with complete vehicle and service information
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                  {latestBookingsList.length} bookings
                </span>
                <button 
                  onClick={() => navigate('/admin/appointments')}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <FiCalendar className="text-white" />
                  <span>View All</span>
                </button>
              </div>
            </div>
            
            {latestBookingsList.length > 0 ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {latestBookingsList.map((booking) => {
                  const statusBadge = getStatusBadge(booking.B_BookingStatus || booking.B_Status);
                  const serviceTypeColor = getServiceTypeColor(booking.B_ServiceName);
                  
                  return (
                    <div 
                      key={booking.B_BookingID}
                      className="bg-white border border-slate-200/60 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:border-blue-200/60 group cursor-pointer"
                      onClick={() => navigate('/admin/appointments')}
                    >
                      {/* Header Section */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors text-lg">
                              {booking.B_CustomerName || `Customer ${booking.B_CustomerID}`}
                            </h4>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${statusBadge.color}`}>
                              {statusBadge.label}
                            </span>
                          </div>
                          
                          {/* Customer Contact Info */}
                          <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-3">
                            {booking.B_CustomerPhone && (
                              <div className="flex items-center">
                                <FiPhone className="mr-1 text-slate-400" size={14} />
                                <span>{booking.B_CustomerPhone}</span>
                              </div>
                            )}
                            <div className="flex items-center">
                              <FiCalendar className="mr-1 text-slate-400" size={14} />
                              <span>{formatDate(booking.B_BookingDate)}</span>
                            </div>
                            {booking.B_StartTime && booking.B_EndTime && (
                              <div className="flex items-center">
                                <FiClock className="mr-1 text-slate-400" size={14} />
                                <span>{formatTimeSlot(booking.B_StartTime, booking.B_EndTime)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Vehicle Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div className="bg-slate-50 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <FiTruck className="text-slate-500" size={16} />
                            <span className="font-medium text-slate-700">Vehicle Details</span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-600">Make:</span>
                              <span className="font-medium text-slate-800">
                                {booking.B_VehicleMake || 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Model:</span>
                              <span className="font-medium text-slate-800">
                                {booking.B_VehicleModel || 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Year:</span>
                              <span className="font-medium text-slate-800">
                                {booking.B_VehicleYear || 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Plate:</span>
                              <span className="font-medium text-slate-800">
                                {booking.B_VehiclePlateNumber || 'N/A'}
                              </span>
                            </div>
                            {booking.B_VehicleVIN && (
                              <div className="flex justify-between">
                                <span className="text-slate-600">VIN:</span>
                                <span className="font-medium text-slate-800 text-xs">
                                  {booking.B_VehicleVIN}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Service Information */}
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <FiTool className="text-blue-500" size={16} />
                            <span className="font-medium text-slate-700">Service Details</span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-600">Services:</span>
                              <span className={`font-medium ${serviceTypeColor} text-right max-w-[150px]`}>
                                {booking.B_ServiceName || 'General Service'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Booking Date:</span>
                              <span className="font-medium text-slate-800">
                                {formatDate(booking.B_BookingDate)}
                              </span>
                            </div>
                            {booking.B_PreferredDate && (
                              <div className="flex justify-between">
                                <span className="text-slate-600">Preferred Date:</span>
                                <span className="font-medium text-slate-800">
                                  {formatDate(booking.B_PreferredDate)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Footer with IDs */}
                      <div className="mt-3 pt-3 border-t border-slate-200/60 flex justify-between items-center">
                        <div className="text-sm text-slate-600">
                          Customer ID: {booking.B_CustomerID}
                        </div>
                        <div className="text-xs text-slate-500">
                          Booking ID: {booking.B_BookingID} | Vehicle ID: {booking.B_VehicleID}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiClock className="mx-auto text-4xl text-slate-400 mb-3" />
                <p className="text-slate-600">No recent bookings found</p>
                <p className="text-slate-500 text-sm mt-1">Bookings will appear here as they are created</p>
                <button 
                  onClick={() => navigate('/admin/appointments')}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Appointments
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-emerald-800 to-emerald-700 rounded-2xl shadow-lg">
                <FiTrendingUp className="text-white text-lg" />
              </div>
              <div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Performance Metrics
                </h3>
                <p className="text-slate-600 text-sm mt-1">
                  Real-time business insights
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100/60">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FiUsers className="text-blue-600" />
                  </div>
                  <span className="text-slate-700 font-medium">Completion Rate</span>
                </div>
                <span className="text-green-600 font-bold">{stats.completionRate.toFixed(1)}%</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100/60">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <FiCalendar className="text-amber-600" />
                  </div>
                  <span className="text-slate-700 font-medium">Today's Appointments</span>
                </div>
                <span className="text-amber-600 font-bold">{stats.todayAppointments}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100/60">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FiTruck className="text-green-600" />
                  </div>
                  <span className="text-slate-700 font-medium">Vehicles Serviced</span>
                </div>
                <span className="text-green-600 font-bold">{stats.vehiclesServiced}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-100/60">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FiPackage className="text-purple-600" />
                  </div>
                  <span className="text-slate-700 font-medium">Services Available</span>
                </div>
                <span className="text-purple-600 font-bold">{stats.totalServices}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-100/60">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-cyan-100 rounded-lg">
                    <FiFileText className="text-cyan-600" />
                  </div>
                  <span className="text-slate-700 font-medium">Total Bookings</span>
                </div>
                <span className="text-cyan-600 font-bold">{stats.totalBookings}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200/60">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <FiUser className="text-slate-600" />
                  </div>
                  <span className="text-slate-700 font-medium">Total Customers</span>
                </div>
                <span className="text-slate-600 font-bold">{stats.totalUsers}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;