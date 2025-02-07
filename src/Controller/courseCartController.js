import Cart from "../Model/courseCartModel.js";
import Course from "../Model/courseModel.js";
import { ApiError } from "../Utils/apiError.js";
import { ApiResponse } from "../Utils/apiResponse.js";
import asynchandler from "../utils/asynchandler.js";

// Add a course to the cart
export const addToCart = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    if (!courseId || !Array.isArray(courseId)) {
      return res
        .status(400)
        .json({ message: "courseId must be an array of course IDs." });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        courses: courseId,
      });
    } else {
      cart.courses = [...new Set([...cart.courses, ...courseId])];
    }

    await cart.save();

    res
      .status(200)
      .json({ message: "Courses added to cart successfully", cart });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

// Get user's cart
export const getCart = asynchandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate(
    "courses.course",
    "name price"
  );

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  res.status(200).json(new ApiResponse(200, cart, "Cart fetched successfully"));
});

export const removeFromCart = asynchandler(async (req, res) => {
  const { courseId } = req.body;

  if (!courseId) {
    throw new ApiError(400, "Course ID is required");
  }

  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  cart.courses = cart.courses.filter((c) => {
    if (!c) return true;
    return c.toString() !== courseId;
  });

  await cart.save();

  res
    .status(200)
    .json(new ApiResponse(200, cart, "Course removed from cart successfully"));
});
