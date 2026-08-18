import { createAsyncThunk } from "@reduxjs/toolkit";
import { addProblem, updateProblem } from "@/api/problem";
import { loginUser, registerUser } from "@/api/auth";
import {addNotification} from "@/api/notification"

export const loggedUser = createAsyncThunk(
  "login",
  async (data, { rejectWithValue }) => {
    try {
      const result = await loginUser(data);
      // Token Pass
      localStorage.setItem("authToken", result.token);
      return result;
    } catch (error) {
      return rejectWithValue(error.response?.data);
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
      return rejectWithValue(error.response?.data);
    }
  },
);

export const addProblemApi = createAsyncThunk(
  "problem/add",
  async (data, { rejectWithValue }) => {
    try {
      const result = await addProblem(data);
      // Token Pass
      // localStorage.setItem("authToken", result.token);
      return result;
    } catch (error) {
      return rejectWithValue(error.response?.data);
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
