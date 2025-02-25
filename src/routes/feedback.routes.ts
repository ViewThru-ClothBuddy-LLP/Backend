/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import upload from "../utils/uploadImage";
import { FeedbackController } from "../apis/feedback/controller/feedback.controller";
import { feedbackValidator } from "../validators/validate.feedback";

const router = express.Router();

const asyncHandler = (fn: any) => (req: any, res: any, next: any) => Promise.resolve(fn(req, res, next)).catch(next);

router.post(
  "/submit-feedback",
  authMiddleware,
  feedbackValidator,
  upload.single("image"),
  asyncHandler(FeedbackController.submitFeedback)
);

router.get("/", asyncHandler(FeedbackController.getAllFeedbacks));

export default router;
