import { createStore } from 'redux';

// Define initial state
const initialState = {
    available: false,
    earningsToday: 0,
    jobsToday: 0,
    rating: 0,
    activeJob: null,
    jobStatus: 'none', // 'assigned', 'on the way', 'working', 'done'
    earningsThisWeek: 0,
    totalJobs: 0,
    welfare: 0,
    profile: {
        photo: '',
        name: '',
        cooperativeBadge: '',
        skills: [],
        certificates: [],
        experience: 0,
    },
};

// Define action types
const TOGGLE_AVAILABILITY = 'TOGGLE_AVAILABILITY';
const SET_EARNINGS_TODAY = 'SET_EARNINGS_TODAY';
const SET_JOBS_TODAY = 'SET_JOBS_TODAY';
const SET_RATING = 'SET_RATING';
const SET_ACTIVE_JOB = 'SET_ACTIVE_JOB';
const SET_JOB_STATUS = 'SET_JOB_STATUS';
const SET_EARNINGS_THIS_WEEK = 'SET_EARNINGS_THIS_WEEK';
const SET_TOTAL_JOBS = 'SET_TOTAL_JOBS';
const SET_WELFARE = 'SET_WELFARE';
const UPDATE_PROFILE = 'UPDATE_PROFILE';

// Define reducer
const workerReducer = (state = initialState, action) => {
    switch (action.type) {
        case TOGGLE_AVAILABILITY:
            return { ...state, available: !state.available };
        case SET_EARNINGS_TODAY:
            return { ...state, earningsToday: action.payload };
        case SET_JOBS_TODAY:
            return { ...state, jobsToday: action.payload };
        case SET_RATING:
            return { ...state, rating: action.payload };
        case SET_ACTIVE_JOB:
            return { ...state, activeJob: action.payload };
        case SET_JOB_STATUS:
            return { ...state, jobStatus: action.payload };
        case SET_EARNINGS_THIS_WEEK:
            return { ...state, earningsThisWeek: action.payload };
        case SET_TOTAL_JOBS:
            return { ...state, totalJobs: action.payload };
        case SET_WELFARE:
            return { ...state, welfare: action.payload };
        case UPDATE_PROFILE:
            return { ...state, profile: { ...state.profile, ...action.payload } };
        default:
            return state;
    }
};

// Create store
const store = createStore(workerReducer);

export default store;