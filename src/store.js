import { createStore, combineReducers, applyMiddleware } from 'redux';
import {thunk} from 'redux-thunk';
import { serviceListReducer } from './reducers/serviceReducer';
import { partsInventoryReducer } from './reducers/partsInventoryReducer';
import { customerListReducer } from './reducers/customerReducer';
import { appointmentListReducer } from './reducers/appointmentReducer';
import { jobCardListReducer } from './reducers/jobCardReducer';
import { jobCardItemListReducer } from './reducers/jobCardItemReducer';
import { vehicleListReducer } from './reducers/vehicleReducer';
import { adminReducer } from './reducers/adminReducer';
import { userSignupReducer } from './reducers/userReducer';
import authReducer from './reducers/authReducer';
import { categoryListReducer } from './reducers/categoryReducer';
import { invoiceListReducer } from './reducers/invoiceReducer'; // Add invoice reducer import

// Combine your reducers
const rootReducer = combineReducers({
  serviceList: serviceListReducer,
  partsInventory: partsInventoryReducer,
  customerList: customerListReducer,
  appointmentList: appointmentListReducer,
  jobCardList: jobCardListReducer,
  jobCardItemList: jobCardItemListReducer,
  vehicleList: vehicleListReducer,
  admin: adminReducer,
  userSignup: userSignupReducer,
  auth: authReducer,
  categoryList: categoryListReducer,
  invoiceList: invoiceListReducer, // Add invoice reducer here
});

// Create the store with middleware
const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;