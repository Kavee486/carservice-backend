// components/ProtectedRoute.jsx
// import { useSelector } from 'react-redux';
// import { Navigate } from 'react-router-dom';

// const ProtectedRoute = ({ children, requiredRole }) => {
//   const { user } = useSelector(state => state.auth);
  
//   // If no user is logged in, redirect to login
//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }
  
//   // If a specific role is required and user doesn't have it, redirect to appropriate dashboard
//   if (requiredRole && user.roleID !== requiredRole) {
//     switch (user.roleID) {
//       case 1: return <Navigate to="/customer" replace />;
//       case 2: return <Navigate to="/admin" replace />;
//       case 3: return <Navigate to="/technician" replace />;
//       default: return <Navigate to="/" replace />;
//     }
//   }
  
//   return children;
// };

// export default ProtectedRoute;

import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { USER_ROLES } from '../constants/authConstants';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useSelector(state => state.auth); // Accessing the logged-in user from Redux
  
  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required and user doesn't have it
  if (requiredRole && user.role !== requiredRole) {
    // Map roles to their respective routes dynamically
    const roleRedirect = {
      [USER_ROLES.CUSTOMER]: '/customer',
      [USER_ROLES.ADMIN]: '/admin',
      [USER_ROLES.TECHNICIAN]: '/technician',
    };

    // Redirect user to the relevant dashboard based on their role
    return <Navigate to={roleRedirect[user.role] || '/'} replace />;
  }

  return children; // If everything is valid, render the children (protected content)
};

export default ProtectedRoute;