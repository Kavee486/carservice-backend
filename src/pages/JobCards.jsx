// components/JobCards.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ClipboardList, Plus, Search, Filter, Edit3, Trash2, RefreshCw, Calendar, User, Tag, AlertCircle, Package } from 'lucide-react';
import { GetAllJobCards, AddJobCard, UpdateJobCard, DeleteJobCard } from '../actions/jobCardActions';
import { GetAllJobCardItems } from '../actions/jobCardItemActions';
import { fetchAllParts, fetchAllServices } from '../services/jobCardItemServices';
import { updateBookingServices, addBookingParts, getBookingPartsByBookingID, addJobCard as addJobCardService } from '../services/jobCardServices';
import dayjs from 'dayjs';

const JobCards = () => {
  const dispatch = useDispatch();
  const jobCardList = useSelector(state => state.jobCardList);
  const { loading, jobCards, error } = jobCardList;
  const jobCardItemList = useSelector(state => state.jobCardItemList);
  const { jobCardItems = [] } = jobCardItemList || {};

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentJobCard, setCurrentJobCard] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [parts, setParts] = useState([]);
  const [partsLoading, setPartsLoading] = useState(false);
  const [partsError, setPartsError] = useState(null);
  const [bookingPartsMap, setBookingPartsMap] = useState({}); // bookingId -> array of parts
  const [servicesList, setServicesList] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState(null);

  // Modal selections
  const [selectedServices, setSelectedServices] = useState([]); // array of S_ServiceID
  const [selectedPartsRows, setSelectedPartsRows] = useState([]); // [{ partId, qty, unitPrice }]
  const [serviceFilter, setServiceFilter] = useState('');
  // local cache for totals (Quantity/Price/Status) keyed by J_BookingID to reflect
  // newly-sent totals immediately in the UI when backend takes time to reflect them
  const [totalsMap, setTotalsMap] = useState({}); // bookingId -> { Quantity, Price, J_JobCardStatus }

  const toggleService = (id) => {
    setSelectedServices(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  // persist selection to localStorage whenever it changes
  useEffect(() => {
    try {
      // store under a temporary key; when we have a booking id we will move it
      localStorage.setItem('jobcard_selected_services_temp', JSON.stringify(selectedServices));
      // if editing an existing job card, persist under its booking id too
      if (currentJobCard?.J_BookingID) {
        localStorage.setItem(`jobcard_selected_services_${currentJobCard.J_BookingID}`, JSON.stringify(selectedServices));
      }
    } catch (e) {
      // ignore storage errors
    }
  }, [selectedServices, currentJobCard]);

  useEffect(() => {
    dispatch(GetAllJobCards());
    // Load job card items so we can show parts/qty/price per job card
    dispatch(GetAllJobCardItems());
    fetchParts();
    fetchServices();
  }, [dispatch]);

  // When jobCards change, fetch booking-specific parts (if backend stores them separately)
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

  const handleAddJobCard = () => {
    setCurrentJobCard(null);
    // reset selections
    setSelectedServices([]);
    setSelectedPartsRows([]);
    setIsModalVisible(true);
  };

  const handleEditJobCard = (jobCard) => {
    setCurrentJobCard(jobCard);
    // initialize modal selections from existing booking-specific parts if available
    const bookingIdKey = String(jobCard.J_BookingID || '');
    const bookingParts = bookingPartsMap[bookingIdKey];
    if (Array.isArray(bookingParts) && bookingParts.length > 0) {
      // Map booking parts to modal rows. Support different naming conventions from backend.
      const partsRowsFromBooking = bookingParts.map(bp => {
        const partId = bp.PartID || bp.P_PartID || bp.PartId || bp.PARTID || bp.P_PartID;
        const qty = parseInt(bp.Quantity || bp.Qty || bp.J_Qty || 0, 10) || 0;
        const unit = parseFloat(bp.UnitPrice || bp.P_UnitPrice || bp.J_Charge || 0) || 0;
        return { partId: String(partId || ''), qty: qty || 1, unitPrice: unit };
      });
      setSelectedPartsRows(partsRowsFromBooking);
    } else {
      // fallback to jobCardItems stored in redux if booking-specific parts not returned yet
      const itemsForCard = Array.isArray(jobCardItems) ? jobCardItems.filter(it => String(it.J_JobCardID) === String(jobCard.J_JobCardID)) : [];
      const partsRows = itemsForCard.map(it => ({ partId: it.J_PartID, qty: parseInt(it.J_Qty || 1, 10), unitPrice: parseFloat(it.J_Charge || 0) }));
      setSelectedPartsRows(partsRows);

      // try to fetch booking parts on demand so modal can refresh with authoritative values
      (async () => {
        try {
          const resp = await getBookingPartsByBookingID(bookingIdKey);
          if (resp?.StatusCode === 200 && Array.isArray(resp.ResultSet) && resp.ResultSet.length > 0) {
            const fetched = resp.ResultSet.map(bp => {
              const partId = bp.PartID || bp.P_PartID || bp.PartId || bp.PARTID || bp.P_PartID;
              const qty = parseInt(bp.Quantity || bp.Qty || bp.J_Qty || 0, 10) || 0;
              const unit = parseFloat(bp.UnitPrice || bp.P_UnitPrice || bp.J_Charge || 0) || 0;
              return { partId: String(partId || ''), qty: qty || 1, unitPrice: unit };
            });
            setBookingPartsMap(prev => ({ ...prev, [bookingIdKey]: resp.ResultSet || [] }));
            setSelectedPartsRows(fetched);
          }
        } catch (err) {
          // non-blocking
          console.warn('Failed to fetch booking parts for edit modal', err);
        }
      })();
    }
    // services: try to parse ServiceNames if present (comma separated)
    const svcIds = [];
    if (jobCard.ServiceNames) {
      // we don't have IDs in ServiceNames string; attempt to map by name to IDs
      const names = String(jobCard.ServiceNames).split(',').map(s => s.trim()).filter(Boolean);
      names.forEach(n => {
        const s = servicesList.find(x => String(x?.S_ServiceName).toLowerCase() === String(n).toLowerCase());
        if (s) svcIds.push(s.S_ServiceID);
      });
    }
    // if there is a saved selection in localStorage for this booking, prefer that
    try {
      const stored = localStorage.getItem(`jobcard_selected_services_${jobCard.J_BookingID}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSelectedServices(parsed);
        } else {
          setSelectedServices(svcIds);
        }
      } else {
        setSelectedServices(svcIds);
      }
    } catch (e) {
      setSelectedServices(svcIds);
    }
    setIsModalVisible(true);
  };

  const handleDeleteJobCard = async (jobCard) => {
    if (!window.confirm('Are you sure you want to delete this job card?')) {
      return;
    }

    try {
      setDeleteLoading(prev => ({ ...prev, [jobCard.J_JobCardID]: true }));

      const jobCardData = {
        J_JobCardID: jobCard.J_JobCardID,
        J_BookingID: jobCard.J_BookingID,
        J_CreatedDate: jobCard.J_CreatedDate,
        J_Technician: jobCard.J_Technician,
        J_JobCardStatus: jobCard.J_JobCardStatus,
        Status: 'I'
      };

      await dispatch(DeleteJobCard(jobCardData));
      alert('Job card deleted successfully');
      dispatch(GetAllJobCards());
    } catch (error) {
      alert('Failed to delete job card');
    } finally {
      setDeleteLoading(prev => ({ ...prev, [jobCard.J_JobCardID]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const values = Object.fromEntries(formData.entries());

    try {
      setSubmitLoading(true);

      const jobCardData = {
        J_BookingID: values.bookingId,
        J_CreatedDate: dayjs(values.createdDate).format('YYYY-MM-DD'),
        J_Technician: values.technician,
        J_JobCardStatus: values.jobCardStatus,
        // include selected services and parts arrays (backend may accept or be wired later)
        Services: selectedServices,
        Parts: selectedPartsRows.map(p => ({ P_PartID: p.partId, Quantity: p.qty, UnitPrice: p.unitPrice }))
      };

      if (currentJobCard) {
        jobCardData.J_JobCardID = currentJobCard.J_JobCardID;

        await dispatch(UpdateJobCard(jobCardData));
        alert('Job card updated successfully');
      } else {
        await dispatch(AddJobCard(jobCardData));
        alert('Job card added successfully');
      }

      // Also call AddJobCardsDetails endpoint to ensure Quantity/Price fields are stored
      try {
        const bookingId = jobCardData.J_BookingID || currentJobCard?.J_BookingID;
        // compute totals: parts quantity and grand price
        const partsQty = (selectedPartsRows || []).reduce((s, r) => s + (parseInt(r.qty || 0, 10) || 0), 0);
        const partsTotal = (selectedPartsRows || []).reduce((s, r) => s + ((parseFloat(r.unitPrice || 0) || 0) * (parseInt(r.qty || 0, 10) || 0)), 0);
        const svcTotal = (selectedServices || []).reduce((s, id) => {
          const svc = servicesList.find(x => String(x.S_ServiceID) === String(id));
          return s + (parseFloat(svc?.S_BaseCharge || 0) || 0);
        }, 0);
        const grandTotal = svcTotal + partsTotal;

        if (bookingId) {
          const payload = {
            J_BookingID: String(bookingId),
            J_CreatedDate: jobCardData.J_CreatedDate,
            J_Technician: jobCardData.J_Technician,
            J_JobCardStatus: jobCardData.J_JobCardStatus,
            Quantity: partsQty,
            Price: parseFloat(grandTotal.toFixed(2))
          };
          try {
            const respAdd = await addJobCardService(payload);
            // respAdd may return status; we don't want to block UI but log
            if (respAdd?.StatusCode === 200) {
              console.log('AddJobCardsDetails stored totals:', respAdd);
              // reflect these totals immediately in the UI while the backend updates
              try {
                setTotalsMap(prev => ({ ...prev, [String(bookingId)]: { Quantity: payload.Quantity, Price: payload.Price, J_JobCardStatus: payload.J_JobCardStatus } }));
              } catch (e) {}
            } else {
              console.warn('AddJobCardsDetails returned non-200', respAdd);
            }
          } catch (err) {
            console.warn('Failed calling AddJobCardsDetails to store totals', err);
          }
        }
      } catch (err) {
        console.error('Failed preparing totals for AddJobCardsDetails', err);
      }
      // If services were selected, call UpdateBookingServices API to persist to booking
      try {
        const bookingId = jobCardData.J_BookingID || currentJobCard?.J_BookingID;
        const newServiceIds = (selectedServices || []).map(id => parseInt(id, 10)).filter(Boolean);
        if (bookingId && newServiceIds.length > 0) {
          const payload = { J_BookingID: String(bookingId), NewServiceIDs: newServiceIds };
          const resp = await updateBookingServices(payload);
          if (resp?.StatusCode === 200) {
            // success
            // remove localStorage entries for this booking
            try {
              localStorage.removeItem(`jobcard_selected_services_${bookingId}`);
              localStorage.removeItem('jobcard_selected_services_temp');
            } catch (e) {}
            alert(resp.Result || 'Services updated successfully');
          } else {
            console.warn('UpdateBookingServices failed', resp);
            alert(resp?.Message || 'Failed to update booking services');
          }
        }
      } catch (err) {
        console.error('Failed to update booking services', err);
        // non-blocking
      }

      // After updating job card and services, persist selected parts to booking via API
      try {
        const bookingId = jobCardData.J_BookingID || currentJobCard?.J_BookingID;
        const partsList = (selectedPartsRows || []).map(p => ({ PartID: parseInt(p.partId || 0, 10) || 0, Quantity: parseInt(p.qty || 0, 10) || 0 })).filter(p => p.PartID && p.Quantity);
        if (bookingId && partsList.length > 0) {
          const payload = { J_BookingID: String(bookingId), PartsList: partsList };
          const respParts = await addBookingParts(payload);
          if (respParts?.StatusCode === 200) {
            // refresh booking parts for this booking
            try {
              const partsResp = await getBookingPartsByBookingID(bookingId);
              if (partsResp?.StatusCode === 200) {
                setBookingPartsMap(prev => ({ ...prev, [bookingId]: partsResp.ResultSet || [] }));
              }
            } catch (err) {
              console.warn('Failed to refresh booking parts', err);
            }

            alert(respParts.Result || 'Parts added successfully');
          } else {
            console.warn('AddBookingParts failed', respParts);
            alert(respParts?.Message || 'Failed to add parts to booking');
          }
        }
      } catch (err) {
        console.error('Failed to add booking parts', err);
      }

      setIsModalVisible(false);
      dispatch(GetAllJobCards());
    } catch (err) {
      console.error('Error:', err);
      alert(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleRefresh = () => {
    dispatch(GetAllJobCards());
    dispatch(GetAllJobCardItems());
    fetchParts();
  };

  // Deduplicate jobCards by J_BookingID so that when backend returns both an "add" row
  // and an existing row we prefer the one that contains Quantity/Price values.
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
      // prefer the entry that has Price or Quantity populated
      const hasExistingTotals = (existing.Price !== undefined && existing.Price !== null && String(existing.Price).trim() !== '') || (existing.Quantity !== undefined && existing.Quantity !== null && String(existing.Quantity).trim() !== '');
      const hasNewTotals = (jc.Price !== undefined && jc.Price !== null && String(jc.Price).trim() !== '') || (jc.Quantity !== undefined && jc.Quantity !== null && String(jc.Quantity).trim() !== '');
      if (hasNewTotals && !hasExistingTotals) {
        map.set(key, jc);
      } else if (hasNewTotals === hasExistingTotals) {
        // if both equal, prefer the one with later J_JobCardID (assume newer)
        try {
          const a = parseInt(existing.J_JobCardID || 0, 10) || 0;
          const b = parseInt(jc.J_JobCardID || 0, 10) || 0;
          if (b >= a) map.set(key, jc);
        } catch (e) {
          map.set(key, jc);
        }
      }
      // otherwise keep existing
    }
    return Array.from(map.values());
  })();

  // Filter job cards based on search term
  const filteredJobCards = dedupedJobCards && dedupedJobCards.length > 0
    ? dedupedJobCards.filter(jobCard => {
      const term = searchTerm.toLowerCase();
      const bookingId = String(jobCard.J_BookingID || '').toLowerCase();
      const technician = String(jobCard.J_Technician || '').toLowerCase();
      const status = String(jobCard.J_JobCardStatus || '').toLowerCase();
      const services = String(jobCard.ServiceNames || '').toLowerCase();
      // aggregate parts for search
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
        partsString.toLowerCase().includes(term);

      return matchesSearch;
    })
    : [];

  const getPartName = (partId) => {
    const p = parts.find(x => String(x?.P_PartID) === String(partId));
    return p?.P_PartName || `#${partId}`;
  };

  const formatCurrency = (value) => {
    const num = parseFloat(value || 0);
    if (isNaN(num)) return 'Rs 0.00';
    return `Rs ${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  // Calculate job card stats
  const totalJobCards = jobCards?.length || 0;
  const pendingJobs = jobCards?.filter(jobCard => jobCard.J_JobCardStatus === 'Pending').length || 0;
  const inProgressJobs = jobCards?.filter(jobCard => jobCard.J_JobCardStatus === 'In Progress').length || 0;
  const completedJobs = jobCards?.filter(jobCard => jobCard.J_JobCardStatus === 'Completed').length || 0;

  const jobCardStats = {
    totalJobCards: totalJobCards,
    pendingJobs: pendingJobs,
    inProgressJobs: inProgressJobs,
    completedJobs: completedJobs
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

  if (loading) {
    return (
      <div className="h-full p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-600 text-base font-medium">Loading job cards...</p>
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
          <p className="text-gray-600 text-base font-medium mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 text-base font-medium flex items-center mx-auto border-0"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
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
              <h1 className="text-2xl font-bold text-white mb-2">Job Cards Management</h1>
              <p className="text-blue-100">Manage and track all auto repair job cards efficiently</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-0 rounded-lg h-10 px-4 font-medium backdrop-blur-sm flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={handleAddJobCard}
                className="bg-white text-blue-600 rounded-lg hover:bg-blue-50 h-10 px-4 font-medium flex items-center border-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Job Card
              </button>
            </div>
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

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
            <div className="flex items-center">
              <Filter className="text-blue-600 text-base mr-2" />
              <span className="text-base font-semibold text-gray-900">Filters & Search</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by booking ID, technician, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              />
            </div>
          </div>

          <div className="mt-2">
            <span className="text-sm text-gray-600">
              Showing {filteredJobCards.length} of {jobCardStats.totalJobCards} job cards
            </span>
          </div>
        </div>

        {/* Job Cards Table */}
        <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Job Cards List</h3>
              {/* <span className="text-gray-500">{jobCardStats.totalJobCards} job cards found</span> */}
            </div>
          </div>

          <div className="p-6">
            {filteredJobCards.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Job Card ID</th>
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Booking ID</th>
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Created Date</th>
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Technician</th>
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Services</th>
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Parts</th>
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Qty</th>
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Price</th>
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Status</th>
                      <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobCards.map((jobCard) => (
                      <tr key={jobCard.J_JobCardID} className="border-b border-gray-200 hover:bg-blue-50 transition-colors duration-200">
                        <td className="py-4 px-4 text-base font-medium text-gray-900">
                          <div className="font-medium">JC-{String(jobCard.J_JobCardID).padStart(4, '0')}</div>
                          <div className="text-xs text-gray-400">Booking: {jobCard.J_BookingID}</div>
                        </td>
                        <td className="py-4 px-4 text-base text-gray-700">{jobCard.J_BookingID}</td>
                        <td className="py-4 px-4 text-base text-gray-700">
                          {new Date(jobCard.J_CreatedDate).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 text-base text-gray-700">{jobCard.J_Technician}</td>
                        <td className="py-4 px-4 align-top">
                          {/* Render services stacked vertically for better readability */}
                          <div className="flex flex-col gap-2 max-w-xs">
                            {(String(jobCard.ServiceNames || '')
                              .split(',')
                              .map(s => s.trim())
                              .filter(Boolean)
                            ).map((svc, idx) => (
                              <div key={idx} className="flex items-center justify-start gap-3">
                                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-800 border border-gray-100 shadow-sm truncate">
                                  {svc}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* Parts aggregation */}
                        {(() => {
                          const bookingParts = bookingPartsMap[jobCard.J_BookingID] || [];
                          // If backend returned direct Quantity/Price for this jobCard (e.g. from AddJobCardsDetails/GetAllJobCards), prefer those values
                          // Prefer recently-submitted totals from totalsMap (client-side cache)
                          const totalsOverride = totalsMap[String(jobCard.J_BookingID || jobCard.J_JobCardID || '')];
                          const hasBackendTotals = totalsOverride || (jobCard.Quantity !== undefined && jobCard.Quantity !== null && String(jobCard.Quantity).trim() !== '') || (jobCard.Price !== undefined && jobCard.Price !== null && String(jobCard.Price).trim() !== '');
                          const overrideQtyVal = totalsOverride?.Quantity ?? ((jobCard.Quantity !== undefined && jobCard.Quantity !== null && String(jobCard.Quantity).trim() !== '') ? (parseInt(jobCard.Quantity, 10) || 0) : null);
                          const overridePriceVal = totalsOverride?.Price ?? ((jobCard.Price !== undefined && jobCard.Price !== null && String(jobCard.Price).trim() !== '') ? (parseFloat(jobCard.Price) || 0) : null);
                          if (Array.isArray(bookingParts) && bookingParts.length > 0) {
                            // aggregate by PartID to avoid duplicate part entries
                            const agg = {};
                            for (const bp of bookingParts) {
                              const pid = String(bp.PartID || bp.P_PartID || bp.PartId || bp.PARTID || '') || '';
                              if (!pid) continue;
                              const name = bp.PartName || bp.P_PartName || (() => {
                                const p = parts.find(x => String(x?.P_PartID) === pid);
                                return p?.P_PartName || `#${pid}`;
                              })();
                              const qty = parseInt(bp.Quantity || bp.Qty || 0, 10) || 0;
                              const unit = parseFloat(bp.UnitPrice || bp.P_UnitPrice || bp.P_UnitPrice || 0) || 0;
                              const total = parseFloat(bp.TotalPrice || (unit * qty) || 0) || 0;

                              if (!agg[pid]) {
                                agg[pid] = { partId: pid, name, qty: 0, unit, totalPrice: 0 };
                              }
                              agg[pid].qty += qty;
                              // prefer reported TotalPrice when present, otherwise sum unit*qty
                              agg[pid].totalPrice += total || (unit * qty);
                              // if unit was missing earlier but exists now, keep a sensible unit
                              if (!agg[pid].unit && unit) agg[pid].unit = unit;
                            }

                            const uniqueParts = Object.values(agg);
                            const totalQty = uniqueParts.reduce((s, p) => s + (p.qty || 0), 0);
                            const totalPrice = uniqueParts.reduce((s, p) => s + (parseFloat(p.totalPrice || 0) || 0), 0);

                            // prefer recently-submitted totals (totalsMap) or backend-provided totals when available
                            const displayQty = overrideQtyVal !== null ? overrideQtyVal : totalQty;
                            const displayPrice = overridePriceVal !== null ? overridePriceVal : totalPrice;

                            const displayParts = uniqueParts.slice(0, 3);
                            const extraCount = Math.max(0, uniqueParts.length - displayParts.length);
                            const fullListText = uniqueParts.map(p => `${p.name} x${p.qty} (${formatCurrency(p.totalPrice)})`).join(', ');

                            return (
                              <>
                                <td className="py-4 px-4 align-top">
                                  <div className="flex flex-col gap-2" title={fullListText}>
                                    {uniqueParts.map(p => (
                                      <div key={p.partId} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <span className="text-sm font-medium text-gray-800">{p.name}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </td>
                                    <td className="py-4 px-4">
                                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">{displayQty}</span>
                                    </td>
                                    <td className="py-4 px-4">
                                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">{formatCurrency(displayPrice)}</span>
                                    </td>
                              </>
                            );
                          }

                          // fallback to jobCardItems if no booking-specific parts are available
                          const itemsForCard = Array.isArray(jobCardItems) ? jobCardItems.filter(it => String(it.J_JobCardID) === String(jobCard.J_JobCardID)) : [];
                          // aggregate jobCardItems by part id as well
                          const aggItems = {};
                          for (const it of itemsForCard) {
                            const pid = String(it.J_PartID || it.PartID || '') || '';
                            if (!pid) continue;
                            const name = getPartName(pid) || `#${pid}`;
                            const qty = parseInt(it.J_Qty || it.Quantity || 0, 10) || 0;
                            const unit = parseFloat(it.J_Charge || it.UnitPrice || 0) || 0;
                            const total = parseFloat((unit * qty) || 0) || 0;
                            if (!aggItems[pid]) aggItems[pid] = { partId: pid, name, qty: 0, unit, totalPrice: 0 };
                            aggItems[pid].qty += qty;
                            aggItems[pid].totalPrice += total;
                          }

                          const uniqueItems = Object.values(aggItems);
                          const totalQtyItems = uniqueItems.reduce((s, p) => s + (p.qty || 0), 0);
                          const totalPriceItems = uniqueItems.reduce((s, p) => s + (parseFloat(p.totalPrice || 0) || 0), 0);

                          // prefer recently-submitted totals (totalsMap) or backend-provided totals when available
                          const displayQtyItems = overrideQtyVal !== null ? overrideQtyVal : totalQtyItems;
                          const displayPriceItems = overridePriceVal !== null ? overridePriceVal : totalPriceItems;

                          if (uniqueItems.length === 0 && overrideQtyVal === null && overridePriceVal === null) {
                            return (
                              <>
                                <td className="py-4 px-4"><span className="text-sm text-gray-500">-</span></td>
                                <td className="py-4 px-4"><span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">0</span></td>
                                <td className="py-4 px-4"><span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">{formatCurrency(0)}</span></td>
                              </>
                            );
                          }

                          const displayItems = uniqueItems.slice(0, 3);
                          const extraItemsCount = Math.max(0, uniqueItems.length - displayItems.length);
                          const fullItemsText = uniqueItems.map(p => `${p.name} x${p.qty} (${formatCurrency(p.totalPrice)})`).join(', ');

                          return (
                            <>
                              <td className="py-4 px-4 align-top">
                                <div className="flex flex-col gap-2" title={fullItemsText}>
                                  {uniqueItems.map(p => (
                                    <div key={p.partId} className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-gray-800">{p.name}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">{displayQtyItems}</span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">{formatCurrency(displayPriceItems)}</span>
                              </td>
                            </>
                          );
                        })()}

                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${jobCard.J_JobCardStatus === 'Completed'
                              ? 'bg-green-100 text-green-800'
                              : jobCard.J_JobCardStatus === 'In Progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                            {jobCard.J_JobCardStatus}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditJobCard(jobCard)}
                              className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-100 transition-colors"
                              title="Edit job card"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteJobCard(jobCard)}
                              className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-100 transition-colors"
                              title="Delete job card"
                              disabled={deleteLoading[jobCard.J_JobCardID]}
                            >
                              {deleteLoading[jobCard.J_JobCardID] ? (
                                <svg className="animate-spin h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <ClipboardList className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-base font-medium">
                  {jobCards && jobCards.length > 0
                    ? 'No job cards match your search criteria'
                    : 'No job cards found'}
                </p>
                {(!jobCards || jobCards.length === 0) && (
                  <button
                    onClick={handleAddJobCard}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 text-base font-medium flex items-center mx-auto mt-4 border-0"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Job Card
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Job Card Modal */}
        {isModalVisible && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="bg-gradient-to-b from-white via-gray-50 to-gray-100 rounded-2xl shadow-2xl border border-gray-200 p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto transition-all duration-300">
      <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2 border-b pb-3 mb-4">
        <span className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></span>
        {currentJobCard ? 'Edit Job Card' : 'Add New Job Card'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Technician Input */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
            Technician
          </label>
          <input
            name="technician"
            type="text"
            placeholder="Enter technician name"
            defaultValue={currentJobCard?.J_Technician}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150 bg-white"
          />
        </div>

        Job Card Status 
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
            Job Card Status
          </label>
          <select
            name="jobCardStatus"
            defaultValue={currentJobCard?.J_JobCardStatus || 'Pending'}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150 bg-white"
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div> 

        {/* Services Section */}
        <div className="mt-4 border border-gray-200 bg-white/80 rounded-xl shadow-inner p-5 hover:shadow-md transition">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
              Services
            </h4>
            <div className="text-xs text-gray-500">{servicesList.length} available</div>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <Search className="text-gray-400 h-5 w-5" />
            <input
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              placeholder="Search services..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
            />
          </div>

          {servicesLoading ? (
            <div className="text-sm text-gray-500">Loading services...</div>
          ) : servicesError ? (
            <div className="text-sm text-red-500">{servicesError}</div>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-2">
              {servicesList
                .filter(s =>
                  String(s.S_ServiceName || '').toLowerCase().includes(serviceFilter.toLowerCase())
                )
                .map(s => (
                  <label
                    key={s.S_ServiceID}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer border transition-all duration-150 ${
                      selectedServices.includes(s.S_ServiceID)
                        ? 'bg-blue-50 border-blue-300 shadow-sm'
                        : 'bg-white hover:bg-blue-50 border-gray-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(s.S_ServiceID)}
                      onChange={() => toggleService(s.S_ServiceID)}
                      className="h-4 w-4 accent-blue-500"
                    />
                    <div className="flex-1 text-sm">
                      <div className="font-medium text-gray-800">{s.S_ServiceName}</div>
                      <div className="text-xs text-gray-500">
                        Rs {parseFloat(s.S_BaseCharge || 0).toFixed(2)}
                      </div>
                    </div>
                  </label>
                ))}
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {(selectedServices || []).map(id => {
              const svc = servicesList.find(x => String(x.S_ServiceID) === String(id));
              return (
                <span
                  key={id}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 text-sm shadow-sm"
                >
                  {svc?.S_ServiceName || `#${id}`}
                  <span className="ml-2 text-xs text-gray-600">
                    Rs {parseFloat(svc?.S_BaseCharge || 0).toFixed(2)}
                  </span>
                </span>
              );
            })}
          </div>

          <div className="mt-3 text-sm font-semibold text-gray-700">
            Services Total:{' '}
            <span className="text-green-700">
              {(() => {
                const total = (selectedServices || []).reduce((sum, id) => {
                  const svc = servicesList.find(x => String(x.S_ServiceID) === String(id));
                  return sum + (parseFloat(svc?.S_BaseCharge || 0) || 0);
                }, 0);
                return `Rs ${total.toFixed(2)}`;
              })()}
            </span>
          </div>
        </div>

        {/* Parts Section */}
        <div className="mt-4 border border-gray-200 bg-white/80 rounded-xl shadow-inner p-5 hover:shadow-md transition">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="h-2 w-2 bg-green-500 rounded-full"></span>
            Parts
          </h4>

          <div className="space-y-3">
            {selectedPartsRows.map((row, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:shadow-sm bg-white transition-all duration-150"
              >
                <Package className="text-green-500 h-5 w-5" />
                <div className="flex-1 grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-6">
                    <select
                      value={row.partId}
                      onChange={(e) => {
                        const partId = e.target.value;
                        const part = parts.find(p => String(p.P_PartID) === String(partId));
                        const unit = part ? parseFloat(part.P_UnitPrice || 0) : 0;
                        setSelectedPartsRows(prev =>
                          prev.map((r, i) => (i === idx ? { ...r, partId, unitPrice: unit } : r))
                        );
                      }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-white focus:ring-1 focus:ring-green-400"
                    >
                      <option value="">Select part</option>
                      {Array.isArray(parts) &&
                        parts.map(p => (
                          <option key={p.P_PartID} value={p.P_PartID}>
                            {p.P_PartName} — Rs {parseFloat(p.P_UnitPrice || 0).toFixed(2)}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number"
                      min="1"
                      value={row.qty}
                      onChange={(e) => {
                        const q = parseInt(e.target.value || 0, 10) || 0;
                        setSelectedPartsRows(prev =>
                          prev.map((r, i) => (i === idx ? { ...r, qty: q } : r))
                        );
                      }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-green-400"
                    />
                  </div>

                  <div className="col-span-3 text-sm">
                    <div className="text-xs text-gray-500">Unit</div>
                    <div className="font-medium">
                      {row.unitPrice ? `Rs ${parseFloat(row.unitPrice).toFixed(2)}` : '-'}
                    </div>
                  </div>

                  <div className="col-span-1 text-right">
                    <div className="text-xs text-gray-500">Line</div>
                    <div className="font-medium">
                      {row.unitPrice
                        ? `Rs ${(parseFloat(row.unitPrice || 0) * (parseInt(row.qty || 0) || 0)).toFixed(2)}`
                        : 'Rs 0.00'}
                    </div>
                  </div>
                </div>

                <div className="w-12 text-right">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedPartsRows(prev => prev.filter((_, i) => i !== idx))
                    }
                    className="text-red-500 px-2 py-1 rounded-md hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <div className="pt-2">
              <button
                type="button"
                onClick={() =>
                  setSelectedPartsRows(prev => [
                    ...prev,
                    { partId: '', qty: 1, unitPrice: 0 },
                  ])
                }
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-green-100 text-green-700 rounded-md border border-green-200 text-sm hover:shadow-sm transition"
              >
                <Plus className="h-4 w-4" />
                Add Part
              </button>
            </div>
          </div>

          <div className="mt-3 text-sm font-semibold text-gray-700">
            Parts Total:{' '}
            <span className="text-green-700">
              {(() => {
                const total = selectedPartsRows.reduce(
                  (sum, r) =>
                    sum +
                    ((parseFloat(r.unitPrice || 0) || 0) *
                      (parseInt(r.qty || 0, 10) || 0)),
                  0
                );
                return `Rs ${total.toFixed(2)}`;
              })()}
            </span>
          </div>
        </div>

        {/* Grand Total */}
        <div className="mt-6 text-right bg-gradient-to-r from-indigo-50 to-blue-100 p-4 rounded-lg border border-indigo-100">
          <div className="text-base font-bold text-gray-800">
            Grand Total:{' '}
            <span className="text-2xl text-indigo-700">
              {(() => {
                const svcTotal = (selectedServices || []).reduce((s, id) => {
                  const svc = servicesList.find(x => String(x.S_ServiceID) === String(id));
                  return s + (parseFloat(svc?.S_BaseCharge || 0) || 0);
                }, 0);
                const partsTotal = selectedPartsRows.reduce(
                  (s, r) =>
                    s +
                    ((parseFloat(r.unitPrice || 0) || 0) *
                      (parseInt(r.qty || 0, 10) || 0)),
                  0
                );
                return `Rs ${(svcTotal + partsTotal).toFixed(2)}`;
              })()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6">
          <button
            type="button"
            onClick={() => setIsModalVisible(false)}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitLoading}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-semibold disabled:opacity-50"
          >
            {submitLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 
                    3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {currentJobCard ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              currentJobCard ? 'Update Job Card' : 'Add Job Card'
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      </div>

      <style jsx>{`
        .stat-card {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        }
      `}</style>
    </div>
  );
};

export default JobCards;