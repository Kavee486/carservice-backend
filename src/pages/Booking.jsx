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

  const loadBookings = async () => {
    try {
      const res = await fetchAllBookings();
      const rs = res?.ResultSet || res?.Result || [];
      // keep as raw bookings array; we'll filter/count when needed
      setBookings(Array.isArray(rs) ? rs : []);
    } catch (err) {
      console.error('Failed to load bookings', err);
      setBookings([]);
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
            <button onClick={() => { if (selectedTimeslot==null){ alert('Date & Time is required'); setStep(1); return; } setStep(3); }} className="bg-blue-600 text-white px-6 py-3 rounded-lg">Continue</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Vehicle Details</h2>
          <p className="text-gray-500 mb-4">Please provide your vehicle information</p>

              <div>
                {loadingCustomerVehicles ? (
                  <div className="p-4">Loading your vehicles...</div>
                ) : (customerVehicles && customerVehicles.length > 0) ? (
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-2">Select one of your existing vehicles or add a new one</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      {customerVehicles.map(v => (
                        <div key={v.id} onClick={() => {
                          // pick this vehicle and continue to confirm
                          setSelectedExistingVehicle(v);
                          setCreatedVehicleId(v.id);
                          try { localStorage.setItem('lastCreatedVehicleId', String(v.id)); } catch (e) {}
                          // fill vehicle form for confirmation display
                          setVehicleForm({ plate: v.plate, make: v.make, model: v.model, year: v.year, vin: '' });
                          setStep(4);
                        }} className={`p-4 rounded-lg border cursor-pointer ${selectedExistingVehicle?.id===v.id ? 'bg-blue-600 text-white' : 'bg-white hover:shadow-sm'}`}>
                          <div className="font-semibold">{v.make} {v.model}</div>
                          <div className="text-sm text-gray-500">{v.year} • {v.plate}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mb-4">
                      <button onClick={() => setShowAddNewVehicle(true)} className="px-3 py-1 border rounded">Add New Vehicle</button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg p-6 border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input placeholder="Plate Number" value={vehicleForm.plate} onChange={(e)=>setVehicleForm({...vehicleForm, plate: e.target.value})} className="border rounded-md px-3 py-2" />
                      <input placeholder="Make" value={vehicleForm.make} onChange={(e)=>setVehicleForm({...vehicleForm, make: e.target.value})} className="border rounded-md px-3 py-2" />
                      <input placeholder="Model" value={vehicleForm.model} onChange={(e)=>setVehicleForm({...vehicleForm, model: e.target.value})} className="border rounded-md px-3 py-2" />
                      <input placeholder="Year" value={vehicleForm.year} onChange={(e)=>setVehicleForm({...vehicleForm, year: e.target.value})} className="border rounded-md px-3 py-2" />
                      <input placeholder="VIN (optional)" value={vehicleForm.vin} onChange={(e)=>setVehicleForm({...vehicleForm, vin: e.target.value})} className="border rounded-md px-3 py-2 md:col-span-2" />
                    </div>

                    <div className="flex justify-between items-center mt-6">
                      <button onClick={() => setStep(2)} className="px-4 py-2 border rounded">Back</button>
                      <button onClick={handleAddVehicle} className="bg-blue-600 text-white px-6 py-3 rounded-lg">{addingVehicle ? 'Adding...' : 'Continue to Confirm'}</button>
                    </div>
                  </div>
                )}
                {showAddNewVehicle && (
                  <div className="bg-white rounded-lg p-6 border mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input placeholder="Plate Number" value={vehicleForm.plate} onChange={(e)=>setVehicleForm({...vehicleForm, plate: e.target.value})} className="border rounded-md px-3 py-2" />
                      <input placeholder="Make" value={vehicleForm.make} onChange={(e)=>setVehicleForm({...vehicleForm, make: e.target.value})} className="border rounded-md px-3 py-2" />
                      <input placeholder="Model" value={vehicleForm.model} onChange={(e)=>setVehicleForm({...vehicleForm, model: e.target.value})} className="border rounded-md px-3 py-2" />
                      <input placeholder="Year" value={vehicleForm.year} onChange={(e)=>setVehicleForm({...vehicleForm, year: e.target.value})} className="border rounded-md px-3 py-2" />
                      <input placeholder="VIN (optional)" value={vehicleForm.vin} onChange={(e)=>setVehicleForm({...vehicleForm, vin: e.target.value})} className="border rounded-md px-3 py-2 md:col-span-2" />
                    </div>

                    <div className="flex justify-between items-center mt-6">
                      <button onClick={() => { setShowAddNewVehicle(false); setVehicleForm({ plate:'', make:'', model:'', year:'', vin:'' }); }} className="px-4 py-2 border rounded">Cancel</button>
                      <button onClick={handleAddVehicle} className="bg-blue-600 text-white px-6 py-3 rounded-lg">{addingVehicle ? 'Adding...' : 'Continue to Confirm'}</button>
                    </div>
                  </div>
                )}
              </div>
        </div>
      )}

      {step === 4 && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Confirm Booking</h2>

          <div className="bg-white rounded-lg p-6 border mb-4">
            <h3 className="font-semibold mb-2">Services</h3>
            {selectedServices.map(s => (
              <div key={s.S_ServiceID} className="flex justify-between py-2 border-b last:border-b-0">
                <div>
                  <div className="font-medium">{s.S_ServiceName}</div>
                  <div className="text-sm text-gray-500">{s.S_Time}</div>
                </div>
                <div className="font-semibold">Rs.{s.S_BaseCharge}</div>
              </div>
            ))}

            <div className="flex justify-between py-3 border-t mt-4">
              <div className="font-medium">Date & Time</div>
              <div>{selectedDate} • {selectedTimeslot?.startDisplay} - {selectedTimeslot?.endDisplay}</div>
            </div>

            <div className="flex justify-between py-3">
              <div className="font-medium">Vehicle</div>
              <div>{vehicleForm.make} {vehicleForm.model} ({vehicleForm.plate})</div>
            </div>

            <div className="flex justify-between py-3">
              <div className="font-medium">Notes</div>
              <div>{notes || '—'}</div>
            </div>

            <div className="flex justify-between py-3 border-t font-semibold">
              <div>Total</div>
              <div>Rs.{servicesTotal}</div>
            </div>

          </div>

          <div className="flex justify-between items-center">
            <button onClick={() => setStep(3)} className="px-4 py-2 border rounded">Back</button>
            <button onClick={handleConfirmBooking} className="bg-green-600 text-white px-6 py-3 rounded-lg">{booking ? 'Booking...' : 'Confirm Booking'}</button>
          </div>
        </div>
      )}

      </div>
    </div>
  );
};

export default Booking;
