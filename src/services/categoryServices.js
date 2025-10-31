import axios from 'axios';

// Function to fetch all categories
export const fetchAllCategories = async () => {
  try {
    const { data } = await axios.get(`Category/GetAllCategories`);
    return data;
  } catch (error) {
    throw error;
  }
};

// Function to add a new category
export const addCategory = async (categoryData) => {
  try {
    console.log("Adding category with data:", categoryData);
    const { data } = await axios.post(`Category/AddCategoriesDetails`, categoryData);
    console.log("Category added successfully, response:", data);
    return data;
  } catch (error) {
    console.error("Error adding category:", error);
    throw error;
  }
};

// Function to update an existing category
export const updateCategory = async (categoryId, categoryData) => {
  try {
    // Send CategoryID in the request body
    const payload = {
      ...categoryData,
      C_CategoryID: categoryId
    };
    
    console.log("Updating category with data:", payload);
    const { data } = await axios.post(`Category/PutCategoriesDetails`, payload);
    console.log("Category updated successfully, response:", data);
    return data;
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

// Function to delete a category
export const deleteCategory = async (categoryData) => {
  try {
    console.log("Deleting category with data:", categoryData);
    const { data } = await axios.post(`Category/DeleteCategoriesDetails`, categoryData);
    console.log("Category deleted successfully, response:", data);
    return data;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};