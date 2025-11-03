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
  Search,
  ClipboardList,
  Package,
  Car
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { GetAllJobCards } from '../actions/jobCardActions';
import { GetAllTechnicians } from '../actions/jobCardActions';
import { fetchAllBookings } from '../services/adminServices';
import { authService } from '../services/authServices';
import { getBookingPartsByBookingID } from '../services/jobCardServices';
import { fetchAllParts, fetchAllServices } from '../services/jobCardItemServices';

const TechnicianDashboard = () => {
  const dispatch = useDispatch();
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
  const [technicianId, setTechnicianId] = useState(null);
  const [technicianName, setTechnicianName] = useState('');
  const [bookings, setBookings] = useState([]);
  const [parts, setParts] = useState([]);
  const [services, setServices] = useState([]);
  const [latestBookings, setLatestBookings] = useState([]);
  const [latestJobCards, setLatestJobCards] = useState([]);

  // Redux state
  const jobCardList = useSelector(state => state.jobCardList);
  const { jobCards = [] } = jobCardList || {};
  
  const technicianList = useSelector(state => state.technicianList);
  const { technicians = [] } = technicianList || {};

  useEffect(() => {
    initializeTechnician();
    loadDashboardData();
  }, []);

  const initializeTechnician = () => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      // Try to find technician ID from user data
      const techId = currentUser.TechnicianID || currentUser.technicianId || currentUser.id;
      const name = currentUser.FullName || currentUser.userName || currentUser.name || 'Technician';
      
      setTechnicianId(techId);
      setTechnicianName(name);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load all necessary data in parallel
      const [bookingsData, partsAndServices] = await Promise.all([
        fetchBookingsData(),
        fetchPartsAndServices()
      ]);

      setBookings(bookingsData);
      setParts(partsAndServices.parts);
      setServices(partsAndServices.services);

      // Dispatch Redux actions
      await Promise.all([
        dispatch(GetAllJobCards()),
        dispatch(GetAllTechnicians())
      ]);

      processDashboardData();
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingsData = async () => {
    try {
      const res = await fetchAllBookings();
      return res?.ResultSet || res?.Result || [];
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      return [];
    }
  };

  const fetchPartsAndServices = async () => {
    try {
      const [partsRes, servicesRes] = await Promise.all([
        fetchAllParts(),
        fetchAllServices()
      ]);
      return {
        parts: partsRes?.ResultSet || [],
        services: servicesRes?.ResultSet || []
      };
    } catch (error) {
      console.error('Failed to fetch parts/services:', error);
      return { parts: [], services: [] };
    }
  };

  const processDashboardData = () => {
    if (!jobCards || jobCards.length === 0) {
      console.log('No job cards available');
      return;
    }

    // Get latest 3 bookings sorted by date
    const sortedBookings = [...bookings]
      .sort((a, b) => new Date(b.B_CreatedDate || b.CreatedDate) - new Date(a.B_CreatedDate || a.CreatedDate))
      .slice(0, 3);
    
    setLatestBookings(sortedBookings);

    // Get latest 3 job cards sorted by date
    const sortedJobCards = [...jobCards]
      .sort((a, b) => new Date(b.J_CreatedDate || b.CreatedDate) - new Date(a.J_CreatedDate || a.CreatedDate))
      .slice(0, 3);
    
    setLatestJobCards(sortedJobCards);

    // Filter job cards for current technician
    const techJobCards = jobCards.filter(jobCard => {
      if (!technicianId) return true; // Show all if no technician ID
      
      // Match by technician name or ID
      return jobCard.J_Technician === technicianName || 
             jobCard.J_TechnicianID === technicianId ||
             jobCard.TechnicianID === technicianId;
    });

    console.log('Technician Job Cards:', techJobCards);

    // Calculate stats from actual data
    const scheduledJobs = techJobCards.filter(jc => 
      jc.J_JobCardStatus === 'Pending' || 
      jc.J_JobCardStatus === 'Scheduled' ||
      jc.Status === 'Pending' ||
      jc.Status === 'Scheduled'
    ).length;
    
    const inProgress = techJobCards.filter(jc => 
      jc.J_JobCardStatus === 'In Progress' ||
      jc.Status === 'In Progress'
    ).length;
    
    const completedToday = techJobCards.filter(jc => {
      const isCompleted = jc.J_JobCardStatus === 'Completed' || jc.Status === 'Completed';
      if (!isCompleted) return false;
      
      const today = new Date().toDateString();
      const completedDate = new Date(
        jc.J_CompletedDate || 
        jc.CompletedDate || 
        jc.J_CreatedDate || 
        jc.CreatedDate
      ).toDateString();
      return today === completedDate;
    }).length;

    // Calculate hours worked based on actual time data if available
    const hoursWorked = techJobCards
      .filter(jc => jc.J_JobCardStatus === 'Completed' || jc.Status === 'Completed')
      .reduce((total, jc) => {
        // Use actual hours if available, otherwise estimate
        if (jc.ActualHours || jc.HoursWorked) {
          return total + parseFloat(jc.ActualHours || jc.HoursWorked || 0);
        }
        // Estimate based on complexity
        const price = jc.Price || jc.TotalPrice || 0;
        const estimatedHours = price > 1000 ? 3 : price > 500 ? 2 : 1;
        return total + estimatedHours;
      }, 0);

    setStats({
      scheduledJobs,
      inProgress,
      completedToday,
      hoursWorked: Math.round(hoursWorked)
    });

    // Transform job cards to work orders using actual API data
    const transformedWorkOrders = techJobCards.map(jobCard => {
      // Find related booking information
      const relatedBooking = bookings.find(booking => 
        booking.B_BookingID === jobCard.J_BookingID ||
        booking.BookingID === jobCard.BookingID
      );

      // Find related services
      const jobServices = services.filter(service =>
        service.JobCardID === jobCard.J_JobCardID ||
        service.JobCardID === jobCard.JobCardID
      );

      const serviceNames = jobServices.map(s => s.S_ServiceName || s.ServiceName).join(', ') || 
                          jobCard.ServiceNames || 
                          'General Service';

      return {
        id: jobCard.J_JobCardID ? `WO-${jobCard.J_JobCardID}` : `JC-${jobCard.JobCardID}`,
        jobCardId: jobCard.J_JobCardID || jobCard.JobCardID,
        service: serviceNames,
        customer: jobCard.CustomerName || relatedBooking?.CustomerName || 'Customer',
        vehicle: jobCard.VehicleDetails || relatedBooking?.VehicleDetails || 'Vehicle',
        priority: getPriority(jobCard),
        estimatedTime: getEstimatedTime(jobCard),
        status: mapStatus(jobCard.J_JobCardStatus || jobCard.Status),
        bookingId: jobCard.J_BookingID || jobCard.BookingID,
        createdDate: jobCard.J_CreatedDate || jobCard.CreatedDate,
        actualHours: jobCard.ActualHours || jobCard.HoursWorked
      };
    });

    setWorkOrders(transformedWorkOrders);

    // Create today's schedule from pending/in-progress jobs
    const today = new Date().toDateString();
    const todayScheduleItems = techJobCards
      .filter(jc => {
        const status = jc.J_JobCardStatus || jc.Status;
        return status === 'Pending' || 
               status === 'In Progress' ||
               status === 'Scheduled';
      })
      .slice(0, 5) // Limit to 5 items
      .map((jc, index) => {
        const relatedBooking = bookings.find(booking => 
          booking.B_BookingID === jc.J_BookingID ||
          booking.BookingID === jc.BookingID
        );

        return {
          id: jc.J_JobCardID || jc.JobCardID,
          time: getScheduleTime(jc, index),
          task: jc.ServiceNames || 'Auto Service',
          customer: jc.CustomerName || relatedBooking?.CustomerName || 'Customer',
          status: mapScheduleStatus(jc.J_JobCardStatus || jc.Status),
          bookingId: jc.J_BookingID || jc.BookingID
        };
      });

    setTodaySchedule(todayScheduleItems);
  };

  const getPriority = (jobCard) => {
    // Determine priority based on actual job card data
    const price = jobCard.Price || jobCard.TotalPrice || 0;
    const priority = jobCard.Priority || jobCard.J_Priority;
    
    if (priority) {
      return priority.toLowerCase();
    }
    
    if (price > 1000) return 'high';
    if (price > 500) return 'medium';
    return 'low';
  };

  const getEstimatedTime = (jobCard) => {
    // Use actual estimated time if available
    if (jobCard.EstimatedTime || jobCard.J_EstimatedTime) {
      return jobCard.EstimatedTime || jobCard.J_EstimatedTime;
    }
    
    // Estimate time based on price/complexity
    const price = jobCard.Price || jobCard.TotalPrice || 0;
    if (price > 1000) return '3-4 hours';
    if (price > 500) return '2-3 hours';
    if (price > 200) return '1-2 hours';
    return '1 hour';
  };

  const getScheduleTime = (jobCard, index) => {
    // Use actual scheduled time if available
    if (jobCard.ScheduledTime || jobCard.J_ScheduledTime) {
      return jobCard.ScheduledTime || jobCard.J_ScheduledTime;
    }
    
    // Fallback to default times
    const times = ['8:00 AM', '9:30 AM', '11:00 AM', '1:30 PM', '3:00 PM'];
    return times[index] || `${8 + index * 1.5}:00 AM`;
  };

  const mapStatus = (status) => {
    if (!status) return 'scheduled';
    
    switch (status.toLowerCase()) {
      case 'in progress':
      case 'in_progress':
        return 'in-progress';
      case 'completed':
        return 'completed';
      case 'pending':
      case 'scheduled':
      default:
        return 'scheduled';
    }
  };

  const mapScheduleStatus = (status) => {
    return mapStatus(status);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleRefresh = () => {
    setLoading(true);
    loadDashboardData().finally(() => {
      setTimeout(() => setLoading(false), 500);
    });
  };

  const handleStartWorkOrder = async (workOrder) => {
    try {
      // Implement actual API call to start work order
      console.log('Starting work order:', workOrder);
      // await startWorkOrderAPI(workOrder.jobCardId);
      alert(`Starting work order: ${workOrder.id}`);
      // Refresh data after action
      loadDashboardData();
    } catch (error) {
      console.error('Failed to start work order:', error);
      alert('Failed to start work order');
    }
  };

  const handleMarkComplete = async (workOrder) => {
    try {
      // Implement actual API call to mark complete
      console.log('Marking complete:', workOrder);
      // await completeWorkOrderAPI(workOrder.jobCardId);
      alert(`Marking work order ${workOrder.id} as complete`);
      // Refresh data after action
      loadDashboardData();
    } catch (error) {
      console.error('Failed to mark work order complete:', error);
      alert('Failed to mark work order complete');
    }
  };

  const handleReportIssue = async (workOrder) => {
    try {
      // Implement actual API call to report issue
      console.log('Reporting issue for:', workOrder);
      // await reportIssueAPI(workOrder.jobCardId, issueDetails);
      alert(`Reporting issue for work order: ${workOrder.id}`);
    } catch (error) {
      console.error('Failed to report issue:', error);
      alert('Failed to report issue');
    }
  };

  const handleLogTime = async (workOrder) => {
    try {
      // Implement actual API call to log time
      console.log('Logging time for:', workOrder);
      // await logTimeAPI(workOrder.jobCardId, timeData);
      alert(`Logging time for work order: ${workOrder.id}`);
    } catch (error) {
      console.error('Failed to log time:', error);
      alert('Failed to log time');
    }
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Technician Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {technicianName} • Today's tasks and schedule overview
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {technicianId ? `ID: ${technicianId}` : 'Technician'}
            </span>
          </div>
        </div>
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

      {/* Latest Bookings and Job Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Latest Bookings */}
        <div className="analytics-card bg-white rounded-lg shadow p-5 border border-gray-200">
          <div className="card-header flex justify-between items-center mb-5">
            <h3 className="text-lg font-semibold text-gray-900">Latest Bookings</h3>
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div className="space-y-4">
            {latestBookings.map((booking, index) => (
              <div key={booking.B_BookingID || booking.BookingID} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-blue-800 text-lg">
                      {booking.B_BookingID ? `BKG-${booking.B_BookingID}` : `BK-${booking.BookingID}`}
                    </p>
                    <p className="text-gray-900 text-sm">
                      {booking.CustomerName || booking.B_CustomerName || 'Customer'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {booking.VehicleDetails || booking.B_VehicleDetails || 'Vehicle'}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(booking.B_CreatedDate || booking.CreatedDate)}
                  </span>
                </div>
                <div className="text-gray-700 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      (booking.B_Status || booking.Status) === 'Confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : (booking.B_Status || booking.Status) === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.B_Status || booking.Status || 'Unknown'}
                    </span>
                  </div>
                  {booking.Services && (
                    <div>
                      <span className="font-medium">Services: </span>
                      <span className="text-xs">{booking.Services}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {latestBookings.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No bookings found</p>
              </div>
            )}
          </div>
        </div>

        {/* Latest Job Cards */}
        <div className="analytics-card bg-white rounded-lg shadow p-5 border border-gray-200">
          <div className="card-header flex justify-between items-center mb-5">
            <h3 className="text-lg font-semibold text-gray-900">Latest Job Cards</h3>
            <ClipboardList className="h-5 w-5 text-green-600" />
          </div>
          <div className="space-y-4">
            {latestJobCards.map((jobCard) => (
              <div key={jobCard.J_JobCardID || jobCard.JobCardID} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-green-800 text-lg">
                      {jobCard.J_JobCardID ? `JC-${jobCard.J_JobCardID}` : `JOB-${jobCard.JobCardID}`}
                    </p>
                    <p className="text-gray-900 text-sm">
                      Technician: {jobCard.J_Technician || jobCard.TechnicianName || 'Unassigned'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Booking: {jobCard.J_BookingID || jobCard.BookingID}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(jobCard.J_CreatedDate || jobCard.CreatedDate)}
                  </span>
                </div>
                <div className="text-gray-700 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      (jobCard.J_JobCardStatus || jobCard.Status) === 'Completed' 
                        ? 'bg-green-100 text-green-800' 
                        : (jobCard.J_JobCardStatus || jobCard.Status) === 'In Progress'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {jobCard.J_JobCardStatus || jobCard.Status || 'Unknown'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Services: </span>
                    <span className="text-xs">{jobCard.ServiceNames || 'General Service'}</span>
                  </div>
                  {jobCard.J_TechnicianID && (
                    <div className="text-xs text-gray-500">
                      Tech ID: {jobCard.J_TechnicianID}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {latestJobCards.length === 0 && (
              <div className="text-center py-8">
                <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No job cards found</p>
              </div>
            )}
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
            <ClipboardList className="h-5 w-5 text-blue-600" />
          </div>
          
          {filteredWorkOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredWorkOrders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-blue-800 text-lg">{order.id}</p>
                      <p className="text-gray-900 text-lg">{order.service}</p>
                      <p className="text-sm text-gray-500">Booking: {order.bookingId}</p>
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
                    <div className="flex items-center">
                      <Car className="h-4 w-4 mr-1 text-gray-500" />
                      <span>{order.vehicle}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm">Est. Time: {order.estimatedTime}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        order.status === 'in-progress' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : order.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-3">
                    {order.status === 'scheduled' && (
                      <button
                        onClick={() => handleStartWorkOrder(order)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Start
                      </button>
                    )}
                    {order.status === 'in-progress' && (
                      <button
                        onClick={() => handleMarkComplete(order)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        Complete
                      </button>
                    )}
                    {order.status === 'in-progress' && (
                      <button
                        onClick={() => handleReportIssue(order)}
                        className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
                      >
                        Report Issue
                      </button>
                    )}
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
                  : 'No work orders assigned'}
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
            {todaySchedule.map((item) => (
              <div key={item.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
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
                  <p className="text-xs text-gray-500">Booking: {item.bookingId}</p>
                </div>
              </div>
            ))}
            {todaySchedule.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No scheduled tasks for today</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="analytics-card bg-white rounded-lg shadow p-5 border border-gray-200 mt-8">
        <div className="card-header flex justify-between items-center mb-5">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button 
            onClick={() => workOrders.length > 0 && handleStartWorkOrder(workOrders.find(wo => wo.status === 'scheduled'))}
            disabled={!workOrders.find(wo => wo.status === 'scheduled')}
            className="bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Wrench className="h-4 w-4 mr-2" />
            Start Work Order
          </button>
          <button 
            onClick={() => workOrders.length > 0 && handleMarkComplete(workOrders.find(wo => wo.status === 'in-progress'))}
            disabled={!workOrders.find(wo => wo.status === 'in-progress')}
            className="bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark Complete
          </button>
          <button 
            onClick={() => workOrders.length > 0 && handleReportIssue(workOrders.find(wo => wo.status === 'in-progress'))}
            disabled={!workOrders.find(wo => wo.status === 'in-progress')}
            className="bg-orange-500 text-white px-4 py-3 rounded-md hover:bg-orange-600 transition-colors flex items-center justify-center text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Report Issue
          </button>
          <button 
            onClick={() => workOrders.length > 0 && handleLogTime(workOrders.find(wo => wo.status === 'in-progress'))}
            disabled={!workOrders.find(wo => wo.status === 'in-progress')}
            className="bg-gray-600 text-white px-4 py-3 rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Clock className="h-4 w-4 mr-2" />
            Log Time
          </button>
        </div>
      </div>
    </div>
  );
};

export default TechnicianDashboard;