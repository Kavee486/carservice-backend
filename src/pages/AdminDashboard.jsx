// AdminDashboard.jsx
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
import { getDashboardStats, getLatestBookings } from '../actions/adminActions';
import { fetchAllBookings } from '../services/adminServices';
import { fetchAllServices } from '../services/serviceServices';
import { getVehiclesByCustomerID } from '../services/vehicleServices';
import { authService } from '../services/authServices';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allBookings, setAllBookings] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [allVehicles, setAllVehicles] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [customerNames, setCustomerNames] = useState({});
  const [vehicleDetails, setVehicleDetails] = useState({});
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { dashboardStats, latestBookings } = useSelector(state => state.admin);
  const { data: statsData } = dashboardStats;
  const { data: latestBookingsData } = latestBookings;

  // Color palettes
  const PIE_COLORS = ['#1e40af', '#3b82f6', '#0f488dff', '#85baf6ff', '#051d3aff', '#dbeafe'];
  const BAR_COLORS = ['#1e3a8a', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'];
  const LINE_COLOR = '#1d4ed8';

  // Load all data from APIs
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        
        // Load bookings
        const bookingsRes = await fetchAllBookings();
        const bookingsList = bookingsRes?.ResultSet || bookingsRes?.Result || [];
        setAllBookings(Array.isArray(bookingsList) ? bookingsList : []);

        // Load services
        const servicesRes = await fetchAllServices();
        const servicesList = servicesRes?.ResultSet || servicesRes?.Result || [];
        setAllServices(Array.isArray(servicesList) ? servicesList : []);

        // Extract customer names and vehicle details from bookings
        await extractCustomerAndVehicleDetails(bookingsList);

        // Load vehicles (you might need to implement getAllVehicles service)
        // For now, we'll calculate from bookings
        await loadVehiclesFromBookings(bookingsList);

        // Load users (you might need to implement getAllUsers service)
        // For now, we'll calculate unique customers from bookings
        await loadUsersFromBookings(bookingsList);

        setLoading(false);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  // Extract customer names and vehicle details from bookings
  const extractCustomerAndVehicleDetails = async (bookings) => {
    try {
      const customerMap = {};
      const vehicleMap = {};

      bookings.forEach(booking => {
        const customerId = booking.B_CustomerID || booking.CustomerID;
        const vehicleId = booking.B_VehicleID || booking.VehicleID;

        // Extract customer name
        if (customerId) {
          const customerName = booking.CustomerName || booking.customerName || `Customer ${customerId}`;
          customerMap[customerId] = customerName;
        }

        // Extract vehicle details
        if (vehicleId) {
          vehicleMap[vehicleId] = {
            model: booking.VehicleModel || booking.vehicleModel || 'Unknown Model',
            licensePlate: booking.LicensePlate || booking.licensePlate || 'N/A',
            make: booking.VehicleMake || booking.vehicleMake || 'Unknown Make',
            year: booking.VehicleYear || booking.vehicleYear || 'N/A'
          };
        }
      });

      setCustomerNames(customerMap);
      setVehicleDetails(vehicleMap);
    } catch (err) {
      console.error('Error extracting customer and vehicle details:', err);
    }
  };

  // Load vehicles data from bookings
  const loadVehiclesFromBookings = async (bookings) => {
    try {
      const uniqueVehicleIds = [...new Set(bookings
        .filter(booking => booking.B_VehicleID || booking.VehicleID)
        .map(booking => booking.B_VehicleID || booking.VehicleID)
      )];
      setAllVehicles(uniqueVehicleIds);
    } catch (err) {
      console.error('Error loading vehicles:', err);
    }
  };

  // Load users data from bookings
  const loadUsersFromBookings = async (bookings) => {
    try {
      const uniqueCustomerIds = [...new Set(bookings
        .filter(booking => booking.B_CustomerID || booking.CustomerID)
        .map(booking => booking.B_CustomerID || booking.CustomerID)
      )];
      setAllUsers(uniqueCustomerIds);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  // Get customer name by ID
  const getCustomerName = (customerId) => {
    return customerNames[customerId] || `Customer ${customerId}`;
  };

  // Get vehicle details by ID
  const getVehicleDetails = (vehicleId) => {
    return vehicleDetails[vehicleId] || {
      model: 'Unknown Model',
      licensePlate: 'N/A',
      make: 'Unknown Make',
      year: 'N/A'
    };
  };

  // Calculate real stats from API data
  const calculateStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Calculate today's appointments
    const todayAppointments = allBookings.filter(booking => {
      const bookingDate = booking.B_BookingDate || booking.BookingDate;
      if (!bookingDate) return false;
      
      // Handle different date formats
      let formattedDate;
      if (bookingDate.includes('/')) {
        // Handle "MM/DD/YYYY" format
        const [month, day, year] = bookingDate.split('/');
        formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      } else {
        // Handle ISO format or other formats
        formattedDate = bookingDate.split('T')[0];
      }
      
      return formattedDate === today;
    }).length;

    // Calculate monthly revenue
    const monthlyRevenue = allBookings.reduce((total, booking) => {
      try {
        const bookingDate = new Date(booking.B_BookingDate || booking.BookingDate);
        if (isNaN(bookingDate)) return total;
        
        if (bookingDate.getMonth() === currentMonth && 
            bookingDate.getFullYear() === currentYear) {
          const amount = parseFloat(booking.TotalAmount || booking.B_TotalAmount || 0);
          return total + (isNaN(amount) ? 0 : amount);
        }
        return total;
      } catch (err) {
        return total;
      }
    }, 0);

    // Calculate completed bookings
    const completedBookings = allBookings.filter(booking => 
      (booking.B_BookingStatus || booking.Status || '').toLowerCase() === 'completed'
    ).length;

    // Calculate growth percentages (you can enhance this with historical data)
    const totalRevenue = allBookings.reduce((total, booking) => {
      const amount = parseFloat(booking.TotalAmount || booking.B_TotalAmount || 0);
      return total + (isNaN(amount) ? 0 : amount);
    }, 0);

    const avgBookingValue = allBookings.length > 0 ? totalRevenue / allBookings.length : 0;

    return {
      totalUsers: allUsers.length,
      todayAppointments,
      vehiclesServiced: allVehicles.length,
      monthlyRevenue,
      totalBookings: allBookings.length,
      totalParts: allServices.length, // Using services as parts count
      completedBookings,
      totalRevenue,
      avgBookingValue,
      // Calculate simple growth metrics (you can enhance these with historical comparison)
      revenueChange: monthlyRevenue > 0 ? 12.5 : 0, // Placeholder - implement proper calculation
      userGrowth: allUsers.length > 0 ? 8.2 : 0, // Placeholder - implement proper calculation
      completionRate: allBookings.length > 0 ? (completedBookings / allBookings.length * 100) : 0
    };
  };

  const stats = calculateStats();

  // Prepare real chart data from API
  const [chartData, setChartData] = useState({
    distribution: [],
    status: [],
    trends: [],
    revenueTrends: []
  });

  useEffect(() => {
    if (allBookings.length > 0) {
      prepareChartData();
    }
  }, [allBookings, allServices, allVehicles, allUsers]);

  const prepareChartData = () => {
    const total = getTotal();
    
    // Distribution data based on real counts
    const distributionData = [
      { 
        name: 'Users', 
        value: stats.totalUsers, 
        percentage: total > 0 ? (stats.totalUsers / total * 100).toFixed(1) : 0 
      },
      { 
        name: 'Vehicles', 
        value: stats.vehiclesServiced, 
        percentage: total > 0 ? (stats.vehiclesServiced / total * 100).toFixed(1) : 0 
      },
      { 
        name: 'Bookings', 
        value: stats.totalBookings, 
        percentage: total > 0 ? (stats.totalBookings / total * 100).toFixed(1) : 0 
      },
      { 
        name: 'Services', 
        value: stats.totalParts, 
        percentage: total > 0 ? (stats.totalParts / total * 100).toFixed(1) : 0 
      }
    ];

    // Real status data from bookings
    const statusCounts = {};
    allBookings.forEach(booking => {
      const status = (booking.B_BookingStatus || booking.Status || 'Unknown').toLowerCase();
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const statusData = Object.entries(statusCounts).map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      count,
      percentage: allBookings.length > 0 ? ((count / allBookings.length) * 100).toFixed(1) : 0
    }));

    // Monthly trends from real booking data
    const monthlyData = {};
    allBookings.forEach(booking => {
      try {
        const bookingDate = new Date(booking.B_BookingDate || booking.BookingDate);
        if (isNaN(bookingDate)) return;
        
        const monthKey = bookingDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { bookings: 0, revenue: 0 };
        }
        monthlyData[monthKey].bookings += 1;
        
        const amount = parseFloat(booking.TotalAmount || booking.B_TotalAmount || 0);
        if (!isNaN(amount)) {
          monthlyData[monthKey].revenue += amount;
        }
      } catch (err) {
        // Skip invalid dates
      }
    });

    const trendData = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        bookings: data.bookings,
        revenue: data.revenue
      }))
      .sort((a, b) => {
        // Sort by date
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA - dateB;
      });

    setChartData({
      distribution: distributionData,
      status: statusData,
      trends: trendData,
      revenueTrends: trendData
    });
  };

  const getTotal = () => {
    return stats.totalUsers + stats.vehiclesServiced + stats.totalBookings + stats.totalParts;
  };

  // Get latest 5 bookings
  const getLatestBookingsList = () => {
    // Sort bookings by date (newest first) and take latest 5
    const sortedBookings = [...allBookings].sort((a, b) => {
      const dateA = new Date(a.B_BookingDate || a.BookingDate);
      const dateB = new Date(b.B_BookingDate || b.BookingDate);
      return dateB - dateA;
    }).slice(0, 5);

    return sortedBookings;
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

  // Format date and time for display
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date)) return 'Invalid Date';
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return 'Invalid Date';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    const statusLower = (status || '').toLowerCase();
    switch (statusLower) {
      case 'completed': 
        return 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-200/50';
      case 'in progress': 
      case 'inprogress':
        return 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200/50';
      case 'pending': 
        return 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-200/50';
      case 'cancelled': 
        return 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-200/50';
      case 'scheduled': 
        return 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-200/50';
      default: 
        return 'bg-gradient-to-br from-slate-500 to-slate-600 text-white shadow-lg shadow-slate-200/50';
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

  // Get priority badge
  const getPriorityBadge = (priority) => {
    const priorityLower = (priority || '').toLowerCase();
    switch (priorityLower) {
      case 'high': 
        return { color: 'text-red-800 bg-red-100 border-red-200', label: 'High' };
      case 'medium': 
        return { color: 'text-yellow-800 bg-yellow-100 border-yellow-200', label: 'Medium' };
      case 'low': 
        return { color: 'text-green-800 bg-green-100 border-green-200', label: 'Low' };
      default: 
        return { color: 'text-slate-800 bg-slate-100 border-slate-200', label: priority || 'Normal' };
    }
  };

  // Get service type color
  const getServiceTypeColor = (serviceType) => {
    const typeLower = (serviceType || '').toLowerCase();
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
      label: 'Total Users', 
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
      key: 'revenue', 
      label: 'Monthly Revenue', 
      count: `Rs ${stats.monthlyRevenue.toLocaleString()}`,
      percentage: ((stats.monthlyRevenue / (stats.monthlyRevenue + getTotal())) * 100).toFixed(1),
      icon: FiDollarSign,
      color: 'from-purple-600 to-purple-700',
      onClick: () => navigate('/admin/reports')
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
      count: stats.totalParts, 
      percentage: ((stats.totalParts / getTotal()) * 100).toFixed(1),
      icon: FiPackage,
      color: 'from-orange-600 to-orange-700',
      onClick: () => navigate('/admin/services')
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
              <p className="text-slate-600 mt-1">Comprehensive overview of your auto service business</p>
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

      {/* Charts Section - MOVED TO BEGINNING */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10 mb-8">
        {/* Distribution Chart - Updated to Pie Chart (not donut) */}
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

      {/* Latest Bookings Section */}
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
                    Latest Bookings
                  </h3>
                  <p className="text-slate-600 text-sm mt-1">
                    Most recent bookings with detailed information
                  </p>
                </div>
              </div>
              <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                {latestBookingsList.length} bookings
              </span>
            </div>
            
            {latestBookingsList.length > 0 ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {latestBookingsList.map((booking) => {
                  const customerId = booking.B_CustomerID || booking.CustomerID;
                  const vehicleId = booking.B_VehicleID || booking.VehicleID;
                  const customerName = getCustomerName(customerId);
                  const vehicleInfo = getVehicleDetails(vehicleId);
                  const statusBadge = getStatusBadge(booking.B_BookingStatus || booking.Status);
                  const priorityBadge = getPriorityBadge(booking.Priority || booking.priority);
                  const serviceTypeColor = getServiceTypeColor(booking.ServiceName || booking.serviceType);
                  
                  return (
                    <div 
                      key={booking.B_BookingID || booking.BookingID}
                      className="bg-white border border-slate-200/60 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:border-blue-200/60 group cursor-pointer"
                      onClick={() => navigate(`/admin/appointments/${booking.B_BookingID || booking.BookingID}`)}
                    >
                      {/* Header Section */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors text-lg">
                              {customerName}
                            </h4>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${statusBadge.color}`}>
                              {statusBadge.label}
                            </span>
                            {priorityBadge && (
                              <span className={`px-2 py-1 rounded text-xs font-medium ${priorityBadge.color}`}>
                                {priorityBadge.label}
                              </span>
                            )}
                          </div>
                          
                          {/* Customer Contact Info */}
                          <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-3">
                            {(booking.CustomerPhone || booking.phone) && (
                              <div className="flex items-center">
                                <FiPhone className="mr-1 text-slate-400" size={14} />
                                <span>{booking.CustomerPhone || booking.phone}</span>
                              </div>
                            )}
                            {(booking.CustomerEmail || booking.email) && (
                              <div className="flex items-center">
                                <FiMail className="mr-1 text-slate-400" size={14} />
                                <span>{booking.CustomerEmail || booking.email}</span>
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
                              <span className="text-slate-600">Model:</span>
                              <span className="font-medium text-slate-800">
                                {vehicleInfo.model}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Make:</span>
                              <span className="font-medium text-slate-800">
                                {vehicleInfo.make}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">License Plate:</span>
                              <span className="font-medium text-slate-800">
                                {vehicleInfo.licensePlate}
                              </span>
                            </div>
                            {vehicleInfo.year !== 'N/A' && (
                              <div className="flex justify-between">
                                <span className="text-slate-600">Year:</span>
                                <span className="font-medium text-slate-800">
                                  {vehicleInfo.year}
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
                              <span className="text-slate-600">Service Type:</span>
                              <span className={`font-medium ${serviceTypeColor}`}>
                                {booking.ServiceName || booking.serviceType || 'General Service'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Date & Time:</span>
                              <span className="font-medium text-slate-800">
                                {formatDateTime(booking.BookingDate || booking.B_BookingDate)}
                              </span>
                            </div>
                            {(booking.EstimatedHours || booking.estimatedDuration) && (
                              <div className="flex justify-between">
                                <span className="text-slate-600">Duration:</span>
                                <span className="font-medium text-slate-800">
                                  {booking.EstimatedHours || booking.estimatedDuration} hours
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Additional Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {/* Location & Notes */}
                        {(booking.Location || booking.location) && (
                          <div className="flex items-start space-x-2">
                            <FiMapPin className="text-slate-400 mt-0.5 flex-shrink-0" size={14} />
                            <span className="text-slate-600">
                              {booking.Location || booking.location}
                            </span>
                          </div>
                        )}
                        
                        {(booking.Notes || booking.notes || booking.SpecialInstructions) && (
                          <div className="flex items-start space-x-2">
                            <FiAlertCircle className="text-amber-400 mt-0.5 flex-shrink-0" size={14} />
                            <span className="text-slate-600">
                              {booking.Notes || booking.notes || booking.SpecialInstructions}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Footer with Amount and Actions */}
                      <div className="mt-3 pt-3 border-t border-slate-200/60 flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          {booking.TotalAmount && (
                            <div className="flex items-center text-slate-700">
                              <FiDollarSign className="mr-1 text-green-500" />
                              <span className="font-medium">Amount:</span>
                              <span className="ml-2 text-green-700 font-semibold text-lg">
                                Rs {parseFloat(booking.TotalAmount).toLocaleString()}
                              </span>
                            </div>
                          )}
                          
                          {(booking.AdvancePayment || booking.advancePaid) && (
                            <div className="flex items-center text-slate-600 text-sm">
                              <span className="font-medium">Advance:</span>
                              <span className="ml-1 text-amber-600">
                                Rs {parseFloat(booking.AdvancePayment || booking.advancePaid).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-xs text-slate-500">
                          Booking ID: {booking.B_BookingID || booking.BookingID || 'N/A'}
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
              
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100/60">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FiDollarSign className="text-green-600" />
                  </div>
                  <span className="text-slate-700 font-medium">Avg. Booking Value</span>
                </div>
                <span className="text-green-600 font-bold">Rs {stats.avgBookingValue.toFixed(0)}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100/60">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <FiCalendar className="text-amber-600" />
                  </div>
                  <span className="text-slate-700 font-medium">Today's Bookings</span>
                </div>
                <span className="text-slate-700 font-bold">{stats.todayAppointments}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-100/60">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FiTool className="text-purple-600" />
                  </div>
                  <span className="text-slate-700 font-medium">Total Revenue</span>
                </div>
                <span className="text-green-600 font-bold">Rs {stats.totalRevenue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trends Section */}
      {chartData.trends.length > 0 && (
        <div className="group relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-800 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-6">
            <h3 className="text-xl font-semibold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-6">
              Monthly Booking Trends
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'revenue') {
                        return [`Rs ${value.toLocaleString()}`, 'Revenue'];
                      }
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="bookings" 
                    stroke={LINE_COLOR} 
                    strokeWidth={3}
                    dot={{ fill: LINE_COLOR, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: LINE_COLOR, strokeWidth: 2 }}
                    name="Bookings"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#8b5cf6", strokeWidth: 2 }}
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;