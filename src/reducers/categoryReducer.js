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
} from '../constants/categoryConstants';

export const categoryListReducer = (state = { categories: [] }, action) => {
  switch (action.type) {
    case GetAllCategories_REQUEST:
      return { loading: true, categories: [] };
    case GetAllCategories_SUCCESS:
      return { loading: false, categories: action.payload };
    case GetAllCategories_FAIL:
      return { loading: false, error: action.payload };
    
    case AddCategory_REQUEST:
      return { ...state, loading: true };
    case AddCategory_SUCCESS:
      return {
        ...state,
        loading: false,
        categories: [...state.categories, action.payload],
      };
    case AddCategory_FAIL:
      return { ...state, loading: false, error: action.payload };

    case UpdateCategory_REQUEST:
      return { ...state, loading: true };
    case UpdateCategory_SUCCESS:
      return {
        ...state,
        loading: false,
        categories: state.categories.map(category =>
          category.C_CategoryID === action.payload.C_CategoryID ? action.payload : category
        ),
      };
    case UpdateCategory_FAIL:
      return { ...state, loading: false, error: action.payload };

    case DeleteCategory_REQUEST:
      return { ...state, loading: true };
    case DeleteCategory_SUCCESS:
      return {
        ...state,
        loading: false,
        categories: state.categories.filter(category => category.C_CategoryID !== action.payload),
      };
    case DeleteCategory_FAIL:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};