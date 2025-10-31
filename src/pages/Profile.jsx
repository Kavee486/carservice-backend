import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ChevronLeft, Save, Edit, Camera, Shield, Calendar, LogOut, Mail, Phone, AlertCircle } from 'lucide-react';
import { authService } from '../services/authServices'; // Use named import instead

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Guest User',
    email: 'Not provided',
    phone: 'Not provided'
  });

  // Safely get user data with error handling
  useEffect(() => {
    try {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      // Also check top-level localStorage keys saved by older login code (UserName, Email)
      const topUserName = localStorage.getItem('UserName') || localStorage.getItem('userName') || localStorage.getItem('username');
      const topEmail = localStorage.getItem('Email') || localStorage.getItem('email') || localStorage.getItem('EmailAddress');
      // Try to parse `user` raw object for additional fields
      let rawUser = null;
      try { rawUser = JSON.parse(localStorage.getItem('user') || 'null'); } catch (e) { rawUser = null; }

      if (currentUser || rawUser || topUserName || topEmail) {
        let nameVal = (currentUser && (currentUser.UserName || currentUser.userName || currentUser.username || currentUser.name))
          || (rawUser && (rawUser.UserName || rawUser.userName || rawUser.username || rawUser.name))
          || topUserName
          || '';

        const emailVal = (currentUser && (currentUser.email || currentUser.Email || currentUser.EmailAddress))
          || (rawUser && (rawUser.email || rawUser.Email || rawUser.EmailAddress))
          || topEmail
          || 'Not provided';

        const phoneVal = (currentUser && (currentUser.mobileNumber || currentUser.mobile || currentUser.phone || currentUser.MobileNo || currentUser.Phone))
          || (rawUser && (rawUser.mobileNumber || rawUser.mobile || rawUser.phone || rawUser.MobileNo || rawUser.Phone))
          || localStorage.getItem('mobileNumber') || localStorage.getItem('Phone') || 'Not provided';

        // If the name looks like a phone number or is empty, try to infer a name from the email local-part
        const looksLikePhone = (s) => {
          if (!s) return false;
          const digits = String(s).replace(/\D/g, '');
          return digits.length >= 6; // treat 6+ digits as phone-like
        };

        if (!nameVal || looksLikePhone(nameVal)) {
          if (emailVal && emailVal !== 'Not provided' && emailVal.includes('@')) {
            const inferred = emailVal.split('@')[0];
            // Capitalize first letter
            nameVal = inferred.charAt(0).toUpperCase() + inferred.slice(1);
          } else if (phoneVal && phoneVal !== 'Not provided') {
            // fallback to showing masked phone as name if nothing else
            nameVal = phoneVal;
          } else {
            nameVal = 'Guest User';
          }
        }

        setFormData({ name: nameVal, email: emailVal, phone: phoneVal });
      }
    } catch (error) {
      console.error('Error getting current user:', error);
      setUser(null);
    }
  }, []);

  // Default user data if not available
  const userData = user || {
    name: 'Guest User',
    email: 'guest@example.com',
    role: 'guest',
    joinDate: new Date().toLocaleDateString(),
    lastLogin: new Date().toLocaleString()
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    try {
      // Here you would typically call an API to update the user data
      console.log('Saved data:', formData);
      setIsEditing(false);
      // Update the user in authService if needed
      if (user) {
        const updatedUser = {
          ...user,
          name: formData.name,
          username: formData.name, // Update both name and username
          email: formData.email,
          phone: formData.phone
        };
        authService.updateUser(updatedUser);
        console.log('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      name: user?.UserName || user?.userName || user?.username || user?.name || 'Guest User',
      email: user?.email || user?.Email || user?.EmailAddress || 'Not provided',
      phone: user?.mobileNumber || user?.mobile || user?.phone || user?.MobileNo || user?.Phone || 'Not provided'
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    try {
      authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      // Fallback: clear localStorage manually and navigate
      localStorage.removeItem('user');
      navigate('/login');
    }
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
                style={{ width: '100%' }}
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

  return (
    <div className="h-full p-4 md:p-6">
      <div className="w-full space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg text-white p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center">
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center text-blue-100 hover:text-white transition-colors duration-200 text-base font-medium bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-2"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </button>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-white mb-2">Profile Settings</h1>
                <p className="text-blue-100">Manage your personal information and account settings</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <button 
                    onClick={handleSave}
                    className="bg-white text-blue-600 rounded-lg hover:bg-blue-50 h-10 px-4 font-medium flex items-center border-0"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </button>
                  <button 
                    onClick={handleCancel}
                    className="bg-white bg-opacity-20 text-white border-0 rounded-lg h-10 px-4 font-medium hover:bg-opacity-30 flex items-center backdrop-blur-sm"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="bg-white text-blue-600 rounded-lg hover:bg-blue-50 h-10 px-4 font-medium flex items-center border-0"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Account Type"
            value={userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
            icon={<Shield className="text-blue-600" />}
            color="text-blue-600"
            progress
          />
          <StatCard
            title="Member Since"
            value={userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
            icon={<Calendar className="text-green-600" />}
            color="text-green-600"
            progress
          />
          <StatCard
            title="Last Login"
            value={userData.lastLogin ? new Date(userData.lastLogin).toLocaleDateString() : 'Today'}
            icon={<Calendar className="text-purple-600" />}
            color="text-purple-600"
            progress
          />
          <StatCard
            title="Status"
            value="Active"
            icon={<User className="text-orange-600" />}
            color="text-orange-600"
            progress
          />
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
                  <User className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center mb-6">
                    <div className="relative">
                      <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white shadow-lg">
                        <User className="h-10 w-10 text-blue-600" />
                      </div>
                      {isEditing && (
                        <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                          <Camera className="h-4 w-4 text-gray-600" />
                        </button>
                      )}
                    </div>
                    <div className="ml-6">
                      {isEditing ? (
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="text-xl font-bold border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                          placeholder="Full Name"
                        />
                      ) : (
                        <h2 className="text-xl font-bold text-gray-900">{formData.name}</h2>
                      )}
                      <p className="text-gray-600 mt-1 flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        {formData.email}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-2">Email Address</label>
                      {isEditing ? (
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                        />
                      ) : (
                        <div className="flex items-center text-gray-900 font-medium p-2 bg-blue-50 rounded-lg">
                          <Mail className="h-4 w-4 mr-2 text-blue-500" />
                          {formData.email}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-2">Phone Number</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                        />
                      ) : (
                        <div className="flex items-center text-gray-900 font-medium p-2 bg-blue-50 rounded-lg">
                          <Phone className="h-4 w-4 mr-2 text-blue-500" />
                          {formData.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Account Details</h3>
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Shield className="h-4 w-4 mr-2" />
                      Role
                    </div>
                    <p className="text-gray-900 font-medium capitalize text-base">{userData.role}</p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      Member Since
                    </div>
                    <p className="text-gray-900 font-medium text-base">
                      {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : 'N/A'}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      Last Login
                    </div>
                    <p className="text-gray-900 font-medium text-base">
                      {userData.lastLogin ? new Date(userData.lastLogin).toLocaleString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Today'}
                    </p>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-200">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-colors font-medium text-base border-0"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .stat-card {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        }
      `}</style>
    </div>
  );
};

export default Profile;