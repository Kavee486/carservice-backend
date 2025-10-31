import {
  GetAllCategories_REQUEST,
  GetAllCategories_SUCCESS,
  GetAllCategories_FAIL,
  AddCategory_REQUEST,
  AddCategory_SUCCESS,
  AddCategory_FAIL,
  UpdateCategory_REQUEST,
  UpdateCategory_SUCCESS,
  UpdateCategory_FAIL,
  DeleteCategory_REQUEST,
  DeleteCategory_SUCCESS,
  DeleteCategory_FAIL
} from "../constants/categoryConstants";
import {
  fetchAllCategories,
  addCategory,
  updateCategory,
  deleteCategory
} from '../services/categoryServices';

// Action to get all categories
export const GetAllCategories = () => async (dispatch) => {
  try {
    dispatch({ type: GetAllCategories_REQUEST });

    const data = await fetchAllCategories();

    if (data.StatusCode === 200) {
      dispatch({
        type: GetAllCategories_SUCCESS,
        payload: data.ResultSet
      });
    } else {
      const msg = data.Message || "Failed to fetch categories";
      dispatch({
        type: GetAllCategories_FAIL,
        payload: msg
      });
    }
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    dispatch({
      type: GetAllCategories_FAIL,
      payload: message
    });
  }
};

// Action to add a new category
export const AddCategory = (categoryData) => async (dispatch) => {
  try {
    dispatch({ type: AddCategory_REQUEST });

    const data = await addCategory(categoryData);

    if (data.StatusCode === 200) {
      dispatch({
        type: AddCategory_SUCCESS,
        payload: data.Result,
      });
    } else {
      const msg = data.Message || "Failed to add category";
      dispatch({
        type: AddCategory_FAIL,
        payload: msg,
      });
    }
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    dispatch({
      type: AddCategory_FAIL,
      payload: message,
    });
  }
};

// Action to update an existing category
export const UpdateCategory = (categoryId, categoryData) => async (dispatch) => {
  try {
    dispatch({ type: UpdateCategory_REQUEST });

    const data = await updateCategory(categoryId, categoryData);

    if (data.StatusCode === 200) {
      dispatch({
        type: UpdateCategory_SUCCESS,
        payload: data.Result
      });
    } else {
      const msg = data.Message || "Failed to update category";
      dispatch({
        type: UpdateCategory_FAIL,
        payload: msg
      });
    }
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    dispatch({
      type: UpdateCategory_FAIL,
      payload: message
    });
  }
};

// Action to delete a category
export const DeleteCategory = (categoryData) => async (dispatch) => {
  try {
    dispatch({ type: DeleteCategory_REQUEST });

    const data = await deleteCategory(categoryData);

    if (data.StatusCode === 200) {
      dispatch({
        type: DeleteCategory_SUCCESS,
        payload: categoryData.C_CategoryID
      });
    } else {
      const msg = data.Message || "Failed to delete category";
      dispatch({
        type: DeleteCategory_FAIL,
        payload: msg
      });
    }
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    dispatch({
      type: DeleteCategory_FAIL,
      payload: message
    });
  }
};