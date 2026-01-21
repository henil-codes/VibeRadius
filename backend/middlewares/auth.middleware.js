import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { APIError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const isLoggedIn = asyncHandler(async (req, res, next) => {
  // 1. Check if cookies are actually reaching the server
  const token = req.cookies?.accessToken;

  if (!token) {
    console.log("[Auth Middleware] No accessToken found in cookies");
    throw new APIError(401, "Access token missing. Please log in.");
  }

  try {
    // 2. Attempt to decode
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Find user and attach to request
    const user = await User.findById(decoded._id).select("-password -refreshToken");
    
    if (!user) {
      throw new APIError(401, "User not found. Invalid session.");
    }

    req.user = user;
    next();
  } catch (error) {
    // 4. Specific Error Logging
    console.error(`[Auth Middleware] JWT Error: ${error.message}`);
    
    if (error.name === "TokenExpiredError") {
      throw new APIError(401, "Token expired. Please refresh.");
    }
    
    throw new APIError(401, "Token invalid. Please log in again.");
  }
});

export { isLoggedIn };