import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const baseUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:4000";
    const namespace = "/api/v1/chat";
    console.log("🔌 Connecting to WebSocket:", `${baseUrl}${namespace}`);
    
    socket = io(`${baseUrl}${namespace}`, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket?.id);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message);
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
