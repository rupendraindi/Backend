import Blog from "../Model/blogModel.js";
import { ApiError } from "../Utils/apiError.js";
import { ApiResponse } from "../Utils/apiResponse.js";
import asynchandler from "../Utils/asyncHandler.js";
import uploadOnCloudinary from "../Utils/cloudinary.js";

// Create a new blog
export const createBlog = asynchandler(async (req, res, next) => {
  const { title, content } = req.body;
  const files = req.files || [];

  if (!title || !content) {
    return next(new ApiError(400, "Title and content are required"));
  }

  let imageUrls = [];
  if (files.length > 0) {
    for (const file of files) {
      const uploadResult = await uploadOnCloudinary(file.path, "blogs");
      imageUrls.push(uploadResult.secure_url);
    }
  }

  const blog = await Blog.create({ title, content, images: imageUrls });

  res.status(201).json(new ApiResponse(201, blog, "Blog created successfully"));
});

// Get all blogs
export const getAllBlogs = asynchandler(async (req, res) => {
  const blogs = await Blog.find().sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, blogs, "Blogs retrieved successfully"));
});

// Get a single blog by ID
export const getBlogById = asynchandler(async (req, res, next) => {
  const { id } = req.params;
  const blog = await Blog.findById(id);
  if (!blog) return next(new ApiError(404, "Blog not found"));

  res.status(200).json(new ApiResponse(200, blog, "Blog retrieved successfully"));
});

// Update a blog by ID
export const updateBlog = asynchandler(async (req, res, next) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const files = req.files || [];

  let blog = await Blog.findById(id);
  if (!blog) return next(new ApiError(404, "Blog not found"));

  let imageUrls = blog.images;
  if (files.length > 0) {
    imageUrls = [];
    for (const file of files) {
      const uploadResult = await uploadOnCloudinary(file.path, "blogs");
      imageUrls.push(uploadResult.secure_url);
    }
  }

  blog = await Blog.findByIdAndUpdate(
    id,
    { title, content, images: imageUrls },
    { new: true, runValidators: true }
  );

  res.status(200).json(new ApiResponse(200, blog, "Blog updated successfully"));
});

// Delete a blog by ID
export const deleteBlog = asynchandler(async (req, res, next) => {
  const { id } = req.params;
  const blog = await Blog.findByIdAndDelete(id);
  if (!blog) return next(new ApiError(404, "Blog not found"));

  res.status(200).json(new ApiResponse(200, null, "Blog deleted successfully"));
});
