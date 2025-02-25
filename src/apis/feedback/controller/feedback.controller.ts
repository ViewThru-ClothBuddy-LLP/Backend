import { Request, Response } from "express";
import { FeedbackService } from "../service/feedback.service";
import { uploadImage } from "../../../utils/uploadImage";
import { AuthenticatedRequest } from "../../../types/auth";

export const FeedbackController = {
  async submitFeedback(req: AuthenticatedRequest, res: Response) {
    try {
      const { message } = req.body;
      const userId = req.user.id;
      let imageUrl: string | undefined = undefined;

      if (req.file) {
        imageUrl = await uploadImage(req.file);
      }

      const feedback = await FeedbackService.createFeedback(userId, message, imageUrl);
      return res.status(201).json({
        success: true,
        message: "feedback is submit successfully",
        feedback,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "feedback is not submit successsfully",
        error,
      });
    }
  },

  async getAllFeedbacks(req: Request, res: Response) {
    try {
      const feedbacks = await FeedbackService.getAllFeedbacks();
      return res.json({
        success: true,
        message: "feedbacks are fetched successfully",
        feedbacks,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "feedbacks are not fetched",
        error,
      });
    }
  },
};
