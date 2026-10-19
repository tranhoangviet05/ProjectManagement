import { useContext } from "react";
import { AuthContext } from "../features/auth/context/AuthContext";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải được đặt bên trong AuthProvider.");
  }
  return context;
}

export default useAuth;
