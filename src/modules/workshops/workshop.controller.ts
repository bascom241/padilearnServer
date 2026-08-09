import type { Response, NextFunction, Request } from "express";
import type { AuthorizedRequest } from "../../middlewares/authorize.middleware.js";
import {
  createWorkshop,
  listWorkshops,
  getWorkshopById,
  updateWorkshop,
  startWorkshop,
  endWorkshop,
  cancelWorkshop,
  joinWorkshop,
  promoteParticipant,
  demoteParticipant,
  handleLiveKitWebhookEvent,
} from "./workshop.service.js";
import { getWebhookReceiver } from "../../config/livekit.js";

export const handleCreateWorkshop = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const workshop = await createWorkshop(req.body, req.currentUser!.id);
    res.status(201).json({ success: true, data: workshop });
  } catch (error) {
    next(error);
  }
};

export const handleListWorkshops = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await listWorkshops(req.query as Record<string, string>);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const handleGetWorkshop = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const workshop = await getWorkshopById(req.params.workshopId as string);
    res.status(200).json({ success: true, data: workshop });
  } catch (error) {
    next(error);
  }
};

export const handleUpdateWorkshop = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const workshop = await updateWorkshop(
      req.params.workshopId as string,
      req.body,
      req.currentUser!,
    );
    res.status(200).json({ success: true, data: workshop });
  } catch (error) {
    next(error);
  }
};

export const handleStartWorkshop = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const workshop = await startWorkshop(req.params.workshopId as string, req.currentUser!);
    res.status(200).json({ success: true, data: workshop });
  } catch (error) {
    next(error);
  }
};

export const handleEndWorkshop = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const workshop = await endWorkshop(req.params.workshopId as string, req.currentUser!);
    res.status(200).json({ success: true, data: workshop });
  } catch (error) {
    next(error);
  }
};

export const handleCancelWorkshop = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const workshop = await cancelWorkshop(req.params.workshopId as string, req.currentUser!);
    res.status(200).json({ success: true, data: workshop });
  } catch (error) {
    next(error);
  }
};

export const handleJoinWorkshop = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await joinWorkshop(req.params.workshopId as string, req.currentUser!);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const handlePromoteParticipant = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    await promoteParticipant(
      req.params.workshopId as string,
      req.params.userId as string,
      req.currentUser!,
    );
    res.status(200).json({ success: true, message: "participant promoted to speaker" });
  } catch (error) {
    next(error);
  }
};

export const handleDemoteParticipant = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    await demoteParticipant(
      req.params.workshopId as string,
      req.params.userId as string,
      req.currentUser!,
    );
    res.status(200).json({ success: true, message: "participant moved back to listener" });
  } catch (error) {
    next(error);
  }
};

// Public endpoint LiveKit calls on room lifecycle events — verified via
// LiveKit's own signed Authorization header, not a shared secret.
export const handleLiveKitWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const receiver = getWebhookReceiver();
    const authHeader = req.headers.authorization;
    const event = await receiver.receive(req.body as unknown as string, authHeader);
    await handleLiveKitWebhookEvent(event);
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
