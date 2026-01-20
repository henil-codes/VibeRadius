import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import { APIError } from "../utils/ApiError.js";
import { APIResponse } from "../utils/ApiResponse.js";
import { createUniqueUsername } from "../utils/createUniqueUsername.js";
import { generateAccessRefreshToken } from "../utils/generateAccessRefreshToken.js";
import logger from "../utils/logger.js";

// --- REGISTER USER ---
const registerUser = asyncHandler(async (req, res) => {
  // get user email, and password from Form
  const { email, name, password } = req.body;

  // check input types
  if (
    typeof email !== "string" ||
    typeof name !== "string" ||
    typeof password !== "string"
  ) {
    throw new APIError(400, "Invalid input types!");
  }

  // validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new APIError(400, "Invalid email format!");
  }

  // validate password length
  const passwordMinLength = 6;
  const passwordMaxLength = 24;
  if (
    password.length < passwordMinLength ||
    password.length > passwordMaxLength
  ) {
    throw new APIError(
      400,
      `Password must be between ${passwordMinLength} and ${passwordMaxLength} characters long!`
    );
  }

  // check email and password field is not empty
  if (!email || !name || !password)
    throw new APIError(400, "Fill out all the fields to get registered!");

  // check whether user already exist in the database
  const existingUser = await User.findOne({ email: email });

  // throw an error if user exist
  if (existingUser) throw new APIError(400, "User already exist!");

  // genrate a random username
  const username = await createUniqueUsername();

  logger.info("Register user request received", {
    email,
    username,
    name,
  });

  // create a new user
  const user = await User.create({
    email: email,
    username: username,
    name: name,
    password: password,
  });

  logger.info("User created successfully", {
    userId: user._id,
    email: user.email,
    username: user.username,
    name: user.name,
  });

  // generate tokens
  const { accessTokens, refreshTokens } = await generateAccessRefreshToken(
    user._id
  );

  logger.info("Tokens generated for user", {
    userId: user._id,
    accessTokens,
    refreshTokens,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // send response
  const accessOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  const refreshOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/api/auth/refresh-token",
  };

  res
    .status(201)
    .cookie("accessToken", accessTokens, accessOptions)
    .cookie("refreshToken", refreshTokens, refreshOptions)
    .json(
      new APIResponse(
        200,
        {
          user: createdUser,
          accessTokens,
          refreshTokens,
        },
        "User registered successfully!"
      )
    );
});

// --- LOGIN USER ---
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // check email and password field is not empty
  if (!email || !password)
    throw new APIError(400, "Fill out all the fields to login!");

  // find user by email
  const user = await User.findOne({ email: email });

  // if user not found
  if (!user) throw new APIError(404, "User not found!");

  // compare password
  const isMatch = await user.comparePassword(password);

  // if password does not match
  if (!isMatch) throw new APIError(401, "Invalid credentials!");

  // generate tokens
  const { accessTokens, refreshTokens } = await generateAccessRefreshToken(
    user._id
  );

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // send response
 const accessOptions = {
  httpOnly: true, // prevents JS access
  secure: process.env.NODE_ENV === "production", // only secure on production
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // cross-site for production
};

const refreshOptions = {
  httpOnly: true, // prevents JS access
  secure: process.env.NODE_ENV === "production", // only secure on production
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // cross-site for production
  path: "/api/auth/refresh-token",
};


  res
    .status(200)
    .cookie("accessToken", accessTokens, accessOptions)
    .cookie("refreshToken", refreshTokens, refreshOptions)
    .json(
      new APIResponse(
        200,
        {
          user: createdUser,
          accessTokens,
          refreshTokens,
        },
        "User logged in successfully!"
      )
    );
});

// --- LOGOUT USER ---
const logoutUser = asyncHandler(async (req, res) => {
  res
    .status(200)
    .clearCookie("accessToken", accessOptions)
    .clearCookie("refreshToken", refreshOptions)
    .json(new APIResponse(200, null, "User logged out successfully!"));
});

// --- GET USER BY ID ---
const getUserById = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  const user = await User.findById(userId).select("-password -refreshToken");

  if (!user) {
    throw new APIError(404, "User not found");
  }

  return res
    .status(200)
    .json(new APIResponse(200, { user }, "User fetched successfully"));
});

// --- GET USER BY EMAIL ---
const getUserByEmail = asyncHandler(async (req, res) => {
  const email = req.params.email;

  const user = await User.findOne({ email: email }).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new APIError(404, "User not found");
  }

  return res
    .status(200)
    .json(new APIResponse(200, { user }, "User fetched successfully"));
});

// --- DELETE USER BY ID ---
const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  const user = await User.findById(userId);

  if (!user) {
    throw new APIError(404, "User not found");
  }

  await user.deleteOne();

  return res
    .status(200)
    .json(new APIResponse(200, null, "User deleted successfully"));
});

// --- GET CURRENT USER ---
const getCurrentUser = asyncHandler(async (req, res) => {
  const accessTokens = req.cookies?.accessToken;

  if (!accessTokens) {
    throw new APIError(401, "Access Token missing.");
  }
  
  let decoded;
  try {
    decoded = jwt.verify(accessTokens, process.env.JWT_SECRET);
  } catch (error) {
    throw new APIError(401, "Invalid or expired access token.");
  }
  
  const user = await User.findById(decoded._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .json(new APIResponse(200, { user, accessTokens }, "User fetched successfully"));
});

// --- REFRESH ACCESS TOKEN ---
const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res
      .status(401)
      .json(new APIResponse(401, null, "Refresh token is required"));
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decoded._id);
    if (!user || user.refreshToken !== refreshToken) {
      return res
        .status(401)
        .json(new APIResponse(401, null, "Invalid refresh token"));
    }

    const newAccessToken = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    return res
      .status(200)
      .json(
        new APIResponse(200, { accessToken: newAccessToken }, "Token refreshed")
      );
  } catch (error) {
    return res
      .status(403)
      .json(new APIResponse(403, null, "Invalid or expired refresh token"));
  }
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getUserById,
  getUserByEmail,
  deleteUser,
  getCurrentUser,
  refreshAccessToken
}
