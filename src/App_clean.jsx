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
import Bookings from './pages/Bookings';
import UserManagement from './pages/UserManagement';

function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error initializing auth:', error);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  const refreshUser = () => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  };

  // Listen for storage changes (useful for multiple tabs)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        refreshUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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
            user?.role === USER_ROLES.ADMIN ? (
              <DashboardLayout title="Admin Dashboard" onLogout={handleLogout}>
                <AdminDashboard />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Technician Route */}
        <Route
          path="/technician"
          element={
            user?.role === USER_ROLES.TECHNICIAN ? (
              <DashboardLayout title="Technician Dashboard" onLogout={handleLogout}>
                <TechnicianDashboard />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Customer Route */}
        <Route
          path="/customer"
          element={
            user?.role === USER_ROLES.CUSTOMER ? (
              <DashboardLayout title="Customer Dashboard" onLogout={handleLogout}>
                <CustomerDashboard />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        {/* supervisor Route */}
        <Route
          path="/supervisor"
          element={
            user?.role === USER_ROLES.SUPERVISOR ? (
              <DashboardLayout title="Supervisor Dashboard" onLogout={handleLogout}>
                <supervisorDashboard />
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

        {/* Customer Subroutes */}
        <Route
          path="/customer/appointments"
          element={
            user?.role === USER_ROLES.CUSTOMER ? (
              <DashboardLayout title="My Appointments" onLogout={handleLogout}>
                <Appointments />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/customer/bookings"
          element={
            user?.role === USER_ROLES.CUSTOMER ? (
              <DashboardLayout title="Book a Service" onLogout={handleLogout}>
                <Bookings />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/customer/vehicles"
          element={
            user?.role === USER_ROLES.CUSTOMER ? (
              <DashboardLayout title="My Vehicles" onLogout={handleLogout}>
                <CustomerVehicles />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;