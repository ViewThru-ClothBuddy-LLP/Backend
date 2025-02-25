import { Request, Response } from "express";
import { ReviewService } from "../services/review.service";
import { uploadImage } from "../../../utils/uploadImage";
import { AuthenticatedRequest } from "../../../types/auth";

export const ReviewController = {
  async addReview(req: AuthenticatedRequest, res: Response) {
    try {
      const { productId, rating, comment } = req.body;
      const userId = req.user?.id;
      let imageUrl: string | undefined = undefined;

      if (req.file) {
        imageUrl = await uploadImage(req.file);
      }

      const review = await ReviewService.createReview(userId, productId, rating, comment, imageUrl);
      return res.status(201).json({
        success: true,
        message: "Review add successfully",
        review,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Review is not add",
        error: error,
      });
    }
  },

  async getProductReviews(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const reviews = await ReviewService.getReviewsByProduct(productId);
      return res.json({
        success: true,
        message: "Review fetched successfully",
        reviews,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Review is not fetched",
        error: error,
      });
    }
  },
};
