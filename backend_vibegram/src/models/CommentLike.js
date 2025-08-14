import { Schema, model, Types } from "mongoose";

const commentLikeSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "user", index: true, required: true },
    comment: { type: Types.ObjectId, ref: "comment", index: true, required: true },
  },
  { timestamps: true, versionKey: false }
);

commentLikeSchema.index({ user: 1, comment: 1 }, { unique: true });

export default model("comment_like", commentLikeSchema);
