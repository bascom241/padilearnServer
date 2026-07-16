import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import { RegisterRequestSchema } from "./dtos/regiterRequest.dto.js";
import { handleRegister, verifyUserEmail, handleUserRefreshToken, login } from "./auth.controller.js";
import { VerifyEmailRequestSchema } from "./dtos/EmailVerificationRequest.js";
import { RefreshTokenSchema } from "./dtos/refreshTokenRequest.js";
import { LoginRegisterSchema } from "./dtos/loginRequest.dto.js";
import { loginUser } from "./auth.service.js";

const router = Router();

// The validation middleware acts as a gatekeeper right here
router.post("/register", validate(RegisterRequestSchema), handleRegister);
router.post("/verify", validate(VerifyEmailRequestSchema), verifyUserEmail);
router.post("/refresh",validate(RefreshTokenSchema),  handleUserRefreshToken)
router.post("/login", validate(LoginRegisterSchema), login)
export default router;