// src/models/Like.js
import { Schema, model, Types } from "mongoose";

const likeSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "user", required: true },
    post: { type: Types.ObjectId, ref: "post", required: true },
  },
  { timestamps: true, versionKey: false }
);

// один пользователь может лайкнуть пост только один раз
likeSchema.index({ user: 1, post: 1 }, { unique: true });

const Like = model("like", likeSchema);
export default Like;
