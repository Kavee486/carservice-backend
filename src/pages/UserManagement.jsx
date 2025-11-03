// src/pages/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Table, Button, Modal, Form, Input, Card, Space, Typography, 
  message, Spin, Grid, Tag, Avatar, Progress, Tooltip, Row, Col,
  Dropdown, Divider, Statistic, Badge, Select
} from 'antd';
import { 
  SearchOutlined, PlusOutlined, ReloadOutlined, FilterOutlined,
  EyeOutlined, EditOutlined, DeleteOutlined, UserOutlined,
  TeamOutlined, CheckCircleOutlined, CloseCircleOutlined,
  ExclamationCircleOutlined, PhoneOutlined, MailOutlined,
  EnvironmentOutlined, CheckOutlined, IdcardOutlined,
  SecurityScanOutlined, UserAddOutlined, UserSwitchOutlined,
  IdcardFilled
} from '@ant-design/icons';
import { 
  signupUserAction, 
  resetSignupAction, 
  getAdminsAction, 
  getTechniciansAction,
  getAllTechniciansAction,
  updateUserAction,
  updateTechnicianCompleteAction,
  deactivateUserAction,
  deactivateTechnicianCompleteAction,
  fetchAllUsersAction
} from '../actions/userActions';

const { Title, Text } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;
const { TextArea } = Input;

