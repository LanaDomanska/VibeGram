import { Schema, model, Types } from "mongoose";

const postSchema = new Schema({
  caption: String,
  imageUrl: {
    type: String,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },},
 {timestamps: true, versionKey: false });

const Post = model("post", postSchema);
export default Post;
