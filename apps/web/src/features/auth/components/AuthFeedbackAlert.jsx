import React from "react";
import { AlertCircle } from "lucide-react";
import Typography from "../../../components/ui/Typography";

/**
 * Component hiển thị thông báo lỗi thân thiện cho người dùng trên Web
 */
export default function AuthFeedbackAlert({ message }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="mb-6 p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-3"
    >
      <AlertCircle className="w-5 h-5 text-status-danger shrink-0 mt-0.5" />
      <div>
        <Typography variant="body-sm" className="text-rose-900 font-medium">
          {message}
        </Typography>
      </div>
    </div>
  );
}
