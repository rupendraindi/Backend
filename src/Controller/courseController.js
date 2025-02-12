import Course from "../Model/courseModel.js";
import { ApiError } from "../Utils/apiError.js";
import { ApiResponse } from "../Utils/apiResponse.js";
import uploadOnCloudinary from "../Utils/cloudinary.js";
import asynchandler from "../Utils/asyncHandler.js";
import Category from "../Model/categoryModel.js";
import multer from "multer";

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB file size limit
}).fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'videos', maxCount: 10 },
  { name: 'thumbnail', maxCount: 1 },
]);

// ============== Create a new course ===============
const createCourse = asynchandler(async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return next(new ApiError(400, err.message));
    }

    try {
      const { name, price, description, duration, language, category, demoVideo } = req.body;
      const { pdf, videos, thumbnail } = req.files || {};

      // Ensure that the category exists
      const categoryDoc = await Category.findOne({ name: category });
      if (!categoryDoc) {
        return next(new ApiError(404, "Category not found"));
      }

      // Upload thumbnail (if it exists)
      const thumbnailUrl = thumbnail
        ? (await uploadOnCloudinary(thumbnail[0].buffer, "courses/thumbnails")).secure_url
        : undefined;

      // Handle multiple video uploads
      let videoDetails = [];
      if (videos && videos.length > 0) {
        for (let video of videos) {
          const videoUrl = await uploadOnCloudinary(video.buffer, "courses/videos");
          videoDetails.push({
            url: videoUrl.secure_url,
            title: video.originalname, // Assuming title is the original file name
            thumbnail: video.thumbnail ? (await uploadOnCloudinary(video.thumbnail.buffer, "courses/thumbnails")).secure_url : undefined,
            pdf: video.pdf ? (await uploadOnCloudinary(video.pdf.buffer, "courses/pdfs")).secure_url : undefined,
          });
        }
      }

      // Handle PDF upload (if it exists)
      let pdfUrl;
      if (pdf && pdf.length > 0) {
        const result = await uploadOnCloudinary(pdf[0].buffer, "courses/pdfs");
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
        videos: videoDetails,
        demoVideo,
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
  upload(req, res, async (err) => {
    if (err) {
      return next(new ApiError(400, err.message));
    }

    const { name, price, description, duration, language, category, demoVideo } = req.body;
    const { pdf, videos, thumbnail } = req.files || {};

    try {
      // Upload files if provided
      const thumbnailUrl = thumbnail
        ? (await uploadOnCloudinary(thumbnail[0]?.buffer, "courses/thumbnails"))
            ?.secure_url
        : undefined;

      const pdfUrl = pdf
        ? (await uploadOnCloudinary(pdf[0]?.buffer, "courses/pdfs"))?.secure_url
        : undefined;

      const videoDetails = [];
      if (videos) {
        for (const video of videos) {
          const videoUrl = await uploadOnCloudinary(video.buffer, "courses/videos");
          videoDetails.push({
            url: videoUrl.secure_url,
            title: video.originalname, // Assuming title is the original file name
            thumbnail: video.thumbnail ? (await uploadOnCloudinary(video.thumbnail.buffer, "courses/thumbnails")).secure_url : undefined,
            pdf: video.pdf ? (await uploadOnCloudinary(video.pdf.buffer, "courses/pdfs")).secure_url : undefined,
          });
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
          demoVideo,
          ...(thumbnailUrl && { thumbnail: thumbnailUrl }),
          ...(pdfUrl && { pdf: pdfUrl }),
          ...(videoDetails.length > 0 && { videos: videoDetails }),
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