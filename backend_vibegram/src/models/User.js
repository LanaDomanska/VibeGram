import { Schema, model } from "mongoose";
import { emailValidation } from "../constants/users.constants.js";

const userSchema = new Schema({
  fullName: {
    type: String,
    trim: true,
  },
  username: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    match: emailValidation.value,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: "/assets/images/default-avatar.png", 
  },
  bio: {
    type: String,
    default: "",
    maxlength: 160,
  },
  website: {
    type: String,
    default: "",
  },

  role: {
    type: String,
    enum: ["superadmin", "admin", "manager", "user"],
    default: "user",
    required: true,
  },
  token: {
    type: String,
  }
}, {
  versionKey: false,
  timestamps: true,
});

const User = model("user", userSchema);

export default User;
