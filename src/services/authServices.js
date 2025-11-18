/*import { USER_ROLES } from '../constants';

class AuthService {
  constructor() {
    this.storageKey = 'autodeck_user';
  }

  login(credentials) {
    const { email, password, role } = credentials;
    
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Demo login credentials with updated appointments data
    const demoCredentials = {
      'admin@autodeck.com': { 
        password: 'admin123', 
        role: USER_ROLES.ADMIN, 
        name: 'Admin User',
        appointments: [
          {
            id: '1',
            customerName: 'John Doe',
            vehiclePlate: 'ABC-1234',
            service: 'Oil Change',
            date: '2023-06-15',
            time: '10:00 AM',
            status: 'approved',
            price: 5999,
            notes: 'Customer requested synthetic oil'
          },
          {
            id: '2',
            customerName: 'Jane Smith',
            vehiclePlate: 'XYZ-5678',
            service: 'Brake Replacement',
            date: '2023-06-16',
            time: '2:30 PM',
            status: 'completed',
            price: 19999,
            notes: 'Front brakes only'
          }
        ]
      },
      'tech@autodeck.com': { 
        password: 'tech123', 
        role: USER_ROLES.TECHNICIAN, 
        name: 'Mike Wilson',
        appointments: [
          {
            id: '3',
            customerName: 'Robert Johnson',
            vehiclePlate: 'DEF-9012',
            service: 'Tire Rotation',
            date: '2023-06-17',
            time: '9:00 AM',
            status: 'pending',
            price: 2999,
            notes: 'Include wheel balancing'
          }
        ]
      },
      'customer@autodeck.com': { 
        password: 'customer123', 
        role: USER_ROLES.CUSTOMER, 
        name: 'John Doe',
        appointments: [
          {
            id: '4',
            customerName: 'John Doe',
            vehiclePlate: 'GHI-3456',
            service: 'AC Repair',
            date: '2023-06-18',
            time: '11:00 AM',
            status: 'disapproved',
            price: 24999,
            notes: 'Needs compressor replacement'
          }
        ]
      }
    };

    const demoUser = demoCredentials[email];
    if (demoUser && demoUser.password === password) {
      const userData = {
        id: Math.random().toString(36),
        email,
        role: demoUser.role,
        name: demoUser.name,
        appointments: demoUser.appointments,
        loginTime: new Date().toISOString()
      };
      this.setUser(userData);
      return userData;
    }

    const userData = {
      id: Math.random().toString(36),
      email,
      role: role || USER_ROLES.CUSTOMER,
      name: email.split('@')[0],
      appointments: [],
      loginTime: new Date().toISOString()
    };

    this.setUser(userData);
    return userData;
  }

  signup(userData) {
    const { name, email, password, role } = userData;
    
    if (!name || !email || !password) {
      throw new Error('All fields are required');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    const newUser = {
      id: Math.random().toString(36),
      name,
      email,
      role: role || USER_ROLES.CUSTOMER,
      appointments: [],
      createdAt: new Date().toISOString()
    };

    this.setUser(newUser);
    return newUser;
  }

  logout() {
    localStorage.removeItem(this.storageKey);
  }

  getCurrentUser() {
    const userData = localStorage.getItem(this.storageKey);
    return userData ? JSON.parse(userData) : null;
  }

  setUser(userData) {
    localStorage.setItem(this.storageKey, JSON.stringify(userData));
  }

  isAuthenticated() {
    return this.getCurrentUser() !== null;
  }

  hasRole(requiredRole) {
    const user = this.getCurrentUser();
    return user && user.role === requiredRole;
  }

  getUserAppointments() {
    const user = this.getCurrentUser();
    return user ? user.appointments : [];
  }

  addAppointment(appointment) {
    const user = this.getCurrentUser();
    if (user) {
      // Ensure new appointment has all required fields
      const completeAppointment = {
        id: Math.random().toString(36),
        customerName: user.name,
        vehiclePlate: appointment.vehiclePlate || 'N/A',
        service: appointment.service,
        date: appointment.date,
        time: appointment.time,
        status: 'pending',
        price: appointment.price || 0,
        notes: appointment.notes || '',
        createdAt: new Date().toISOString()
      };

      const updatedUser = {
        ...user,
        appointments: [...user.appointments, completeAppointment]
      };
      this.setUser(updatedUser);
      return updatedUser;
    }
    return null;
  }

  updateAppointment(id, updatedData) {
    const user = this.getCurrentUser();
    if (user) {
      const updatedAppointments = user.appointments.map(appointment => 
        appointment.id === id ? { ...appointment, ...updatedData } : appointment
      );
      
      const updatedUser = {
        ...user,
        appointments: updatedAppointments
      };
      this.setUser(updatedUser);
      return updatedUser;
    }
    return null;
  }

  deleteAppointment(id) {
    const user = this.getCurrentUser();
    if (user) {
      const updatedAppointments = user.appointments.filter(
        appointment => appointment.id !== id
      );
      
      const updatedUser = {
        ...user,
        appointments: updatedAppointments
      };
      this.setUser(updatedUser);
      return updatedUser;
    }
    return null;
  }
}

export default new AuthService();*/
























