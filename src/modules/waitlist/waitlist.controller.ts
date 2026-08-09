import type { Response, NextFunction, Request } from "express";
import { joinWaitlist, listWaitlist } from "./waitlist.service.js";

export const handleJoinWaitlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await joinWaitlist(req.body);
    res.status(201).json({ success: true, message: "you're on the list" });
  } catch (error) {
    next(error);
  }
};

export const handleListWaitlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entries = await listWaitlist();
    res.status(200).json({ success: true, data: entries });
  } catch (error) {
    next(error);
  }
};
