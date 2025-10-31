// partsInventoryReducer.js
import {
  GET_ALL_PARTS_INVENTORY_REQUEST,
  GET_ALL_PARTS_INVENTORY_SUCCESS,
  GET_ALL_PARTS_INVENTORY_FAIL,
  ADD_PART_INVENTORY_REQUEST,
  ADD_PART_INVENTORY_SUCCESS,
  ADD_PART_INVENTORY_FAIL,
  UPDATE_PART_INVENTORY_REQUEST,
  UPDATE_PART_INVENTORY_SUCCESS,
  UPDATE_PART_INVENTORY_FAIL,
  DELETE_PART_INVENTORY_REQUEST,
  DELETE_PART_INVENTORY_SUCCESS,
  DELETE_PART_INVENTORY_FAIL
} from '../constants/PartsInventoryConstants';

// Initial state for the parts inventory
const initialState = {
  loading: false,
  parts: [],
  error: null
};

// Parts inventory reducer
export const partsInventoryReducer = (state = initialState, action) => {
  switch (action.type) {
    // Fetch all parts inventory
    case GET_ALL_PARTS_INVENTORY_REQUEST:
      return { ...state, loading: true, error: null };
    
    case GET_ALL_PARTS_INVENTORY_SUCCESS:
      return { ...state, loading: false, parts: action.payload, error: null };
    
    case GET_ALL_PARTS_INVENTORY_FAIL:
      return { ...state, loading: false, error: action.payload };

    // Add a part to the inventory
    case ADD_PART_INVENTORY_REQUEST:
      return { ...state, loading: true, error: null };
    
    case ADD_PART_INVENTORY_SUCCESS:
      // The Add action triggers a refetch (GetAllPartsInventory()), so we don't append a possibly
      // malformed payload here. Just clear loading and keep current parts until the refetch finishes.
      return { 
        ...state, 
        loading: false,
        error: null 
      };
    
    case ADD_PART_INVENTORY_FAIL:
      return { ...state, loading: false, error: action.payload };

    // Update an existing part in the inventory
    case UPDATE_PART_INVENTORY_REQUEST:
      return { ...state, loading: true, error: null };
    
    case UPDATE_PART_INVENTORY_SUCCESS:
      // Update action also triggers a refetch. Avoid relying on action.payload shape here.
      return {
        ...state,
        loading: false,
        error: null
      };

    case UPDATE_PART_INVENTORY_FAIL:
      return { ...state, loading: false, error: action.payload };

    // Delete a part from the inventory (now just updates status)
    case DELETE_PART_INVENTORY_REQUEST:
      return { ...state, loading: true, error: null };

    case DELETE_PART_INVENTORY_SUCCESS:
      // Find the part and update its status to 'I' (inactive)
      const filteredParts = state.parts.map(part => 
        part.P_PartID === action.payload ? {...part, P_Status: 'I'} : part
      );
      return {
        ...state,
        loading: false,
        parts: filteredParts,
        error: null
      };

    case DELETE_PART_INVENTORY_FAIL:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};