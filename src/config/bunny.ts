import axios from "axios";
import dotenv from "dotenv";
import { createHash } from "crypto";

dotenv.config();

const STREAM_BASE_URL = "https://video.bunnycdn.com";


console.log("Checking Bunny Variables:");
console.log("Library ID:", process.env.BUNNY_STREAM_LIBRARY_ID);
console.log("API Key:", process.env.BUNNY_STREAM_API_KEY ? "Loaded" : "MISSING");
console.log("CDN Hostname:", process.env.BUNNY_STREAM_CDN_HOSTNAME);
export const getBunnyConfig = () => {
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
  const apiKey = process.env.BUNNY_STREAM_API_KEY;
  const cdnHostname = process.env.BUNNY_STREAM_CDN_HOSTNAME;

  // Use a more explicit check
  if (
    libraryId === undefined || 
    apiKey === undefined || 
    cdnHostname === undefined
  ) {
    console.error("DEBUG - Config Missing:", { libraryId, apiKey, cdnHostname });
    throw new Error(
      "Bunny Stream is not configured. Set BUNNY_STREAM_LIBRARY_ID, BUNNY_STREAM_API_KEY and BUNNY_STREAM_CDN_HOSTNAME in server/.env",
    );
  }

  return { libraryId, apiKey, cdnHostname };
};

export const bunnyStreamApi = axios.create({
  baseURL: STREAM_BASE_URL,
});

export const withBunnyAuthHeaders = () => {
  const { apiKey } = getBunnyConfig();
  return {
    headers: {
      AccessKey: apiKey,
      accept: "application/json",
    },
  };
};

// Bunny TUS resumable-upload signature: sha256(libraryId + apiKey + expirationTime + videoId)
// https://docs.bunny.net/docs/stream-uploading#tus-resumable-uploads
export const generateTusSignature = (
  videoId: string,
  expirationTime: number,
) => {
  const { libraryId, apiKey } = getBunnyConfig();
  const raw = `${libraryId}${apiKey}${expirationTime}${videoId}`;
  return createHash("sha256").update(raw).digest("hex");
};

export const TUS_UPLOAD_ENDPOINT = `${STREAM_BASE_URL}/tusupload`;
