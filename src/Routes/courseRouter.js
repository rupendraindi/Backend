import express from "express";
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from "../Controller/courseController.js";
import { authorizeRoles, auth } from "../Middlewear/auth.js";
import upload from "../Middlewear/multer.js";

const router = express.Router();

router.post(
  "/create",
  upload.fields([
    { name: "pdf", maxCount: 5 },
    { name: "videos", maxCount: 5 },
    { name: "thumbnail", maxCount: 5 },
  ]),
  createCourse
);


router.get("/getAll", getCourses);
router.get("/getById/:id", getCourseById);
router.put(
  "/update/:id",
  auth,
  authorizeRoles("admin"),
  upload.fields([{ name: "pdf" }, { name: "videos" }, { name: "thumbnail" }]),
  updateCourse
);
router.delete("/delete/:id", auth, authorizeRoles("admin"), deleteCourse);

export default router;