/*
// services/authService.js
import axios from 'axios';



// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

export const authService = {
  // Login with mobile number
  login: async (mobileNumber) => {
    try {
      const response = await axios.get(`/Login/Login`, {
        params: { contact: mobileNumber }
      });
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  // Verify OTP
  verifyOtp: async (mobileNumber, otpCode) => {
    try {
      const response = await axios.post(`/Login/VerifyOtp`, null, {
        params: {
          contact: mobileNumber,
          otpCode: parseInt(otpCode)
        }
      });
      
      if (response.data.StatusCode === 200) {
        // Create user object with all necessary data
        const userData = {
          mobileNumber: mobileNumber,
          userName: response.data.UserName,
          email: response.data.Email,
          roleID: response.data.RoleID,
          redirectUrl: response.data.RedirectUrl,
          token: Math.random().toString(36).substr(2) // Generate a simple token
        };
        
        // Store user in localStorage
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        return userData;
      } else {
        throw new Error(response.data.Result || 'OTP verification failed');
      }
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  // Get the current logged-in user
  getCurrentUser: () => {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  },
  
  // Logout
  logout: () => {
    localStorage.removeItem('currentUser');
  }
};*/

import { USER_ROLES } from '../constants';
// src/services/authServices.js
// authService.js

export const authService = {
  // Hardcoded credentials for testing purposes
  hardcodedCredentials: {
    admin: { username: 'admin', password: 'admin123', role: 'admin' },
    technician: { username: 'technician', password: 'tech123', role: 'technician' },
    customer: { username: 'customer', password: 'customer123', role: 'customer' },
  },

  // Function to check the credentials
  validateCredentials: (username, password) => {
    for (const key in authService.hardcodedCredentials) {
      const credentials = authService.hardcodedCredentials[key];
      if (credentials.username === username && credentials.password === password) {
        return { ...credentials, id: Date.now() };  // Returning user info if credentials match
      }
    }
    return null;  // If credentials don't match
  },

  login: (userData) => {
    // Storing user in localStorage if valid
    console.log('AuthService.login - storing user data:', userData);
    localStorage.setItem('user', JSON.stringify(userData));
    console.log('AuthService.login - user stored successfully');
  },

  // Verify OTP with backend, persist canonical user object and return it
  verifyOtp: async (mobileNumber, otpCode) => {
    try {
      const resp = await fetch(`https://automechbackend.dockyardsoftware.com/Login/VerifyOtp?contact=${encodeURIComponent(mobileNumber)}&otpCode=${encodeURIComponent(otpCode)}`, {
      //const resp = await fetch(`http://localhost:60748/Login/VerifyOtp?contact=${encodeURIComponent(mobileNumber)}&otpCode=${encodeURIComponent(otpCode)}`, {
        method: 'POST'
      });
      const data = await resp.json();
      console.log('authService.verifyOtp response', data);

      if (!data || data.StatusCode !== 200) {
        throw new Error(data?.Result || data?.Message || 'OTP verification failed');
      }

      // Helper: recursively search object for common ID fields
      const findFieldRecursive = (obj, names) => {
        if (!obj || typeof obj !== 'object') return null;
        for (const k of Object.keys(obj)) {
          try {
            if (names.includes(k) && obj[k] != null) {
              return obj[k];
            }
          } catch (e) {}
        }
        for (const k of Object.keys(obj)) {
          try {
            const val = obj[k];
            if (typeof val === 'object') {
              const found = findFieldRecursive(val, names);
              if (found != null) return found;
            }
          } catch (e) {}
        }
        return null;
      };

      // Determine role from response if available
      let detectedRole = 'customer';
      const roleCandidate = data.RoleID || data.roleId || data.Result?.RoleID || data.Result?.roleId || null;
      const rc = Number(roleCandidate);
  if (rc === 2) detectedRole = 'admin';
  else if (rc === 3) detectedRole = 'technician';
  else if (rc === 4) detectedRole = 'supervisor';
  else detectedRole = 'customer';

      // Try to extract CustomerID or similar fields from anywhere in the response
      const idCandidates = [
        'CustomerID','customerID','CustomerId','customerId','customerid','customer_id','C_CustomerID','C_CustID','CustID',
        'UserID','userId','userid','id','ID'
      ];
      let extractedId = findFieldRecursive(data, idCandidates);
      // coerce numeric strings to numbers
      if (typeof extractedId === 'string' && /^\d+$/.test(extractedId)) {
        extractedId = Number(extractedId);
      }

      // If nothing found, also try using mobileNumber -> but we prefer null (explicit) so callers know it's missing
      if (extractedId == null) {
        console.warn('authService.verifyOtp: no CustomerID/UserID found in VerifyOtp response; full response saved for debugging.');
        console.debug('Full VerifyOtp response:', data);
      }

      const userObj = {
        CustomerID: extractedId || null,
        customerID: extractedId || null,
        UserID: findFieldRecursive(data, ['UserID','userId']) || null,
        id: findFieldRecursive(data, ['UserID','userId','id']) || null,
        UserName: data.UserName || data.Result?.UserName || data.ResultSet?.UserName || mobileNumber,
        userName: data.UserName || data.Result?.UserName || data.ResultSet?.UserName || mobileNumber,
        Email: data.Email || data.Result?.Email || data.ResultSet?.Email || null,
        RoleID: data.RoleID || data.Result?.RoleID || data.ResultSet?.RoleID || null,
        roleString: detectedRole,
        role: detectedRole,
        mobileNumber
      };

  // debug: log extracted id and user object before persisting
  console.log('authService.verifyOtp - extractedId:', extractedId);
  console.log('authService.verifyOtp - userObj to persist:', userObj);
  // persist canonical user under 'user'
  try { localStorage.setItem('user', JSON.stringify(userObj)); } catch (e) { /* ignore */ }

      return userObj;
    } catch (err) {
      console.error('authService.verifyOtp error', err);
      throw err;
    }
  },

  logout: () => {
    console.log('AuthService.logout - removing user data');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      const parsedUser = user ? JSON.parse(user) : null;
      if (!parsedUser) return null;

      // Normalize role: prefer `role`, fall back to `roleString` or numeric RoleID
      if (!parsedUser.role) {
        if (parsedUser.roleString) parsedUser.role = parsedUser.roleString;
        else if (parsedUser.RoleID || parsedUser.roleID || parsedUser.roleId) {
          const rid = Number(parsedUser.RoleID || parsedUser.roleID || parsedUser.roleId);
          if (rid === 2) parsedUser.role = 'admin';
          else if (rid === 3) parsedUser.role = 'technician';
          else if (rid === 4) parsedUser.role = 'supervisor';
          else parsedUser.role = 'customer';
        }
      }

      // Normalize CustomerID fields - ensure both CustomerID and customerID are present if available
      if (!parsedUser.CustomerID && parsedUser.customerID) parsedUser.CustomerID = parsedUser.customerID;
      if (!parsedUser.customerID && parsedUser.CustomerID) parsedUser.customerID = parsedUser.CustomerID;

      // Persist normalized user back to localStorage to keep shape consistent
      try { localStorage.setItem('user', JSON.stringify(parsedUser)); } catch (e) { /* ignore */ }

      console.log('AuthService.getCurrentUser - retrieved user:', parsedUser);
      return parsedUser;
    } catch (err) {
      console.error('authService.getCurrentUser error', err);
      return null;
    }
  },

  // Return the stored customer identifier (prefer backend CustomerID if present)
  getCustomerId: () => {
    try {
      // First check for top-level storage keys that some responses set separately
      const topKeys = ['CustomerID','customerID','customerId','CustomerId','UserID','userId','id'];
      for (const k of topKeys) {
        const raw = localStorage.getItem(k);
        if (raw != null && String(raw).trim() !== '') {
          // raw may be a JSON string or plain value; try to parse number if it's numeric
          const candidate = String(raw).trim();
          if (/^\d+$/.test(candidate)) return candidate; // return numeric string
          try {
            const parsed = JSON.parse(candidate);
            if (parsed) {
              // if parsed is object with id fields, fall through to object scan below
              // otherwise, return stringified parsed
              if (typeof parsed === 'object') {
                // attempt to extract typical id fields
                const id = parsed.CustomerID || parsed.customerID || parsed.UserID || parsed.userId || parsed.id;
                if (id) return id;
              } else {
                return parsed;
              }
            }
          } catch (e) {
            // not JSON, just return the raw value
            return candidate;
          }
        }
      }
      // Try several common storage keys used in this project
      const candidates = ['user', 'currentUser', 'autodeck_user'];
      for (const key of candidates) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        try {
          const p = JSON.parse(raw);
          const id = p.CustomerID || p.customerID || p.customerId || p.C_CustomerID || p.id || p.UserID || p.userId || p.mobileNumber || p.phone || null;
          if (id) return id;
        } catch (e) {
          // if raw isn't JSON, skip
          continue;
        }
      }
      return null;
    } catch (err) {
      console.error('authService.getCustomerId error', err);
      return null;
    }
  },

  updateUser: (updatedUserData) => {
    console.log('AuthService.updateUser - updating user data:', updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
    console.log('AuthService.updateUser - user updated successfully');
  },
};
