import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { GetAllJobCards, UpdateJobCard, GetAllTechnicians } from '../actions/jobCardActions';
import { GetAllJobCardItems } from '../actions/jobCardItemActions';
import { fetchAllParts, fetchAllServices } from '../services/jobCardItemServices';
import { updateBookingServices, updateBookingService, addBookingParts, getBookingPartsByBookingID, getBookingServicesWithParts, addJobCard as addJobCardService } from '../services/jobCardServices';
import { assignTechnicianToBooking } from '../actions/appointmentActions';
import DashboardLayout from '../components/DashboardLayout';
import dayjs from 'dayjs';
import { Edit3, ClipboardList, Search, Plus, Package, Filter, RefreshCw, Calendar, User, Tag, Trash2, AlertCircle, Users, CheckCircle } from 'lucide-react';

const API_BASE_URL = 'https://automechbackend.dockyardsoftware.com/';
//const API_BASE_URL = 'http://localhost:60748/';

const SupervisorJobCards = () => {
  const dispatch = useDispatch();
  const jobCardList = useSelector(state => state.jobCardList);
  const { loading, jobCards = [] } = jobCardList || {};
  
  const technicianList = useSelector(state => state.technicianList);
  const { loading: techniciansLoading, technicians = [], error: techniciansError } = technicianList || {};
  
  const jobCardItemList = useSelector(state => state.jobCardItemList);
  const { jobCardItems = [] } = jobCardItemList || {};

  const [servicesList, setServicesList] = useState([]);
  const [partsList, setPartsList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('In Progress');
  const [selectedTechnician, setSelectedTechnician] = useState('');
  // parts grouped by service in-modal: { [serviceId|"unassigned"]: [{ partId, qty, unitPrice }] }
  const [selectedPartsByService, setSelectedPartsByService] = useState({});
  // flattened version kept for backwards compatibility with submit logic
  const [selectedPartsRows, setSelectedPartsRows] = useState([]);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [serviceFilter, setServiceFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [bookingPartsMap, setBookingPartsMap] = useState({});
  const [bookingServicesMap, setBookingServicesMap] = useState({});
  const [totalsMap, setTotalsMap] = useState({});
  // Parts validation errors state
  const [partsValidationErrors, setPartsValidationErrors] = useState({});
  // Separate state for technician assignment
  const [assignTechnicianLoading, setAssignTechnicianLoading] = useState(false);
  const [technicianAssigned, setTechnicianAssigned] = useState(false);
  // Track original status to detect changes
  const [originalStatus, setOriginalStatus] = useState('');

  // Get unique technician names from technicians list (like JobCards component)
  const getTechnicianNames = () => {
    if (!Array.isArray(technicians)) return [];
    
    const uniqueNames = new Set();
    technicians
      .filter(tech => tech.Status === 'A') // Only active technicians
      .forEach(tech => {
        if (tech.FullName) uniqueNames.add(tech.FullName);
      });
    
    return Array.from(uniqueNames).sort();
  };

  // Handle technician selection change - using names directly like JobCards component
  const handleTechnicianChange = (technicianName) => {
    setSelectedTechnician(technicianName);
  };

  // Get technician ID from name for API calls
  const getTechnicianIdFromName = (technicianName) => {
    if (!technicianName) return null;
    const tech = technicians.find(t => t.FullName === technicianName);
    return tech ? tech.TechnicianID || tech.UserID || tech.id : null;
  };

  // simple local helpers
  const getPartName = (partId) => {
    const p = partsList.find(x => String(x?.P_PartID) === String(partId));
    return p?.P_PartName || `#${partId}`;
  };

  const getTechnicianName = (technicianId) => {
    if (!technicianId) return 'Unassigned';
    
    // Try to find technician in technicians list
    const tech = technicians.find(t => 
      String(t.TechnicianID) === String(technicianId) || 
      String(t.UserID) === String(technicianId) ||
      String(t.id) === String(technicianId)
    );
    
    if (tech) {
      return tech.FullName || tech.UserFullName || tech.name || `Technician #${technicianId}`;
    }
    
    // Fallback: check if jobCard has technician name
    if (currentBookingId) {
      const jobCard = jobCards.find(jc => String(jc.J_BookingID) === String(currentBookingId));
      if (jobCard && jobCard.J_Technician) {
        return jobCard.J_Technician;
      }
    }
    
    return `Technician #${technicianId}`;
  };

  // CORRECTED: Separate function to assign technician only - FIXED PAYLOAD
  const handleAssignTechnician = async () => {
    if (!currentBookingId || !selectedTechnician) {
      alert('Please select a technician to assign');
      return;
    }

    const technicianId = getTechnicianIdFromName(selectedTechnician);
    if (!technicianId) {
      alert('Could not find technician ID for the selected technician');
      return;
    }

    setAssignTechnicianLoading(true);
    try {
      console.log('Assigning technician:', {
        bookingId: String(currentBookingId),
        technicianId: String(technicianId),
        technicianName: selectedTechnician
      });

      // Call the backend API directly to assign technician
      const response = await fetch(`${API_BASE_URL}/Bookings/AssignTechnicianToBooking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          BookingID: String(currentBookingId),
          TechnicianID: String(technicianId)
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Technician assignment response:', result);
        
        if (result.StatusCode === 200) {
          setTechnicianAssigned(true);
          // Set status to "In Progress" when technician is assigned
          setSelectedStatus('In Progress');
          alert('Technician assigned successfully! Job status set to "In Progress".');
          
          // Update local state to reflect the assignment
          setTotalsMap(prev => ({
            ...prev,
            [String(currentBookingId)]: {
              ...prev[String(currentBookingId)],
              J_Technician: selectedTechnician,
              J_TechnicianID: technicianId,
              J_JobCardStatus: 'In Progress'
            }
          }));

          // Refresh job cards to get updated data
          dispatch(GetAllJobCards());
          
          return true; // Return success
        } else {
          alert(`Failed to assign technician: ${result.Result || result.message}`);
          return false;
        }
      } else {
        const errorText = await response.text();
        console.error('HTTP error assigning technician:', response.status, errorText);
        alert(`Failed to assign technician: HTTP ${response.status}`);
        return false;
      }
    } catch (error) {
      console.error('Error assigning technician:', error);
      alert('Failed to assign technician: ' + error.message);
      return false;
    } finally {
      setAssignTechnicianLoading(false);
    }
  };

  // Validate parts against inventory
  const validateParts = () => {
    const errors = {};
    let isValid = true;

    // Iterate through all parts in all service groups
    Object.keys(selectedPartsByService).forEach(serviceKey => {
      const rows = selectedPartsByService[serviceKey] || [];
      
      rows.forEach((row, index) => {
        // Skip validation for empty rows
        if (!row.partId) {
          return;
        }

        const partInInventory = partsList.find(p => String(p.P_PartID) === String(row.partId));
        const errorKey = `${serviceKey}_${index}`;
        
        if (!partInInventory) {
          errors[errorKey] = 'This part is not available in inventory';
          isValid = false;
        } else {
          // Check if quantity exceeds available stock
          const availableStock = parseInt(partInInventory.P_StockQty || 0, 10);
          const requestedQty = parseInt(row.qty || 0, 10);
          
          if (requestedQty > availableStock) {
            errors[errorKey] = `Only ${availableStock} units available in stock`;
            isValid = false;
          } else if (requestedQty <= 0) {
            errors[errorKey] = 'Quantity must be greater than 0';
            isValid = false;
          }
        }
      });
    });

    setPartsValidationErrors(errors);
    return isValid;
  };

  // If servicesList just loaded and modal is open but we don't have selectedServices,
  // try mapping ServiceNames -> IDs again so services tick correctly.
  useEffect(() => {
    if (!modalOpen || !currentBookingId) return;
    try {
      const stored = localStorage.getItem(`jobcard_selected_services_${currentBookingId}`);
      if (stored) return; // already set
      if (Array.isArray(jobCards) && jobCards.length > 0 && Array.isArray(servicesList)) {
        const jc = jobCards.find(x => String(x.J_BookingID) === String(currentBookingId));
        if (jc && jc.ServiceNames && (!selectedServices || selectedServices.length === 0)) {
          const names = String(jc.ServiceNames).split(',').map(s => s.trim()).filter(Boolean);
          const svcIds = [];
          names.forEach(n => {
            const s = servicesList.find(x => String(x?.S_ServiceName).toLowerCase() === String(n).toLowerCase());
            if (s) svcIds.push(String(s.S_ServiceID));
          });
          if (svcIds.length > 0) setSelectedServices(svcIds);
        }
      }
    } catch (e) {
      // ignore
    }
  }, [servicesList, modalOpen, currentBookingId, jobCards, selectedServices]);

  const formatCurrency = (value) => {
    const num = parseFloat(value || 0);
    if (isNaN(num)) return 'Rs 0.00';
    return `Rs ${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  useEffect(() => {
    dispatch(GetAllJobCards());
    dispatch(GetAllJobCardItems());
    dispatch(GetAllTechnicians()); // Fetch technicians using Redux like JobCards component
    fetchLists();
    // auto-open edit modal when query param exists (admin redirect)
    try {
      const params = new URLSearchParams(window.location.search);
      const edit = params.get('edit');
      if (edit) {
        // slight delay to ensure lists loaded
        setTimeout(() => openEditForBooking(edit), 300);
      }
    } catch (e) {}
  }, [dispatch]);

  const fetchLists = async () => {
    try {
      const s = await fetchAllServices();
      if (s?.StatusCode === 200) setServicesList(s.ResultSet || []);
    } catch (e) {}
    try {
      const p = await fetchAllParts();
      if (p?.StatusCode === 200) setPartsList(p.ResultSet || []);
    } catch (e) {}
  };

  const openEditForBooking = async (bookingId) => {
    setCurrentBookingId(bookingId);
    // Clear validation errors when opening modal
    setPartsValidationErrors({});
    
    // Ensure technicians are loaded before opening modal
    if (technicians.length === 0) {
      dispatch(GetAllTechnicians());
    }

    // Prefer authoritative data from jobCards (ServiceIDs or ServiceNames) when available.
    // Fall back to localStorage only if job card doesn't contain service data.
    try {
      let initialized = false;
      if (Array.isArray(jobCards) && jobCards.length > 0) {
        const jc = jobCards.find(x => String(x.J_BookingID) === String(bookingId));
        if (jc) {
          // set initial status if available - FIXED: Only show "In Progress" or "Job Done"
          if (jc.J_JobCardStatus) {
            // Convert "Assigned" status to "In Progress"
            const status = jc.J_JobCardStatus === 'Assigned' ? 'In Progress' : jc.J_JobCardStatus;
            setSelectedStatus(status);
            setOriginalStatus(status); // Store original status
          }

          // FIXED: Set technician name from job card if available
          if (jc.J_Technician) {
            console.log('Setting technician from job card:', jc.J_Technician);
            setSelectedTechnician(jc.J_Technician);
            setTechnicianAssigned(true);
          } else {
            setSelectedTechnician('');
            setTechnicianAssigned(false);
          }

          // try to load ServiceIDs directly
          let svcIds = [];
          if (Array.isArray(jc.ServiceIDs) && jc.ServiceIDs.length > 0) {
            svcIds = jc.ServiceIDs.map(id => String(id));
          } else if (jc.ServiceIDs && typeof jc.ServiceIDs === 'string') {
            svcIds = String(jc.ServiceIDs).split(',').map(s => s.trim()).filter(Boolean);
          } else if (jc.ServiceNames) {
            const names = String(jc.ServiceNames).split(',').map(s => s.trim()).filter(Boolean);
            names.forEach(n => {
              const s = servicesList.find(x => String(x?.S_ServiceName).toLowerCase() === String(n).toLowerCase());
              if (s) svcIds.push(String(s.S_ServiceID));
            });
          }

          if (svcIds.length > 0) {
            setSelectedServices(svcIds);
            initialized = true;
          }
        }
      }

      if (!initialized) {
        const stored = localStorage.getItem(`jobcard_selected_services_${bookingId}`);
        if (stored) setSelectedServices(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error initializing services:', e);
    }

    // if not in localStorage try to initialize from the jobCards data (ServiceIDs or ServiceNames)
    try {
      const stored = localStorage.getItem(`jobcard_selected_services_${bookingId}`);
      if (!stored && Array.isArray(jobCards) && jobCards.length > 0) {
        const jc = jobCards.find(x => String(x.J_BookingID) === String(bookingId));
        if (jc) {
          // set status from job card when available - FIXED: Only show "In Progress" or "Job Done"
          if (jc.J_JobCardStatus) {
            // Convert "Assigned" status to "In Progress"
            const status = jc.J_JobCardStatus === 'Assigned' ? 'In Progress' : jc.J_JobCardStatus;
            setSelectedStatus(status);
            setOriginalStatus(status); // Store original status
          }

          // FIXED: Set technician name from job card when available
          if (jc.J_Technician) {
            console.log('Setting technician from job card (fallback):', jc.J_Technician);
            setSelectedTechnician(jc.J_Technician);
            setTechnicianAssigned(true);
          } else {
            setSelectedTechnician('');
            setTechnicianAssigned(false);
          }

          // try to load ServiceIDs directly
          let svcIds = [];
          if (Array.isArray(jc.ServiceIDs) && jc.ServiceIDs.length > 0) {
            svcIds = jc.ServiceIDs.map(id => String(id));
          } else if (jc.ServiceIDs && typeof jc.ServiceIDs === 'string') {
            svcIds = String(jc.ServiceIDs).split(',').map(s => s.trim()).filter(Boolean);
          } else if (jc.ServiceNames) {
            // map names -> IDs using servicesList
            const names = String(jc.ServiceNames).split(',').map(s => s.trim()).filter(Boolean);
            names.forEach(n => {
              const s = servicesList.find(x => String(x?.S_ServiceName).toLowerCase() === String(n).toLowerCase());
              if (s) svcIds.push(String(s.S_ServiceID));
            });
          }

          if (svcIds.length > 0) setSelectedServices(svcIds);
        }
      }
    } catch (e) {
      console.error('Error in fallback initialization:', e);
    }

    // load structured services with parts for booking (prefer authoritative grouped data)
    try {
      const svcResp = await getBookingServicesWithParts(String(bookingId));
      if (svcResp?.StatusCode === 200 && Array.isArray(svcResp.ResultSet) && svcResp.ResultSet.length > 0) {
        const groups = {};
        const svcSet = new Set();
        svcResp.ResultSet.forEach(row => {
          const sid = row.ServiceID || row.S_ServiceID || row.ServiceId || row.ServiceID;
          const pid = row.PartID || row.P_PartID || row.PartId || row.PARTID || row.PartID;
          const qty = parseInt(row.Quantity || row.Qty || 0, 10) || 0;
          const unit = parseFloat(row.UnitPrice || row.P_UnitPrice || row.UnitPrice || 0) || 0;
          if (sid != null && String(sid).trim() !== '') {
            const key = String(sid);
            svcSet.add(String(sid));
            if (!Array.isArray(groups[key])) groups[key] = [];
            if (pid) groups[key].push({ partId: String(pid), qty: qty || 1, unitPrice: unit });
          } else {
            if (!Array.isArray(groups['unassigned'])) groups['unassigned'] = [];
            if (pid) groups['unassigned'].push({ partId: String(pid), qty: qty || 1, unitPrice: unit });
          }
        });
        const svcArray = Array.from(svcSet);
        if (svcArray.length > 0) setSelectedServices(svcArray.map(id => String(id)));
        setSelectedPartsByService(groups);
        setSelectedPartsRows(flattenSelectedParts(groups));
      } else {
        // fallback to flat parts endpoint
        const resp = await getBookingPartsByBookingID(String(bookingId));
        if (resp?.StatusCode === 200) {
          const rows = (resp.ResultSet || []).map(bp => ({ partId: String(bp.PartID || bp.P_PartID || bp.PartId || ''), qty: parseInt(bp.Quantity || bp.Qty || 1, 10) || 1, unitPrice: parseFloat(bp.UnitPrice || bp.P_UnitPrice || bp.J_Charge || 0) || 0 }));
          setSelectedPartsByService({ unassigned: rows });
          setSelectedPartsRows(rows);
        } else {
          setSelectedPartsByService({});
          setSelectedPartsRows([]);
        }
      }
    } catch (e) {
      // if anything fails, fallback to empty
      console.warn('Failed to fetch structured booking services with parts', e);
      setSelectedPartsByService({});
      setSelectedPartsRows([]);
    }

    setModalOpen(true);
  };

  // when jobCards change, fetch booking-specific parts like admin page does
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

  // Build a map of bookingId -> service names using jobCards data or ServiceIDs
  useEffect(() => {
    try {
      if (!Array.isArray(jobCards) || jobCards.length === 0) return;
      const sMap = {};
      for (const jc of jobCards) {
        const bookingId = String(jc.J_BookingID || '');
        if (!bookingId) continue;
        let names = [];
        if (Array.isArray(jc.ServiceIDs) && jc.ServiceIDs.length > 0) {
          names = jc.ServiceIDs.map(id => {
            const svc = servicesList.find(x => String(x?.S_ServiceID) === String(id));
            return svc?.S_ServiceName || String(id);
          });
        } else if (jc.ServiceIDs && typeof jc.ServiceIDs === 'string') {
          const ids = String(jc.ServiceIDs).split(',').map(s => s.trim()).filter(Boolean);
          names = ids.map(id => {
            const svc = servicesList.find(x => String(x?.S_ServiceID) === String(id));
            return svc?.S_ServiceName || String(id);
          });
        } else if (jc.ServiceNames) {
          names = String(jc.ServiceNames).split(',').map(s => s.trim()).filter(Boolean);
        }
        if (names.length > 0) sMap[bookingId] = names;
      }
      setBookingServicesMap(sMap);
    } catch (e) {
      // ignore
    }
  }, [jobCards, servicesList]);

  const toggleService = (id) => {
    setSelectedServices(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // persist selected services like admin page so checked items are remembered
  useEffect(() => {
    try {
      localStorage.setItem('jobcard_selected_services_temp', JSON.stringify(selectedServices));
      if (currentBookingId) localStorage.setItem(`jobcard_selected_services_${currentBookingId}`, JSON.stringify(selectedServices));
    } catch (e) {
      // ignore localStorage errors
    }
  }, [selectedServices, currentBookingId]);

  // Ensure groups exist for selected services (create empty arrays for each)
  useEffect(() => {
    setSelectedPartsByService(prev => {
      const copy = { ...(prev || {}) };
      let changed = false;
      (selectedServices || []).forEach(sid => {
        const key = String(sid);
        if (!Array.isArray(copy[key])) {
          copy[key] = [];
          changed = true;
        }
      });
      if (changed) {
        syncFlattenToState(copy);
        return copy;
      }
      return prev;
    });
  }, [selectedServices]);

  // Helpers to manage grouped parts by service in the modal
  const flattenSelectedParts = (byService) => {
    const groups = byService || selectedPartsByService || {};
    const flat = [];
    Object.keys(groups).forEach(key => {
      const arr = Array.isArray(groups[key]) ? groups[key] : [];
      arr.forEach(r => flat.push({ ...r }));
    });
    return flat;
  };

  const syncFlattenToState = (byService) => {
    const flat = flattenSelectedParts(byService);
    setSelectedPartsRows(flat);
  };

  const addPartRowToService = (serviceKey = 'unassigned') => {
    setSelectedPartsByService(prev => {
      const copy = { ...(prev || {}) };
      if (!Array.isArray(copy[serviceKey])) copy[serviceKey] = [];
      copy[serviceKey].push({ partId: '', qty: 1, unitPrice: 0 });
      // sync flattened
      syncFlattenToState(copy);
      return copy;
    });
  };

  const updatePartRowInService = (serviceKey, idx, updates) => {
    setSelectedPartsByService(prev => {
      const copy = { ...(prev || {}) };
      if (!Array.isArray(copy[serviceKey])) copy[serviceKey] = [];
      copy[serviceKey] = copy[serviceKey].map((r, i) => i === idx ? { ...r, ...updates } : r);
      // sync flattened
      syncFlattenToState(copy);
      return copy;
    });
    
    // Clear validation error for this specific part row when updated
    const errorKey = `${serviceKey}_${idx}`;
    if (partsValidationErrors[errorKey]) {
      setPartsValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const removePartRowFromService = (serviceKey, idx) => {
    setSelectedPartsByService(prev => {
      const copy = { ...(prev || {}) };
      if (!Array.isArray(copy[serviceKey])) return prev;
      copy[serviceKey] = copy[serviceKey].filter((_, i) => i !== idx);
      // cleanup empty groups
      if (Array.isArray(copy[serviceKey]) && copy[serviceKey].length === 0) delete copy[serviceKey];
      syncFlattenToState(copy);
      return copy;
    });
    
    // Remove validation error for this specific part row when removed
    const errorKey = `${serviceKey}_${idx}`;
    if (partsValidationErrors[errorKey]) {
      setPartsValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  // NEW: Check if status has changed to "Job Done"
  const hasStatusChangedToJobDone = () => {
    return selectedStatus === 'Job Done' && originalStatus !== 'Job Done';
  };

  // CORRECTED: onSubmit function with proper technician assignment flow
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!currentBookingId) return;
    
    // Validate technician selection
    if (!selectedTechnician) {
      alert('Please select a technician before updating the job card.');
      return;
    }
    
    // Validate parts before submission
    if (!validateParts()) {
      alert('Please fix the parts validation errors before submitting.');
      return;
    }

    // Check if status has changed to "Job Done" - only allow updates in this case
    if (!hasStatusChangedToJobDone()) {
      alert('You can only update the job card when changing the status to "Job Done".');
      return;
    }
    
    setLoadingSubmit(true);
    try {
      // First, assign technician if not already assigned in this session
      if (!technicianAssigned) {
        const assignmentSuccess = await handleAssignTechnician();
        if (!assignmentSuccess) {
          setLoadingSubmit(false);
          return;
        }
      }

      // Update booking services
      const newServiceIds = (selectedServices || []).map(id => parseInt(id, 10)).filter(Boolean);

      if (newServiceIds.length > 0) {
        // Build ServiceParts payload with per-service parts when available
        try {
          const serviceParts = (selectedServices || []).map(sid => {
            const partsForSvc = (selectedPartsByService && selectedPartsByService[String(sid)]) || [];
            const partsArray = (partsForSvc || []).map(p => ({ PartID: String(p.partId || ''), Quantity: String(p.qty || '0') })).filter(p => p.PartID && p.Quantity);
            return { ServiceID: String(sid), Parts: partsArray };
          });

          const payload = { J_BookingID: String(currentBookingId), ServiceParts: serviceParts };
          const respSvc = await updateBookingService(payload);
          // Check backend response and fallback if it didn't succeed
          if (respSvc?.StatusCode === 200) {
            try {
              const names = (newServiceIds || []).map(id => {
                const svc = servicesList.find(x => String(x.S_ServiceID) === String(id) || String(x.S_ServiceID) === String(parseInt(id,10)));
                return svc?.S_ServiceName || String(id);
              });
              setBookingServicesMap(prev => ({ ...prev, [String(currentBookingId)]: names }));
            } catch (e) {}
            try { localStorage.removeItem(`jobcard_selected_services_${currentBookingId}`); } catch(e){}
          } else {
            console.warn('UpdateBookingServices returned non-200 for supervisor', respSvc);
            // fallback to previous behavior (updateBookingServices with simple ids)
            try {
              const resp = await updateBookingServices({ J_BookingID: String(currentBookingId), NewServiceIDs: newServiceIds });
              try {
                const names = (newServiceIds || []).map(id => {
                  const svc = servicesList.find(x => String(x.S_ServiceID) === String(id) || String(x.S_ServiceID) === String(parseInt(id,10)));
                  return svc?.S_ServiceName || String(id);
                });
                setBookingServicesMap(prev => ({ ...prev, [String(currentBookingId)]: names }));
              } catch (e) {}
              try { localStorage.removeItem(`jobcard_selected_services_${currentBookingId}`); } catch(e){}
            } catch (e) {
              console.error('Fallback updateBookingServices also failed for supervisor', e);
            }
          }
        } catch (err) {
          console.error('UpdateBookingService failed in supervisor flow, falling back to UpdateBookingServices', err);
          // fallback to previous behavior (updateBookingServices with simple ids)
          try {
            const resp = await updateBookingServices({ J_BookingID: String(currentBookingId), NewServiceIDs: newServiceIds });
            try {
              const names = (newServiceIds || []).map(id => {
                const svc = servicesList.find(x => String(x.S_ServiceID) === String(id) || String(x.S_ServiceID) === String(parseInt(id,10)));
                return svc?.S_ServiceName || String(id);
              });
              setBookingServicesMap(prev => ({ ...prev, [String(currentBookingId)]: names }));
            } catch (e) {}
            try { localStorage.removeItem(`jobcard_selected_services_${currentBookingId}`); } catch(e){}
          } catch (e) {
            console.error('Fallback updateBookingServices also failed for supervisor', e);
          }
        }
      }

      // Ensure flattened parts reflect grouped parts before submitting
      const flattenedParts = flattenSelectedParts(selectedPartsByService);
      setSelectedPartsRows(flattenedParts);
      // Update booking parts: include ServiceID per item so backend records association (avoid NULL ServiceID rows)
      try {
        const partsListFromGroups = [];
        try {
          const groups = selectedPartsByService || {};
          Object.keys(groups).forEach(key => {
            const rows = Array.isArray(groups[key]) ? groups[key] : [];
            const svcId = key === 'unassigned' ? null : (parseInt(key, 10) || null);
            rows.forEach(p => {
              const pid = parseInt(p.partId || 0, 10) || 0;
              const qty = parseInt(p.qty || 0, 10) || 0;
              if (pid && qty) {
                const item = { PartID: pid, Quantity: qty };
                if (svcId != null) item.ServiceID = svcId;
                partsListFromGroups.push(item);
              }
            });
          });
        } catch (e) {
          (flattenedParts || []).forEach(p => {
            const pid = parseInt(p.partId || 0, 10) || 0;
            const qty = parseInt(p.qty || 0, 10) || 0;
            if (pid && qty) partsListFromGroups.push({ PartID: pid, Quantity: qty });
          });
        }

        if (partsListFromGroups.length > 0) {
          await addBookingParts({ J_BookingID: String(currentBookingId), PartsList: partsListFromGroups });
        }
      } catch (e) {
        console.warn('Failed to add booking parts (supervisor)', e);
      }

      // store totals via addJobCardService similar to admin flow
      try {
        const partsQty = (flattenedParts || []).reduce((s, r) => s + (parseInt(r.qty || 0, 10) || 0), 0);
        const partsTotal = (flattenedParts || []).reduce((s, r) => s + ((parseFloat(r.unitPrice || 0) || 0) * (parseInt(r.qty || 0, 10) || 0)), 0);
        const svcTotal = (selectedServices || []).reduce((s, id) => {
          const svc = servicesList.find(x => String(x.S_ServiceID) === String(id));
          return s + (parseFloat(svc?.S_BaseCharge || 0) || 0);
        }, 0);
        const grandTotal = svcTotal + partsTotal;
        const technicianId = getTechnicianIdFromName(selectedTechnician);
        const payloadForAdd = { 
          J_BookingID: String(currentBookingId), 
          J_CreatedDate: dayjs().format('YYYY-MM-DD'), 
          J_Technician: selectedTechnician,
          J_TechnicianID: technicianId,
          J_JobCardStatus: selectedStatus || 'Job Done', 
          Quantity: partsQty, 
          Price: parseFloat(grandTotal.toFixed(2)) 
        };
        const respAdd = await addJobCardService(payloadForAdd);
        // update local totals cache so table shows new totals immediately
        try {
          setTotalsMap(prev => ({ 
            ...prev, 
            [String(currentBookingId)]: { 
              Quantity: partsQty, 
              Price: parseFloat(grandTotal.toFixed(2)), 
              J_JobCardStatus: selectedStatus || 'Job Done',
              J_Technician: selectedTechnician,
              J_TechnicianID: technicianId
            } 
          }));
        } catch (e) {}
        // Update job card status
        try {
          await dispatch(UpdateJobCard({ 
            J_BookingID: String(currentBookingId), 
            J_JobCardStatus: selectedStatus || 'Job Done',
            J_Technician: selectedTechnician,
            J_TechnicianID: technicianId
          }));
        } catch (e) {
          // non-blocking
        }
      } catch (e) {
        // non-blocking
      }

      alert('Job card updated successfully! Status changed to "Job Done".');
      setModalOpen(false);
      dispatch(GetAllJobCards());
      dispatch(GetAllJobCardItems());
    } catch (err) {
      console.error(err);
      alert('Failed to save changes');
    } finally {
      setLoadingSubmit(false);
    }
  };

  // Deduplicate jobCards similar to admin page so rows with totals are preferred
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

  // Filters: normally only In Progress job cards for supervisors and search term.
  // Additionally allow cards where the supervisor has recently added services/parts (tracked in totalsMap or bookingServicesMap)
  const filteredJobCards = dedupedJobCards && dedupedJobCards.length > 0
    ? dedupedJobCards.filter(jobCard => {
      const bookingKey = String(jobCard.J_BookingID || '').toString();
      const status = String(jobCard.J_JobCardStatus || '').toLowerCase();

      // show only if In Progress OR if we have local totals that indicate supervisor activity
      // FIXED: Also show "Assigned" status job cards as they should be treated as "In Progress"
      const showBecauseTotals = totalsMap && totalsMap[bookingKey];
      const isInProgressOrAssigned = status === 'in progress' || status === 'assigned';
      if (!isInProgressOrAssigned && !showBecauseTotals) return false;

      const term = String(searchTerm || '').toLowerCase();
      if (!term) return true;
      const bookingId = String(jobCard.J_BookingID || '').toLowerCase();
      const technician = String(jobCard.J_Technician || '').toLowerCase();
      const services = String(jobCard.ServiceNames || '').toLowerCase();
      const itemsForCard = Array.isArray(jobCardItems) ? jobCardItems.filter(it => String(it.J_JobCardID) === String(jobCard.J_JobCardID)) : [];
      const partsString = itemsForCard.map(it => {
        const part = partsList.find(p => String(p?.P_PartID) === String(it.J_PartID));
        return part?.P_PartName || String(it.J_PartID || '');
      }).join(', ').toLowerCase();

      return (
        bookingId.includes(term) ||
        technician.includes(term) ||
        status.includes(term) ||
        services.includes(term) ||
        partsString.includes(term)
      );
    })
    : [];

  // Calculate job card stats (show totals for all jobCards, not just filtered)
  const totalJobCards = jobCards?.length || 0;
  const pendingJobs = jobCards?.filter(jobCard => String(jobCard.J_JobCardStatus) === 'Pending').length || 0;
  const inProgressJobs = jobCards?.filter(jobCard => 
    String(jobCard.J_JobCardStatus) === 'In Progress' || String(jobCard.J_JobCardStatus) === 'Assigned'
  ).length || 0;
  const completedJobs = jobCards?.filter(jobCard => String(jobCard.J_JobCardStatus) === 'Completed').length || 0;
  const assignedJobs = jobCards?.filter(jobCard => String(jobCard.J_JobCardStatus) === 'Assigned').length || 0;

  const jobCardStats = {
    totalJobCards,
    pendingJobs,
    inProgressJobs,
    completedJobs,
    assignedJobs
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

  // Ensure newest bookings appear first in the supervisor list (sort by BookingID desc)
  const sortedFilteredJobCards = (filteredJobCards || []).slice().sort((a, b) => {
    const aKey = parseInt(a.J_BookingID || a.J_JobCardID || 0, 10) || 0;
    const bKey = parseInt(b.J_BookingID || b.J_JobCardID || 0, 10) || 0;
    return bKey - aKey;
  });

  return (
    <>
      <div className="h-full p-4 md:p-6">
        <div className="w-full space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg text-white p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Supervisor Job Cards</h1>
                <p className="text-blue-100">Manage assigned job cards in progress</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => { 
                    dispatch(GetAllJobCards()); 
                    dispatch(GetAllJobCardItems()); 
                    dispatch(GetAllTechnicians()); // Refresh technicians using Redux
                    fetchLists();
                  }}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-0 rounded-lg h-10 px-4 font-medium backdrop-blur-sm flex items-center"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Job Cards"
              value={jobCardStats.totalJobCards}
              icon={<ClipboardList />}
              color="text-blue-600"
              progress
            />
            <StatCard
              title="Pending"
              value={jobCardStats.pendingJobs}
              icon={<Calendar />}
              color="text-amber-600"
              progress
            />
            <StatCard
              title="In Progress"
              value={jobCardStats.inProgressJobs}
              icon={<User />}
              color="text-blue-600"
              progress
            />
            <StatCard
              title="Completed"
              value={jobCardStats.completedJobs}
              icon={<CheckCircle />}
              color="text-green-600"
              progress
            />
          </div>

          {/* Filters & Search */}
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
              <span className="text-sm text-gray-600">Showing {filteredJobCards.length} of {jobCardStats.totalJobCards} job cards</span>
            </div>
          </div>

          {/* Job Cards Table */}
          <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Job Cards List</h3>
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
                      {sortedFilteredJobCards.map((jobCard) => (
                        <tr key={jobCard.J_JobCardID} className="border-b border-gray-200 hover:bg-blue-50 transition-colors duration-200">
                          <td className="py-4 px-4 text-base font-medium text-gray-900">
                            <div className="font-medium">JC-{String(jobCard.J_JobCardID).padStart(4, '0')}</div>
                            <div className="text-xs text-gray-400">Booking: {jobCard.J_BookingID}</div>
                          </td>
                          <td className="py-4 px-4 text-base text-gray-700">{jobCard.J_BookingID}</td>
                          <td className="py-4 px-4 text-base text-gray-700">{new Date(jobCard.J_CreatedDate).toLocaleDateString()}</td>
                          <td className="py-4 px-4 text-base text-gray-700">
                            {jobCard.J_Technician || 'Unassigned'}
                            {jobCard.J_TechnicianID && (
                              <div className="text-xs text-gray-500">ID: {jobCard.J_TechnicianID}</div>
                            )}
                          </td>
                          <td className="py-4 px-4 align-top">
                              <div className="flex flex-col gap-2 max-w-xs">
                                {((bookingServicesMap[String(jobCard.J_BookingID)] || []).length > 0
                                  ? bookingServicesMap[String(jobCard.J_BookingID)]
                                  : (String(jobCard.ServiceNames || '').split(',').map(s => s.trim()).filter(Boolean))
                                ).map((svc, idx) => (
                                  <div key={idx} className="flex items-center justify-start gap-3">
                                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-800 border border-gray-100 shadow-sm truncate">{svc}</span>
                                  </div>
                                ))}
                              </div>
                          </td>

                          {/* Parts aggregation (use bookingPartsMap or jobCardItems) */}
                          {(() => {
                            const bookingParts = bookingPartsMap[jobCard.J_BookingID] || [];
                            const totalsOverride = totalsMap[String(jobCard.J_BookingID || jobCard.J_JobCardID || '')];
                            const hasBackendTotals = totalsOverride || (jobCard.Quantity !== undefined && jobCard.Quantity !== null && String(jobCard.Quantity).trim() !== '') || (jobCard.Price !== undefined && jobCard.Price !== null && String(jobCard.Price).trim() !== '');
                            const overrideQtyVal = totalsOverride?.Quantity ?? ((jobCard.Quantity !== undefined && jobCard.Quantity !== null && String(jobCard.Quantity).trim() !== '') ? (parseInt(jobCard.Quantity, 10) || 0) : null);
                            const overridePriceVal = totalsOverride?.Price ?? ((jobCard.Price !== undefined && jobCard.Price !== null && String(jobCard.Price).trim() !== '') ? (parseFloat(jobCard.Price) || 0) : null);
                            if (Array.isArray(bookingParts) && bookingParts.length > 0) {
                              const agg = {};
                              for (const bp of bookingParts) {
                                const pid = String(bp.PartID || bp.P_PartID || bp.PartId || bp.PARTID || '') || '';
                                if (!pid) continue;
                                const name = bp.PartName || bp.P_PartName || (() => { const p = partsList.find(x => String(x?.P_PartID) === pid); return p?.P_PartName || `#${pid}`; })();
                                const qty = parseInt(bp.Quantity || bp.Qty || 0, 10) || 0;
                                const unit = parseFloat(bp.UnitPrice || bp.P_UnitPrice || bp.P_UnitPrice || 0) || 0;
                                const total = parseFloat(bp.TotalPrice || (unit * qty) || 0) || 0;
                                if (!agg[pid]) {
                                  agg[pid] = { partId: pid, name, qty: 0, unit, totalPrice: 0 };
                                }
                                agg[pid].qty += qty;
                                agg[pid].totalPrice += total || (unit * qty);
                                if (!agg[pid].unit && unit) agg[pid].unit = unit;
                              }

                              const uniqueParts = Object.values(agg);
                              const totalQty = uniqueParts.reduce((s, p) => s + (p.qty || 0), 0);
                              const totalPrice = uniqueParts.reduce((s, p) => s + (parseFloat(p.totalPrice || 0) || 0), 0);

                              const displayQty = overrideQtyVal !== null ? overrideQtyVal : totalQty;
                              const displayPrice = overridePriceVal !== null ? overridePriceVal : totalPrice;

                              return (
                                <>
                                  <td className="py-4 px-4 align-top">
                                    <div className="flex flex-col gap-2" title={uniqueParts.map(p => `${p.name} x${p.qty} (${formatCurrency(p.totalPrice)})`).join(', ')}>
                                      {uniqueParts.map(p => (
                                        <div key={p.partId} className="flex items-center justify-between">
                                          <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-gray-800">{p.name}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="py-4 px-4"><span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">{displayQty}</span></td>
                                  <td className="py-4 px-4"><span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">{formatCurrency(displayPrice)}</span></td>
                                </>
                              );
                            }

                            // fallback to jobCardItems aggregation
                            const itemsForCard = Array.isArray(jobCardItems) ? jobCardItems.filter(it => String(it.J_JobCardID) === String(jobCard.J_JobCardID)) : [];
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

                            return (
                              <>
                                <td className="py-4 px-4 align-top">
                                  <div className="flex flex-col gap-2" title={uniqueItems.map(p => `${p.name} x${p.qty} (${formatCurrency(p.totalPrice)})`).join(', ')}>
                                    {uniqueItems.map(p => (
                                      <div key={p.partId} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <span className="text-sm font-medium text-gray-800">{p.name}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </td>
                                <td className="py-4 px-4"><span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">{displayQtyItems}</span></td>
                                <td className="py-4 px-4"><span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">{formatCurrency(displayPriceItems)}</span></td>
                              </>
                            );
                          })()}

                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              jobCard.J_JobCardStatus === 'Completed' ? 'bg-green-100 text-green-800' : 
                              jobCard.J_JobCardStatus === 'In Progress' || jobCard.J_JobCardStatus === 'Assigned' ? 'bg-blue-100 text-blue-800' : 
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {/* Show "In Progress" for both "In Progress" and "Assigned" statuses */}
                              {jobCard.J_JobCardStatus === 'Assigned' ? 'In Progress' : jobCard.J_JobCardStatus}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <button onClick={() => openEditForBooking(jobCard.J_BookingID)} className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-100 transition-colors" title="Edit job card"><Edit3 className="h-4 w-4" /></button>
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
                  <p className="text-gray-600 text-base font-medium">No job cards found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-6">
            <div className="bg-white w-full max-w-4xl rounded-lg shadow-2xl overflow-auto max-h-[90vh] border border-gray-200">
              <form onSubmit={onSubmit} className="p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold">Edit Job Card - Booking {currentBookingId}</h2>
                    <p className="text-sm text-gray-500">Edit services and parts below. You can change job status here.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-gray-700">Close</button>
                  </div>
                </div>

                {/* Technician Assignment */}
                <div className="border border-gray-200 rounded-xl p-4 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      Assign Technician
                    </h4>
                    {techniciansLoading && (
                      <span className="text-sm text-gray-500">Loading technicians...</span>
                    )}
                    {technicianAssigned && (
                      <span className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Technician Assigned
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Technician
                      </label>
                      {techniciansLoading ? (
                        <div className="text-sm text-gray-500">Loading technicians...</div>
                      ) : techniciansError ? (
                        <div className="text-sm text-red-500">{techniciansError}</div>
                      ) : (
                        <select 
                          value={selectedTechnician} 
                          onChange={(e) => handleTechnicianChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select a technician</option>
                          {getTechnicianNames().map(techName => (
                            <option key={techName} value={techName}>
                              {techName}
                            </option>
                          ))}
                        </select>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedTechnician ? `Selected: ${selectedTechnician}` : 'Select a technician and click "Assign Technician" to assign them to this job.'}
                      </p>
                    </div>
                    
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleAssignTechnician}
                        disabled={!selectedTechnician || assignTechnicianLoading}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                          !selectedTechnician || assignTechnicianLoading
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {assignTechnicianLoading ? 'Assigning...' : 'Assign Technician'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> {selectedTechnician ? `Technician "${selectedTechnician}" is already selected. You can update the assignment if needed, or proceed to update the job card.` : 'You can assign a technician separately using the button above, or assign them when updating the job card below.'} 
                      Technician assignment is required before updating the job card.
                    </p>
                  </div>
                </div>

                {/* Status selector for supervisor - FIXED: Only "In Progress" and "Job Done" */}
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    value={selectedStatus} 
                    onChange={(e) => setSelectedStatus(e.target.value)} 
                    className="w-56 px-3 py-2 border border-gray-200 rounded-md text-sm"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Job Done">Job Done</option>
                  </select>
                  {/* NEW: Show status change information */}
                  {hasStatusChangedToJobDone() && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-700 font-medium">
                        ✓ Status changed to "Job Done" - You can now update the job card
                      </p>
                    </div>
                  )}
                </div>

                {/* Services panel */}
                <div className="border border-gray-200 rounded-xl p-4 bg-white">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-gray-800">Services</h4>
                    <div className="text-sm text-gray-500">{servicesList.length} available</div>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <Search className="text-gray-400 h-5 w-5" />
                    <input value={serviceFilter} onChange={(e)=>setServiceFilter(e.target.value)} placeholder="Search services..." className="flex-1 px-3 py-2 border border-gray-200 rounded-md text-sm" />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-52 overflow-y-auto pr-2">
                    {servicesList.filter(s => String(s.S_ServiceName||'').toLowerCase().includes(serviceFilter.toLowerCase())).map(s => (
                      <label key={s.S_ServiceID} className={`flex items-start gap-3 p-3 rounded-lg border transition ${selectedServices.includes(String(s.S_ServiceID)) ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white hover:bg-gray-50 border-gray-100'}`}>
                        <input type="checkbox" className="mt-1" checked={selectedServices.includes(String(s.S_ServiceID))} onChange={() => toggleService(String(s.S_ServiceID))} />
                        <div className="text-sm">
                          <div className="font-medium text-gray-800">{s.S_ServiceName}</div>
                          <div className="text-xs text-gray-500">Rs {parseFloat(s.S_BaseCharge||0).toFixed(2)}</div>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(selectedServices || []).map(id => {
                      const svc = servicesList.find(x => String(x.S_ServiceID) === String(id));
                      return (
                        <span key={id} className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 text-sm">
                          {svc?.S_ServiceName || `#${id}`} <span className="ml-2 text-xs text-gray-600">Rs {parseFloat(svc?.S_BaseCharge||0).toFixed(2)}</span>
                        </span>
                      );
                    })}
                  </div>

                  <div className="mt-4 text-sm font-semibold text-gray-700">Services Total: <span className="text-green-700">{(() => { const total = (selectedServices||[]).reduce((sum,id)=>{ const svc=servicesList.find(x=>String(x.S_ServiceID)===String(id)); return sum + (parseFloat(svc?.S_BaseCharge||0)||0); },0); return `Rs ${total.toFixed(2)}` })()}</span></div>
                </div>

                {/* Parts panel */}
                <div className="border border-gray-200 rounded-xl p-4 bg-white">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-gray-800">Parts</h4>
                    <div className="text-sm text-gray-500">{partsList.length} available</div>
                  </div>

                  <div className="space-y-3">
                    {/* Render parts grouped under each selected service */}
                    {(selectedServices || []).map((svcId) => {
                      const svc = servicesList.find(s => String(s.S_ServiceID) === String(svcId));
                      const key = String(svcId);
                      const rows = selectedPartsByService[key] || [];
                      return (
                        <div key={key} className="border border-gray-100 rounded-lg p-3 bg-white">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-gray-800">{svc?.S_ServiceName || `Service ${key}`}</div>
                            <div>
                              <button type="button" onClick={() => addPartRowToService(key)} className="text-sm px-3 py-1 bg-green-50 text-green-700 rounded-md border border-green-100">+ Add Part</button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {rows.length === 0 && <div className="text-sm text-gray-500">No parts added for this service.</div>}
                            {rows.map((row, idx) => {
                              const errorKey = `${key}_${idx}`;
                              const errorMessage = partsValidationErrors[errorKey];
                              const partInInventory = partsList.find(p => String(p.P_PartID) === String(row.partId));
                              const availableStock = partInInventory ? parseInt(partInInventory.P_StockQty || 0, 10) : 0;
                              
                              return (
                                <div key={idx} className="flex items-center gap-3 p-2 rounded-lg border border-gray-100 bg-white">
                                  <Package className="text-green-500 h-5 w-5" />
                                  <div className="flex-1 grid grid-cols-12 gap-2 items-center">
                                    <div className="col-span-6">
                                      <select
                                        value={row.partId}
                                        onChange={(e) => {
                                          const partId = e.target.value;
                                          const part = partsList.find(p => String(p.P_PartID) === String(partId));
                                          const unit = part ? parseFloat(part.P_UnitPrice || 0) : 0;
                                          updatePartRowInService(key, idx, { partId, unitPrice: unit });
                                        }}
                                        className={`w-full px-3 py-2 border ${errorMessage ? 'border-red-300' : 'border-gray-200'} rounded-md text-sm bg-white`}
                                      >
                                        <option value="">Select part</option>
                                        {Array.isArray(partsList) && partsList.map(p => (
                                          <option key={p.P_PartID} value={p.P_PartID}>
                                            {p.P_PartName} — Rs {parseFloat(p.P_UnitPrice || 0).toFixed(2)} 
                                            {p.P_StockQty && ` (Stock: ${p.P_StockQty})`}
                                          </option>
                                        ))}
                                      </select>
                                      {errorMessage && (
                                        <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                          <AlertCircle className="h-3 w-3" />
                                          {errorMessage}
                                        </div>
                                      )}
                                    </div>

                                    <div className="col-span-2">
                                      <input
                                        type="number"
                                        min="1"
                                        value={row.qty}
                                        onChange={(e) => { 
                                          const q = parseInt(e.target.value || 0, 10) || 0; 
                                          updatePartRowInService(key, idx, { qty: q }); 
                                        }}
                                        className={`w-full px-3 py-2 border ${errorMessage ? 'border-red-300' : 'border-gray-200'} rounded-md text-sm`}
                                      />
                                    </div>

                                    <div className="col-span-3 text-sm">
                                      <div className="text-xs text-gray-500">Unit</div>
                                      <div className="font-medium">{row.unitPrice ? `Rs ${parseFloat(row.unitPrice).toFixed(2)}` : '-'}</div>
                                      {partInInventory && (
                                        <div className="text-xs text-gray-500">
                                          Stock: {availableStock}
                                        </div>
                                      )}
                                    </div>

                                    <div className="col-span-1 text-right">
                                      <div className="text-xs text-gray-500">Line</div>
                                      <div className="font-medium">{row.unitPrice ? `Rs ${(parseFloat(row.unitPrice || 0) * (parseInt(row.qty || 0) || 0)).toFixed(2)}` : 'Rs 0.00'}</div>
                                    </div>
                                  </div>

                                  <div className="w-12 text-right">
                                    <button type="button" onClick={() => removePartRowFromService(key, idx)} className="text-red-500 px-2 py-1 rounded-md hover:bg-red-50">Remove</button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}

                    {/* Unassigned parts (not linked to any service) */}
                    {Array.isArray(selectedPartsByService.unassigned) && (
                      <div className="border border-gray-100 rounded-lg p-3 bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-gray-800">Unassigned Parts</div>
                          <div>
                            <button type="button" onClick={() => addPartRowToService('unassigned')} className="text-sm px-3 py-1 bg-green-50 text-green-700 rounded-md border border-green-100">+ Add Part</button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {selectedPartsByService.unassigned.map((row, idx) => {
                            const errorKey = `unassigned_${idx}`;
                            const errorMessage = partsValidationErrors[errorKey];
                            const partInInventory = partsList.find(p => String(p.P_PartID) === String(row.partId));
                            const availableStock = partInInventory ? parseInt(partInInventory.P_StockQty || 0, 10) : 0;
                            
                            return (
                              <div key={idx} className="flex items-center gap-3 p-2 rounded-lg border border-gray-100 bg-white">
                                <Package className="text-green-500 h-5 w-5" />
                                <div className="flex-1 grid grid-cols-12 gap-2 items-center">
                                  <div className="col-span-6">
                                    <select 
                                      value={row.partId} 
                                      onChange={(e) => {
                                        const partId = e.target.value;
                                        const part = partsList.find(p => String(p.P_PartID) === String(partId));
                                        const unit = part ? parseFloat(part.P_UnitPrice || 0) : 0;
                                        updatePartRowInService('unassigned', idx, { partId, unitPrice: unit });
                                      }} 
                                      className={`w-full px-3 py-2 border ${errorMessage ? 'border-red-300' : 'border-gray-200'} rounded-md text-sm bg-white`}
                                    >
                                      <option value="">Select part</option>
                                      {Array.isArray(partsList) && partsList.map(p => (
                                        <option key={p.P_PartID} value={p.P_PartID}>
                                          {p.P_PartName} — Rs {parseFloat(p.P_UnitPrice || 0).toFixed(2)} 
                                          {p.P_StockQty && ` (Stock: ${p.P_StockQty})`}
                                        </option>
                                      ))}
                                    </select>
                                    {errorMessage && (
                                      <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errorMessage}
                                      </div>
                                    )}
                                  </div>
                                  <div className="col-span-2">
                                    <input 
                                      type="number" 
                                      min="1" 
                                      value={row.qty} 
                                      onChange={(e) => { 
                                        const q = parseInt(e.target.value || 0, 10) || 0; 
                                        updatePartRowInService('unassigned', idx, { qty: q }); 
                                      }} 
                                      className={`w-full px-3 py-2 border ${errorMessage ? 'border-red-300' : 'border-gray-200'} rounded-md text-sm`} 
                                    />
                                  </div>
                                  <div className="col-span-3 text-sm">
                                    <div className="text-xs text-gray-500">Unit</div>
                                    <div className="font-medium">{row.unitPrice ? `Rs ${parseFloat(row.unitPrice).toFixed(2)}` : '-'}</div>
                                    {partInInventory && (
                                      <div className="text-xs text-gray-500">
                                        Stock: {availableStock}
                                      </div>
                                    )}
                                  </div>
                                  <div className="col-span-1 text-right">
                                    <div className="text-xs text-gray-500">Line</div>
                                    <div className="font-medium">{row.unitPrice ? `Rs ${(parseFloat(row.unitPrice || 0) * (parseInt(row.qty || 0) || 0)).toFixed(2)}` : 'Rs 0.00'}</div>
                                  </div>
                                </div>
                                <div className="w-12 text-right">
                                  <button type="button" onClick={() => removePartRowFromService('unassigned', idx)} className="text-red-500 px-2 py-1 rounded-md hover:bg-red-50">Remove</button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                      <button type="button" onClick={() => addPartRowToService('unassigned')} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-green-100 text-green-700 rounded-md border border-green-200 text-sm hover:shadow-sm transition"><Plus className="h-4 w-4" /> Add Part (Unassigned)</button>
                    </div>
                  </div>

                  <div className="mt-4 text-sm font-semibold text-gray-700">Parts Total: <span className="text-green-700">{(() => { const total = selectedPartsRows.reduce((s,r)=> s + ((parseFloat(r.unitPrice||0)||0)*(parseInt(r.qty||0,10)||0)),0); return `Rs ${total.toFixed(2)}` })()}</span></div>
                </div>

                <div className="mt-4 text-right bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                  <div className="text-base font-bold text-gray-800">Grand Total: <span className="text-2xl text-indigo-700">{(() => { const svcTotal = (selectedServices||[]).reduce((s,id)=>{ const svc=servicesList.find(x=>String(x.S_ServiceID)===String(id)); return s + (parseFloat(svc?.S_BaseCharge||0)||0); },0); const partsTotal = selectedPartsRows.reduce((s,r)=> s + ((parseFloat(r.unitPrice||0)||0)*(parseInt(r.qty||0,10)||0)),0); return `Rs ${(svcTotal+partsTotal).toFixed(2)}` })()}</span></div>
                </div>

                <div className="flex flex-col md:flex-row items-end justify-end gap-3">
                  <div className="text-xs text-gray-500 md:mr-2">
                    {/* UPDATED: Note about status change requirement */}
                    {hasStatusChangedToJobDone() ? (
                      <span className="text-green-600 font-medium">
                        ✓ Ready to update - Status changed to "Job Done"
                      </span>
                    ) : (
                      <span>
                        Note: You can only update the job card when changing status to "Job Done".
                        {selectedStatus === 'Job Done' && ' (Status is already "Job Done")'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100">Cancel</button>
                    <button
                      type="submit"
                      disabled={loadingSubmit || !selectedTechnician || !hasStatusChangedToJobDone()}
                      title={
                        !selectedTechnician ? 'Please select a technician' : 
                        !hasStatusChangedToJobDone() ? 'You can only update when changing status to "Job Done"' : 
                        ''
                      }
                      className={`px-6 py-2 text-white rounded-lg shadow-md ${
                        loadingSubmit || !selectedTechnician || !hasStatusChangedToJobDone() 
                          ? 'bg-gray-300 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                      }`}
                    >
                      {loadingSubmit ? 'Saving...' : 'Update Job Card'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SupervisorJobCards;