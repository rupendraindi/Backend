import Category from '../Model/categoryModel.js';
import { ApiError } from '../Utils/apiError.js';
import { ApiResponse } from '../Utils/apiResponse.js';
import asynchandler from '../utils/asynchandler.js';

// Create a category
export const createCategory = asynchandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    throw new ApiError(400, 'Category name is required');
  }
  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    throw new ApiError(400, 'Category with this name already exists');
  }

  const newCategory = new Category({
    name,
    description,
  });

  const savedCategory = await newCategory.save();

  res.status(201).json(
    new ApiResponse(201, savedCategory, 'Category created successfully')
  );
});

// Get all categories
export const getCategories = asynchandler(async (req, res) => {
  const categories = await Category.find();

  res.status(200).json(
    new ApiResponse(200, categories, 'Categories retrieved successfully')
  );
});

// Get a single category by ID
export const getCategoryById = asynchandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);

  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  res.status(200).json(
    new ApiResponse(200, category, 'Category retrieved successfully')
  );
});

// Update a category
export const updateCategory = asynchandler(async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const category = await Category.findById(id);

  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  category.name = name || category.name;
  category.description = description || category.description;

  const updatedCategory = await category.save();

  res.status(200).json(
    new ApiResponse(200, updatedCategory, 'Category updated successfully')
  );
});


// Delete a category
export const deleteCategory = asynchandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);

  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  await category.deleteOne();

  res.status(200).json(
    new ApiResponse(200, null, 'Category deleted successfully')
  );
});

// Get a single category by name
export const getCategoryByName = asynchandler(async (req, res) => {
  const { name } = req.params;

  const category = await Category.findOne({ name });

  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  res.status(200).json(
    new ApiResponse(200, category, 'Category retrieved successfully')
  );
});

