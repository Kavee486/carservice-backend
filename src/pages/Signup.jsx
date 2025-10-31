
// src/pages/Signup.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, X, CheckCircle, XCircle, User, Mail, Phone, Shield } from 'lucide-react';
import { USER_ROLES, ROUTES, COMPANY_INFO } from '../constants/userConstants';
import { useDispatch, useSelector } from 'react-redux';
import { signupUserAction, resetSignupAction } from '../actions/userActions';
import carVideo from '../assets/Car.mp4';

// Add custom styles for animations
const customStyles = `
  @keyframes slide-in {
    0% { transform: translateX(100%); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
  }
  
  .animate-slide-in {
    animation: slide-in 0.3s ease-out;
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = customStyles;
  document.head.appendChild(style);
}

// Notification Component
const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-6 right-6 z-50 animate-slide-in">
      <div
        className={`flex items-center p-4 rounded-xl shadow-2xl backdrop-blur-lg border ${
          type === 'success'
            ? 'bg-green-50/90 border-green-200/50 text-green-800'
            : 'bg-red-50/90 border-red-200/50 text-red-800'
        }`}
      >
        <div className="mr-3">
          {type === 'success' ? (
            <CheckCircle className="h-6 w-6 text-green-600" />
          ) : (
            <XCircle className="h-6 w-6 text-red-600" />
          )}
        </div>
        <div className="flex-1">
          <p className="font-medium">{type === 'success' ? 'Success' : 'Error'}</p>
          <p className="text-sm">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

const Signup = () => {
  const [formData, setFormData] = useState({
    UserName: '',
    MobileNo: '',
    Email: '',
    RoleID: USER_ROLES.CUSTOMER.toString(), // Force CUSTOMER
  });
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [mobileExists, setMobileExists] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userSignup = useSelector((state) => state.userSignup);
  const { loading, success, error: signupError } = userSignup;

  // Success flow
  useEffect(() => {
    if (success && hasSubmitted) {
      setNotification({
        show: true,
        message: 'You have successfully signed up!',
        type: 'success',
      });

      setFormData({
        UserName: '',
        MobileNo: '',
        Email: '',
        RoleID: USER_ROLES.CUSTOMER.toString(),
      });

      const redirectTimer = setTimeout(() => {
        navigate(ROUTES.CUSTOMER); // Always customer after signup
      }, 3000);

      return () => clearTimeout(redirectTimer);
    }

    return () => {
      if (success || signupError) {
        dispatch(resetSignupAction());
      }
    };
  }, [success, navigate, dispatch, signupError, hasSubmitted]);

  // Error notification
  useEffect(() => {
    if (signupError && hasSubmitted) {
      setNotification({ show: true, message: signupError, type: 'error' });
    }
  }, [signupError, hasSubmitted]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'MobileNo') setMobileExists(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setHasSubmitted(true);
    setNotification({ show: false, message: '', type: '' });

    if (!formData.UserName || !formData.MobileNo || !formData.Email) {
      setNotification({ show: true, message: 'Please fill in all fields', type: 'error' });
      return;
    }
    if (mobileExists) {
      setNotification({ show: true, message: 'This mobile number is already registered', type: 'error' });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.Email)) {
      setNotification({ show: true, message: 'Please enter a valid email address', type: 'error' });
      return;
    }

    dispatch(signupUserAction({ ...formData, RoleID: Number(USER_ROLES.CUSTOMER) }));
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={carVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-purple-900/30 to-black/60"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/5 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ show: false, message: '', type: '' })}
        />
      )}

      <div className="relative z-10 max-w-md w-full space-y-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 lg:p-10">
          <div className="text-center">
            {/* Logo with enhanced styling */}
            <div className="mb-8">
              <Link to="/" className="inline-flex items-center justify-center group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative bg-white/20 backdrop-blur-sm p-4 rounded-full border border-white/30">
                    <Car className="h-10 w-10 text-white" />
                  </div>
                </div>
                <span className="ml-4 text-3xl font-bold text-white">{COMPANY_INFO.NAME}</span>
              </Link>
            </div>
            
            {/* Welcome text */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-3">Create Your Account</h2>
              <p className="text-blue-100 text-lg">Join {COMPANY_INFO.NAME} as a customer</p>
              <div className="flex justify-center mt-4">
                <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
              </div>
            </div>
            {/* <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-800">Account Type: Customer</p>
              <p className="text-xs text-blue-600 mt-1">Staff members (Admin/Technician) are added by administrators</p>
            </div> */}
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Username */}
              <div>
                <label htmlFor="UserName" className="block text-sm font-semibold text-white mb-3">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                  <input
                    id="UserName"
                    name="UserName"
                    type="text"
                    value={formData.UserName}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition duration-200"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              {/* Mobile */}
              <div>
                <label htmlFor="MobileNo" className="block text-sm font-semibold text-white mb-3">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                  <input
                    id="MobileNo"
                    name="MobileNo"
                    type="tel"
                    value={formData.MobileNo}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-4 backdrop-blur-sm border rounded-xl text-white placeholder-white/60 focus:ring-2 transition duration-200 ${
                      mobileExists 
                        ? 'bg-red-500/20 border-red-400/50 focus:border-red-400 focus:ring-red-400/50' 
                        : 'bg-white/10 border-white/20 focus:bg-white/20 focus:border-blue-400 focus:ring-blue-400/50'
                    }`}
                    placeholder="Enter your mobile number"
                    required
                  />
                </div>
                {mobileExists && (
                  <p className="text-red-300 text-sm mt-2 flex items-center">
                    <XCircle className="w-4 h-4 mr-1" />
                    This mobile number is already registered
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="Email" className="block text-sm font-semibold text-white mb-3">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                  <input
                    id="Email"
                    name="Email"
                    type="email"
                    value={formData.Email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition duration-200"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Account Type */}
              <div>
                <label htmlFor="AccountType" className="block text-sm font-semibold text-white mb-3">Account Type</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                  <select
                    id="AccountType"
                    name="AccountType"
                    value="Customer"
                    disabled
                    className="w-full pl-12 pr-4 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white/70 cursor-not-allowed appearance-none"
                  >
                    <option value="Customer">Customer Account</option>
                  </select>
                </div>
                <p className="text-xs text-white/60 mt-2 flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Customer accounts can be created through signup
                </p>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || mobileExists}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-2xl hover:shadow-blue-500/25 focus:ring-2 focus:ring-blue-400/50 disabled:opacity-50 transition duration-300 transform hover:scale-[1.02] disabled:transform-none backdrop-blur-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Creating Account...
                  </span>
                ) : 'Create Account'}
              </button>
            </div>

            {/* Links */}
            <div className="text-center pt-6 space-y-4">
              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white/10 backdrop-blur-sm px-4 py-1 rounded-full text-sm text-white/80">Already have an account?</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <Link 
                  to="/login" 
                  className="inline-flex items-center justify-center px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:border-white/40 rounded-xl font-semibold transition duration-200 transform hover:scale-105"
                >
                  Sign in here
                </Link>
                <div>
                  <Link 
                    to="/" 
                    className="text-sm text-white/70 hover:text-white transition duration-200 underline decoration-white/30 hover:decoration-white"
                  >
                    ← Back to Home
                  </Link>
                </div>
              </div>
            </div>
          </form>
        </div>
        
        {/* Decorative elements */}
        <div className="text-center mt-8">
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;

