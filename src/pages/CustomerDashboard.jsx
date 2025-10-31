import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dataService from '../services/dataService';
import { authService } from '../services/authServices';
import { addVehicle, getVehiclesByCustomerID } from '../services/vehicleServices';
import { fetchBookingsByCustomerID } from '../services/adminServices';
import { Car, Calendar, Clock, FileText, MapPin, Plus, Phone, Users, Wrench, DollarSign, AlertCircle, TrendingUp } from 'lucide-react';

const CustomerDashboard = () => {
  const [vehicles, setVehicles] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({ plate: '', make: '', model: '', year: '', vin: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load current user details (name, email, phone) from authService or top-level localStorage keys
        try {
          const cu = authService.getCurrentUser && authService.getCurrentUser();
          const rawUser = (() => { try { return JSON.parse(localStorage.getItem('user')||'null'); } catch(e){return null;} })();
          const topUserName = localStorage.getItem('UserName') || localStorage.getItem('userName') || localStorage.getItem('username');
          const topEmail = localStorage.getItem('Email') || localStorage.getItem('email');

          let name = (cu && (cu.UserName || cu.userName || cu.username || cu.name))
            || (rawUser && (rawUser.UserName || rawUser.userName || rawUser.username || rawUser.name))
            || topUserName || '';

          const email = (cu && (cu.Email || cu.email))
            || (rawUser && (rawUser.Email || rawUser.email))
            || topEmail || '';

          const phone = (cu && (cu.mobileNumber || cu.mobile || cu.phone))
            || (rawUser && (rawUser.mobileNumber || rawUser.mobile || rawUser.phone))
            || localStorage.getItem('mobileNumber') || localStorage.getItem('Phone') || '';

          // If name looks like a phone number, try to infer from email
          const looksLikePhone = (s) => {
            if (!s) return false;
            const digits = String(s).replace(/\D/g, '');
            return digits.length >= 6;
          };
          if (!name || looksLikePhone(name)) {
            const emailCandidate = email || (rawUser && (rawUser.Email || rawUser.email)) || localStorage.getItem('Email');
            if (emailCandidate && emailCandidate.includes('@')) {
              const inferred = emailCandidate.split('@')[0];
              name = inferred.charAt(0).toUpperCase() + inferred.slice(1);
            }
          }

          if (name || email || phone) setUser({ name, email, phone });
        } catch (err) {
          console.warn('Could not read current user from authService', err);
        }
        // Use canonical CustomerID from authService
        const customerId = authService.getCustomerId();
        let vehiclesData = [];
        if (customerId) {
          const resp = await getVehiclesByCustomerID(customerId);
          // resp may have a Result or ResultSet depending on API; try to extract vehicles array
          vehiclesData = resp?.Result || resp?.ResultSet || resp?.Data || resp || [];
        } else {
          console.warn('No customerId found in localStorage; falling back to mock vehicles');
          vehiclesData = await dataService.getVehicles();
        }

        // Normalize vehicle objects to shape the UI expects
        const normalized = (Array.isArray(vehiclesData) ? vehiclesData : []).map(v => ({
          id: v.VehicleID || v.VehicalID || v.V_VehicleID || v.VehicalID || v.id || v.VehicalID || v.VehicleID || v.V_ID || v.ID || v.V_TimeslotID || v.T_TimeslotID,
          make: v.V_Make || v.Make || v.make || '',
          model: v.V_Model || v.Model || v.model || '',
          year: v.V_Year || v.Year || v.year || '',
          plate: v.V_PlateNumber || v.PlateNumber || v.plate || '',
          color: v.V_Color || v.color || v.Color || '',
          mileage: v.V_Mileage || v.mileage || v.Mileage || '',
          nextService: v.V_NextService || v.nextService || '',
          image: v.V_Image || v.image || 'https://via.placeholder.com/300x200?text=Vehicle'
        }));

        // Fetch bookings for this customer using backend filtered endpoint
        let appointmentsData = [];
        try {
          if (customerId) {
            const res = await fetchBookingsByCustomerID(customerId);
            const list = res?.ResultSet || res?.Result || res?.Data || res || [];

            // helpers to parse/format
            const parseBookingDateISO = (raw) => {
              if (!raw) return null;
              const d = new Date(raw);
              if (!isNaN(d)) {
                // Use local date components instead of toISOString() which converts to UTC
                // and can shift the day depending on the user's timezone.
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                return `${yyyy}-${mm}-${dd}`;
              }
              const m = String(raw).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
              if (m) {
                const mm = String(m[1]).padStart(2,'0');
                const dd = String(m[2]).padStart(2,'0');
                return `${m[3]}-${mm}-${dd}`;
              }
              return null;
            };

            const formatTimeFrom = (t) => {
              if (!t) return '';
              const s = String(t).trim();
              const parts = s.split(':');
              let hh = parseInt(parts[0]||'0',10);
              const mm = parts[1] || '00';
              const ampm = hh >= 12 ? 'PM' : 'AM';
              hh = hh % 12 || 12;
              return `${String(hh).padStart(2,'0')}:${mm} ${ampm}`;
            };

            appointmentsData = (Array.isArray(list) ? list : []).map(b => {
              const id = b.B_BookingID || b.BookingID || b.id || b.ID || '';
              const dateRaw = b.B_BookingDate || b.B_PreferredDate || b.BookingDate || b.Date || '';
              const date = parseBookingDateISO(dateRaw) || String(dateRaw).slice(0,10) || '';
              const time = formatTimeFrom(b.B_StartTime || b.B_Start || b.StartTime || b.Time || '');
              const service = b.B_ServiceName || b.S_ServiceName || (b.Services && Array.isArray(b.Services) ? b.Services.map(s=>s.S_ServiceName||s.name).join(', ') : b.ServiceName) || b.Service || '';
              const vehicle = b.Vehicle || (b.V_Make || '') + ' ' + (b.V_Model || '') || b.B_Vehicle || '';
              const technician = b.TechnicianName || b.TechName || b.AssignedTo || '';
              const status = b.B_BookingStatus || b.Status || '';
              return { id, date, time, service, vehicle, technician, status };
            }).filter(a => a); // ensure array
          } else {
            // fallback to mock data service
            appointmentsData = await dataService.getAppointments();
          }
        } catch (err) {
          console.error('Failed to fetch bookings for customer dashboard:', err);
          appointmentsData = await dataService.getAppointments();
        }

        setVehicles(normalized);
        setAppointments(appointmentsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const serviceHistory = [
    {
      id: 1,
      date: '2024-12-15',
      service: 'Oil Change',
      vehicle: '2020 Honda Accord',
      cost: 'Rs 3,450',
      status: 'Completed'
    },
    {
      id: 2,
      date: '2024-11-28',
      service: 'Tire Rotation',
      vehicle: '2018 Toyota Camry',
      cost: 'Rs 2,250',
      status: 'Completed'
    },
    {
      id: 3,
      date: '2024-10-10',
      service: 'Brake Inspection',
      vehicle: '2020 Honda Accord',
      cost: 'Rs 6,750',
      status: 'Completed'
    }
  ];

  // Stats cards data with new color scheme
  const stats = [
    {
      title: 'Total Vehicles',
      value: vehicles.length.toString(),
      icon: Car,
      color: 'text-blue-600'
    },
    {
      title: 'Upcoming Appointments',
      value: appointments.length.toString(),
      icon: Calendar,
      color: 'text-green-600'
    },
    // {
    //   title: 'Pending Services',
    //   value: '2',
    //   icon: Wrench,
    //   color: 'text-orange-600'
    // },
    // {
    //   title: 'Total Spent',
    //   value: 'Rs 12,450',
    //   icon: DollarSign,
    //   color: 'text-purple-600'
    // }
  ];

  // Function to handle navigation to bookings
  const handleBookAppointment = () => {
    navigate('/customer/bookings');
  };

  // Function to handle navigation to landing page map section
  const handleFindLocation = () => {
    // Navigate to landing page with hash for map section
    window.location.href = '/#map-section';
  };

  // Function to handle navigation to dashboard contact section
  const handleCallSupport = () => {
    // Navigate to landing page with hash for contact section
    window.location.href = '/#contact';
  };

  const StatCard = ({ title, value, icon, color, progress }) => {
    const IconComponent = icon;
    return (
      <div className="stat-card bg-white rounded-2xl shadow-lg border-0 p-4 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-gray-500 mb-1">{title}</div>
            <div className="text-xl font-bold text-gray-900">{value}</div>
            {progress !== undefined && (
              <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
                <div
                  className={`h-1 rounded-full ${color}`}
                  style={{ width: `${Math.round((parseInt(value) / Math.max(vehicles.length, 1)) * 100)}%` }}
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-600 text-base font-medium">Loading dashboard...</p>
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
              <h1 className="text-2xl font-bold text-white mb-2">Customer Dashboard</h1>
              <p className="text-blue-100">Welcome back! Here's your vehicle service overview</p>
              {user && (
                <div className="mt-3 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-10 rounded-full flex items-center justify-center text-white font-semibold">{user.name ? String(user.name).charAt(0).toUpperCase() : '?'}</div>
                  <div>
                    <div className="text-sm text-blue-100 font-medium">{user.name || 'Guest User'}</div>
                    <div className="text-xs text-blue-100 opacity-90">{user.email || 'Not provided'} {user.phone ? `· ${user.phone}` : ''}</div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBookAppointment}
                className="bg-white text-blue-600 rounded-lg hover:bg-blue-50 h-10 px-4 font-medium flex items-center border-0"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Book Appointment
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              progress
            />
          ))}
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Vehicles */}
          <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">My Vehicles</h3>
                <Car className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="p-6 space-y-4">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={vehicle.image} 
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                      className="w-16 h-12 object-cover rounded-lg"
                    />
                    <div>
                      <p className="text-base font-medium text-gray-900">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                      <p className="text-sm text-gray-500">{vehicle.color} • {vehicle.mileage} miles</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Next Service</p>
                    <p className="text-base font-medium text-blue-600">{vehicle.nextService}</p>
                  </div>
                </div>
              ))}
              <button onClick={()=>setShowAddModal(true)} className="w-full mt-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors text-base font-medium flex items-center justify-center border-0">
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle
              </button>
              {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="w-full max-w-md bg-white rounded-xl p-6 shadow-lg">
                    <h3 className="text-lg font-semibold mb-4">Add Vehicle</h3>
                    {formError && <div className="mb-3 text-sm text-red-600">{formError}</div>}
                    <div className="space-y-3">
                      <input name="plate" value={vehicleForm.plate} onChange={(e)=>setVehicleForm({...vehicleForm, plate: e.target.value})} placeholder="Plate Number" className="w-full border rounded-md px-3 py-2" />
                      <input name="make" value={vehicleForm.make} onChange={(e)=>setVehicleForm({...vehicleForm, make: e.target.value})} placeholder="Make" className="w-full border rounded-md px-3 py-2" />
                      <input name="model" value={vehicleForm.model} onChange={(e)=>setVehicleForm({...vehicleForm, model: e.target.value})} placeholder="Model" className="w-full border rounded-md px-3 py-2" />
                      <input name="year" value={vehicleForm.year} onChange={(e)=>setVehicleForm({...vehicleForm, year: e.target.value})} placeholder="Year" className="w-full border rounded-md px-3 py-2" />
                      <input name="vin" value={vehicleForm.vin} onChange={(e)=>setVehicleForm({...vehicleForm, vin: e.target.value})} placeholder="VIN" className="w-full border rounded-md px-3 py-2" />
                    </div>
                    <div className="mt-4 flex items-center justify-end space-x-3">
                      <button onClick={()=>{ setShowAddModal(false); setFormError(''); }} className="px-4 py-2 rounded-md border">Cancel</button>
                      <button onClick={async ()=>{
                        // Submit handler inline to keep patch small
                        setFormError('');
                        const { plate, make, model, year, vin } = vehicleForm;
                        if(!plate.trim() || !make.trim() || !model.trim() || !year.toString().trim()){
                          setFormError('Please fill required fields: Plate, Make, Model, Year');
                          return;
                        }
                        // Use canonical CustomerID from authService. Do not use mobile number as ID.
                        const customerId = authService.getCustomerId();
                        if(!customerId){
                          setFormError('Unable to determine logged-in CustomerID. Please ensure you are logged in.');
                          return;
                        }
                        const payload = {
                          V_CustomerID: String(customerId),
                          V_PlateNumber: plate,
                          V_Make: make,
                          V_Model: model,
                          V_Year: year,
                          V_VIN: vin
                        };
                        console.log('CustomerDashboard add vehicle payload', payload);
                          try{
                            setSubmitting(true);
                            const res = await addVehicle(payload);
                            // On success, re-fetch vehicles list for this customer to show relevant vehicles
                            const customerIdAfter = authService.getCustomerId();
                            if (customerIdAfter) {
                              const getRes = await getVehiclesByCustomerID(customerIdAfter);
                              const vehiclesData = getRes?.Result || getRes?.ResultSet || getRes?.Data || getRes || [];
                              const normalized = (Array.isArray(vehiclesData) ? vehiclesData : []).map(v => ({
                                id: v.VehicleID || v.VehicalID || v.V_VehicleID || v.VehicalID || v.id || v.VehicalID || v.VehicleID || v.V_ID || v.ID || v.V_TimeslotID || v.T_TimeslotID,
                                make: v.V_Make || v.Make || v.make || '',
                                model: v.V_Model || v.Model || v.model || '',
                                year: v.V_Year || v.Year || v.year || '',
                                plate: v.V_PlateNumber || v.PlateNumber || v.plate || '',
                                color: v.V_Color || v.color || v.Color || '',
                                mileage: v.V_Mileage || v.mileage || v.Mileage || '',
                                nextService: v.V_NextService || v.nextService || '',
                                image: v.V_Image || v.image || 'https://via.placeholder.com/300x200?text=Vehicle'
                              }));
                              setVehicles(normalized);
                            }
                            setShowAddModal(false);
                            setVehicleForm({ plate: '', make: '', model: '', year: '', vin: '' });
                          }catch(err){
                            console.error('Add vehicle error:', err);
                            setFormError(err?.message || 'Failed to add vehicle');
                          }finally{
                            setSubmitting(false);
                          }
                      }} className="px-4 py-2 rounded-md bg-blue-600 text-white">{submitting ? 'Adding...' : 'Add Vehicle'}</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h3>
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="p-6 space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200">
                  <div>
                    <p className="text-base font-medium text-gray-900">{appointment.service}</p>
                    <p className="text-sm text-gray-500">{appointment.vehicle}</p>
                    <p className="text-sm text-gray-500">Technician: {appointment.technician}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{appointment.date}</p>
                    <p className="text-sm text-gray-500">{appointment.time}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      appointment.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-200 text-gray-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
              <button 
                className="w-full mt-2 bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 rounded-lg hover:from-green-600 hover:to-green-700 transition-colors text-base font-medium border-0"
                onClick={handleBookAppointment}
              >
                Schedule New Appointment
              </button>
            </div>
          </div>
        </div>

        {/* Service History
        <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Recent Service History</h3>
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Service</th>
                    <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Vehicle</th>
                    <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Date</th>
                    <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Cost</th>
                    <th className="text-left py-4 px-4 text-gray-700 font-medium text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceHistory.map((service) => (
                    <tr key={service.id} className="border-b border-gray-200 hover:bg-blue-50 transition-colors duration-200">
                      <td className="py-4 px-4 text-base font-medium text-gray-900">{service.service}</td>
                      <td className="py-4 px-4 text-base text-gray-700">{service.vehicle}</td>
                      <td className="py-4 px-4 text-base text-gray-700">{service.date}</td>
                      <td className="py-4 px-4 text-base font-semibold text-blue-600">{service.cost}</td>
                      <td className="py-4 px-4">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          {service.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div> */}

        {/* Quick Actions */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center text-base font-medium border-0 shadow-lg hover:shadow-xl"
            onClick={handleBookAppointment}
          >
            <Calendar className="h-5 w-5 mr-3" />
            Book Appointment
          </button>
          <button 
            className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-4 rounded-2xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 flex items-center justify-center text-base font-medium border-0 shadow-lg hover:shadow-xl"
            onClick={handleFindLocation}
          >
            <MapPin className="h-5 w-5 mr-3" />
            Find Location
          </button>
          <button 
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-4 rounded-2xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center text-base font-medium border-0 shadow-lg hover:shadow-xl"
            onClick={handleCallSupport}
          >
            <Phone className="h-5 w-5 mr-3" />
            Call Support
          </button>
        </div> */}
        
        <style jsx>{`
          .stat-card {
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          }
        `}</style>
      </div>
    </div>
  );
};

export default CustomerDashboard;