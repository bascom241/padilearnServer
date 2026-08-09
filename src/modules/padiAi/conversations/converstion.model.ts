import mongoose, {Schema} from "mongoose";
import { maxLength } from "zod";


export const conversationSchema = new Schema ({
  userId: {
    type: Schema.Types.ObjectId, 
    required: [true, "user id is required"]
  }, 
  title: {
    type: String, 
    required: [true, "title is required"], 
    trim: true, 
    maxLength: 200 
  }, 
  model: {
    type: String,
    required: [true, "model is required"], 
    default: "Gemini 3.1 Flash Lite"
  }, 
  messageCount: {
    type: Number, 
    default: 0
  }, 
  lastMessageAt: {
    type: Date
  }

}, {timestamps: true}); 


export default mongoose.model("Conversation", conversationSchema)