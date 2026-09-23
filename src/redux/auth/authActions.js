import { createAsyncThunk } from "@reduxjs/toolkit";
import { addProblem, updateProblem } from "@/api/problem";
import { loginUser, registerUser } from "@/api/auth";
import {addNotification} from "@/api/notification"
import {loginPassenger, registerPassenger, updatePassenger} from "@/api/passenger"
import {addPassengerProblem, updatePassengerProblem} from "@/api/passenger.problem"
import { apiErrorMessage } from "@/api/config";

// Stores the token and returns the user profile ({ userId, name, email, mobile, roles, ... })
export const loggedUser = createAsyncThunk(
  "login",
  async (data, { rejectWithValue }) => {
    try {
      const result = await loginUser(data);
      return result.user;
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error, "Login failed"));
    }
  },
);

export const registerUserApi = createAsyncThunk(
  "register",
  async (data, { rejectWithValue }) => {
    try {
      const result = await registerUser(data);
      return result;
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error, "Registration failed"));
    }
  },
);

export const addProblemApi = createAsyncThunk(
  "problem/add",
  async (data, { rejectWithValue }) => {
    try {
      const result = await addProblem(data);
      return result;
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error));
    }
  },
);

export const addNotificationAPI = createAsyncThunk(
  "notification/add",
  async (data, { rejectWithValue }) => {
    try {
      const result = await addNotification(data);
      // Token Pass
      // localStorage.setItem("authToken", result.token);
      return result;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

export const updateProblemApi = createAsyncThunk(
  "problem/edit",
  async ({id, ...data }, { rejectWithValue }) => {
    try {
      const result = await updateProblem(id, data);
      // Token Pass
      // localStorage.setItem("authToken", result.token);
      return result;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

// Passenger API
export const registerPassengerApi = createAsyncThunk(
  "registerPassenger",
  async (data, { rejectWithValue }) => {
    try {
      const result = await registerPassenger(data);
      return result;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

export const updatePassengerApi = createAsyncThunk(
  "passenger/edit",
  async ({id, ...data }, { rejectWithValue }) => {
    try {
      const result = await updatePassenger(id, data);
      // Token Pass
      // localStorage.setItem("authToken", result.token);
      return result;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

// Passenger Problem API
export const addPassengerProblemApi = createAsyncThunk(
  "passengerProblem/add",
  async (data, { rejectWithValue }) => {
    try {
      const result = await addPassengerProblem(data);
      // Token Pass
      // localStorage.setItem("authToken", result.token);
      return result;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

export const updatePassengerProblemApi = createAsyncThunk(
  "passengerProblem/edit",
  async ({id, ...data }, { rejectWithValue }) => {
    try {
      const result = await updatePassengerProblem(id, data);
      // Token Pass
      // localStorage.setItem("authToken", result.token);
      return result;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

export const loggedPassenger = createAsyncThunk(
  "loginPassenger",
  async (data, { rejectWithValue }) => {
    try {
      const result = await loginPassenger(data);
      // Token Pass
      localStorage.setItem("authToken", result.token);
      return result;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);