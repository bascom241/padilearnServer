import express from "express"
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import authRouter from "./modules/auth/auth.route.js"
import profileRouter from "./modules/profile/profile.route.js"
const app = express();
app.use(express.json());
 
app.use(
  cors({
    origin: [
      "http://localhost:3001",
      "http://localhost:5173",
      "http://localhost:5174",
      "https://edlink-psi.vercel.app",
      "https://app.usedulink.com"
    ],
  }),
);



app.use("/api/v1/auth", authRouter);
app.use("/api/v1/profile", profileRouter)
app.use(errorHandler)

export default app;