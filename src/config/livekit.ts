import { AccessToken, RoomServiceClient, WebhookReceiver } from "livekit-server-sdk";
import dotenv from "dotenv";

dotenv.config();

export const getLiveKitConfig = () => {
  const url = process.env.LIVEKIT_URL;
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!url || !apiKey || !apiSecret) {
    throw new Error(
      "LiveKit is not configured. Set LIVEKIT_URL, LIVEKIT_API_KEY and LIVEKIT_API_SECRET in server/.env",
    );
  }

  return { url, apiKey, apiSecret };
};

// RoomServiceClient wants an https:// host, not the wss:// url mobile clients connect with.
const toHttpHost = (url: string) => url.replace(/^wss:\/\//, "https://").replace(/^ws:\/\//, "http://");

export const getRoomServiceClient = () => {
  const { url, apiKey, apiSecret } = getLiveKitConfig();
  return new RoomServiceClient(toHttpHost(url), apiKey, apiSecret);
};

export const generateLiveKitToken = async (options: {
  roomName: string;
  identity: string;
  name: string;
  canPublish: boolean;
}) => {
  const { apiKey, apiSecret } = getLiveKitConfig();
  const token = new AccessToken(apiKey, apiSecret, {
    identity: options.identity,
    name: options.name,
    ttl: "4h",
  });

  token.addGrant({
    room: options.roomName,
    roomJoin: true,
    canPublish: options.canPublish,
    canSubscribe: true,
    canPublishData: true,
  });

  return token.toJwt();
};

export const getWebhookReceiver = () => {
  const { apiKey, apiSecret } = getLiveKitConfig();
  return new WebhookReceiver(apiKey, apiSecret);
};
