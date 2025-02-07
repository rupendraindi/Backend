import express from "express";
import {
  createFeedback,
  getAllFeedback,
  deleteFeedback,
} from "../Controller/feedbackController.js";
import { auth, authorizeRoles } from "../Middlewear/auth.js";

const router = express.Router();

router.post("/create", auth, createFeedback);

router.get("/getAll", auth, getAllFeedback);

// router.get("/user", auth, getUserFeedback);

router.delete("/delete/:id", auth, authorizeRoles("admin"), deleteFeedback);

export default router;
