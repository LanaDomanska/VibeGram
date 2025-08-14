import { Schema, model, Types } from "mongoose";

const followSchema = new Schema({
  follower: { type: Types.ObjectId, ref: "user", required: true },
  following: { type: Types.ObjectId, ref: "user", required: true },
}, { timestamps: true, versionKey: false });

const Follow = model("follow", followSchema);
export default Follow;
