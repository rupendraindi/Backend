import Course from "../Model/courseModel.js";
import { ApiError } from "../Utils/apiError.js";
import { ApiResponse } from "../Utils/apiResponse.js";
import uploadOnCloudinary from "../Utils/cloudinary.js";
import asynchandler from "../utils/asynchandler.js";
import Category from "../Model/categoryModel.js";

// ============== Create a new course ===============
const createCourse = asynchandler(async (req, res, next) => {
  try {
    const { name, price, description, duration, language, category } = req.body;
    const { pdf, videos, thumbnail } = req.files || {};

    // Ensure that the category exists
    const categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) {
      return next(new ApiError(404, "Category not found"));
    }

    // Upload thumbnail (if it exists)
    const thumbnailUrl = thumbnail
      ? (await uploadOnCloudinary(thumbnail[0].path, "courses/thumbnails")).secure_url
      : undefined;

    // Handle multiple video uploads
    let videoUrls = [];
    if (videos && videos.length > 0) {
      for (let video of videos) {
        const result = await uploadOnCloudinary(video.path, "courses/videos");
        videoUrls.push(result.secure_url);
      }
    }

    // Handle PDF upload (if it exists)
    let pdfUrl;
    if (pdf && pdf.length > 0) {
      const result = await uploadOnCloudinary(pdf[0].path, "courses/pdfs");
      pdfUrl = result.secure_url;
    }

    // **Convert description array to string if necessary**
    const courseDescription = Array.isArray(description) ? description.join(", ") : description;

    // Create the course document
    const course = new Course({
      name,
      price: {
        actualPrice: price.actualPrice,
        discountPrice: price.discountPrice || undefined,
      },
      description: courseDescription, // Ensuring description is a string
      duration,
      language,
      category: categoryDoc._id,
      pdf: pdfUrl,
      videos: videoUrls,
      thumbnail: thumbnailUrl,
    });

    // Save the course to the database
    await course.save();
    res.status(201).json(new ApiResponse(201, course, "Course created successfully"));

  } catch (error) {
    console.error("Error creating course:", error);
    return next(new ApiError(500, "Failed to create course"));
  }
});


// ================ Get all courses ==================
const getCourses = asynchandler(async (req, res, next) => {
  const courses = await Course.find().populate("category"); 
  res
    .status(200)
    .json(new ApiResponse(200, courses, "Courses retrieved successfully"));
});

// ================ Get course by ID =================
const getCourseById = asynchandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate("category"); // Populate category if needed
  if (!course) {
    return next(new ApiError(404, "Course not found"));
  }
  res
    .status(200)
    .json(new ApiResponse(200, course, "Course retrieved successfully"));
});

// ============== Update course details ==================
const updateCourse = asynchandler(async (req, res, next) => {
  const { name, price, description, duration, language, category } = req.body;
  const { pdf, videos, thumbnail } = req.files || {};

  try {
    // Upload files if provided
    const thumbnailUrl = thumbnail
      ? (await uploadOnCloudinary(thumbnail[0]?.path, "courses/thumbnails"))
          ?.secure_url
      : undefined;

    const pdfUrl = pdf
      ? (await uploadOnCloudinary(pdf[0]?.path, "courses/pdfs"))?.secure_url
      : undefined;

    const videoUrls = [];
    if (videos) {
      for (const video of videos) {
        const uploadResult = await uploadOnCloudinary(
          video.path,
          "courses/videos"
        );
        if (uploadResult?.secure_url) {
          videoUrls.push(uploadResult.secure_url);
        }
      }
    }

    // Update the course
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      {
        name,
        price,
        description,
        duration,
        language,
        category,
        ...(thumbnailUrl && { thumbnail: thumbnailUrl }),
        ...(pdfUrl && { pdf: pdfUrl }),
        ...(videoUrls.length > 0 && { videos: videoUrls }),
      },
      { new: true }
    );

    if (!updatedCourse) {
      return next(new ApiError(404, "Course not found"));
    }

    res
      .status(200)
      .json(new ApiResponse(200, updatedCourse, "Course updated successfully"));
  } catch (error) {
    next(new ApiError(500, "Error updating course: " + error.message));
  }
});

// =============== Delete course =================
const deleteCourse = asynchandler(async (req, res, next) => {
  const course = await Course.findByIdAndDelete(req.params.id);

  if (!course) {
    return next(new ApiError(404, "Course not found"));
  }

  res
    .status(200)
    .json(new ApiResponse(200, null, "Course deleted successfully"));
});

export { createCourse, getCourses, getCourseById, updateCourse, deleteCourse };