import mongoose, {Schema} from "mongoose";



const lessonSchema = new Schema({
    module: {
        type: Schema.Types.ObjectId, 
        ref:"Module", 
        required: [true, "module id is required"]
    }, 
    title: {
        type: String, 
        required: [true, "title is required"]
    }, 
    description: {
        type: String, 
        required: [true, "description"]
    }, 
    order: {
        type: Number,
        default: 0,
    },
    isPreview: {
        type: Boolean, 
        default: false
    }
}, {timestamps: true})



export default mongoose.model("Lesson", lessonSchema); 