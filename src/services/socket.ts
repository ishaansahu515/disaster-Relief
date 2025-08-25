import { io, Socket } from "socket.io-client";
import { Resource, HelpRequest } from "../types";

class SocketService {
  private socket: Socket | null = null; // ✅ now TS knows it's client socket
  private token: string | null = null;

  connect(token: string) {
    this.token = token;

    const url =
      process.env.NODE_ENV === "production"
        ? "https://your-disaster-relief-api.com"
        : "http://localhost:5000";

    this.socket = io(url, {
      auth: { token },
      transports: ["websocket"],
    });

    this.socket.on("connect", () => {
      console.log("✅ Connected to real-time server");
    });

    this.socket.on("disconnect", () => {
      console.log("❌ Disconnected from real-time server");
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Resource events
  onResourceAdded(callback: (resource: Resource) => void) {
    this.socket?.on("resource:added", callback);
  }

  onResourceUpdated(callback: (resource: Resource) => void) {
    this.socket?.on("resource:updated", callback);
  }

  // Help request events
  onRequestAdded(callback: (request: HelpRequest) => void) {
    this.socket?.on("request:added", callback);
  }

  onRequestUpdated(callback: (request: HelpRequest) => void) {
    this.socket?.on("request:updated", callback);
  }

  onRequestAssigned(callback: (data: { requestId: string; volunteerId: string }) => void) {
    this.socket?.on("request:assigned", callback);
  }

  // Emergency alerts
  onEmergencyAlert(callback: (alert: any) => void) {
    this.socket?.on("emergency:alert", callback);
  }

  // Cleanup
  off(event: string, callback?: (...args: any[]) => void) {
    this.socket?.off(event, callback);
  }
}

export const socketService = new SocketService();
