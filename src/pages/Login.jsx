// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Phone, Shield, Wrench, Users, AlertCircle } from "lucide-react";
import { authService } from "../services/authServices";
import { USER_ROLES } from "../constants/authConstants";
import washImage from "../assets/wash.jpg";
//import washImage from "../assets/car-wash.jpg";

const Login = ({ onLoginSuccess }) => {
  const [detectedRole, setDetectedRole] = useState(null); // Role detected from backend
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    otp: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      // User is already logged in — only redirect if we can derive a valid role string
      // Support multiple shapes stored in localStorage (role, roleString, RoleID, etc.)
      const roleCandidates = [
        currentUser.role,
        currentUser.roleString,
        currentUser.roleID,
        currentUser.RoleID,
        currentUser.roleId,
        currentUser.Role
      ];

      let roleStr = null;
      for (const r of roleCandidates) {
        if (!r && r !== 0) continue;
        if (typeof r === 'string') {
          const lower = r.toLowerCase();
          if (['admin', 'technician', 'customer'].includes(lower)) {
            roleStr = lower;
            break;
          }
        }
        if (typeof r === 'number') {
          // Map numeric roles to string based on USER_ROLES constant
          if (r === USER_ROLES.ADMIN) roleStr = 'admin';
          else if (r === USER_ROLES.TECHNICIAN) roleStr = 'technician';
          else if (r === USER_ROLES.CUSTOMER) roleStr = 'customer';
          if (roleStr) break;
        }
      }

      if (roleStr) {
        navigate(`/${roleStr}`, { replace: true });
      } else {
        // Stored user has an unknown role shape — clear it so the login page can be used
        console.warn('Stored user has no valid role, clearing stored user to allow login.', currentUser);
        authService.logout();
      }
    }
  }, [navigate]);

  // All roles now use OTP-based login

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  // Clear form data when role changes
  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setFormData({
      username: "",
      phone: "",
      otp: "",
    });
    setError("");
    setOtpSent(false);
  };

  // --- Handle form submission ---
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted, otpSent:', otpSent, 'loading:', loading);
    
    if (otpSent && !loading) {
      handleOtpLogin(e);
    } else if (!otpSent) {
      console.log('OTP not sent yet');
    }
  };

  // Key changes in Login.jsx - handleSendOtp function

