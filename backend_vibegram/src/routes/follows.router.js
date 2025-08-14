

import  express from "express";
import {
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing
} from "../controllers/follows.controller.js";
import { authenticate } from "../middlewares/authorization.js";


const followsRouter = express.Router();

followsRouter.post("/:id/follow", authenticate, followUser);
followsRouter.delete("/:id/unfollow", authenticate, unfollowUser);
followsRouter.get("/:id/followers", getUserFollowers);
followsRouter.get("/:id/following", getUserFollowing);

export default followsRouter;
