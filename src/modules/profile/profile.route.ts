import express from "express"
import { getUserProfile, handleUpdateProfile, handleUploadAvatar } from "./profile.controller.js";
import { validateToken } from "../../middlewares/authenticate.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { uploadImage } from "../../middlewares/upload.middleware.js";
import { UpdateProfileSchema } from "./dtos/updateProfileRequest.dto.js";
const router = express.Router();


router.get("/", validateToken, getUserProfile);
router.patch("/", validateToken, validate(UpdateProfileSchema), handleUpdateProfile);
router.post("/avatar", validateToken, uploadImage.single("avatar"), handleUploadAvatar);


export default router;
