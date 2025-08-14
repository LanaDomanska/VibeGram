// src/models/Notification.js
import { Schema, model, Types } from "mongoose";

const notificationSchema = new Schema({
  user: { type: Types.ObjectId, ref: "user", required: true },
  type: {
    type: String,
    enum: ["like", "comment", "follow", "message"],
    required: true,
  },
  fromUser: { type: Types.ObjectId, ref: "user", required: true },
  post: { type: Types.ObjectId, ref: "post" },
  read: { type: Boolean, default: false },     // можно оставить
  readAt: { type: Date },                      // ← используем на фронте
}, { timestamps: true, versionKey: false });

export default model("notification", notificationSchema);
