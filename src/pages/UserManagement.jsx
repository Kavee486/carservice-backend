// src/pages/UserManagement.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  signupUserAction, 
  resetSignupAction, 
  getAdminsAction, 
  getTechniciansAction,
  updateUserAction,
  deactivateUserAction,
} from '../actions/userActions';
import { 
  Table, Button, Modal, Form, Input, Card, Space, Typography, 
  message, Spin, Grid, Tag, Avatar, Row, Col, Select, Segmented,
  Dropdown, Menu, Divider, Tooltip, Progress
} from 'antd';
import { 
  UserAddOutlined, TeamOutlined, SecurityScanOutlined, 
  UserSwitchOutlined, ReloadOutlined, EyeOutlined,
  MailOutlined, PhoneOutlined, IdcardOutlined,
  CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined,
  FilterOutlined, EditOutlined,
  CheckOutlined, CloseOutlined, SearchOutlined, MoreOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

// Notification Component
const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleOutlined className="text-green-600" />;
      case 'error':
        return <CloseCircleOutlined className="text-red-600" />;
      default:
        return <ExclamationCircleOutlined className="text-yellow-600" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className={`flex items-center p-4 rounded-lg border shadow-lg ${getStyles()}`}>
        <div className="mr-3 text-lg">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm capitalize">{type}</p>
          <p className="text-sm">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-gray-500 hover:text-gray-700 text-lg"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

const UserManagement = () => {
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [userFilter, setUserFilter] = useState('all'); // 'all', 'admins', 'technicians'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [searchText, setSearchText] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [deactivateConfirm, setDeactivateConfirm] = useState(null);
  const [deactivateLoading, setDeactivateLoading] = useState(false);

  const dispatch = useDispatch();
  const screens = useBreakpoint();
  
  const userSignup = useSelector((state) => state.userSignup);
  const { 
    loading: signupLoading, 
    success: signupSuccess, 
    error: signupError,
    admins,
    technicians 
  } = userSignup;

  useEffect(() => {
    fetchAllUsers();
  }, [dispatch]);

  // Handle signup success
  useEffect(() => {
    if (signupSuccess) {
      setNotification({
        show: true,
        message: 'User added successfully!',
        type: 'success',
      });
      form.resetFields();
      setIsModalVisible(false);
      fetchAllUsers();
      dispatch(resetSignupAction());
    }
  }, [signupSuccess, dispatch, form]);

  // Handle signup error
  useEffect(() => {
    if (signupError) {
      setNotification({
        show: true,
        message: signupError,
        type: 'error',
      });
      dispatch(resetSignupAction());
    }
  }, [signupError, dispatch]);

  const fetchAllUsers = () => {
    dispatch(getAdminsAction());
    dispatch(getTechniciansAction());
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

  const handleAddUser = async (values) => {
    try {
      setLoading(true);
      
      const userData = {
        UserName: values.userName,
        Email: values.email,
        MobileNo: values.mobileNo,
        RoleID: Number(values.roleID)
      };

      const result = await dispatch(signupUserAction(userData));
      
      if (result.success) {
        message.success('User added successfully!');
      } else {
        message.error(result.message || 'Failed to add user');
      }
    } catch (error) {
      console.error('Failed to add user:', error);
      message.error('Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (values) => {
    try {
      setEditLoading(true);
      
      const userData = {
        UserID: selectedUser.UserID,
        UserName: values.userName,
        Email: values.email,
        MobileNo: values.mobileNo,
        RoleID: Number(values.roleID)
      };

      console.log('Updating user with data:', userData);

      const result = await dispatch(updateUserAction(userData));
      
      if (result.success) {
        message.success('User updated successfully!');
        setIsEditModalVisible(false);
        setSelectedUser(null);
        editForm.resetFields();
        fetchAllUsers();
      } else {
        message.error(result.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      message.error('Failed to update user');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeactivateUser = async (user) => {
    try {
      setDeactivateLoading(true);
      console.log('Deactivating user:', user.UserID);
      
      const result = await dispatch(deactivateUserAction(user.UserID));
      
      if (result.success) {
        message.success('User deactivated successfully!');
        setDeactivateConfirm(null);
        fetchAllUsers();
      } else {
        message.error(result.message || 'Failed to deactivate user');
      }
    } catch (error) {
      console.error('Failed to deactivate user:', error);
      message.error('Failed to deactivate user');
    } finally {
      setDeactivateLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAllUsers();
    message.info('Refreshing user data...');
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    editForm.setFieldsValue({
      userName: user.UserName,
      email: user.Email,
      mobileNo: user.MobileNo,
      roleID: user.RoleID?.toString()
    });
    setIsEditModalVisible(true);
  };

  // Get user data from state
  const adminUsers = admins?.data?.ResultSet || [];
  const technicianUsers = technicians?.data?.ResultSet || [];
  const allUsers = [...adminUsers, ...technicianUsers];

  // Filter users based on selected filter and search text
  const getFilteredUsers = () => {
    let filteredUsers = allUsers;

    // Apply role filter
    if (userFilter === 'admins') {
      filteredUsers = adminUsers;
    } else if (userFilter === 'technicians') {
      filteredUsers = technicianUsers;
    }

    // Apply status filter
    if (statusFilter === 'active') {
      filteredUsers = filteredUsers.filter(user => getStatusDetails(user).isActive);
    } else if (statusFilter === 'inactive') {
      filteredUsers = filteredUsers.filter(user => !getStatusDetails(user).isActive);
    }

    // Apply search filter
    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.UserName?.toLowerCase().includes(lowerSearch) ||
        user.Email?.toLowerCase().includes(lowerSearch) ||
        user.MobileNo?.includes(lowerSearch) ||
        user.UserID?.toString().includes(lowerSearch)
      );
    }

    return filteredUsers;
  };

  const filteredUsers = getFilteredUsers();

  // Count users by status
  const userCounts = allUsers.reduce((counts, user) => {
    const statusDetails = getStatusDetails(user);
    
    if (statusDetails.isActive) {
      counts.active++;
    } else {
      counts.inactive++;
    }
    
    counts.total++;
    return counts;
  }, { total: 0, active: 0, inactive: 0 });

  const loadingUsers = admins?.loading || technicians?.loading;

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

  const columns = [
    {
      title: <span className="text-sm font-semibold text-gray-700">User ID</span>,
      dataIndex: 'UserID',
      key: 'UserID',
      render: (text) => (
        <div className="flex items-center">
          <Avatar size="small" icon={<IdcardOutlined />} className="bg-blue-100 text-blue-600 mr-2" />
          <Text strong className="text-base font-semibold text-gray-900">#{text}</Text>
        </div>
      ),
      width: 120,
    },
    {
      title: <span className="text-sm font-semibold text-gray-700">Name</span>,
      dataIndex: 'UserName',
      key: 'UserName',
      render: (text) => <Text className="text-base font-medium text-gray-800">{text || 'N/A'}</Text>,
      width: 150,
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
      title: <span className="text-sm font-semibold text-gray-700">Mobile</span>,
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
      title: <span className="text-sm font-semibold text-gray-700">Role</span>,
      key: 'RoleID',
      render: (_, record) => {
        const isAdmin = record.RoleID === '2' || record.RoleID === 2;
        return (
          <Tag 
            color={isAdmin ? 'green' : 'purple'} 
            icon={isAdmin ? <SecurityScanOutlined /> : <UserSwitchOutlined />}
            className="font-semibold"
          >
            {isAdmin ? 'Admin' : 'Technician'}
          </Tag>
        );
      },
      width: 120,
    },
    {
      title: <span className="text-sm font-semibold text-gray-700">Status</span>,
      key: 'Status',
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
      width: 120,
    },
    {
      title: <span className="text-sm font-semibold text-gray-700">Actions</span>,
      key: 'actions',
      width: 150,
      render: (_, record) => {
        const statusDetails = getStatusDetails(record);
        
        const menuItems = [
          {
            key: 'edit',
            icon: <EditOutlined className="text-blue-600" />,
            label: 'Edit User',
            onClick: () => openEditModal(record)
          },
        ];

        // Only show deactivate option for active users
        if (statusDetails.isActive) {
          menuItems.push(
            { type: 'divider' },
            {
              key: 'deactivate',
              icon: <CloseOutlined className="text-red-600" />,
              label: 'Deactivate User',
              onClick: () => setDeactivateConfirm(record)
            }
          );
        }

        return (
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
              icon={<MoreOutlined className="text-gray-600" />} 
              className="hover:bg-gray-50 rounded-lg w-10 h-10 flex items-center justify-center"
            />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 md:px-6 py-4 md:py-6">
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ show: false, message: '', type: '' })}
        />
      )}
      
      <div className="space-y-6">
        {/* Header Section */}
        <Card 
          bordered={false} 
          className="shadow-lg rounded-2xl border-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white"
          bodyStyle={{ padding: '24px' }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Title level={2} className="text-white mb-2">User Management</Title>
              <Text className="text-blue-100">
                Add admins and technicians to the system. Customers register through the signup page.
              </Text>
            </div>
            
            <Space size="middle">
              <Button 
                icon={<UserAddOutlined />} 
                onClick={() => setIsModalVisible(true)}
                className="bg-white-600 hover:bg-white-700 text-blue border-0 rounded-lg h-10 px-4 font-medium"
              >
                {screens.xs ? '' : 'Add User'}
              </Button>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={handleRefresh}
                loading={loadingUsers}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-0 rounded-lg h-10 px-4 font-medium backdrop-blur-sm"
              >
                {screens.xs ? '' : 'Refresh'}
              </Button>
            </Space>
          </div>
        </Card>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <StatCard 
              title="Total Users" 
              value={userCounts.total} 
              icon={<TeamOutlined />}
              color="text-blue-600"
              progress
            />
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <StatCard 
              title="Active Users" 
              value={userCounts.active} 
              icon={<CheckCircleOutlined />}
              color="text-green-600"
              progress
            />
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <StatCard 
              title="Inactive Users" 
              value={userCounts.inactive} 
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
                placeholder="Search by name, email, phone..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              />
            </div>
            
            <div>
              <Space size="small">
                <Button
                  onClick={() => setStatusFilter('all')}
                  type={statusFilter === 'all' ? 'primary' : 'default'}
                  className={`rounded-lg h-8 font-medium ${
                    statusFilter === 'all' 
                      ? 'bg-blue-600 border-blue-600' 
                      : 'border-gray-300'
                  }`}
                >
                  All ({userCounts.total})
                </Button>
                <Button
                  onClick={() => setStatusFilter('active')}
                  type={statusFilter === 'active' ? 'primary' : 'default'}
                  className={`rounded-lg h-8 font-medium ${
                    statusFilter === 'active' 
                      ? 'bg-green-600 border-green-600' 
                      : 'border-gray-300'
                  }`}
                >
                  Active ({userCounts.active})
                </Button>
                <Button
                  onClick={() => setStatusFilter('inactive')}
                  type={statusFilter === 'inactive' ? 'primary' : 'default'}
                  className={`rounded-lg h-8 font-medium ${
                    statusFilter === 'inactive' 
                      ? 'bg-red-600 border-red-600' 
                      : 'border-gray-300'
                  }`}
                >
                  Inactive ({userCounts.inactive})
                </Button>
              </Space>
            </div>
          </div>
          
          <div className="mt-2">
            <Text className="text-xs font-medium text-gray-600">
              Showing {filteredUsers.length} of {userCounts.total} users
            </Text>
          </div>
        </Card>

        {/* User List */}
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
            <Space size="middle">
              <Segmented
                options={[
                  { label: 'All Users', value: 'all' },
                  { label: 'Admins', value: 'admins' },
                  { label: 'Technicians', value: 'technicians' },
                ]}
                value={userFilter}
                onChange={setUserFilter}
                className="hidden sm:block"
              />
              <Button 
                icon={<ReloadOutlined />} 
                onClick={handleRefresh}
                loading={loadingUsers}
                className="border-0 text-gray-600 hover:text-gray-800"
              >
                Refresh
              </Button>
            </Space>
          }
        >
          {/* Mobile Filter */}
          <div className="sm:hidden mb-4">
            <Segmented
              options={[
                { label: 'All', value: 'all' },
                { label: 'Admins', value: 'admins' },
                { label: 'Techs', value: 'technicians' },
              ]}
              value={userFilter}
              onChange={setUserFilter}
              block
            />
          </div>

          {/* Desktop View */}
          {screens.md && (
            loadingUsers ? (
              <div className="text-center py-12">
                <Spin size="large" className="text-blue-600" />
                <div className="mt-4">
                  <Text className="text-base text-gray-600 font-medium">Loading users...</Text>
                </div>
              </div>
            ) : filteredUsers.length > 0 ? (
              <Table 
                columns={columns} 
                dataSource={filteredUsers} 
                rowKey="UserID"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50'],
                  showTotal: (total, range) => (
                    <span className="text-sm font-medium text-gray-600">
                      Showing {range[0]}-{range[1]} of {total} users
                    </span>
                  ),
                  responsive: true,
                  size: 'default',
                }}
                scroll={{ x: 1000 }}
                className="rounded-lg custom-table"
                size="middle"
                rowClassName="hover:bg-blue-50 transition-colors duration-200"
              />
            ) : (
              <div className="text-center py-16">
                <TeamOutlined className="text-4xl text-gray-300 mb-4" />
                <Text className="text-base text-gray-600 font-medium block mb-2">
                  {searchText || userFilter !== 'all' || statusFilter !== 'all'
                    ? 'No users match your search criteria' 
                    : 'No users found in the system'
                  }
                </Text>
                {(searchText || userFilter !== 'all' || statusFilter !== 'all') && (
                  <Text className="text-sm text-gray-500 block mb-4">
                    Try adjusting your search or filter settings
                  </Text>
                )}
                <Space>
                  {(searchText || userFilter !== 'all' || statusFilter !== 'all') && (
                    <Button 
                      onClick={() => {
                        setSearchText('');
                        setUserFilter('all');
                        setStatusFilter('all');
                      }}
                      className="border-gray-300 rounded-lg h-10 px-6 font-medium"
                    >
                      Clear Filters
                    </Button>
                  )}
                  <Button 
                    onClick={handleRefresh}
                    icon={<ReloadOutlined />}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 rounded-lg h-10 px-6 font-medium"
                  >
                    Refresh Users
                  </Button>
                </Space>
              </div>
            )
          )}
        </Card>

        {/* Add User Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <UserAddOutlined className="text-blue-600" />
              <span className="text-lg font-semibold text-gray-800">Add New User</span>
            </div>
          }
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          width={600}
          centered
          className="rounded-2xl"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddUser}
            className="mt-4"
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="User Name"
                  name="userName"
                  rules={[
                    { required: true, message: 'Please enter user name' },
                    { min: 2, message: 'Name must be at least 2 characters' }
                  ]}
                >
                  <Input
                    placeholder="Enter user name"
                    prefix={<IdcardOutlined className="text-gray-400" />}
                    className="h-10"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Email Address"
                  name="email"
                  rules={[
                    { required: true, message: 'Please enter email address' },
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
              <Col span={12}>
                <Form.Item
                  label="Mobile Number"
                  name="mobileNo"
                  rules={[
                    { required: true, message: 'Please enter mobile number' },
                    { pattern: /^[0-9]{10}$/, message: 'Mobile number must be 10 digits' }
                  ]}
                >
                  <Input
                    placeholder="0771234567"
                    prefix={<PhoneOutlined className="text-gray-400" />}
                    className="h-10"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Role"
                  name="roleID"
                  initialValue="2"
                  rules={[{ required: true, message: 'Please select role' }]}
                >
                  <Select className="h-10">
                    <Option value="2">Admin</Option>
                    <Option value="3">Technician</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <div className="flex justify-end gap-3 mt-6">
              <Button 
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                }}
                className="h-10 px-6 rounded-lg"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="primary"
                htmlType="submit"
                loading={loading}
                className="h-10 px-6 rounded-lg bg-blue-600 border-blue-600 hover:bg-blue-700"
              >
                Add User
              </Button>
            </div>
          </Form>
        </Modal>

        {/* Edit User Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <EditOutlined className="text-blue-600" />
              <span className="text-lg font-semibold text-gray-800">Edit User</span>
            </div>
          }
          open={isEditModalVisible}
          onCancel={() => {
            setIsEditModalVisible(false);
            setSelectedUser(null);
            editForm.resetFields();
          }}
          footer={null}
          width={600}
          centered
          className="rounded-2xl"
        >
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleEditUser}
            className="mt-4"
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="User Name"
                  name="userName"
                  rules={[
                    { required: true, message: 'Please enter user name' },
                    { min: 2, message: 'Name must be at least 2 characters' }
                  ]}
                >
                  <Input
                    placeholder="Enter user name"
                    prefix={<IdcardOutlined className="text-gray-400" />}
                    className="h-10"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Email Address"
                  name="email"
                  rules={[
                    { required: true, message: 'Please enter email address' },
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
              <Col span={12}>
                <Form.Item
                  label="Mobile Number"
                  name="mobileNo"
                  rules={[
                    { required: true, message: 'Please enter mobile number' },
                    { pattern: /^[0-9]{10}$/, message: 'Mobile number must be 10 digits' }
                  ]}
                >
                  <Input
                    placeholder="0771234567"
                    prefix={<PhoneOutlined className="text-gray-400" />}
                    className="h-10"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Role"
                  name="roleID"
                  rules={[{ required: true, message: 'Please select role' }]}
                >
                  <Select className="h-10">
                    <Option value="2">Admin</Option>
                    <Option value="3">Technician</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <div className="flex justify-end gap-3 mt-6">
              <Button 
                onClick={() => {
                  setIsEditModalVisible(false);
                  setSelectedUser(null);
                  editForm.resetFields();
                }}
                className="h-10 px-6 rounded-lg"
                disabled={editLoading}
              >
                Cancel
              </Button>
              <Button 
                type="primary"
                htmlType="submit"
                loading={editLoading}
                className="h-10 px-6 rounded-lg bg-blue-600 border-blue-600 hover:bg-blue-700"
              >
                Update User
              </Button>
            </div>
          </Form>
        </Modal>

        {/* Deactivate Confirmation Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <ExclamationCircleOutlined className="text-yellow-600" />
              <span className="text-lg font-semibold text-gray-800">Confirm Deactivation</span>
            </div>
          }
          open={!!deactivateConfirm}
          onCancel={() => setDeactivateConfirm(null)}
          footer={[
            <Button 
              key="cancel" 
              onClick={() => setDeactivateConfirm(null)}
              className="h-10 px-6 rounded-lg"
              disabled={deactivateLoading}
            >
              Cancel
            </Button>,
            <Button 
              key="deactivate"
              type="primary"
              danger
              loading={deactivateLoading}
              onClick={() => handleDeactivateUser(deactivateConfirm)}
              className="h-10 px-6 rounded-lg"
            >
              Deactivate User
            </Button>,
          ]}
          width={500}
          centered
          className="rounded-2xl"
        >
          <div className="my-4">
            <Text className="text-base text-gray-700">
              Are you sure you want to deactivate <strong>{deactivateConfirm?.UserName}</strong>?
            </Text>
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Text className="text-sm text-yellow-800">
                <strong>Note:</strong> Deactivated users will not be able to access the system until they are reactivated.
              </Text>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default UserManagement;