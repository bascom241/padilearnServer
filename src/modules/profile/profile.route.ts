import express from "express"
import { getUserProfile } from "./profile.controller.js";
import { validateToken } from "../../middlewares/authenticate.middleware.js";
const router = express.Router();


router.get("/", validateToken, getUserProfile);


export default router;