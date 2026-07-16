import mongoose, {Schema} from "mongoose";
import { UploadStatus } from "./types/video.types.js";


const videoSchema = new Schema ({
    lesson: {
        type: Schema.Types.ObjectId, 
        requred: [true, "lesson id is required"], 
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
        required: [true, "duration is required"]

    }, 
    order: Number, 
    status : {
        type: String, 
        enum: Object.values(UploadStatus), 
        default: UploadStatus.PROCESSING
    }
}, {timestamps: true})


export default mongoose.model("Video", videoSchema);