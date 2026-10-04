import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    notifType: {
      type: String,
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    fromId: {
      type: String,
      required: true,
    },
    toId: {
      type: String,
      required: true,
    },
    // read: {
    //   type: Boolean,
    //   default: false,
    // },
  },
  {
    timestamps: true,
  },
);

// Fast lookup of a user's notifications, newest first
// notificationSchema.index({ toId: 1, createdAt: -1 });

export default mongoose.models.Notifications ||
  mongoose.model("Notifications", notificationSchema);
