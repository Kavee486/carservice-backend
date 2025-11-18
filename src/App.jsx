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
import SupervisorUserManagement from './pages/SupervisorUserManagement'; // Add this import
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
import Invoicing from './pages/Invoicing';
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

  // Helper function to check user role with multiple possible formats
  const checkUserRole = (requiredRole) => {
    if (!user) return false;

    const userRole = user.role;
    const roleString = String(userRole).toLowerCase();
    const requiredRoleString = String(requiredRole).toLowerCase();

    return roleString === requiredRoleString || 
           roleString === USER_ROLES[requiredRole]?.toLowerCase() ||
           user.roleString === requiredRoleString ||
           user.numericRole === getUserNumericRole(requiredRole);
  };

  const getUserNumericRole = (role) => {
    switch (String(role).toLowerCase()) {
      case 'admin': return 0;
      case 'customer': return 1;
      case 'technician': return 2;
      case 'supervisor': return 3;
      default: return -1;
    }
  };

  // Protected Route component
  const ProtectedRoute = ({ children, requiredRole, title }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }

    if (requiredRole && !checkUserRole(requiredRole)) {
      // Redirect to appropriate dashboard based on actual role
      const actualRole = user.role?.toLowerCase();
      switch (actualRole) {
        case 'admin':
          return <Navigate to="/admin" replace />;
        case 'technician':
          return <Navigate to="/technician" replace />;
        case 'customer':
          return <Navigate to="/customer" replace />;
        case 'supervisor':
          return <Navigate to="/supervisor" replace />;
        default:
          return <Navigate to="/login" replace />;
      }
    }

    return (
      <DashboardLayout title={title} onLogout={handleLogout}>
        {children}
      </DashboardLayout>
    );
  };

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
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route 
          path="/login" 
          element={
            user ? <Navigate to={`/${user.role?.toLowerCase()}`} replace /> : <Login onLoginSuccess={handleLoginSuccess} />
          } 
        />
        <Route 
          path="/signup" 
          element={user ? <Navigate to={`/${user.role?.toLowerCase()}`} replace /> : <Signup />} 
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="ADMIN" title="Admin Dashboard">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/customers"
          element={
            <ProtectedRoute requiredRole="ADMIN" title="Customers Management">
              <Customers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/parts"
          element={
            <ProtectedRoute requiredRole="ADMIN" title="Parts Inventory">
              <PartsInventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/services"
          element={
            <ProtectedRoute requiredRole="ADMIN" title="Services Management">
              <Services />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/appointments"
          element={
            <ProtectedRoute requiredRole="ADMIN" title="Appointments Management">
              <Appointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/timeslots"
          element={
            <ProtectedRoute requiredRole="ADMIN" title="Timeslot Management">
              <TimeslotManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/vehicles"
          element={
            <ProtectedRoute requiredRole="ADMIN" title="Vehicles Management">
              <Vehicles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/job-cards"
          element={
            <ProtectedRoute requiredRole="ADMIN" title="Job Cards Management">
              <JobCards />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/job-card-items"
          element={
            <ProtectedRoute requiredRole="ADMIN" title="Job Card Items Management">
              <JobCardItems />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/user-management"
          element={
            <ProtectedRoute requiredRole="ADMIN" title="User Management">
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute requiredRole="ADMIN" title="Categories Management">
              <Categories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/invoicing"
          element={
            <ProtectedRoute requiredRole="ADMIN" title="Invoicing Management">
              <Invoicing />
            </ProtectedRoute>
          }
        />

        {/* Technician Routes */}
        <Route
          path="/technician"
          element={
            <ProtectedRoute requiredRole="TECHNICIAN" title="Technician Dashboard">
              <TechnicianDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technician/schedule"
          element={
            <ProtectedRoute requiredRole="TECHNICIAN" title="My Schedule">
              <TechnicianSchedule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technician/appointments"
          element={
            <ProtectedRoute requiredRole="TECHNICIAN" title="My Appointments">
              <Appointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technician/job-cards"
          element={
            <ProtectedRoute requiredRole="TECHNICIAN" title="My Job Cards">
              <TechnicianJobCards />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technician/job-card-items"
          element={
            <ProtectedRoute requiredRole="TECHNICIAN" title="Job Card Items">
              <JobCardItems />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technician/parts"
          element={
            <ProtectedRoute requiredRole="TECHNICIAN" title="Parts Inventory">
              <TechnicianPartsInventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technician/vehicles"
          element={
            <ProtectedRoute requiredRole="TECHNICIAN" title="Vehicles Management">
              <TechnicianVehicle />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technician/categories"
          element={
            <ProtectedRoute requiredRole="TECHNICIAN" title="Service Categories">
              <Categories />
            </ProtectedRoute>
          }
        />

        {/* Customer Routes */}
        <Route
          path="/customer"
          element={
            <ProtectedRoute requiredRole="CUSTOMER" title="Customer Dashboard">
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/bookings"
          element={
            <ProtectedRoute requiredRole="CUSTOMER" title="Book a Service">
              <Booking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/vehicles"
          element={
            <ProtectedRoute requiredRole="CUSTOMER" title="My Vehicles">
              <CustomerVehicles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/categories"
          element={
            <ProtectedRoute requiredRole="CUSTOMER" title="Service Categories">
              <Categories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/previous-services"
          element={
            <ProtectedRoute requiredRole="CUSTOMER" title="Previous Services">
              <PreviousServices />
            </ProtectedRoute>
          }
        />

        {/* Supervisor Routes */}
        <Route
          path="/supervisor"
          element={
            <ProtectedRoute requiredRole="SUPERVISOR" title="Supervisor Dashboard">
              <SupervisorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/job-cards"
          element={
            <ProtectedRoute requiredRole="SUPERVISOR" title="Supervisor Job Cards">
              <SupervisorJobCards />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/user-management"
          element={
            <ProtectedRoute requiredRole="SUPERVISOR" title="User Management">
              <SupervisorUserManagement />
            </ProtectedRoute>
          }
        />

        {/* Common Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute title="My Profile">
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;