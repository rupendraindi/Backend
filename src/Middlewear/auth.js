import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { ApiError } from "../Utils/apiError.js";
import { ApiResponse } from "../Utils/apiResponse.js";
import asynchandler from "../Utils/asyncHandler.js";

dotenv.config();

// Middleware to authenticate user
export const auth = asynchandler(async (req, res, next) => {
  const token =
    req.cookies?.token ||
    req.body?.token ||
    req.header("Authorization")?.replace("Bearer ", "").trim();

  if (!token) {
    throw new ApiError(401, "Token is missing");
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user data to the request
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    throw new ApiError(401, "Invalid token");
  }
});


export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, "You do not have permission to access this resource");
    }
    next();
  };
};


