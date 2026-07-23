import { createSlice } from "@reduxjs/toolkit";

const userPreferenceSlice = createSlice({
  name: "userPreferences",
  initialState: {
    theme: "light",
    showCart: true,
  },

  reducers: {},
});

export default userPreferenceSlice.reducer;
