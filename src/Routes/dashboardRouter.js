import express from "express";
import getDashboardData from "../Controller/dashboardController.js";
import {auth, authorizeRoles} from "../Middlewear/auth.js"
const router = express.Router();

router.get("/",auth, authorizeRoles("admin"), getDashboardData);

export default router;
