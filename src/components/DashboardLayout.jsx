// components/DashboardLayout.jsx
import React from 'react';
import Sidebar from './Sidebar';
import ErrorBoundary from './ErrorBoundary';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authServices';
import { USER_ROLES } from '../constants';

const DashboardLayout = ({ children, title, onLogout }) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar stays fixed on the left */}
      <aside className="fixed top-0 left-0 h-screen w-64 bg-[#0B1220] text-white z-50">
        <Sidebar onLogout={onLogout} />
      </aside>

      {/* Main content shifts right by sidebar width */}
      <div className="ml-64 flex-1 flex flex-col">
        <header className="bg-gray-900 shadow-sm w-full flex-shrink-0">
          <div className="flex justify-between items-center px-8 py-4">
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            <div className="flex items-center space-x-3">
              {/* Show duplicate profile buttons for supervisors to match design mock */}
              {(() => {
                const currentUser = authService.getCurrentUser();
                const isSupervisor = currentUser && (currentUser.role === USER_ROLES.SUPERVISOR || currentUser.roleString === USER_ROLES.SUPERVISOR);

                if (isSupervisor) {
                  return (
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={handleProfileClick}
                        className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <User className="h-5 w-5" />
                        <span>My Profile</span>
                      </button>
                      {/* <button
                        onClick={handleProfileClick}
                        className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <User className="h-5 w-5" />
                        <span>My Profile</span>
                      </button> */}
                    </div>
                  );
                }

                // return (
                //   // <button
                //   //   onClick={handleProfileClick}
                //   //   className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                //   // >
                //   //   <User className="h-5 w-5" />
                //   //   <span>My Profile</span>
                //   // </button>
                // );
              })()}
            </div>
          </div>
        </header>

        {/* <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="h-full w-full">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
        </main> */}
      </div>
    </div>
  );
};

export default DashboardLayout;
