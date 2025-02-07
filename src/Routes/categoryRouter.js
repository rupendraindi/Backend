import express from 'express';
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategoryByName,
} from "../Controller/categoryController.js";
import { auth, authorizeRoles } from "../Middlewear/auth.js";

const router = express.Router();

router.post('/add', auth, authorizeRoles('admin'), createCategory);

router.get('/getAll', auth, authorizeRoles('admin'), getCategories);

router.get('/getById/:id', auth, authorizeRoles('admin'), getCategoryById);

router.put('/update/:id', auth, authorizeRoles('admin'), updateCategory);

router.delete('/delete/:id', auth, authorizeRoles('admin'), deleteCategory);

router.get('/name/:name', auth, authorizeRoles('admin'), getCategoryByName); 



export default router;
