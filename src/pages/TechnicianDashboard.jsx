import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Tag, 
  AlertCircle, 
  Package, 
  Wrench, 
  Clock, 
  CheckCircle, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Car,
  TrendingUp,
  BarChart3,
  Settings,
  Bell,
  Menu,
  Home,
  Users,
  FileText,
  ShoppingCart,
  MapPin,
  Phone,
  Plus
} from 'lucide-react';
import { GetAllJobCards, GetAllTechnicians } from '../actions/jobCardActions';
import { GetAllJobCardItems } from '../actions/jobCardItemActions';
import { fetchAllParts, fetchAllServices } from '../services/jobCardItemServices';
import { getBookingPartsByBookingID } from '../services/jobCardServices';
import { getServicesByTechnicianID } from '../actions/appointmentActions';
import { authService } from '../services/authServices';
import dayjs from 'dayjs';

const TechnicianDashboard = () => {
  const dispatch = useDispatch();
  const jobCardList = useSelector(state => state.jobCardList);
  const { loading, jobCards, error } = jobCardList;
  
  const technicianList = useSelector(state => state.technicianList);
  const { loading: techniciansLoading, technicians = [], error: techniciansError } = technicianList || {};

  const jobCardItemList = useSelector(state => state.jobCardItemList);
  const { jobCardItems = [] } = jobCardItemList || {};

  // Get technician services from Redux store
  const appointmentList = useSelector(state => state.appointmentList);
  const { 
    technicianServices = [], 
    technicianServicesLoading, 
    technicianServicesError 
  } = appointmentList || {};

  const [searchTerm, setSearchTerm] = useState('');
  const [parts, setParts] = useState([]);
  const [partsLoading, setPartsLoading] = useState(false);
  const [partsError, setPartsError] = useState(null);
  const [bookingPartsMap, setBookingPartsMap] = useState({});
  const [servicesList, setServicesList] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Get current technician from auth service
  const [currentTechnician, setCurrentTechnician] = useState(null);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState('');

  // Combined loading and error states
  const isLoading = loading || techniciansLoading || partsLoading || servicesLoading || technicianServicesLoading;
  const hasError = error || techniciansError || partsError || servicesError || technicianServicesError;

  useEffect(() => {
    // Get current technician from auth service
    const loadCurrentTechnician = () => {
      try {
        const user = authService.getCurrentUser ? authService.getCurrentUser() : null;
        const rawUser = JSON.parse(localStorage.getItem('user') || 'null');
        
        // Try to get technician info from various sources
        const technicianId = user?.TechnicianID || user?.technicianId || rawUser?.TechnicianID || rawUser?.technicianId || localStorage.getItem('TechnicianID');
        const technicianName = user?.TechnicianName || user?.technicianName || rawUser?.TechnicianName || rawUser?.technicianName || localStorage.getItem('TechnicianName') || user?.UserName || user?.userName || rawUser?.UserName || rawUser?.userName;
        
        if (technicianId) {
          const tech = {
            id: technicianId,
            name: technicianName || `Technician ${technicianId}`
          };
          setCurrentTechnician(tech);
          setSelectedTechnicianId(technicianId);
        }
      } catch (err) {
        console.warn('Could not load current technician info:', err);
      }
    };

    loadCurrentTechnician();
    dispatch(GetAllJobCards());
    dispatch(GetAllTechnicians());
    dispatch(GetAllJobCardItems());
    fetchParts();
    fetchServices();
  }, [dispatch]);

  // Fetch technician services when selectedTechnicianId changes
  useEffect(() => {
    if (selectedTechnicianId) {
      dispatch(getServicesByTechnicianID(selectedTechnicianId));
    }
  }, [dispatch, selectedTechnicianId]);

  // When jobCards change, fetch booking-specific parts
  useEffect(() => {
    const fetchAllBookingParts = async () => {
      if (!Array.isArray(jobCards) || jobCards.length === 0) return;
      const map = {};
      for (const jc of jobCards) {
        try {
          const resp = await getBookingPartsByBookingID(jc.J_BookingID);
          if (resp?.StatusCode === 200) {
            map[jc.J_BookingID] = resp.ResultSet || [];
          } else {
            map[jc.J_BookingID] = [];
          }
        } catch (err) {
          console.warn(`Failed to fetch parts for booking ${jc.J_BookingID}:`, err);
          map[jc.J_BookingID] = [];
        }
      }
      setBookingPartsMap(map);
    };

    fetchAllBookingParts();
  }, [jobCards]);

  const fetchParts = async () => {
    try {
      setPartsLoading(true);
      const data = await fetchAllParts();
      if (data?.StatusCode === 200) {
        setParts(data.ResultSet || []);
        setPartsError(null);
      } else {
        setParts([]);
        setPartsError(data?.Message || 'Failed to load parts');
      }
    } catch (err) {
      console.error('Failed to fetch parts', err);
      setParts([]);
      setPartsError('Failed to load parts');
    } finally {
      setPartsLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      setServicesLoading(true);
      const data = await fetchAllServices();
      if (data?.StatusCode === 200) {
        setServicesList(data.ResultSet || []);
        setServicesError(null);
      } else {
        setServicesList([]);
        setServicesError(data?.Message || 'Failed to load services');
      }
    } catch (err) {
      console.error('Failed to fetch services', err);
      setServicesList([]);
      setServicesError('Failed to load services');
    } finally {
      setServicesLoading(false);
    }
  };

  const handleRefresh = () => {
    dispatch(GetAllJobCards());
    dispatch(GetAllTechnicians());
    dispatch(GetAllJobCardItems());
    fetchParts();
    fetchServices();
    
    if (selectedTechnicianId) {
      dispatch(getServicesByTechnicianID(selectedTechnicianId));
    }
  };

  const handleTechnicianChange = (technicianId) => {
    setSelectedTechnicianId(technicianId);
  };

  const toggleRowExpansion = (jobCardId) => {
    setExpandedRow(expandedRow === jobCardId ? null : jobCardId);
  };

  // Get status priority for sorting (Pending only)
  const getStatusPriority = (status) => {
    switch (status) {
      case 'Pending':
        return 1;
      default:
        return 2; // All other statuses have lower priority
    }
  };

  // Sort job cards by status priority first, then by JobCardID or CreatedDate (descending)
  const getSortedJobCards = (cards) => {
    if (!Array.isArray(cards) || cards.length === 0) return [];
    
    return [...cards].sort((a, b) => {
      // First sort by status priority
      const aStatusPriority = getStatusPriority(a.J_JobCardStatus);
      const bStatusPriority = getStatusPriority(b.J_JobCardStatus);
      
      if (aStatusPriority !== bStatusPriority) {
        return aStatusPriority - bStatusPriority; // Ascending order for priority (1,2)
      }
      
      // If same status, sort by JobCardID or CreatedDate (descending)
      const aId = parseInt(a.J_JobCardID || 0, 10);
      const bId = parseInt(b.J_JobCardID || 0, 10);
      
      if (aId && bId) {
        return bId - aId; // Descending order for IDs
      }
      
      // If JobCardID is not available, sort by CreatedDate
      const aDate = new Date(a.J_CreatedDate || 0);
      const bDate = new Date(b.J_CreatedDate || 0);
      
      return bDate - aDate; // Descending order (newest first)
    });
  };

  // Filter job cards for current technician and pending status
  const getTechnicianJobCards = () => {
    if (!Array.isArray(jobCards) || jobCards.length === 0) return [];
    
    return jobCards.filter(jobCard => {
      // Filter by technician if one is selected
      if (selectedTechnicianId) {
        const matchesTechnician = String(jobCard.J_TechnicianID || jobCard.TechnicianID || '') === String(selectedTechnicianId);
        if (!matchesTechnician) return false;
      }
      
      // Only show pending job cards
      return jobCard.J_JobCardStatus === 'Pending';
    });
  };

  // Deduplicate jobCards by J_BookingID and sort them
  const dedupedJobCards = (() => {
    const technicianCards = getTechnicianJobCards();
    if (technicianCards.length === 0) return [];
    
    const map = new Map();
    for (const jc of technicianCards) {
      const key = String(jc.J_BookingID || jc.J_JobCardID || '');
      if (!key) continue;
      const existing = map.get(key);
      if (!existing) {
        map.set(key, jc);
        continue;
      }
      const hasExistingTotals = (existing.Price !== undefined && existing.Price !== null && String(existing.Price).trim() !== '') || (existing.Quantity !== undefined && existing.Quantity !== null && String(existing.Quantity).trim() !== '');
      const hasNewTotals = (jc.Price !== undefined && jc.Price !== null && String(jc.Price).trim() !== '') || (jc.Quantity !== undefined && jc.Quantity !== null && String(jc.Quantity).trim() !== '');
      if (hasNewTotals && !hasExistingTotals) {
        map.set(key, jc);
      } else if (hasNewTotals === hasExistingTotals) {
        try {
          const a = parseInt(existing.J_JobCardID || 0, 10) || 0;
          const b = parseInt(jc.J_JobCardID || 0, 10) || 0;
          if (b >= a) map.set(key, jc);
        } catch (e) {
          map.set(key, jc);
        }
      }
    }
    
    const dedupedCards = Array.from(map.values());
    return getSortedJobCards(dedupedCards);
  })();

  // Filter job cards for search term
  const filteredJobCards = dedupedJobCards && dedupedJobCards.length > 0
    ? dedupedJobCards.filter(jobCard => {
        // If no search term, return all job cards
        if (!searchTerm.trim()) return true;

        const term = searchTerm.toLowerCase();
        const bookingId = String(jobCard.J_BookingID || '').toLowerCase();
        const technician = String(jobCard.J_Technician || '').toLowerCase();
        const status = String(jobCard.J_JobCardStatus || '').toLowerCase();
        const services = String(jobCard.ServiceNames || '').toLowerCase();
        const plateNumber = String(jobCard.VehiclePlateNumber || '').toLowerCase();
        const make = String(jobCard.VehicleMake || '').toLowerCase();
        const model = String(jobCard.VehicleModel || '').toLowerCase();
        const vin = String(jobCard.VehicleVIN || '').toLowerCase();
        
        const itemsForCard = Array.isArray(jobCardItems) ? jobCardItems.filter(it => String(it.J_JobCardID) === String(jobCard.J_JobCardID)) : [];
        const partsString = itemsForCard.map(it => {
          const part = parts.find(p => String(p?.P_PartID) === String(it.J_PartID));
          return part?.P_PartName || String(it.J_PartID || '');
        }).join(', ').toLowerCase();

        const matchesSearch =
          bookingId.includes(term) ||
          technician.includes(term) ||
          status.includes(term) ||
          services.includes(term) ||
          plateNumber.includes(term) ||
          make.includes(term) ||
          model.includes(term) ||
          vin.includes(term) ||
          partsString.toLowerCase().includes(term);

        return matchesSearch;
      })
    : [];

  // Apply sorting to filtered job cards as well
  const sortedFilteredJobCards = getSortedJobCards(filteredJobCards);

  // Calculate job card stats
  const technicianJobCards = sortedFilteredJobCards;

  const totalJobCards = technicianJobCards.length;
  const pendingJobs = technicianJobCards.filter(jobCard => jobCard.J_JobCardStatus === 'Pending').length;

  // Calculate technician services stats from your backend API response
  const technicianServicesStats = {
    totalServices: technicianServices.length,
    completedServices: technicianServices.filter(service => service.B_BookingStatus === 'Completed').length,
    pendingServices: technicianServices.filter(service => service.B_BookingStatus === 'Pending').length,
    inProgressServices: technicianServices.filter(service => service.B_BookingStatus === 'In Progress').length,
  };

  const jobCardStats = {
    totalJobCards,
    pendingJobs
  };

  const getPartName = (partId) => {
    const p = parts.find(x => String(x?.P_PartID) === String(partId));
    return p?.P_PartName || `#${partId}`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'In Progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-amber-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return dayjs(dateString).format('MMM DD, YYYY');
    } catch (error) {
      return dateString;
    }
  };

  // Dashboard Components
  const StatCard = ({ title, value, icon, color, subtitle, trend }) => {
    const IconComponent = icon;
    return (
      <div className="stat-card bg-white rounded-2xl shadow-lg border-0 p-6 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <div className="flex items-baseline">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {trend && (
                <span className={`ml-2 text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trend > 0 ? '+' : ''}{trend}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
            <IconComponent className={`text-xl ${color}`} />
          </div>
        </div>
      </div>
    );
  };

  const QuickAction = ({ icon, title, description, onClick, color }) => (
    <button
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-300 text-left group hover:border-blue-300"
    >
      <div className={`p-2 rounded-lg ${color} bg-opacity-10 w-fit mb-3 group-hover:scale-110 transition-transform`}>
        {React.cloneElement(icon, {
          className: `text-lg ${color}`
        })}
      </div>
      <h4 className="font-semibold text-gray-900 text-sm mb-1">{title}</h4>
      <p className="text-xs text-gray-600">{description}</p>
    </button>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-600 text-base font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="bg-white rounded-2xl p-8 max-w-md mx-auto text-center shadow-lg">
          <div className="h-12 w-12 text-red-500 mx-auto mb-4">
            <AlertCircle className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-600 text-base font-medium mb-4">
            {error || techniciansError || technicianServicesError || 'Failed to load dashboard data'}
          </p>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 text-base font-medium flex items-center mx-auto border-0"
          >
            <Clock className="h-4 w-4 mr-2" />
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
              <h1 className="text-2xl font-bold text-white mb-2">Technician Dashboard</h1>
              <p className="text-blue-100">
                {currentTechnician 
                  ? `Welcome back, ${currentTechnician.name}!` 
                  : 'Manage your job cards and services efficiently'
                }
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {/* Technician Selector */}
              <select
                value={selectedTechnicianId}
                onChange={(e) => handleTechnicianChange(e.target.value)}
                className="bg-white text-gray-800 rounded-lg h-10 px-4 font-medium border-0 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="">All Technicians</option>
                {currentTechnician && (
                  <option value={currentTechnician.id}>
                    {currentTechnician.name} (Me)
                  </option>
                )}
                {Array.isArray(technicians) && technicians
                  .filter(tech => !currentTechnician || tech.TechnicianID !== currentTechnician.id)
                  .map(tech => (
                    <option key={tech.TechnicianID} value={tech.TechnicianID}>
                      {tech.TechnicianName || `Technician ${tech.TechnicianID}`}
                    </option>
                  ))
                }
              </select>
              <button
                onClick={handleRefresh}
                className="bg-white text-blue-600 rounded-lg hover:bg-blue-50 h-10 px-4 font-medium flex items-center border-0"
              >
                <Clock className="h-4 w-4 mr-2" />
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Pending Jobs"
            value={jobCardStats.totalJobCards}
            icon={ClipboardList}
            color="text-blue-600"
            subtitle={selectedTechnicianId ? "Your pending jobs" : "All pending jobs"}
          />
          <StatCard
            title="High Priority"
            value={jobCardStats.pendingJobs}
            icon={AlertCircle}
            color="text-amber-600"
            subtitle="Require immediate attention"
          />
          <StatCard
            title="Technician Services"
            value={technicianServicesStats.totalServices}
            icon={Wrench}
            color="text-green-600"
            subtitle={selectedTechnicianId ? `Services assigned` : 'Select technician'}
          />
          <StatCard
            title="Completed Services"
            value={technicianServicesStats.completedServices}
            icon={CheckCircle}
            color="text-purple-600"
            subtitle={selectedTechnicianId ? "Your completed work" : "All technicians"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions & Technician Services */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg border-0 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <QuickAction
                  icon={<ClipboardList className="text-blue-600" />}
                  title="Start New Job"
                  description="Begin working on a new job card"
                  color="text-blue-600"
                  onClick={() => setActiveTab('jobs')}
                />
                <QuickAction
                  icon={<Package className="text-green-600" />}
                  title="Check Inventory"
                  description="View available parts and supplies"
                  color="text-green-600"
                />
                <QuickAction
                  icon={<BarChart3 className="text-purple-600" />}
                  title="View Reports"
                  description="Performance and completion reports"
                  color="text-purple-600"
                />
                <QuickAction
                  icon={<Users className="text-amber-600" />}
                  title="Customer Info"
                  description="Access customer vehicle history"
                  color="text-amber-600"
                />
              </div>
            </div>

            {/* Technician Services Section */}
            {selectedTechnicianId && (
              <div className="bg-white rounded-2xl shadow-lg border-0 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-blue-600" />
                  {currentTechnician && selectedTechnicianId === currentTechnician.id ? 'My Services' : 'Technician Services'}
                </h3>
                {technicianServicesLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-600 text-sm mt-2">Loading services...</p>
                  </div>
                ) : technicianServicesError ? (
                  <div className="text-center py-4 text-red-600 text-sm">
                    <AlertCircle className="h-5 w-5 mx-auto mb-2" />
                    {technicianServicesError}
                  </div>
                ) : technicianServices.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {technicianServices.map((service, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-sm text-gray-900">
                            {service.B_ServiceName || 'Unnamed Service'}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.B_BookingStatus)}`}>
                            {getStatusIcon(service.B_BookingStatus)}
                            <span className="ml-1">{service.B_BookingStatus}</span>
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="flex justify-between">
                            <span>Customer:</span>
                            <span className="font-medium">{service.B_CustomerName || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Vehicle:</span>
                            <span className="font-medium">{service.B_VehicleMake} {service.B_VehicleModel}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Plate:</span>
                            <span className="font-medium">{service.B_VehiclePlateNumber || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Booking Date:</span>
                            <span className="font-medium">{formatDate(service.B_BookingDate)}</span>
                          </div>
                          {service.B_StartTime && service.B_EndTime && (
                            <div className="flex justify-between">
                              <span>Time Slot:</span>
                              <span className="font-medium">{service.B_StartTime} - {service.B_EndTime}</span>
                            </div>
                          )}
                          {service.B_JobCardID && (
                            <div className="flex justify-between">
                              <span>Job Card:</span>
                              <span className="font-medium">JC-{service.B_JobCardID}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Wrench className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No services found for this technician</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Job Cards Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedTechnicianId ? 'My Job Cards' : 'All Job Cards'} (Pending Only)
                  </h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search jobs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-64"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6">
                {sortedFilteredJobCards.length > 0 ? (
                  <div className="space-y-4">
                    {sortedFilteredJobCards.map((jobCard) => (
                      <div key={jobCard.J_JobCardID} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                        {/* Job Card Header */}
                        <div 
                          className="p-4 hover:bg-blue-50 transition-colors cursor-pointer"
                          onClick={() => toggleRowExpansion(jobCard.J_JobCardID)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRowExpansion(jobCard.J_JobCardID);
                                }}
                                className="text-gray-500 hover:text-gray-700 p-1 rounded"
                              >
                                {expandedRow === jobCard.J_JobCardID ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </button>
                              <div>
                                <div className="font-semibold text-gray-900">
                                  JC-{String(jobCard.J_JobCardID).padStart(4, '0')}
                                </div>
                                <div className="text-sm text-gray-500">Booking: {jobCard.J_BookingID}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <div className="font-medium text-gray-900">
                                  {jobCard.VehicleMake} {jobCard.VehicleModel}
                                </div>
                                <div className="text-sm text-gray-500">{jobCard.VehiclePlateNumber}</div>
                              </div>
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(jobCard.J_JobCardStatus)}`}>
                                {getStatusIcon(jobCard.J_JobCardStatus)}
                                <span className="ml-1">{jobCard.J_JobCardStatus}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedRow === jobCard.J_JobCardID && (
                          <div className="border-t border-gray-200 p-6 bg-white">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              {/* Vehicle Details */}
                              <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                  <Car className="h-4 w-4 text-purple-500" />
                                  Vehicle Details
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Plate:</span>
                                    <span className="font-medium">{jobCard.VehiclePlateNumber}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Make & Model:</span>
                                    <span className="font-medium">{jobCard.VehicleMake} {jobCard.VehicleModel}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Year:</span>
                                    <span className="font-medium">{jobCard.VehicleYear}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">VIN:</span>
                                    <span className="font-medium font-mono">{jobCard.VehicleVIN}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Services */}
                              <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                  <Wrench className="h-4 w-4 text-blue-500" />
                                  Services
                                </h4>
                                <div className="space-y-2">
                                  {String(jobCard.ServiceNames || '')
                                    .split(',')
                                    .map(s => s.trim())
                                    .filter(Boolean)
                                    .map((serviceName, index) => (
                                      <div key={index} className="text-sm text-gray-700 bg-white px-3 py-2 rounded border">
                                        {serviceName}
                                      </div>
                                    ))}
                                  {(!jobCard.ServiceNames || String(jobCard.ServiceNames).trim() === '') && (
                                    <div className="text-sm text-gray-500">No services assigned</div>
                                  )}
                                </div>
                              </div>

                              {/* Parts */}
                              <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                  <Package className="h-4 w-4 text-green-500" />
                                  Parts
                                </h4>
                                <div className="space-y-2">
                                  {(() => {
                                    const bookingParts = bookingPartsMap[jobCard.J_BookingID] || [];
                                    const itemsForCard = Array.isArray(jobCardItems) ? jobCardItems.filter(it => String(it.J_JobCardID) === String(jobCard.J_JobCardID)) : [];
                                    
                                    if (bookingParts.length > 0) {
                                      return bookingParts.map((part, index) => {
                                        const partName = part.PartName || part.P_PartName || getPartName(part.PartID || part.P_PartID);
                                        const qty = parseInt(part.Quantity || part.Qty || 0, 10) || 0;
                                        
                                        return (
                                          <div key={index} className="text-sm bg-white px-3 py-2 rounded border">
                                            <div className="font-medium text-gray-700">{partName}</div>
                                            <div className="text-gray-600">Qty: {qty}</div>
                                          </div>
                                        );
                                      });
                                    } else if (itemsForCard.length > 0) {
                                      return itemsForCard.map((item, index) => {
                                        const partName = getPartName(item.J_PartID);
                                        const qty = parseInt(item.J_Qty || 0, 10) || 0;
                                        
                                        return (
                                          <div key={index} className="text-sm bg-white px-3 py-2 rounded border">
                                            <div className="font-medium text-gray-700">{partName}</div>
                                            <div className="text-gray-600">Qty: {qty}</div>
                                          </div>
                                        );
                                      });
                                    } else {
                                      return (
                                        <div className="text-sm text-gray-500">No parts assigned</div>
                                      );
                                    }
                                  })()}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ClipboardList className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-base font-medium mb-2">
                      {dedupedJobCards && dedupedJobCards.length > 0
                        ? 'No pending job cards match your search criteria'
                        : selectedTechnicianId 
                          ? 'No pending job cards assigned to you'
                          : 'No pending job cards found'
                      }
                    </p>
                    <button
                      onClick={handleRefresh}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium inline-flex items-center"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Refresh Job Cards
                    </button>
                  </div>
                )}
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
    </div>
  );
};

export default TechnicianDashboard;