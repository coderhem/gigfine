import { configureStore } from "@reduxjs/toolkit";
import userPreferenceReducer from "./userPreferences/userPreferenceSlice.js";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import rootReducer from "./rootReducer.js";
import persistStore from "redux-persist/lib/persistStore";

const persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
});

const persistor = persistStore(store);

export { store, persistor };
