import axios from "axios";
import dotenv from "dotenv";
import { createHmac } from "crypto";

dotenv.config();

const getPaystackSecret = () => {
  const secret = process.env.PAYSTACK_SECRET;
  if (!secret) {
    throw new Error("PAYSTACK_SECRET is not set in server/.env");
  }
  return secret;
};

export const paystackApi = axios.create({
  baseURL: "https://api.paystack.co",
});

export const withPaystackAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getPaystackSecret()}`,
    "Content-Type": "application/json",
  },
});

export const verifyPaystackSignature = (rawBody: string, signature: string | undefined) => {
  if (!signature) return false;
  const hash = createHmac("sha512", getPaystackSecret()).update(rawBody).digest("hex");
  return hash === signature;
};
