import { Schema, model, Types } from "mongoose";

const messageSchema = new Schema({
  sender: { type: Types.ObjectId, ref: "user", required: true },
  recipient: { type: Types.ObjectId, ref: "user", required: true },
  content: { type: String, required: true },
  read: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

const Message = model("message", messageSchema);
export default Message;

