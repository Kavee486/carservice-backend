import {
  GetAllVehicles_REQUEST,
  GetAllVehicles_SUCCESS,
  GetAllVehicles_FAIL,
  AddVehicle_REQUEST,
  AddVehicle_SUCCESS,
  AddVehicle_FAIL,
  UpdateVehicle_REQUEST,
  UpdateVehicle_SUCCESS,
  UpdateVehicle_FAIL,
  DeleteVehicle_REQUEST,
  DeleteVehicle_SUCCESS,
  DeleteVehicle_FAIL
} from '../constants/VehicleConstants';

export const vehicleListReducer = (state = { vehicles: [] }, action) => {
  switch (action.type) {
    case GetAllVehicles_REQUEST:
      return { loading: true, vehicles: [] };
    case GetAllVehicles_SUCCESS:
      return { loading: false, vehicles: action.payload };
    case GetAllVehicles_FAIL:
      return { loading: false, error: action.payload };

    case AddVehicle_REQUEST:
      return { ...state, loading: true };
    case AddVehicle_SUCCESS:
      return {
        ...state,
        loading: false,
        vehicles: [...state.vehicles, action.payload],
      };
    case AddVehicle_FAIL:
      return { ...state, loading: false, error: action.payload };

    case UpdateVehicle_REQUEST:
      return { ...state, loading: true };
    case UpdateVehicle_SUCCESS:
      return {
        ...state,
        loading: false,
        vehicles: state.vehicles.map(vehicle =>
          vehicle.V_VehicleID.toString() === action.payload.V_VehicleID.toString() ? action.payload : vehicle
        ),
      };
    case UpdateVehicle_FAIL:
      return { ...state, loading: false, error: action.payload };

    case DeleteVehicle_REQUEST:
      return { ...state, loading: true };
    case DeleteVehicle_SUCCESS:
      // Remove the deleted vehicle from the state
      return {
        ...state,
        loading: false,
        vehicles: state.vehicles.filter(vehicle => 
          vehicle.V_VehicleID.toString() !== action.payload.toString()
        ),
      };
    case DeleteVehicle_FAIL:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};