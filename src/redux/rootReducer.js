import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice.js";

const rootReducer = combineReducers({
  auth: authReducer,
});

export default rootReducer;
