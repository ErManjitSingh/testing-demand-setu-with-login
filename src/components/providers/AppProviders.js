"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { SessionProvider } from "next-auth/react";
import { Provider } from "react-redux";
import { store } from "@/store";

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "492030504571-dki8c9oc6i58i0fjhesqvusikg5pve3o.apps.googleusercontent.com";

export default function AppProviders({ children }) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <SessionProvider>
        <Provider store={store}>{children}</Provider>
      </SessionProvider>
    </GoogleOAuthProvider>
  );
}
