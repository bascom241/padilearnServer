import waitlistModel from "./waitlist.model.js";
import type { JoinWaitlistRequest } from "./dtos/JoinWaitlistRequest.dto.js";

// Idempotent: signing up twice with the same email is a no-op success,
// not an error — no need to leak "this email already joined" to the client.
export const joinWaitlist = async (data: JoinWaitlistRequest) => {
  await waitlistModel.findOneAndUpdate(
    { email: data.email },
    { email: data.email },
    { upsert: true },
  );
};

export const listWaitlist = async () => {
  return waitlistModel.find().sort({ createdAt: -1 });
};
