import mongoose, { Schema } from "mongoose";
import { WorkshopStatus } from "./types/workshop.types.js";

const workshopSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "title is required"],
    },
    description: {
      type: String,
      required: [true, "description is required"],
    },
    host: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "host is required"],
    },
    coverImage: String,
    roomName: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: Object.values(WorkshopStatus),
      default: WorkshopStatus.SCHEDULED,
    },
    scheduledAt: Date,
    startedAt: Date,
    endedAt: Date,
    maxParticipants: Number,
  },
  { timestamps: true },
);

// roomName is derived from the document's own _id so it's guaranteed unique
// without a separate uuid dependency.
workshopSchema.pre("validate", function () {
  if (!this.roomName) {
    this.roomName = `workshop_${this._id.toString()}`;
  }
});

export default mongoose.model("Workshop", workshopSchema);
