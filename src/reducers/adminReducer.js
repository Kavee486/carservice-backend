// adminReducer.js
import {
    GET_ALL_BOOKINGS_REQUEST,
    GET_ALL_BOOKINGS_SUCCESS,
    GET_ALL_BOOKINGS_FAIL,
    GET_ALL_PARTS_REQUEST,
    GET_ALL_PARTS_SUCCESS,
    GET_ALL_PARTS_FAIL,
    GET_ALL_SERVICES_REQUEST,
    GET_ALL_SERVICES_SUCCESS,
    GET_ALL_SERVICES_FAIL,
    GET_ALL_VEHICLES_REQUEST,
    GET_ALL_VEHICLES_SUCCESS,
    GET_ALL_VEHICLES_FAIL,
    GET_ALL_USERS_REQUEST,
    GET_ALL_USERS_SUCCESS,
    GET_ALL_USERS_FAIL,
    GET_DASHBOARD_STATS_REQUEST,
    GET_DASHBOARD_STATS_SUCCESS,
    GET_DASHBOARD_STATS_FAIL,
    GET_LATEST_BOOKINGS_REQUEST,
    GET_LATEST_BOOKINGS_SUCCESS,
    GET_LATEST_BOOKINGS_FAIL
} from '../constants/AdminConstants';

const initialState = {
    bookings: {
        loading: false,
        data: [],
        error: null
    },
    parts: {
        loading: false,
        data: [],
        error: null
    },
    services: {
        loading: false,
        data: [],
        error: null
    },
    vehicles: {
        loading: false,
        data: [],
        error: null
    },
    users: {
        loading: false,
        data: [],
        error: null
    },
    dashboardStats: {
        loading: false,
        data: null,
        error: null
    },
    latestBookings: {
        loading: false,
        data: [],
        error: null
    }
};

export const adminReducer = (state = initialState, action) => {
    switch (action.type) {
        // Bookings
        case GET_ALL_BOOKINGS_REQUEST:
            return {
                ...state,
                bookings: {
                    loading: true,
                    data: [],
                    error: null
                }
            };
        case GET_ALL_BOOKINGS_SUCCESS:
            return {
                ...state,
                bookings: {
                    loading: false,
                    data: action.payload,
                    error: null
                }
            };
        case GET_ALL_BOOKINGS_FAIL:
            return {
                ...state,
                bookings: {
                    loading: false,
                    data: [],
                    error: action.payload
                }
            };

        // Parts
        case GET_ALL_PARTS_REQUEST:
            return {
                ...state,
                parts: {
                    loading: true,
                    data: [],
                    error: null
                }
            };
        case GET_ALL_PARTS_SUCCESS:
            return {
                ...state,
                parts: {
                    loading: false,
                    data: action.payload,
                    error: null
                }
            };
        case GET_ALL_PARTS_FAIL:
            return {
                ...state,
                parts: {
                    loading: false,
                    data: [],
                    error: action.payload
                }
            };

        // Services
        case GET_ALL_SERVICES_REQUEST:
            return {
                ...state,
                services: {
                    loading: true,
                    data: [],
                    error: null
                }
            };
        case GET_ALL_SERVICES_SUCCESS:
            return {
                ...state,
                services: {
                    loading: false,
                    data: action.payload,
                    error: null
                }
            };
        case GET_ALL_SERVICES_FAIL:
            return {
                ...state,
                services: {
                    loading: false,
                    data: [],
                    error: action.payload
                }
            };

        // Vehicles
        case GET_ALL_VEHICLES_REQUEST:
            return {
                ...state,
                vehicles: {
                    loading: true,
                    data: [],
                    error: null
                }
            };
        case GET_ALL_VEHICLES_SUCCESS:
            return {
                ...state,
                vehicles: {
                    loading: false,
                    data: action.payload,
                    error: null
                }
            };
        case GET_ALL_VEHICLES_FAIL:
            return {
                ...state,
                vehicles: {
                    loading: false,
                    data: [],
                    error: action.payload
                }
            };

        // Users
        case GET_ALL_USERS_REQUEST:
            return {
                ...state,
                users: {
                    loading: true,
                    data: [],
                    error: null
                }
            };
        case GET_ALL_USERS_SUCCESS:
            return {
                ...state,
                users: {
                    loading: false,
                    data: action.payload,
                    error: null
                }
            };
        case GET_ALL_USERS_FAIL:
            return {
                ...state,
                users: {
                    loading: false,
                    data: [],
                    error: action.payload
                }
            };

        // Dashboard Stats
        case GET_DASHBOARD_STATS_REQUEST:
            return {
                ...state,
                dashboardStats: {
                    loading: true,
                    data: null,
                    error: null
                }
            };
        case GET_DASHBOARD_STATS_SUCCESS:
            return {
                ...state,
                dashboardStats: {
                    loading: false,
                    data: action.payload,
                    error: null
                }
            };
        case GET_DASHBOARD_STATS_FAIL:
            return {
                ...state,
                dashboardStats: {
                    loading: false,
                    data: null,
                    error: action.payload
                }
            };

        // Latest Bookings
        case GET_LATEST_BOOKINGS_REQUEST:
            return {
                ...state,
                latestBookings: {
                    loading: true,
                    data: [],
                    error: null
                }
            };
        case GET_LATEST_BOOKINGS_SUCCESS:
            return {
                ...state,
                latestBookings: {
                    loading: false,
                    data: action.payload,
                    error: null
                }
            };
        case GET_LATEST_BOOKINGS_FAIL:
            return {
                ...state,
                latestBookings: {
                    loading: false,
                    data: [],
                    error: action.payload
                }
            };

        default:
            return state;
    }
};