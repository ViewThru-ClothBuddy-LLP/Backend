/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import upload from "../utils/uploadImage";
import { ReviewController } from "../apis/review/controller/review.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { reviewValidator } from "../validators/validate.review";

const router = express.Router();

// Utility to handle async errors correctly
const asyncHandler = (fn: any) => (req: any, res: any, next: any) => Promise.resolve(fn(req, res, next)).catch(next);

router.post("/add", authMiddleware, reviewValidator, upload.single("image"), asyncHandler(ReviewController.addReview));
router.get("/:productId", asyncHandler(ReviewController.getProductReviews));

export default router;
