import Course from "../Model/courseModel.js";
import Category from "../Model/categoryModel.js";
import { ApiError } from "../Utils/apiError.js";
import { ApiResponse } from "../Utils/apiResponse.js";
import uploadOnCloudinary from "../Utils/cloudinary.js";
import asynchandler from "../Utils/asyncHandler.js";
import multer from "multer";

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB file size limit
}).fields([
  { name: "pdf", maxCount: 1 },
  { name: "videos", maxCount: 10 },
  { name: "thumbnail", maxCount: 1 },
]);

// ============== Create a new course ===============
const createCourse = asynchandler(async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return next(new ApiError(400, err.message));
    }

    try {
      const { title, dec, duration, price, lang, category, introVideo, chapters } = req.body;
      const { thumbnail, pdf, videos } = req.files || {};

      // Convert `chapters` from JSON string to an array
      let chaptersArray = [];
      if (typeof chapters === "string") {
        chaptersArray = JSON.parse(chapters);
      } else if (Array.isArray(chapters)) {
        chaptersArray = chapters;
      }

      // Validate chapters array
      if (!Array.isArray(chaptersArray) || chaptersArray.length === 0) {
        return next(new ApiError(400, "Chapters array is required and must contain at least one chapter"));
      }

      // Validate chapters structure
      for (let chapter of chaptersArray) {
        if (!chapter.title) {
          return next(new ApiError(400, "Each chapter must have a title"));
        }
      }

      // Find category
      const categoryDoc = await Category.findOne({ name: category });
      if (!categoryDoc) {
        return next(new ApiError(404, "Category not found"));
      }

      // Construct Course Object
      const course = new Course({
        title,
        dec,
        duration,
        price,
        lang,
        category: categoryDoc._id,
        introVideo,
        chapters: chaptersArray
      });

      await course.save();
      res.status(201).json(new ApiResponse(201, course, "Course created successfully"));
    } catch (error) {
      return next(new ApiError(500, `Failed to create course: ${error.message}`));
    }
  });
});


// ================ Get all courses ==================
const getCourses = asynchandler(async (req, res, next) => {
  const courses = await Course.find().populate("category");
  res.status(200).json(new ApiResponse(200, courses, "Courses retrieved successfully"));
});

// ================ Get course by ID =================
const getCourseById = asynchandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate("category");
  if (!course) {
    return next(new ApiError(404, "Course not found"));
  }
  res.status(200).json(new ApiResponse(200, course, "Course retrieved successfully"));
});

// ============== Update course details ==================
const updateCourse = asynchandler(async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return next(new ApiError(400, err.message));
    }

    const { title, dec, duration, price, lang, category } = req.body;
    const { thumbnail, pdf, videos } = req.files || {};

    try {
      const updatedCourse = await Course.findById(req.params.id);
      if (!updatedCourse) {
        return next(new ApiError(404, "Course not found"));
      }

      // Upload new thumbnail if provided
      const thumbnailUrl = thumbnail
        ? (await uploadOnCloudinary(thumbnail[0]?.buffer, "courses/thumbnails")).secure_url
        : updatedCourse.introVideo.thub;

      // Upload new PDF if provided
      const pdfUrl = pdf
        ? (await uploadOnCloudinary(pdf[0]?.buffer, "courses/pdfs")).secure_url
        : updatedCourse.introVideo.video;

      let videoDetails = updatedCourse.chapters[0]?.videos || [];
      if (videos) {
        for (const video of videos) {
          const videoUrl = await uploadOnCloudinary(video.buffer, "courses/videos");
          videoDetails.push({
            video: videoUrl.secure_url,
            title: video.originalname,
          });
        }
      }

      updatedCourse.set({
        title,
        dec,
        duration,
        price,
        lang,
        category,
        introVideo: {
          thub: thumbnailUrl,
          video: pdfUrl,
        },
        chapters: [{ videos: videoDetails }],
      });

      await updatedCourse.save();
      res.status(200).json(new ApiResponse(200, updatedCourse, "Course updated successfully"));
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
  res.status(200).json(new ApiResponse(200, null, "Course deleted successfully"));
});

export { createCourse, getCourses, getCourseById, updateCourse, deleteCourse };
