import Echo from "laravel-echo";
import Pusher from "pusher-js";

// React Native không có đối tượng window toàn cục
global.Pusher = Pusher;

export const echo = new Echo({
  broadcaster: "reverb",
  key: process.env.EXPO_PUBLIC_REVERB_APP_KEY || "stb_app_key",
  wsHost: process.env.EXPO_PUBLIC_REVERB_HOST || "192.168.1.x", // Thay bằng IP máy tính của bạn
  wsPort: Number(process.env.EXPO_PUBLIC_REVERB_PORT) || 8080,
  wssPort: Number(process.env.EXPO_PUBLIC_REVERB_PORT) || 8080,
  forceTLS: false,
  enabledTransports: ["ws", "wss"],
});
