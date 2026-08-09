import videoModel from "./video.model.js";
import lessonModel from "../lesson/lesson.model.js";
import { AppError } from "../../../error/AppError.js";
import { UploadStatus } from "./types/video.types.js";
import type { BunnyWebhookPayload, VideoUploadCredentials } from "./types/video.types.js";
import {
  bunnyStreamApi,
  withBunnyAuthHeaders,
  getBunnyConfig,
  generateTusSignature,
  TUS_UPLOAD_ENDPOINT,
} from "../../../config/bunny.js";
import { recomputeModuleDuration } from "../module/module.service.js";
import { assertLessonAccessible } from "../lesson/lesson.service.js";

const UPLOAD_SIGNATURE_TTL_SECONDS = 60 * 60; // 1 hour to complete the upload

const createBunnyVideoEntry = async (title: string) => {
  const { libraryId } = getBunnyConfig();
  try {
    const { data } = await bunnyStreamApi.post(
      `/library/${libraryId}/videos`,
      { title },
      withBunnyAuthHeaders(),
    );
    return data.guid as string;
  } catch (error) {
    throw new AppError("Failed to create video on Bunny Stream", 502);
  }
};

const deleteBunnyVideoEntry = async (bunnyVideoId: string) => {
  const { libraryId } = getBunnyConfig();
  try {
    await bunnyStreamApi.delete(
      `/library/${libraryId}/videos/${bunnyVideoId}`,
      withBunnyAuthHeaders(),
    );
  } catch (error) {
    // best-effort: the video may already be gone on Bunny's side
  }
};

const fetchBunnyVideoDetails = async (bunnyVideoId: string) => {
  const { libraryId } = getBunnyConfig();
  const { data } = await bunnyStreamApi.get(
    `/library/${libraryId}/videos/${bunnyVideoId}`,
    withBunnyAuthHeaders(),
  );
  return data as { length: number; thumbnailFileName?: string; status: number };
};

const buildUploadCredentials = (videoId: string): VideoUploadCredentials => {
  const { libraryId } = getBunnyConfig();
  const expirationTime = Math.floor(Date.now() / 1000) + UPLOAD_SIGNATURE_TTL_SECONDS;
  const signature = generateTusSignature(videoId, expirationTime);

  return {
    videoId,
    libraryId,
    uploadEndpoint: TUS_UPLOAD_ENDPOINT,
    signature,
    expirationTime,
  };
};

// Creates the Bunny video entry + a Video doc in UPLOADING state, and returns
// short-lived TUS upload credentials for the mobile app to upload directly to Bunny.
export const initiateLessonVideoUpload = async (lessonId: string, title: string) => {
  const lesson = await lessonModel.findById(lessonId);
  if (!lesson) {
    throw new AppError("lesson not found", 404);
  }

  const existing = await videoModel.findOne({ lesson: lessonId });
  if (existing) {
    await deleteBunnyVideoEntry(existing.bunnyVideoId);
    await existing.deleteOne();
  }

  const bunnyVideoId = await createBunnyVideoEntry(title);

  const video = await videoModel.create({
    lesson: lessonId,
    bunnyVideoId,
    title,
    status: UploadStatus.UPLOADING,
  });

  return {
    video,
    uploadCredentials: buildUploadCredentials(bunnyVideoId),
  };
};

export const getLessonVideo = async (lessonId: string) => {
  const video = await videoModel.findOne({ lesson: lessonId });
  if (!video) {
    throw new AppError("video not found for this lesson", 404);
  }
  return video;
};

// Same as getLessonVideo, but enforces preview/enrollment/ownership access first.
export const getLessonVideoGated = async (lessonId: string, currentUserId?: string) => {
  await assertLessonAccessible(lessonId, currentUserId);
  return getLessonVideo(lessonId);
};

export const deleteLessonVideo = async (lessonId: string) => {
  const video = await videoModel.findOne({ lesson: lessonId });
  if (!video) {
    throw new AppError("video not found for this lesson", 404);
  }

  const lesson = await lessonModel.findById(lessonId);

  await deleteBunnyVideoEntry(video.bunnyVideoId);
  await video.deleteOne();

  if (lesson) {
    await recomputeModuleDuration(lesson.module.toString());
  }
};

// Best-effort bulk delete used when cascading course/module/lesson deletes.
export const deleteVideosByLessonIds = async (lessonIds: string[]) => {
  if (lessonIds.length === 0) return;

  const videos = await videoModel.find({ lesson: { $in: lessonIds } });
  await Promise.all(videos.map((v) => deleteBunnyVideoEntry(v.bunnyVideoId)));
  await videoModel.deleteMany({ lesson: { $in: lessonIds } });
};

// Bunny Stream status codes: 0 Created, 1 Uploaded, 2 Processing, 3 Encoding,
// 4 Finished, 5 Resolution Finished, 6 Failed. See https://docs.bunny.net/docs/stream-webhook
const mapBunnyStatus = (status: number): UploadStatus => {
  if (status === 6) return UploadStatus.FAILED;
  if (status >= 4) return UploadStatus.READY;
  if (status >= 2) return UploadStatus.PROCESSING;
  return UploadStatus.UPLOADING;
};

export const handleBunnyWebhook = async (payload: BunnyWebhookPayload) => {
  const video = await videoModel.findOne({ bunnyVideoId: payload.VideoGuid });
  if (!video) return;

  const status = mapBunnyStatus(payload.Status);
  video.status = status;

  if (status === UploadStatus.READY) {
    const { cdnHostname } = getBunnyConfig();
    const details = await fetchBunnyVideoDetails(payload.VideoGuid);
    video.duration = details.length ?? 0;
    if (details.thumbnailFileName) {
      video.thumbnailUrl = `https://${cdnHostname}/${payload.VideoGuid}/${details.thumbnailFileName}`;
    }
  }

  await video.save();

  if (status === UploadStatus.READY) {
    const lesson = await lessonModel.findById(video.lesson);
    if (lesson) {
      await recomputeModuleDuration(lesson.module.toString());
    }
  }
};

export const getVideoPlaybackInfo = async (lessonId: string, currentUserId?: string) => {
  await assertLessonAccessible(lessonId, currentUserId);
  const video = await getLessonVideo(lessonId);
  const { cdnHostname } = getBunnyConfig();

  return {
    status: video.status,
    duration: video.duration,
    playbackUrl:
      video.status === UploadStatus.READY
        ? `https://${cdnHostname}/${video.bunnyVideoId}/playlist.m3u8`
        : null,
    thumbnailUrl: video.thumbnailUrl ?? null,
  };
};
