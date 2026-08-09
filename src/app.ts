import express from "express"
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import authRouter from "./modules/auth/auth.route.js"
import profileRouter from "./modules/profile/profile.route.js"
import courseRouter from "./modules/courses/course/course.route.js"
import moduleRouter from "./modules/courses/module/module.route.js"
import lessonRouter from "./modules/courses/lesson/lesson.route.js"
import { videoWebhookRouter } from "./modules/courses/video/video.route.js"
import workshopRouter, { workshopWebhookRouter } from "./modules/workshops/workshop.route.js"
import enrollmentRouter, { enrollmentWebhookRouter } from "./modules/enrollments/enrollment.route.js"
import postRouter from "./modules/posts/post.route.js"
import instructorApplicationRouter from "./modules/instructorApplications/instructorApplication.route.js"
import waitlistRouter from "./modules/waitlist/waitlist.route.js"
const app = express();

// LiveKit's and Paystack's webhooks sign the raw body, so they must be
// mounted (with their own raw-text parsers) before the global JSON body parser below.
app.use("/api/v1/workshops", workshopWebhookRouter);
app.use("/api/v1/enrollments", enrollmentWebhookRouter);

app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:3001",
      "http://localhost:5173",
      "http://localhost:5174",
      "https://edlink-psi.vercel.app",
      "https://app.usedulink.com",
      "https://app.apidog.com/project/1285750"
    ],
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]
  }),
);






app.use("/api/v1/auth", authRouter);
app.use("/api/v1/profile", profileRouter)
app.use("/api/v1/courses", courseRouter)
app.use("/api/v1/modules", moduleRouter)
app.use("/api/v1/lessons", lessonRouter)
app.use("/api/v1/videos", videoWebhookRouter)
app.use("/api/v1/workshops", workshopRouter)
app.use("/api/v1/enrollments", enrollmentRouter)
app.use("/api/v1/posts", postRouter)
app.use("/api/v1/instructor-applications", instructorApplicationRouter)
app.use("/api/v1/waitlist", waitlistRouter)
app.use(errorHandler)

export default app;
