import type { CreateWorkshopRequest } from "./dtos/CreateWorkshopRequest.dto.js";
import type { UpdateWorkshopRequest } from "./dtos/UpdateWorkshopRequest.dto.js";
import workshopModel from "./workshop.model.js";
import userModel from "../user/user.model.js";
import { AppError } from "../../error/AppError.js";
import { WorkshopStatus } from "./types/workshop.types.js";
import {
  getRoomServiceClient,
  generateLiveKitToken,
} from "../../config/livekit.js";
import type { WebhookEvent } from "livekit-server-sdk";

export interface ListWorkshopsQuery {
  status?: string;
  host?: string;
  page?: string;
  limit?: string;
}

export const createWorkshop = async (
  data: CreateWorkshopRequest,
  hostId: string,
) => {
  const { coverImage, scheduledAt, maxParticipants, ...required } = data;
  return workshopModel.create({
    ...required,
    host: hostId,
    ...(coverImage !== undefined && { coverImage }),
    ...(scheduledAt !== undefined && { scheduledAt }),
    ...(maxParticipants !== undefined && { maxParticipants }),
  });
};

// Explore feed: live workshops first, then soonest-scheduled, then most recently ended.
export const listWorkshops = async (query: ListWorkshopsQuery) => {
  const filter: Record<string, unknown> = {};
  if (query.status) filter.status = query.status;
  if (query.host) filter.host = query.host;

  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);

  const statusOrder: Record<string, number> = {
    [WorkshopStatus.LIVE]: 0,
    [WorkshopStatus.SCHEDULED]: 1,
    [WorkshopStatus.ENDED]: 2,
    [WorkshopStatus.CANCELLED]: 3,
  };

  const [workshops, total] = await Promise.all([
    workshopModel
      .find(filter)
      .populate("host", "fullName email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    workshopModel.countDocuments(filter),
  ]);

  workshops.sort(
    (a, b) => (statusOrder[a.status as string] ?? 9) - (statusOrder[b.status as string] ?? 9),
  );

  return {
    workshops,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

const findWorkshopOrThrow = async (workshopId: string) => {
  const workshop = await workshopModel.findById(workshopId);
  if (!workshop) {
    throw new AppError("workshop not found", 404);
  }
  return workshop;
};

export const getWorkshopById = async (workshopId: string) => {
  const workshop = await workshopModel
    .findById(workshopId)
    .populate("host", "fullName email");
  if (!workshop) {
    throw new AppError("workshop not found", 404);
  }
  return workshop;
};

const assertHostOrAdmin = (
  workshop: { host: { toString(): string } },
  currentUser: { id: string; role: string },
) => {
  if (currentUser.role !== "admin" && workshop.host.toString() !== currentUser.id) {
    throw new AppError("You do not have permission to manage this workshop", 403);
  }
};

export const updateWorkshop = async (
  workshopId: string,
  data: UpdateWorkshopRequest,
  currentUser: { id: string; role: string },
) => {
  const workshop = await findWorkshopOrThrow(workshopId);
  assertHostOrAdmin(workshop, currentUser);

  if (workshop.status === WorkshopStatus.ENDED || workshop.status === WorkshopStatus.CANCELLED) {
    throw new AppError("Cannot edit a workshop that has already ended", 400);
  }

  Object.assign(workshop, data);
  await workshop.save();
  return workshop;
};

export const startWorkshop = async (
  workshopId: string,
  currentUser: { id: string; role: string },
) => {
  const workshop = await findWorkshopOrThrow(workshopId);
  assertHostOrAdmin(workshop, currentUser);

  if (workshop.status !== WorkshopStatus.SCHEDULED) {
    throw new AppError("Only a scheduled workshop can be started", 400);
  }

  const roomService = getRoomServiceClient();
  await roomService.createRoom({
    name: workshop.roomName,
    emptyTimeout: 5 * 60,
    ...(workshop.maxParticipants && { maxParticipants: workshop.maxParticipants }),
  });

  workshop.status = WorkshopStatus.LIVE;
  workshop.startedAt = new Date();
  await workshop.save();
  return workshop;
};

export const endWorkshop = async (
  workshopId: string,
  currentUser: { id: string; role: string },
) => {
  const workshop = await findWorkshopOrThrow(workshopId);
  assertHostOrAdmin(workshop, currentUser);

  if (workshop.status !== WorkshopStatus.LIVE) {
    throw new AppError("Only a live workshop can be ended", 400);
  }

  const roomService = getRoomServiceClient();
  try {
    await roomService.deleteRoom(workshop.roomName);
  } catch (error) {
    // room may already be gone if everyone left and emptyTimeout fired
  }

  workshop.status = WorkshopStatus.ENDED;
  workshop.endedAt = new Date();
  await workshop.save();
  return workshop;
};

export const cancelWorkshop = async (
  workshopId: string,
  currentUser: { id: string; role: string },
) => {
  const workshop = await findWorkshopOrThrow(workshopId);
  assertHostOrAdmin(workshop, currentUser);

  if (workshop.status === WorkshopStatus.LIVE) {
    const roomService = getRoomServiceClient();
    try {
      await roomService.deleteRoom(workshop.roomName);
    } catch (error) {
      // best-effort
    }
  }

  workshop.status = WorkshopStatus.CANCELLED;
  await workshop.save();
  return workshop;
};

// Anyone authenticated can join as a listener; only the host can publish audio
// until they promote another participant to speaker.
export const joinWorkshop = async (
  workshopId: string,
  currentUser: { id: string; role: string },
) => {
  const workshop = await findWorkshopOrThrow(workshopId);

  if (workshop.status !== WorkshopStatus.LIVE) {
    throw new AppError("This workshop is not live", 400);
  }

  const user = await userModel.findById(currentUser.id);
  if (!user) {
    throw new AppError("user not found", 404);
  }

  const isHost = workshop.host.toString() === currentUser.id;

  const token = await generateLiveKitToken({
    roomName: workshop.roomName,
    identity: currentUser.id,
    name: user.fullName,
    canPublish: isHost,
  });

  return { token, roomName: workshop.roomName, isHost };
};

const assertRequesterIsHostOrAdmin = async (
  workshopId: string,
  currentUser: { id: string; role: string },
) => {
  const workshop = await findWorkshopOrThrow(workshopId);
  assertHostOrAdmin(workshop, currentUser);
  return workshop;
};

export const promoteParticipant = async (
  workshopId: string,
  targetUserId: string,
  currentUser: { id: string; role: string },
) => {
  const workshop = await assertRequesterIsHostOrAdmin(workshopId, currentUser);
  const roomService = getRoomServiceClient();

  return roomService.updateParticipant(workshop.roomName, targetUserId, {
    permission: { canPublish: true, canSubscribe: true, canPublishData: true },
  });
};

export const demoteParticipant = async (
  workshopId: string,
  targetUserId: string,
  currentUser: { id: string; role: string },
) => {
  const workshop = await assertRequesterIsHostOrAdmin(workshopId, currentUser);
  const roomService = getRoomServiceClient();

  return roomService.updateParticipant(workshop.roomName, targetUserId, {
    permission: { canPublish: false, canSubscribe: true, canPublishData: true },
  });
};

// Safety net: if a room closes on LiveKit's side (e.g. emptyTimeout) without
// the host explicitly calling /end, mark the workshop ended so it drops out
// of the "live" section of the Explore feed.
export const handleLiveKitWebhookEvent = async (event: WebhookEvent) => {
  if (event.event !== "room_finished" || !event.room?.name) return;

  await workshopModel.findOneAndUpdate(
    { roomName: event.room.name, status: WorkshopStatus.LIVE },
    { status: WorkshopStatus.ENDED, endedAt: new Date() },
  );
};
