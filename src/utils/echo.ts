import { CONFIG } from "../../config/config";
import Echo from "laravel-echo";
import Pusher, { Channel } from "pusher-js";
import { api } from "../lib/api";

type AuthorizerCallBackType = {
  (error: Error | null, auth: any): void;
};

const authorizer = (channel: Channel) => {
  async function authorize(socketId: string, callback: AuthorizerCallBackType) {
    try {
      const response = await api.post("/broadcasting/auth", {
        socket_id: socketId,
        channel_name: channel.name,
      });
      callback(null, response.data);
    } catch (error: any) {
      console.error("Broadcast auth error:", error);
      callback(error instanceof Error ? error : new Error(String(error)), null);
    }
  }

  return { authorize };
};

// Validate required configuration
if (!CONFIG.REVERB_KEY) {
  console.warn("REVERB_KEY is not configured. Echo will not work properly.");
}

if (!CONFIG.REVERB_HOST) {
  console.warn("REVERB_HOST is not configured. Echo will not work properly.");
}

const pusherClient = new Pusher(CONFIG.REVERB_KEY || "", {
  wsHost: CONFIG.REVERB_HOST || "localhost",
  wsPort: CONFIG.REVERB_PORT || 6001,
  wssPort: CONFIG.REVERB_PORT || 6001,
  forceTLS: false,
  disableStats: true,
  cluster: "mt1",
  enabledTransports: ["ws", "wss"],
  authorizer: authorizer,
});

const echo = new Echo({
  broadcaster: "reverb",
  client: pusherClient,
});

export default echo;
