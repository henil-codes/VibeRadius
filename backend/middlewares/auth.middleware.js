import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { APIError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateAccessRefreshToken, generateAccessToken } from "../utils/generateAccessRefreshToken.js";
import logger from "../utils/logger.js";

const isLoggedIn = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken;

  logger.info("isLoggedIn Middleware Invoked", { tokenPresent: !!token });

  if (!token) {
    throw new APIError(401, "Unauthorized. Please login.");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new APIError(401, "Invalid or expired access token.");
  }

  logger.info("Access Token verified, fetching user data");

  const user = await User.findById(decoded._id).select(
    "-password -refreshToken"
  );

  logger.info("User data fetched", { userId: user?._id });

  if (!user) {
    throw new APIError(401, "User not found.");
  }

  logger.info("User authenticated successfully", { userId: user._id });

  req.user = user;
  next();
});

export { isLoggedIn };
