import React, { createContext, useState } from "react";
import authService from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const login = async (email, password) => {
    setIsSubmitting(true);
    try {
      const response = await authService.login(email, password);
      setUser(response.data);
      return {
        success: true,
        user: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Email hoặc mật khẩu chưa chính xác.",
        errors: error.errors || null,
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  const register = async (payload) => {
    setIsSubmitting(true);
    try {
      const response = await authService.register(payload);
      setUser(response.data);
      return {
        success: true,
        user: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Không thể hoàn tất đăng ký tài khoản.",
        errors: error.errors || null,
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: Boolean(user),
        isSubmitting,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
