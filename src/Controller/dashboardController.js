import { ApiError } from "../Utils/apiError.js";
import { ApiResponse } from "../Utils/apiResponse.js";
import asynchandler from "../Utils/asyncHandler.js";
import Course from "../Model/courseCartModel.js";
import User from "../Model/userModel.js"; 

// Controller to fetch dashboard data
const getDashboardData = asynchandler(async (req, res) => {
  try {
    const courseCount = await Course.countDocuments(); 
    const enrolledCount = await User.countDocuments();
    const profileCount = await User.countDocuments(); 

    const availableCourses = await Course.find({})
      .select("title category description language originalPrice discountPrice thumbnail")
      .sort({ createdAt: -1 }); 

    // Structure the response
    const dashboardData = {
      stats: {
        courses: courseCount,
        enrolled: enrolledCount,
        profiles: profileCount,
      },
      courses: availableCourses, 
    };

    res.status(200).json(
      new ApiResponse(200, dashboardData, "Dashboard data fetched successfully")
    );
  } catch (error) {
    throw new ApiError(500, "Failed to fetch dashboard data");
  }
});

export default getDashboardData;
