import { addProblemApi, loggedUser, registerUserApi } from "./authActions.js";
import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("authToken");
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(registerUserApi.pending, (state) => {
        state.loading = true;
        ((state.error = null), (state.user = null));
      })
      .addCase(registerUserApi.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUserApi.rejected, (state, action) => {
        ((state.loading = false), (state.error = action.payload));
      })
      .addCase(loggedUser.pending, (state) => {
        state.loading = true;
        ((state.error = null), (state.user = null));
      })
      .addCase(loggedUser.fulfilled, (state, action) => {
        ((state.loading = false), (state.user = action.payload));
      })
      .addCase(loggedUser.rejected, (state, action) => {
        ((state.loading = false), (state.error = action.payload));
      })
      .addCase(addProblemApi.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProblemApi.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addProblemApi.rejected, (state, action) => {
        ((state.loading = false), (state.error = action.payload));
      }),
});
export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
