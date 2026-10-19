import React from "react";
import { AuthProvider } from "./features/auth/context/AuthContext";
import AppRouter from "./routes/AppRouter";

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
