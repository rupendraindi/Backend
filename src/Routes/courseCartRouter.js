import express from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../Controller/categoryController.js";
import { auth, authorizeRoles } from "../Middlewear/auth.js";

const router = express.Router();

router.post("/add", auth, authorizeRoles("admin"), createCategory);

router.get("/categories", auth, authorizeRoles("admin"), getCategories);

router.get("/categories/:id", auth, authorizeRoles("admin"), getCategoryById);

router.put("/update/:id", auth, authorizeRoles("admin"), updateCategory);

router.delete("/categories/:id", auth, authorizeRoles("admin"), deleteCategory);

export default router;
