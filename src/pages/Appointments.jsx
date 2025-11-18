import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Table, Button, Modal, Form, Input, InputNumber,
  Card, Space, Typography, message, Spin, Grid,
  Tag, Badge, Dropdown, Divider, Statistic,
  Row, Col, Avatar, Progress, Tooltip
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined,
  ExclamationCircleOutlined, ReloadOutlined, PlusOutlined,
  EyeOutlined, MenuOutlined, DownloadOutlined, PrinterOutlined, FilePdfOutlined,
  EditOutlined, PhoneOutlined, UserOutlined, CalendarOutlined,
  DollarOutlined, TeamOutlined, RocketOutlined, FilterOutlined
} from '@ant-design/icons';
import { authService } from '../services/authServices';
import { getAppointments, updateAppointmentStatus } from '../actions/appointmentActions';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const Appointments = () => {
  const dispatch = useDispatch();
  const { appointments, loading, error } = useSelector(state => state.appointmentList);
  const screens = useBreakpoint();
  const user = authService.getCurrentUser();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isInvoiceModalVisible, setIsInvoiceModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [invoiceData, setInvoiceData] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0,
    rejected: 0
  });

  // Sort appointments by Booking ID in descending order
  const sortedAppointments = React.useMemo(() => {
    if (!appointments) return [];
    return [...appointments].sort((a, b) => {
      const idA = parseInt(a.B_BookingID) || 0;
      const idB = parseInt(b.B_BookingID) || 0;
      return idB - idA; // Descending order
    });
  }, [appointments]);

  useEffect(() => {
    dispatch(getAppointments());
  }, [dispatch]);

  useEffect(() => {
    if (sortedAppointments) {
      const total = sortedAppointments.length;
      const pending = sortedAppointments.filter(app => app.B_BookingStatus?.toLowerCase() === 'pending').length;
      const approved = sortedAppointments.filter(app => app.B_BookingStatus?.toLowerCase() === 'approved').length;
      const completed = sortedAppointments.filter(app => app.B_BookingStatus?.toLowerCase() === 'completed').length;
      const rejected = sortedAppointments.filter(app => app.B_BookingStatus?.toLowerCase() === 'rejected' || app.B_BookingStatus?.toLowerCase() === 'disapproved').length;

      setStats({ total, pending, approved, completed, rejected });
    }
  }, [sortedAppointments]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  // Date/time helpers
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString || timeString === '00:00:00' || timeString === '') return 'Not set';
    try {
      if (timeString.includes(' ')) {
        const parts = timeString.split(' ');
        const maybeTime = parts[parts.length - 1];
        if (/^\d{1,2}:\d{2}:\d{2}$/.test(maybeTime)) {
          return dayjs(maybeTime, 'HH:mm:ss').format('hh:mm A');
        }
      }
      return dayjs(timeString, 'HH:mm:ss').format('hh:mm A');
    } catch (error) {
      return 'Invalid time';
    }
  };

  const getRecordDate = (record) => {
    return record?.B_PreferredDate || record?.B_BookingDate || null;
  };

  const getStartTime = (record) => {
    return (record && (record.B_StartTime || record.B_StartingTime || record.B_StartTime)) || null;
  };

  const getEndTime = (record) => {
    return (record && (record.B_EndTime || record.B_EndingTime || record.B_EndTime)) || null;
  };

  const showDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      setUpdatingStatus(prev => ({ ...prev, [bookingId]: true }));
      const result = await dispatch(updateAppointmentStatus(bookingId, newStatus));
      if (result && result.success) {
        message.success('Appointment status updated successfully');
      } else {
        console.error('Update returned failure:', result);
        message.error(result?.message || 'Failed to update appointment status');
      }

      if (newStatus === 'completed') {
        generateInvoice(bookingId);
      }
    } catch (err) {
      message.error('Failed to update appointment status');
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const generateInvoice = async (bookingId) => {
    try {
      const appointment = sortedAppointments.find(app => app.B_BookingID === bookingId);

      const mockInvoiceData = {
        invoiceNumber: `INV-${bookingId}-${Date.now()}`,
        invoiceDate: new Date().toISOString().split('T')[0],
        bookingId: bookingId,
        customerId: appointment.B_CustomerID,
        customerName: appointment.B_CustomerName,
        customerPhone: appointment.B_CustomerPhone,
        preferredDate: appointment.B_PreferredDate,
        startingTime: appointment.B_StartingTime,
        endingTime: appointment.B_EndingTime,
        services: [
          { id: 1, name: 'Oil Change', price: 49.99, quantity: 1 },
          { id: 2, name: 'Tire Rotation', price: 29.99, quantity: 1 },
          { id: 3, name: 'Brake Inspection', price: 19.99, quantity: 1 }
        ],
        taxRate: 0.08,
        technician: 'John Smith'
      };

      const subtotal = mockInvoiceData.services.reduce((sum, service) => sum + (service.price * service.quantity), 0);
      const tax = subtotal * mockInvoiceData.taxRate;
      const total = subtotal + tax;

      setInvoiceData({
        ...mockInvoiceData,
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2)
      });

      setIsInvoiceModalVisible(true);
    } catch (err) {
      message.error('Failed to generate invoice');
    }
  };

  const handleInvoiceClose = () => {
    setIsInvoiceModalVisible(false);
    setInvoiceData(null);
  };

  const handleDownloadInvoice = () => {
    message.success('Invoice download started');
  };

  const handlePrintInvoice = () => {
    const invoiceContent = document.getElementById('invoice-content');
    if (invoiceContent) {
      const originalContents = document.body.innerHTML;
      const printContents = invoiceContent.innerHTML;

      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };

  const handleRefresh = () => {
    dispatch(getAppointments());
  };

  const getStatusBadge = (status) => {
    let color, icon, text, bgColor;
    switch (status?.toLowerCase()) {
      case 'approved':
        color = '#52c41a';
        bgColor = '#f6ffed';
        icon = <CheckCircleOutlined />;
        text = 'APPROVED';
        break;
      case 'completed':
        color = '#1890ff';
        bgColor = '#f0f9ff';
        icon = <CheckCircleOutlined />;
        text = 'COMPLETED';
        break;
      case 'disapproved':
      case 'rejected':
        color = '#ff4d4f';
        bgColor = '#fff2f0';
        icon = <CloseCircleOutlined />;
        text = 'REJECTED';
        break;
      case 'pending':
        color = '#fa8c16';
        bgColor = '#fff7e6';
        icon = <ClockCircleOutlined />;
        text = 'PENDING';
        break;
      default:
        color = '#d9d9d9';
        bgColor = '#fafafa';
        icon = <ExclamationCircleOutlined />;
        text = status?.toUpperCase() || 'UNKNOWN';
    }
    return { color, icon, text, bgColor };
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return 'N/A';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const toggleRowExpansion = (record) => {
    if (expandedRowKeys.includes(record.B_BookingID)) {
      setExpandedRowKeys(expandedRowKeys.filter(key => key !== record.B_BookingID));
    } else {
      setExpandedRowKeys([...expandedRowKeys, record.B_BookingID]);
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
              percent={Math.round((value / stats.total) * 100)}
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
    const isExpanded = expandedRowKeys.includes(record.B_BookingID);
    const status = record.B_BookingStatus?.toLowerCase();
    const { color, icon, text, bgColor } = getStatusBadge(record.B_BookingStatus);
    const isLoading = updatingStatus[record.B_BookingID];

    return (
      <Card
        key={record.B_BookingID}
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
                {record.B_CustomerName || 'Unknown Customer'}
              </Text>
              <Text className="text-sm text-gray-500">{record.B_BookingID}</Text>
            </div>
          </div>
          <Tag
            color={color}
            icon={icon}
            style={{
              backgroundColor: bgColor,
              borderColor: color,
              color: color,
              borderRadius: '12px',
              fontWeight: '600'
            }}
          >
            {text}
          </Tag>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex items-center text-sm text-gray-600">
            <CalendarOutlined className="mr-2 text-blue-500" />
            <span>{formatDate(getRecordDate(record))}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <ClockCircleOutlined className="mr-2 text-green-500" />
            <span>{formatTime(getStartTime(record))}</span>
          </div>
        </div>
        <div className="mb-2">
          <Text className="text-sm text-gray-700">Service: <Text strong className="text-sm text-gray-900">{record.B_ServiceName || 'N/A'}</Text></Text>
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
          </Space>

          <Button
            type="text"
            icon={<MenuOutlined className={`text-gray-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />}
            onClick={() => toggleRowExpansion(record)}
            className="hover:bg-gray-50 rounded-lg w-10 h-10 flex items-center justify-center"
          />
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Text strong className="text-sm text-gray-700">Customer ID:</Text>
                <Text className="text-sm text-gray-600">{record.B_CustomerID}</Text>
              </div>
              <div className="flex justify-between">
                <Text strong className="text-sm text-gray-700">Phone:</Text>
                <Text className="text-sm text-gray-600">
                  <PhoneOutlined className="mr-1" />
                  {formatPhoneNumber(record.B_CustomerPhone)}
                </Text>
              </div>
              <div className="flex justify-between">
                <Text strong className="text-sm text-gray-700">End Time:</Text>
                <Text className="text-sm text-gray-600">{formatTime(getEndTime(record))}</Text>
              </div>

              {(user?.role === 'admin' || user?.role === 'technician') && (
                <div className="pt-2">
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: 'approve',
                          label: (
                            <div className="flex items-center">
                              {isLoading ? <Spin size="small" /> : <CheckCircleOutlined className="text-green-600 mr-2" />}
                              <span>Approve</span>
                            </div>
                          ),
                          onClick: () => handleStatusChange(record.B_BookingID, 'approved'),
                          disabled: status === 'approved' || status === 'completed' || isLoading
                        },
                        {
                          key: 'reject',
                          label: (
                            <div className="flex items-center">
                              {isLoading ? <Spin size="small" /> : <CloseCircleOutlined className="text-red-600 mr-2" />}
                              <span>Reject</span>
                            </div>
                          ),
                          onClick: () => handleStatusChange(record.B_BookingID, 'rejected'),
                          disabled: status === 'rejected' || status === 'completed' || isLoading
                        },
                        {
                          key: 'complete',
                          label: (
                            <div className="flex items-center">
                              {isLoading ? <Spin size="small" /> : <CheckCircleOutlined className="text-blue-600 mr-2" />}
                              <span>Complete</span>
                            </div>
                          ),
                          onClick: () => handleStatusChange(record.B_BookingID, 'completed'),
                          disabled: status === 'completed' || isLoading
                        }
                      ]
                    }}
                    placement="topRight"
                    disabled={isLoading}
                    trigger={['click']}
                  >
                    <Button
                      type="primary"
                      loading={isLoading}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 border-0 rounded-lg h-9 font-medium"
                    >
                      Manage Status
                    </Button>
                  </Dropdown>
                </div>
              )}
            </div>
          </div>
        )}
      </Card>
    );
  };

  const columns = [
    {
      title: <span className="text-sm font-semibold text-gray-700">Booking ID</span>,
      dataIndex: 'B_BookingID',
      key: 'B_BookingID',
      render: (text) => (
        <div className="flex items-center">
          <Avatar size="small" icon={<UserOutlined />} className="bg-blue-100 text-blue-600 mr-2" />
          <Text strong className="text-base font-semibold text-gray-900">{text}</Text>
        </div>
      ),
      width: 100,
      sorter: (a, b) => {
        const idA = parseInt(a.B_BookingID) || 0;
        const idB = parseInt(b.B_BookingID) || 0;
        return idB - idA;
      },
      defaultSortOrder: 'descend',
    },
    {
      title: <span className="text-sm font-semibold text-gray-700">Customer</span>,
      dataIndex: 'B_CustomerName',
      key: 'B_CustomerName',
      render: (text) => <Text className="text-base font-medium text-gray-800">{text || 'N/A'}</Text>,
      width: 150,
    },
    {
      title: <span className="text-sm font-semibold text-gray-700">Contact</span>,
      dataIndex: 'B_CustomerPhone',
      key: 'B_CustomerPhone',
      render: (text) => (
        <div className="flex items-center">
          <PhoneOutlined className="text-gray-400 mr-2" />
          <Text className="text-base text-gray-700">{formatPhoneNumber(text)}</Text>
        </div>
      ),
      width: 140,
    },
    {
      title: <span className="text-sm font-semibold text-gray-700">Date</span>,
      dataIndex: 'B_PreferredDate',
      key: 'B_PreferredDate',
      render: (text, record) => (
        <div className="flex items-center">
          <CalendarOutlined className="text-gray-400 mr-2" />
          <Text className="text-base text-gray-700">{formatDate(getRecordDate(record))}</Text>
        </div>
      ),
      width: 130,
    },
    {
      title: <span className="text-sm font-semibold text-gray-700">Service</span>,
      dataIndex: 'B_ServiceName',
      key: 'B_ServiceName',
      render: (text, record) => (
        <div>
          <Text className="text-sm font-medium text-gray-800">{text || record.B_ServiceName || 'N/A'}</Text>
          <Text className="text-xs text-gray-500 block">{record.B_ServiceID ? `ID: ${record.B_ServiceID}` : ''}</Text>
        </div>
      ),
      width: 180,
    },
    {
      title: <span className="text-sm font-semibold text-gray-700">Time Slot</span>,
      key: 'timeSlot',
      render: (_, record) => (
        <div>
          <Text className="text-sm font-medium text-gray-800 block">{formatTime(getStartTime(record))}</Text>
          <Text className="text-xs text-gray-500">to {formatTime(getEndTime(record))}</Text>
        </div>
      ),
      width: 120,
    },
    {
      title: <span className="text-sm font-semibold text-gray-700">Status</span>,
      dataIndex: 'B_BookingStatus',
      key: 'B_BookingStatus',
      render: (status) => {
        const { color, icon, text, bgColor } = getStatusBadge(status);
        return (
          <Tag
            color={color}
            icon={icon}
            style={{
              backgroundColor: bgColor,
              borderColor: color,
              color: color,
              borderRadius: '12px',
              fontWeight: '600',
              border: 'none'
            }}
          >
            {text}
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
        const status = record.B_BookingStatus?.toLowerCase();
        const isLoading = updatingStatus[record.B_BookingID];

        return (
          <Space size="small">
            <Tooltip title="View Details">
              <Button
                type="text"
                icon={<EyeOutlined className="text-blue-600" />}
                onClick={() => showDetails(record)}
                className="hover:bg-blue-50 rounded-lg w-10 h-10 flex items-center justify-center"
              />
            </Tooltip>

            {(user?.role === 'admin' || user?.role === 'technician') && (
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'approve',
                      label: (
                        <div className="flex items-center px-2 py-1">
                          <CheckCircleOutlined className="text-green-600 mr-2" />
                          <span>Approve</span>
                        </div>
                      ),
                      onClick: () => handleStatusChange(record.B_BookingID, 'approved'),
                      disabled: status === 'approved' || status === 'completed' || isLoading
                    },
                    {
                      key: 'reject',
                      label: (
                        <div className="flex items-center px-2 py-1">
                          <CloseCircleOutlined className="text-red-600 mr-2" />
                          <span>Reject</span>
                        </div>
                      ),
                      onClick: () => handleStatusChange(record.B_BookingID, 'rejected'),
                      disabled: status === 'rejected' || status === 'completed' || isLoading
                    },
                    // {
                    //   key: 'complete',
                    //   label: (
                    //     <div className="flex items-center px-2 py-1">
                    //       <CheckCircleOutlined className="text-blue-600 mr-2" />
                    //       <span>Complete</span>
                    //     </div>
                    //   ),
                    //   onClick: () => handleStatusChange(record.B_BookingID, 'completed'),
                    //   disabled: status === 'completed' || isLoading
                    // }
                  ]
                }}
                placement="bottomRight"
                trigger={['click']}
                disabled={isLoading}
              >
                <Button
                  type="primary"
                  loading={isLoading}
                  icon={<MenuOutlined />}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 rounded-lg h-10 px-4 font-medium shadow-sm"
                >
                  Actions
                </Button>
              </Dropdown>
            )}
          </Space>
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
            <Text className="text-base text-gray-600 font-medium">Loading appointments...</Text>
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
    <div className="h-full p-4 md:p-6">
      <div className="w-full space-y-6">
        {/* Header Section */}
        <Card
          bordered={false}
          className="shadow-lg rounded-2xl border-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white"
          bodyStyle={{ padding: '24px' }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Appointment Management</h1>
              <Text className="text-blue-100">Manage and track all customer appointments efficiently</Text>
            </div>
            <Space size="middle">
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-0 rounded-lg h-10 px-4 font-medium backdrop-blur-sm"
              >
                {screens.xs ? '' : 'Refresh'}
              </Button>
              {user?.role === 'customer' && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {/* Book new appointment functionality */ }}
                  className="bg-white text-blue-600 hover:bg-gray-100 border-0 rounded-lg h-10 px-6 font-medium shadow-lg"
                >
                  {screens.xs ? '' : 'New Appointment'}
                </Button>
              )}
            </Space>
          </div>
        </Card>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Total Appointments"
              value={stats.total}
              icon={<TeamOutlined />}
              color="text-blue-600"
              progress
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Pending"
              value={stats.pending}
              icon={<ClockCircleOutlined />}
              color="text-orange-600"
              progress
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Approved"
              value={stats.approved}
              icon={<CheckCircleOutlined />}
              color="text-green-600"
              progress
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Completed"
              value={stats.completed}
              icon={<RocketOutlined />}
              color="text-purple-600"
              progress
            />
          </Col>
        </Row>

        {/* Appointments Table/Cards */}
        <Card
          bordered={false}
          className="shadow-lg rounded-2xl border-0 bg-white overflow-hidden"
          bodyStyle={{ padding: '24px' }}
          title={
            <div className="flex items-center justify-between">
              <Text strong className="text-xl text-gray-900">All Appointments</Text>
              <Text className="text-gray-500">{stats.total} appointments found</Text>
            </div>
          }
          
        >
          {/* Mobile View */}
          {!screens.md && (
            <div className="md:hidden">
              {sortedAppointments && sortedAppointments.length > 0 ? (
                sortedAppointments.map(record => renderMobileCard(record))
              ) : (
                <div className="text-center py-12">
                  <CalendarOutlined className="text-4xl text-gray-300 mb-4" />
                  <Text className="text-base text-gray-600 font-medium">No appointments found</Text>
                </div>
              )}
            </div>
          )}

          {/* Desktop View */}
          {screens.md && (
            <Table
              columns={columns}
              dataSource={sortedAppointments}
              rowKey="B_BookingID"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
                showTotal: (total) => <span className="text-sm font-medium text-gray-600">Total {total} appointments</span>,
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
                    <CalendarOutlined className="text-4xl text-gray-300 mb-4" />
                    <Text className="text-base text-gray-600 font-medium block">No appointments found</Text>
                  </div>
                )
              }}
            />
          )}
        </Card>

        {/* Appointment Details Modal */}
        <Modal
          title={
            <div className="text-center pb-4 border-b border-gray-200">
              <span className="text-xl font-bold text-gray-900">
                Appointment Details
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
          {selectedAppointment && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Text strong className="text-gray-700 block mb-1">Booking ID</Text>
                  <Text className="text-gray-900">{selectedAppointment.B_BookingID}</Text>
                </div>
                <div>
                  <Text strong className="text-gray-700 block mb-1">Customer Name</Text>
                  <Text className="text-gray-900">{selectedAppointment.B_CustomerName || 'N/A'}</Text>
                </div>
                <div>
                  <Text strong className="text-gray-700 block mb-1">Phone Number</Text>
                  <Text className="text-gray-900">{formatPhoneNumber(selectedAppointment.B_CustomerPhone)}</Text>
                </div>
                <div>
                  <Text strong className="text-gray-700 block mb-1">Preferred Date</Text>
                  <Text className="text-gray-900">{formatDate(getRecordDate(selectedAppointment))}</Text>
                </div>
                <div>
                  <Text strong className="text-gray-700 block mb-1">Starting Time</Text>
                  <Text className="text-gray-900">{formatTime(getStartTime(selectedAppointment))}</Text>
                </div>
                <div>
                  <Text strong className="text-gray-700 block mb-1">Ending Time</Text>
                  <Text className="text-gray-900">{formatTime(getEndTime(selectedAppointment))}</Text>
                </div>
                <div className="md:col-span-2">
                  <Text strong className="text-gray-700 block mb-1">Status</Text>
                  {(() => {
                    const { color, icon, text, bgColor } = getStatusBadge(selectedAppointment.B_BookingStatus);
                    return (
                      <Tag
                        color={color}
                        icon={icon}
                        style={{
                          backgroundColor: bgColor,
                          borderColor: color,
                          color: color,
                          borderRadius: '12px',
                          fontWeight: '600',
                          padding: '4px 12px',
                          fontSize: '14px'
                        }}
                      >
                        {text}
                      </Tag>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Invoice Modal */}
        <Modal
          title="Invoice"
          open={isInvoiceModalVisible}
          onCancel={handleInvoiceClose}
          width={800}
          footer={[
            <Button key="download" icon={<DownloadOutlined />} onClick={handleDownloadInvoice}>
              Download PDF
            </Button>,
            <Button key="print" icon={<PrinterOutlined />} onClick={handlePrintInvoice}>
              Print
            </Button>,
            <Button key="close" onClick={handleInvoiceClose}>
              Close
            </Button>,
          ]}
        >
          {invoiceData && (
            <div id="invoice-content">
              {/* Invoice content remains the same */}
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

export default Appointments;