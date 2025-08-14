import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import HttpException from "../utils/HttpException.js";

export const addAdmin = async (payload) => {
  const hashPassword = await bcrypt.hash(payload.password, 10);
  return User.create({
    ...payload,
    password: hashPassword,
    role: "admin",
  });
};

export const changeAdminPassword = async (id, { oldPassword, newPassword }) => {
  const admin = await User.findById(id);
  if (!admin) return null;

  const passwordCompare = await bcrypt.compare(oldPassword, admin.password);
  if (!passwordCompare) throw HttpException(400, "Old password invalid");

  const hashPassword = await bcrypt.hash(newPassword, 10);
  admin.password = hashPassword;
  await admin.save();

  return admin;
};

export const getUserById = async (id) => {
  return User.findById(id).select("-password");
};
export const getUserByUsername = async (username) => {
  return User.findOne({ username }).select("-password");
};

export const updateUserProfile = async (id, updateData) => {
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }
  const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select("-password");
  if (!updatedUser) throw HttpException(404, "User not found");
  return updatedUser;
};

export const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw HttpException(404, "User not found");
  return user;
};

export const searchUsers = async (regex) => {
  return User.find({
    $or: [
      { username: regex },
      { fullName: regex },
    ],
  }).select("username fullName avatar");
};






