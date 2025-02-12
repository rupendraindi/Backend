import Feedback from "../Model/feedbackModel.js";
import Course from "../Model/courseModel.js"; // Import Course model to validate course
import { ApiError } from "../Utils/apiError.js";
import { ApiResponse } from "../Utils/apiResponse.js";
import asynchandler from "../Utils/asyncHandler.js";
import User from "../Model/userModel.js";
import mongoose from "mongoose";

const createFeedback = asynchandler(async (req, res) => {
  const { rating, comment, courses } = req.body;

  // Ensure the user is authenticated
  if (!req.user) {
    throw new ApiError(401, "User not authenticated");
  }

  // Validate course
  if (!courses) {
    throw new ApiError(400, "Course ID is required");
  }

  const courseExists = await Course.findById(courses);
  if (!courseExists) {
    throw new ApiError(400, "Invalid course ID");
  }

  // Check for existing feedback by the same user for the same course
  const existingFeedback = await Feedback.findOne({
    user: req.user._id,
    courses,
  });
  if (existingFeedback) {
    throw new ApiError(400, "Feedback already submitted for this course");
  }

  // Create a new feedback entry
  const newFeedback = new Feedback({
    user: req.user._id, // Assign user from `req.user`
    courses,
    rating,
    comment,
  });

  await newFeedback.save();
  res
    .status(201)
    .json(new ApiResponse(201, newFeedback, "Feedback submitted successfully"));
});



const getAllFeedback = asynchandler(async (req, res) => {
  const { courses } = req.query;

  const query = {};

  // Validate course if provided
  if (courses) {
    if (!mongoose.Types.ObjectId.isValid(courses)) {
      throw new ApiError(400, "Invalid course ID format");
    }

    const courseExists = await Course.findById(courses);
    if (!courseExists) {
      throw new ApiError(400, "Invalid course ID");
    }

    query.courses = courses;
  }

  // Fetch feedback with user and course details
  const feedbacks = await Feedback.find(query)
    .populate("user", "name email") // Populate user details (e.g., name and email)
    .populate("courses", "name"); // Populate course details (e.g., course name)

  res.status(200).json(
    new ApiResponse(200, feedbacks, "Feedbacks fetched successfully")
  );
});



// Delete Feedback (DELETE)
const deleteFeedback = asynchandler(async (req, res) => {
  const { id } = req.params;

  const feedback = await Feedback.findById(id);
  if (!feedback) {
    throw new ApiError(404, "Feedback not found");
  }

  // Check if the user owns the feedback before allowing delete
  if (feedback.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized action");
  }

  await feedback.remove();
  res
    .status(200)
    .json(new ApiResponse(200, null, "Feedback deleted successfully"));
});

export { createFeedback, getAllFeedback, deleteFeedback };
