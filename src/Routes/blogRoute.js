import express from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} from "../Controller/blogController.js";
import multer from "multer";

const router = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({});
const upload = multer({ storage });

// Blog Routes
router.post("/blogs", upload.array("images", 5), createBlog);
router.get("/blogs", getAllBlogs);
router.get("/blogs/:id", getBlogById);
router.put("/blogs/:id", upload.array("images", 5), updateBlog);
router.delete("/blogs/:id", deleteBlog);

export default router;
