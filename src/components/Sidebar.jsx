import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/authServices';
import { USER_ROLES } from '../constants';
import {
  Home,
  Calendar,
  ClipboardList,
  Package,
  User,
  Users,
  LogOut,
  Clock,
  Ticket,
  Wrench,
  FileText,
  Car,
  ChevronLeft,
  ChevronRight,
  Menu,
  Layers,
  Building,
  Warehouse,
  Briefcase,
  DollarSign,
  FileText as InvoiceIcon
} from 'lucide-react';

const Sidebar = ({ onLogout }) => {
  const user = authService.getCurrentUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      authService.logout();
    }
    navigate('/', { replace: true });
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const toggleCategory = (categoryName) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  const getMenuItems = () => {
    switch (user?.role) {
      case USER_ROLES.ADMIN:
        return {
          dashboard: { 
            icon: Home, 
            label: 'Dashboard', 
            path: '/admin',
            standalone: true 
          },
          peopleManagement: {
            icon: Users,
            label: 'People Management',
            items: [
              { icon: Users, label: 'User Management', path: '/admin/user-management' },
              { icon: User, label: 'Customers', path: '/admin/customers' },
            ]
          },
          appointmentManagement: {
            icon: Calendar,
            label: 'Appointment Management',
            items: [
              { icon: Calendar, label: 'Appointments', path: '/admin/appointments' },
              { icon: Clock, label: 'Timeslots', path: '/admin/timeslots' },
              { icon: FileText, label: 'Job Cards', path: '/admin/job-cards' },
            ]
          },
          vehicleManagement: {
            icon: Car,
            label: 'Vehicle Management',
            items: [
              { icon: Car, label: 'Vehicles', path: '/admin/vehicles' },
            ]
          },
          inventoryManagement: {
            icon: Package,
            label: 'Inventory Management',
            items: [
              { icon: Package, label: 'Parts Inventory', path: '/admin/parts' },
              { icon: Layers, label: 'Categories', path: '/admin/categories' },
            ]
          },
          jobManagement: {
            icon: Briefcase,
            label:' Service Management',
            items: [
              { icon: ClipboardList, label: 'Services', path: '/admin/services' },
            ]
          },
          financialManagement: {
            icon: DollarSign,
            label: 'Financial Management',
            items: [
              { icon: InvoiceIcon, label: 'Invoicing', path: '/admin/invoicing' },
            ]
          },
          profile: { 
            icon: User, 
            label: 'Profile', 
            path: '/profile',
            standalone: true 
          },
        };
      case USER_ROLES.TECHNICIAN:
        return [
          { icon: Home, label: 'Dashboard', path: '/technician' },
          { icon: Clock, label: 'My Schedule', path: '/technician/schedule' },
          { icon: Calendar, label: 'Appointments', path: '/technician/appointments' },
          { icon: Wrench, label: 'Job Cards', path: '/technician/job-cards' },
          { icon: ClipboardList, label: 'Job Card Items', path: '/technician/job-card-items' },
          { icon: Package, label: 'Parts Inventory', path: '/technician/parts' },
          { icon: Car, label: 'Vehicles', path: '/technician/vehicles' },
          { icon: Layers, label: 'Categories', path: '/technician/categories' },
          { icon: User, label: 'Profile', path: '/profile' },
        ];
      case USER_ROLES.CUSTOMER:
        return [
          { icon: Home, label: 'Dashboard', path: '/customer' },
          { icon: Ticket, label: 'Bookings', path: '/customer/bookings' },
          { icon: FileText, label: 'Previous Services', path: '/customer/previous-services' },
          { icon: User, label: 'Profile', path: '/profile' },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  const renderMenuItem = (item, key) => {
    if (user?.role === USER_ROLES.ADMIN) {
      if (item.standalone) {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        
        return (
          <Link
            key={key}
            to={item.path}
            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
            onClick={() => setIsMobileOpen(false)}
          >
            <Icon className="h-5 w-5" />
            {isSidebarVisible && <span className="ml-3">{item.label}</span>}
          </Link>
        );
      } else {
        const Icon = item.icon;
        const isExpanded = expandedCategories[key];
        const hasActiveChild = item.items?.some(child => location.pathname === child.path);
        const isExpandedComputed = isExpanded || hasActiveChild;
        const parentActiveClass = hasActiveChild ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white';

        return (
          <div key={key} className="mb-2">
            <button
              onClick={() => toggleCategory(key)}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors ${parentActiveClass}`}
            >
              <div className="flex items-center">
                {/* small left indicator when a child is active */}
                {isSidebarVisible && (
                  <div className={`w-1 h-5 rounded mr-3 ${hasActiveChild ? 'bg-blue-300' : 'bg-transparent'}`} />
                )}
                <div className="flex items-center">
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {isSidebarVisible && <span className="ml-3 font-medium">{item.label}</span>}
                </div>
              </div>
              {isSidebarVisible && (
                <ChevronRight 
                  className={`h-4 w-4 transition-transform ${isExpandedComputed ? 'rotate-90' : ''}`} 
                />
              )}
            </button>
            
            {isExpandedComputed && isSidebarVisible && item.items && (
              <div className="ml-6 mt-1 space-y-1">
                {item.items.map((child, childIndex) => {
                  const ChildIcon = child.icon;
                  const isChildActive = location.pathname === child.path;
                  
                  return (
                    <Link
                      key={`${key}-${childIndex}`}
                      to={child.path}
                      className={`flex items-center px-4 py-3 rounded-lg transition-colors text-sm ${
                        isChildActive
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-200 hover:bg-gray-700 hover:text-white'
                      }`}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <ChildIcon className={`h-5 w-5 ${isChildActive ? 'text-white' : ''}`} />
                      <span className="ml-3">{child.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      }
    } else {
      const isActive = location.pathname === item.path;
      const Icon = item.icon;
      
      return (
        <Link
          key={key}
          to={item.path}
          className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
            isActive
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
          }`}
          onClick={() => setIsMobileOpen(false)}
        >
          <Icon className="h-5 w-5" />
          {isSidebarVisible && <span className="ml-3">{item.label}</span>}
        </Link>
      );
    }
  };

  return (
    <>
      <button
        onClick={toggleMobileSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-md"
      >
        <Menu className="h-5 w-5" />
      </button>

      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div className={`
        bg-gray-900 text-white min-h-screen p-4 flex flex-col flex-shrink-0
        transition-all duration-300 ease-in-out
        ${isSidebarVisible ? 'w-64' : 'w-20'}
        fixed lg:relative z-50
        ${isMobileOpen ? 'left-0' : '-left-64'} lg:left-0
      `}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg mr-3 shadow-md ring-1 ring-white/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            {isSidebarVisible && (
              <div className="leading-tight">
                <h1 className="text-lg font-extrabold text-white tracking-tight">AutoMech</h1>
                <div className="mt-1 flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/10 text-xs text-blue-100 border border-white/5 font-medium">{String(user?.role || '').toUpperCase()}</span>
                  <span className="text-xs text-gray-400">Admin dashboard</span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={toggleSidebar}
            className="hidden lg:block text-gray-400 hover:text-white p-1 rounded"
          >
            {isSidebarVisible ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
        </div>

        <nav className="space-y-2 flex-1">
          {user?.role === USER_ROLES.ADMIN ? (
            Object.entries(menuItems).map(([key, item]) => 
              renderMenuItem(item, key)
            )
          ) : (
            menuItems.map((item, index) => 
              renderMenuItem(item, index)
            )
          )}
        </nav>

        <div className="mt-auto pt-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            {isSidebarVisible && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;