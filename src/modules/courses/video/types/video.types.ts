export enum UploadStatus {
    CREATED = "created",
    UPLOADING = "uploading",
    PROCESSING = "processing",
    READY = "ready",
    FAILED = "failed",
}

// https://docs.bunny.net/docs/stream-webhook
export interface BunnyWebhookPayload {
    VideoLibraryId: number;
    VideoGuid: string;
    Status: number;
}

export interface VideoUploadCredentials {
    videoId: string;
    libraryId: string;
    uploadEndpoint: string;
    signature: string;
    expirationTime: number;
}
