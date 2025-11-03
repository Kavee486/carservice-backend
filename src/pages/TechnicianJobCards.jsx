// components/TechnicianJobCards.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ClipboardList, Search, Filter, Calendar, User, Tag, AlertCircle, Package, Wrench, Clock, CheckCircle, X, ChevronDown, ChevronUp, Car } from 'lucide-react';
import { GetAllJobCards, GetAllTechnicians } from '../actions/jobCardActions';
import { GetAllJobCardItems } from '../actions/jobCardItemActions';
import { fetchAllParts, fetchAllServices } from '../services/jobCardItemServices';
import { getBookingPartsByBookingID } from '../services/jobCardServices';
import dayjs from 'dayjs';

const TechnicianJobCards = () => {
  const dispatch = useDispatch();
  const jobCardList = useSelector(state => state.jobCardList);
  const { loading, jobCards, error } = jobCardList;
  
  const technicianList = useSelector(state => state.technicianList);
  const { loading: techniciansLoading, technicians = [], error: techniciansError } = technicianList || {};

  const jobCardItemList = useSelector(state => state.jobCardItemList);
  const { jobCardItems = [] } = jobCardItemList || {};

  const [searchTerm, setSearchTerm] = useState('');
  const [parts, setParts] = useState([]);
  const [partsLoading, setPartsLoading] = useState(false);
  const [partsError, setPartsError] = useState(null);
  const [bookingPartsMap, setBookingPartsMap] = useState({});
  const [servicesList, setServicesList] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  // Get current technician
  const [currentTechnician, setCurrentTechnician] = useState(null);

  // Combined loading and error states
  const isLoading = loading || techniciansLoading || partsLoading || servicesLoading;
  const hasError = error || techniciansError || partsError || servicesError;

  useEffect(() => {
    dispatch(GetAllJobCards());
    dispatch(GetAllTechnicians());
    dispatch(GetAllJobCardItems());
    fetchParts();
    fetchServices();
  }, [dispatch]);

  // Debug logging
  useEffect(() => {
    console.log('=== TECHNICIAN JOB CARDS DEBUG ===');
    console.log('Technicians:', technicians);
    console.log('Current Technician:', currentTechnician);
    console.log('All Job Cards:', jobCards?.length);
    console.log('Job Cards sample:', jobCards?.slice(0, 3));
    
    if (jobCards && currentTechnician) {
      const matchingCards = jobCards.filter(jc => {
        const jobCardTechName = String(jc.J_Technician || '').trim().toLowerCase();
        const currentTechName = String(currentTechnician.FullName || '').trim().toLowerCase();
        return jobCardTechName === currentTechName;
      });
      console.log('Job cards matching current technician:', matchingCards.length);
      console.log('All technician names in job cards:', [...new Set(jobCards.map(jc => jc.J_Technician))]);
    }
  }, [technicians, currentTechnician, jobCards]);

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
  };

  const toggleRowExpansion = (jobCardId) => {
    setExpandedRow(expandedRow === jobCardId ? null : jobCardId);
  };

  // Deduplicate jobCards by J_BookingID
  const dedupedJobCards = (() => {
    if (!Array.isArray(jobCards) || jobCards.length === 0) return [];
    const map = new Map();
    for (const jc of jobCards) {
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
    return Array.from(map.values());
  })();

  // Filter job cards for current technician and search term - FIXED VERSION
  const filteredJobCards = dedupedJobCards && dedupedJobCards.length > 0
    ? dedupedJobCards.filter(jobCard => {
        // Fixed technician filtering - more flexible matching
        if (currentTechnician) {
          const jobCardTechName = String(jobCard.J_Technician || '').trim().toLowerCase();
          const currentTechName = String(currentTechnician.FullName || '').trim().toLowerCase();
          
          if (jobCardTechName !== currentTechName) {
            return false;
          }
        }

        // If no search term, return all for current technician
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

  // Calculate job card stats - FIXED VERSION
  const technicianJobCards = filteredJobCards; // Use filteredJobCards directly

  const totalJobCards = technicianJobCards.length;
  const pendingJobs = technicianJobCards.filter(jobCard => jobCard.J_JobCardStatus === 'Pending').length;
  const inProgressJobs = technicianJobCards.filter(jobCard => jobCard.J_JobCardStatus === 'In Progress').length;
  const completedJobs = technicianJobCards.filter(jobCard => jobCard.J_JobCardStatus === 'Completed').length;

  const jobCardStats = {
    totalJobCards,
    pendingJobs,
    inProgressJobs,
    completedJobs
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

  const StatCard = ({ title, value, icon, color, progress }) => (
    <div className="stat-card bg-white rounded-2xl shadow-lg border-0 p-4 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-medium text-gray-500 mb-1">{title}</div>
          <div className="text-xl font-bold text-gray-900">{value}</div>
          {progress !== undefined && (
            <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
              <div
                className={`h-1 rounded-full ${color}`}
                style={{ width: `${Math.round((value / Math.max(jobCardStats.totalJobCards, 1)) * 100)}%` }}
              ></div>
            </div>
          )}
        </div>
        <div className={`p-2 rounded-full ${color} bg-opacity-10`}>
          {React.cloneElement(icon, {
            className: `text-lg ${color}`
          })}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="h-full p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-600 text-base font-medium">Loading job cards and technicians...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="h-full p-4 md:p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-md mx-auto text-center shadow-lg">
          <div className="h-12 w-12 text-red-500 mx-auto mb-4">
            <AlertCircle className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-600 text-base font-medium mb-4">
            {error || techniciansError || 'Failed to load data'}
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
              <h1 className="text-2xl font-bold text-white mb-2">Technician Job Cards</h1>
              <p className="text-blue-100">View and manage your assigned job cards</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-0 rounded-lg h-10 px-4 font-medium backdrop-blur-sm flex items-center"
              >
                <Clock className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Technician Selection */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <User className="text-blue-600 text-base mr-2" />
              <span className="text-base font-semibold text-gray-900">Select Technician</span>
            </div>
          </div>
          <div className="mt-3">
            <select
              value={currentTechnician ? currentTechnician.TechnicianID : ''}
              onChange={(e) => {
                const techId = e.target.value;
                if (techId === '') {
                  setCurrentTechnician(null); // Show all technicians
                } else {
                  const tech = technicians.find(t => t.TechnicianID === techId);
                  setCurrentTechnician(tech || null);
                }
              }}
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            >
              <option value="">All Technicians</option>
              {technicians
                .filter(tech => tech.Status === 'A') // Only active technicians
                .map(tech => (
                  <option key={tech.TechnicianID} value={tech.TechnicianID}>
                    {tech.FullName}
                  </option>
                ))}
            </select>
            {technicians.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">No technicians available</p>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Job Cards"
            value={jobCardStats.totalJobCards}
            icon={<ClipboardList className="text-blue-600" />}
            color="text-blue-600"
            progress
          />
          <StatCard
            title="Pending Jobs"
            value={jobCardStats.pendingJobs}
            icon={<Calendar className="text-amber-600" />}
            color="text-amber-600"
            progress
          />
          <StatCard
            title="In Progress"
            value={jobCardStats.inProgressJobs}
            icon={<User className="text-orange-600" />}
            color="text-orange-600"
            progress
          />
          <StatCard
            title="Completed Jobs"
            value={jobCardStats.completedJobs}
            icon={<Tag className="text-green-600" />}
            color="text-green-600"
            progress
          />
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
            <div className="flex items-center">
              <Filter className="text-blue-600 text-base mr-2" />
              <span className="text-base font-semibold text-gray-900">Search Job Cards</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by booking ID, status, services, vehicle plate, make, model, or VIN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              />
            </div>
          </div>

          <div className="mt-2">
            <span className="text-sm text-gray-600">
              Showing {filteredJobCards.length} of {dedupedJobCards.length} job cards
              {currentTechnician && ` for ${currentTechnician.FullName}`}
            </span>
          </div>
        </div>

        {/* Job Cards Table */}
        <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                Job Cards List
                {currentTechnician && ` - ${currentTechnician.FullName}`}
                {!currentTechnician && ' - All Technicians'}
              </h3>
            </div>
          </div>

          <div className="p-6">
            {filteredJobCards.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm"></th>
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Job Card ID</th>
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Booking ID</th>
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Vehicle Details</th>
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Created Date</th>
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Technician</th>
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobCards.map((jobCard) => (
                      <React.Fragment key={jobCard.J_JobCardID}>
                        <tr 
                          className="border-b border-gray-200 hover:bg-blue-50 transition-colors duration-200 cursor-pointer"
                          onClick={() => toggleRowExpansion(jobCard.J_JobCardID)}
                        >
                          <td className="py-4 px-4">
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
                          </td>
                          <td className="py-4 px-4 text-base font-medium text-gray-900">
                            <div className="font-medium">JC-{String(jobCard.J_JobCardID).padStart(4, '0')}</div>
                          </td>
                          <td className="py-4 px-4 text-base text-gray-700">{jobCard.J_BookingID}</td>
                          <td className="py-4 px-4 text-base text-gray-700">
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {jobCard.VehicleMake} {jobCard.VehicleModel} ({jobCard.VehicleYear})
                              </span>
                              <span className="text-sm text-gray-500">
                                Plate: {jobCard.VehiclePlateNumber} | VIN: {jobCard.VehicleVIN}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-base text-gray-700">
                            {new Date(jobCard.J_CreatedDate).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4 text-base text-gray-700">{jobCard.J_Technician}</td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(jobCard.J_JobCardStatus)}`}>
                              {getStatusIcon(jobCard.J_JobCardStatus)}
                              <span className="ml-1">{jobCard.J_JobCardStatus}</span>
                            </span>
                          </td>
                        </tr>
                        
                        {/* Expanded Details Row */}
                        {expandedRow === jobCard.J_JobCardID && (
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <td colSpan="7" className="p-6">
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Vehicle Details Section */}
                                <div className="bg-white rounded-lg border border-gray-200 p-4">
                                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-lg">
                                    <Car className="h-5 w-5 text-purple-500" />
                                    Vehicle Details
                                  </h4>
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                      <span className="text-gray-600 text-base">Plate Number</span>
                                      <span className="text-gray-800 text-base font-medium">{jobCard.VehiclePlateNumber}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                      <span className="text-gray-600 text-base">Make & Model</span>
                                      <span className="text-gray-800 text-base font-medium">{jobCard.VehicleMake} {jobCard.VehicleModel}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                      <span className="text-gray-600 text-base">Year</span>
                                      <span className="text-gray-800 text-base font-medium">{jobCard.VehicleYear}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                      <span className="text-gray-600 text-base">VIN</span>
                                      <span className="text-gray-800 text-base font-medium font-mono">{jobCard.VehicleVIN}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Services Section */}
                                <div className="bg-white rounded-lg border border-gray-200 p-4">
                                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-lg">
                                    <Wrench className="h-5 w-5 text-blue-500" />
                                    Services
                                  </h4>
                                  <div className="space-y-3">
                                    {(String(jobCard.ServiceNames || '')
                                      .split(',')
                                      .map(s => s.trim())
                                      .filter(Boolean)
                                      .map((serviceName, index) => (
                                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                                          <span className="text-gray-700 text-base font-medium">{serviceName}</span>
                                        </div>
                                      )))}
                                    {(!jobCard.ServiceNames || String(jobCard.ServiceNames).trim() === '') && (
                                      <div className="text-gray-500 text-base py-2">No services assigned</div>
                                    )}
                                  </div>
                                </div>

                                {/* Parts Section */}
                                <div className="bg-white rounded-lg border border-gray-200 p-4">
                                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-lg">
                                    <Package className="h-5 w-5 text-green-500" />
                                    Parts
                                  </h4>
                                  <div className="space-y-3">
                                    {(() => {
                                      const bookingParts = bookingPartsMap[jobCard.J_BookingID] || [];
                                      const itemsForCard = Array.isArray(jobCardItems) ? jobCardItems.filter(it => String(it.J_JobCardID) === String(jobCard.J_JobCardID)) : [];
                                      
                                      if (bookingParts.length > 0) {
                                        return bookingParts.map((part, index) => {
                                          const partName = part.PartName || part.P_PartName || getPartName(part.PartID || part.P_PartID);
                                          const qty = parseInt(part.Quantity || part.Qty || 0, 10) || 0;
                                          
                                          return (
                                            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                                              <div>
                                                <div className="text-gray-700 text-base font-medium">{partName}</div>
                                                <div className="text-base text-gray-600 font-semibold mt-1">
                                                  Quantity: {qty}
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        });
                                      } else if (itemsForCard.length > 0) {
                                        return itemsForCard.map((item, index) => {
                                          const partName = getPartName(item.J_PartID);
                                          const qty = parseInt(item.J_Qty || 0, 10) || 0;
                                          
                                          return (
                                            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                                              <div>
                                                <div className="text-gray-700 text-base font-medium">{partName}</div>
                                                <div className="text-base text-gray-600 font-semibold mt-1">
                                                  Quantity: {qty}
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        });
                                      } else {
                                        return (
                                          <div className="text-gray-500 text-base py-2">No parts assigned</div>
                                        );
                                      }
                                    })()}
                                  </div>
                                </div>

                                {/* Summary Section */}
                                <div className="lg:col-span-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4">
                                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-lg">
                                    <ClipboardList className="h-5 w-5 text-indigo-500" />
                                    Job Summary
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center">
                                      <div className="text-base text-gray-600 font-medium">Vehicle</div>
                                      <div className="text-xl font-bold text-purple-600">
                                        {jobCard.VehicleMake} {jobCard.VehicleModel}
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-base text-gray-600 font-medium">Total Services</div>
                                      <div className="text-xl font-bold text-blue-600">
                                        {String(jobCard.ServiceNames || '')
                                          .split(',')
                                          .map(s => s.trim())
                                          .filter(Boolean).length}
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-base text-gray-600 font-medium">Total Parts</div>
                                      <div className="text-xl font-bold text-green-600">
                                        {(() => {
                                          const bookingParts = bookingPartsMap[jobCard.J_BookingID] || [];
                                          const itemsForCard = Array.isArray(jobCardItems) ? jobCardItems.filter(it => String(it.J_JobCardID) === String(jobCard.J_JobCardID)) : [];
                                          
                                          if (bookingParts.length > 0) {
                                            return bookingParts.length;
                                          } else if (itemsForCard.length > 0) {
                                            return itemsForCard.length;
                                          }
                                          return 0;
                                        })()}
                                      </div>
                                    </div>
                                  </div>
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
              <div className="text-center py-12">
                <ClipboardList className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-base font-medium">
                  {dedupedJobCards && dedupedJobCards.length > 0
                    ? 'No job cards match your search criteria'
                    : 'No job cards found'}
                </p>
                <button
                  onClick={handleRefresh}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 text-base font-medium flex items-center mx-auto mt-4 border-0"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Refresh Job Cards
                </button>
              </div>
            )}
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

export default TechnicianJobCards;