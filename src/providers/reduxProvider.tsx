"use client";

import { Provider } from "react-redux";
import { persistor, store } from "@/redux/store.js";
import { PersistGate } from "redux-persist/integration/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      {/* <ReduxTest /> */}
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}