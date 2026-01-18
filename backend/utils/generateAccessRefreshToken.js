import User from "../models/user.model.js";
import { APIError } from "./ApiError.js"
import logger from "./logger.js";

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
      email: user.email,
      username: user.username,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

const generateAccessRefreshToken = async (userId) => {
  try {
    logger.info("Generating access and refresh tokens", {
      userId,
    });
    const user = await User.findById(userId);

    logger.info("User found for token generation", {
      userId: user._id,
    });
    const accessTokens = await generateAccessToken(user);

    logger.info("Generated access token", {
      userId: user._id,
    });
    const refreshTokens = await generateRefreshToken(user);

    logger.info("Generated access and refresh tokens", {
      userId: user._id,
      accessTokens,
      refreshTokens,
    });

    user.refreshToken = refreshTokens;
    await user.save({ validateBeforeSave: false });

    logger.info("Saved refresh token to user record", {
      userId: user._id,
    });

    return { accessTokens, refreshTokens };

  } catch (error) {
    throw new APIError(500, "Token generation failed!");
  }
}

export {
  generateAccessToken,
  generateRefreshToken,
  generateAccessRefreshToken
}