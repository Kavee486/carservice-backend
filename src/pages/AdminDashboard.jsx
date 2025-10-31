// AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, Car, DollarSign, Clock,
  Plus, FileText, Settings, Search, Bell, ChevronDown,
  AlertCircle, CheckCircle, ChevronRight, MoreVertical,
  TrendingUp, User, Shield, Wrench, Package, BarChart3
} from 'lucide-react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  PointElement,
  LineElement,
  ArcElement,
  Filler
} from 'chart.js';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getDashboardStats } from '../actions/adminActions';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
  Filler
);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('monthly');
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { dashboardStats } = useSelector(state => state.admin);
  const { loading, data: statsData, error } = dashboardStats;

  useEffect(() => {
    dispatch(getDashboardStats());
  }, [dispatch]);

  // Calculate stats from the data
  const calculateStats = () => {
    if (!statsData) return {
      totalUsers: 0,
      todayAppointments: 0,
      vehiclesServiced: 0,
      monthlyRevenue: 0,
      totalBookings: 0,
      totalParts: 0
    };

    const today = new Date().toISOString().split('T')[0];
    
    // Calculate today's appointments
    const todayAppointments = statsData.bookings?.filter(booking => 
      booking.BookingDate?.split('T')[0] === today
    ).length || 0;

    // Calculate monthly revenue (assuming each booking has a total amount)
    const monthlyRevenue = statsData.bookings?.reduce((total, booking) => {
      const bookingDate = new Date(booking.BookingDate);
      const currentDate = new Date();
      
      if (bookingDate.getMonth() === currentDate.getMonth() && 
          bookingDate.getFullYear() === currentDate.getFullYear()) {
        return total + (parseFloat(booking.TotalAmount) || 0);
      }
      return total;
    }, 0) || 0;

    return {
      totalUsers: statsData.users?.length || 0,
      todayAppointments,
      vehiclesServiced: statsData.vehicles?.length || 0,
      monthlyRevenue,
      totalBookings: statsData.bookings?.length || 0,
      totalParts: statsData.parts?.length || 0
    };
  };

  const stats = calculateStats();

  // Data for charts - use fallback data if statsData is null
  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue (Rs)',
        data: [32000, 38000, 42000, 39000, 45000, 48000, 52000, 55000, 58000, 62000, 65000, 69000],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  // Safe access to services data with fallback
  const serviceLabels = statsData?.services?.slice(0, 5).map(service => service.S_ServiceName) || 
                        ['Oil Change', 'Tire Rotation', 'Brake Service', 'AC Repair', 'Other'];
  
  const serviceDistributionData = {
    labels: serviceLabels,
    datasets: [
      {
        label: 'Services Performed',
        data: [120, 85, 65, 45, 30],
        backgroundColor: [
          'rgba(59, 130, 246, 0.9)',
          'rgba(16, 185, 129, 0.9)',
          'rgba(245, 158, 11, 0.9)',
          'rgba(139, 92, 246, 0.9)',
          'rgba(100, 116, 139, 0.9)',
        ],
        borderWidth: 0,
        hoverOffset: 12,
      },
    ],
  };

  const customerGrowthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'New Customers',
        data: [120, 145, 180, 210, 240, 290, 320, 350, 380, 410, 440, 480],
        fill: true,
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 3,
        tension: 0.4,
        pointBackgroundColor: 'rgba(16, 185, 129, 1)',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const StatCard = ({ title, value, icon, color, progress, onClick }) => {
    const IconComponent = icon;
    return (
      <div 
        onClick={onClick}
        className="stat-card bg-white rounded-2xl shadow-lg border-0 p-4 hover:shadow-xl transition-all duration-300 cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-gray-500 mb-1">{title}</div>
            <div className="text-xl font-bold text-gray-900">{value}</div>
            {progress !== undefined && (
              <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
                <div
                  className={`h-1 rounded-full ${color}`}
                  style={{ width: '100%' }}
                ></div>
              </div>
            )}
          </div>
          <div className={`p-2 rounded-full ${color} bg-opacity-10`}>
            <IconComponent className={`text-lg ${color}`} />
          </div>
        </div>
      </div>
    );
  };

  const statsCards = [
    { 
      icon: Users, 
      label: 'Total Users', 
      value: stats.totalUsers.toLocaleString(), 
      color: 'text-blue-600',
      onClick: () => navigate('/admin/customers')
    },
    { 
      icon: Calendar, 
      label: "Today's Appointments", 
      value: stats.todayAppointments, 
      color: 'text-green-600',
      onClick: () => navigate('/admin/appointments')
    },
    { 
      icon: Car, 
      label: 'Vehicles Serviced', 
      value: stats.vehiclesServiced.toLocaleString(), 
      color: 'text-amber-600',
      onClick: () => navigate('/admin/vehicles')
    },
    { 
      icon: DollarSign, 
      label: 'Monthly Revenue', 
      value: `Rs ${stats.monthlyRevenue.toLocaleString()}`, 
      color: 'text-purple-600',
      onClick: () => navigate('/admin/reports')
    },
    { 
      icon: FileText, 
      label: 'Total Bookings', 
      value: stats.totalBookings.toLocaleString(), 
      color: 'text-blue-600',
      onClick: () => navigate('/admin/appointments')
    },
    { 
      icon: Package, 
      label: 'Parts Inventory', 
      value: stats.totalParts.toLocaleString(), 
      color: 'text-orange-600',
      onClick: () => navigate('/admin/parts')
    }
  ];

  // Safe access to bookings data with fallback
  const recentAppointments = statsData?.bookings?.slice(0, 5).map(booking => ({
    id: booking.BookingID,
    customer: booking.CustomerName || 'Customer',
    service: booking.ServiceName || 'Service',
    time: new Date(booking.BookingDate).toLocaleTimeString(),
    status: booking.Status || 'Scheduled',
    technician: booking.TechnicianName || 'Technician'
  })) || [
    { id: 1, customer: 'John Doe', service: 'Oil Change', time: '9:00 AM', status: 'In Progress', technician: 'Mike Wilson' },
    { id: 2, customer: 'Sarah Smith', service: 'Brake Inspection', time: '10:30 AM', status: 'Completed', technician: 'Emma Johnson' },
    { id: 3, customer: 'Robert Lee', service: 'Tire Rotation', time: '2:00 PM', status: 'Scheduled', technician: 'Alex Chen' },
    { id: 4, customer: 'Maria Garcia', service: 'AC Repair', time: '3:30 PM', status: 'Scheduled', technician: 'Sam Davis' },
    { id: 5, customer: 'James Wilson', service: 'Battery Replacement', time: '4:45 PM', status: 'Completed', technician: 'Taylor Brown' }
  ];

  const recentActivities = [
    { id: 1, action: 'New customer registered', time: '2 mins ago', icon: Users, color: 'text-blue-600' },
    { id: 2, action: 'Appointment completed', time: '15 mins ago', icon: CheckCircle, color: 'text-green-600' },
    { id: 3, action: 'New service added', time: '1 hour ago', icon: Plus, color: 'text-purple-600' },
    { id: 4, action: 'System update', time: '3 hours ago', icon: Settings, color: 'text-gray-600' },
    { id: 5, action: 'Maintenance alert', time: '5 hours ago', icon: AlertCircle, color: 'text-amber-600' }
  ];

  const quickActions = [
    { 
      id: 1, 
      title: 'Add Appointment', 
      icon: Calendar, 
      color: 'bg-blue-500',
      onClick: () => navigate('/admin/appointments/new')
    },
    { 
      id: 2, 
      title: 'New Customer', 
      icon: User, 
      color: 'bg-green-500',
      onClick: () => navigate('/admin/customers/new')
    },
    { 
      id: 3, 
      title: 'Add Service', 
      icon: Wrench, 
      color: 'bg-amber-500',
      onClick: () => navigate('/admin/services')
    },
    { 
      id: 4, 
      title: 'Manage Vehicles', 
      icon: Car, 
      color: 'bg-purple-500',
      onClick: () => navigate('/admin/vehicles')
    },
    { 
      id: 5, 
      title: 'Parts Inventory', 
      icon: Package, 
      color: 'bg-orange-500',
      onClick: () => navigate('/admin/parts')
    },
    { 
      id: 6, 
      title: 'User Management', 
      icon: Shield, 
      color: 'bg-blue-600',
      onClick: () => navigate('/admin/customers')
    }
  ];

  if (loading) {
    return (
      <div className="h-full p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-600 text-base font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full p-4 md:p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-md mx-auto text-center shadow-lg">
          <div className="h-12 w-12 text-red-500 mx-auto mb-4">
            <AlertCircle className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-600 text-base font-medium mb-4">Error loading dashboard: {error}</p>
          <button 
            onClick={() => dispatch(getDashboardStats())}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 text-base font-medium flex items-center mx-auto border-0"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-4 md:p-6">
      <div className="w-full space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg text-white p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Admin Dashboard</h1>
              <p className="text-blue-100">Comprehensive overview of your auto service business</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => dispatch(getDashboardStats())}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-0 rounded-lg h-10 px-4 font-medium backdrop-blur-sm flex items-center"
              >
                <Settings className="h-4 w-4 mr-2" />
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {statsCards.map((card, index) => (
            <StatCard
              key={index}
              title={card.label}
              value={card.value}
              icon={card.icon}
              color={card.color}
              progress
              onClick={card.onClick}
            />
          ))}
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Revenue Overview</h3>
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="p-6 h-72">
                <Bar 
                  data={revenueData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleFont: {
                          size: 13
                        },
                        bodyFont: {
                          size: 13
                        },
                        callbacks: {
                          label: function(context) {
                            return `Rs ${context.raw.toLocaleString()}`;
                          }
                        }
                      }
                    },
                    scales: {
                      x: {
                        grid: {
                          display: false
                        },
                        ticks: {
                          font: {
                            size: 11
                          }
                        }
                      },
                      y: {
                        grid: {
                          color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                          font: {
                            size: 11
                          },
                          callback: function(value) {
                            return 'Rs ' + value.toLocaleString();
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Service Distribution */}
          <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Service Distribution</h3>
                <Package className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="p-6 h-72">
              <Pie 
                data={serviceDistributionData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        font: {
                          size: 11
                        },
                        padding: 15
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleFont: {
                        size: 13
                      },
                      bodyFont: {
                        size: 13
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Growth Chart */}
          <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Customer Growth</h3>
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="p-6 h-72">
              <Line 
                data={customerGrowthData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleFont: {
                        size: 13
                      },
                      bodyFont: {
                        size: 13
                      }
                    }
                  },
                  scales: {
                    x: {
                      grid: {
                        display: false
                      },
                      ticks: {
                        font: {
                          size: 11
                        }
                      }
                    },
                    y: {
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                      },
                      ticks: {
                        font: {
                          size: 11
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Quick Actions</h3>
                <Plus className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <button 
                    key={action.id} 
                    onClick={action.onClick}
                    className="flex flex-col items-center justify-center p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors duration-200 cursor-pointer border-0"
                  >
                    <div className={`p-3 rounded-full ${action.color} text-white mb-2`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 text-center">{action.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Activity and Recent Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Appointments */}
          <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Recent Appointments</h3>
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-base font-medium">
                          {appointment.customer.charAt(0)}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">{appointment.customer}</span>
                        <span className="block text-sm text-gray-500">{appointment.service}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-sm font-medium text-gray-900">{appointment.time}</span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        appointment.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'In Progress' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Recent Activities</h3>
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200">
                    <div className={`flex-shrink-0 p-2 rounded-full ${activity.color} bg-opacity-10`}>
                      <activity.icon className={`h-5 w-5 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-medium text-gray-900 truncate">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .stat-card {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;