const handleSendOtp = async () => {
  if (!formData.phone.trim()) {
    setError("Please enter phone number");
    return;
  }
  
  try {
    setLoading(true);
    const response = await fetch(`http://localhost:60748/Login/Login?contact=${formData.phone}`);
    const data = await response.json();

    console.log('Backend response:', data);

    if (data.StatusCode === 200) {
      // Store values in localStorage
      if (data.CustomerID !== undefined && data.CustomerID !== null) {
        localStorage.setItem('CustomerID', data.CustomerID);
      }
      if (data.UserID) localStorage.setItem('UserID', data.UserID);
      if (data.UserName) localStorage.setItem('UserName', data.UserName);
      if (data.Email) localStorage.setItem('Email', data.Email);

      // CRITICAL FIX: Map RoleID correctly
      let roleString = 'customer'; // default
      const roleId = data.RoleID || data.roleId || data.Result?.RoleID;
      
      console.log('Raw RoleID from backend:', roleId);
      
      // Map numeric role to string - include supervisor (RoleID = 4)
      if (roleId === 1) {
        roleString = 'customer';
      } else if (roleId === 2) {
        roleString = 'admin';
      } else if (roleId === 3) {
        roleString = 'technician';
      } else if (roleId === 4) {
        roleString = 'supervisor';
      }

      console.log('Mapped roleString:', roleString);

      // Create normalized user object
      const normalizedUser = {
        UserName: data.UserName || formData.username || null,
        userName: data.UserName || formData.username || null,
        Email: data.Email || null,
        email: data.Email || null,
        CustomerID: data.CustomerID !== undefined ? data.CustomerID : null,
        customerID: data.CustomerID !== undefined ? data.CustomerID : null,
        UserID: data.UserID || null,
        userId: data.UserID || null,
        mobileNumber: formData.phone || null,
        RoleID: roleId,
        role: roleString,
        roleString: roleString
      };

      // Store normalized user
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      console.log('Normalized user stored:', normalizedUser);

      // Set detected role for navigation
      setDetectedRole(roleString);
      setOtpSent(true);
      alert(`OTP sent to ${formData.phone}. Detected role: ${roleString}`);
    } else {
      throw new Error(data.Result || "Failed to send OTP");
    }
  } catch (err) {
    console.error('Send OTP error:', err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

// FIXED handleOtpLogin function
const handleOtpLogin = async (e) => {
  e.preventDefault();
  console.log('OTP Login clicked, formData:', formData, 'detectedRole:', detectedRole);

  if (!formData.otp.trim()) {
    setError("Please enter OTP");
    return;
  }

  if (!detectedRole) {
    setError("Role not detected. Please try sending OTP again.");
    return;
  }

  setLoading(true);

  try {
    // Verify OTP with backend
    const verifyResponse = await fetch(
      `http://localhost:60748/Login/VerifyOtp?contact=${formData.phone}&otpCode=${formData.otp}`,
      { method: 'POST' }
    );
    const verifyData = await verifyResponse.json();
    
    console.log('Verify OTP response:', verifyData);

    if (verifyData.StatusCode === 200) {
      // Get the stored user object
      const storedUser = JSON.parse(localStorage.getItem('user'));
      
      console.log('Stored user:', storedUser);
      console.log('Detected role:', detectedRole);
      console.log('User role from storage:', storedUser?.role);

      // Call onLoginSuccess if provided
      if (onLoginSuccess) {
        onLoginSuccess(storedUser);
      }

      // Navigate based on detected role - include supervisor
      let targetRoute = '/customer'; // default
      
      if (detectedRole === 'admin') {
        targetRoute = '/admin';
      } else if (detectedRole === 'technician') {
        targetRoute = '/technician';
      } else if (detectedRole === 'supervisor') {
        targetRoute = '/supervisor';
      } else if (detectedRole === 'customer') {
        targetRoute = '/customer';
      }

      console.log('Navigating to:', targetRoute);
      navigate(targetRoute, { replace: true });
    } else {
      throw new Error(verifyData.Result || 'OTP verification failed');
    }
  } catch (err) {
    console.error('OTP Login error:', err);
    setError(err.message || 'Login failed. Please try again.');
  } finally {
    setLoading(false);
  }
};

// ==========================================
// UPDATED authServices.js - verifyOtp function
// ==========================================

verifyOtp: async (mobileNumber, otpCode) => {
  try {
    const resp = await fetch(
      `http://localhost:60748/Login/VerifyOtp?contact=${encodeURIComponent(mobileNumber)}&otpCode=${encodeURIComponent(otpCode)}`,
      { method: 'POST' }
    );
    const data = await resp.json();
    console.log('authService.verifyOtp response', data);

    if (!data || data.StatusCode !== 200) {
      throw new Error(data?.Result || data?.Message || 'OTP verification failed');
    }

    // Get RoleID from response
    const roleId = data.RoleID || data.roleId || data.Result?.RoleID;
    
    // FIXED: Map RoleID correctly
    let roleString = 'customer'; // default
    if (roleId === 1) {
      roleString = 'customer';
    } else if (roleId === 2) {
      roleString = 'admin';
    } else if (roleId === 3) {
      roleString = 'technician';
    }

    console.log('verifyOtp - RoleID:', roleId, 'Mapped to:', roleString);

    // Extract CustomerID
    const customerId = data.CustomerID !== undefined ? data.CustomerID : null;

    const userObj = {
      CustomerID: customerId,
      customerID: customerId,
      UserID: data.UserID || null,
      userId: data.UserID || null,
      UserName: data.UserName || mobileNumber,
      userName: data.UserName || mobileNumber,
      Email: data.Email || null,
      email: data.Email || null,
      RoleID: roleId,
      roleString: roleString,
      role: roleString,
      mobileNumber
    };

    console.log('authService.verifyOtp - userObj to persist:', userObj);
    
    // Persist user
    localStorage.setItem('user', JSON.stringify(userObj));

    return userObj;
  } catch (err) {
    console.error('authService.verifyOtp error', err);
    throw err;
  }
};

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Left side - Login Form */}
      <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl flex items-center justify-center px-4 sm:px-6 lg:px-8 lg:flex-shrink-0">
        <div className="w-full bg-white/95 backdrop-blur-sm shadow-2xl p-8 lg:p-10 rounded-2xl border border-white/20 relative overflow-hidden">
          {/* Decorative gradient overlay */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600"></div>
          
          {/* Logo/Icon area */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome to Premium Auto Care
            </h2>
            <p className="text-gray-600">Sign in to access your dashboard</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" /> {error}
            </div>
          )}

          {/* OTP Login for All Roles */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-gray-50 focus:bg-white"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-gray-50 focus:bg-white"
                  placeholder="Enter phone number"
                  required
                />
              </div>
            </div>
            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition duration-200 transform hover:scale-[1.02]"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Sending...
                  </span>
                ) : "Send OTP"}
              </button>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Enter OTP</label>
                  <div className="relative">
                    <input
                      name="otp"
                      value={formData.otp}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 bg-gray-50 focus:bg-white text-center text-lg font-semibold tracking-widest"
                      placeholder="Enter 6-digit OTP"
                      maxLength="6"
                      required
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={loading || !formData.otp.trim()}
                  onClick={(e) => {
                    console.log('Verify button clicked for detectedRole:', detectedRole);
                    console.log('Current formData:', formData);
                    console.log('OTP sent state:', otpSent);
                    console.log('Loading state:', loading);
                  }}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-green-400 disabled:to-emerald-400 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition duration-200 transform hover:scale-[1.02] disabled:transform-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </span>
                  ) : "Verify OTP & Login"}
                </button>
              </>
            )}
          </form>

          <div className="mt-8 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-sm text-gray-500">Don't have an account?</span>
              </div>
            </div>
            <div className="mt-6">
              <Link 
                to="/signup" 
                className="inline-flex items-center justify-center px-6 py-2 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl font-semibold transition duration-200 transform hover:scale-105"
              >
                Create a new account
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Image (Wider) */}
      <div className="hidden lg:flex flex-1 lg:flex-[1.5] xl:flex-[2] relative overflow-hidden">
        <img
          src={washImage}
          alt="Premium Auto Care Service"
          className="absolute inset-0 w-full h-full object-cover transform scale-105 hover:scale-110 transition duration-700"
        />
        {/* Gradient overlays for better visual appeal */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-purple-900/40 to-black/60"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        
        {/* Content overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white max-w-lg">
            {/* Decorative elements */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
                Premium
              </span>
              <br />
              <span className="text-white">Auto Care</span>
            </h1>
            
            <p className="text-2xl mb-4 font-light text-blue-100">
              Professional Vehicle Management
            </p>
            <p className="text-lg opacity-90 text-gray-200 mb-8">
              Quality service you can trust
            </p>
            
            {/* Feature highlights */}
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div className="flex items-center justify-center space-x-2 text-blue-200">
                <Shield className="w-5 h-5" />
                <span>Secure & Reliable</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-purple-200">
                <Wrench className="w-5 h-5" />
                <span>Expert Technicians</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-green-200">
                <Users className="w-5 h-5" />
                <span>Customer Focused</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative corner elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/10 to-transparent rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-white/10 to-transparent rounded-tr-full"></div>
      </div>
    </div>
  );
};

export default Login;
