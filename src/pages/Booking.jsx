import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchAllServices } from '../services/serviceServices';
import { addVehicle, getVehiclesByCustomerID } from '../services/vehicleServices';
import { timeslotService } from '../services/timeslotService';
import { createAppointment, createBookingDetails } from '../services/appointmentService';
import { fetchAllBookings } from '../services/adminServices';
import { authService } from '../services/authServices';

const Booking = () => {
  const dispatch = useDispatch();

  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [serviceSearch, setServiceSearch] = useState('');
  const [showExtraForm, setShowExtraForm] = useState(false);
  const [extraForm, setExtraForm] = useState({ name: '', price: '', time: '' });

  const [vehicleForm, setVehicleForm] = useState({ plate: '', make: '', model: '', year: '', vin: '' });
  const [addingVehicle, setAddingVehicle] = useState(false);
  const [createdVehicleId, setCreatedVehicleId] = useState(null);
  const [customerVehicles, setCustomerVehicles] = useState([]);
  const [loadingCustomerVehicles, setLoadingCustomerVehicles] = useState(false);
  const [selectedExistingVehicle, setSelectedExistingVehicle] = useState(null);
  const [showAddNewVehicle, setShowAddNewVehicle] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0,10));
  const [timeslots, setTimeslots] = useState([]);
  const [selectedTimeslot, setSelectedTimeslot] = useState(null);
  const [bookings, setBookings] = useState([]);

  const [notes, setNotes] = useState('');
  const [booking, setBooking] = useState(false);

  // New state for filtered bookings by status
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [showBookings, setShowBookings] = useState(true); // Show bookings by default

  useEffect(() => {
    loadServices();
    loadTimeslots();
    loadBookings();
  }, []);

  // reload bookings whenever selectedDate changes so remaining counts update
  useEffect(() => {
    loadBookings();
  }, [selectedDate]);

  // Refresh timeslots/bookings when the user focuses the window/tab so admin changes (delete/add) propagate quickly
  useEffect(() => {
    const onFocus = () => {
      loadTimeslots();
      loadBookings();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  // when the user navigates to vehicle step, load their existing vehicles
  useEffect(() => {
    if (step === 3) loadCustomerVehicles();
  }, [step]);

  // On mount, restore previously selected timeslot from localStorage if present
  useEffect(() => {
    try {
      const raw = localStorage.getItem('selectedTimeslot');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.id) setSelectedTimeslot(parsed);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Restore selected services from localStorage after services are loaded
  useEffect(() => {
    try {
      const rawIds = localStorage.getItem('selectedServiceIds');
      if (!rawIds) return;
      const ids = JSON.parse(rawIds);
      if (!Array.isArray(ids) || ids.length === 0) return;
      // If services are loaded, map ids to service objects
      if (services && services.length > 0) {
        const found = services.filter(s => ids.includes(s.S_ServiceID) || ids.includes(String(s.S_ServiceID)));
        if (found.length) setSelectedServices(found);
      }
    } catch (e) {
      // ignore
    }
  }, [services]);

  // Persist selected service IDs whenever selection changes
  useEffect(() => {
    try {
      const ids = selectedServices.map(s => s.S_ServiceID);
      localStorage.setItem('selectedServiceId', JSON.stringify(ids));
      console.log('Persisted selectedServiceId', ids);
    } catch (e) {}
  }, [selectedServices]);

  useEffect(() => {
    // whenever selectedDate changes, clear selected timeslot/time
    setSelectedTimeslot(null);
    // optionally re-filter is handled via derived availableTimeslots
  }, [selectedDate]);

  // Function to load and filter bookings by status
  const loadBookings = async () => {
    try {
      setLoadingBookings(true);
      const res = await fetchAllBookings();
      const rs = res?.ResultSet || res?.Result || [];
      
      // Process and filter bookings by status in order: Pending, Approved, Rejected
      const processedBookings = (Array.isArray(rs) ? rs : [])
        .map(booking => ({
          id: booking.B_BookingID || booking.BookingID || booking.id,
          customerName: booking.CustomerName || booking.customerName || 'Unknown Customer',
          contact: booking.Contact || booking.Phone || booking.Mobile || 'N/A',
          vehicle: booking.VehicleDetails || `${booking.V_Make || ''} ${booking.V_Model || ''}`.trim() || 'Unknown Vehicle',
          services: booking.Services || booking.ServiceNames || 'General Service',
          date: booking.B_BookingDate || booking.BookingDate || booking.createdDate,
          time: booking.B_BookingTime || booking.TimeSlot || '',
          status: booking.B_BookingStatus || booking.Status || 'Pending',
          totalAmount: booking.TotalAmount || booking.Amount || '0'
        }))
        .filter(booking => booking.date) // Filter out bookings without dates
        .sort((a, b) => {
          // First sort by status: Pending -> Approved -> Rejected
          const statusOrder = { 'pending': 1, 'approved': 2, 'rejected': 3 };
          const aStatus = a.status.toLowerCase();
          const bStatus = b.status.toLowerCase();
          
          if (statusOrder[aStatus] !== statusOrder[bStatus]) {
            return statusOrder[aStatus] - statusOrder[bStatus];
          }
          
          // Then sort by booking ID in descending order (newest first) within same status
          return (b.id || 0) - (a.id || 0);
        });

      setFilteredBookings(processedBookings);
      setBookings(Array.isArray(rs) ? rs : []);
    } catch (err) {
      console.error('Failed to load bookings', err);
      setFilteredBookings([]);
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  // Function to format date for display in a user-friendly way
  const formatDisplayDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date)) return dateString;
      
      // Format as "MMM DD, YYYY" - more user-friendly
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Function to get relative time (e.g., "2 days ago", "Today", "Yesterday")
  const getRelativeTime = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date)) return '';
      
      const now = new Date();
      const diffTime = now - date;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return 'Today';
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
      } else {
        return formatDisplayDate(dateString);
      }
    } catch (e) {
      return '';
    }
  };

  // Function to get status color
  const getStatusColor = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'confirmed' || statusLower === 'approved' || statusLower === 'completed') return 'bg-green-100 text-green-800';
    if (statusLower === 'pending') return 'bg-yellow-100 text-yellow-800';
    if (statusLower === 'cancelled' || statusLower === 'rejected') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const loadTimeslots = async () => {
    try {
      const res = await timeslotService.getAllTimeslots();
      const rs = res?.ResultSet || res?.Result || [];
      // Only expose active timeslots to customers (backend may mark deleted/inactive with T_Status !== 'A')
      const active = timeslotService.filterActiveTimeslots(rs || []);
      const mapped = (active || []).map(r => ({
        id: r.T_TimeslotID,
        dateRaw: r.T_Date,
        dateISO: backendDateToISO(r.T_Date),
        startRaw: r.T_StartTime,
        endRaw: r.T_EndTime,
        startDisplay: formatTimeDisplay(r.T_StartTime),
        endDisplay: formatTimeDisplay(r.T_EndTime),
        maxCustomers: Number(r.T_MaxCustomers) || 0,
        status: r.T_Status
      }));
      setTimeslots(mapped);
    } catch (err) {
      console.error('Failed to load timeslots', err);
    }
  };

  const loadCustomerVehicles = async () => {
    try {
      setLoadingCustomerVehicles(true);
      const customerId = authService.getCustomerId();
      if (!customerId) { setCustomerVehicles([]); return; }
      const res = await getVehiclesByCustomerID(customerId);
      const list = res?.Result || res?.ResultSet || res?.Data || res || [];
      const mapped = (Array.isArray(list) ? list : []).map(v => ({
        id: v.VehicleID || v.VehicalID || v.V_VehicleID || v.id || v.ID || v.V_ID || v.VehicalID,
        make: v.V_Make || v.Make || v.make || '',
        model: v.V_Model || v.Model || v.model || '',
        year: v.V_Year || v.Year || v.year || '',
        plate: v.V_PlateNumber || v.PlateNumber || v.plate || '',
        color: v.V_Color || v.color || '',
        mileage: v.V_Mileage || v.mileage || '',
        nextService: v.V_NextService || v.nextService || '',
        image: v.V_Image || v.image || 'https://via.placeholder.com/300x200?text=Vehicle'
      }));
      setCustomerVehicles(mapped);
    } catch (err) {
      console.error('Failed to load customer vehicles', err);
      setCustomerVehicles([]);
    } finally {
      setLoadingCustomerVehicles(false);
    }
  };

  // Convert backend date like "10/17/2025 12:00:00 AM" to YYYY-MM-DD
  const backendDateToISO = (d) => {
    if (!d) return '';
    const parsed = new Date(d);
    if (!isNaN(parsed)) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const day = String(parsed.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
    // fallback: try parsing MM/DD/YYYY
    const m = d.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (m) {
      const mm = String(m[1]).padStart(2, '0');
      const dd = String(m[2]).padStart(2, '0');
      return `${m[3]}-${mm}-${dd}`;
    }
    return '';
  };

  // Convert times like "09:00:00" or "09:00" -> "09:00 AM"
  const formatTimeDisplay = (t) => {
    if (!t) return 'Not set';
    const s = String(t).trim();
    const parts = s.split(':');
    let hh = parseInt(parts[0]||'0',10);
    const mm = parts[1] || '00';
    const ampm = hh >= 12 ? 'PM' : 'AM';
    hh = hh % 12 || 12;
    return `${String(hh).padStart(2,'0')}:${mm} ${ampm}`;
  };

  // Parse a slot's start time into a Date object (local) using slot.dateISO and slot.startRaw
  const getSlotStartDateTime = (slot) => {
    try {
      if (!slot || !slot.dateISO) return null;
      const datePart = slot.dateISO; // YYYY-MM-DD
      let timePart = slot.startRaw || slot.startDisplay || '';
      timePart = String(timePart).trim();
      // If time contains AM/PM, convert to 24h
      const ampmMatch = timePart.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      let hh = 0, mm = 0;
      if (ampmMatch) {
        hh = parseInt(ampmMatch[1],10);
        mm = parseInt(ampmMatch[2],10);
        const ampm = ampmMatch[3].toUpperCase();
        if (ampm === 'PM' && hh !== 12) hh += 12;
        if (ampm === 'AM' && hh === 12) hh = 0;
      } else {
        // Try HH:MM(:SS) 24h
        const parts = String(timePart).match(/(\d{1,2}):(\d{2})(?::\d{2})?/);
        if (parts) {
          hh = parseInt(parts[1],10);
          mm = parseInt(parts[2],10);
        } else {
          // fallback to 00:00
          hh = 0; mm = 0;
        }
      }
      // Build a Date in local timezone
      const iso = `${datePart}T${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:00`;
      const d = new Date(iso);
      if (isNaN(d)) return null;
      return d;
    } catch (e) {
      return null;
    }
  };

  const isSlotInPast = (slot) => {
    try {
      if (!slot) return false;
      const slotStart = getSlotStartDateTime(slot);
      if (!slotStart) return false;
      const now = new Date();
      return slotStart.getTime() <= now.getTime();
    } catch (e) {
      return false;
    }
  };

  // Count active bookings for a timeslot on a given date.
  // We consider statuses that represent an active reservation: Pending, Approved, Scheduled, Confirmed
  const countBookingsForSlot = (slotId, dateISO) => {
    if (!bookings || bookings.length === 0) return 0;
    const lowerDate = String(dateISO || '').trim();
    return bookings.reduce((acc, b) => {
      try {
        const timeslotId = String(b.B_timeslotID || b.B_TimeslotID || b.T_TimeslotID || b.B_SlotID || b.TimeslotID || '').trim();
        const bookingDateRaw = b.B_BookingDate || b.B_PreferredDate || b.BookingDate || b.B_BookingDateRaw || '';
        const bookingDateISO = bookingDateRaw && bookingDateRaw.indexOf('/') !== -1 ? backendDateToISO(bookingDateRaw) : String(bookingDateRaw || '').slice(0,10);
        const status = String(b.B_BookingStatus || b.Status || '').toLowerCase();
        const isActive = status !== 'cancelled' && status !== 'rejected' && status !== 'disapproved' && status !== 'deleted';
        if (!isActive) return acc;
        if (String(timeslotId) === String(slotId) && String(bookingDateISO) === String(lowerDate)) return acc + 1;
      } catch (e) {
        // ignore malformed booking
      }
      return acc;
    }, 0);
  };

  const loadServices = async () => {
    try {
      setLoadingServices(true);
      const res = await fetchAllServices();
      const list = res?.ResultSet || res?.Result || [];
      setServices(list);
    } catch (err) {
      console.error('Failed to load services', err);
    } finally {
      setLoadingServices(false);
    }
  };

  const toggleService = (s) => {
    const found = selectedServices.find(x => x.S_ServiceID === s.S_ServiceID);
    if (found) setSelectedServices(selectedServices.filter(x => x.S_ServiceID !== s.S_ServiceID));
    else setSelectedServices([...selectedServices, s]);
  };

  const handleAddExtraService = () => {
    const name = (extraForm.name || '').trim();
    const price = Number(extraForm.price || 0);
    const time = extraForm.time || '';
    if (!name || !price) { alert('Please enter name and price for extra service'); return; }

    const custom = {
      S_ServiceID: `custom-${Date.now()}`,
      S_ServiceName: name,
      S_Description: 'Extra service added by customer',
      S_BaseCharge: price,
      S_Time: time || '0',
      isCustom: true
    };

    setSelectedServices(prev => [...prev, custom]);
    setExtraForm({ name: '', price: '', time: '' });
    setShowExtraForm(false);
  };

  const handleAddVehicle = async () => {
    if (!vehicleForm.plate.trim() || !vehicleForm.make.trim() || !vehicleForm.model.trim() || !vehicleForm.year.toString().trim()) {
      alert('Please fill Plate, Make, Model and Year');
      return;
    }
    // Get canonical customer id from authService. Do NOT fall back to mobile number.
    const customerId = authService.getCustomerId();
    if (!customerId) { alert('You must be logged in (missing CustomerID)'); return; }

    const payload = {
      V_CustomerID: String(customerId),
      V_PlateNumber: vehicleForm.plate,
      V_Make: vehicleForm.make,
      V_Model: vehicleForm.model,
      V_Year: vehicleForm.year,
      V_VIN: vehicleForm.vin
    };
    console.log('Adding vehicle payload', payload);

    try {
      setAddingVehicle(true);
      const res = await addVehicle(payload);
      // Backend may return the new ID in several shapes: ResultSet.VehicleID, Result.VehicleID, VehicalID (typo), VehicleID, etc.
      const vid = res?.ResultSet?.VehicleID || res?.Result?.VehicalID || res?.Result?.VehicleID || res?.VehicalID || res?.VehicleID || res?.ResultSet?.VehicalID || null;
      if (vid) {
        setCreatedVehicleId(vid);
        try { localStorage.setItem('lastCreatedVehicleId', String(vid)); } catch (e) {}
      }
      setStep(4);
    } catch (err) {
      console.error('Add vehicle failed', err);
      alert('Failed to add vehicle');
    } finally {
      setAddingVehicle(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (selectedServices.length === 0) { alert('Select at least one service'); return; }
    // allow fallback to last created vehicle id stored in localStorage (in case of page reload)
    const fallbackVehicleId = createdVehicleId || localStorage.getItem('lastCreatedVehicleId');
    if (!fallbackVehicleId) { alert('Please add your vehicle first'); return; }
    if (!selectedTimeslot) { alert('Please select a timeslot'); return; }
    // Prevent booking a timeslot that's already passed
    if (isSlotInPast(selectedTimeslot)) { alert('The selected timeslot has already passed. Please choose another timeslot.'); return; }

    // Build backend payload according to AddBookingsDetails shape
    const bookingPayload = {
      B_CustomerID: String(authService.getCustomerId ? authService.getCustomerId() : (authService.getCurrentUser()?.id || authService.getCurrentUser()?.userId || authService.getCurrentUser()?.customerID)),
      B_VehicleID: String(fallbackVehicleId),
      B_BookingDate: selectedDate,
      B_BookingStatus: 'Pending',
      B_timeslotID: String(selectedTimeslot.id),
  // backend expects service ids as an array under B_ServiceIDs (plural)
  B_ServiceIDs: selectedServices.map(s => (/^\d+$/.test(String(s.S_ServiceID)) ? Number(s.S_ServiceID) : s.S_ServiceID)),
    };
    console.log('Confirm booking payload', bookingPayload);

    try {
      // re-check remaining capacity to avoid race conditions
      await loadBookings();
      const usedNow = countBookingsForSlot(selectedTimeslot.id, selectedDate);
      const remainingNow = Math.max(0, (Number(selectedTimeslot.maxCustomers) || 0) - usedNow);
      if (remainingNow <= 0) { alert('Sorry this timeslot became fully booked. Please choose another timeslot.'); return; }

      setBooking(true);
      const res = await createBookingDetails(bookingPayload);
      if (res && res.StatusCode === 200) {
        alert('Booking created successfully');
        // clear selections and stored values
        setStep(1);
        setSelectedServices([]);
        setVehicleForm({ plate:'', make:'', model:'', year:'', vin:'' });
        setCreatedVehicleId(null);
        setSelectedTimeslot(null);
        setNotes('');
        try {
          localStorage.removeItem('selectedTimeslot');
          localStorage.removeItem('selectedTimeslotId');
          localStorage.removeItem('selectedServiceId');
        } catch (e) {}
        // refresh bookings so UI shows updated remaining counts
        loadBookings();
      } else {
        console.error('AddBookingsDetails returned error', res);
        alert('Booking failed: ' + (res?.Result || 'Unknown error'));
      }
    } catch (err) {
      console.error('Booking failed', err);
      alert('Booking failed');
    } finally {
      setBooking(false);
    }
  };

  const servicesTotal = selectedServices.reduce((acc, s) => acc + Number(s.S_BaseCharge || 0), 0);

  const filteredServices = services.filter(s => {
    const q = serviceSearch.trim().toLowerCase();
    if (!q) return true;
    return (String(s.S_ServiceName || '').toLowerCase().includes(q) || String(s.S_Description || '').toLowerCase().includes(q));
  });

  return (
    <div className="h-full p-4 md:p-6">
      <div className="w-full space-y-6">
        {/* Hero header to match Customer Dashboard style */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-2xl p-6 mb-6 shadow-md flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Book a Service</h1>
          <div className="text-sm opacity-90 mt-1">Choose a time and services for your vehicle</div>
          {authService.getCurrentUser && authService.getCurrentUser() && (
            <div className="mt-3 text-sm bg-white/10 inline-block rounded px-3 py-1">
              <strong className="mr-2">{(authService.getCurrentUser().userName || authService.getCurrentUser().UserName || authService.getCurrentUser().name)}</strong>
              <span className="opacity-90">{authService.getCurrentUser().Email || authService.getCurrentUser().email || ''}</span>
            </div>
          )}
        </div>
        <div>
          <button onClick={() => setStep(1)} className="bg-white text-blue-600 px-4 py-2 rounded shadow-sm hover:shadow">Start Over</button>
        </div>
      </div>

        {/* Bookings Section - Show by default */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Bookings</h2>
            <div className="flex space-x-2">
              <button 
                onClick={loadBookings}
                className="bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-200"
              >
                Refresh
              </button>
              <button 
                onClick={() => setShowBookings(!showBookings)}
                className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-sm hover:bg-gray-200"
              >
                {showBookings ? 'Hide' : 'Show'} Bookings
              </button>
            </div>
          </div>

          {showBookings && (
            <div className="border rounded-lg overflow-hidden">
              {loadingBookings ? (
                <div className="p-4 text-center">Loading bookings...</div>
              ) : filteredBookings.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No bookings found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Slot</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredBookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{booking.id}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{booking.customerName}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{booking.contact}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{formatDisplayDate(booking.date)}</div>
                            <div className="text-xs text-gray-500">{getRelativeTime(booking.date)}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900 max-w-xs truncate">{booking.services}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{booking.time || 'Not set'}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center">
          {[1,2,3,4].map(n => (
            <div key={n} className="text-center flex-1">
              <div className={`w-10 h-10 rounded-full mx-auto mb-2 ${step===n ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'} flex items-center justify-center`}>{n}</div>
              <div className={`text-sm ${step===n ? 'text-blue-600' : 'text-gray-400'}`}>{n===1 ? 'Date & Time' : n===2 ? 'Select Service' : n===3 ? 'Vehicle Details' : 'Confirm'}</div>
            </div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Select Date & Time</h2>
          <p className="text-gray-500 mb-4">Choose your preferred appointment date and time</p>

          <div className="bg-white rounded-lg p-6 border mb-4">
            <label className="block mb-2 text-sm">Select Date</label>
            <input type="date" value={selectedDate} onChange={(e)=>{ setSelectedDate(e.target.value); setSelectedTimeslot(null); }} className="border rounded-md px-3 py-2 w-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {timeslots.filter(t=>t.dateISO===selectedDate).length===0 && <div className="text-gray-500">No timeslots for selected date</div>}
            {timeslots.filter(t=>t.dateISO===selectedDate).map(slot => {
              const used = countBookingsForSlot(slot.id, selectedDate);
              const remaining = Math.max(0, (Number(slot.maxCustomers) || 0) - used);
              const isFull = remaining <= 0;
              const isExpired = isSlotInPast(slot);
              const disabled = isFull || isExpired;
              return (
                <div key={slot.id}
                  onClick={() => {
                    if (isExpired) { alert('This timeslot has already passed. Please choose another time.'); return; }
                    if (isFull) { alert('This timeslot is fully booked. Please choose another time.'); return; }
                    // set selection in state and persist to localStorage so selection survives refresh/navigation
                    setSelectedTimeslot(slot);
                    try { localStorage.setItem('selectedTimeslot', JSON.stringify(slot)); localStorage.setItem('selectedTimeslotId', String(slot.id)); } catch (e) {}
                  }}
                  className={`p-4 rounded-lg border ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-400' : 'cursor-pointer'} ${selectedTimeslot?.id===slot.id ? 'bg-blue-600 text-white' : 'bg-white hover:shadow-sm'}`}>
                  <div className="font-semibold">{slot.startDisplay} - {slot.endDisplay} {isFull && <span className="ml-2 text-sm font-medium">(Full)</span>}{isExpired && <span className="ml-2 text-sm font-medium">(Expired)</span>}</div>
                  <div className="text-sm text-gray-500 mt-1">Available: {remaining} / {slot.maxCustomers}</div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center mt-6">
            <button onClick={() => setStep(1)} className="px-4 py-2 border rounded" hidden>Back</button>
            <button onClick={() => { if(!selectedTimeslot){ alert('Select timeslot'); return;} setStep(2); }} className="bg-blue-600 text-white px-6 py-3 rounded-lg">Continue</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Select Services</h2>
          <p className="text-gray-500 mb-4">Choose one or more services for your vehicle</p>

          <div className="flex items-center mb-4">
            <input value={serviceSearch} onChange={(e)=>setServiceSearch(e.target.value)} placeholder="Search services..." className="border rounded-l-md px-3 py-2 w-1/3" />
            {/* <button onClick={()=>setShowExtraForm(prev=>!prev)} className="ml-3 bg-gray-100 px-3 py-2 rounded">{showExtraForm ? 'Cancel' : 'Add Extra Service'}</button> */}
            <div className="ml-auto text-sm text-gray-500">Selected: {selectedServices.length}</div>
          </div>

          {showExtraForm && (
            <div className="bg-white p-4 rounded-md border mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input placeholder="Service name" value={extraForm.name} onChange={(e)=>setExtraForm({...extraForm, name: e.target.value})} className="border rounded-md px-3 py-2" />
                <input placeholder="Price" value={extraForm.price} onChange={(e)=>setExtraForm({...extraForm, price: e.target.value})} className="border rounded-md px-3 py-2" />
                <input placeholder="Duration (mins)" value={extraForm.time} onChange={(e)=>setExtraForm({...extraForm, time: e.target.value})} className="border rounded-md px-3 py-2" />
              </div>
              <div className="mt-3 flex justify-end">
                <button onClick={handleAddExtraService} className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {loadingServices ? <div>Loading...</div> : filteredServices.map(s => (
              <div key={s.S_ServiceID} onClick={() => toggleService(s)} className={`p-4 rounded-lg border cursor-pointer ${selectedServices.find(x=>x.S_ServiceID===s.S_ServiceID) ? 'bg-blue-50 border-blue-300' : 'bg-white hover:shadow-sm'}`}>
                <h4 className="font-semibold text-lg">{s.S_ServiceName}</h4>
                <p className="text-sm text-gray-500 mt-1">{s.S_Description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-blue-600 font-bold">Rs.{s.S_BaseCharge}</div>
                  <div className="text-xs text-gray-400">{s.S_Time}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <label className="block text-sm mb-2">Remarks / Notes</label>
            <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} className="w-full border rounded-md px-3 py-2" placeholder="Any remarks for the technician or special requests" />
          </div>

          <div className="flex justify-between mt-6">
            <button onClick={() => setStep(1)} className="px-4 py-2 border rounded">Back</button>
            <button onClick={() => { if(selectedServices.length===0){ alert('Select at least one service'); return;} setStep(3); }} className="bg-blue-600 text-white px-6 py-3 rounded-lg">Continue</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Vehicle Details</h2>
          <p className="text-gray-500 mb-4">Choose an existing vehicle or add a new one</p>

          {!showAddNewVehicle && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Select Existing Vehicle</h3>
              {loadingCustomerVehicles ? <div>Loading...</div> : customerVehicles.length === 0 ? <div className="text-gray-500">No vehicles found</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customerVehicles.map(v => (
                    <div key={v.id} onClick={() => setSelectedExistingVehicle(v)} className={`p-4 rounded-lg border cursor-pointer ${selectedExistingVehicle?.id === v.id ? 'bg-blue-50 border-blue-300' : 'bg-white hover:shadow-sm'}`}>
                      <h4 className="font-semibold">{v.make} {v.model} ({v.year})</h4>
                      <div className="text-sm text-gray-500">Plate: {v.plate}</div>
                      <div className="text-sm text-gray-500">Color: {v.color}</div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <button onClick={() => setShowAddNewVehicle(true)} className="bg-blue-600 text-white px-4 py-2 rounded">Add New Vehicle</button>
              </div>
            </div>
          )}

          {showAddNewVehicle && (
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Add New Vehicle</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">License Plate *</label>
                  <input value={vehicleForm.plate} onChange={(e)=>setVehicleForm({...vehicleForm, plate: e.target.value})} className="border rounded-md px-3 py-2 w-full" />
                </div>
                <div>
                  <label className="block text-sm mb-1">Make *</label>
                  <input value={vehicleForm.make} onChange={(e)=>setVehicleForm({...vehicleForm, make: e.target.value})} className="border rounded-md px-3 py-2 w-full" />
                </div>
                <div>
                  <label className="block text-sm mb-1">Model *</label>
                  <input value={vehicleForm.model} onChange={(e)=>setVehicleForm({...vehicleForm, model: e.target.value})} className="border rounded-md px-3 py-2 w-full" />
                </div>
                <div>
                  <label className="block text-sm mb-1">Year *</label>
                  <input type="number" value={vehicleForm.year} onChange={(e)=>setVehicleForm({...vehicleForm, year: e.target.value})} className="border rounded-md px-3 py-2 w-full" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm mb-1">VIN (Optional)</label>
                  <input value={vehicleForm.vin} onChange={(e)=>setVehicleForm({...vehicleForm, vin: e.target.value})} className="border rounded-md px-3 py-2 w-full" />
                </div>
              </div>
              <div className="mt-6 flex justify-between">
                <button onClick={() => setShowAddNewVehicle(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button onClick={handleAddVehicle} disabled={addingVehicle} className="bg-blue-600 text-white px-6 py-2 rounded">
                  {addingVehicle ? 'Adding...' : 'Add Vehicle'}
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <button onClick={() => setStep(2)} className="px-4 py-2 border rounded">Back</button>
            <button onClick={() => { if(!selectedExistingVehicle && !showAddNewVehicle){ alert('Select or add a vehicle'); return;} setStep(4); }} className="bg-blue-600 text-white px-6 py-3 rounded-lg">Continue</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Confirm Booking</h2>
          <p className="text-gray-500 mb-4">Review your booking details before confirming</p>

          <div className="bg-white rounded-lg p-6 border mb-4">
            <h3 className="text-lg font-semibold mb-3">Appointment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Date</div>
                <div className="font-medium">{selectedDate}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Time Slot</div>
                <div className="font-medium">{selectedTimeslot?.startDisplay} - {selectedTimeslot?.endDisplay}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border mb-4">
            <h3 className="text-lg font-semibold mb-3">Selected Services</h3>
            <div className="space-y-3">
              {selectedServices.map(s => (
                <div key={s.S_ServiceID} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <div className="font-medium">{s.S_ServiceName}</div>
                    <div className="text-sm text-gray-500">{s.S_Description}</div>
                  </div>
                  <div className="text-blue-600 font-bold">Rs.{s.S_BaseCharge}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between">
              <div className="font-semibold">Total</div>
              <div className="text-blue-600 font-bold text-lg">Rs.{servicesTotal}</div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border mb-4">
            <h3 className="text-lg font-semibold mb-3">Vehicle Details</h3>
            {selectedExistingVehicle ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Make & Model</div>
                    <div className="font-medium">{selectedExistingVehicle.make} {selectedExistingVehicle.model}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Year</div>
                    <div className="font-medium">{selectedExistingVehicle.year}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">License Plate</div>
                    <div className="font-medium">{selectedExistingVehicle.plate}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Make & Model</div>
                    <div className="font-medium">{vehicleForm.make} {vehicleForm.model}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Year</div>
                    <div className="font-medium">{vehicleForm.year}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">License Plate</div>
                    <div className="font-medium">{vehicleForm.plate}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {notes && (
            <div className="bg-white rounded-lg p-6 border mb-4">
              <h3 className="text-lg font-semibold mb-3">Remarks</h3>
              <p className="text-gray-700">{notes}</p>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <button onClick={() => setStep(3)} className="px-4 py-2 border rounded">Back</button>
            <button onClick={handleConfirmBooking} disabled={booking} className="bg-blue-600 text-white px-6 py-3 rounded-lg">
              {booking ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default Booking;