import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Table, Button, Modal, Form, Input, Card, Space, Typography, 
  message, Spin, Grid, Tag, Avatar, Progress, Tooltip, Row, Col,
  Dropdown, Divider, Statistic, Badge
} from 'antd';
import { 
  SearchOutlined, PlusOutlined, ReloadOutlined, FilterOutlined,
  EyeOutlined, EditOutlined, DeleteOutlined, FolderOutlined,
  TeamOutlined, CheckCircleOutlined, CloseCircleOutlined,
  ExclamationCircleOutlined, AppstoreOutlined, FolderOpenOutlined,
  RocketOutlined, CheckOutlined, UnorderedListOutlined
} from '@ant-design/icons';
import {
  GetAllCategories,
  AddCategory,
  UpdateCategory,
  DeleteCategory
} from '../actions/categoryActions';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const Categories = () => {
  const dispatch = useDispatch();
  const categoryList = useSelector(state => state.categoryList);
  const { loading, categories, error } = categoryList;
  const screens = useBreakpoint();
  
  const [isBulkModalVisible, setIsBulkModalVisible] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [bulkSubmitLoading, setBulkSubmitLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [bulkCategories, setBulkCategories] = useState([{ name: '' }]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [editCategoryForm] = Form.useForm();

  useEffect(() => {
    dispatch(GetAllCategories());
  }, [dispatch]);

  const handleBulkAddCategory = () => {
    setBulkCategories([{ name: '' }]);
    setIsBulkModalVisible(true);
  };

  const handleEditCategory = (category) => {
    setCurrentCategory(category);
    editCategoryForm.setFieldsValue({
      name: category.C_CategoryName
    });
  };

  const handleDeleteCategory = async (category) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(prev => ({ ...prev, [category.C_CategoryID]: true }));

      const categoryData = {
        C_CategoryID: category.C_CategoryID,
        C_CategoryName: category.C_CategoryName
      };

      await dispatch(DeleteCategory(categoryData));
      message.success('Category deleted successfully');
      dispatch(GetAllCategories());
    } catch (error) {
      message.error('Failed to delete category');
    } finally {
      setDeleteLoading(prev => ({ ...prev, [category.C_CategoryID]: false }));
    }
  };

  const handleEditSubmit = async (values) => {
    try {
      setSubmitLoading(true);

      const categoryData = {
        C_CategoryName: values.name,
      };

      await dispatch(UpdateCategory(currentCategory.C_CategoryID, categoryData));
      message.success('Category updated successfully');

      editCategoryForm.resetFields();
      setCurrentCategory(null);
      dispatch(GetAllCategories());
    } catch (err) {
      console.error('Error:', err);
      message.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    
    // Validate bulk categories
    const validCategories = bulkCategories.filter(category => 
      category.name.trim()
    );

    if (validCategories.length === 0) {
      message.error('Please add at least one valid category with name filled out.');
      return;
    }

    try {
      setBulkSubmitLoading(true);
      let successCount = 0;
      let errorCount = 0;

      // Add each category individually
      for (const category of validCategories) {
        try {
          const categoryData = {
            C_CategoryName: category.name,
          };

          await dispatch(AddCategory(categoryData));
          successCount++;
        } catch (error) {
          console.error('Error adding category:', category.name, error);
          errorCount++;
        }
      }

      setIsBulkModalVisible(false);
      
      if (errorCount === 0) {
        message.success(`Successfully added ${successCount} category(s)!`);
      } else {
        message.warning(`Added ${successCount} category(s) successfully. ${errorCount} category(s) failed to add.`);
      }
      
      dispatch(GetAllCategories());
    } catch (err) {
      console.error('Error in bulk add:', err);
      message.error('Something went wrong while adding categories');
    } finally {
      setBulkSubmitLoading(false);
    }
  };

  const addBulkCategoryField = () => {
    setBulkCategories([...bulkCategories, { name: '' }]);
  };

  const removeBulkCategoryField = (index) => {
    if (bulkCategories.length > 1) {
      const updatedCategories = bulkCategories.filter((_, i) => i !== index);
      setBulkCategories(updatedCategories);
    }
  };

  const updateBulkCategoryField = (index, field, value) => {
    const updatedCategories = [...bulkCategories];
    updatedCategories[index][field] = value;
    setBulkCategories(updatedCategories);
  };

  const handleRefresh = () => {
    dispatch(GetAllCategories());
  };

  // Filter categories based on search term
  const filteredCategories = categories && categories.length > 0
    ? categories.filter(category => {
      const matchesSearch =
        category.C_CategoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.C_CategoryID?.toString().includes(searchTerm);

      return matchesSearch;
    })
    : [];

  // Calculate statistics
  const totalCategories = categories?.length || 0;

  const categoryStats = {
    total: totalCategories,
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
              percent={100} 
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
    const isExpanded = expandedRowKeys.includes(record.C_CategoryID);
    
    return (
      <Card 
        key={record.C_CategoryID} 
        className="mb-4 shadow-sm hover:shadow-md transition-all duration-300 border-0 rounded-xl bg-gradient-to-r from-white to-gray-50"
        bodyStyle={{ padding: '16px' }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div>
              <Text strong className="text-lg font-semibold text-gray-900 block">
                {record.C_CategoryName || 'Unknown Category'}
              </Text>
            </div>
          </div>
        </div>

        <Divider className="my-3" />

        <div className="flex justify-between items-center">
          <Space size="small">
            <Tooltip title="Edit Category">
              <Button
                type="text"
                icon={<EditOutlined className="text-blue-600" />}
                onClick={() => handleEditCategory(record)}
                className="hover:bg-blue-50 rounded-lg w-10 h-10 flex items-center justify-center"
              />
            </Tooltip>
            
            <Tooltip title="Delete Category">
              <Button
                type="text"
                icon={<DeleteOutlined className="text-red-600" />}
                onClick={() => handleDeleteCategory(record)}
                disabled={deleteLoading[record.C_CategoryID]}
                loading={deleteLoading[record.C_CategoryID]}
                className="hover:bg-red-50 rounded-lg w-10 h-10 flex items-center justify-center"
              />
            </Tooltip>
          </Space>

          <Button
            type="text"
            icon={<EditOutlined className={`text-gray-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />}
            onClick={() => setExpandedRowKeys(
              isExpanded 
                ? expandedRowKeys.filter(key => key !== record.C_CategoryID)
                : [...expandedRowKeys, record.C_CategoryID]
            )}
            className="hover:bg-gray-50 rounded-lg w-10 h-10 flex items-center justify-center"
          />
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Text strong className="text-sm text-gray-700">Category ID:</Text>
                <Text className="text-sm text-gray-600">{record.C_CategoryID}</Text>
              </div>
            </div>
          </div>
        )}
      </Card>
    );
  };

  const columns = [
    {
      title: <span className="text-sm font-semibold text-gray-700">Category Name</span>,
      dataIndex: 'C_CategoryName',
      key: 'C_CategoryName',
      render: (text) => (
        <Text className="text-base font-medium text-gray-800">{text || 'N/A'}</Text>
      ),
      width: 300,
    },
    {
      title: <span className="text-sm font-semibold text-gray-700">Actions</span>,
      key: 'actions',
      width: 150,
      render: (_, record) => {
        const menuItems = [
          {
            key: 'edit',
            icon: <EditOutlined className="text-blue-600" />,
            label: 'Edit Category',
            onClick: () => handleEditCategory(record)
          },
          {
            key: 'divider1',
            type: 'divider'
          },
          {
            key: 'delete',
            icon: <DeleteOutlined className="text-red-600" />,
            label: 'Delete Category',
            onClick: () => handleDeleteCategory(record)
          }
        ];

        return (
          <Space>
            <Tooltip title="Edit">
              <Button
                type="text"
                icon={<EditOutlined className="text-blue-600" />}
                onClick={() => handleEditCategory(record)}
                className="hover:bg-blue-50 rounded-lg w-10 h-10 flex items-center justify-center"
              />
            </Tooltip>
            
            <Tooltip title="Delete">
              <Button
                type="text"
                icon={<DeleteOutlined className="text-red-600" />}
                onClick={() => handleDeleteCategory(record)}
                disabled={deleteLoading[record.C_CategoryID]}
                loading={deleteLoading[record.C_CategoryID]}
                className="hover:bg-red-50 rounded-lg w-10 h-10 flex items-center justify-center"
              />
            </Tooltip>
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
            <Text className="text-base text-gray-600 font-medium">Loading categories...</Text>
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
              <h1 className="text-2xl font-bold text-white mb-2">Category Management</h1>
              <Text className="text-blue-100">Organize and manage service categories efficiently</Text>
            </div>
            <Space size="middle">
              <Button 
                icon={<UnorderedListOutlined />} 
                onClick={handleBulkAddCategory}
                className="bg-white-600 hover:bg-white-700 text-blue border-0 rounded-lg h-10 px-4 font-medium"
              >
                {screens.xs ? '' : 'Add Categories'}
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
          <Col xs={24} sm={12} lg={8}>
            <StatCard 
              title="Total Categories" 
              value={categoryStats.total} 
              icon={<AppstoreOutlined />}
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
                placeholder="Search categories by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              />
            </div>
          </div>
          
          <div className="mt-2">
            <Text className="text-xs font-medium text-gray-600">
              Showing {filteredCategories.length} of {categoryStats.total} categories
            </Text>
          </div>
        </Card>

        {/* Categories Table/Cards */}
        <Card 
          bordered={false} 
          className="shadow-lg rounded-2xl border-0 bg-white overflow-hidden"
          bodyStyle={{ padding: '24px' }}
          title={
            <div className="flex items-center justify-between">
              <Text strong className="text-xl text-gray-900">Category List</Text>
              <Text className="text-gray-500">{categoryStats.total} categories found</Text>
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
              {filteredCategories.length > 0 ? (
                filteredCategories.map(record => renderMobileCard(record))
              ) : (
                <div className="text-center py-12">
                  <FolderOutlined className="text-4xl text-gray-300 mb-4" />
                  <Text className="text-base text-gray-600 font-medium">
                    {categories.length > 0 
                      ? 'No categories match your search criteria'
                      : 'No categories found'}
                  </Text>
                  {(!categories || categories.length === 0) && (
                    <div className="flex justify-center mt-4">
                      <Button
                        onClick={handleBulkAddCategory}
                        className="bg-green-600 hover:bg-green-700 text-white border-0 rounded-lg h-10 px-6 font-medium flex items-center"
                      >
                        <UnorderedListOutlined className="mr-2" />
                        Add Categories
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Desktop View */}
          {screens.md && (
            <Table 
              columns={columns} 
              dataSource={filteredCategories} 
              rowKey="C_CategoryID"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
                showTotal: (total) => <span className="text-sm font-medium text-gray-600">Total {total} categories</span>,
                responsive: true,
                size: 'default',
                className: 'rounded-lg'
              }}
              scroll={{ x: 600 }}
              className="rounded-lg custom-table"
              size="middle"
              rowClassName="hover:bg-blue-50 transition-colors duration-200"
              locale={{
                emptyText: (
                  <div className="py-16 text-center">
                    <FolderOutlined className="text-4xl text-gray-300 mb-4" />
                    <Text className="text-base text-gray-600 font-medium block">
                      {categories.length > 0 
                        ? 'No categories match your search criteria'
                        : 'No categories found'}
                    </Text>
                    {(!categories || categories.length === 0) && (
                      <div className="flex justify-center mt-4">
                        <Button
                          onClick={handleBulkAddCategory}
                          className="bg-green-600 hover:bg-green-700 text-white border-0 rounded-lg h-10 px-6 font-medium flex items-center"
                        >
                          <UnorderedListOutlined className="mr-2" />
                          Add Categories
                        </Button>
                      </div>
                    )}
                  </div>
                )
              }}
            />
          )}
        </Card>

        {/* Edit Category Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <EditOutlined className="text-blue-600" />
              <span className="text-lg font-semibold text-gray-800">
                Edit Category
              </span>
            </div>
          }
          visible={!!currentCategory}
          onCancel={() => {
            setCurrentCategory(null);
            editCategoryForm.resetFields();
          }}
          footer={null}
          width={500}
          centered
          className="rounded-2xl"
        >
          <Form
            form={editCategoryForm}
            layout="vertical"
            onFinish={handleEditSubmit}
            className="mt-4"
          >
            <Form.Item
              label="Category Name"
              name="name"
              rules={[
                { required: true, message: 'Please enter category name' },
                { min: 2, message: 'Category name must be at least 2 characters' }
              ]}
            >
              <Input
                placeholder="Enter category name"
                prefix={<FolderOutlined className="text-gray-400" />}
                className="h-10"
              />
            </Form.Item>

            <div className="flex justify-end gap-3 mt-6">
              <Button 
                onClick={() => {
                  setCurrentCategory(null);
                  editCategoryForm.resetFields();
                }}
                className="h-10 px-6 rounded-lg"
              >
                Cancel
              </Button>
              <Button 
                type="primary"
                htmlType="submit"
                loading={submitLoading}
                className="h-10 px-6 rounded-lg bg-blue-600 border-blue-600 hover:bg-blue-700"
              >
                Update Category
              </Button>
            </div>
          </Form>
        </Modal>

        {/* Bulk Add Categories Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <UnorderedListOutlined className="text-green-600" />
              <span className="text-lg font-semibold text-gray-800">Add Categories</span>
            </div>
          }
          visible={isBulkModalVisible}
          onCancel={() => setIsBulkModalVisible(false)}
          footer={null}
          width={700}
          centered
          className="rounded-2xl"
        >
          <form onSubmit={handleBulkSubmit}>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Add multiple categories at once. Fill out the name for each category below.
              </p>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto p-2">
              {bulkCategories.map((category, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-700">Category #{index + 1}</h4>
                    {bulkCategories.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeBulkCategoryField(index)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium border-0"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                    <Input
                      placeholder="Enter category name"
                      value={category.name}
                      onChange={(e) => updateBulkCategoryField(index, 'name', e.target.value)}
                      required
                      className="w-full"
                      prefix={<FolderOutlined className="text-gray-400" />}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4">
              <Button
                type="button"
                onClick={addBulkCategoryField}
                className="border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 text-sm font-medium flex items-center"
              >
                <PlusOutlined className="mr-1" />
                Add Another Category
              </Button>

              <div className="flex space-x-3">
                <Button
                  type="button"
                  onClick={() => setIsBulkModalVisible(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 text-base font-medium"
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={bulkSubmitLoading}
                  className="px-6 py-2 bg-green-600 text-white border-0 rounded-lg hover:bg-green-700 flex items-center text-base font-medium"
                >
                  {bulkSubmitLoading ? (
                    <>
                      Adding {bulkCategories.length} Categories...
                    </>
                  ) : (
                    `Add ${bulkCategories.length} Category(s)`
                  )}
                </Button>
              </div>
            </div>
          </form>
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

export default Categories;