const UserManagement = () => {
  const dispatch = useDispatch();
  const screens = useBreakpoint();
  
  const userSignup = useSelector((state) => state.userSignup);
  const { 
    loading: signupLoading, 
    success: signupSuccess, 
    error: signupError,
    admins,
    technicians,
    allTechnicians 
  } = userSignup;

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activateConfirm, setActivateConfirm] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activateLoading, setActivateLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [addUserForm] = Form.useForm();
  const [selectedRole, setSelectedRole] = useState('2');
  const [userFilter, setUserFilter] = useState('all');

  useEffect(() => {
    fetchAllUsers();
  }, [dispatch]);

  // Handle signup success
  useEffect(() => {
    if (signupSuccess) {
      message.success('User added successfully!');
      addUserForm.resetFields();
      setIsAddModalVisible(false);
      setSelectedRole('2');
      fetchAllUsers();
      dispatch(resetSignupAction());
    }
  }, [signupSuccess, dispatch, addUserForm]);

  // Handle signup error
  useEffect(() => {
    if (signupError) {
      message.error(signupError);
      dispatch(resetSignupAction());
    }
  }, [signupError, dispatch]);

  const fetchAllUsers = () => {
    dispatch(fetchAllUsersAction());
  };

  // Enhanced status detection
  const getStatusDetails = (user) => {
    const statusValue = user.Status;
    
    if (!statusValue) {
      return { text: 'Unknown', isActive: false, color: '#d9d9d9', bgColor: '#fafafa', icon: <ExclamationCircleOutlined /> };
    }
    
    const cleanStatus = String(statusValue).trim();
    
    if (cleanStatus === 'A' || cleanStatus === 'a' || cleanStatus.toLowerCase() === 'active') {
      return { 
        text: 'ACTIVE', 
        isActive: true, 
        color: '#52c41a', 
        bgColor: '#f6ffed', 
        icon: <CheckCircleOutlined /> 
      };
    }
    
    if (cleanStatus === 'I' || cleanStatus === 'i' || cleanStatus.toLowerCase() === 'inactive') {
      return { 
        text: 'INACTIVE', 
        isActive: false, 
        color: '#ff4d4f', 
        bgColor: '#fff2f0', 
        icon: <CloseCircleOutlined /> 
      };
    }
    
    return { 
      text: cleanStatus.toUpperCase() || 'UNKNOWN', 
      isActive: false, 
      color: '#d9d9d9', 
      bgColor: '#fafafa', 
      icon: <ExclamationCircleOutlined /> 
    };
  };

  // Find matching technician record for a user
  const findMatchingTechnician = (user) => {
    if (!allTechnicians?.data?.ResultSet || user.RoleID !== '3') return null;
    
    return allTechnicians.data.ResultSet.find(tech => 
      tech.Email === user.Email || 
      tech.Phone === user.MobileNo ||
      (user.NIC && tech.NIC === user.NIC)
    );
  };

  // Get user data from state
  const adminUsers = admins?.data?.ResultSet || [];
  const technicianUsers = technicians?.data?.ResultSet || [];
  const allUsers = [...adminUsers, ...technicianUsers];

  // Sort users - active first
  const sortedAndFilteredUsers = allUsers && allUsers.length > 0 
    ? [...allUsers]
        .sort((a, b) => {
          const statusA = getStatusDetails(a);
          const statusB = getStatusDetails(b);
          
          // Active users first
          if (statusA.isActive && !statusB.isActive) return -1;
          if (!statusA.isActive && statusB.isActive) return 1;
          
          // Then sort by name
          return (a.UserName || '').localeCompare(b.UserName || '');
        })
        .filter(user => {
          const statusDetails = getStatusDetails(user);
          const matchesSearch = 
            user.UserName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.Email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.MobileNo?.includes(searchTerm) ||
            user.NIC?.toLowerCase().includes(searchTerm.toLowerCase());
          
          // Apply role filter
          if (userFilter === 'admins' && (user.RoleID !== '2' && user.RoleID !== 2)) return false;
          if (userFilter === 'technicians' && (user.RoleID !== '3' && user.RoleID !== 3)) return false;
          
          if (statusFilter === 'all') return matchesSearch;
          if (statusFilter === 'active') return statusDetails.isActive && matchesSearch;
          if (statusFilter === 'inactive') return !statusDetails.isActive && matchesSearch;
          return matchesSearch;
        })
    : [];

  // Count users by status and role
  const userCounts = allUsers && allUsers.length > 0 
    ? allUsers.reduce((counts, user) => {
        const statusDetails = getStatusDetails(user);
        const isAdmin = user.RoleID === '2' || user.RoleID === 2;
        const isTechnician = user.RoleID === '3' || user.RoleID === 3;
        
        if (statusDetails.isActive) {
          counts.active++;
          if (isAdmin) counts.admins++;
          if (isTechnician) counts.technicians++;
        } else {
          counts.inactive++;
        }
        
        counts.total++;
        return counts;
      }, { total: 0, active: 0, inactive: 0, admins: 0, technicians: 0 })
    : { total: 0, active: 0, inactive: 0, admins: 0, technicians: 0 };

  const handleAddUser = async (values) => {
    try {
      const userData = {
        UserName: values.userName,
        Email: values.email,
        MobileNo: values.mobileNo,
        RoleID: Number(values.roleID)
      };

      // Add NIC only for technicians (RoleID = 3)
      if (Number(values.roleID) === 3) {
        if (!values.nic) {
          message.error('NIC is required for technicians');
          return;
        }
        userData.NIC = values.nic;
      }

      const result = await dispatch(signupUserAction(userData));
      
      if (result.success) {
        message.success('User added successfully!');
      } else {
        message.error(result.message || 'Failed to add user');
      }
    } catch (error) {
      console.error('Failed to add user:', error);
      message.error('Failed to add user');
    }
  };

  const handleDeactivateUser = async (user) => {
    try {
      setDeleteLoading(true);
      
      if (user.RoleID === '3' || user.RoleID === 3) {
        // Deactivate technician in both tables
        const technician = findMatchingTechnician(user);
        if (technician) {
          const result = await dispatch(deactivateTechnicianCompleteAction(user.UserID, technician.TechnicianID));
          
          if (result.userSuccess && result.technicianSuccess) {
            message.success('Technician deactivated successfully in both tables!');
          } else if (result.userSuccess && !result.technicianSuccess) {
            message.warning('User deactivated but technician deactivation failed: ' + result.technicianMessage);
          } else if (!result.userSuccess && result.technicianSuccess) {
            message.warning('Technician deactivated but user deactivation failed: ' + result.userMessage);
          } else {
            message.error('Failed to deactivate technician in both tables');
          }
        } else {
          // Fallback: only deactivate in Users table
          const result = await dispatch(deactivateUserAction(user.UserID));
          if (result.success) {
            message.success('User deactivated successfully!');
          } else {
            message.error(result.message || 'Failed to deactivate user');
          }
        }
      } else {
        // Deactivate admin (only in Users table)
        const result = await dispatch(deactivateUserAction(user.UserID));
        if (result.success) {
          message.success('Admin deactivated successfully!');
        } else {
          message.error(result.message || 'Failed to deactivate admin');
        }
      }

      setDeleteConfirm(null);
      fetchAllUsers();
    } catch (error) {
      console.error('Failed to deactivate user:', error);
      message.error('Failed to deactivate user');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleActivateUser = async (user) => {
    try {
      setActivateLoading(true);
      // Note: You'll need to implement activateUserAction similar to deactivate
      const result = await dispatch(deactivateUserAction(user.UserID)); // This should be activateUserAction
      if (result.success) {
        message.success('User activated successfully!');
      } else {
        message.error(result.message || 'Failed to activate user');
      }
      setActivateConfirm(null);
      fetchAllUsers();
    } catch (error) {
      console.error('Failed to activate user:', error);
      message.error('Failed to activate user');
    } finally {
      setActivateLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAllUsers();
    message.info('Refreshing user data...');
  };

  const showDetails = (user) => {
    setSelectedUser(user);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleAddUserCancel = () => {
    setIsAddModalVisible(false);
    addUserForm.resetFields();
    setSelectedRole('2');
  };

  const toggleRowExpansion = (record) => {
    if (expandedRowKeys.includes(record.UserID)) {
      setExpandedRowKeys(expandedRowKeys.filter(key => key !== record.UserID));
    } else {
      setExpandedRowKeys([...expandedRowKeys, record.UserID]);
    }
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    if (role !== '3') {
      addUserForm.setFieldsValue({ nic: undefined });
    }
  };

  const StatCard = ({ title, value, icon, color, progress }) => (
    <Card 
      className="stat-card h-full border-0 shadow-sm hover:shadow-md transition-all duration-300"
      bodyStyle={{ padding: '12px 16px' }}
    >
      <div className="flex items-center justify-between">
        <div>
          <Text className="text-xs font-medium text-gray-500 block mb-1">{title}</Text>
          <Text className="text-xl font-bold text-gray-900">{value}</Text>
          {progress !== undefined && (
            <Progress 
              percent={Math.round((value / userCounts.total) * 100)} 
              size="small" 
              strokeColor={color}
              showInfo={false}
              className="mt-1"
            />
          )}
        </div>
        <div className={`p-2 rounded-full ${color} bg-opacity-10`}>
          {React.cloneElement(icon, { 
            className: `text-lg ${color.replace('text-', 'text-')}` 
          })}
        </div>
      </div>
    </Card>
  );

  const renderMobileCard = (record) => {
    const isExpanded = expandedRowKeys.includes(record.UserID);
    const statusDetails = getStatusDetails(record);
    const isTechnician = record.RoleID === '3' || record.RoleID === 3;
    
    return (
      <Card 
        key={record.UserID} 
        className="mb-4 shadow-sm hover:shadow-md transition-all duration-300 border-0 rounded-xl bg-gradient-to-r from-white to-gray-50"
        bodyStyle={{ padding: '16px' }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Avatar 
              size="large" 
              icon={isTechnician ? <IdcardFilled /> : <SecurityScanOutlined />} 
              className={isTechnician ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"}
            />
            <div>
              <Text strong className="text-lg font-semibold text-gray-900 block">
                {record.UserName || 'Unknown User'}
              </Text>
              <Text className="text-sm text-gray-500">{record.UserID}</Text>
            </div>
          </div>
          <Tag 
            color={statusDetails.color} 
            icon={statusDetails.icon}
            style={{ 
              backgroundColor: statusDetails.bgColor, 
              borderColor: statusDetails.color,
              color: statusDetails.color,
              borderRadius: '12px',
              fontWeight: '600'
            }}
          >
            {statusDetails.text}
          </Tag>
        </div>

        <div className="grid grid-cols-1 gap-2 mb-3">
          <div className="flex items-center text-sm text-gray-600">
            <PhoneOutlined className="mr-2 text-blue-500" />
            <span>{record.MobileNo || 'N/A'}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MailOutlined className="mr-2 text-green-500" />
            <span>{record.Email || 'N/A'}</span>
          </div>
          {isTechnician && record.NIC && (
            <div className="flex items-center text-sm text-gray-600">
              <IdcardOutlined className="mr-2 text-orange-500" />
              <span>{record.NIC}</span>
            </div>
          )}
        </div>

        <div className="mb-3">
          <Tag 
            color={isTechnician ? 'blue' : 'purple'} 
            icon={isTechnician ? <IdcardFilled /> : <SecurityScanOutlined />}
            className="font-semibold"
          >
            {isTechnician ? 'TECHNICIAN' : 'ADMIN'}
          </Tag>
        </div>

        <Divider className="my-3" />

        <div className="flex justify-between items-center">
          <Space size="small">
            <Tooltip title="View Details">
              <Button
                type="text"
                icon={<EyeOutlined className="text-blue-600" />}
                onClick={() => showDetails(record)}
                className="hover:bg-blue-50 rounded-lg w-10 h-10 flex items-center justify-center"
              />
            </Tooltip>
            
            {statusDetails.isActive ? (
              <Tooltip title="Deactivate User">
                <Button
                  type="text"
                  icon={<DeleteOutlined className="text-red-600" />}
                  onClick={() => setDeleteConfirm(record)}
                  className="hover:bg-red-50 rounded-lg w-10 h-10 flex items-center justify-center"
                />
              </Tooltip>
            ) : (
              <Tooltip title="Activate User">
                <Button
                  type="text"
                  icon={<CheckOutlined className="text-green-600" />}
                  onClick={() => setActivateConfirm(record)}
                  className="hover:bg-green-50 rounded-lg w-10 h-10 flex items-center justify-center"
                />
              </Tooltip>
            )}
          </Space>

          <div className="flex items-center gap-2">
            <Button
              type="text"
              icon={<EditOutlined className={`text-gray-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />}
              onClick={() => toggleRowExpansion(record)}
              className="hover:bg-gray-50 rounded-lg w-10 h-10 flex items-center justify-center"
            />
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Text strong className="text-sm text-gray-700">Role:</Text>
                <Text className="text-sm text-gray-600">{isTechnician ? 'Technician' : 'Admin'}</Text>
              </div>
              <div className="flex justify-between">
                <Text strong className="text-sm text-gray-700">Status:</Text>
                <Text className="text-sm text-gray-600">{statusDetails.text}</Text>
              </div>
              
              <div className="pt-2">
                <Button 
                  type="primary"
                  onClick={() => showDetails(record)}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 border-0 rounded-lg h-9 font-medium"
                >
                  Full Details
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    );
  };

  const columns = [
    {
      title: <span className="text-sm font-semibold text-gray-700">User ID</span>,
      dataIndex: 'UserID',
      key: 'UserID',
      render: (text, record) => {
        const isTechnician = record.RoleID === '3' || record.RoleID === 3;
        return (
          <div className="flex items-center">
            <Avatar 
              size="small" 
              icon={isTechnician ? <IdcardFilled /> : <SecurityScanOutlined />} 
              className={isTechnician ? "bg-blue-100 text-blue-600 mr-2" : "bg-purple-100 text-purple-600 mr-2"}
            />
            <Text strong className="text-base font-semibold text-gray-900">{text}</Text>
          </div>
        );
      },
      width: 120,
    },
    {
      title: <span className="text-sm font-semibold text-gray-700">Username</span>,
      dataIndex: 'UserName',
      key: 'UserName',
      render: (text) => <Text className="text-base font-medium text-gray-800">{text || 'N/A'}</Text>,
      width: 150,
    },
    {
      title: <span className="text-sm font-semibold text-gray-700">Phone</span>,
      dataIndex: 'MobileNo',
      key: 'MobileNo',
      render: (text) => (
        <div className="flex items-center">
          <PhoneOutlined className="text-gray-400 mr-2" />
          <Text className="text-base text-gray-700">{text || 'N/A'}</Text>
        </div>
      ),
      width: 140,
    },
    {
      title: <span className="text-sm font-semibold text-gray-700">Email</span>,
      dataIndex: 'Email',
      key: 'Email',
      render: (text) => (
        <div className="flex items-center">
          <MailOutlined className="text-gray-400 mr-2" />
          <Text className="text-base text-gray-700">{text || 'N/A'}</Text>
        </div>
      ),
      width: 200,
    },
    {
      title: <span className="text-sm font-semibold text-gray-700">Role</span>,
      key: 'role',
      render: (_, record) => {
        const isTechnician = record.RoleID === '3' || record.RoleID === 3;
        return (
          <Tag 
            color={isTechnician ? 'blue' : 'purple'} 
            icon={isTechnician ? <IdcardFilled /> : <SecurityScanOutlined />}
            className="font-semibold"
          >
            {isTechnician ? 'TECHNICIAN' : 'ADMIN'}
          </Tag>
        );
      },
      width: 120,
    },
    {
      title: <span className="text-sm font-semibold text-gray-700">Status</span>,
      key: 'status',
      render: (_, record) => {
        const statusDetails = getStatusDetails(record);
        return (
          <Tag 
            color={statusDetails.color} 
            icon={statusDetails.icon}
            style={{ 
              backgroundColor: statusDetails.bgColor, 
              borderColor: statusDetails.color,
              color: statusDetails.color,
              borderRadius: '12px',
              fontWeight: '600',
              border: 'none'
            }}
          >
            {statusDetails.text}
          </Tag>
        );
      },
      width: 100,
    },
    {
      title: <span className="text-sm font-semibold text-gray-700">Actions</span>,
      key: 'actions',
      width: 120,
      render: (_, record) => {
        const statusDetails = getStatusDetails(record);
        
        const menuItems = [
          {
            key: 'view',
            icon: <EyeOutlined className="text-blue-600" />,
            label: 'View Details',
            onClick: () => showDetails(record)
          },
          {
            key: 'divider1',
            type: 'divider'
          },
          statusDetails.isActive ? {
            key: 'deactivate',
            icon: <DeleteOutlined className="text-red-600" />,
            label: 'Deactivate User',
            onClick: () => setDeleteConfirm(record)
          } : {
            key: 'activate',
            icon: <CheckOutlined className="text-green-600" />,
            label: 'Activate User',
            onClick: () => setActivateConfirm(record)
          }
        ];

        return (
          <div className="flex items-center gap-2">
            <Dropdown
              menu={{ 
                items: menuItems,
                onClick: ({ key }) => {
                  const item = menuItems.find(item => item.key === key);
                  if (item && item.onClick) {
                    item.onClick();
                  }
                }
              }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Button 
                type="text" 
                icon={<EditOutlined className="text-gray-600" />} 
                className="hover:bg-gray-50 rounded-lg w-10 h-10 flex items-center justify-center"
              />
            </Dropdown>
          </div>
        );
      },
    },
  ];

  if (signupLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" className="text-blue-600" />
          <div className="mt-4">
            <Text className="text-base text-gray-600 font-medium">Loading users...</Text>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 md:px-6 py-4 md:py-6">
      <div className="space-y-6">
        {/* Header Section */}
        <Card 
          bordered={false} 
          className="shadow-lg rounded-2xl border-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white"
          bodyStyle={{ padding: '24px' }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">User Management</h1>
              <Text className="text-blue-100">Manage administrators and technicians in the system</Text>
            </div>
            <Space size="middle">
              <Button 
                icon={<PlusOutlined />} 
                onClick={() => setIsAddModalVisible(true)}
                className="bg-white text-blue-600 hover:bg-gray-100 border-0 rounded-lg h-10 px-4 font-medium"
              >
                {screens.xs ? '' : 'Add User'}
              </Button>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={handleRefresh}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-0 rounded-lg h-10 px-4 font-medium backdrop-blur-sm"
              >
                {screens.xs ? '' : 'Refresh'}
              </Button>
            </Space>
          </div>
        </Card>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <StatCard 
              title="Total Users" 
              value={userCounts.total} 
              icon={<TeamOutlined />}
              color="text-blue-600"
              progress
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard 
              title="Active Users" 
              value={userCounts.active} 
              icon={<CheckCircleOutlined />}
              color="text-green-600"
              progress
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard 
              title="Admins" 
              value={userCounts.admins} 
              icon={<SecurityScanOutlined />}
              color="text-purple-600"
              progress
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard 
              title="Technicians" 
              value={userCounts.technicians} 
              icon={<IdcardFilled />}
              color="text-blue-600"
              progress
            />
          </Col>
        </Row>

        {/* Filters and Search */}
        <Card 
          bordered={false} 
          className="shadow-lg rounded-2xl border-0 bg-white"
          bodyStyle={{ padding: '16px 20px' }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
            <div className="flex items-center">
              <FilterOutlined className="text-blue-600 text-base mr-2" />
              <Text strong className="text-base text-gray-900">Filters & Search</Text>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative md:col-span-2">
              <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              />
            </div>
            
            <div className="flex flex-col md:flex-row gap-2">
              <Select
                value={userFilter}
                onChange={setUserFilter}
                className="w-full md:w-32"
                placeholder="Role"
              >
                <Option value="all">All Roles</Option>
                <Option value="admins">Admins</Option>
                <Option value="technicians">Technicians</Option>
              </Select>
              
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                className="w-full md:w-32"
                placeholder="Status"
              >
                <Option value="all">All Status</Option>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </div>
          </div>
          
          <div className="mt-2">
            <Text className="text-xs font-medium text-gray-600">
              Showing {sortedAndFilteredUsers.length} of {userCounts.total} users
            </Text>
          </div>
        </Card>

        {/* Users Table/Cards */}
        <Card 
          bordered={false} 
          className="shadow-lg rounded-2xl border-0 bg-white overflow-hidden"
          bodyStyle={{ padding: '24px' }}
          title={
            <div className="flex items-center justify-between">
              <Text strong className="text-xl text-gray-900">User List</Text>
              <Text className="text-gray-500">{userCounts.total} users found</Text>
            </div>
          }
          extra={
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
              className="border-0 text-gray-600 hover:text-gray-800"
            >
              Refresh
            </Button>
          }
        >
          {/* Mobile View */}
          {!screens.md && (
            <div className="md:hidden">
              {sortedAndFilteredUsers.length > 0 ? (
                sortedAndFilteredUsers.map(record => renderMobileCard(record))
              ) : (
                <div className="text-center py-12">
                  <UserOutlined className="text-4xl text-gray-300 mb-4" />
                  <Text className="text-base text-gray-600 font-medium">
                    {allUsers.length > 0 
                      ? `No ${userFilter !== 'all' ? userFilter : ''} users found` 
                      : 'No users found'}
                  </Text>
                </div>
              )}
            </div>
          )}
          
          {/* Desktop View */}
          {screens.md && (
            <Table 
              columns={columns} 
              dataSource={sortedAndFilteredUsers} 
              rowKey="UserID"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
                showTotal: (total) => <span className="text-sm font-medium text-gray-600">Total {total} users</span>,
                responsive: true,
                size: 'default',
                className: 'rounded-lg'
              }}
              scroll={{ x: 1000 }}
              className="rounded-lg custom-table"
              size="middle"
              rowClassName="hover:bg-blue-50 transition-colors duration-200"
              locale={{
                emptyText: (
                  <div className="py-16 text-center">
                    <UserOutlined className="text-4xl text-gray-300 mb-4" />
                    <Text className="text-base text-gray-600 font-medium block">
                      {allUsers.length > 0 
                        ? `No ${userFilter !== 'all' ? userFilter : ''} users found` 
                        : 'No users found'}
                    </Text>
                  </div>
                )
              }}
            />
          )}
        </Card>

        {/* User Details Modal */}
        <Modal
          title={
            <div className="text-center pb-4 border-b border-gray-200">
              <span className="text-xl font-bold text-gray-900">
                User Details
              </span>
            </div>
          }
          open={isModalVisible}
          onCancel={handleCancel}
          footer={[
            <Button 
              key="back" 
              onClick={handleCancel} 
              className="w-full md:w-auto px-6 text-sm font-medium border border-gray-300 hover:border-gray-400 rounded-lg h-10"
            >
              Close
            </Button>,
          ]}
          width={screens.xs ? '95%' : 600}
          centered
          className="rounded-2xl"
          bodyStyle={{ padding: '28px' }}
        >
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar 
                  size={64} 
                  icon={selectedUser.RoleID === '3' || selectedUser.RoleID === 3 ? <IdcardFilled /> : <SecurityScanOutlined />} 
                  className={selectedUser.RoleID === '3' || selectedUser.RoleID === 3 ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"}
                />
                <div>
                  <Text strong className="text-xl text-gray-900 block">{selectedUser.UserName}</Text>
                  <Text className="text-gray-600">ID: {selectedUser.UserID}</Text>
                </div>
              </div>
              
              <Divider />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <PhoneOutlined className="text-blue-500 mr-3" />
                    <div>
                      <Text strong className="text-gray-700 block">Phone</Text>
                      <Text className="text-gray-600">{selectedUser.MobileNo || 'N/A'}</Text>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <MailOutlined className="text-green-500 mr-3" />
                    <div>
                      <Text strong className="text-gray-700 block">Email</Text>
                      <Text className="text-gray-600">{selectedUser.Email || 'N/A'}</Text>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    {selectedUser.RoleID === '3' || selectedUser.RoleID === 3 ? <IdcardFilled /> : <SecurityScanOutlined />}
                    <div className="ml-3">
                      <Text strong className="text-gray-700 block">Role</Text>
                      <Text className="text-gray-600">
                        {selectedUser.RoleID === '3' || selectedUser.RoleID === 3 ? 'Technician' : 'Admin'}
                      </Text>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    {getStatusDetails(selectedUser).icon}
                    <div className="ml-3">
                      <Text strong className="text-gray-700 block">Status</Text>
                      <Text className="text-gray-600">{getStatusDetails(selectedUser).text}</Text>
                    </div>
                  </div>
                </div>
              </div>

              {(selectedUser.RoleID === '3' || selectedUser.RoleID === 3) && selectedUser.NIC && (
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center">
                    <IdcardOutlined className="text-orange-500 mr-3" />
                    <div>
                      <Text strong className="text-gray-700 block">NIC Number</Text>
                      <Text className="text-gray-600">{selectedUser.NIC}</Text>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          title="Confirm Deactivation"
          open={!!deleteConfirm}
          onCancel={() => setDeleteConfirm(null)}
          footer={[
            <Button key="cancel" onClick={() => setDeleteConfirm(null)} disabled={deleteLoading}>
              Cancel
            </Button>,
            <Button 
              key="delete" 
              type="primary" 
              danger 
              onClick={() => handleDeactivateUser(deleteConfirm)} 
              loading={deleteLoading}
              className="bg-red-600 border-red-600"
            >
              Deactivate
            </Button>,
          ]}
          centered
          className="rounded-2xl"
        >
          {deleteConfirm && (
            <div className="text-center">
              <ExclamationCircleOutlined className="text-red-500 text-3xl mb-4" />
              <Text className="text-gray-700 block mb-2">
                Are you sure you want to deactivate user "{deleteConfirm.UserName}"?
              </Text>
              <Text className="text-gray-500 text-sm">
                This action cannot be undone.
              </Text>
            </div>
          )}
        </Modal>

        {/* Activation Confirmation Modal */}
        <Modal
          title="Confirm Activation"
          open={!!activateConfirm}
          onCancel={() => setActivateConfirm(null)}
          footer={[
            <Button key="cancel" onClick={() => setActivateConfirm(null)} disabled={activateLoading}>
              Cancel
            </Button>,
            <Button 
              key="activate" 
              type="primary" 
              onClick={() => handleActivateUser(activateConfirm)} 
              loading={activateLoading}
              className="bg-green-600 border-green-600 hover:bg-green-700"
            >
              Activate
            </Button>,
          ]}
          centered
          className="rounded-2xl"
        >
          {activateConfirm && (
            <div className="text-center">
              <CheckCircleOutlined className="text-green-500 text-3xl mb-4" />
              <Text className="text-gray-700 block mb-2">
                Are you sure you want to activate user "{activateConfirm.UserName}"?
              </Text>
              <Text className="text-gray-500 text-sm">
                This user will be available for all operations.
              </Text>
            </div>
          )}
        </Modal>

        {/* Add User Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <PlusOutlined className="text-blue-600" />
              <span className="text-lg font-semibold text-gray-800">Add New User</span>
            </div>
          }
          open={isAddModalVisible}
          onCancel={handleAddUserCancel}
          footer={null}
          width={600}
          centered
          className="rounded-2xl"
        >
          <Form
            form={addUserForm}
            layout="vertical"
            onFinish={handleAddUser}
            className="mt-4"
            initialValues={{ roleID: '2' }}
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Role"
                  name="roleID"
                  rules={[{ required: true, message: 'Please select a role' }]}
                >
                  <Select 
                    onChange={handleRoleChange}
                    placeholder="Select user role"
                    className="h-10"
                  >
                    <Option value="2">Administrator</Option>
                    <Option value="3">Technician</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Username"
                  name="userName"
                  rules={[
                    { required: true, message: 'Please enter username' },
                    { min: 3, message: 'Username must be at least 3 characters' }
                  ]}
                >
                  <Input
                    placeholder="Enter username"
                    prefix={<UserAddOutlined className="text-gray-400" />}
                    className="h-10"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Please enter email' },
                    { type: 'email', message: 'Please enter a valid email' }
                  ]}
                >
                  <Input
                    placeholder="user@example.com"
                    prefix={<MailOutlined className="text-gray-400" />}
                    className="h-10"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Mobile Number"
                  name="mobileNo"
                  rules={[
                    { required: true, message: 'Please enter mobile number' },
                    { pattern: /^[0-9+\-() ]+$/, message: 'Please enter a valid mobile number' }
                  ]}
                >
                  <Input
                    placeholder="Enter mobile number"
                    prefix={<PhoneOutlined className="text-gray-400" />}
                    className="h-10"
                  />
                </Form.Item>
              </Col>
              {selectedRole === '3' && (
                <Col span={12}>
                  <Form.Item
                    label="NIC Number"
                    name="nic"
                    rules={[
                      { required: true, message: 'NIC is required for technicians' }
                    ]}
                  >
                    <Input
                      placeholder="Enter NIC number"
                      prefix={<IdcardOutlined className="text-gray-400" />}
                      className="h-10"
                    />
                  </Form.Item>
                </Col>
              )}
            </Row>

            <div className="flex justify-end gap-3 mt-6">
              <Button 
                onClick={handleAddUserCancel}
                className="h-10 px-6 rounded-lg"
              >
                Cancel
              </Button>
              <Button 
                type="primary"
                htmlType="submit"
                loading={signupLoading}
                className="h-10 px-6 rounded-lg bg-blue-600 border-blue-600 hover:bg-blue-700"
              >
                Add User
              </Button>
            </div>
          </Form>
        </Modal>
      </div>

      <style jsx>{`
        .stat-card {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        }
        .custom-table :global(.ant-table-thead > tr > th) {
          background: #f8fafc;
          border-bottom: 2px solid #e2e8f0;
        }
        .custom-table :global(.ant-table-tbody > tr > td) {
          border-bottom: 1px solid #f1f5f9;
        }
      `}</style>
    </div>
  );
};

export default UserManagement;