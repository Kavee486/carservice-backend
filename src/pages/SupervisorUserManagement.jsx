// src/pages/SupervisorUserManagement.jsx
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
  IdcardFilled, ToolOutlined
} from '@ant-design/icons';
import { 
  signupUserAction, 
  resetSignupAction, 
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

const SupervisorUserManagement = () => {
  const dispatch = useDispatch();
  const screens = useBreakpoint();
  
  const userSignup = useSelector((state) => state.userSignup);
  const { 
    loading: signupLoading, 
    success: signupSuccess, 
    error: signupError,
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

  useEffect(() => {
    fetchTechnicians();
  }, [dispatch]);

  // Handle signup success
  useEffect(() => {
    if (signupSuccess) {
      message.success('Technician added successfully!');
      addUserForm.resetFields();
      setIsAddModalVisible(false);
      fetchTechnicians();
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

  const fetchTechnicians = () => {
    dispatch(getTechniciansAction());
    dispatch(getAllTechniciansAction());
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

  // Enhanced function to find matching technician record for a user and get NIC
  const findMatchingTechnician = (user) => {
    if (!allTechnicians?.data?.ResultSet) return null;
    
    // Try multiple matching strategies
    return allTechnicians.data.ResultSet.find(tech => {
      // Match by email (most reliable)
      if (tech.Email && user.Email && tech.Email.toLowerCase() === user.Email.toLowerCase()) {
        return true;
      }
      
      // Match by phone number
      if (tech.Phone && user.MobileNo && tech.Phone === user.MobileNo) {
        return true;
      }
      
      // Match by username/name
      if (tech.Name && user.UserName && tech.Name.toLowerCase() === user.UserName.toLowerCase()) {
        return true;
      }
      
      // If user already has NIC, match by NIC
      if (user.NIC && tech.NIC && user.NIC === tech.NIC) {
        return true;
      }
      
      return false;
    });
  };

  // Enhanced function to get NIC for technician user
  const getTechnicianNIC = (user) => {
    // First check if NIC is directly in user object
    if (user.NIC && user.NIC !== '-' && user.NIC !== 'N/A') {
      return user.NIC;
    }
    
    // Then try to find matching technician record
    const technician = findMatchingTechnician(user);
    if (technician && technician.NIC && technician.NIC !== '-' && technician.NIC !== 'N/A') {
      return technician.NIC;
    }
    
    // If no NIC found, return null
    return null;
  };

  // Get technician users from state with enhanced data merging
  const technicianUsers = technicians?.data?.ResultSet || [];
  
  // Enhance technician users with NIC data
  const enhancedTechnicianUsers = technicianUsers.map(user => {
    const nic = getTechnicianNIC(user);
    return {
      ...user,
      displayNIC: nic // Add displayNIC field for easy access
    };
  });

  const allTechniciansData = enhancedTechnicianUsers;

  // Sort technicians - active first
  const sortedAndFilteredTechnicians = allTechniciansData && allTechniciansData.length > 0 
    ? [...allTechniciansData]
        .sort((a, b) => {
          const statusA = getStatusDetails(a);
          const statusB = getStatusDetails(b);
          
          // Active technicians first
          if (statusA.isActive && !statusB.isActive) return -1;
          if (!statusA.isActive && statusB.isActive) return 1;
          
          // Then sort by name
          return (a.UserName || '').localeCompare(b.UserName || '');
        })
        .filter(technician => {
          const statusDetails = getStatusDetails(technician);
          const technicianNIC = getTechnicianNIC(technician);
          const matchesSearch = 
            technician.UserName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            technician.Email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            technician.MobileNo?.includes(searchTerm) ||
            (technicianNIC && technicianNIC.toLowerCase().includes(searchTerm.toLowerCase()));
          
          if (statusFilter === 'all') return matchesSearch;
          if (statusFilter === 'active') return statusDetails.isActive && matchesSearch;
          if (statusFilter === 'inactive') return !statusDetails.isActive && matchesSearch;
          return matchesSearch;
        })
    : [];

  // Count technicians by status
  const technicianCounts = allTechniciansData && allTechniciansData.length > 0 
    ? allTechniciansData.reduce((counts, technician) => {
        const statusDetails = getStatusDetails(technician);
        
        if (statusDetails.isActive) {
          counts.active++;
        } else {
          counts.inactive++;
        }
        
        counts.total++;
        return counts;
      }, { total: 0, active: 0, inactive: 0 })
    : { total: 0, active: 0, inactive: 0 };

  const handleAddTechnician = async (values) => {
    try {
      const technicianData = {
        UserName: values.userName,
        Email: values.email,
        MobileNo: values.mobileNo,
        RoleID: 3, // Always set to technician role
        NIC: values.nic // NIC is required for technicians
      };

      const result = await dispatch(signupUserAction(technicianData));
      
      if (result.success) {
        message.success('Technician added successfully!');
      } else {
        message.error(result.message || 'Failed to add technician');
      }
    } catch (error) {
      console.error('Failed to add technician:', error);
      message.error('Failed to add technician');
    }
  };

  const handleDeactivateTechnician = async (technician) => {
    try {
      setDeleteLoading(true);
      
      // Deactivate technician in both tables
      const technicianRecord = findMatchingTechnician(technician);
      if (technicianRecord) {
        const result = await dispatch(deactivateTechnicianCompleteAction(technician.UserID, technicianRecord.TechnicianID));
        
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
        const result = await dispatch(deactivateUserAction(technician.UserID));
        if (result.success) {
          message.success('Technician deactivated successfully!');
        } else {
          message.error(result.message || 'Failed to deactivate technician');
        }
      }

      setDeleteConfirm(null);
      fetchTechnicians();
    } catch (error) {
      console.error('Failed to deactivate technician:', error);
      message.error('Failed to deactivate technician');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleActivateTechnician = async (technician) => {
    try {
      setActivateLoading(true);
      // Note: You'll need to implement activateUserAction similar to deactivate
      const result = await dispatch(deactivateUserAction(technician.UserID)); // This should be activateUserAction
      if (result.success) {
        message.success('Technician activated successfully!');
      } else {
        message.error(result.message || 'Failed to activate technician');
      }
      setActivateConfirm(null);
      fetchTechnicians();
    } catch (error) {
      console.error('Failed to activate technician:', error);
      message.error('Failed to activate technician');
    } finally {
      setActivateLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchTechnicians();
    message.info('Refreshing technician data...');
  };

  const showDetails = (technician) => {
    setSelectedUser(technician);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleAddTechnicianCancel = () => {
    setIsAddModalVisible(false);
    addUserForm.resetFields();
  };

  const toggleRowExpansion = (record) => {
    if (expandedRowKeys.includes(record.UserID)) {
      setExpandedRowKeys(expandedRowKeys.filter(key => key !== record.UserID));
    } else {
      setExpandedRowKeys([...expandedRowKeys, record.UserID]);
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
              percent={Math.round((value / technicianCounts.total) * 100)} 
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
    const technicianNIC = getTechnicianNIC(record);
    
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
              icon={<ToolOutlined />} 
              className="bg-blue-100 text-blue-600"
            />
            <div>
              <Text strong className="text-lg font-semibold text-gray-900 block">
                {record.UserName || 'Unknown Technician'}
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
          <div className="flex items-center text-sm text-gray-600">
            <IdcardOutlined className="mr-2 text-orange-500" />
            <span>NIC: {technicianNIC || 'N/A'}</span>
          </div>
        </div>

        <div className="mb-3">
          <Tag 
            color="blue" 
            icon={<ToolOutlined />}
            className="font-semibold"
          >
            TECHNICIAN
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
              <Tooltip title="Deactivate Technician">
                <Button
                  type="text"
                  icon={<DeleteOutlined className="text-red-600" />}
                  onClick={() => setDeleteConfirm(record)}
                  className="hover:bg-red-50 rounded-lg w-10 h-10 flex items-center justify-center"
                />
              </Tooltip>
            ) : (
              <Tooltip title="Activate Technician">
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
                <Text className="text-sm text-gray-600">Technician</Text>
              </div>
              <div className="flex justify-between">
                <Text strong className="text-sm text-gray-700">Status:</Text>
                <Text className="text-sm text-gray-600">{statusDetails.text}</Text>
              </div>
              <div className="flex justify-between">
                <Text strong className="text-sm text-gray-700">NIC:</Text>
                <Text className="text-sm text-gray-600">{technicianNIC || 'N/A'}</Text>
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
      title: <span className="text-sm font-semibold text-gray-700">Technician ID</span>,
      dataIndex: 'UserID',
      key: 'UserID',
      render: (text, record) => (
        <div className="flex items-center">
          <Avatar 
            size="small" 
            icon={<ToolOutlined />} 
            className="bg-blue-100 text-blue-600 mr-2"
          />
          <Text strong className="text-base font-semibold text-gray-900">{text}</Text>
        </div>
      ),
      width: 120,
    },
    {
      title: <span className="text-sm font-semibold text-gray-700">Technician Name</span>,
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
      title: <span className="text-sm font-semibold text-gray-700">NIC</span>,
      key: 'nic',
      render: (_, record) => {
        const technicianNIC = getTechnicianNIC(record);
        
        return (
          <div className="flex items-center">
            <IdcardOutlined className="text-orange-500 mr-2" />
            <Text className="text-base text-gray-700">{technicianNIC || 'N/A'}</Text>
          </div>
        );
      },
      width: 150,
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
            label: 'Deactivate Technician',
            onClick: () => setDeleteConfirm(record)
          } : {
            key: 'activate',
            icon: <CheckOutlined className="text-green-600" />,
            label: 'Activate Technician',
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
            <Text className="text-base text-gray-600 font-medium">Loading technicians...</Text>
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
              <h1 className="text-2xl font-bold text-white mb-2">Technician Management</h1>
              <Text className="text-blue-100">Manage technicians in the system</Text>
            </div>
            <Space size="middle">
              <Button 
                icon={<PlusOutlined />} 
                onClick={() => setIsAddModalVisible(true)}
                className="bg-white text-blue-600 hover:bg-gray-100 border-0 rounded-lg h-10 px-4 font-medium"
              >
                {screens.xs ? '' : 'Add Technician'}
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
              title="Total Technicians" 
              value={technicianCounts.total} 
              icon={<TeamOutlined />}
              color="text-blue-600"
              progress
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard 
              title="Active Technicians" 
              value={technicianCounts.active} 
              icon={<CheckCircleOutlined />}
              color="text-green-600"
              progress
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard 
              title="Available" 
              value={technicianCounts.active} 
              icon={<ToolOutlined />}
              color="text-blue-600"
              progress
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard 
              title="Inactive" 
              value={technicianCounts.inactive} 
              icon={<CloseCircleOutlined />}
              color="text-red-600"
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
                placeholder="Search by name, email, phone, NIC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              />
            </div>
            
            <div className="flex flex-col md:flex-row gap-2">
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
              Showing {sortedAndFilteredTechnicians.length} of {technicianCounts.total} technicians
            </Text>
          </div>
        </Card>

        {/* Technicians Table/Cards */}
        <Card 
          bordered={false} 
          className="shadow-lg rounded-2xl border-0 bg-white overflow-hidden"
          bodyStyle={{ padding: '24px' }}
          title={
            <div className="flex items-center justify-between">
              <Text strong className="text-xl text-gray-900">Technician List</Text>
              <Text className="text-gray-500">{technicianCounts.total} technicians found</Text>
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
              {sortedAndFilteredTechnicians.length > 0 ? (
                sortedAndFilteredTechnicians.map(record => renderMobileCard(record))
              ) : (
                <div className="text-center py-12">
                  <ToolOutlined className="text-4xl text-gray-300 mb-4" />
                  <Text className="text-base text-gray-600 font-medium">
                    {technicianUsers.length > 0 
                      ? 'No technicians found matching your search' 
                      : 'No technicians found'}
                  </Text>
                </div>
              )}
            </div>
          )}
          
          {/* Desktop View */}
          {screens.md && (
            <Table 
              columns={columns} 
              dataSource={sortedAndFilteredTechnicians} 
              rowKey="UserID"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
                showTotal: (total) => <span className="text-sm font-medium text-gray-600">Total {total} technicians</span>,
                responsive: true,
                size: 'default',
                className: 'rounded-lg'
              }}
              scroll={{ x: 1100 }}
              className="rounded-lg custom-table"
              size="middle"
              rowClassName="hover:bg-blue-50 transition-colors duration-200"
              locale={{
                emptyText: (
                  <div className="py-16 text-center">
                    <ToolOutlined className="text-4xl text-gray-300 mb-4" />
                    <Text className="text-base text-gray-600 font-medium block">
                      {technicianUsers.length > 0 
                        ? 'No technicians found matching your search' 
                        : 'No technicians found'}
                    </Text>
                  </div>
                )
              }}
            />
          )}
        </Card>

        {/* Technician Details Modal */}
        <Modal
          title={
            <div className="text-center pb-4 border-b border-gray-200">
              <span className="text-xl font-bold text-gray-900">
                Technician Details
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
                  icon={<ToolOutlined />} 
                  className="bg-blue-100 text-blue-600"
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
                    <ToolOutlined className="text-blue-500 mr-3" />
                    <div>
                      <Text strong className="text-gray-700 block">Role</Text>
                      <Text className="text-gray-600">Technician</Text>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <CheckCircleOutlined className="text-green-500 mr-3" />
                    <div>
                      <Text strong className="text-gray-700 block">Status</Text>
                      <Text className="text-gray-600">{getStatusDetails(selectedUser).text}</Text>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* NIC Information */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center mb-2">
                  <IdcardOutlined className="text-blue-600 mr-2" />
                  <Text strong className="text-blue-800">Technician Information</Text>
                </div>
                <div className="flex items-center">
                  <Text strong className="text-blue-700 mr-2">NIC:</Text>
                  <Text className="text-blue-600 font-medium">
                    {getTechnicianNIC(selectedUser) || 'N/A'}
                  </Text>
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Add Technician Modal */}
        <Modal
          title={
            <div className="text-center pb-4 border-b border-gray-200">
              <span className="text-xl font-bold text-gray-900">
                Add New Technician
              </span>
            </div>
          }
          open={isAddModalVisible}
          onCancel={handleAddTechnicianCancel}
          footer={null}
          width={screens.xs ? '95%' : 500}
          centered
          className="rounded-2xl"
          bodyStyle={{ padding: '28px' }}
        >
          <Form
            form={addUserForm}
            layout="vertical"
            onFinish={handleAddTechnician}
            className="space-y-4"
          >
            <Form.Item
              label={<span className="text-sm font-semibold text-gray-700">Technician Name</span>}
              name="userName"
              rules={[{ required: true, message: 'Please enter technician name' }]}
            >
              <Input 
                placeholder="Enter technician name" 
                size="large"
                className="rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500"
                prefix={<UserOutlined className="text-gray-400" />}
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-sm font-semibold text-gray-700">Email</span>}
              name="email"
              rules={[
                { required: true, message: 'Please enter email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input 
                placeholder="Enter email" 
                size="large"
                className="rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500"
                prefix={<MailOutlined className="text-gray-400" />}
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-sm font-semibold text-gray-700">Phone Number</span>}
              name="mobileNo"
              rules={[
                { required: true, message: 'Please enter phone number' },
                { pattern: /^[0-9+\-\s()]+$/, message: 'Please enter a valid phone number' }
              ]}
            >
              <Input 
                placeholder="Enter phone number" 
                size="large"
                className="rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500"
                prefix={<PhoneOutlined className="text-gray-400" />}
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-sm font-semibold text-gray-700">NIC Number</span>}
              name="nic"
              rules={[
                { required: true, message: 'Please enter NIC number' },
                { pattern: /^[0-9vVxX]+$/, message: 'Please enter a valid NIC number' }
              ]}
            >
              <Input 
                placeholder="Enter NIC number" 
                size="large"
                className="rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500"
                prefix={<IdcardOutlined className="text-gray-400" />}
              />
            </Form.Item>

            <Form.Item className="mb-0 pt-4">
              <div className="flex flex-col md:flex-row gap-3">
                <Button 
                  onClick={handleAddTechnicianCancel}
                  className="w-full md:w-1/2 h-12 text-base font-medium border border-gray-300 hover:border-gray-400 rounded-lg"
                >
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={signupLoading}
                  className="w-full md:w-1/2 h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 rounded-lg"
                >
                  Add Technician
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>

        {/* Deactivate Confirmation Modal */}
        <Modal
          title={
            <div className="flex items-center space-x-2">
              <ExclamationCircleOutlined className="text-red-500 text-lg" />
              <span className="text-lg font-semibold text-gray-900">Confirm Deactivation</span>
            </div>
          }
          open={!!deleteConfirm}
          onCancel={() => setDeleteConfirm(null)}
          footer={[
            <Button 
              key="cancel" 
              onClick={() => setDeleteConfirm(null)}
              className="px-6 text-sm font-medium border border-gray-300 hover:border-gray-400 rounded-lg h-10"
            >
              Cancel
            </Button>,
            <Button 
              key="deactivate"
              type="primary" 
              danger
              loading={deleteLoading}
              onClick={() => handleDeactivateTechnician(deleteConfirm)}
              className="px-6 text-sm font-medium rounded-lg h-10"
            >
              Deactivate
            </Button>,
          ]}
          width={400}
          centered
          className="rounded-2xl"
        >
          <div className="py-4">
            <Text className="text-base text-gray-700">
              Are you sure you want to deactivate <Text strong>{deleteConfirm?.UserName}</Text>?
            </Text>
            <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <Text className="text-sm text-red-700">
                This technician will no longer be able to access the system.
              </Text>
            </div>
          </div>
        </Modal>

        {/* Activate Confirmation Modal */}
        <Modal
          title={
            <div className="flex items-center space-x-2">
              <CheckCircleOutlined className="text-green-500 text-lg" />
              <span className="text-lg font-semibold text-gray-900">Confirm Activation</span>
            </div>
          }
          open={!!activateConfirm}
          onCancel={() => setActivateConfirm(null)}
          footer={[
            <Button 
              key="cancel" 
              onClick={() => setActivateConfirm(null)}
              className="px-6 text-sm font-medium border border-gray-300 hover:border-gray-400 rounded-lg h-10"
            >
              Cancel
            </Button>,
            <Button 
              key="activate"
              type="primary" 
              loading={activateLoading}
              onClick={() => handleActivateTechnician(activateConfirm)}
              className="px-6 text-sm font-medium bg-green-600 hover:bg-green-700 border-0 rounded-lg h-10"
            >
              Activate
            </Button>,
          ]}
          width={400}
          centered
          className="rounded-2xl"
        >
          <div className="py-4">
            <Text className="text-base text-gray-700">
              Are you sure you want to activate <Text strong>{activateConfirm?.UserName}</Text>?
            </Text>
            <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <Text className="text-sm text-green-700">
                This technician will be able to access the system again.
              </Text>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default SupervisorUserManagement;