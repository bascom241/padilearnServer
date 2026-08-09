import mongoose, {Schema} from "mongoose";
export const messageSchema = new Schema ({

    conversationId: {
        type: Schema.Types.ObjectId, 
        required: [true, "conversation id is required"]
    }, 
    type: {
        type: String, 
        enum: ["text", "image", "file", "audio"], 
        default: "text"
    }, 
    tokenUsage: {
        input: Number, 
        output: Number, 
        total: Number
    }, 
    metadata: {
        type: Schema.Types.Mixed
    }
}, {timestamps: true}); 

export default mongoose.model("Message", messageSchema); 