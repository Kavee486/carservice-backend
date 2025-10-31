import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Table, Button, Modal, Form, Input, Card, Space, Typography, 
  message, Spin, Grid, Tag, Avatar, Progress, Tooltip, Row, Col,
  Dropdown, Divider, Statistic, Badge
} from 'antd';
import { 
  SearchOutlined, PlusOutlined, ReloadOutlined, FilterOutlined,
  EyeOutlined, EditOutlined, DeleteOutlined, UserOutlined,
  TeamOutlined, CheckCircleOutlined, CloseCircleOutlined,
  ExclamationCircleOutlined, PhoneOutlined, MailOutlined,
  EnvironmentOutlined, RocketOutlined, CheckOutlined
} from '@ant-design/icons';
import { getAllCustomers, deleteCustomer, activateCustomer, addCustomer } from '../actions/customerActions';
import { previousService } from '../services/previousService';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const Customers = () => {
  const dispatch = useDispatch();
  const { customers, loading, error } = useSelector(state => state.customerList);
  const screens = useBreakpoint();
  
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activateConfirm, setActivateConfirm] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activateLoading, setActivateLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [addCustomerForm] = Form.useForm();
  const [prevServicesModalVisible, setPrevServicesModalVisible] = useState(false);
  const [prevServicesLoading, setPrevServicesLoading] = useState(false);
  const [prevServicesList, setPrevServicesList] = useState([]);
  const [prevServicesCustomer, setPrevServicesCustomer] = useState(null);

  useEffect(() => {
    dispatch(getAllCustomers());
  }, [dispatch]);

  // Enhanced status detection
  const getStatusDetails = (customer) => {
    const statusValue = customer.C_Status;
    
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

  // Filter customers
  const filteredCustomers = customers && customers.length > 0 
    ? customers.filter(customer => {
        const statusDetails = getStatusDetails(customer);
        const matchesSearch = 
          customer.C_FullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.C_Email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.C_Phone?.includes(searchTerm) ||
          customer.C_Address?.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (statusFilter === 'all') return matchesSearch;
        if (statusFilter === 'active') return statusDetails.isActive && matchesSearch;
        if (statusFilter === 'inactive') return !statusDetails.isActive && matchesSearch;
        return matchesSearch;
      })
    : [];

  // Count customers by status
  const customerCounts = customers && customers.length > 0 
    ? customers.reduce((counts, customer) => {
        const statusDetails = getStatusDetails(customer);
        
        if (statusDetails.isActive) {
          counts.active++;
        } else {
          counts.inactive++;
        }
        
        counts.total++;
        return counts;
      }, { total: 0, active: 0, inactive: 0 })
    : { total: 0, active: 0, inactive: 0 };

  const handleDelete = async (customer) => {
    try {
      setDeleteLoading(true);
      
      const customerData = {
        C_CustomerID: customer.C_CustomerID,
        C_FullName: customer.C_FullName,
        C_Phone: customer.C_Phone,
        C_Email: customer.C_Email,
        C_Address: customer.C_Address,
        C_Status: customer.C_Status
      };
      
      await dispatch(deleteCustomer(customerData));
      
      setDeleteConfirm(null);
      message.success('Customer deactivated successfully');
    } catch (error) {
      console.error('Failed to delete customer:', error);
      message.error('Failed to deactivate customer');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleActivate = async (customer) => {
    try {
      setActivateLoading(true);
      
      const customerData = {
        C_CustomerID: customer.C_CustomerID,
        C_FullName: customer.C_FullName,
        C_Phone: customer.C_Phone,
        C_Email: customer.C_Email,
        C_Address: customer.C_Address,
        C_Status: customer.C_Status
      };
      
      await dispatch(activateCustomer(customerData));
      
      setActivateConfirm(null);
      message.success('Customer activated successfully');
    } catch (error) {
      console.error('Failed to activate customer:', error);
      message.error('Failed to activate customer');
    } finally {
      setActivateLoading(false);
    }
  };

  const handleRefresh = () => {
    dispatch(getAllCustomers());
  };

  const showDetails = (customer) => {
    setSelectedCustomer(customer);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleAddCustomerCancel = () => {
    setIsAddModalVisible(false);
    addCustomerForm.resetFields();
  };

  const handleAddCustomerSubmit = async (values) => {
    try {
      console.log('Adding new customer:', values);
      
      // Prepare customer data for API
      const customerData = {
        C_FullName: values.fullName,
        C_Email: values.email,
        C_Phone: values.phone,
        C_Address: values.address,
        C_Status: values.status || 'A'
      };

      // Call the API to add customer
      const result = await dispatch(addCustomer(customerData));
      
      if (result.success) {
        message.success('Customer added successfully!');
        setIsAddModalVisible(false);
        addCustomerForm.resetFields();
        // Refresh the customer list
        dispatch(getAllCustomers());
      } else {
        message.error(result.error || 'Failed to add customer');
      }
    } catch (error) {
      console.error('Failed to add customer:', error);
      message.error('Failed to add customer');
    }
  };

  const toggleRowExpansion = (record) => {
    if (expandedRowKeys.includes(record.C_CustomerID)) {
      setExpandedRowKeys(expandedRowKeys.filter(key => key !== record.C_CustomerID));
    } else {
      setExpandedRowKeys([...expandedRowKeys, record.C_CustomerID]);
    }
  };

  const openPrevServices = async (customer) => {
    try {
      setPrevServicesCustomer(customer);
      setPrevServicesModalVisible(true);
      setPrevServicesLoading(true);
      setPrevServicesList([]);
      if (!customer || !customer.C_CustomerID) return;
      const res = await previousService.getPreviousServicesByCustomerID(customer.C_CustomerID);
      const list = res?.ResultSet || res?.Result || [];
      setPrevServicesList(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load previous services for admin view', err);
      setPrevServicesList([]);
    } finally {
      setPrevServicesLoading(false);
    }
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return 'N/A';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
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
              percent={Math.round((value / customerCounts.total) * 100)} 
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
    const isExpanded = expandedRowKeys.includes(record.C_CustomerID);
    const statusDetails = getStatusDetails(record);
    
    return (
      <Card 
        key={record.C_CustomerID} 
        className="mb-4 shadow-sm hover:shadow-md transition-all duration-300 border-0 rounded-xl bg-gradient-to-r from-white to-gray-50"
        bodyStyle={{ padding: '16px' }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Avatar 
              size="large" 
              icon={<UserOutlined />} 
              className="bg-blue-100 text-blue-600"
            />
            <div>
              <Text strong className="text-lg font-semibold text-gray-900 block">
                {record.C_FullName || 'Unknown Customer'}
              </Text>
              <Text className="text-sm text-gray-500">{record.C_CustomerID}</Text>
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
            <span>{formatPhoneNumber(record.C_Phone)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MailOutlined className="mr-2 text-green-500" />
            <span>{record.C_Email || 'N/A'}</span>
          </div>
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
              <Tooltip title="Deactivate Customer">
                <Button
                  type="text"
                  icon={<DeleteOutlined className="text-red-600" />}
                  onClick={() => setDeleteConfirm(record)}
                  className="hover:bg-red-50 rounded-lg w-10 h-10 flex items-center justify-center"
                />
              </Tooltip>
            ) : (
              <Tooltip title="Activate Customer">
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
            <Tooltip title="View Previous Services">
              <Button
                type="text"
                onClick={() => openPrevServices(record)}
                icon={<RocketOutlined className="text-purple-600" />}
                className="hover:bg-gray-50 rounded-lg w-10 h-10 flex items-center justify-center"
              />
            </Tooltip>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Text strong className="text-sm text-gray-700">Address:</Text>
                <Text className="text-sm text-gray-600">{record.C_Address || 'N/A'}</Text>
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
      title: <span className="text-sm font-semibold text-gray-700">Customer ID</span>,
      dataIndex: 'C_CustomerID',
      key: 'C_CustomerID',
      render: (text) => (
        <div className="flex items-center">
          <Avatar size="small" icon={<UserOutlined />} className="bg-blue-100 text-blue-600 mr-2" />
          <Text strong className="text-base font-semibold text-gray-900">{text}</Text>
        </div>
      ),
      width: 120,
    },
    {
      title: <span className="text-sm font-semibold text-gray-700">Full Name</span>,
      dataIndex: 'C_FullName',
      key: 'C_FullName',
      render: (text) => <Text className="text-base font-medium text-gray-800">{text || 'N/A'}</Text>,
      width: 150,
    },
    {
      title: <span className="text-sm font-semibold text-gray-700">Phone</span>,
      dataIndex: 'C_Phone',
      key: 'C_Phone',
      render: (text) => (
        <div className="flex items-center">
          <PhoneOutlined className="text-gray-400 mr-2" />
          <Text className="text-base text-gray-700">{formatPhoneNumber(text)}</Text>
        </div>
      ),
      width: 140,
    },
    {
      title: <span className="text-sm font-semibold text-gray-700">Email</span>,
      dataIndex: 'C_Email',
      key: 'C_Email',
      render: (text) => (
        <div className="flex items-center">
          <MailOutlined className="text-gray-400 mr-2" />
          <Text className="text-base text-gray-700">{text || 'N/A'}</Text>
        </div>
      ),
      width: 200,
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
      width: 150,
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
            label: 'Deactivate Customer',
            onClick: () => setDeleteConfirm(record)
          } : {
            key: 'activate',
            icon: <CheckOutlined className="text-green-600" />,
            label: 'Activate Customer',
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

            <Tooltip title="View Previous Services">
              <Button
                type="text"
                onClick={() => openPrevServices(record)}
                icon={<RocketOutlined className="text-purple-600" />}
                className="hover:bg-gray-50 rounded-lg w-10 h-10 flex items-center justify-center"
              />
            </Tooltip>
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" className="text-blue-600" />
          <div className="mt-4">
            <Text className="text-base text-gray-600 font-medium">Loading customers...</Text>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 max-w-md mx-auto text-center shadow-lg">
          <ExclamationCircleOutlined className="text-red-500 text-4xl mb-4" />
          <Text type="danger" className="text-base block mb-4 font-medium">{error}</Text>
          <Button 
            type="primary"
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 rounded-lg h-10 px-6 font-medium"
          >
            Try Again
          </Button>
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
              <h1 className="text-2xl font-bold text-white mb-2">Customer Management</h1>
              <Text className="text-blue-100">Manage and track all customer information efficiently</Text>
            </div>
            <Space size="middle">
              <Button 
                icon={<PlusOutlined />} 
                onClick={() => setIsAddModalVisible(true)}
                className="bg-green-600 hover:bg-green-700 text-white border-0 rounded-lg h-10 px-4 font-medium"
              >
                {screens.xs ? '' : 'Add Customer'}
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

        {/* Statistics Cards - Reduced height */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <StatCard 
              title="Total Customers" 
              value={customerCounts.total} 
              icon={<TeamOutlined />}
              color="text-blue-600"
              progress
            />
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <StatCard 
              title="Active Customers" 
              value={customerCounts.active} 
              icon={<CheckCircleOutlined />}
              color="text-green-600"
              progress
            />
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <StatCard 
              title="Inactive Customers" 
              value={customerCounts.inactive} 
              icon={<CloseCircleOutlined />}
              color="text-red-600"
              progress
            />
          </Col>
        </Row>

        {/* Filters and Search - Reduced height */}
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
                    All ({customerCounts.total})
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
                    Active ({customerCounts.active})
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
                    Inactive ({customerCounts.inactive})
                  </Button>
                </Space>
              </div>
            </div>
            
            <div className="mt-2">
              <Text className="text-xs font-medium text-gray-600">
                Showing {filteredCustomers.length} of {customerCounts.total} customers
              </Text>
            </div>
          </Card>

        {/* Customers Table/Cards */}
        <Card 
          bordered={false} 
          className="shadow-lg rounded-2xl border-0 bg-white overflow-hidden"
          bodyStyle={{ padding: '24px' }}
          title={
            <div className="flex items-center justify-between">
              <Text strong className="text-xl text-gray-900">Customer List</Text>
              <Text className="text-gray-500">{customerCounts.total} customers found</Text>
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
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map(record => renderMobileCard(record))
              ) : (
                <div className="text-center py-12">
                  <UserOutlined className="text-4xl text-gray-300 mb-4" />
                  <Text className="text-base text-gray-600 font-medium">
                    {customers.length > 0 
                      ? `No ${statusFilter !== 'all' ? statusFilter : ''} customers found` 
                      : 'No customers found'}
                  </Text>
                </div>
              )}
            </div>
          )}
          
          {/* Desktop View */}
          {screens.md && (
            <Table 
              columns={columns} 
              dataSource={filteredCustomers} 
              rowKey="C_CustomerID"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
                showTotal: (total) => <span className="text-sm font-medium text-gray-600">Total {total} customers</span>,
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
                      {customers.length > 0 
                        ? `No ${statusFilter !== 'all' ? statusFilter : ''} customers found` 
                        : 'No customers found'}
                    </Text>
                  </div>
                )
              }}
            />
          )}
        </Card>

        {/* Customer Details Modal */}
        <Modal
          title={
            <div className="text-center pb-4 border-b border-gray-200">
              <span className="text-xl font-bold text-gray-900">
                Customer Details
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
          {selectedCustomer && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar size={64} icon={<UserOutlined />} className="bg-blue-100 text-blue-600" />
                <div>
                  <Text strong className="text-xl text-gray-900 block">{selectedCustomer.C_FullName}</Text>
                  <Text className="text-gray-600">ID: {selectedCustomer.C_CustomerID}</Text>
                </div>
              </div>
              
              <Divider />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <PhoneOutlined className="text-blue-500 mr-3" />
                    <div>
                      <Text strong className="text-gray-700 block">Phone</Text>
                      <Text className="text-gray-600">{formatPhoneNumber(selectedCustomer.C_Phone)}</Text>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <MailOutlined className="text-green-500 mr-3" />
                    <div>
                      <Text strong className="text-gray-700 block">Email</Text>
                      <Text className="text-gray-600">{selectedCustomer.C_Email || 'N/A'}</Text>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <EnvironmentOutlined className="text-orange-500 mr-3" />
                    <div>
                      <Text strong className="text-gray-700 block">Address</Text>
                      <Text className="text-gray-600">{selectedCustomer.C_Address || 'N/A'}</Text>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    {getStatusDetails(selectedCustomer).icon}
                    <div className="ml-3">
                      <Text strong className="text-gray-700 block">Status</Text>
                      <Text className="text-gray-600">{getStatusDetails(selectedCustomer).text}</Text>
                    </div>
                  </div>
                </div>
              </div>
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
              onClick={() => handleDelete(deleteConfirm)} 
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
                Are you sure you want to deactivate customer "{deleteConfirm.C_FullName}"?
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
              onClick={() => handleActivate(activateConfirm)} 
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
                Are you sure you want to activate customer "{activateConfirm.C_FullName}"?
              </Text>
              <Text className="text-gray-500 text-sm">
                This customer will be available for all operations.
              </Text>
            </div>
          )}
        </Modal>

        {/* Add Customer Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <PlusOutlined className="text-blue-600" />
              <span className="text-lg font-semibold text-gray-800">Add New Customer</span>
            </div>
          }
          visible={isAddModalVisible}
          onCancel={handleAddCustomerCancel}
          footer={null}
          width={600}
          centered
          className="rounded-2xl"
        >
          <Form
            form={addCustomerForm}
            layout="vertical"
            onFinish={handleAddCustomerSubmit}
            className="mt-4"
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Full Name"
                  name="fullName"
                  rules={[
                    { required: true, message: 'Please enter the full name' },
                    { min: 2, message: 'Name must be at least 2 characters' }
                  ]}
                >
                  <Input
                    placeholder="Enter customer's full name"
                    prefix={<UserOutlined className="text-gray-400" />}
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
                    placeholder="customer@example.com"
                    prefix={<MailOutlined className="text-gray-400" />}
                    className="h-10"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Phone Number"
                  name="phone"
                  rules={[
                    { required: true, message: 'Please enter phone number' },
                    { pattern: /^[0-9]{10}$/, message: 'Phone number must be 10 digits' }
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
                  label="Address"
                  name="address"
                  rules={[
                    { required: true, message: 'Please enter the address' },
                    { min: 10, message: 'Address must be at least 10 characters' }
                  ]}
                >
                  <Input.TextArea
                    placeholder="Enter full address"
                    rows={3}
                    prefix={<EnvironmentOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Status"
                  name="status"
                  initialValue="A"
                  rules={[{ required: true, message: 'Please select status' }]}
                >
                  <select className="w-full h-10 border border-gray-300 rounded px-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="A">Active</option>
                    <option value="I">Inactive</option>
                  </select>
                </Form.Item>
              </Col>
            </Row>

            <div className="flex justify-end gap-3 mt-6">
              <Button 
                onClick={handleAddCustomerCancel}
                className="h-10 px-6 rounded-lg"
              >
                Cancel
              </Button>
              <Button 
                type="primary"
                htmlType="submit"
                className="h-10 px-6 rounded-lg bg-blue-600 border-blue-600 hover:bg-blue-700"
              >
                Add Customer
              </Button>
            </div>
          </Form>
        </Modal>

        {/* Previous Services Modal (admin view) */}
        <Modal
          title={
            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-semibold">Previous Services</span>
                <div className="text-sm text-gray-500">{prevServicesCustomer?.C_FullName || ''}</div>
              </div>
            </div>
          }
          open={prevServicesModalVisible}
          onCancel={() => { setPrevServicesModalVisible(false); setPrevServicesList([]); setPrevServicesCustomer(null); }}
          footer={[
            <Button key="close" onClick={() => { setPrevServicesModalVisible(false); setPrevServicesList([]); setPrevServicesCustomer(null); }}>
              Close
            </Button>
          ]}
          width={800}
          centered
          className="rounded-2xl"
          bodyStyle={{ padding: '20px' }}
        >
          {prevServicesLoading ? (
            <div className="text-center py-12"><Spin /></div>
          ) : prevServicesList && prevServicesList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No previous services found for this customer.</div>
          ) : (
            <div className="space-y-3">
              {prevServicesList.map(it => (
                <div key={it.PS_ServiceID || it.PS_ServiceID + Math.random()} className="p-4 border rounded-lg flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-lg">{it.PS_ServiceName}</div>
                    <div className="text-sm text-gray-500 mt-1">{it.PS_PlaceName} • {(() => { try { const d = new Date(it.PS_ServiceDate); return isNaN(d) ? it.PS_ServiceDate : d.toLocaleDateString(); } catch(e){return it.PS_ServiceDate} })()}</div>
                    {it.PS_Notes && <div className="mt-2 text-sm text-gray-600">{it.PS_Notes}</div>}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Price</div>
                    <div className="font-semibold text-lg">Rs.{Number(it.PS_Price || 0).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
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

export default Customers;