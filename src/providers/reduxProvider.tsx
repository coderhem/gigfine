"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { Provider } from "react-redux";
import { persistor, store } from "@/redux/store.js";
import { PUBLIC_ROUTES } from "@/app/seo";

const subscribe = (onChange: () => void) => persistor.subscribe(onChange);
const isRehydrated = () => persistor.getState().bootstrapped;
// On the server the persisted state never loads
const notRehydrated = () => false;

// Replaces <PersistGate loading={null}>, which rendered nothing on the server —
// every page shipped an empty <body> to search engines and link previews.
// Public pages now render immediately (and server-side); pages that depend on
// the logged-in user still wait for the persisted auth state.
function RehydrationGate({ children }: { children: React.ReactNode }) {
  const pathname = decodeURIComponent(usePathname() ?? "");
  const rehydrated = useSyncExternalStore(subscribe, isRehydrated, notRehydrated);

  if (!rehydrated && !PUBLIC_ROUTES.includes(pathname)) {
    return null;
  }
  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <RehydrationGate>{children}</RehydrationGate>
    </Provider>
  );
}
