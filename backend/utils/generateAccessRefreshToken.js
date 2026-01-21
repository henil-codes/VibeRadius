import User from "../models/user.model.js";
import { APIError } from "./ApiError.js";
import jwt from "jsonwebtoken";

// Removed 'await' here as jwt.sign is synchronous by default
const generateAccessToken = function (user) {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      username: user.username,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

const generateRefreshToken = function (user) {
  return jwt.sign(
    {
      _id: user._id,
    },
    process.env.JWT_SECRET, // Ideally use a different secret for Refresh Tokens
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

const generateAccessRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new APIError(404, "User not found");

    // FIX: Changed variable names to singular (no 's') to match your controller
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // FIX: Returning singular names
    return { accessToken, refreshToken };

  } catch (error) {
    throw new APIError(500, "Token generation failed!");
  }
}

export {
  generateAccessToken,
  generateRefreshToken,
  generateAccessRefreshToken
}