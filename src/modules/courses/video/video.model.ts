import mongoose, {Schema} from "mongoose";
import { UploadStatus } from "./types/video.types.js";


const videoSchema = new Schema ({
    lesson: {
        type: Schema.Types.ObjectId,
        required: [true, "lesson id is required"],
        ref: "Lesson"
    },
    bunnyVideoId: {
        type: String,
        required: [true, "bunny id is required"]
    },
    title: {
        type: String,
        required: [true, "title is required"]
    },
    description: String,
    duration:  {
        type: Number,
        default: 0,
    },
    thumbnailUrl: String,
    order: {
        type: Number,
        default: 0,
    },
    status : {
        type: String,
        enum: Object.values(UploadStatus),
        default: UploadStatus.CREATED
    }
}, {timestamps: true})


export default mongoose.model("Video", videoSchema);
