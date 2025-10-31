import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/authServices';
import { USER_ROLES } from './constants/authConstants';

// Components
import LoadingSpinner from './components/LoadingSpinner';
import DashboardLayout from './components/DashboardLayout';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import TechnicianDashboard from './pages/TechnicianDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import SupervisorDashboard from './pages/SupervisorDashboard';
import SupervisorJobCards from './pages/SupervisorJobCards';
import Profile from './pages/Profile';
import PartsInventory from './pages/PartsInventory';
import Services from './pages/Services';
import Appointments from './pages/Appointments';
import TechnicianSchedule from './pages/TechnicianSchedule';
import Customers from './pages/Customers';
import JobCards from './pages/JobCards';
import JobCardItems from './pages/JobCardItems';
import Vehicles from './pages/Vehicles';
import CustomerVehicles from './pages/CustomerVehicles';
import Booking from './pages/Booking';
import UserManagement from './pages/UserManagement';
import TimeslotManagement from './pages/TimeslotManagement';
import CustomersManagement from './pages/CustomersManagement';
import Categories from './pages/Categories';
import Invoicing from './pages/Invoicing'; // Add this import
import PreviousServices from './pages/PreviousServices';

function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const currentUser = authService.getCurrentUser();
        console.log('App initialization - currentUser:', currentUser);
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        authService.logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const handleLoginSuccess = (userData) => {
    console.log('handleLoginSuccess called with:', userData);
    console.log('Setting user state to:', userData);
    setUser(userData);
    
    setTimeout(() => {
      const savedUser = authService.getCurrentUser();
      console.log('Verified saved user:', savedUser);
      if (!savedUser) {
        console.error('User was not properly saved!');
      }
    }, 100);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  const refreshUser = () => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  };

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        console.log('Storage change detected, refreshing user');
        refreshUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentStoredUser = authService.getCurrentUser();
      if (currentStoredUser && !user) {
        console.log('User state out of sync, restoring from storage:', currentStoredUser);
        setUser(currentStoredUser);
      } else if (!currentStoredUser && user) {
        console.log('User removed from storage, clearing state');
        setUser(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/signup" element={<Signup />} />

        {/* Admin Route */}
        <Route
          path="/admin"
          element={
            (() => {
              console.log('Admin route - user:', user, 'user.role:', user?.role, 'USER_ROLES.ADMIN:', USER_ROLES.ADMIN);
              return user?.role === USER_ROLES.ADMIN ? (
                <DashboardLayout title="Admin Dashboard" onLogout={handleLogout}>
                  <AdminDashboard />
                </DashboardLayout>
              ) : (
                <Navigate to="/login" replace />
              );
            })()
          }
        />

        {/* Technician Route */}
        <Route
          path="/technician"
          element={
            (() => {
              console.log('Technician route - user:', user, 'user.role:', user?.role, 'USER_ROLES.TECHNICIAN:', USER_ROLES.TECHNICIAN);
              return user?.role === USER_ROLES.TECHNICIAN ? (
                <DashboardLayout title="Technician Dashboard" onLogout={handleLogout}>
                  <TechnicianDashboard />
                </DashboardLayout>
              ) : (
                <Navigate to="/login" replace />
              );
            })()
          }
        />

        {/* Customer Route */}
        <Route
          path="/customer"
          element={
            (() => {
              console.log('Customer route - user:', user, 'user.role:', user?.role, 'USER_ROLES.CUSTOMER:', USER_ROLES.CUSTOMER);
              console.log('Role comparison:', user?.role, '===', USER_ROLES.CUSTOMER, ':', user?.role === USER_ROLES.CUSTOMER);
              
              const isCustomer = user && (user.role === USER_ROLES.CUSTOMER || user.role === 'customer' || user.role === 1);
              console.log('isCustomer:', isCustomer);
              
              return isCustomer ? (
                <DashboardLayout title="Customer Dashboard" onLogout={handleLogout}>
                  <CustomerDashboard />
                </DashboardLayout>
              ) : (
                <Navigate to="/login" replace />
              );
            })()
          }
        />

        {/* Supervisor Route */}
        <Route
          path="/supervisor"
          element={
            (() => {
              console.log('Supervisor route - user:', user, 'user.role:', user?.role, 'USER_ROLES.SUPERVISOR:', USER_ROLES.SUPERVISOR);
              return user?.role === USER_ROLES.SUPERVISOR ? (
                <DashboardLayout title="Supervisor Dashboard" onLogout={handleLogout}>
                  <SupervisorDashboard />
                </DashboardLayout>
              ) : (
                <Navigate to="/login" replace />
              );
            })()
          }
        />
        <Route
          path="/supervisor/job-cards"
          element={
            user?.role === USER_ROLES.SUPERVISOR ? (
              <DashboardLayout title="Supervisor Job Cards" onLogout={handleLogout}>
                <SupervisorJobCards />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Profile Route */}
        <Route
          path="/profile"
          element={
            user ? (
              <DashboardLayout title="My Profile" onLogout={handleLogout}>
                <Profile />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Admin Subroutes */}
        <Route
          path="/admin/customers"
          element={
            user?.role === USER_ROLES.ADMIN ? (
              <DashboardLayout title="Customers Management" onLogout={handleLogout}>
                <Customers />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin/parts"
          element={
            user?.role === USER_ROLES.ADMIN ? (
              <DashboardLayout title="Parts Inventory" onLogout={handleLogout}>
                <PartsInventory />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin/services"
          element={
            user?.role === USER_ROLES.ADMIN ? (
              <DashboardLayout title="Services Management" onLogout={handleLogout}>
                <Services />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin/appointments"
          element={
            user?.role === USER_ROLES.ADMIN ? (
              <DashboardLayout title="Appointments Management" onLogout={handleLogout}>
                <Appointments />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin/timeslots"
          element={
            user?.role === USER_ROLES.ADMIN ? (
              <DashboardLayout title="Timeslot Management" onLogout={handleLogout}>
                <TimeslotManagement />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin/vehicles"
          element={
            user?.role === USER_ROLES.ADMIN ? (
              <DashboardLayout title="Vehicles Management" onLogout={handleLogout}>
                <Vehicles />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin/job-cards"
          element={
            user?.role === USER_ROLES.ADMIN ? (
              <DashboardLayout title="Job Cards Management" onLogout={handleLogout}>
                <JobCards />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin/job-card-items"
          element={
            user?.role === USER_ROLES.ADMIN ? (
              <DashboardLayout title="Job Card Items Management" onLogout={handleLogout}>
                <JobCardItems />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin/user-management"
          element={
            user?.role === USER_ROLES.ADMIN ? (
              <DashboardLayout title="User Management" onLogout={handleLogout}>
                <UserManagement />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin/categories"
          element={
            user?.role === USER_ROLES.ADMIN ? (
              <DashboardLayout title="Categories Management" onLogout={handleLogout}>
                <Categories />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        {/* Add Invoicing Route */}
        <Route
          path="/admin/invoicing"
          element={
            user?.role === USER_ROLES.ADMIN ? (
              <DashboardLayout title="Invoicing Management" onLogout={handleLogout}>
                <Invoicing />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Technician Subroutes */}
        <Route
          path="/technician/schedule"
          element={
            user?.role === USER_ROLES.TECHNICIAN ? (
              <DashboardLayout title="My Schedule" onLogout={handleLogout}>
                <TechnicianSchedule />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/technician/appointments"
          element={
            user?.role === USER_ROLES.TECHNICIAN ? (
              <DashboardLayout title="My Appointments" onLogout={handleLogout}>
                <Appointments />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/technician/job-cards"
          element={
            user?.role === USER_ROLES.TECHNICIAN ? (
              <DashboardLayout title="My Job Cards" onLogout={handleLogout}>
                <JobCards />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/technician/job-card-items"
          element={
            user?.role === USER_ROLES.TECHNICIAN ? (
              <DashboardLayout title="Job Card Items" onLogout={handleLogout}>
                <JobCardItems />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/technician/parts"
          element={
            user?.role === USER_ROLES.TECHNICIAN ? (
              <DashboardLayout title="Parts Inventory" onLogout={handleLogout}>
                <PartsInventory />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/technician/vehicles"
          element={
            user?.role === USER_ROLES.TECHNICIAN ? (
              <DashboardLayout title="Vehicles Management" onLogout={handleLogout}>
                <Vehicles />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/technician/categories"
          element={
            user?.role === USER_ROLES.TECHNICIAN ? (
              <DashboardLayout title="Service Categories" onLogout={handleLogout}>
                <Categories />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Customer Subroutes */}
        <Route
          path="/customer/bookings"
          element={
            (() => {
              console.log('Customer bookings route - user:', user, 'user.role:', user?.role);
              const isCustomer = user && (
                user.role === USER_ROLES.CUSTOMER || 
                user.role === 'customer' || 
                user.role === 1 ||
                user.roleString === 'customer' ||
                user.numericRole === 1
              );
              console.log('Bookings - isCustomer:', isCustomer);
              
              return isCustomer ? (
                <DashboardLayout title="Book a Service" onLogout={handleLogout}>
                  <Booking />
                </DashboardLayout>
              ) : (
                <Navigate to="/login" replace />
              );
            })()
          }
        />
        <Route
          path="/customer/vehicles"
          element={
            (() => {
              console.log('Customer vehicles route - user:', user, 'user.role:', user?.role);
              const isCustomer = user && (
                user.role === USER_ROLES.CUSTOMER || 
                user.role === 'customer' || 
                user.role === 1 ||
                user.roleString === 'customer' ||
                user.numericRole === 1
              );
              console.log('Vehicles - isCustomer:', isCustomer);
              
              return isCustomer ? (
                <DashboardLayout title="My Vehicles" onLogout={handleLogout}>
                  <CustomerVehicles />
                </DashboardLayout>
              ) : (
                <Navigate to="/login" replace />
              );
            })()
          }
        />
        <Route
          path="/customer/categories"
          element={
            (() => {
              console.log('Customer categories route - user:', user, 'user.role:', user?.role);
              const isCustomer = user && (
                user.role === USER_ROLES.CUSTOMER || 
                user.role === 'customer' || 
                user.role === 1 ||
                user.roleString === 'customer' ||
                user.numericRole === 1
              );
              console.log('Categories - isCustomer:', isCustomer);
              
              return isCustomer ? (
                <DashboardLayout title="Service Categories" onLogout={handleLogout}>
                  <Categories />
                </DashboardLayout>
              ) : (
                <Navigate to="/login" replace />
              );
            })()
          }
        />

        {/* Customer Previous Services */}
        <Route
          path="/customer/previous-services"
          element={
            (() => {
              const isCustomer = user && (
                user.role === USER_ROLES.CUSTOMER || 
                user.role === 'customer' || 
                user.role === 1 ||
                user.roleString === 'customer' ||
                user.numericRole === 1
              );
              return isCustomer ? (
                <DashboardLayout title="Previous Services" onLogout={handleLogout}>
                  <PreviousServices />
                </DashboardLayout>
              ) : (
                <Navigate to="/login" replace />
              );
            })()
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;